// pages/search/search.js
//录音控制
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
Page({
  /**
   * 页面的初始数据 
   */
  data: {
    msg: '',//返回的查询结果描述
    isfind: false, //是否找到此单词 
    active: 1,
    ishow: false, //是否展示搜索到的单词
    value: '', //搜索框内容
    content: '',//单词内容
    pronunciation: {},//音标
    definition: '',//翻译
    pron_audio: '',//发音连接
    issave: false,//该单词是否被收藏
    save_word: [],//用户收藏的单词
    show:false, //说话动画是否展示
    translation_a:'',//翻译的原始内容
    translation_b:'',//翻译好的内容
    ai_word:[],//ai识别的语音结果
    issentence:false,//是否句子
    is_pic_show:false,//说话照片是否展示
    voice_content : '',//说话按钮文本
  },
    /**
   * ai转文字
   * @param {*} tempFilePath 
   */
  gettext: function (tempFilePath) {
    var that = this
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        'image': wx.getFileSystemManager().readFileSync(tempFilePath, "base64"),
        'access_token': this.data.access_token
      },
      success: (res) => {
        that.setData({
          words: res.data.words_result
        })
        console.log(res)
      }
    })
  },
  /**
   * 翻译接口
   * @param {*} content 
   */
  translation:function(content){
    var that = this;
    wx.request({
      url: 'http://localhost:8090/translate', //仅为示例，并非真实的接口地址
      data: {
        q: content
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        var translation_a = res.data.trans_result[0].src;
        var translation_b = res.data.trans_result[0].dst;
        that.setData({
          translation_a:translation_a,
          translation_b:translation_b,
          issentence : true
        })
        console.log(res.data)
      }
    })
  },
  /**
   * 跳转图片搜索
   */
