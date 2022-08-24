import { peek, pop, push } from "../common/MinHeap";
import {
    IdlePriority,
    ImmediatePriority,
    LowPriority,
    NormalPriority,
    UserBlockingPriority,
} from "../common/Priorities";

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

let taskQueue: any = [];

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

export function scheduleCallback(priorityLevel: number, callback: any) {
    //获取当前的时间
    let currentTime = getCurrentTime();
    //此任务的开始时间
    let startTime = currentTime;
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
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    scheduleHostCallback(flushWork);
}

function scheduleHostCallback(flushWorkCallback: any) {
    scheduledHostCallback = flushWorkCallback;
    messageChannel.port2.postMessage(null);
}

function flushWork(currentTime: any) {
    return workLoop(currentTime);
}

function workLoop(currentTime: any) {
    currentTask = peek(taskQueue);
    while (currentTask) {
        if (currentTask.expirationTime > currentTime && shouldYield()) {
            break;
        }
        const callback = currentTask.callback;
        if (typeof callback === 'function') {
            currentTask.callback = null;
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            const continuationCallback = callback(didUserCallbackTimeout);
            if (typeof continuationCallback === 'function') {
                currentTask.callback = continuationCallback;
            } else {
                pop(taskQueue);
            }
        } else {
            pop(taskQueue);
        }
        currentTask = peek(taskQueue);
    }

    return currentTask;
}

export const shouldYield = () => {
    const currentTime = getCurrentTime();
    return currentTime >= deadline;
};
