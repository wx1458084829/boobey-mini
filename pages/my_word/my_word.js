// pages/my_word/my_word.js
import Dialog from '../../dist/vant/dialog/dialog';
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    word : '', //当前选择的单词
    save_word : []//用户收藏的单词
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
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
    var save_word = wx.getStorageSync('save_word');
    if(save_word != null){
      this.setData({
      save_word: wx.getStorageSync('save_word')
    })
    }
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
  onShareAppMessage: function () {
  
  },
  /**
   * 处理删除的数据
   * @param {*} event 
   */
  onClose(event) {
    const { position, instance } = event.detail;
    switch (position) {
      case 'left':
      case 'cell':
        instance.close();
        break;
      case 'right':
        Dialog.confirm({
          message: '确定删除吗？',
        }).then(() => {
          instance.close();
        });
        break;
    }
  },
/**
 * 用户确认删除
 */
  confirmDel:function(){
    //获取当前收藏的单词
    var save_word = this.data.save_word;
    var word = this.data.word;
    //寻找需要删除的单词并删除
    for(var i = 0 ;i<save_word.length ;i++ ){
          if(save_word[i].word == word){
              save_word.splice(i,1)
          }
    }
    //更新变量
    this.setData({
      save_word: save_word,
    })
    //更新存储
    wx.setStorageSync('save_word', save_word)
  },
  /**
   * 用户取消删除
   */
  cancelDel:function(){

  },
  /**
   * 跳转详细
   */
  navigate_word:function(){
      wx.switchTab({
        url: '../search/search',
      });
      wx.setStorageSync("value", this.data.word);
  },
  /**
   * 用户选择单词
   * @param {*} e 
   */
  cell_click : function(e){
    this.setData({
      word : e.currentTarget.id
    })
  }
})