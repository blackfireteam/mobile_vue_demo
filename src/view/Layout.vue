<template>
  <div class="layout_wrapper">
    <div class="main_wrapper">
      <router-view />
    </div>
    <div class="footer_wrapper">
      <van-tabbar v-model="data.active" route="true">
        <van-tabbar-item icon="search" to="/search">search</van-tabbar-item>
        <van-tabbar-item icon="chat-o" to="/chats" badge="10"
          >Chats</van-tabbar-item
        >
        <van-tabbar-item icon="contact" to="/my">My</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script>
import { onMounted, getCurrentInstance, reactive, ref } from "vue";
export default {
  setup() {
    const data = reactive({
      active: ref(1),
    });
    return {
      data,
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