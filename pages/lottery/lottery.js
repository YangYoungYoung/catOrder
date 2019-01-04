// pages/lottery/lottery.js
var network = require("../../utils/network.js")
var common = require("../../utils/common.js")
var levels = 3;
//获取应用实例
var app = getApp()
Page({
  data: {
    circleList: [], //圆点数组
    awardList: [], //奖品数组
    colorCircleFirst: '#FFDF2F', //圆点颜色1
    colorCircleSecond: '#FE4D32', //圆点颜色2
    colorAwardDefault: '#e1024f', //奖品默认颜色
    colorAwardSelect: '#9b083b', //奖品选中颜色
    indexSelect: 0, //被选中的奖品index
    isRunning: false, //是否正在抽奖
    prize: '',
    phone: '',
    imageAward: [
      '../images/canyu.png',
      '../images/first_prize.png',
      '../images/canyu.png',
      '../images/second_prize.png',
      '../images/canyu.png',
      '../images/third_prize.png',
      '../images/canyu.png',
      '../images/forth_prize.png',

    ], //奖品图片数组
  },

  /**
   * 弹窗
   */
  showDialogBtn: function() {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function() {},
  /**
   * 隐藏模态对话框
   */
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function() {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function() {

    let that = this;
    var phone = that.data.phone;
    // console.log("手机号长度是" + phone.length);
    if (phone.length != 11) {
      common.showTip("请输入正确手机号", "loading");
      return;
    }
    var prize = that.data.prize;
    let shopId = wx.getStorageSync('shopId');
    let orderId = wx.getStorageSync('orderId');
    let url = "api/weiXin/lotteryLog"
    var params = {
      shop_id: shopId,
      order_id: orderId,
      phone: phone,
      lottery_detail: prize
    }
    let method = "PUT";

    wx.showLoading({
        title: '加载中...',
      }),
      network.POST(url, params, method).then((res) => {
        wx.hideLoading();
        // console.log("这里的结果是：" + res.data); //正确返回结果
        if (res.data.code == 200) {
          wx.setStorageSync("phone", phone);
          wx.showToast({
            title: '请去前台领奖',
            icon: 'success',
            duration: 2000,
          })
        }
      }).catch((errMsg) => {
        wx.hideLoading();
        // console.log(errMsg); //错误提示信息
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 1500,
        })
      });
    this.hideModal();
  },
  //获取手机号
  inputChange: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  onLoad: function() {
    var _this = this;
    //圆点设置
    var leftCircle = 7.5;
    var topCircle = 7.5;
    var circleList = [];
    for (var i = 0; i < 24; i++) {
      if (i == 0) {
        topCircle = 15;
        leftCircle = 15;
      } else if (i < 6) {
        topCircle = 7.5;
        leftCircle = leftCircle + 102.5;
      } else if (i == 6) {
        topCircle = 15
        leftCircle = 620;
      } else if (i < 12) {
        topCircle = topCircle + 94;
        leftCircle = 620;
      } else if (i == 12) {
        topCircle = 565;
        leftCircle = 620;
      } else if (i < 18) {
        topCircle = 570;
        leftCircle = leftCircle - 102.5;
      } else if (i == 18) {
        topCircle = 565;
        leftCircle = 15;
      } else if (i < 24) {
        topCircle = topCircle - 94;
        leftCircle = 7.5;
      } else {
        return
      }
      circleList.push({
        topCircle: topCircle,
        leftCircle: leftCircle
      });
    }
    this.setData({
      circleList: circleList
    })
    //圆点闪烁
    setInterval(function() {
      if (_this.data.colorCircleFirst == '#FFDF2F') {
        _this.setData({
          colorCircleFirst: '#FE4D32',
          colorCircleSecond: '#FFDF2F',
        })
      } else {
        _this.setData({
          colorCircleFirst: '#FFDF2F',
          colorCircleSecond: '#FE4D32',
        })
      }
    }, 500) //设置圆点闪烁的效果
    //奖品item设置
    var awardList = [];
    //间距,怎么顺眼怎么设置吧.
    var topAward = 25;
    var leftAward = 25;
    for (var j = 0; j < 8; j++) {
      if (j == 0) {
        topAward = 25;
        leftAward = 25;
      } else if (j < 3) {
        topAward = topAward;
        //166.6666是宽.15是间距.下同
        leftAward = leftAward + 166.6666 + 15;
      } else if (j < 5) {
        leftAward = leftAward;
        //150是高,15是间距,下同
        topAward = topAward + 150 + 15;
      } else if (j < 7) {
        leftAward = leftAward - 166.6666 - 15;
        topAward = topAward;
      } else if (j < 8) {
        leftAward = leftAward;
        topAward = topAward - 150 - 15;
      }
      var imageAward = this.data.imageAward[j];
      awardList.push({
        topAward: topAward,
        leftAward: leftAward,
        imageAward: imageAward
      });
    }
    this.setData({
      awardList: awardList
    })
  },
  onShow: function() {
    //获取抽奖信息
    let that = this;
    let shopId = wx.getStorageSync('shopId');
    let orderId = wx.getStorageSync('orderId');
    // var orderId = "25767795778125825"
    let url = "api/weiXin/lottery"
    var params = {
      shopId: shopId,
    }
    let method = "GET";
    let header = "";
    wx.showLoading({
        title: '加载中...',
      }),
      network.POST(url, params, method, header).then((res) => {
        wx.hideLoading();
        // console.log("这里的结果是：" + res.data); //正确返回结果
        if (res.data.code == 200) {
          if (res.data.msg != null) {
            levels = res.data.msg.levels;
            var prize = res.data.msg.prize;
            // console.log("当前的数字是：" + levels);
            if (levels != 0) {
              levels += levels - 1;
            }
            // console.log("当前的levels是：" + levels);
            that.setData({
              prize: prize
            })
          } 
        }
      }).catch((errMsg) => {
        wx.hideLoading();
        // console.log(errMsg); //错误提示信息
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 1500,
        })
      });
  },
  //开始抽奖
  startGame: function() {
    if (this.data.isRunning) return
    this.setData({
      isRunning: true
    })
    var _this = this;
    var indexSelect = 0;
    var i = 0;
    var timer = setInterval(function() {
      indexSelect++;
      // console.log("当前是：" + indexSelect);
      //这里我只是简单粗暴用y=30*x+200函数做的处理.可根据自己的需求改变转盘速度
      i += 60;
      if (i > 1000 && indexSelect == levels) {
        //去除循环
        clearInterval(timer)
        //获奖提示
        if (!indexSelect % 2) {
          wx.showModal({
            title: '很遗憾',
            content: '您没有中奖',
            showCancel: false, //去掉取消按钮
            success: function(res) {
              if (res.confirm) {
                _this.setData({
                  isRunning: false
                })
              }
            }
          })
        } else {
          _this.showDialogBtn();
        }
      }
      indexSelect = indexSelect % 8;
      _this.setData({
        indexSelect: indexSelect
      })
    }, (100 + i))
  },
  toHome:function(){
    wx.redirectTo({
      url: '../home/home',
    })
  },
  toQuery:function(){
    wx.redirectTo({
      url: '../query/query',
    })
  }
})