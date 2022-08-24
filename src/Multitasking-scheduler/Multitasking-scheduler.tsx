
// 多任务调度
let deadline = 0;
let yieldInterval = 5;


let scheduledHostCallback: any = null;
const messageChannel = new MessageChannel();
messageChannel.port1.onmessage = performWorkUntilDeadline;

export const getCurrentTime = () => performance.now();

let taskQueue: any = [];

let currentTask: any;

function performWorkUntilDeadline() {
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval;
    const hasMoreWork = scheduledHostCallback(currentTime);
    if (hasMoreWork) {
        messageChannel.port2.postMessage(null);
    }
}

// 注册
export function scheduleCallback(callback: any) {
    taskQueue.push(callback);
    scheduleHostCallback(flushWork);
}

function scheduleHostCallback(flushWorkCallback: any) {
    scheduledHostCallback = flushWorkCallback;
    messageChannel.port2.postMessage(null);
}

function flushWork() {
    return workLoop()
}

// 消耗
function workLoop() {
    currentTask = taskQueue[0];

    while (currentTask) {
        if (shouldYield()) {
            break;
        }
        const continueCallBack: any = currentTask();
        if (typeof continueCallBack === 'function') {
            currentTask = continueCallBack;
        } else {
            taskQueue.shift()
        }
    }
}

export const shouldYield = () => {
    const currentTime = getCurrentTime();
    return currentTime >= deadline;
}