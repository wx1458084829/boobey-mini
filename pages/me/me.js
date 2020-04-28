const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yes: false,
    toforgive: false,
    tobackup: false,
    user_note: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var time = this.set_time(new Date())
    //从缓存中读取任务信息
    this.setData({
      have_done: wx.getStorageSync(time),
      day_task: wx.getStorageSync('day_task'),
      my_word_num: wx.getStorageSync("my_word_num"),
      free_word_num: wx.getStorageSync("free_word_num"),
      complete_day: wx.getStorageSync("day_num"),
      add_word_num: wx.getStorageSync("word_list").length,
    })
    //从缓存中读取用户信息
    if (!wx.getStorageSync("userInfo")) {
      this.setData({
        user_note: "点击登录"
      })
    } else {
      //如果为空就调用获取用户信息
      this.setData({
        userInfo: wx.getStorageSync("userInfo"),
        hasUserInfo: true,
        user_note: wx.getStorageSync("userInfo").nickName
      })
    }
  },

  /**
   * 获取用户信息
   */

  getUserInfo: function (e) {
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
          //发起网络请求
          wx.request({
            url: 'http://127.0.0.1:8081/user/login',
            data: {
              userinfo: e.detail.userInfo,
              code: res.code
            },
            success(res) {
              console.log(res.data.data)
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    wx.setStorage({
      key: 'userInfo',
      data: info,
    })
  },
  /**
   * 时间转换工具
   */
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

  update(data) {
    data = data || this.data
    this.setData(data)

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
/**
 * 修改每日学习量
 * @param {*} e 
 */
  voteTitle: function (e) {
    //判断是否登录
    if(this.checkLogon() == true){
        //判断是输入情况
    if (e.detail.value < 500 && e.detail.value > 0){
      this.setData({
        day_task: e.detail.value
      })
      wx.setStorage({
      key: 'day_task',
      data: e.detail.value,
    }) 
    wx.showToast({
      title: '修改成功',
      icon: 'none'
    })
    }else if(e.detail.value =='' ){

    }else{
      wx.showToast({
        title: '输入错误\n请输入0到500的学习量',
        icon: 'none'
      })
    }
    }  
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: options.target.id,
      path: '/pages/study/study',
      success: function (res) {}
    }
  },
  /**
   * 校验用户是否登录
   */
  checkLogon: function () {
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        console.log(res.data)
      }
    })
    try {
      var value = wx.getStorageSync('userInfo')
      if (value) {
        return true
      }else{
        wx.showToast({
          title: '请登录后操作',
          icon: 'none',
          duration: 2000
        })
      return false
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  /**
   * 我加入计划的单词
   */
  my_word_list() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../my_word/my_word',
      })
  },
  /**
   * 词汇测试
   */
  test_card() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../test/test',
      })
  },
  /**
   * 统计
   */
  jumptj() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../all_detail/all_detail',
      })
  },
  /**
   * 好友对战
   */
  jumpduizhan() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../vs/vs',
      })
  },
  /**
   * 关于我们
   */
  about_me() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../about/about',
      })
  },
  /**
   * 意见反馈
   */
  suggestion() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../suggestion/suggestion',
      })
  },


})