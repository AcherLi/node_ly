function randomArr(arr) {
  let newStr = arr.filter(v => {
    return Math.floor(Math.random() > 0.7)
  })
  if (newStr && newStr.length) {
    return newStr.join(',');
  } else {
    let index = Math.floor(Math.random() * arr.length)
    return arr[index];
  }
}

module.exports = {
  randomArr
}