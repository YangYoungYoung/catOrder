// pages/login/login.js
var network = require("../../utils/network.js")
var common = require("../../utils/common.js")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
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
      url: 'https://weixin.cmdd.tech//weixin/dianCan/getOpenId',
        data: {
          code: app.globalData.code
        },
        header: { //请求头
          "Content-Type": "applciation/json"
        },
        method: "GET", //get为默认方法/POST

        success: function(res) {
          wx.hideLoading();
          // console.log(res.data); //res.data相当于ajax里面的data,为后台返回的数据
          // console.log("这里的结果是：" + res.data.openid); //正确返回结果
          if (res.data.openid != null) {
            wx.setStorageSync('openId', res.data.openid); // 单独存储openid
            // 只允许从相机扫码
            wx.navigateTo({
              url: '../home/home',
            })
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
          common.showTip("网络错误","loading");
        }, //请求失败
        complete: function() {} //请求完成后执行的函数
      })

    // let that = this
    // let userInfo = res
    // app.globalData.userInfo = userInfo
    // let url = "weixin/getOpenId"
    // console.log("当前的code值是：" + app.globalData.code);
    // var params = {
    //   code: app.globalData.code
    // }
    // let method = "GET";
    // let header = "";
    // wx.showLoading({
    //     title: '加载中...',
    //   }),
    //   network.POST(url, params, method, header).then((res) => {
    //     wx.hideLoading();
    //     console.log("这里的结果是：" + res.data.openid); //正确返回结果
    //     wx.setStorageSync('openid', res.data.openid); // 单独存储openid
    //     if (res.data.openid != null) {
    //       // 只允许从相机扫码
    //       wx.navigateTo({
    //         url: '../canvas/canvas',
    //       })
    //       // wx.scanCode({
    //       //   onlyFromCamera: true,
    //       //   success: (res) => {
    //       //     // console.log(res)
    //       //     if (res.result) {
    //       //       wx.navigateTo({
    //       //         url: '../index/index',
    //       //         success: function(res) {},
    //       //         fail: function(res) {},
    //       //         complete: function(res) {},
    //       //       })
    //       //     }
    //       //   }
    //       // })
    //     }

    //   }).catch((errMsg) => {
    //     wx.hideLoading();
    //     console.log(errMsg); //错误提示信息
    //     wx.showToast({
    //       title: '网络错误',
    //       icon: 'loading',
    //       duration: 1500,
    //     })
    //   });
  }
})