Page({

  /**
   * 页面的初始数据
   */
  data: {
    voteTitle: null,
    simple: false,
    detail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(options) {},
  voteTitle: function(e) {
    this.setData({
      simple: true,
      voteTitle: e.detail.value
    })
  },
  detail() {
    var that = this
    wx.showLoading({
      title: '查询中',
    })
    wx.request({
      url: 'https://api.shanbay.com/bdc/search/?word=' + this.data.voteTitle,
      method: 'GET',
      success: function(res) {
        console.log("查询单词")
        console.log(res)
        // 判断查询是否为错误
        if (res.data.status_code == 0) {
          that.setData({
            msg: res.data.msg,
            status_code: res.data.status_code,
            word: res.data.data.content,
            pron: res.data.data.pronunciation,
            definition: res.data.data.definition,
            pron_audio: res.data.data.audio,
          })
        } else {
          that.setData({
            msg: res.data.msg,
            status_code: res.data.status_code
          })
          wx.showToast({
            title: '没有此单词',
            icon: 'none',
            duration: 2000
          })
        }
        wx.hideLoading()
        // 判断如果没有查询到这个单词，那么就不必再查询例句
        if (undefined != res.data.data.conent_id) {
          console.log('单词id：'+res.data.data.conent_id)
          that.get_sams(res.data.data.conent_id)
        }
      },
      fail: function() {
        console.log("请求失败")
      },
      complete: function() {}
    })
    this.setData({
      detail: true,
      simple: false
    })
  },
  read() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.data.pron_audio
    innerAudioContext.onPlay(() => {})
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  get_sams(id) {
    var that = this
    wx.request({
      url: 'https://api.shanbay.com/bdc/example/?vocabulary_id=' + id,
      data: {},
      method: 'GET',
      success: function(res) {
        console.log("查询例句")
        console.log(res)
        that.setData({
          defen: [res.data.data[0], res.data.data[1], res.data.data[2]]
        })
      },
      fail: function() {},
      complete: function() {}
    })
  }
})