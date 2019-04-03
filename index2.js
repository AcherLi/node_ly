const {consultant} = require('./config/dataConf')
const request = require('request'); 
const dataList = require('./util/data.js');
const cardData = require('./util/data2.js');
const addressData = require('./util/data3.js');
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const {randomArr} = require('./util/random.js');
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
      index = config.sIndex;
      console.log(index)
      resolve(data);
    })
  })
}


function login(v) {
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
function getIndex(cookie) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/khgj', //请求路径
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

// 所有楼栋号
function getLD(user, cookie, FORMHASH, sessionkey, citycode) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/fy/get_loudong', //请求路径
      method: "POST", //请求方式，默认为get
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie
      },
      formData: {
        'iid': user.itemorgid,
        'FORMHASH': FORMHASH,
        'uid': user.uid,
        'sessionkey': sessionkey,
        'citycode': citycode
      }
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse(body).result.loudonglist
        resolve(data[data.length - 1].id)
      } else {
        reject(error)
      }
    }); 
  })
}

// 获得楼层单位
function getldstruct(user, cookie, FORMHASH, sessionkey, citycode, ldid) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/item/getldstruct', //请求路径
      method: "POST", //请求方式，默认为get
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie
      },
      formData: {
        'iid': user.itemorgid,
        'siid': 0,
        'ldid': ldid,
        'from': 1,
        'FORMHASH': FORMHASH,
        'uid': user.uid,
        'sessionkey': sessionkey,
        'citycode': citycode
      }
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse(body).result.units
        let arr = []
        for (let key in data) {
          arr.push(data[key])
        }
        arr = arr.filter(v => v.sellstate == '1')
        resolve(arr)
      } else {
        reject(error)
      }
    }); 
  })
}

// 客户录入
function addkh(user, cookie, FORMHASH, sessionkey, citycode, fzData) {
  let fz = Math.floor(Math.random() * fzData.length);
  let gj_type = Math.floor(Math.random() * 2 + 1);
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/khgj/addkh', //请求路径
      method: "POST", //请求方式，默认为get
      headers: {//设置请求头
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie
      },
      formData: {
        'kh_link_type': 1,
        'kh_telphone': dataList[index].tel,
        'kh_name': dataList[index].name,
        'kh_sex': Math.random() > 0.5 ? 2 : 1,
        'card_type': 2,
        'kh_idcard': cardData[index],
        'address': addressData[2 * index],
        'card_address': addressData[(2 * index) + 1],
        'kh_level': 1,
        'kh_age': Math.floor(Math.random() * 5 + 1),
        'kh_family': Math.floor(Math.random() * 6 + 1),
        'kh_zhiye': 10 + Math.floor(Math.random() * 8 + 1),
        'fangchan': Math.floor(Math.random() * 5 + 1),
        'fd_times': Math.floor(Math.random() * 5 + 1),
        'pay_type': Math.floor(Math.random() * 3 + 1),
        'need_product': randomArr([1,2,3,4,5,6,7,8,]),
        'gf_yongtu': randomArr([1,2,3,4,5,6,7,8,]),
        'sx_mianji_id': Math.floor(Math.random() * 7 + 1),
        'zhuangxiu_id': Math.floor(Math.random() * 2 + 1),
        'need_lc': randomArr([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]),
        'need_dw': randomArr([1,2,3,4]),
        'huxing': randomArr([1,2,3,4,5,6]),
        'ask_point': randomArr([21,22,23,24,25,26,27,28,29,210,211,212,213,214,215,2164]),
        'kh_laiyuan_value': randomArr([31,3,33,34,35,36,37,38,39,310,311,313,313]),
        'wtr_id': 0,
        'dx_id': 0,
        'wbfx_id': 0,
        'kh_ditu': Number('4' + Math.floor(Math.random() * 4 + 1)),
        'gf_yiyuan': Math.floor(Math.random() * 3 + 1),
        'gf_ability': Math.floor(Math.random() * 3 + 1),
        'kh_status': 1,
        'yixiang_i': fzData[fz].id,
        'yixiang_ii': fzData[(fz + 1) % fzData.length].id,
        'yixiang_iii': fzData[(fz + 2) % fzData.length].id,
        'gj_type': gj_type,
        'df_num': gj_type % 1, //到访次数和来访有关系
        'stay_time_id': Math.floor(Math.random() * 6 + 1),
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
  await readFile();
  for (let i = 0; i < consultant.length; i++) {
    let v = consultant[i]
    await login(v).then(async function (cookie) {
      await getIndex(cookie).then(async function (res) {
        let $ = cheerio.load(res);
        let text = $('script')[11].children[0].data;
        eval(text)
        let user = $_M;
        let FORMHASH = $_FORMHASH
        let sessionkey = $_sessionkey
        let citycode = $_C.citycode
        await getLD(user, cookie, FORMHASH, sessionkey, citycode).then(async function (llid) {
          await getldstruct(user, cookie, FORMHASH, sessionkey, citycode, llid).then(async function (fzData) {
            for(let i = 0; i < v.count; i++) {
              await addkh(user, cookie, FORMHASH, sessionkey, citycode, fzData).then(res => {
                console.log(index)
                console.log(`置业顾问${user.username}录入${dataList[index].name}成功`)
                logs.push({res, data: `置业顾问${user.username}录入${dataList[index].name}成功`})
                index ++
              })
            }
          })
        })
      })
    })
  }

  config = JSON.stringify({sIndex: index, tIndex: config.tIndex}); 

  //指定创建目录及文件名称，__dirname为执行当前js文件的目录
  var file = path.join(__dirname, 'config/dataIndex.json'); 

  //写入文件
  fs.writeFile(file, config, function(err) {
    if (err) {
        return console.log(err);
    }
    console.log('数据记录成功，地址：' + file + '置业顾问已记录到' + index + '条');
  });
  return logs
}

module.exports = init