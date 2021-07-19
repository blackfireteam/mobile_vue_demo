<template>
  <router-view />
</template>

<script>
import { getCurrentInstance, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
export default {
  name: "App",
  setup() {
    const { $IM, $msim } =
      getCurrentInstance().appContext.config.globalProperties;
    const store = useStore();
    const router = useRouter();

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
      $msim.on($IM.EVENT.MESSAGE_RECEIVED, received);
      $msim.on($IM.EVENT.MESSAGE_REVOKED, revoked);
      $msim.on($IM.EVENT.CONVERSATION_LIST_UPDATED, updateChats);
      let userId = window.localStorage.getItem("userId") || null;
      store.commit("setUserId", userId);
    }

    // 网络状态监听
    function wsChange(options) {
      console.log("连接状态变更", options);
      store.commit("setConnState", options.data.state);
    }
    // 登录
    function login(options) {
      console.log("登录成功", options);
      let userId = window.localStorage.getItem("userId");
      if (userId) {
        store.commit("setUserId", userId);
        router.push({ name: "home" });
      }
    }
    // 退出
    function logout(options) {
      console.log(options);
      store.commit("clear");
      router.push({ name: "login" });
    }
    // 被踢
    function kickedOut(options) {
      console.log(options);
      store.commit("clear");
      router.push({ name: "login" });
    }
    // token失效
    function tokenNotFound(options) {
      console.log(options);
      store.commit("clear");
      router.push({ name: "login" });
    }
    // 同步会话状态
    function syncChats(options) {
      console.log("同步会话", options);
    }
    // 接收消息
    function received(options) {
      console.log("接收到消息", options);
      store.commit("updateMsgs", options.data);
    }
    // 撤回消息
    function revoked(options) {
      console.log("接收到撤回消息", options);
      store.commit("revokeMsgs", options.data);
    }
    // 更新会话
    function updateChats(options) {
      console.log("会话列表更新", options.data);
      store.commit("updateChats", options.data);
    }

    return {};
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
