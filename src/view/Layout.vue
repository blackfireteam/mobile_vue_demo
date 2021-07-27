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
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";
export default {
  setup() {
    const store = useStore();
    const unreadCount = computed(() => {
      let count = 0;
      store.state.chatList.forEach((chat) => {
        count += chat.unread || 0;
      });
      return count || "";
    });
    const data = reactive({
      active: ref(1),
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