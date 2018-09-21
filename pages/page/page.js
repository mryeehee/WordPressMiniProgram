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

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();

Page({
  data: {
    title: '页面内容',
    pageData: {},
    pagesList: {},
    hidden: false,
    wxParseData: []
  },
  onLoad: function (options) {
    this.fetchData(options.id),
      this.fetchPagesData()
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
  },
  fetchData: function (id) {
    var self = this;
    self.setData({
      hidden: false
    });
    wx.request({
      url: Api.getPageByID(id, { mdrender: false }),
      success: function (response) {
        console.log(response);
        self.setData({
          pageData: response.data,
          // wxParseData: WxParse('md',response.data.content.rendered)
          wxParseData: WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5)
        });
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 300);
      }
    });
  },
  fetchPagesData: function () {
    var self = this;
    wx.request({
      url: Api.getPages(),
      success: function (response) {
        self.setData({
          pagesList: response.data
        });
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 300);
      }
    });
  }
})
