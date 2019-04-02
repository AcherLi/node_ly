const xlsx = require('node-xlsx');
const path = require('path');
const fs = require('fs');

const sheets = xlsx.parse(path.resolve(__dirname, 'default2.xlsx')); //获取到所有sheets

sheets[1].data[1]

console.log('清洗数据开始！')

let data = []
sheets[1].data.forEach((v, k) => {
  if (v[0]) {
    data.push(`${Math.round(v[0])}`)
    console.log(`第${k + 1}条数据成功`)
  } else {
    console.log(`第${k + 1}条数据失败`)
  }
})

console.log('清洗数据完成！')

data = JSON.stringify({data}); 

//指定创建目录及文件名称，__dirname为执行当前js文件的目录
var file = path.join(__dirname, 'data2.json'); 

//写入文件
fs.writeFile(file, data, function(err) {
  if (err) {
      return console.log(err);
  }
  console.log('文件创建成功，地址：' + file);
});