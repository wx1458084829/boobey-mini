// pages/test/test.js
var list = require('../../data/vocabulary.js')
var util = require('../../utils/util.js')
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
     da1:"",
     da2: "",
     da3: "",
     da4: "",
     daan:false,
     showDaan:false,
     complete:false,
     true_num:0,
     score:0,
     currentTab: 0,
     friendsData: [],
     globalData: [],
     loadNumber: 0,  //全球排名数据加载次数
     history:0 ,
     problem : {} ,//问题
  },
/**
 * 按钮触发下一个事件
 */ 
  next(){
    this.setData({ showDaan: false})
    this.loadnext()
  },

  /**
   * 加载下一个单词
   */
  loadnext:function(){
    var that = this;
    wx.request({
      url: 'http://localhost:8090/gettestword', //仅为示例，并非真实的接口地址
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        that.setData({
          problem : res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadnext()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    return {
      title:"我在BooBey单词测试，答对了"+this.data.true_num+"道题，你也快来测一测吧！",
    }
  },
  choice(e){
    console.log(e)
      if(e.currentTarget.id === this.data.problem.answer+''){
         console.log('正确')
        this.setData({ daan: true, true_num: this.data.true_num + 1})
        const innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.autoplay = true
        innerAudioContext.src = 'http://res.iciba.com/resource/amp3/1/0/75/5f/755f85c2723bb39381c7379a604160d8.mp3'
        innerAudioContext.onPlay(() => {
        })
        this.loadnext();
      }else{
        //this.set_score(this.data.true_num)
        this.setData({daan:false})
        this.setData({ complete: true })
        const innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.autoplay = true
        innerAudioContext.src = 'http://res.iciba.com/resource/amp3/1/0/73/cf/73cf0e388971ee4ec34e8daedd0d36cc.mp3'
        innerAudioContext.onPlay(() => {
        })
        if(this.data.true_num>this.data.score){
          this.setData({ history: this.data.true_num})
        }else{
          this.setData({ history: this.data.score })
        }    
      }
      this.setData({showDaan:true})
  },
  complete(){

  },
  again(){
    this.setData({
      showDaan: false, 
      complete: false,
      num: 1,
      true_num: 0
    })
    this.loadnext()
  },
  getScore(openId) {
   
  },
  onReachBottom: function () {//下拉加载
   
  }
})

