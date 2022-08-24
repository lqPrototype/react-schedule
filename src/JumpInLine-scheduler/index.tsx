

import { IdlePriority, ImmediatePriority, LowPriority, NormalPriority, UserBlockingPriority } from "../common/Priorities";
import {
  scheduleCallback,
  shouldYield,
} from './JumpInLine-scheduler'

let result = 0;
let i = 0;
function calculate(didTimeout: any) {
  for (; i < 1000 && (!shouldYield() || didTimeout); i++) {
    result += 1;
  }
  if (i < 1000) {
    return calculate;
  } else {
    console.log('result', result);
    return false;
  }
}


let result2 = 0;
let i2 = 0;
function calculat2(didTimeout: any) {
  for (; i2 < 2000 && (!shouldYield() || didTimeout); i2++) {
    result2 += 1;
  }
  if (i2 < 2000) {
    return calculat2;
  } else {
    console.log('result2', result2);
    return false;
  }
}


let result3 = 0;
let i3 = 0;
function calculat3(didTimeout: any) {
  for (; i3 < 4000 && (!shouldYield() || didTimeout); i3++) {
    result3 += 1;
  }
  if (i3 < 4000) {
    return calculat3;
  } else {
    console.log('result3', result3);
    return false;
  }
}


scheduleCallback(ImmediatePriority, calculate)
scheduleCallback(UserBlockingPriority, calculat2)
scheduleCallback(NormalPriority, calculat3)