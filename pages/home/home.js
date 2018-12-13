// pages/home/home.js
var common = require("../../utils/common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true, //是否出现焦点  
    autoplay: true, //是否自动播放轮播图  
    interval: 4000, //时间间隔
    duration: 1000, //延时时间
    hiddenModal: true,
    circular: true,
    orderPrice: 49,
    showModal: true,
    data:{shop:213,parentId:123},
    banner: [{
      path: "../images/lbt1.png"
    }, {
      path: "../images/lbt2.png"
    }],
    menu: [{
        name: "开始点餐",
        image: "../images/order_food.png"
      },
      {
        name: "我的订单",
        image: "../images/schedule.png"
      },
      {
        name: "呼叫服务",
        image: "../images/phone.png"
      },
      {
        name: "店内风采",
        image: "../images/back_home.png"
      },
      {
        name: "奖品查询",
        image: "../images/gift.png"
      },

      {
        name: "意见反馈",
        image: "../images/opinion.png"
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  //隐藏活动页面
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },
  navigateToFunction: function(e) {
    var index = e.currentTarget.dataset.index;
    // console.log('点击的是第几个？？' + index);
    if (index == 0) {
      wx.navigateTo({
        url: '../index/index',
      })
    } else if (index == 1) {
      wx.navigateTo({
        url: '../order/order',
      })
    }
    else if (index == 2) {
      wx.navigateTo({
        url: '../service/service',
      })
    } 
     else if (index == 3) {
      wx.navigateTo({
        url: '../secne/secne',
      })
    } 
    else if (index == 4) {
      wx.navigateTo({
        url: '../query/query',
      })
    }
    else if (index == 5) {
      wx.navigateTo({
        url: '../remark/remark',
      })
    } else {
      common.showTip("敬请期待", "loading");
    }
  },
  toShop:function(){
    var that = this;
    var openId = wx.getStorageSync("orderId");
    var shopId = wx.getStorageSync('shopId');
    console.log("当前的openId是"+openId);
    wx.navigateToMiniProgram({
      appId: 'wx5ebdd98c258f01a0',
      path: 'pages/login/login?dianCanOpenId=' + openId+'&shopId='+shopId,
      extraData: {
        foo: 'bar'
      },
      envVersion: 'develop',
      success(res) {
        // 打开成功
        
      }
    })
  },
  //获取活动页信息
  getActivityContent(){
    var that = this;
    let url = "api/weiXin/diningTableOrder";
    // var diningTableId = that.data.diningTableId;
    var shopId = wx.getStorageSync('shopId');
    console.log('shopId is:',shopId);
    var params = {
      shopId: shopId
    }
    let method = "GET";
    wx.showLoading({
      title: '加载中...',
    })
    network.POST(url, params, method).then((res) => {
      wx.hideLoading();
      console.log("返回值是：" + res.data.msg);
      if (res.data.code == 200) {
        // if (res.data.msg) {
        //   var order = res.data.msg.order;
        //   console.log("order is:", order);
        //   var order_id = order.id;
        //   wx.setStorageSync("orderId", order_id);
        //   console.log('order_id is', order_id);
        //   var shopId = order.shop_id;
        //   wx.setStorageSync("shopId", shopId);
        //   console.log('shopId is:', shopId);
        //   wx.redirectTo({
        //     url: '../home/home',
        //   })
        // }
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