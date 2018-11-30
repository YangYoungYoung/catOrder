// pages/cart/cart.js
var common = require("../../utils/common.js");
var network = require("../../utils/network.js");
var orderId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    index: 0,
    text: "",
    tags: [{
        name: '不辣',
        checked: false,
        color: 'green'
      },
      {
        name: '微辣',
        checked: false,
        color: 'blue'
      },
      {
        name: '中辣',
        checked: false,
        color: 'yellow'
      },
      {
        name: '麻辣',
        checked: false,
        color: 'red'
      },
      {
        name: '免姜',
        checked: false,
        color: 'green'
      },
      {
        name: '免花椒',
        checked: false,
        color: 'blue'
      }
    ],

    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      allSelect: true,
      noSelect: false,
      list: [],
    },
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
    textAreaBlur: ""
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function(w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2); //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function() {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.initEleWidth();
    // this.onShow();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // var shopList = [];
    // 获取购物车数据
    var shopCarInfoMem = wx.getStorageSync('cartResult');
    // console.log("==========" + shopCarInfoMem.length);

    this.data.goodsList.list = shopCarInfoMem;
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), shopCarInfoMem);
    var that = this;
    var totalPrice = that.totalPrice();
    // console.log("==========" + totalPrice);
  },

  touchS: function(e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function(e) {
    var index = e.currentTarget.dataset.index;

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.goodsList.list;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },

  touchE: function(e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.goodsList.list;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

      }
    }
  },
  //删除商品
  delItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list.splice(index, 1);
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  selectTap: function(e) {
    var index = e.currentTarget.dataset.index;
    console.log("");
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
  },
  //总价
  totalPrice: function() {
    var list = this.data.goodsList.list;
    console.log(list.length);
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number;
      }
    }
    console.log(total.toFixed(1));
    return total;
  },
  //全选
  allSelect: function() {
    var list = this.data.goodsList.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    return allSelect;
  },

  //取消全选
  noSelect: function() {
    var list = this.data.goodsList.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  setGoodsList: function(saveHidden, total, allSelect, noSelect, list) {

    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total.toFixed(1),
        allSelect: allSelect,
        noSelect: noSelect,
        list: list
      }
    });
    var shopCarInfo = {};
    wx.setStorage({
      key: "cartResult",
      data: list
    })
  },
  //点击全选
  bindAllSelect: function() {
    var currentAllSelect = this.data.goodsList.allSelect;

    var list = this.data.goodsList.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }

    // console.log("====当前价格是===" + this.totalPrice())
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
  },
  //数量加
  jiaBtnTap: function(e) {
    console.log("youmeiyou ");
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number < 99) {
        list[parseInt(index)].number++;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  //数量减
  jianBtnTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number > 1) {
        list[parseInt(index)].number--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  //编辑
  editTap: function() {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //完成
  saveTap: function() {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = true;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //完成隐藏
  getSaveHide: function() {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },
  //删除
  deleteSelected: function() {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        list.splice(i--, 1);
      }
    }
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  //提交订单
  toPayOrder: function() {
    var that = this;
    if (this.data.goodsList.noSelect) {
      common.showTip("请选择至少一件商品", "loading");
      return;
    }
    wx.showLoading();
    // 重新计算价格，判断库存

    var shopList = wx.getStorageSync('cartResult');
    if (shopList.length == 0) {
      common.showTip("请选择至少一件商品", "loading");
      return;
    }
    var orderItemList = new Array();
    for (var i = 0; i < shopList.length; i++) {
      //把选择的放进订单存储中
      if (shopList[i].active) {
        //判断库存
        if (shopList[i].good_number < shopList[i].number) {
          common.showTip(shopList[i].name + "商品库存不足", "loading");
          return;
        } else {
          console.log("商品的ID是：" + shopList[i].category_id);
          //订单id是单独传过来的
          var order_id = wx.getStorageSync("order_id");
          var temp = {
            category_id: shopList[i].category_id,
            description: shopList[i].description,
            // order_id: order_id,
            order_id: "25767795778125825",
            product_id: shopList[i].product_id,
            quantity: shopList[i].number,
            status_id: 0
          }
          orderItemList.push(temp);
        }
      }
    }
    //将选择的商品ID传给服务器生成订单
    // let url = "api/orderItemList"
    // var params = {
    //   // orderResult: JSON.stringify(orderResult),
    //   orderResult: orderResult,
    // }
    // let method = "POST";
    // let header = "{\"Content-Type\": \'application/json\'}";
    // wx.showLoading({
    //   title: '加载中...',
    // }),
    //   network.POST(url, params, method, header).then((res) => {
    //     wx.hideLoading();
    //     console.log("这里的结果是：" + res.data); //正确返回结果
    //     //返回的是订单Id
    //     // orderId = res.data.orderId;
    //     // that.navigateToPayOrder();
    //   }).catch((errMsg) => {
    //     // wx.hideLoading();
    //     // console.log(errMsg); //错误提示信息
    //     wx.showToast({
    //       title: '网络错误',
    //       icon: 'loading',
    //       duration: 1500,
    //     })
    //   });

    var description = that.data.textAreaBlur;
    wx.request({
      url: 'https://chanmao.oicp.vip/api/orderItemList',

      data: {
        orderItemList,
        description
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'

      },
      success: function(res) {
        console.log("提交返回：" + res.data);
        if (res.data.code == 200) {
          common.showTip("提交成功", 'success');
          that.setData({
            isLotteryCash: res.data.msg.isLotteryCash
          })
          that.navigateToPayOrder();
        }
      }
    });

  },
  /**
   * 口味弹窗
   */
  showDialogBtn: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      showModal: true,
      index: index
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
    var that = this;
    that.hideModal();
    var list = that.data.goodsList.list;
    var index = that.data.index;
    list[index].description = that.data.text;
    console.log("当前口味为：" + list[index].description + "当前个数：" + index);
    wx.setStorageSync("cartResult", list);
  },

  //获取输入框里的值
  inputChange: function(e) {
    this.setData({
      text: e.detail.value,
    })
  },
  //获取当前数量
  inputNumber: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list[parseInt(index)].number = e.detail.value;
    console.log("当前数量是" + list[index].number);
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },

  onChange(event) {
    const detail = event.detail;

    var remark = this.data.tags[event.detail.name].name;
    var text = this.data.text;
    var checked = false;
    //展示的为当前状态，未更改状态
    if (this.data.tags[event.detail.name].checked) {
      //点击取消备注
      checked = false;
      text = text.replace(remark, "");

    } else {
      //点击增加备注
      checked = true;
      text += remark;
    }
    this.setData({
      text: text,
      ['tags[' + event.detail.name + '].checked']: checked
    })

  },
  toIndexPage: function() {
    wx.navigateTo({
      url: '../index/index',
    })
  },


  navigateToPayOrder: function() {
    //清除购物车库存
    wx.removeStorageSync('cartResult')
    wx.hideLoading();
    let that = this;
    var isLotteryCash = that.data.isLotteryCash;
    if (isLotteryCash != 1) {
      wx.redirectTo({
        url: "../lottery/lottery"
      })
    } else {
      wx.redirectTo({
        url: "../order/order"
      })
    }
  },

  bindTextAreaBlur: function(e) {
    console.log(e.detail.value);
    this.setData({
      textAreaBlur: e.detail.value,
    })
  },
  bindText: function(e) {
    this.setData({
      textAreaBlur: e.detail.value,
    })
  }
})