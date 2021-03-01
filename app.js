//app.js
//var qcloud = require('./vendor/wafer2-client-sdk/index');
//var config = require('./config');
var util = require('./utils/util.js')
App({
  globalData:{
    userInfo:[]
  },
  appData: {
  },
  onLaunch(opt) {
    this.appData.opt = opt
   // qcloud.setLoginUrl(config.service.loginUrl);  //设置登录地址
   // this.doLogin();

    //TODO 写入登录用户信息
    // wx.setStorage({
    //   key: 'data_objectid',
    //   data: res.data_objectid,
    // })
    // wx.setStorage({
    //   key: 'usr_objectId',
    //   data: res.objectId,
    // })

    this.globalData.userInfo=wx.getStorageSync("userInfo")
    if(!wx.getStorageSync("word_list")&&!wx.getStorageSync("all_detail")){
      wx.setStorage({
        key: 'all_detail',
        data: [],
      })

      wx.setStorage({
        key: 'word_list',
        data:[],
      })
      wx.setStorage({
        key: 'day_task',
        data: 10,
      })
    }    
  },


  onShow(opt) {
    this.storeUser_network(opt)//每次打开程序都启动存储用户关系表
  },
  
 
  storeUser_network(opt) {
    const that = this
    const userInfo = wx.getStorageSync('user_info_F2C224D4-2BCE-4C64-AF9F-A6D872000D1A')
    if (userInfo) {//已缓存的用户数据直接用
      getGId(that, userInfo, opt)
    } else {
      this.userInfoReadyCallback = (userInfo) => {  //获取用户信息后的回调函数
        getGId(that, userInfo, opt)
      }
    }
    function getGId(that, userInfo, opt) {
      //判断是否是从微信群内打开该程序的
      wx.getShareInfo({
        shareTicket: opt.shareTicket,
        //含GId的情况
        success: (res) => {
          qcloud.request({
            login: false,
            data: {
              appId: that.appData.appId,
              openId: userInfo.openId,
              encryptedData: res.encryptedData,
              iv: res.iv
            },
            url: `${that.appData.baseUrl}getGId`,
            success: (res) => {
              let GId = res.data.data
              store(that, userInfo, opt, GId)
            }
          })
        },
        //不含GId的情况
        fail: function (res) {
          store(that, userInfo, opt)
        }
      })
    }
  },
  
})