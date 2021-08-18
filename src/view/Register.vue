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
        <van-field
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
        </van-field>
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
import COS from "@/assets/js/cos-js-sdk-v5.min.js";
export default {
  setup() {
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const data = reactive({
      phone: "",
      nickname: "",
    });
    const fileList = ref([]);
    let bucket = "msim-1252460681";
    let region = "ap-chengdu";
    let cos = new COS({
      SecretId: "AKIDiARZwekKIK7f18alpjsqdOzmQAplexA5",
      SecretKey: "f7MLJ3YnoX2KLKBmBeAVeWNVLaYEmGYa",
    });
    function register() {
      const loading = ctx.$toast.loading({
        message: "提交中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      afterRead(fileList.value[0])
        .then((url) => {
          return ctx.$http.post("user/reg", {
            uid: data.phone,
            nick_name: data.nickname,
            avatar: url,
            verified: true, // 是否认证
            gold: true, // 是否是gold
            gold_exp_time: true, // gold过期时间
            approved: true, // 是否是过审
            disabled: true, // 是否disable
            blocked: true, //	是否block
            hold: true, // 是否im hold
            deleted: true, // 是否im deleted
          });
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

    function afterRead(fileObj) {
      return new Promise((resolve, reject) => {
        try {
          fileObj.status = "uploading";
          fileObj.message = "上传中...";
          let file = fileObj.file;
          // im_image
          // im_video
          // im_voice
          let fileExtension = file.type.slice(6).toLowerCase();
          let name = new Date().getTime();
          cos.putObject(
            {
              Bucket: bucket /* 必须 */,
              Region: region /* 存储桶所在地域，必须字段 */,
              Key: `common/${name}.${fileExtension}` /* 必须 */,
              Body: file,
            },
            (err, data) => {
              if (data && data.statusCode === 200) {
                fileObj.status = "success";
                fileObj.message = "上传成功";
                resolve("https://" + data.Location);
              } else {
                reject(err);
              }
            }
          );
        } catch (err) {
          reject(err);
        }
      });
    }
    function beforeRead(file) {
      if (
        file.type === "image/jpg" ||
        file.type === "image/jpeg" ||
        file.type === "image/gif" ||
        file.type === "image/png"
      ) {
        return true;
      } else {
        ctx.$toast("目前只支持jpg,jpeg,png,gif格式文件");
        return false;
      }
    }
    return {
      data,
      fileList,
      register,
      beforeRead,
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