import {
  scheduleCallback,
  shouldYield,
} from './Multitasking-scheduler'

let result = 0;
let i = 0;
function calculate() {
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


let result2 = 0;
let i2 = 0;
function calculat2() {
  for (; i2 < 2000 && (!shouldYield()); i2++) {
    result2 += 1;
  }
  if (i2 < 2000) {
    return calculat2;
  } else {
    console.log('result2', result2);
    return false;
  }
}


scheduleCallback(calculate)

scheduleCallback(calculat2)

