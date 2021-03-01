//Page Object
var wxst;
import Toast from '../../dist/vant/toast/toast';
Page({
  data: {
    progress_txt: '开始匹配',
    count: 0, // 设置 计数器 初始为0
    countTimer: null,// 设置 定时器 初始为null
    value: 25,
    gradientColor: {
      '0%': '#ffd01e',
      '100%': '#ee0a24',
    },
    show: false,
    show1: false,
    problems: [],//问题集合
    ui1: true, // 匹配界面
    ui2: false, //对战动画
    ui3: false, //对战界面
    ui4: false,//结果结算界面
    message: {}, //服务器返回的信息
    playInfo: {}, //对战信息
    problem: {}, //题目
    player1: {}, //自己
    player2: {}, //对手
    problem_do_num: 1,//已经做题的数目
    isOk: false,//是否完成
    result : {} ,//结果
    iswin : false, //是否胜利
  },
  //处理服务器返回的消息
  serverMessage: function (message) {
    var message = message;
    this.setData({ message: message })
    //根据返回的状态码处理对应的情况
    var code = message.code;
    var player1 = {}
    var player2 = {}
    console.log(message)
    switch (code) {
      //匹配成功
      case 101:
        //判断自己
        if (message.data.player1.openid == this.data.openid) {
          player1 = message.data.player1;
          player2 = message.data.player2;
        } else {
          player2 = message.data.player1;
          player1 = message.data.player2;
        }
        //设置数据
        this.setData({
          //对战信息
          playInfo: message.data,
          //对战问题
          problems: message.data.Problems,
          //第一个界面隐藏
          ui1: false,
          //第二个界面展示
          ui2: false,
          //第二个界面展示
          show: true,
          //设置玩家信息
          player1: player1,
          player2: player2
        })
        //延迟关闭动画
        setTimeout(() => {
          this.setData({
            //关闭第二个界面
            show: false,
            //关闭第二个界面
            ui2: false,
            //展示第三个界面
            ui3: true,
            problem: this.data.problems[0]
          });
        }, 2000);
        break
      //更新得分
      case 102:
        if (message.data.player1.openid == this.data.openid) {
          player1 = message.data.player1;
          player2 = message.data.player2;
        } else {
          player2 = message.data.player1;
          player1 = message.data.player2;
        }
        this.setData({
          player1: player1,
          player2: player2
        })
        break;
      //得到结果
      case 103:
        this.setData({
          result : message.data
        })
        //如果胜利
        if(message.data.player1.openid == this.data.openid){
              this.setData({
                ui4 : true,
                iswin : true,
                ui3 : false
              })
        }else{
          this.setData({
            iswin : false,
            ui3 : false,
            ui4 : true,
          })
        }
      break;
    }
  },
  /**
   * 加载下一道题
   * @param {*} istimeout 
   */
  next: function () {
    //加载问题集合
    var problems = this.data.problems;
    //加载玩家
    var player1 = this.data.player1;
    //加载已经做题的数目
    var problem_do_num = this.data.problem_do_num;
    //做题数量+1
    problem_do_num = problem_do_num + 1
    //加载问题
    var problem = this.data.problem;
    //删除已经做过的题
    problems.shift();
    console.log(problems);
    console.log(problem)
    if (problems.length == 0) {
      console.log('完成')
      this.setData({
        ui3: false,//关闭对战界面
        ui4: true,//打开结算界面
        problem: problem,//更新问题
        problems: problems,//更新问题集合
        isOk: true,//完成标志
      })
    } else {
      //加载下一道题
      problem = problems[0];
      this.setData({
        problem_do_num: problem_do_num,//做题数
        problem: problem,//更新问题
        problems: problems,//更新问题集合
      })
    }
    this.update_score(player1);
  },
  /**
   * 上传分数
   */
  update_score: function (player) {
    var req = {};
    //1为上传分数数据
    var code = 1;
    //上传是否完成
    req.isOk = this.data.isOk;
    req.code = code;
    req.player = player;
    this.sendOne(req);
  }
  ,
  /**
   * 用户选择错误的答案
   */
  error_answer: function () {
    //获取当前用户
    var player1 = this.data.player1;
    //获取题的得分
    var score = this.data.problem.score;
    //减分
    if (player1.score > score) {
      player1.score = player1.score - score;
    }
    //更新数据
    this.setData({
      player1: player1
    })
  },
  right_answer: function () {
    //获取当前用户
    var player1 = this.data.player1;
    //获取题的得分
    var score = this.data.problem.score;
    //加分
    player1.score = player1.score + score;
    //更新数据
    this.setData({
      player1: player1
    })
  }
  ,
  /**
   * 用户选择事件
   * @param {*} e 
   */
  choose: function (e) {
    var choice = e.target.id;
    var answer = this.data.problem.answer + '';
    if (answer == choice) {
      console.log('回答正确')
      //调用回答正确函数
      this.right_answer();
    } else {
      console.log('回答错误')
      this.error_answer();
    }
    //加载下一道题
    this.next();
  }
  ,
  //options(Object)
  onLoad: function (options) {
       //判断用户是否登录
       if(wx.getStorageSync('openid')==null||wx.getStorageSync('openid')==''){
        Toast('请登录后操作！')
        return
      }
    var openid = wx.getStorageSync('openid');
    this.setData({
      openid: openid
    })
    //打开连接
    //本地测试使用 ws协议 ,正式上线使用 wss 协议
    var openid = this.data.openid;
    var url = 'wss://boobey.wangx1n.cn/vs/' + openid;
    wxst = wx.connectSocket({
      url: url,
      method: "GET"
    });
    //打开连接
    wxst.onOpen(res => {
      console.info('连接打开成功');
    });
    //打开连接错误
    wxst.onError(res => {
      console.info('连接识别');
      console.error(res);
    });
    //接受消息
    wxst.onMessage(res => {
      var data = res.data;
      data = JSON.parse(data);
      this.serverMessage(data);
    });
    //连接关闭
    wxst.onClose(() => {
      console.info('连接关闭');
    });

  },
/**
 * 绘图函数
 */
  drawProgressbg: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext('canvasProgressbg', this)
    ctx.setLineWidth(4);// 设置圆环的宽度
    ctx.setStrokeStyle('#20183b'); // 设置圆环的颜色
    ctx.setLineCap('round') // 设置圆环端点的形状
    ctx.beginPath();//开始一个新的路径
    ctx.arc(110, 110, 100, 0, 2 * Math.PI, false);
    //设置一个原点(110,110)，半径为100的圆的路径到当前路径
    ctx.stroke();//对当前路径进行描边
    ctx.draw();
  },
  drawCircle: function (step) {
    var context = wx.createCanvasContext('canvasProgress', this);
    // 设置渐变
    var gradient = context.createLinearGradient(200, 100, 100, 200);
    gradient.addColorStop("0", "#2661DD");
    gradient.addColorStop("0.5", "#40ED94");
    gradient.addColorStop("1.0", "#5956CC");
    context.setLineWidth(10);
    context.setStrokeStyle(gradient);
    context.setLineCap('round')
    context.beginPath();
    // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(110, 110, 100, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    context.stroke();
    context.draw()
  },
  countInterval: function () {
    // 设置倒计时 定时器 每100毫秒执行一次，计数器count+1 ,耗时6秒绘一圈
    this.countTimer = setInterval(() => {
      if (this.data.count <= 60) {
        /* 绘制彩色圆环进度条  
        注意此处 传参 step 取值范围是0到2，
        所以 计数器 最大值 60 对应 2 做处理，计数器count=60的时候step=2
        */
        this.drawCircle(this.data.count / (60 / 2))
        this.data.count++;
        //循环绘图
        if (this.data.count == 60) {
          this.data.count = 0
        }
      } else {
        this.setData({
          progress_txt: "匹配成功"
        });
        clearInterval(this.countTimer);
      }
    }, 100)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.drawProgressbg();
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
    this.closeOne();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.closeOne();
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

  },//创建连接
  startConnect: function () {

  },
  /**
   * 发送用户信息
   */
  sendPlayerInfo: function () {
       //判断用户是否登录
       if(wx.getStorageSync('openid')==null||wx.getStorageSync('openid')==''){
        Toast('请登录后操作！')
        return
      }
      if(this.data.progress_txt == '正在匹配中...'){
          return
      }
    this.setData({
        progress_txt : '正在匹配中...'
    })
    this.drawCircle(2);
    this.countInterval()
    var userInfo = wx.getStorageSync('userInfo');
    userInfo.score = 0;
    userInfo.dictionary = 1;
    userInfo.openid = this.data.openid;
    userInfo.isPk = false;
    var info = {};
    info.userInfo = userInfo;
    info.code = 0;
    this.sendOne(info);
  }
  ,
  //发送内容
  sendOne: function (data) {
    var content = JSON.stringify(data);
    console.log(content)
    if (wxst.readyState == wxst.OPEN) {
      wxst.send({
        data: content,
        success: () => {
          console.info('客户端发送成功');
        }
      });
    } else {
      console.error('连接已经关闭');
    }
  },
  //关闭连接
  closeOne: function () {
    wxst.close();
  },
});