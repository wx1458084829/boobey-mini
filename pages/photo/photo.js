
let cropper = null;

Page({
  data: {
    access_token: '',//百度accesstoken
    translation_a:'',//翻译的原始内容
    translation_b:'',//翻译好的内容
    show: true,//是否展示
  },
  //////////////  init /////////////////////////
  onLoad: function (options) {
    //获取百度accesstoken
    var that = this;
    //获取accesskey
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token', 
      method: 'GET',
      data: {
        grant_type: 'client_credentials',
        client_id: 'njzwOOxGQcBD0ug29E4bOiIy',
        client_secret: '18dwNltCmdpoZNp1MUu17XTbbNhAWxtY'
      },
      success(res) {
        that.setData({
          access_token: res.data.access_token
        })
      }
    })
    var that = this;
    var imagePath = '';
    wx.chooseImage({
      count: 1,
      // sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        imagePath = res.tempFilePaths;
        that.photoschoice(imagePath[0])
      }
    })
  },
  ////////  cancel ///////////////////
  fnCancel: function () {
    console.log('cancel')
    wx.switchTab({
      url: '/pages/search/search',
      success: (result) => {
      },
      fail: () => { },
      complete: () => { }
    });
    //todo something
  },
  photoschoice: function (imagePath) {
    cropper = this.selectComponent('#cropper');
    console.log(imagePath)
    cropper.fnInit({
      imagePath: imagePath,       //*必填
      debug: true,                        //可选。是否启用调试，默认值为false。true：打印过程日志；false：关闭过程日志
      outputFileType: 'jpg',              //可选。目标文件的类型。默认值为jpg，jpg：输出jpg格式图片；png：输出png格式图片
      quality: 1,                         //可选。图片的质量。默认值为1，即最高质量。目前仅对 jpg 有效。取值范围为 (0, 1]，不在范围内时当作 1.0 处理。
      //  aspectRatio: 1.25,                  //可选。裁剪的宽高比，默认null，即不限制剪裁宽高比。aspectRatio需大于0
      // aspectRatio: null,   
      minBoxWidthRatio: 0.05,              //可选。最小剪裁尺寸与原图尺寸的比率，默认0.15，即宽度最小剪裁到原图的0.15宽。
      minBoxHeightRatio: 0.05,             //可选。同minBoxWidthRatio，当设置aspectRatio时，minBoxHeight值设置无效。minBoxHeight值由minBoxWidth 和 aspectRatio自动计算得到。
      initialBoxWidthRatio: 0.6,          //可选。剪裁框初始大小比率。默认值0.6，即剪裁框默认宽度为图片宽度的0.6倍。
      initialBoxHeightRatio: 0.6          //可选。同initialBoxWidthRatio，当设置aspectRatio时，initialBoxHeightRatio值设置无效。initialBoxHeightRatio值由initialBoxWidthRatio 和 aspectRatio自动计算得到。
    });
  }
  ,
  ////////// do crop ////////////////////
  fnSubmit: function () {
    var that = this;
    console.log('submit')
    //do crop
    cropper.fnCrop({
      //剪裁成功的回调
      success: function (res) {
        console.log(res)
        //生成文件的临时路径
        console.log(res.tempFilePath);
        //调用识别
        that.gettext(res.tempFilePath)

        // wx.previewImage({
        //   urls: [res.tempFilePath],
        // })

      },
      //剪裁失败的回调
      fail: function (res) {
        console.log(res);
      },

      //剪裁结束的回调
      complete: function () {
        //complete
      }
    });
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
        console.log(res.data)
        var translation_a = res.data.trans_result[0].src;
        var translation_b = res.data.trans_result[0].dst;
        wx.setStorageSync('translation_a', translation_a);
        wx.setStorageSync('translation_b', translation_b);
        that.setData({
          show :false
        })
        wx.switchTab({
          url: '/pages/search/search'
        });
        console.log(res.data)
      }
    })
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
        var words = '';
        //遍历得到的数组结果
        for(var i = 0;i<res.data.words_result.length;i++){
          words = words+res.data.words_result[i].words
        }
        //调用翻译接口
        that.translation(words)
        console.log(res)
      }
    })
  }
})
