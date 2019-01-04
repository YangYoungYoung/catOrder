// pages/query/query.js
var network = require("../../utils/network.js")
var common = require("../../utils/common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    detail: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
  },
  //获取手机号
  inputChange: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  query: function() {
    var that = this;
    var shopId = wx.getStorageSync("shopId");
    let url = "api/weiXin/lotteryDetail"
    var phone = that.data.phone;
    if(phone.length<11){
      common.showTip("请输入正确手机号","loading");
      return;
    }
    var params = {
      shopId: shopId,
      phone: phone
    }
    let method = "GET";
    wx.showLoading({
      title: '加载中...',
    })
    network.POST(url, params, method).then((res) => {
      wx.hideLoading();

      if (res.data.code == 200) {
          var msg = res.data.msg;
        if(msg.length<1){
          common.showTip("暂无数据","loading");
          return;
        }
        if (res.data.msg.is_cash == null) {
          var detail = '';
          for(var i=0;i<msg.length;i++){
            if(msg[i].is_cash==null){
             detail = msg[i].lottery_detail;
            }
          }

          that.setData({
            detail: detail
          })
        }
      }

    }).catch((errMsg) => {
      wx.hideLoading();
      wx.showToast({
        title: '网络错误',
        icon: 'loading',
        duration: 1500,
      })
    });
  }
})