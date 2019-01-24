/**
 * vPush pro hijack 组件
 * ====================
 * 用于劫持用户的点击（透明，用户无察觉，体验影响极小的推送凭证收集黑科技）
 * Github: https://github.com/guren-cloud
 * 更新：2018/12/26
 * 属性（绝对定位）：
 * width: String，ui层的长度，默认100%
 * height: String，ui层的高度，默认100%
 * left: String, 左边距离，默认0
 * top: String, 顶部距离，默认0
 * debug: Boolean, 是否开启调试，开启后，ui层会是半透明红色，请在调试完毕后关闭
 * bind:clickHandler 用户点击劫持界面触发后回调函数，一般用在用户点击后的处理事件
 */

const { vPush } = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: {
      type: String,
      value: '100%'
    },
    height: {
      type: String,
      value: '100%'
    },
    top: {
      type: String,
      value: '0'
    },
    left:{
      type: String,
      value: '0'
    },
    // 是否调试状态，调试状态颜色会为红色，否则会透明
    debug: {
      type: Boolean,
      value: false
    },
    // 自定义样式，用于覆盖，一般不需要设置
    style: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    SHOW: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    add: function (e) {
      // 隐藏界面
      this.setData({
        SHOW: false
      });
      vPush.addFormId(e, () => {
        // 回调clickHandler函数
        this.triggerEvent('clickHandler', e, {});
      })
    }
  }
})
