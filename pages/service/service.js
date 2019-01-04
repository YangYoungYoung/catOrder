// pages/service/service.js
var network = require("../../utils/network.js");
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: 10,
    description: '',
    tags: [{
        name: '点餐',
        checked: false,
        color: 'green',
        id: 0
      },
      {
        name: '茶水',
        checked: false,
        color: 'blue',
        id: 1
      },
      {
        name: '餐具',
        checked: false,
        color: 'yellow',
        id: 2
      },
      {
        name: '结账',
        checked: false,
        color: 'red',
        id: 3
      },
      {
        name: '其他',
        checked: false,
        color: 'green',
        id: 4
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  //获取当前输入框的信息
  bindTextAreaBlur: function(e) {
    console.log(e.detail.value);
    var description = e.detail.value;
    this.setData({
      description: description
    })
  },
  bindInput: function(e) {
    var description = e.detail.value;
    this.setData({
      description: description
    })
  },
  onChange(event) {
    var that = this;
    const detail = event.detail;

    var remark = that.data.tags[event.detail.name].name;
    var number = that.data.tags[event.detail.name].id;
    var text = 0;
    var checked = false;
    var tags = that.data.tags;
    //展示的为当前状态，未更改状态
    if (this.data.tags[event.detail.name].checked) {
      //点击取消备注
      checked = false;
      text = 10;

    } else {
      //点击增加备注
      checked = true;
      text = number;
    }
    for (var i = 0; i < tags.length; i++) {
      that.setData({
        text: text,
        ['tags[' + i + '].checked']: false
      })
    }
    console.log("当前点击是：" + text);
    that.setData({
      text: text,
      ['tags[' + event.detail.name + '].checked']: checked
    })
  },
  submit: function() {
    var that = this;
    that.setData({
      focus: false
    })
    var service_type = Number(that.data.text);
    var order_id = wx.getStorageSync("orderId");
    var shop_id = wx.getStorageSync("shopId");
    var description = that.data.description;
    // console.log("当前order_id：" + order_id);
    // console.log("当前意见：" + description);
    if (service_type == null || service_type < 0 || service_type > 4) {
      common.showTip('请选择服务类型', 'loading');
      return;
    }
    let url = "api/call-service"
    var params = {
      // code: app.globalData.code
      shop_id: shop_id,
      order_id: order_id,
      service_type: service_type,
      description: description
    }
    let method = "POST";
    wx.showLoading({
      title: '加载中...',
    })
    network.POST(url, params, method).then((res) => {
      wx.hideLoading();
      if (res.data.code == 200) {
        common.showTip("马上为您服务", "success");
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