<template>
  <router-view v-if="data.isInit" />
</template>

<script>
import { getCurrentInstance, onMounted, reactive, nextTick } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
export default {
  name: "App",
  setup() {
    const { $IM, $msim, $toast } =
      getCurrentInstance().appContext.config.globalProperties;
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const data = reactive({
      isInit: false,
    });
    onMounted(() => {
      initListener();
    });
    function initListener() {
      $msim.on($IM.EVENT.CONNECT_CHANGE, wsChange);
      $msim.on($IM.EVENT.LOGIN, login);
      $msim.on($IM.EVENT.LOGOUT, logout);
      $msim.on($IM.EVENT.KICKED_OUT, kickedOut);
      $msim.on($IM.EVENT.TOKEN_NOT_FOUND, tokenNotFound);
      $msim.on($IM.EVENT.SYNC_CHATS_CHANGE, syncChats);
      $msim.on($IM.EVENT.CONVERSATION_LIST_UPDATED, updateChats);
      let userId = window.localStorage.getItem("userId") || null;
      if (userId) {
        data.isInit = false;
        let wsUrL = window.localStorage.getItem("wsUrL");
        let imToken = window.localStorage.getItem("imToken");
        const loading = $toast.loading({
          message: "登陆中...",
          forbidClick: true,
          duration: 0,
          loadingType: "spinner",
        });
        $msim
          .login({
            wsUrl: wsUrL,
            imToken: imToken,
          })
          .then((loginRes) => {
            loading.close();
            store.commit("setUserId", userId);
          })
          .catch((err) => {
            if (err?.msg) {
              $toast(err.msg);
            }
          })
          .finally(() => {
            data.isInit = true;
          });
      } else {
        if (route.name !== "login") {
          router.push({ name: "login" });
        }
        data.isInit = true;
      }
    }

    function clear() {
      window.localStorage.removeItem("userId");
      window.localStorage.removeItem("wsUrL");
      window.localStorage.removeItem("imToken");
      store.commit("clear");
      router.push({ name: "login" });
    }

    // 网络状态监听
    function wsChange(options) {
      console.log("连接状态变更", options);
    }
    // 登录
    function login(options) {
      console.log("登录成功", options);
      let userId = window.localStorage.getItem("userId");
      if (userId) {
        store.commit("setUserId", userId);
        if (route.name === "login") {
          router.push({ name: "home" });
        }
      }
    }
    // 退出
    function logout(options) {
      console.log("退出成功", options);
      clear();
    }
    // 被踢
    function kickedOut(options) {
      console.log("被踢", options);
      clear();
    }
    // token失效
    function tokenNotFound(options) {
      console.log("token失效", options);
      clear();
    }
    // 同步会话状态
    function syncChats(options) {
      console.log("同步会话", options);
    }
    // 更新会话
    function updateChats(options) {
      console.log("会话列表更新", options.data);
      store.commit("updateChats", options.data);
      $msim.getAllUnreadCount().then((res) => {
        console.log(1414, res);
        store.commit("setUnread", res.data.unread);
      });
    }

    return { data };
  },
};
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  --shadow: 0 11px 20px 0 rgb(0 0 0 / 30%);
  --shadow2: 0 5px 10px 0 rgb(0 0 0 / 10%);
  --shadow3: 0 2px 0 0 rgb(0 0 0 / 10%);
}
.shadow_bottom {
  box-shadow: var(--shadow3);
}
::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #c4c4c4;
}
::-webkit-scrollbar-track {
  border-radius: 10px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  background-color: #eee;
}
#app ::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}
</style>
