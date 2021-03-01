//Page Object
var wxCharts = require('../../utils/wxcharts.js');
//录音控制
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
Page({
  data: {
    today_task: [],//今日任务单词详细
    day_task: 0,//今日任务量个数
    pron: {}, //发音
    content: '',//单词
    definition: '',//翻译
    pron_audio: {},//发音
    now_word: {},//目前的单词
    today_detail: { renshi: 0, mohu: 0 },//今日单词记忆统计
    all_detail: [],//所有单词记忆统计 
    progress: 0, //进度条
    isfinish: false,//是否完成今天的任务
    renshi: 0,//认识
    mohu: 0,//模糊
    isexplain: false, //例句
    iscontent: false, //翻译内容
    isnext: false,//下一个按钮
    isvoice: true, //是否开启语音学习
    voice_show: false,
    is_pic_show: false,
    getvoice_word: '',//识别的单词
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
        'dev_pid': 1737
      },
      method: 'POST',
      success: (res) => {
        if (res.data.result[0] == this.data.content) {
          //搜索下一个单词，并更新变量展示
          this.search(this.data.now_word.word);
          this.setData({
            iscontent: false, //关闭内容
            isexplain: false,//关闭解释
            isnext: false
          })
        }else{
          wx.showToast({
            title: '请重新发音',
            icon: 'none',
            image: '',
            duration: 1500,
            mask: false,
            success: (result)=>{
              
            },
            fail: ()=>{},
            complete: ()=>{}
          });
        }
        that.setData({
          getvoice_word: res.data.result[0]
        })
        console.log(res)
      }
    })
  },
  /**
   * 说话关闭
   */
  onClose() {
    this.setData({
      voice_show: false,
      is_pic_show: true,
    });
    this.stoptVoice();
  },
  //语音点击事件
  saybindtap: function () {
    this.setData({
      voice_show: true,
      is_pic_show: false,
      voice_content: '请按住发音',
    });
  }
  ,
  /**
      * 说话开启
      */
  ontap() {
    this.setData({
      show: true,
      is_pic_show: true,
      voice_content: '正在发音..',
    });
    this.startVoice();
  },
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
        }
      })
      console.log('停止录音', res.tempFilePath)
    })
    setTimeout(function () {
      that.getVoice()
    }, 800);
  },


  //通过扇贝提供的api搜索该函数
  search: function (word) {
    this.setData({
      content: word
    })
    var that = this;
    wx.request({
      url: 'https://api.shanbay.com/bdc/search/?word=' + word,
      data: {},
      method: 'GET',
      success: function (res) {
        that.setData({
          pron: res.data.data.pronunciations,
          pron_audio: res.data.data.audio_addresses,
          definition: res.data.data.definition,
        })
        //自动发音
        var innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.autoplay = true
        innerAudioContext.src = res.data.data.audio_addresses.us[0]
        innerAudioContext.onPlay(() => { })
        innerAudioContext.onError((res) => {
          console.log(res.errMsg)
          console.log(res.errCode)
        })


        //搜索例句
        var id = res.data.data.conent_id
        that.liju(id)
      },
      fail: function () { },
      complete: function () { }
    })
  },
  //触发例句函数
  liju(id) {
    var that = this
    wx.request({
      url: 'https://api.shanbay.com/bdc/example/?vocabulary_id=' + id,
      data: {},
      method: 'GET',
      success: function (res) {
        console.log(res)
        that.setData({
          defen: [res.data.data[0], res.data.data[1], res.data.data[3], res.data.data[4]]
        })
        that.setData({
          bottomline: res.data.data[0].translation
        })
      },
      fail: function () { },
      complete: function () { }
    })
  },
  //单词发音触发函数
  read: function (e) {
    var innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = e.target.id
    console.log(e.target.id)
    innerAudioContext.onPlay(() => { })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  //校验记忆的单词，加载进度条
  check_datail() {
    var d_task = this.data.day_task;
    var t_task = this.data.today_task;
    var progre = this.data.progress;
    var ok = 0;
    var unok = 0;
    for (var i = 0; i < d_task; i++) {
      if (t_task[i].ease <= 0.4) {
        ok = ok + 1;
      } else {
        unok = unok + 1;
      }
    }
    progre = ok / d_task * 100;
    this.setData({
      progress: progre
    })
    wx.setStorageSync("progress", this.data.progress)
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
  //排序任务
  sort_word: function (word) {
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
    return ok;
  },
  /**
   * 点击下一个按钮
   */
  mynext: function () {
     if(this.data.isvoice == true){
        this.saybindtap();
     }else{
 //搜索下一个单词，并更新变量展示
 this.search(this.data.now_word.word);
 this.setData({
   iscontent: false, //关闭内容
   isexplain: false,//关闭解释
   isnext: false
 })

     }
  },
  //用户点击认识
  next: function () {
    //今日任务的单词
    var t_task = this.data.today_task;
    //当前单词
    var n_word = this.data.now_word;
    //权值减少
    n_word.ease = n_word.ease - 0.2;
    //如果记忆合格天数加一
    if (n_word.ease < 0.4) {
      n_word.day = n_word.day + 1;
    }
    //统计单词情况
    if (n_word.flag == false) {
      var renshi = this.data.renshi + 1;
      this.setData({
        renshi: renshi
      })
      //存储
      wx.setStorageSync('renshi', renshi)
      n_word.flag = true;
    }
    //删除第一个元素
    t_task.shift()
    //把已经记忆的元素添加到最后面
    t_task.push(n_word)
    //排序，把权值高的放在前面
    t_task = this.sort_word(t_task)
    //更新今日任务单词和当前单词数据
    this.setData({
      today_task: t_task,
      now_word: t_task[0],
      iscontent: true, //展示内容
      isexplain: false,//关闭解释
      isnext: true
    })
    //判断是否完成
    if (this.isok(t_task) == true) {
      console.log('完成')
      this.complate();
      //设置完成标志
      this.setData({
        isfinish: true
      })
      //存储完成标志
      wx.setStorageSync('isfinish', true);
    }
    //更新进度条
    this.check_datail();
    //存储当前单词
    wx.setStorageSync('now_word', n_word);
    //存储更新学习进度
    wx.setStorageSync('today_task', t_task);
  },
  /**
   * 点击模糊函数
   */
  mohu: function () {
    //今日任务单词
    var t_task = this.data.today_task
    //当前单词
    var n_word = this.data.now_word;
    //权重增加
    n_word.ease = n_word.ease + 0.2;
    //统计单词情况
    if (n_word.flag == false) {
      var mohu = this.data.mohu + 1;
      this.setData({
        mohu: mohu
      })
      n_word.flag = true;
      wx.setStorageSync('mohu', mohu)
    }

    //删除当前单词
    t_task.shift()
    //把当前单词放到末尾
    t_task.push(n_word)
    this.setData({
      //更新当前单词和学习进度
      today_task: t_task,
      now_word: t_task[0],
      iscontent: true, //展示内容
      isexplain: true,//开启解释
      isnext: true
    })
    //校验进度条
    this.check_datail();
    //当前单词存储
    wx.setStorageSync('now_word', n_word);
    //存储学习进度
    wx.setStorageSync('today_task', t_task);
  },
  /**
   * 完成绘图
   */
  complate: function () {
    //绘制当天学习细节扇行图
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    //调用画布绘图
    var pieChart = new wxCharts({
      animation: true,
      canvasId: 'pieCanvas',
      type: 'pie',
      series: [{
        name: '认识',
        data: this.data.renshi,
      }, {
        name: '模糊',
        data: this.data.mohu,
      }],
      width: windowWidth,
      height: 220,
      dataLabel: true,
    });
    //添加单词数据
    var all_detail = wx.getStorageSync('all_detail');
    var today_detail = {}
    today_detail.mohu = this.data.mohu
    today_detail.renshi = this.data.renshi

    //判断不为为空
    if (all_detail != null && all_detail != {} && all_detail != '' && all_detail != []) {
      //判断在所以数据中不存在
      if (all_detail[0].renshi != this.data.renshi || all_detail[0].mohu != this.data.mohu) {
        //添加总记录
        all_detail.unshift(today_detail)
        wx.setStorageSync('all_detail', all_detail);
        wx.setStorageSync('today_detail', today_detail);
      }
    } else {
      all_detail = []
      //添加总记录
      all_detail.unshift(today_detail)
      wx.setStorageSync('all_detail', all_detail);
      wx.setStorageSync('today_detail', today_detail);
    }
  },
  onLoad: function (options) {
    //获取百度accesstoken
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
      }
    })
  },
  onReady: function () {

  },
  onShow: function () {
    var renshi = wx.getStorageSync('renshi')
    if (!renshi) {
      renshi = 0;
    }
    var mohu = wx.getStorageSync('mohu')
    if (!mohu) {
      mohu = 0;
    }
    var isfinish = wx.getStorageSync('isfinish')
    var day_task = wx.getStorageSync('day_task')
    var today_task = wx.getStorageSync('today_task');
    this.setData({
      isfinish: isfinish,
      day_task: day_task,
      now_word: today_task[0],
      today_task: today_task,
      renshi: renshi,
      mohu: mohu
    })
    if (isfinish == true) {
      this.complate();
    }
    //校验进度条
    this.check_datail();
    //加载第一个单词
    this.search(this.data.now_word.word);
    //是否开启语音学习
    var isvoice = wx.getStorageSync('isvoice');
    this.setData({
      isvoice: isvoice
    })
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  },
  onPageScroll: function () {

  },
  //item(index,pagePath,text)
  onTabItemTap: function (item) {

  }
});