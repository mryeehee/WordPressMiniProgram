/*
 * 
 * WordPres版微信小程序
 * Original author: jianbo
 * Secondary development：叶赫先生 www.yeehee.cn
 * 技术支持微信号：ryan_yuu
 * 开源协议：MIT
 * Copyright (c) 2017 https://www.yeehee.cn All rights reserved.
 */

var push = require('./utils/pushsdk.js');

const ald = require('./utils/ald-stat.js');
var vPush = require('./utils/vpush/_vpush.js');

App({
    vPush,
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    

    
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    openid:'',
    isGetUserInfo:false,
    isGetOpenid:false

  }
})