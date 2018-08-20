// pages/components/wrapper/wrapper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    style: ''
  },
  attached: function () { 
    var that = this;
    that.setHeightAndWidth();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setHeightAndWidth() {
      var that = this;
      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            style: `background:url(${that.properties.url});height: ${res.windowHeight}px;width:${res.windowWidth}px;`
          });
        },
      })
    }
  },
})
