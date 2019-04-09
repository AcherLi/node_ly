const { consultant } = require('./config/dataConf')
const request = require('request');
const dataList = require('./util/data.js');
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点

let logs = [];

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
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
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
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    });
  })
}

// 获得首页数据
function search(user, cookie, FORMHASH, sessionkey, citycode) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/khgjlist/search', //请求路径
      method: "POST", //请求方式，默认为get
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie
      },
      formData: {
        'page': 1,
        'num': 20,
        'siid': 0,
        'tab_type': 1,
        'iid': user.itemorgid,
        'FORMHASH': FORMHASH,
        'uid': user.uid,
        'sessionkey': sessionkey,
        'citycode': citycode
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse(body).result.datalist
        resolve(data)
      } else {
        reject(error)
      }
    });
  })
}

// 获得跟进数据
function getgjdetail(user, cookie, FORMHASH, sessionkey, citycode, sdata) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://lefangtong.net:6374/khgjlist/getgjdetail', //请求路径
      method: "POST", //请求方式，默认为get
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie
      },
      formData: {
        'id': sdata.id,
        'atorg': sdata.atorg,
        'FORMHASH': FORMHASH,
        'uid': user.uid,
        'sessionkey': sessionkey,
        'citycode': citycode
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse(body).result
        resolve(data)
      } else {
        reject(error)
      }
    });
  })
}


// 客户录入
function addkh(user, cookie, FORMHASH, sessionkey, citycode, detail) {
  let gj_type = Math.floor(Math.random() * 2 + 1)
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
        'kh_telphone': detail.kh_telphone,
        'kh_name': detail.kh_name,
        'kh_sex': detail.kh_sex,
        'card_type': 2,
        'kh_idcard': detail.kh_idcard,
        'address': detail.address,
        'card_address': detail.card_address,
        'kh_level': 1,
        'kh_age': detail.kh_age,
        'kh_family': detail.kh_family,
        'kh_zhiye': detail.kh_zhiye,
        'fangchan': detail.fangchan,
        'fd_times': detail.fd_times,
        'pay_type': detail.pay_type,
        'need_product': detail.need_product,
        'gf_yongtu': detail.gf_yongtu,
        'sx_mianji_id': detail.sx_mianji_id,
        'zhuangxiu_id': detail.zhuangxiu_id,
        'need_lc': detail.need_lc,
        'need_dw': detail.need_dw,
        'huxing': detail.huxing,
        'ask_point': detail.ask_point,
        'kh_laiyuan_value': detail.kh_laiyuan_value,
        'wbfx_id': 0,
        'kh_ditu': detail.kh_ditu,
        'gf_yiyuan': detail.gf_yiyuan,
        'gf_ability': detail.gf_ability,
        'kh_status': 1,
        'yixiang_i': detail.yixiang_i,
        'yixiang_ii': detail.yixiang_ii,
        'yixiang_iii': detail.yixiang_iii,
        'gj_type': detail.gj_type,
        'df_num': Number(detail.df_num) + gj_type % 1, //到访次数和来访有关系
        'stay_time': Math.floor(Math.random() * 360 + 5),
        'stay_time_select': 1,
        'uid': user.uid,
        'FORMHASH': FORMHASH,
        'sessionkey': sessionkey,
        'citycode': citycode,
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = { body: body, num: Number(detail.gj_num) + 1 }
        console.log()
        resolve(data)
      } else {
        reject(error)
      }
    });
  })
}

async function init() {
  logs = []
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
        await search(user, cookie, FORMHASH, sessionkey, citycode).then(async function (res) {
          let myData = res.filter(v => v.kh_level == 'A')
          let arr = []
          for (let i = 0; i < v.scount; i++) {
            if (i == 0) {
              arr = (myData.filter(v => Number(v.gj_num) < 2).length && myData.filter(v => Number(v.gj_num) < 2)) || (myData.filter(v => 1 < Number(v.gj_num) < 4).length && myData.filter(v => 1 < Number(v.gj_num) < 4)) || (myData.filter(v => Number(v.gj_num) > 2).length && myData.filter(v => Number(v.gj_num) > 2))
            } else if (i == 2) {
              arr = (myData.filter(v => 1 < Number(v.gj_num) < 4).length && myData.filter(v => 1 < Number(v.gj_num) < 4)) || (myData.filter(v => Number(v.gj_num) > 2).length && myData.filter(v => Number(v.gj_num) > 2)) || (myData.filter(v => Number(v.gj_num) < 2).length && myData.filter(v => Number(v.gj_num) < 2))
            } else {
              arr = (myData.filter(v => Number(v.gj_num) > 2).length && myData.filter(v => Number(v.gj_num) > 2)) || (myData.filter(v => 1 < Number(v.gj_num) < 4).length && myData.filter(v => 1 < Number(v.gj_num) < 4)) || (myData.filter(v => Number(v.gj_num) < 2).length && myData.filter(v => Number(v.gj_num) < 2))
            }
            let sdata = arr[Math.floor(Math.random() * arr.length)]
            let sindex = 0
            myData.forEach((v, k) => {
              if (v.id === sdata.id) {
                sindex = k
              }
            })
            myData.splice(sindex, 1);
            await getgjdetail(user, cookie, FORMHASH, sessionkey, citycode, sdata).then(async function (detail) {
              await addkh(user, cookie, FORMHASH, sessionkey, citycode, detail).then(res => {
                console.log(`${user.username}跟进第${res.num}次${detail.kh_name}成功`)
                logs.push({res: res.body, data: `${user.username}跟进第${res.num}次${detail.kh_name}成功`})
              })
            })
          }
        })
      })
    })
  }
  return logs
}

module.exports = init