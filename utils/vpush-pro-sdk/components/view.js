// vpush-pro-sdk/components/view.js
const { vPush } = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  externalClasses: ['custom-class'],

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    add: function (e) {
      vPush.addFormId(e);
      // 回调父层的onClickHandler函数
      this.triggerEvent('ClickHandler', e, {});
    }
  }
})
