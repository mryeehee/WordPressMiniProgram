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
var auth = require('../../utils/auth.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var pageCount = config.getPageCount;
var {
  vPush
} = getApp();
var app = getApp();
//const TxvContext = requirePlugin("tencentvideo");
//let txvContext = TxvContext.getTxvContext('txv1') // txv1即播放器组件的playerid值

Page({
  data: {
    postsList: [],
    postsList1: [],
    //postsList2: [],
    postsList3: [],
    postsShowSwiperList: [],
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    showerror: "none",
    showCategoryName: "",
    categoryName: "",
    showallDisplay: "block",
    displayHeader: "none",
    displaySwiper: "none",
    floatDisplay: "none",
    displayfirstSwiper: "none",
    currentIndex: 0,
    topNav: [],
    userInfo: app.globalData.userInfo,
    isLoginPopup: false


  },
  formSubmit: function(e) {
    var url = '../list/list'
    var key = '';
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {

      key = e.detail.value.input;

    }
    if (key != '') {
      url = url + '?search=' + key;
      wx.navigateTo({
        url: url
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        showCancel: false,
      });


    }
  },
  onShareAppMessage: function() {
    return {
      title: '' + config.getWebsiteName + ' - 专注于自媒体小程序开发与定制',
      path: 'pages/index/index',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  onPullDownRefresh: function() {
    var self = this;
    self.setData({
      showerror: "none",
      showallDisplay: "none",
      displaySwiper: "none",
      floatDisplay: "none",
      isLastPage: false,
      page: 0,
      postsShowSwiperList: []
    });
    this.fetchTopFivePosts();

  },
  onReachBottom: function() {

    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    } else {
      console.log('最后一页');
    }

  },
  //  onLoad: function(options) {
  //    var self = this;
  //    this.fetchTopFivePosts();
  //    self.setData({
  //      topNav: config.getIndexNav
  //    });
  //  },

  onLoad: function(options) {
    var self = this;
    if (!app.globalData.isGetOpenid) {
      //self.getUsreInfo();
      self.userAuthorization();
    } else {
      self.setData({
        userInfo: app.globalData.userInfo
      });
    }
    var that = this;
    wx.request({
      //url: 'https://www.yeehee.cn/wp-json/watch-life-net/v1/post/static',
      success: function(res) {
        var statics = res.data.static;
        that.setData({
          statics: statics,
        })
      },
      fail: function() {}
    })

    var that = this;
    this.fetchPostsIndex();
    this.fetchPostsIndex2();
    this.fetchTopFivePosts();

    that.setData({
      topNav: config.getIndexNav
    });
  },

  /* vPush推送绑定事件 */
  vPushHandler: function(e) {
    vPush.add(e);
  },

  /* 这里实现控制中间凸显图片的样式 */
  handleChange: function(e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  onShow: function(options) {
    wx.setStorageSync('openLinkCount', 0);

  },
  fetchTopFivePosts: function() {
    var self = this;
    //取置顶的文章
    var getPostsRequest = wxRequest.getRequest(Api.getSwiperPosts());
    getPostsRequest.then(response => {
        if (response.data.status == '200' && response.data.posts.length > 0) {
          self.setData({
            postsShowSwiperList: response.data.posts,
            postsShowSwiperList: self.data.postsShowSwiperList.concat(response.data.posts.map(function(item) {
              //item.firstImage = Api.getContentFirstImage(item.content.rendered);
              if (item.post_medium_image_300 == null || item.post_medium_image_300 == '') {
                if (item.content_first_image != null && item.content_first_image != '') {
                  item.post_medium_image_300 = item.content_first_image;
                } else {
                  item.post_medium_image_300 = "../../images/logo700.png";
                }

              }
              return item;
            })),
            showallDisplay: "block",
            displaySwiper: "block"
          });

        } else {
          self.setData({
            displaySwiper: "none",
            displayHeader: "block",
            showallDisplay: "block",

          });

        }

      })
      .then(response => {
        self.fetchPostsData(self.data);

      })
      .catch(function(response) {
        console.log(response);
        self.setData({
          showerror: "block",
          floatDisplay: "none"
        });

      })
      .finally(function() {

      });

  },

  //获取文章列表数据
  fetchPostsData: function(data) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
    getPostsRequest
      .then(response => {
        if (response.statusCode === 200) {

          if (response.data.length < pageCount) {
            self.setData({
              isLastPage: true
            });
          }
          self.setData({
            floatDisplay: "block",
            postsList: self.data.postsList.concat(response.data.map(function(item) {

              var strdate = item.date
              if (item.category_name != null) {

                item.categoryImage = "../../images/category.png";
              } else {
                item.categoryImage = "";
              }

              if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
                item.post_thumbnail_image = "../../images/logo700.png";
              }
              item.date = util.cutstr(strdate, 10, 1);
              return item;
            })),

          });
          setTimeout(function() {
            wx.hideLoading();
          }, 900);
        } else {
          if (response.data.code == "rest_post_invalid_page_number") {
            self.setData({
              isLastPage: true
            });
            wx.showToast({
              title: '没有更多内容',
              mask: false,
              duration: 1500
            });
          } else {
            wx.showToast({
              title: response.data.message,
              duration: 1500
            })
          }
        }
      })
      .catch(function(response) {
        if (data.page == 1) {

          self.setData({
            showerror: "block",
            floatDisplay: "none"
          });

        } else {
          wx.showModal({
            title: '加载失败',
            content: '加载数据失败,请重试.',
            showCancel: false,
          });
          self.setData({
            page: data.page - 1
          });
        }
      })
      .finally(function(response) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  fetchPostsIndex: function() {
    var self = this;
    var indexCategoryPost = config.getIndexCategoryPost;
    var getPostsRequest = wxRequest.getRequest(Api.getPostsByCategory(indexCategoryPost));
    getPostsRequest.then(response => {
      if (response.statusCode === 200) {
        self.setData({
          postsList1: self.data.postsList1.concat(response.data.map(function(item) {

            var strdate = item.date
            if (item.category_name != null) {

              item.categoryImage = "../../images/category.png";
            } else {
              item.categoryImage = "";
            }

            if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
              item.post_thumbnail_image = "../../images/logo700.png";
            }
            item.date = util.cutstr(strdate, 10, 1);
            return item;
          })),
        });
      }
    })
  },
  fetchPostsIndex2: function() {
    var self = this;
    var indexCategoryPost2 = config.getIndexCategoryPost2;
    var getPostsRequest = wxRequest.getRequest(Api.getPostsByCategory2(indexCategoryPost2));
    getPostsRequest.then(response => {
      if (response.statusCode === 200) {
        self.setData({
          postsList3: self.data.postsList3.concat(response.data.map(function(item) {

            var strdate = item.date
            if (item.category_name != null) {

              item.categoryImage = "../../images/category.png";
            } else {
              item.categoryImage = "";
            }

            if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
              item.post_thumbnail_image = "../../images/logo700.png";
            }
            item.date = util.cutstr(strdate, 10, 1);
            return item;
          })),
        });
      }
    })
  },


  //获取浏览排行
  fetchPostsHostData: function(tab) {
    var self = this;
    self.setData({
      postsList2: []
    });
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    var getTopHotPostsRequest = wxRequest.getRequest(Api.getTopHotPosts(tab));
    getTopHotPostsRequest.then(response => {
        if (response.statusCode === 200) {
          self.setData({
            postsList2: self.data.postsList2.concat(response.data.map(function(item) {
              var strdate = item.post_date
              if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
                item.post_thumbnail_image = '../../images/logo700.png';
              }
              item.post_date = util.cutstr(strdate, 10, 1);
              return item;
            })),
          });
        } else if (response.statusCode === 404) {
          console.log('加载数据失败,可能缺少相应的数据');
        }
      })
      .catch(function() {
        wx.hideLoading();
      })
      .finally(function() {
        setTimeout(function() {
          wx.hideLoading();
        }, 1500);
      });
  },

  //加载分页
  loadMore: function(e) {

    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      //console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    } else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  // 跳转至查看文章详情
  redictDetail: function(e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  //首页图标跳转
  onNavRedirect: function(e) {
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;
    var extraData = e.currentTarget.dataset.extraData == null ? '' : e.currentTarget.dataset.extraData;
    if (redicttype == 'apppage') { //跳转到小程序内部页面         
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'webpage') //跳转到web-view内嵌的页面
    {
      url = '../webpage/webpage?url=' + url;
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'miniapp') //跳转到其他app
    {
      wx.navigateToMiniProgram({
        appId: appid,
        envVersion: 'release',
        path: url,
        extraData: extraData,
        success(res) {
          // 打开成功
        },
        fail: function(res) {
          console.log(res);
        }
      })
    }

  },
  // 跳转至查看小程序列表页面或文章详情页
  redictAppDetail: function(e) {
    // console.log('查看文章');
    var id = e.currentTarget.id;
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;

    if (redicttype == 'detailpage') //跳转到内容页
    {
      url = '../detail/detail?id=' + id;
      wx.navigateTo({
        url: url
      })
    }
    if (redicttype == 'apppage') { //跳转到小程序内部页面         
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'webpage') //跳转到web-view内嵌的页面
    {
      url = '../webpage/webpage?url=' + url;
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'miniapp') //跳转到其他app
    {
      wx.navigateToMiniProgram({
        appId: appid,
        envVersion: 'release',
        path: url,
        success(res) {
          // 打开成功
        },
        fail: function(res) {
          console.log(res);
        }
      })
    }
  },
  //返回首页
  redictHome: function(e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id,
      url = '/pages/index/index';
    wx.switchTab({
      url: url
    });
  },

  userAuthorization: function () {
    var self = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
        console.log(res.authSetting);
        var authSetting = res.authSetting;
        if (!('scope.userInfo' in authSetting)) {
          //if (util.isEmptyObject(authSetting)) {
          console.log('第一次授权');
          self.setData({
            isLoginPopup: true
          })

        } else {
          console.log('不是第一次授权', authSetting);
          // 没有授权的提醒
          if (authSetting['scope.userInfo'] === false) {
            wx.showModal({
              title: '用户未授权',
              content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
              showCancel: true,
              cancelColor: '#296fd0',
              confirmColor: '#296fd0',
              confirmText: '设置权限',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('打开设置', res.authSetting);
                      var scopeUserInfo = res.authSetting["scope.userInfo"];
                      if (scopeUserInfo) {
                        auth.getUsreInfo(null);
                      }
                    }
                  });
                }
              }
            })
          } else {
            auth.getUsreInfo(null);
          }
        }
      }
    });
  },
  agreeGetUser: function (e) {
    var userInfo = e.detail.userInfo;
    var self = this;
    if (userInfo) {
      auth.getUsreInfo(e.detail);
      self.setData({
        userInfo: userInfo
      })
    }
    setTimeout(function () {
      self.setData({
        isLoginPopup: false
      })
    }, 1200);

  },
  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    });
  },
  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },
  getUsreInfo: function () {
    var self = this;
    var wxLogin = wxApi.wxLogin();
    var jscode = '';
    wxLogin().then(response => {
      jscode = response.code
      var wxGetUserInfo = wxApi.wxGetUserInfo()
      return wxGetUserInfo()
    }).
      //获取用户信息
      then(response => {
        console.log(response.userInfo);
        console.log("成功获取用户信息(公开信息)");
        app.globalData.userInfo = response.userInfo;
        app.globalData.isGetUserInfo = true;
        self.setData({
          userInfo: response.userInfo
        });

        var url = Api.getOpenidUrl();
        var data = {
          js_code: jscode,
          encryptedData: response.encryptedData,
          iv: response.iv,
          avatarUrl: response.userInfo.avatarUrl
        }
        var postOpenidRequest = wxRequest.postRequest(url, data);
        //获取openid
        postOpenidRequest.then(response => {
          if (response.data.status == '200') {
            //console.log(response.data.openid)
            console.log("openid 获取成功");
            app.globalData.openid = response.data.openid;
            app.globalData.isGetOpenid = true;
          } else {
            console.log(response.data.message);
          }
        })
      }).catch(function (error) {
        console.log('error: ' + error.errMsg);
        self.userAuthorization();
      })
  },

  //设置首页咨询按钮点击事件：当用户点击咨询按钮时，自动推送一条消息给管理员
  notifyAdmin: function () {
    console.log(' 用户咨询，开始通知管理员。');
    wx.request({
      url: 'https://cloud.safedog.cc/vpush/functions/PUSH_API',
      method: 'POST',
      dataType: 'json',
      header: {
        'Content-Type': "application/json",
        "X-Parse-Application-Id": "guren_cloud_vpush"
      },
      data: {
        "id": "jmoQ2kyo5D",
        "secret": "f1faf-496d1-de9c8-1438b",
        "path": "pages/index/index",
        // 这里填写管理员的openId
        "openId": "oRM4C0fPs_4PiCL9WStRkHj1kGek",
        "data": [
          "叶赫先生",
          new Date().toLocaleDateString(),
          "有用户点击了反馈按钮，请前往客服系统mpkf.weixin.qq.com进行查看！"
        ]
      }
    })
  }
})