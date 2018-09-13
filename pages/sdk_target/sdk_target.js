var app = getApp();
var conf = require('../../utils/push-stat-conf.js');

Page({
	data: {
		isBackcg: false
	},
	onLoad: function (options) {
		if (typeof options != 'undefined') {
			if(options.apId && options.pathTg){
				if(wx.navigateToMiniProgram){
					var extHandle = {}, pathTg = decodeURIComponent(options.pathTg), customArg = '';
					if(pathTg.indexOf('?') != -1){
						customArg = pathTg.split('?')[1].split('&');
						for (var i = 0; i < customArg.length; i++) {
							if(customArg[i].indexOf('=') != -1){
								extHandle[customArg[i].split('=')[0]] = customArg[i].split('=')[1];
							}
						}
					}
					wx.navigateToMiniProgram({
					  appId: options.apId,
					  path: pathTg.split('?')[0],
					  extraData: extHandle,
						fail(){
							wx.redirectTo({
					      url: conf.pageHomeBack,
					      fail:function(res){
					        wx.switchTab({
					          url: conf.pageHomeBack
					        })
					      }
				    	})
						}
					});
				}else{
					// return console.log('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
					wx.redirectTo({
						url: conf.pageHomeBack,
						fail:function(res){
							wx.switchTab({
								url: conf.pageHomeBack
							})
						}
					})
				}
			}
		}
	},
	onShow: function () {
		if(this.data.isBackcg){
			wx.redirectTo({
	      url: conf.pageHomeBack,
	      fail:function(res){
	        wx.switchTab({
	          url: conf.pageHomeBack
	        })
	      }
    	})
		}
	},
	onHide: function () {
		this.setData({
       isBackcg: true
    });
	}
})
