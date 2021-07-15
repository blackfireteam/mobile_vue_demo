module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-pxtorem')({ // 把px单位换算成rem单位
            rootValue: 37.5, //通常结合 lib-flexible 设置 rem 基准值,默认用37.5,不然容易出问题
            selectorBlackList: ['.ignore'], //则是一个对css选择器进行过滤的数组，比如你设置为['fs']，那例如fs-xl类名，里面有关px的样式将不被转换
            propList: ['*']
          })
        ]
      }
    }
  },
}