const nodemailer = require("nodemailer"); //发送邮件的node插件
const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置
const schedule = require("node-schedule"); //定时器任务库
const index = require("./index");
const index2 = require("./index2");
const index3 = require("./index3");
//配置项

//发送者邮箱厂家
let EmianService = "QQ";
//发送者邮箱账户SMTP授权码
let EamilAuth = {
  user: "limines@qq.com",
  pass: "izxxuenvqpambchh"
};
//发送者昵称与邮箱地址
let EmailFrom = '"scaler" <limines@qq.com>';

//接收者邮箱地
let EmailTo = "739251083@qq.com";
//邮件主题
let EmailSubject = "今日数据录入报告";

//每日发送时间
let EmailHour = 8;
let EmialMinminute= 00;

// 发动邮件
function sendMail(HtmlData) {
    const template = ejs.compile(
      fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
    );
    const html = template(HtmlData);
  
    let transporter = nodemailer.createTransport({
      service: EmianService,
      port: 465,
      secureConnection: true,
      auth: EamilAuth
    });
  
    let mailOptions = {
      from: EmailFrom,
      to: EmailTo,
      cc: EmailFrom,
      subject: EmailSubject,
      html: html
    };
    transporter.sendMail(mailOptions, (error, info={}) => {
      if (error) {
        console.log(error);
        sendMail(HtmlData); //再次发送
      }
      console.log("邮件发送成功", info.messageId);
      console.log("静等下一次发送");
    });
  }

// 聚合
async function getAllDataAndSendMail(){
    let HtmlData = {};
    let today = new Date();
    let todaystr =
      today.getFullYear() +
      " / " +
      (today.getMonth() + 1) +
      " / " +
      today.getDate();
    HtmlData["todaystr"] = todaystr;

    index().then(res1 =>{
        index2().then(res2 =>{
            index3().then(res3 =>{
                let data = [...res1, ...res2, ...res3]
                HtmlData["data"] = data;
                sendMail(HtmlData)
            })
        })
    })
}

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = EmailHour;
rule.minute = EmialMinminute;
console.log('NodeMail: 开始等待目标时刻...')
let j = schedule.scheduleJob(rule, function() {
  console.log("执行任务");
  getAllDataAndSendMail();
});