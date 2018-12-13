// pages/goods/goods.js

var network = require("../../utils/network.js")
var common = require("../../utils/common.js")
Page({
  data: {
    // goods: [],
    goods: [],
    toView: '0',
    scrollTop: 100,
    foodCounts: 0,
    totalPrice: 0, // 总价格
    totalCount: 0, // 总商品数
    carArray: [],
    minPrice: 0, //起送價格
    // fold: true,
  },
  selectMenu: function(e) {
    var index = e.currentTarget.dataset.itemIndex;
    this.setData({
      toView: 'order' + index.toString()
    })
    console.log(this.data.toView);
  },
  //移除商品
  decreaseCart: function(e) {
    var index = e.currentTarget.dataset.itemIndex;
    var parentIndex = e.currentTarget.dataset.parentindex;
    this.data.goods[parentIndex].productList[index].count--
      var num = this.data.goods[parentIndex].productList[index].count;
    var mark = 'a' + index + 'b' + parentIndex;
    var price = this.data.goods[parentIndex].productList[index].unit_price;
    var name = this.data.goods[parentIndex].productList[index].name;
    var obj = {
      price: price,
      number: num,
      mark: mark,
      name: name,
      index: index,
      parentIndex: parentIndex
    };
    var carArray1 = this.data.carArray.filter(item => item.mark != mark);
    // carArray1.push(obj);
    console.log(carArray1);
    this.setData({
      carArray: carArray1,
      goods: this.data.goods
    })

    wx.setStorage({
      key: "cartResult",
      data: carArray1
    })
    this.calTotalPrice()

    //关闭弹起
    // var count1 = 0
    // for (let i = 0; i < carArray1.length; i++) {
    //   if (carArray1[i].num == 0) {
    //     count1++;
    //   }
    // }
    //console.log(count1)
    // if (count1 == carArray1.length) {
    //   if (num == 0) {
    //     this.setData({
    //       cartShow: 'none'
    //     })
    //   }
    // }
  },
  // decreaseShopCart: function (e) {
  //   console.log('1');
  //   this.decreaseCart(e);
  // },
  //添加到购物车
  addCart(e) {
    var index = e.currentTarget.dataset.itemIndex;
    var parentIndex = e.currentTarget.dataset.parentindex;

    this.data.goods[parentIndex].productList[index].count++;

    var mark = 'a' + index + 'b' + parentIndex;
    // console.log("mark;" + mark);
    var price = this.data.goods[parentIndex].productList[index].unit_price;
    var num = this.data.goods[parentIndex].productList[index].count;

    var name = this.data.goods[parentIndex].productList[index].name;
    var category_id = this.data.goods[parentIndex].productList[index].category_id;
    var description = this.data.goods[parentIndex].productList[index].description;
    var product_id = this.data.goods[parentIndex].productList[index].id;
    var detailArray = {
      product_id: product_id,
      category_id: category_id,
      description: description,
      price: price,
      number: num,
      mark: mark,
      name: name,
      index: index,
      active: true,
      parentIndex: parentIndex,

    };
    var carArray1 = this.data.carArray.filter(item => item.mark != mark)
    carArray1.push(detailArray)
    console.log(carArray1);
    this.setData({
      carArray: carArray1,
      goods: this.data.goods
    })

    wx.setStorage({
      key: "cartResult",
      data: carArray1
    })
    // oldcartResult = wx.getStorageSync('cartResult');
    // if (!oldcartResult) {
    //   carArray1.push();
    //   wx.setStorage({
    //     key: "cartResult",
    //     data: cartResult
    //   })
    // } else {
    //   carArray1.push(detailArray);
    //   wx.setStorage({
    //     key: "cartResult",
    //     data: oldcartResult
    //   })
    // }

    this.calTotalPrice();

  },

  //计算总价
  calTotalPrice: function() {
    var carArray = this.data.carArray;
    var totalPrice = 0;
    var totalCount = 0;
    
    if (carArray.length > 0) {
      for (var i = 0; i < carArray.length; i++) {
        console.log("=========" + carArray[i].number);
        totalPrice += carArray[i].price * carArray[i].number;
        totalCount += parseInt(carArray[i].number);  
      }
    }
    this.setData({
      totalPrice: totalPrice,
      totalCount: totalCount,
    });
  },

  //結算
  pay() {
    if (this.data.totalPrice < this.data.minPrice) {
      return;
    }
    // window.alert('支付' + this.totalPrice + '元');
    //确认支付逻辑
    var resultType = "success";
    wx.redirectTo({
      url: '../goods/pay/pay?resultType=' + resultType
    })
  },

  //跳转到购物车
  toCart: function() {
    wx.navigateTo({
      url: '../cart/cart',
    })
  },

  // cartShow: function (fold) {
  //   console.log(fold);
  //   if (fold == false) {
  //     this.setData({
  //       cartShow: 'block',
  //     })
  //   } else {
  //     this.setData({
  //       cartShow: 'none',
  //     })
  //   }
  //   console.log(this.data.cartShow);
  // },
  // tabChange: function(e) {
  //   var showtype = e.target.dataset.type;
  //   this.setData({
  //     status: showtype,
  //   });
  // },
  onLoad: function(options) {

    // 页面初始化 options为页面跳转所带来的参数
    let that = this;
    var shopId = wx.getStorageSync("shopId");
    let url = "api/weiXin/getProductList"
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
        var goods = res.data.msg;
        that.setData({
          goods: goods
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

  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    var that = this;
    var carArray1 = wx.getStorageSync('cartResult');
    // that.setData({
    //   carArray: carArray1,
    // })
    // that.onLoad();
    //   that.calTotalPrice();
    if (carArray1.length > 0) {

      this.setData({
        carArray: carArray1,
        goods: this.data.goods
      })
      that.calTotalPrice();
    }
    // else{
    //   this.setData({
    //     carArray: carArray1
    //   })
    //   // that.onLoad();
    //   that.calTotalPrice();
    // }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})