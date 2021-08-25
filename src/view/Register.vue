<template>
  <van-nav-bar
    class="shadow_bottom"
    title="注册"
    left-arrow
    @click-left="$router.go(-1)"
  />
  <div class="register">
    <van-form @submit="register">
      <van-cell-group inset>
        <!-- <van-field
          name="uploader"
          label="上传头像"
          :rules="[
            {
              validator: asyncValidator,
              message: '请上传头像',
            },
          ]"
        >
          <template #input>
            <van-uploader
              v-model="fileList"
              :before-read="beforeRead"
              :max-count="1"
            />
          </template>
        </van-field> -->
        <van-field
          v-model="data.phone"
          type="tel"
          name="手机号"
          label="手机号"
          placeholder="手机号"
          :rules="[{ required: true, message: '请填写手机号' }]"
        />
        <van-field
          v-model="data.nickname"
          name="昵称"
          label="昵称"
          placeholder="昵称"
          :rules="[{ required: true, message: '请填写昵称' }]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { getCurrentInstance, ref, reactive } from "vue";
export default {
  setup() {
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const data = reactive({
      phone: "",
      nickname: "",
    });
    const fileList = ref([]);
    function register() {
      const loading = ctx.$toast.loading({
        message: "提交中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      let url =
        "https://msim-test-1252460681.cos.na-siliconvalley.myqcloud.com/pers/612FA7A3-144E-4978-A75C-9D9277167292.jpeg";
      ctx.$http
        .post("user/reg", {
          uid: data.phone,
          nick_name: data.nickname,
          avatar: url,
          verified: true, // 是否认证
          gold: true, // 是否是gold
          gold_exp_time: 0, // gold过期时间
          approved: true, // 是否是过审
          disabled: false, // 是否disable
          blocked: false, //	是否block
          hold: false, // 是否im hold
          deleted: false, // 是否im deleted
        })
        .then((res) => {
          loading.close();
          ctx.$toast.success("注册成功");
          ctx.$router.push("login");
        });
    }

    function asyncValidator(val) {
      return val.length > 0;
    }

    return {
      data,
      fileList,
      register,
      asyncValidator,
    };
  },
};
</script>

<style scoped>
.register {
  margin-top: 100px;
}
</style>