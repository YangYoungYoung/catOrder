// pages/secne/secne.js
var network = require("../../utils/network.js")
var common = require("../../utils/common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var shopId = wx.getStorageSync("shopId");
    console.log('shopId is:',shopId)
    // var shopId = 10041;
    let url = "api/shop/" + shopId + "/kitchen/list"

    var params = {

    }
    let method = "GET";
    wx.showLoading({
      title: '加载中...',
    })
    network.POST(url, params, method).then((res) => {
      wx.hideLoading();

      if (res.data.code == 200) {
        var msg = res.data.msg;
        if (msg == null) {
          common.showTip("暂无数据", "loading");
          return;
        } else {
          that.setData({
            msg: msg
          })
        }
      } else {
        common.showTip("暂无数据", "loading");
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


})