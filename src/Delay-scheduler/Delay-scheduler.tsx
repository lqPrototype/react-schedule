import { peek, pop, push } from "../common/MinHeap";
import {
    IdlePriority,
    ImmediatePriority,
    LowPriority,
    NormalPriority,
    UserBlockingPriority,
} from "../common/Priorities";
let taskTimeoutId;
let deadline = 0;
let yieldInterval = 5;

//每个优先级对应的任务对应一个过期时间
const maxSigned31BitInt = 1073741823;
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
const NORMAL_PRIORITY_TIMEOUT = 5000;
const LOW_PRIORITY_TIMEOUT = 10000;
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

let taskIdCounter = 0;

let scheduledHostCallback: any = null;
const messageChannel = new MessageChannel();
messageChannel.port1.onmessage = performWorkUntilDeadline;

export const getCurrentTime = () => performance.now();
// 就绪
let taskQueue: any = [];
// 未绪
let timerQueue: any = [];
let currentTask: any;

/**
 * 执行任务到截止时间
 */
function performWorkUntilDeadline() {
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval;
    const hasMoreWork = scheduledHostCallback(currentTime);
    if (hasMoreWork) {
        messageChannel.port2.postMessage(null);
    }
}

export function scheduleCallback(
    priorityLevel: number,
    callback: any,
    options: any = {}
) {
    //获取当前的时间
    let currentTime = getCurrentTime();
    //此任务的开始时间
    let startTime = currentTime;
    if (typeof options === "object" && options !== null) {
        let delay = options.delay;
        //如果delay是一个数字，那么开始时间等于当前时间加上延迟的时间
        if (typeof delay === "number" && delay > 0) {
            startTime = currentTime + delay;
        } else {
            //开始时间等于当前时间，也就是立刻开始
            startTime = currentTime;
        }
    }
    //计算超时时间
    let timeout: any;
    switch (priorityLevel) {
        case ImmediatePriority:
            timeout = IMMEDIATE_PRIORITY_TIMEOUT;
            break;
        case UserBlockingPriority:
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
            break;
        case NormalPriority:
            timeout = NORMAL_PRIORITY_TIMEOUT;
            break;
        case LowPriority:
            timeout = LOW_PRIORITY_TIMEOUT;
            break;
        case IdlePriority:
            timeout = IDLE_PRIORITY_TIMEOUT;
            break;
    }
    //计算一个过期时间 当前时间加上超时时间
    let expirationTime = startTime + timeout;
    let newTask = {
        id: taskIdCounter++, //每个任务有一个自增的ID
        callback, //真正要执行的函数calculate
        priorityLevel, //优先级
        expirationTime, //过期时间
        startTime, //开始时间
        sortIndex: -1, //排序值
    };

    if (startTime > currentTime) {
        //如果是延迟任务，那么在timeQueue中的排序依赖就是开始时间了
        newTask.sortIndex = startTime;
        push(timerQueue, newTask);
        //如果现在开始队列里已经为空了，并且新添加的这个延迟任务是延迟任务队队列优先级最高的那个任务
        if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
            requestHostTimeout(handleTimeout, startTime - currentTime);
        }
    } else {
        newTask.sortIndex = expirationTime;
        push(taskQueue, newTask);
        scheduleHostCallback(flushWork);
    }
}

function advanceTimers(currentTime: number) {
    let timer = peek(timerQueue);
    while (timer) {
        if (timer.callback === null) {
            pop(timerQueue);
        } else if (timer.startTime <= currentTime) {
            pop(timerQueue);
            timer.sortIndex = timer.expirationTime;
            push(taskQueue, timer);
        } else {
            return;
        }
        timer = peek(timerQueue);
    }
}

function handleTimeout(currentTime: number) {
    advanceTimers(currentTime);
    if (peek(taskQueue) !== null) {
        scheduleHostCallback(flushWork);
    } else {
        const firstTimer = peek(timerQueue);
        if (firstTimer) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
    }
}

function scheduleHostCallback(flushWorkCallback: any) {
    scheduledHostCallback = flushWorkCallback;
    messageChannel.port2.postMessage(null);
}

function flushWork(currentTime: any) {
    return workLoop(currentTime);
}

function workLoop(currentTime: number) {
    currentTask = peek(taskQueue);
    while (currentTask) {
        if (currentTask.expirationTime > currentTime && shouldYield()) {
            break;
        }
        const callback = currentTask.callback;
        if (typeof callback === "function") {
            currentTask.callback = null;
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            const continuationCallback = callback(didUserCallbackTimeout);
            if (typeof continuationCallback === "function") {
                currentTask.callback = continuationCallback;
            } else {
                pop(taskQueue);
            }
        } else {
            pop(taskQueue);
        }
        currentTask = peek(taskQueue);
    }
    if (currentTask) {
        return true;
    } else {
        const firstTimer = peek(timerQueue);
        if (firstTimer) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
        return false;
    }
}

export const shouldYield = () => {
    const currentTime = getCurrentTime();
    return currentTime >= deadline;
};

export function requestHostTimeout(callback: any, ms: number) {
    taskTimeoutId = setTimeout(() => {
        callback(getCurrentTime());
    }, ms);
}
