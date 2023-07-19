const memoSequences = [1, 1, 2, 3, 4, 5, 8, 10, 15];


function memoTime(time) {
  const memoSequences = [1, 1, 2, 3, 4, 5, 8, 10, 15];
  if (time < memoSequences.length) {
    return memoSequences[time - 1];
  } else {
    return memoSequences[memoSequences.length - 1];
  }
}

function calAccuracy(arr) {
  if (arr.length < 3) {
    return 0;
  } else {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    // 保留两位小数
    return Math.round((sum / arr.length) * 100) / 100;
  }
}

export { memoTime, calAccuracy };