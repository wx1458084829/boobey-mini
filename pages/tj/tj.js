var wxCharts = require('../../utils/wxcharts.js');
var app = getApp();
var lineChart = null;
var startPos = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  touchHandler: function (e) {
    lineChart.scrollStart(e);
  },
  moveHandler: function (e) {
    lineChart.scroll(e);
  },
  touchEndHandler: function (e) {
    lineChart.scrollEnd(e);
    lineChart.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  /**
   * 获取总计数目
   */
  createSimulationData: function () {
    var categories = []; //日期
    var rem = []; //记住
    var mohu = []; //模糊
    var all_detail=wx.getStorageSync("all_detail"); 
    var length=all_detail.length;
    for (var i = 0; i < length; i++) {
      categories.push(i+1);
      rem.push(all_detail[i].renshi);
      mohu.push(all_detail[i].mohu);
    }
    return {
      categories: categories,
      rem: rem,
      mohu: mohu
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var all_detail = wx.getStorageSync('all_detail');
    this.setData({
      all_detail : all_detail
    })
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    //获取总计
    var simulationData = this.createSimulationData();
    console.log(simulationData)
    //判断是否有数据
    if(simulationData.categories.length!=0){
      lineChart = new wxCharts({
        canvasId: 'lineCanvas',
        type: 'column',
        categories: simulationData.categories,
        animation: false,
        series: [{
          name: '认识',
          data: simulationData.rem,
          format: function (val, name) {
            return val.toFixed(2);
          }
        }, {
          name: '模糊',
          data: simulationData.mohu,
          format: function (val, name) {
            return val.toFixed(2);
          }
          }
        ],
        xAxis: {
          disableGrid: false
        },
        yAxis: {
          title: '学习情况',
          format: function (val) {
            return val.toFixed(2);
          },
          min: 0
        },
        width: windowWidth,
        height: 260,
        dataLabel: true,
        dataPointShape: true,
        enableScroll: true,
        extra: {
          lineStyle: 'curve'
        }
      });
       var wordlist=wx.getStorageSync("word_list");
       var len=wordlist.length;
      var today_detail=wx.getStorageSync("today_detail")
      //设置数据
      this.setData({
        rem : simulationData.rem,
        mohu : simulationData.mohu,
        today_rem:today_detail.renshi,
        today_mohu:today_detail.mohu,
        total_word:len,
        day_num: 1
      })
    }
    //调用画布绘图
    var pieChart = new wxCharts({
       
      animation: true,
      canvasId: 'pieCanvas',
      type: 'pie',
      series: [{
        name: '未完成',
        data: wordlist.length-this.data.all_detail.length*10,
      }, {
        name: '已完成',
        data: this.data.all_detail.length*10,
      }],
      width: windowWidth,
      height: 220,
      dataLabel: true,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.onLoad();
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
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
    
  }
})