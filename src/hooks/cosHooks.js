import { getCurrentInstance } from 'vue'
import COS from "@/assets/js/cos-js-sdk-v5.min.js";
import { useStore } from "vuex";

export default function() {
  const ctx = getCurrentInstance().appContext.config.globalProperties;
  const store = useStore();

  // 初始化cos
  function initCos(config) {
    let cosOptions = config;
    store.commit(
      "setCos",
      new COS({
        getAuthorization: (options, callback) => {
          if (cosOptions) {
            callback({
              TmpSecretId: cosOptions.id,
              TmpSecretKey: cosOptions.key,
              SecurityToken: cosOptions.token,
              // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
              StartTime: cosOptions.startTime, // 时间戳，单位秒，如：1580000000
              ExpiredTime: cosOptions.expTime, // 时间戳，单位秒，如：1580000900
            });
            cosOptions = null;
          } else {
            getCos((data) => {
              callback({
                TmpSecretId: data.id,
                TmpSecretKey: data.key,
                SecurityToken: data.token,
                // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
                ExpiredTime: data.expTime, // 时间戳，单位秒，如：1580000900
              });
            });
          }
        },
      })
    );
  }

  // 获取cosKey
  function getCos(callback) {
    ctx.$msim.getCosKey().then((res) => {
      store.commit("setCosConfig", res.data);
      callback(res.data);
    });
  }
  return {
    initCos,
    getCos,
  }
}