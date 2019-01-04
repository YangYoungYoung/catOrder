// pages/login/login.js
var network = require("../../utils/network.js")
var common = require("../../utils/common.js")
const app = getApp()
var diningTableId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    diningTableId: '',
    isOpenTable: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    // console.log("options is ", options);
    if (options != undefined && options.scene != undefined) {
      var scene = decodeURIComponent(options.scene);
      // console.log("scene is ", scene);
      diningTableId = scene;
      // console.log("diningTableId is", diningTableId);
      that.setData({
        diningTableId: diningTableId
      })
    } else {
      common.showTip('请扫码使用本程序', 'loading');
      // return;
    }
    // 登录
    wx.login({
      success: res => {
        app.globalData.code = res.code
        //取出本地存储用户信息，解决需要每次进入小程序弹框获取用户信息
        app.globalData.userInfo = wx.getStorageSync('userInfo')
        //wx.getuserinfo接口不再支持
        wx.getSetting({
          success: (res) => {
            //判断用户已经授权。不需要弹框
            if (!res.authSetting['scope.userInfo']) {
              that.setData({
                showModel: true
              })
            } else { //没有授权需要弹框
              that.setData({
                showModel: false
              })
              wx.showLoading({
                title: '加载中...'
              })
              that.getOP(app.globalData.userInfo)
            }
          },
          fail: function() {
            wx.showToast({
              title: '网络错误',
              icon: 'warn',
              duration: 1500,
            })
          }
        })
      },
      fail: function() {
        wx.showToast({
          title: '网络错误',
          icon: 'warn',
          duration: 1500,
        })
      }
    })
  },

  //获取用户信息新接口
  bindGetUserInfo: function(e) {
    //设置用户信息本地存储
    try {
      wx.setStorageSync('userInfo', e.detail.userInfo)
    } catch (e) {
      wx.showToast({
        title: '网络错误',
        icon: 'warn',
        duration: 1500,
      })
    }
    // wx.showLoading({
    //   title: '加载中...'
    // })
    let that = this
    if (e.detail.userInfo) {
      that.getOP(e.detail.userInfo)
    } else {
      wx.showModal({
        title: '提示',
        content: '小程序功能需要授权才能正确使用哦！请点击“确定”-“用户信息”再次授权',
        success: function(res) {
          if (res.confirm) {
            // console.log('用户点击确定');
            wx.openSetting({
              success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                  // that.getOP(e.detail.userInfo)
                  wx.getUserInfo({
                    success: res => {
                      that.getOP(res.userInfo)
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
  },
  getOP: function(res) { //提交用户信息 获取用户id
    let that = this;
    let userInfo = res
    app.globalData.userInfo = userInfo
    wx.showLoading({
        title: '加载中...',
      }),
      wx.request({
        url: 'https://weixin.cmdd.tech/weixin/dianCan/getOpenId',
        data: {
          code: app.globalData.code
        },
        header: { //请求头
          "Content-Type": "applciation/json"
        },
        method: "GET", //get为默认方法/POST

        success: function(res) {
          wx.hideLoading();

          // console.log("这里的结果是：" + res.data.openid); //正确返回结果
          if (res.data.openid != null) {
            wx.setStorageSync('openId', res.data.openid); // 单独存储openid
            // console.log("diningTableId is:", diningTableId);
            if (diningTableId != '' && diningTableId != undefined) {
              that.getOrder();
            } else {
              // common.showTip('请扫码使用本程序', 'loading');
              // return;
              wx.scanCode({
                onlyFromCamera: true,
                success: (res) => {
                  // console.log(res)
                  if (res) {
                    let path = res.path;
                    let dingTableId = path.slice(24);
                    // console.log("dingTableId is", dingTableId);
                    if (dingTableId != '' && dingTableId != undefined) {
                      that.setData({
                        diningTableId: dingTableId
                      })
                      that.getOrder();
                    }

                    // wx.navigateTo({
                    //   url: '../index/index',
                    //   success: function(res) {},
                    //   fail: function(res) {},
                    //   complete: function(res) {},
                    // })
                  }
                }
              })
            }
            // 只允许从相机扫码
            // wx.navigateTo({
            //   url: '../home/home',
            // })
            // wx.scanCode({
            //   onlyFromCamera: true,
            //   success: (res) => {
            //     // console.log(res)
            //     if (res.result) {
            //       wx.navigateTo({
            //         url: '../index/index',
            //         success: function(res) {},
            //         fail: function(res) {},
            //         complete: function(res) {},
            //       })
            //     }
            //   }
            // })
          }
        },
        fail: function(err) {
          common.showTip("网络错误", "loading");
        }, //请求失败
        complete: function() {} //请求完成后执行的函数
      })
  },
  //开桌
  openTable: function(shopId) {
    var that = this;
    // var shop_id = wx.getStorageSync("shopId");
    let url = "api/call-service"
    var params = {
      shop_id: shopId,
      service_type: 4,
    }
    let method = "POST";
    wx.showLoading({
      title: '加载中...',
    })
    network.POST(url, params, method).then((res) => {
      wx.hideLoading();
      if (res.data.code == 200) {
        common.showTip("稍候为您开桌", "success");
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
  //获取桌位订单
  getOrder: function() {
    var that = this;
    let url = "api/weiXin/diningTableOrder";
    var diningTableId = that.data.diningTableId;
    // var diningTableId = '2576334196415131';
    var params = {
      diningTableId: diningTableId
    }
    let method = "GET";
    wx.showLoading({
      title: '加载中...',
    })
    network.POST(url, params, method).then((res) => {
      wx.hideLoading();
      // console.log("返回值是：" + res.data.msg);
      if (res.data.code == 200) {
        if (res.data.msg) {
          var order = res.data.msg;
          // console.log("order is:", order);
          var shopId = order.shop_id;
          wx.setStorageSync("shopId", shopId);
          if (order.status == 0) {
            that.openTable(shopId);
            that.setData({
              isOpenTable: false
            })
          } else {
            let orderId = order.orderId;
            wx.setStorageSync("orderId", orderId);
            wx.redirectTo({
              url: '../home/home',
            })
          }
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
  }
})