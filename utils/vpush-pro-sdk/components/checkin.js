/**
 * vPush-Pro-SDK
 * CheckIn 签到组件
 * ===============
 * 每日弹出一个签到界面，用户点击后自动收集推送凭证
 * 用于懒人模式，懒得集成SDK，那就直接嵌入这个组件，完美！
 * GitHub:https://github.com/guren-cloud/vpush-pro-sdk
 * 官网：https://mssnn.cn
 * ===============
 * 用法：
 * 1. 页面json中引入组件
 * 2. 页面wxml中放置组件（随意位置）
 * <vpush-checkin />
 */

// 引入全局vPush变量
const { vPush } = getApp();

// 今日签到标识
const CHECKIN_STORAGE_KEY = new Date().toLocaleDateString();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    desc: {
      type: String,
      value: '每日签到，畅享美好！'
    },
    title: {
      type: String,
      value: '今日签到'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    SHOW_CLASS: ''
  },

  ready: function () {
    // 判断今日是否签到了
    if (wx.getStorageSync(CHECKIN_STORAGE_KEY)) return;
    // 显示今日签到
    this.setData({
      SHOW_CLASS: 'animation-show'
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击签到函数
    // 1. 添加vpush推送凭证
    // 2. 隐藏签到卡
    // 3. 回调父层onCheckIn函数
    checkin: function (e) {
      vPush.addFormId(e, () => {
        this.setData({
          SHOW_CLASS: 'animation-hide'
        });
        wx.setStorageSync(CHECKIN_STORAGE_KEY, '1');
        this.triggerEvent('onCheckIn', e, {});
      });
    }
  }
})
