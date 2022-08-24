
import {
  scheduleCallback,
  shouldYield,
} from './yieldInterval-scheduler'

let result = 0;
let i = 0;

function calculate() {
  // !shouldYield()： 不应该让步
  for (; i < 1000 && (!shouldYield()); i++) {
    result += 1;
  }
  if (i < 1000) {
    return calculate;
  } else {
    console.log('result', result);
    return false;
  }
}

scheduleCallback(calculate)


