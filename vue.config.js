//引入该插件
const CompressionWebpackPlugin = require("compression-webpack-plugin");
//匹配此 {RegExp} 的资源
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  publicPath: "./",
  productionSourceMap: false,
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require("postcss-pxtorem")({
            // 把px单位换算成rem单位
            rootValue: 37.5, //通常结合 lib-flexible 设置 rem 基准值,默认用37.5,不然容易出问题
            selectorBlackList: [".ignore"], //则是一个对css选择器进行过滤的数组，比如你设置为['fs']，那例如fs-xl类名，里面有关px的样式将不被转换
            propList: ["*"],
          }),
        ],
      },
    },
  },
  configureWebpack: (config) => {
    const plugins = [];
    // start 生成 gzip 压缩文件
    plugins.push(
      new CompressionWebpackPlugin({
        filename: "[path].gz[query]", //目标资源名称
        algorithm: "gzip",
        test: productionGzipExtensions, //处理所有匹配此 {RegExp} 的资源
        threshold: 10240, //只处理比这个值大的资源。按字节计算(楼主设置10K以上进行压缩)
        minRatio: 0.8, //只有压缩率比这个值小的资源才会被处理
      })
    );

    if (process.env.NODE_ENV === "production") {
      // config.optimization = {
      //   minimizer: [
      //     new TerserPlugin({
      //       terserOptions: {
      //         compress: {
      //           drop_console: true,
      //         },
      //       },
      //     }),
      //   ],
      // }
    }

    // End 生成 gzip 压缩文件
    config.plugins = [...config.plugins, ...plugins];
  },
};
