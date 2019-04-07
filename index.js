const {telemarketing} = require('./config/dataConf')
const request = require('request'); 
const dataList = require('./util/data.js');
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const path = require('path');
const fs = require('fs');

let index = 0
let config = null
let logs = []

function readFile() {
  return new Promise((resolve, reject) => {
    // 读取文件获得当前录入记录的index
    fs.readFile(path.join(__dirname, 'config/dataIndex.json'),function(err,data){
      if(err){
        reject(err)
      }
      var data = data.toString();//将二进制的数据转换为字符串
      config = JSON.parse(data);//将字符串转换为json对象
      index = config.tIndex;
      resolve(data);
    })
  })
}

async function login(v) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/account/login', //请求路径
      method: "POST", //请求方式，默认为get
      headers: {//设置请求头
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
      },
      formData: {
        username: v.username,
        password: v.password,
        checkcode: '',
      }
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = response.caseless.dict['set-cookie'][0].split(";")[0]
        resolve(data)
      } else {
        reject(error)
      }
    }); 
  })
}

// 获得全局变量
async function getIndex(cookie) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/dx', //请求路径
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie
      }
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    }); 
  })
}

// 客户录入
async function addgj(user, cookie, FORMHASH, sessionkey, citycode) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/dx/addgj', //请求路径
      method: "POST", //请求方式，默认为get
      headers: {//设置请求头
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie
      },
      formData: {
        'kh_name': dataList[index].name,
        'kh_tel': dataList[index].tel,
        'kh_status': Math.random() > 0.5 ? 4: 3,
        'uid': user.uid,
        'FORMHASH': FORMHASH,
        'sessionkey': sessionkey,
        'citycode': citycode,
      }
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    }); 
  })
}

async function init() {
  logs = []
  await readFile();
  for (let i = 0; i < telemarketing.length; i++) {
    let v = telemarketing[i]
    await login(v).then(async function (cookie) {
      await getIndex(cookie).then(async function (res) {
        let $ = cheerio.load(res);
        let text = $('script')[11].children[0].data;
        eval(text)
        let user = $_M;
        let FORMHASH = $_FORMHASH
        let sessionkey = $_sessionkey
        let citycode = $_C.citycode
        for(let i = 0; i < v.count; i++) {
          await addgj(user, cookie, FORMHASH, sessionkey, citycode).then(res => {
            console.log(index)
            console.log(`${user.username}录入${dataList[index].name}成功`)
            logs.push({res, data: `${user.username}录入${dataList[index].name}成功`})
            index ++
          })
        }
      })
    })
  }

  config.tIndex = index

  config = JSON.stringify(config); 

  //指定创建目录及文件名称，__dirname为执行当前js文件的目录
  var file = path.join(__dirname, 'config/dataIndex.json'); 

  //写入文件
  fs.writeFile(file, config, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('数据记录成功，地址：' + file + '电销数据已记录到' + index + '条');
  });
  return logs
}

module.exports = init