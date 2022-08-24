
// 时间分片
let deadline = 0;
let yieldInterval = 5;


let scheduledHostCallback: any = null;
const messageChannel = new MessageChannel();
messageChannel.port1.onmessage = performWorkUntilDeadline;

export const getCurrentTime = () => performance.now();

/**
 * 调度
 */
function performWorkUntilDeadline() {
    //获取当前时间
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval;
    const hasMoreWork = scheduledHostCallback(currentTime);
    if (hasMoreWork) {
        messageChannel.port2.postMessage(null);
    }
}

export function scheduleCallback(callback: any) {
    scheduledHostCallback = callback;
    messageChannel.port2.postMessage(null);
}

export const shouldYield = () => {
    const currentTime = getCurrentTime();
    return currentTime >= deadline;
}