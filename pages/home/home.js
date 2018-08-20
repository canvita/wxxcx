// pages/home/home.js
const util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    url: `http://img1.imgtn.bdimg.com/it/u=3298955181,3995397745&fm=214&gp=0.jpg`, //背景图url
    cur_info: {}, //页面渲染需要的数据
    time: '', //系统时间

    picker_array: ['温度', '降雨率'], //天气预报下的选择器数组
    picker_index: 0, //天气预报下的选择器下标

    mask_flag: false, //显示遮罩
    add_flag: false, //添加城市
    show_flag: false, //显示搜索到的城市
    menu_flag: false, //显示城市列表
    show_more_flag: false,  //显示编辑
    delete_flag: false,  //删除城市
    delete_all_flag: false,  //全选删除

    search_location: '', //搜索位置
    search_city: '', //搜索位置所在城市
    search_province: '', //搜索位置所在省份

    open_id: '', //用户的唯一标识

    city_list: [],  //城市列表
    city_weather_list: [], //所有城市的天气情况
    radio_list: [false, false, false, false, false], //删除按钮数组
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //初始化时间
    this.clock();
    //每5秒更新一次时间
    let t = setInterval(this.clock, 5000);
    //第一次加载数据
    this.init();
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    init();
  },
  /**
   * 加载数据
   */
  init() {
    let that = this;
    //获取当前位置数据
    that.getCurLoca()
      .then(tude => {
        return that.getWeatherAndCity(tude)
      })
      .then(res => {
        let arr = [];
        arr.push(res);
        that.setData({
          cur_info: res,
          city_weather_list: arr
        })
      });

    //获取收藏列表城市的天气
    that.login()
      .then(code => {
        return that.getOpenId(code)
      })
      .then(open_id => {
        this.setData({
          open_id: open_id
        })
        return that.getCityList(open_id);
      })
      .then(city_list => {
        this.setData({
          city_list: city_list
        })
        return that.getAllCityWeather(city_list);
      })
      .then(arr => {
        let array = that.data.city_weather_list.concat(arr);
        that.setData({
          city_weather_list: array,
        })
      });
  },

  /**
   * 获取系统时间
   */
  clock() {
    let that = this;
    let time = util.formatTime(new Date());
    that.setData({
      time: time.substring(5, 16)
    });
  },
  /**
   * 每小时预报类型选择器
   */
  bindPickerChange: function (e) {
    this.setData({
      picker_index: e.detail.value
    })
  },
  /**
   * 添加城市按钮处理
   */
  addCity() {
    this.setData({
      mask_flag: true,
      add_flag: true
    })
  },
  /**
   * 取消遮罩
   */
  cancelMask() {
    this.setData({
      mask_flag: false,
      add_flag: false,
      show_flag: false,
      menu_flag: false,
      show_more_flag: false,
      delete_all_flag: false,
      delete_flag: false,
      radio_list: [false, false, false, false, false]
    })
  },
  /**
   * 查询城市
   */
  searchCity(e) {
    let that = this;
    let arg = e.detail.value;  //输入值
    if (arg.length >= 2) {
      let url = `https://search.heweather.com/find?location=${arg}&key=5e78edab04d64695be95945ec1613ebb`;
      util.getSync(url).then(res => {
        let data = res.data.HeWeather6[0];
        console.log(data);
        //只返回一个城市时显示或者搜索了市级地区
        if ((data.status === 'ok' && data.basic.length === 1) || (data.status === 'ok' && arg === data.basic[0].parent_city)) {
          that.setData({
            show_flag: true,
            search_location: data.basic[0].location,
            search_city: data.basic[0].parent_city,
            search_province: data.basic[0].admin_area,
            search_cid: data.basic[0].cid
          })
        } else {
          that.setData({
            show_flag: false
          })
        }
      });
    } else {
      that.setData({
        show_flag: false
      })
    }
  },
  /**
   * 将城市加入到数据库中
   */
  addCity2DB() {
    let that = this;
    let open_id = this.data.open_id;
    let city = this.data.search_location;
    let city_list = this.data.city_list;
    let radio_list = this.data.radio_list;
    let city_weather_list = this.data.city_weather_list;
    let url = `http://www.canvita.cn:8100/add?open_id=${open_id}&city=${city}`;
    url = encodeURI(url);  
    util.getSync(url).then(res => {
      console.log(res);
      if (res.data === "already add") {
        wx.showToast({
          title: '请勿重复添加',
          icon: 'none',
          duration: 1000
        })
      } else if (res.data === "too more") {
        wx.showToast({
          title: '最多添加5个城市',
          icon: 'none',
          duration: 1000
        })
      } else {
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1000
        })
        city_list.push(city);
        //成功后显示当前城市
        that.getWeatherAndCity(city).then(arr => {
          city_weather_list.push(arr);
          that.setData({
            cur_info: city_weather_list[city_weather_list.length - 1],
            city_list: city_list,
            city_weather_list: city_weather_list,
          })
        }) 
      }
    })
    this.cancelMask();
  },
  /**
   * 获取当前位置 | Promise
   */
  getCurLoca: function () {
    let that = this;
    return new Promise(resolve => {
      wx.getLocation({
        success(res) {
          let arr = [res.latitude, res.longitude];
          resolve(arr);
        },
        fail(res) {
          throw (res);
        }
      });
    })
  },
  /**
   * 获取天气和城市 | Promise
   */
  getWeatherAndCity(city) {
    let that = this;
    return new Promise(resolve => {
      let arg = Array.isArray(city) ? `${city[0]},${city[1]}` : city;
      let url = `https://free-api.heweather.com/s6/weather?location=${arg}&key=5e78edab04d64695be95945ec1613ebb`;
      let obj = {};
      util.getSync(url).then(res => {
        let data = res.data.HeWeather6[0]; //所有天气数据
        let Harr = data.hourly; //每三小时天气
        let Darr = data.daily_forecast; //每天天气
        let h_tmp_data = []; //每三小时温度数组
        let h_pop_data = []; //每三小时降雨率数组
        let d_data = []; //每天天气数组

        //将天气数据存入对应数组
        for (let i = 0; i < 8; i++) {
          let arr1 = Harr[i];
          let arr2 = Darr[i];
          h_tmp_data.push({
            'time': arr1.time.substr(-5),
            'tmp': arr1.tmp,
            'weather_code': `/images/icon-new/${arr1.cond_code}.png`
          });
          h_pop_data.push({
            'time': arr1.time.substr(-5),
            'pop': arr1.pop,
            'pop_icon': this.popToIcon(arr1.pop)
          });
          //i=7时没有每日预报报错
          if (i < 7) {
            d_data.push({
              'date': arr2.date.substr(-5),
              'weather': arr2.cond_txt_d,
              'weather_code': `/images/icon-new/${arr2.cond_code_d}.png`,
              'pop': arr2.pop,
              'pop_icon': this.popToIcon(arr2.pop),
              'maxTmp': arr2.tmp_max,
              'minTmp': arr2.tmp_min
            });
          }
        }

        let o = {
          location: data.basic.location,
          city: data.basic.parent_city,
          area: data.basic.admin_area,
          sunrise: data.daily_forecast[0].sr,
          sundown: data.daily_forecast[0].ss,
          uv_index: data.daily_forecast[0].uv_index,
          hum: data.daily_forecast[0].hum,
          flu: data.lifestyle[2].brf,
          dress: data.lifestyle[1].brf,
          sport: data.lifestyle[3].brf,
          air: data.lifestyle[7].brf,
          pop_array: h_pop_data,
          tmp_array: h_tmp_data,
          daily_array: d_data,
          tmp: data.now.tmp,
          tmp_max: Darr[0].tmp_max,
          tmp_min: Darr[0].tmp_min,
          weather: data.now.cond_txt,
          weather_code: `/images/icon-new/${data.now.cond_code}.png`
        };
        //返回天气对象
        return resolve(o);
      })
    })
  },
  /**
   * 获得收藏的所有城市列表  | Promise
   */
  getCityList(open_id) {
    return new Promise(resolve => {
      let that = this;
      let url = `http://www.canvita.cn:8100/init?open_id=${open_id}`;
      util.getSync(url).then(res => {
        let data = res.data;
        let arr = [];
        for (let i = 0; i < data.length; i++) {
          arr.push(data[i].city);
        }
        resolve(arr)
      })
    })
  },
  /**
   * 获取城市列表中所有城市的天气 | Promise
   */
  getAllCityWeather(city_list) {
    return new Promise(resolve => {
      let that = this;
      let l = city_list.length;
      let arr = [];
      for (let i = 0; i < l; i++) {
        that.getWeatherAndCity(city_list[i]).then(result => {
          arr.push(result);
          if (arr.length === l) {
            resolve(arr);
          }
        })
      }
    })
  },
  /**
   * 登录 | Promise
   */
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success(res) {
          let code = res.code;
          resolve(code);
        },
        fail(res) {
          throw (res);
        }
      })
    })
  },
  /**
   * 获取用户的唯一表示:open_id | Promise
   */
  getOpenId(code) {
    let that = this;
    return new Promise(resolve => {
      let url = `https://api.weixin.qq.com/sns/jscode2session?appid=wx8b39cbcc7be72e89&secret=d5e545a8205df4b6ad3190a245176152&js_code=${code}&grant_type=authorization_code`;
      util.getSync(url).then(result => {
        let openid = result.data.openid;
        resolve(openid)
      })
    })
  },
  /**
   * 显示城市列表
   */
  showMenu() {
    this.setData({
      menu_flag: true,
      mask_flag: true
    })
  },
  /**
   * 选择城市
   */
  chooseCity(e) {
    const index = e.currentTarget.dataset.index;  //所有城市天气列表下标

    const city_weather = this.data.city_weather_list[index];
    this.setData({
      cur_info: city_weather
    })
    wx.showToast({
      title: `已切换到${city_weather.location}`,
      icon: 'none',
      duration: 1000
    })
    this.cancelMask();
  },
  /**
   * 设置页面显示当前所在位置天气
   */
  getLocatedWeather() {
    const weather = this.data.city_weather_list[0];
    this.setData({
      cur_info: weather
    });
    wx.showToast({
      title: '已切换到当前城市',
      icon: 'none',
      duration: 1000
    })
    this.cancelMask();
  },
  /**
   * 城市列表显示更多按钮
   */
  showMore() {
    this.setData({
      show_more_flag: true
    })
  },
  /**
   * 选择城市
   */
  chooseRadio(e) {
    let index = e.currentTarget.dataset.index - 1;
    let l = this.data.city_list.length;
    let radio_arr = this.data.radio_list;
    let count = 0;
    let d_flag = false;
    let d_all_flag = false;
    radio_arr[index] = !radio_arr[index];
    for (let i = 0; i < radio_arr.length; i++) {
      if (radio_arr[i]) {
        count++;
      }
    }
    if (count) {
      d_flag = true;
      if (count === l) {
        d_all_flag = true
      }
    }
    this.setData({
      radio_list: radio_arr,
      delete_flag: d_flag,
      delete_all_flag: d_all_flag
    })
  },
  /**
   * 选择全部城市
   */
  chooseAll() {
    let radio_arr = this.data.radio_list;
    let flag = !this.data.delete_all_flag;
    for (let i = 0; i < radio_arr.length; i++) {
      radio_arr[i] = flag;
    }
    this.setData({
      radio_list: radio_arr,
      delete_flag: flag,
      delete_all_flag: flag
    })
  },
  /**
   * 取消显示更多
   */
  cancelShowMore() {
    this.setData({
      show_more_flag: false,
      radio_list: [false, false, false, false, false]
    })
  },
  /**
   * 在数据库中删除选择的城市
   */
  deleteCity() {
    let that = this;
    const open_id = this.data.open_id;
    const radio_arr = this.data.radio_list;
    const city_list = this.data.city_list;
    const city_weather_list = this.data.city_weather_list;
    //无删除项则返回
    if (city_list.length == 0) {
      wx.showToast({
        title: '无删除项',
        icon: 'none',
        duration: 1000
      })
      this.cancelShowMore();
      return false;
    }
    let count = 0;
    let url = `http://www.canvita.cn:8100/delete?open_id=${open_id}`;

    wx.showModal({
      title: '确认删除吗?',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          let count = 0;
          let i;
          for (i = 0; i < radio_arr.length; i++) {
            if (radio_arr[i]) {
              count++;
              url += `&city${count}=${city_list[i]}`;
            }
          }
          url = encodeURI(url);
          util.getSync(url).then(res => {
            if (res.data === "success") {
              wx.showToast({
                title: '已删除',
                icon: 'none',
                duration: 1000
              })
              for (i = 0; i < radio_arr.length; i++) {
                if (radio_arr[i]) {
                  radio_arr.splice(i, 1);
                  city_weather_list.splice(i + 1, 1);
                  i--;
                }
              }
              that.setData({
                city_weather_list: city_weather_list,
                radio_list: [false, false, false, false, false],
                cur_info: city_weather_list[0]
              })
              that.cancelShowMore();
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none',
                duration: 1000
              })
            }
          })  
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 返回降雨率对应图标
   */
  popToIcon(pop){
    let water = '';
    if (pop <= 10) {
      water += 'water0';
    } else if (pop > 10 && pop<=30) {
      water += 'water40';
    } else if (pop > 30 && pop <= 50) {
      water += 'water60';
    } else if (pop > 50 && pop <= 70) {
      water += 'water80';
    } else {
      water += 'water100';
    }
    return `/images/${water}.svg`;
  }
})