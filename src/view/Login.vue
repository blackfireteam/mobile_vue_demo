<template>
  <div class="login_wrapper">
    <van-image
      class="bg"
      fit="cover"
      lazy-load
      :src="require('@/assets/img/login_bg.jpg')"
    />
    <div class="login_cont">
      <div class="row_div" style="width: 100%; height: 10px">
        <div class="color_block_1"></div>
        <div class="color_block_2"></div>
        <div class="color_block_3"></div>
      </div>
      <div class="title">即时通信</div>
      <img src="@/assets/img/logo.png" class="logo" />
      <div class="login_body">
        <van-cell-group inset>
          <van-field
            v-model="data.userId"
            type="tel"
            @keyup.enter="login"
            :readonly="data.isLogoin"
            placeholder="请输入手机号"
            label-width="1.5rem"
            label="手机号"
          />
          <van-cell :border="false">
            <van-button type="primary" block size="small" @click="login"
              >登录</van-button
            >
          </van-cell>
          <van-cell>
            <van-button type="default" block size="small" to="/register"
              >注册</van-button
            >
          </van-cell>
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  setup() {
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const store = useStore();
    const router = useRouter();
    const data = reactive({
      userId: null,
      isLogoin: false,
    });
    onMounted(() => {
      if (store.state.curUserId) {
        data.userId = store.state.curUserId;
        data.isLogoin = true;
      }
    });

    // let wsURL = "wss://im.ekfree.com:18988";
    // let wsURL = "ws://192.168.50.97:18988";
    function login() {
      if (data.isLogoin) {
        router.push({ name: "home" });
        return;
      }
      if (!data.userId) {
        return ctx.$toast("请输入手机号码");
      }
      if (!store.state.curUserId) {
        let wsURL, imToken;
        const loading = ctx.$toast.loading({
          message: "登陆中...",
          forbidClick: true,
          duration: 0,
          loadingType: "spinner",
        });
        ctx.$http
          .post("user/iminit", {
            uid: data.userId,
            ctype: 1,
          })
          .then((res) => {
            wsURL = res.data.url;
            imToken = res.data.token;
            return ctx.$msim.login({
              wsUrl: res.data.url,
              imToken: res.data.token,
              subAppId: 1,
            });
          })
          .then(() => {
            loading.close();
            window.localStorage.setItem("userId", data.userId);
            window.localStorage.setItem("wsUrL", wsURL);
            window.localStorage.setItem("imToken", imToken);
            store.commit("setUserId", data.userId);
            router.push({ name: "chats" });
          })
          .catch((err) => {
            if (err?.msg) {
              ctx.$toast(err.msg);
            }
          });
      }
    }
    return {
      data,
      login,
    };
  },
};
</script>

<style scoped>
.login_wrapper {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.login_cont {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-bottom: 20px;
  width: 80vw;
  background: #fff;
  color: #000;
  border-radius: 5px;
  box-shadow: var(--shadow);
  position: relative;
  z-index: 10;
}

.row_div {
  width: 100%;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color_block_1 {
  width: 33%;
  height: 100%;
  background-color: rgb(0, 110, 255);
}
.color_block_2 {
  width: 34%;
  height: 100%;
  background-color: rgb(0, 164, 255);
}
.color_block_3 {
  width: 33%;
  height: 100%;
  background-color: rgb(90, 213, 224);
}
.title {
  padding: 30px 0 0px;
  text-align: center;
  font-size: 18px;
  color: rgb(51, 51, 51);
}
.logo {
  width: 80px;
  height: 80px;
}
</style>