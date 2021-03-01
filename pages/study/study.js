var wxCharts = require('../../utils/wxcharts.js');
var app = getApp();
var pieChart = null;

Page({
  data: {
    active: 0,
    progress: 0, //进度条
    day_task: 0,
    ok: 0,
    unok: 0,
    today_task : [],
    dic_name : '',//字典名称
    isfirst : false,//是否第一次登录
    check:true,//第一次登录单选框
  },
  /**
   * 用户点击登录
   */
userlogin:function(e){
  console.log(e)
    this.getUserInfo(e);
}
,
  /**
   * 获取用户信息
   */
  getUserInfo: function (e) {
    var that = this;
    var info = e.detail.userInfo;
    app.globalData.userInfo = info
    //TODO升级用户信息
    console.log(info)
    this.setData({
      userInfo: info,
      hasUserInfo: true,
      user_note: info.nickName
    })
    wx.login({
      success(res) {
        if (res.code) {
          console.log(e.detail.userInfo)
          console.log(res.code)
          //发起网络请求
          wx.request({
            url: 'https://boobey.wangx1n.cn/openid',
            data: {
              userinfo: e.detail.userInfo,
              code: res.code
            },
            success(res) {
              that.setData({
                isfirst : false,//不是首次登录
                openid : res.data.openid
              })
              wx.setStorageSync('openid', res.data.openid);
              console.log(res)
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    wx.setStorage({
      key: 'userInfo',
      data: info
    })
  }
  ,
  /**
   * 单选框状态改变
   * @param {*} e 
   */
  radiocon:function(e){   
    this.setData({
     check: !this.data.check
     })
   }
  ,
  onChange(event) {
    switch (event.detail) {
      case 0:
        wx.switchTab({
          url: '../study/study'
        })
        break
      case 1:
        wx.switchTab({
          url: '../search/search'
        })
        break
      case 2:
        wx.switchTab({
          url: '../me/me'
        })
        break
    }
    //console.log(event.detail)
  },
  //每天第一次登陆时触发，学习数据重置
  new_day() {
    //从存储中选择用户的学习计划
    var word_list = wx.getStorageSync('word_list');
    //从存储中获取单词量
    var day_task = wx.getStorageSync('day_task');
    //排序函数
    var compare = function (obj1, obj2) {
      var val1 = obj1.ease;
      var val2 = obj2.ease;
      if (val1 < val2) {
        return 1;
      } else if (val1 > val2) {
        return -1;
      } else {
        return 0;
      }
    }
    //排序，把权值最高的放在前面
    word_list = word_list.sort(compare);
    //生成每日要记忆的单词
    var tem = [];
    for (var i = 0; i < day_task; i++) {
      var temp = word_list[0];
      temp.flag = false
      tem.push(temp);
      word_list.shift()
    }
    this.setData({
      today_task: tem
    })
    console.log(tem)
    wx.setStorageSync('today_task', tem);
    var day = this.set_time(new Date())
    wx.setStorageSync('day', day);
  },
  //设置当天日期
  set_time: function (date) {
    var month = date.getMonth() + 1
    var day = date.getDate()
    var year = date.getFullYear()
    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
    return [year, month, day].map(formatNumber).join('/')
  },

  //判断是否完成
  isok: function (word) {
    //排序函数
    var compare = function (obj1, obj2) {
      var val1 = obj1.ease;
      var val2 = obj2.ease;
      if (val1 < val2) {
        return 1;
      } else if (val1 > val2) {
        return -1;
      } else {
        return 0;
      }
    }
    var ok = word.sort(compare);
    if (ok[0].ease <= 0.4) {
      return true;
    }
    return false;
  },
  onLoad: function (options) {
    
    var userInfo = wx.getStorageSync('userInfo');
    if(userInfo == null || userInfo == ''|| userInfo == []||userInfo == {}){
      this.setData({
        isfirst : true
      })
    }else{
      this.setData({
        isfirst : false
      })
    }
  },


  onReady: function () {
  },
  //当用页面重新展示时调用函数
  onShow: function () {
    var dic_name = wx.getStorageSync('dic_name');
    this.setData({
      dic_name :dic_name
    })
    var word_list = wx.getStorageSync('word_list'); //单词列表
    var today_task = wx.getStorageSync('today_task');//获取当前任务
    //var day_task = wx.getStorageSync('day_task'); // 任务量
    //获取当前时间
    var time = this.set_time(new Date());
    //设置当前时间
    this.setData({
      time: time,        //日期
      day_task: 10,
      today_task : today_task
    })
    //设置任务量
    wx.setStorageSync('day_task',this.data.day_task);
    //如果词不够去选择
    if (wx.getStorageSync("word_list").length == 0) {
      wx.navigateTo({
        url: '../study_plan/study_plan'
      })
    } else {
      //如果是新的一天，调用new_day函数
      if (time != wx.getStorageSync("day")) {
        //设置存储为未完成
        wx.setStorageSync('isfinish', false);
        //调用new_day函数
        this.new_day();
      }
      //从存储中获取学习进度
      var progre = wx.getStorageSync("progress"); //学习进度
      var today_task = this.data.today_task; //今日单词（详细）
      this.setData({
        isfinish: false,//设置变量未完成
        progress: progre //设置变量进度条
      })
      //判断是否学习完成
      if (this.isok(this.data.today_task) == true) {
        this.setData({
          isfinish: true
        })
        wx.setStorageSync('isfinish', true);
      }
    }
    //计算完成记忆和未完成记忆的
    var ok = 0;
    var unok = 0;
    if (word_list.length > 0) {
      for (var i = 0; i < today_task.length; i++) {
        if (today_task[i].ease <= 0.4) {
          ok = ok + 1;
        } else {
          unok = unok + 1;
        }
      }
      this.setData({
        ok: ok,
        unok: unok,
      })
    } else {
      wx.navigateTo({
        url: '../study_plan/study_plan'
      })
    }


  },

  //当页面被影藏时，保存数据
  onHide: function () {
  },

  //页面被卸载时，保存学习数据
  onUnload: function () {
  },

  //单词被展示时
  show: function () {
  },

  //页面分享函数
  onShareAppMessage: function (options) {
  },
  goto_study() {
    wx.navigateTo({
      url: '../study2/study2'
    })
  },
  jump_plan() {
    // if (this.checkLogon() == true)
    wx.navigateTo({
      url: '../study_plan/study_plan'
    })
  }
})