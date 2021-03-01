// pages/study_plan/study_plan.js
// import Toast from '@vant/weapp/toast/toast';
// Toast('我是提示文案，建议不超过十五字~');
import Dialog from '../../dist/vant/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
   show:false,//控制下面的提示框是否显示
   choice_dic : [],//选择的字典
   is_choice:false, //是否选择了字典
   dic:'', //字典
   temp_dic:'',//临时选择
   dic_name:'', //字典名称
   temp_dic_name:'',//临时选择的名称
   cet4: "四级词汇",
   cet4_import: "四级核心",
   cet6: "六级词汇",
   cet6_import: "六级核心",
   kaoyan: "考研词汇",
   kaoyan_import: "考研核心",
   first : true , //是否第一次使用，弹出欢迎语
  },
   
 ontap:function(res){
  switch(res.target.id){
    case 'cet4':
        this.setData({
          temp_dic_name:this.data.cet4
        })
        break;
        case 'cet4':
          this.setData({
            temp_dic_name:this.data.cet4
          })
          break;
          case 'cet4_import':
        this.setData({
          temp_dic_name:this.data.cet4_import
        })
        break;
        case 'cet6':
        this.setData({
          temp_dic_name:this.data.cet6
        })
        break;
        case 'cet6_import':
        this.setData({
          temp_dic_name:this.data.cet6_import
        })
        break;
        case 'kaoyan':
        this.setData({
          temp_dic_name:this.data.kaoyan
        })
        break;
        case 'kaoyan_import':
        this.setData({
          temp_dic_name:this.data.kaoyan_import
        }) 
        break;
  }
   this.setData({
    temp_dic:res.target.id,
   })
   Dialog.confirm({
    title: '提示',
    message: '确认将'+this.data.temp_dic_name+'加入计划',
  })
    .then(() => {
      // on confirm
    })
    .catch(() => {
      // on cancel
    });
 },
 onSelect:function(){
  var temp_import = require('../../data/'+this.data.temp_dic+'.js');
  var word_list = [];
 // temp_import = Object.keys(temp_import);
  var len = temp_import.wordList.length;
  for(var i=0;i<len;i++){
      var tem = {};
      tem.ease=0.5;
      tem.day=0;
      tem.word=temp_import.wordList[i];
      word_list.push(tem)
  }
  this.setData({
    choice_dic:temp_import,
    dic:this.data.temp_dic,
    dic_name:this.data.temp_dic_name,
    show:false,
   })
   wx.setStorageSync("word_list", word_list);
   wx.setStorageSync("dic",this.data.dic);
   wx.setStorageSync("dic_name", this.data.dic_name);
   wx.switchTab({
    url: '/pages/study/study',
    success: (result)=>{
      
    },
    fail: ()=>{},
    complete: ()=>{}
  });
 },
 onClose(){
     this.setData({
       show:false
     })
 },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var dic = wx.getStorageSync("dic");
    //判断是否第一次登录
    if(dic == null || dic == ''){
      this.setData({
        first : true
      })
    }else{
      this.setData({
        first : false
      })
    }
    var dic_name = wx.getStorageSync("dic_name");
    this.setData({
      dic:dic,
      dic_name,dic_name
    })
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
  onShareAppMessage: function () {

  }
})