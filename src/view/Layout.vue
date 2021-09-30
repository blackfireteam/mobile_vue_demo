<template>
  <div class="layout_wrapper">
    <div class="main_wrapper">
      <router-view />
    </div>
    <div class="footer_wrapper">
      <van-tabbar v-model="data.active" route="true">
        <van-tabbar-item icon="search" to="/search">search</van-tabbar-item>
        <van-tabbar-item icon="chat-o" to="/chats" :badge="unreadCount"
          >Chats</van-tabbar-item
        >
        <van-tabbar-item icon="contact" to="/my">My</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
export default {
  setup() {
    const { $msim } = getCurrentInstance().appContext.config.globalProperties;
    const store = useStore();
    const unreadCount = computed(() => store.state.allUnread || "");
    const data = reactive({
      active: ref(1),
    });
    onMounted(() => {
      $msim.getAllUnreadCount().then((res) => {
        store.commit("setUnread", res.data.unread);
      });
    });
    return {
      data,
      unreadCount: unreadCount,
    };
  },
};
</script>

<style scoped>
.layout_wrapper {
  height: 100%;
}
.main_wrapper {
  height: 100%;
  background-color: #eee;
}
</style>