const {telemarketing} = require('./config/dataConf')
const request = require('request'); 
const dataList = require('./util/data.js');
const cardData = require('./util/data2.js');
const addressData = require('./util/data3.js');
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const {randomArr} = require('./util/random.js');

var args = process.argv.splice(2)

let index = Number(args[0]) || 0

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
async function addkh(user, cookie, FORMHASH, sessionkey, citycode) {
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
        'huxing': randomArr([1,2,3,45,6]),
        'ask_point': randomArr([21,22,23,24,25,26,27,28,29,210,211,212,213,214,215,2164]),
        'kh_laiyuan_value': randomArr([31,3,33,34,35,36,37,38,39,310,311,313,313]),
        'wtr_id': 0,
        'dx_id': 0,
        'old_khid': '',
        'sell_info': '',
        'wbfx_id': 0,
        'kh_ditu': Number('4' + Math.floor(Math.random() * 4 + 1)),
        'gf_yiyuan': Math.floor(Math.random() * 3 + 1),
        'gf_ability': Math.floor(Math.random() * 3 + 1),
        'kh_status': Math.floor(Math.random() * 2 + 1),
        'yixiang_i': 3118620916958239,
        'yixiang_ii': '',
        'yixiang_iii': '',
        'gj_type': Math.floor(Math.random() * 2 + 1),
        'df_num': 0, //到访次数和来访有关系
        'gj_content': '',
        'rcArr[]': '',
        // 'lat': 31.72738408495587,
        // 'lng': 117.11826954832136,
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

telemarketing.forEach(async function (v) {
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
        await addkh(user, cookie, FORMHASH, sessionkey, citycode).then(res => {
          console.log(index)
          console.log(`${user.username}录入${dataList[index].name}成功`)
          index ++
        })
      }
    })
  })
})