aiphoto:function(){
      wx.navigateTo({
        url: '/pages/photo/photo',
      });
}
  ,
  /**
   * 开始录音函数
   */
  startVoice: function () {
    var that = this
    const options = {
      duration: 10000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 96000, //编码码率
      format: 'wav', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    }
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('recorder start')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },
  /**
   * 停止录音函数
   */
  stoptVoice: function () {
    recorderManager.stop();
    var that = this
    recorderManager.onStop((res) => {
      that.setData({
        voicePath: res.tempFilePath
      })
      //获取文件大小
      wx.getFileInfo({
            filePath: res.tempFilePath,
            success: (res) => {
              console.log(res.size)
              that.setData({
                voiceSize: res.size
              })
            }
          })
          //获取base64编码信息
          wx.getFileSystemManager().readFile({
            filePath: res.tempFilePath,
            encoding: 'base64',
            success: (res) => {
              console.log(res.data)
              that.setData({
                speech: res.data
              })
              // that.getVoice()
            }
          })
      console.log('停止录音', res.tempFilePath)
    })
    setTimeout(function () {
      that.getVoice()
    }, 1000);
  },
  /** 
   * ai识别语音
   */
  getVoice: function () {
    var that = this;
      wx.request({
        url: 'https://vop.baidu.com/server_api',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          'token': wx.getStorageSync('access_token'),
          'format': 'wav',
          'rate': 16000,
          'channel': 1,
          'cuid': 'baidu_workshop',
          'speech': that.data.speech,
          'len': that.data.voiceSize,
          'dev_pid' : 1737
        },
        method: 'POST',
        success: (res) => {
          that.translation(res.data.result[0]);
          that.setData({
            issentence : true,
            ai_word : res.data.result
          })
          console.log(res)
        }
      })
    },
    /**
     * 说话关闭
     */
  onClose() {
    this.setData({ show: false,
      is_pic_show : true,
    });
    this.stoptVoice();
  },
  //语音点击事件
  saybindtap:function(){
    this.setData({ 
      show: true,
      is_pic_show : false,
      voice_content :'请按住说话',
    });
  }
  ,
     /**
     * 说话开启
     */
  ontap(){
    this.setData({ show: true, 
      is_pic_show : true,
      voice_content :'正在说话..',

    });
    this.startVoice();
  },
   /**
   * 判断目前的单词是否被收藏
   */
  issaved: function (word) {
    var save_word = this.data.save_word;
    //如果save_word里面为空，证明变量还未使用
    if (save_word == null) {
      return false;
    }
    //遍历寻找是否存在这个单词
    for (var i = 0; i < save_word.length; i++) {
      if (save_word[i].word == word) {
        return true;
      }
    }
    //未找到
    return false;
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
  }
  ,
  /**
   * 增加收藏
   */
  addword: function () {
    //获取当前收藏的单词
    var save_word = this.data.save_word;
    //如果还没有初始化就进行变量初始化
    if (save_word == null || save_word == undefined || save_word == '') {
      var save_word = []
    }
    //设置新的收藏的单词对象
    var word = {};
    word.word = this.data.content;
    word.data = this.set_time(new Date());
    //把新的单词对象加入到收藏的单词
    save_word.push(word)
    //更新变量
    this.setData({
      save_word: save_word,
      issave: true
    })
    //更新存储
    wx.setStorageSync('save_word', save_word)
  },
  /**
   * 删除收藏
   */
  delword: function () {
    //获取当前收藏的单词
    var save_word = this.data.save_word;
    //寻找需要删除的单词并删除
    for(var i = 0 ;i<save_word.length ;i++ ){
          if(save_word[i].word == this.data.content){
              save_word.splice(i,1)
          }
    }
    //更新变量
    this.setData({
      save_word: save_word,
      issave: false
    })
    //更新存储
    wx.setStorageSync('save_word', save_word)
  },
  onChange(event) {
    // event.detail 的值为当前选中项的索引
    // this.setData({ active: event.detail });
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token',
      method: 'GET',
      data: {
        grant_type: 'client_credentials',
        client_id: 'UNCrH6AGAK1QfcjmnwU8YIoj',
        client_secret: 'p3n39wi2RB1YW7R7UCPe1hXvbgdXeWOM'
      },
      success(res) {
        wx.setStorage({
          data: res.data.access_token,
          key: 'access_token',
        })
        console.log(res.data)
      }
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
    //判断单词是否被保存
    var save_word = wx.getStorageSync('save_word');
    if (save_word != null) {
      this.setData({
        save_word: save_word,
      })
    } else {
      this.setData({
        save_word: []
      })
    }
    var value = wx.getStorageSync('value');
    if(value != null && value != ''){
        this.setData({
          value : value
        })
        this.detail(value)
    } 
    wx.removeStorageSync('value');
    var translation_a = wx.getStorageSync('translation_a');
    var translation_b = wx.getStorageSync('translation_b');
    if(translation_a==null||translation_a==''||translation_a=={}||translation_a==[]){
      this.setData({
        issentence : false
      })
    }else{
        this.setData({
          translation_a :translation_a,
          translation_b :translation_b,
          issentence : true
        })
        wx.removeStorageSync('translation_a');
        wx.removeStorageSync('translation_b');
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      value : null,
      ishow : false,
      isfind : false,
      issave : false
    })
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
   * 用户点击搜索
   * @param {} e 
   */
  onSearch: function (e) {
    this.setData({
      value: e.detail,
    })
    //调用搜索单词并且展示
    this.detail(e.detail);
  },
  /**
   * 用户点击取消
   */
  onCancel: function () {
      this.setData({
        //设置据中不可见
        issentence : false,
        ishow : false,
      })
  },
  /**
   * 监控搜索框变化
   * @param {*} e 
   */
  onSearchChange: function (e) {
    if (e.detail == null || e.detail == '') {
      this.setData({
        ishow: false
      })
    }
  }
  ,
  /**
   * 搜索单词
   * @param {*} word 
   */
  detail(word) {
    var that = this
    wx.showLoading({
      title: '查询中',
    })
    wx.request({
      url: 'https://api.shanbay.com/bdc/search/?word=' + word,
      method: 'GET',
      success: function (res) {
        console.log("查询单词")
        // 判断查询是否为错误
        if (res.data.status_code == 0) {
          that.setData({
            ishow: true,
            isfind: true,
            msg: res.data.msg,
            content: res.data.data.content,
            pronunciation: res.data.data.pronunciation,
            definition: res.data.data.definition,
            pron_audio: res.data.data.audio,
          })
          //请求时判断单词是否被收藏
          if (that.issaved(res.data.data.content) == true) {
            that.setData({
              issave: true
            })
          } else {
            that.setData({
              issave: false
            })
          }
        } else {
          that.setData({
            msg: res.data.msg,
            isfind: false,
          })
          wx.showToast({
            title: '没有此单词',
            icon: 'none',
            duration: 2000
          })
        }
        wx.hideLoading()
        // 判断如果没有查询到这个单词，那么就不必再查询例句
        if (res.data.status_code == 0) {
          console.log('单词id：' + res.data.data.conent_id)
          that.get_sams(res.data.data.conent_id)
        }
      },
      fail: function () {
        console.log("请求失败")
      },
      complete: function () { }
    })
    this.setData({
      ishow: false
    })
  },
  /**
   * 发音
   */
  read() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.data.pron_audio
    innerAudioContext.onPlay(() => { })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  /**
   * 例句
   * @param {} id 
   */
  get_sams(id) {
    var that = this
    wx.request({
      url: 'https://api.shanbay.com/bdc/example/?vocabulary_id=' + id,
      data: {},
      method: 'GET',
      success: function (res) {
        console.log("查询例句")
        console.log(res)
        that.setData({
          defen: [res.data.data[0], res.data.data[1], res.data.data[2]]
        })
      },
      fail: function () { },
      complete: function () { }
    })
  }
})