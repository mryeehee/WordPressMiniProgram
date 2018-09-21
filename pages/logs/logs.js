/*
 * 
 * WordPres版微信小程序
 * Original author: jianbo
 * Secondary development：叶赫先生 www.yeehee.cn
 * 技术支持微信号：ryan_yuu
 * 开源协议：MIT
 * Copyright (c) 2017 https://www.yeehee.cn All rights reserved.
 *
 */

var util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        return util.formatTime(new Date(log))
      })
    })
  },
  onShow: function (options) {
    // 小神推获取用户信息
    wx.getSetting({
      success: function (res) {
        if (res.authSetting["scope.userInfo"]) {
          wx.getUserInfo({
            success: function (res) {
              var userInfo = res;
              wx.login({
                success: function (res) {
                  var jsCode = res.code;
                  app.aldpush.pushuserinfo(userInfo, jsCode);
                }
              })
            }
          })
        }
      }
    })
  }
})
