// pages/order/order.js
var app = getApp()
var network = require("../../utils/network.js");
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // remark: "不要辣的"
    description: '',
    status: '',
    totalPrice: 0,
    quantity: 0,
    showModal: false,
    phone: '',
    pwd: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {


  },

  onShow: function() {
    let that = this
    // var order_id = "25717603011921208";
    var order_id = wx.getStorageSync('orderId');
    let url = "api/orders/" + order_id;
    var params = {
      // code: app.globalData.code
      // order_id
    }
    let method = "GET";
    wx.showLoading({
        title: '加载中...',
      }),
      network.POST(url, params, method).then((res) => {
        wx.hideLoading();
        if (res.data.msg != null || res.data.msg.length > 0) {

          // console.log("这里的结果是：" + res.data.msg[0].loi[0].p.name); //正确返回结果
          var loi = res.data.msg[0].loi;
          // var totalPrice = res.data.msg[0].real_pay;
          that.getOrderPrice();
          console.log("当前总价为：" + that.data.totalPrice);
          if (res.data.msg[0].description) {
            that.setData({
              description: res.data.msg[0].description
            })
          }
          that.setData({
            loi: loi
          })
          var quantity = 0;
          var status = '';
          for (var i = 0; i < loi.length; i++) {

            quantity += loi[i].quantity;
            switch (loi[i].status_id) {
              case 0:
                status = '待接单';
                break;
              case 1:
                status = '未开做';
                break;
              case 2:
                status = '已开做';
                break;
              case 3:
                status = '已上菜';
                break;
              case 4:
                status = '已结算';
                break;
              case 5:
                status = '已退单';
                break;
              case 6:
                status = '退菜';
                break;
            }
          }
          console.log("一共多少道菜：" + quantity);
          that.setData({
            status: status,
            quantity: quantity
          })
        } else {
          common.showTip("当前没有数据", "loading");
        }
      }).catch((errMsg) => {
        wx.hideLoading();
        console.log(errMsg); //错误提示信息
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 1500,
        })
      });
  },
  //加餐
  add: function() {
    wx.redirectTo({
      url: '../index/index'
    })
  },
  // 获取输入密码
  inputPwd: function(e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  // 获取输入的手机号
  inputPhone: function(e) {
    this.setData({
      phone: e.detail.value
    })
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
   * 会员登录对话框取消按钮点击事件
   */
  onCancel: function() {
    this.hideModal();
  },
  /**
   * 会员登录对话框确认按钮点击事件
   */
  onConfirm: function() {
    var that = this;
    var phone = that.data.phone;
    var pay_password = that.data.pwd
    if (phone == '') {
      common.showTip("手机不能为空", "loading");
      return;
    }
    if (pay_password == '') {
      common.showTip("密码不能为空", "loading");
      return;
    }
    let url = "api/weiXin/verifyMember"
    let method = "POST"
    var params = {
      phone: phone,
      pay_password: pay_password
    }
    wx.showLoading({
        title: '加载中...',
      }),
      network.POST(url, params, method).then((res) => {
        wx.hideLoading();
        console.log("会员登录返回值是：" + res.data);
        var msg = res.data.msg;
        if (res.data.code == 200) {
          common.showTip(msg, "success");
          that.hideModal();

          //是会员，获取会员价格进行支付
          that.getOrderPrice();
          if (that.data.totalPrice > 0) {
            that.payOrder();
          }
        } else {
          common.showTip(msg, "loading");
        }

      }).catch((errMsg) => {
        wx.hideLoading();
        console.log(errMsg); //错误提示信息
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 1500,
        })
      });

  },

  //是否选择会员对话框
  isMember: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '您是否为本店会员？',
      confirmText: '是',
      cancelText: '否',
      success: function(res) {

        //点击确定，弹起会员登录对话框
        if (res.confirm) {
          that.setData({
            showModal: true
          });
        } else {
          //不是会员直接支付
          that.payOrder();
          // that.payRequest();
        }
      }
    })
  },

  // 发起支付
  payOrder: function(e) {
    var that = this;
    var money = that.data.totalPrice * 100;

    var openId = wx.getStorageSync("openId")
    // var order_id = "25767795778125825";
    var order_id = wx.getStorageSync("orderId");
    console.log("当前的订单总价是：" + money);
    wx.request({
      url: 'https://weixin.cmdd.tech/weixin/getRepayId',
      data: {
        appNum: 1,
        openId: openId,
        money: 1

      },
      header: { //请求头
        "Content-Type": "applciation/json"
      },
      method: "GET", //get为默认方法/POST

      success: function(res) {
        wx.hideLoading();
        console.log("支付的返回值是：" + res.data);
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': 'MD5',
          'paySign': res.data.paySign,
          'success': function(res) {
            // console.log("调起支付成功")
            wx.hideLoading();
            wx.showToast({
              title: "支付成功",
              icon: 'succes',
              duration: 1500
            })
            that.payRequest();
          },
          'fail': function(res) {
            console.log("调起支付失败" + res.err_desc)
            wx.showToast({
              title: "支付失败",
              duration: 1500
            })
          },
          'complete': function(res) {}
        })
      },
      fail: function(err) {
        common.showTip("网络错误", "loading");
      }, //请求失败
      complete: function() {} //请求完成后执行的函数
    })
    // let url = "weixin/getRepayId"
    // var params = {
    //   openid: openId
    //   // orderId: orderid,
    //   // totalPrice: money
    // }
    // let method = "GET";

    // wx.showLoading({
    //     title: '加载中...',
    //   }),
    //   network.POST(url, params, method).then((res) => {

    //     console.log("支付的返回值是：" + res.data);
    //     wx.requestPayment({
    //       'timeStamp': res.data.timeStamp,
    //       'nonceStr': res.data.nonceStr,
    //       'package': res.data.package,
    //       'signType': 'MD5',
    //       'paySign': res.data.paySign,
    //       'success': function(res) {
    //         // console.log("调起支付成功")
    //         wx.hideLoading();
    //         wx.showToast({
    //           title: "支付成功",
    //           icon: 'succes',
    //           duration: 1500
    //         })
    //         // that.updateOrderState();
    //       },
    //       'fail': function(res) {
    //         console.log("调起支付失败" + res.data)
    //         wx.showToast({
    //           title: "支付失败",
    //           duration: 1500
    //         })
    //       },
    //       'complete': function(res) {}
    //     })
    //   }).catch((errMsg) => {
    //     wx.hideLoading();
    //     console.log(errMsg); //错误提示信息
    //     wx.showToast({
    //       title: '网络错误',
    //       icon: 'loading',
    //       duration: 1500,
    //     })
    //   });
    // that.onShow()
  },
  //支付回调接口
  payRequest: function() {
    var that = this;
    // var orderId = wx.getStorageSync("order_id");
    var order_id = "25767795778125825";
    var money = that.data.totalPrice;
    let url = "api/weiXin/paymentCallback"
    let method = "POST"
    var params = {
      description: money,
      order_id: order_id,
      service_type: "3",
    }
    wx.showLoading({
        title: '加载中...',
      }),
      network.POST(url, params, method).then((res) => {
        wx.hideLoading();
        console.log("支付回调：" + res.data);
        if (res.data.code == 200) {
          // wx.showToast({
          //   title: '感谢使用',
          //   icon: 'success',
          //   duration: 1500,
          // })
          wx.navigateTo({
            url: '../msg/msg',
          })
          // var msg = res.data.msg;
          // that.setData({
          //   totalPrice: msg
          // })
        }

      }).catch((errMsg) => {
        wx.hideLoading();
        console.log(errMsg); //错误提示信息
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 1500,
        })
      });
  },
  //获取订单价格
  getOrderPrice() {
    var that = this;
    var phone = that.data.phone;
    var orderId = wx.getStorageSync("orderId");
    // var orderId = "25767795778125825";
    let url = "/api/weiXin/payableMoney"
    let method = "GET"
    var params = {
      phone: phone,
      orderId: orderId
    }
    wx.showLoading({
        title: '加载中...',
      }),
      network.POST(url, params, method).then((res) => {
        wx.hideLoading();
        if (res.data.code == 200) {
          var msg = res.data.msg;
          that.setData({
            totalPrice: msg
          })
        }

      }).catch((errMsg) => {
        wx.hideLoading();
        console.log(errMsg); //错误提示信息
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 1500,
        })
      });
  }
})