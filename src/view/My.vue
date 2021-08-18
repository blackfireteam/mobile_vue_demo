<template>
  <div class="my_wrapper">
    <div class="avatar">
      <img src="@/assets/img/curUser.jpg" class="avatar_img" alt="" />
    </div>
    <van-cell-group inset>
      <van-field
        label="用户ID"
        v-model="curUserId"
        placeholder="用户名"
        readonly
      ></van-field>
      <van-field name="switch" label="是否付费">
        <template #input>
          <van-switch size="20" />
        </template>
      </van-field>
      <van-field name="switch" label="是否认证">
        <template #input>
          <van-switch size="20" />
        </template>
      </van-field>
    </van-cell-group>
    <div class="mar_16">
      <van-button round block type="danger" @click="logout">退出</van-button>
    </div>
  </div>
</template>

<script>
import { computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
export default {
  setup() {
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const store = useStore();
    const router = useRouter();
    const curUserId = computed(() => store.state.curUserId);
    function logout() {
      ctx.$msim
        .logout()
        .then((res) => {
          store.commit("clear");
          window.localStorage.removeItem("userId");
          window.localStorage.removeItem("wsUrL");
          window.localStorage.removeItem("imToken");
          router.push({ name: "login" });
        })
        .catch((err) => {
          return ctx.$message.error({
            message: err?.msg || err,
          });
        });
    }

    function isAttest() {}

    function isPay() {
      ctx.$http.post("user/iminit", {
        uid: curUserId.value,
        nick_name: "",
        avatar: "",
      });
    }

    return {
      logout,
      curUserId,
    };
  },
};
</script>

<style scoped>
.mar_16 {
  margin: 16px;
}
.my_wrapper {
  padding-top: 40px;
}
.avatar {
  width: 20vw;
  height: 20vw;
  border-radius: 50%;
  border: 2px solid #000;
  overflow: hidden;
  margin: 0 auto 20px;
}
.avatar_img {
  width: 100%;
  height: 100%;
}
</style>