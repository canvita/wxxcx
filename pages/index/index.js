//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: 40.00,
    longitude: 40.00,
    temperature: 30,
    weather: '**',
    markers: [
      {
        id: 1,
        longitude: 40.00,
        latitude: 40.00,
        iconPath: '../../images/map-marker.svg'
      }
    ],
    province: '**',
    city: '**'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*
    操作数据库,暂时不使用
    wx.request({
      url: 'https://lechbmz0.qcloud.la/weapp/sql',
      success(res) {
        console.log(res);
      },
      fail(res) {
        console.log(res);
      }
    })*/
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.getLocation({
      success: function (res) {
        that.setLoca(res);
      },
      fail: function () {
        console.log('fail to getLocation');
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  setLoca: function(res) {
    var that = this;
    that.setData({
      latitude: res.latitude,
      longitude: res.longitude,
    }, function(){
      //console.log(that.data);
    });
    that.getWeatherAndCity();

  },
  chooseLoca() {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setLoca(res);
        that.handleAddress(res);
        that.setMarkers(res);
        that.getWeatherAndCity();
      },
    })
  },
  handleAddress(res) {
    var that = this,
    address = res.address,
    arr = address.indexOf('省') !== -1 ? address.split('省') : address.split('自治区');
    var province = arr[0];
    var city = arr[1].split('市')[0];
    that.setData({
      province: province,
      city: city
    });
  },
  setMarkers(res) {
    var that = this;
    that.setData({
      markers: [
        {
          id: 1,
          longitude: res.longitude,
          latitude: res.latitude,
          iconPath: '/images/map-marker.svg'
        }
      ]
    })
  },
  getWeatherAndCity() {
    var that = this;
    var url = `https://free-api.heweather.com/s6/weather/now?location=${that.data.longitude},${that.data.latitude}&key=5e78edab04d64695be95945ec1613ebb`;
    wx.request({
      url: url,
      success: function (res) {
        var data = res.data.HeWeather6[0];
        that.setData({
          temperature: data.now.tmp,
          weather: data.now.cond_txt,
          province: data.basic.admin_area,
          city: data.basic.parent_city
        });
      }
    })
  },
  
})