const app = getApp()
import Toast from '../../dist/vant/toast/toast';
Page({
  /**
   * 页面的初始数据
   */ 
  data: {
    active: 2, //当前标签的索引
    yes: false,
    toforgive: false,
    tobackup: false,
    user_note: "",
    columns: [],//选择的计划天数
    popup_show : false,
    day_task : 5,
    isChecked1 : false ,//语音学习按钮状态
  },
  /**
   * 设置展示选择器的事件
   */
  set_dtask : function(){
      this.setData({
        popup_show : true
      })
  },
  /**
   * 多选框被选择的时候触发的事件
   * @param {} event 
   */
  picker_change(event) {
    const { picker, value, index } = event.detail;
    var day_task = event.detail.value
    this.setData({
      day_task : value
    })
  },
  onChange(event) {
    // event.detail 的值为当前选中项的索引
   // this.setData({ active: event.detail });
    switch( event.detail){
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


  changeSwitch1: function(e){
    // 需要手动对 checked 状态进行更新
    this.setData({ isChecked1: e.detail.value });
    if(e.detail.value == true){
      wx.setStorageSync('isvoice',true);
    }else{
      wx.setStorageSync('isvoice',false)
    }
    console.log(e)
  }
  ,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var columns = [];
    for ( var i=5;i<=30;i++){
        columns.push(i)
    }
    var time = this.set_time(new Date())
    //从缓存中读取任务信息
    this.setData({
      columns : columns,
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
   * 确认修改学习量
   */
  select_task:function(){
      wx.setStorageSync('day_task', this.data.day_task);
      Toast(`修改任务成功`+''+'\n次日生效哦！');
      this.setData({
        popup_show  : false
      })
  },
  cancel_task:function(){
      this.setData({
        popup_show  : false
      })
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
        // wx.hideToast()
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
    console.log(this.checkLogon())
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
  jumpjh() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../study_plan/study_plan',
      })
  },
  /**
   * 好友对战
   */
  // jumpduizhan() {
  //   if (this.checkLogon() == true)
  //     wx.navigateTo({
  //       url: '../vs/vs',
  //     })
  // },
  /**
   * 关于我们
   */
  // about_me() {
  //   if (this.checkLogon() == true)
  //     wx.navigateTo({
  //       url: '../about/about',
  //     })
  // },
  /**
   * 意见反馈
   */
  suggestion() {
    if (this.checkLogon() == true)
      wx.navigateTo({
        url: '../suggestion/suggestion',
      })
  }

})