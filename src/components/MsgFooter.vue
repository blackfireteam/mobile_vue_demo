<template>
  <div class="footer_wrapper">
    <div class="footer_input">
      <van-field
        v-model="data.msgText"
        placeholder="发送聊天内容"
        @keydown.delete.prevent="clearMsg"
      />
      <van-icon
        class="emoji_btn"
        name="smile-o"
        color="#666"
        size="42"
        @click.stop="$emit('showEmoji')"
      />
      <van-button
        v-show="!data.msgText"
        round
        icon="plus"
        color="#666"
        plain
        size="small"
        @click.stop="$emit('showMore')"
      ></van-button>
      <van-button
        v-show="data.msgText"
        @click="sendText"
        type="success"
        size="mini"
        >发送</van-button
      >
    </div>
    <div class="footer_more more_wrapper" :class="{ is_head_more: isHideMore }">
      <div class="more_cont">
        <div class="more_item">
          <van-uploader
            accept="image/*"
            :after-read="selectFile"
            @click.stop=""
          >
            <van-icon name="photo" />
          </van-uploader>
        </div>
      </div>
    </div>
    <div
      class="footer_more emoji_wrapper"
      :class="{ is_head_more: isHideEmoji }"
    >
      <div class="more_cont">
        <img
          :src="require(`@/assets/emoji/${item.url}`)"
          class="emoji_item"
          @click.stop="selectEmoji(item)"
          :title="item.key"
          v-for="item in emojiJson"
          :key="item.key"
        />
      </div>
      <div class="clear_btn" @click.stop="clearMsg">
        <van-icon name="cross" />
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, reactive, nextTick } from "vue";
import COS from "@/assets/js/cos-js-sdk-v5.min.js";
import { useStore } from "vuex";
export default {
  props: {
    isHideEmoji: Boolean,
    isHideMore: Boolean,
    curChat: Object,
  },
  setup(props, context) {
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const store = useStore();
    const emojiJson = require("@/assets/emoji/emoji.json");
    const emojiMap = require("@/assets/emoji/emojiMap.json");
    const data = reactive({
      msgText: "",
    });

    let bucket = "msim-1252460681";
    let region = "ap-chengdu";
    let cos = new COS({
      SecretId: "AKIDiARZwekKIK7f18alpjsqdOzmQAplexA5",
      SecretKey: "f7MLJ3YnoX2KLKBmBeAVeWNVLaYEmGYa",
    });

    function clearMsg() {
      let temp = data.msgText;
      if (data.msgText.slice(-1) === "]") {
        let left = data.msgText.lastIndexOf("[");
        if (left > -1) {
          let img = temp.slice(left);
          if (emojiMap[img]) {
            return (data.msgText = data.msgText.slice(0, left));
          }
        }
      }
      data.msgText = data.msgText.slice(0, -1);
    }

    // 选择表情
    function selectEmoji(emoji) {
      data.msgText += emoji.key;
    }

    // 发送文本消息
    function sendText() {
      if (!data.msgText.trim()) {
        data.msgText = "";
        return ctx.$message.info("不能发空消息");
      }
      let msgObj = ctx.$msim.createTextMessage({
        to: props.curChat.uid,
        payload: {
          text: data.msgText,
        },
      });
      data.msgText = "";
      if (msgObj) {
        sendMsg(msgObj);
      }
    }

    // 发送消息
    function sendMsg(msgObj) {
      store.commit("addMsg", msgObj);
      let oldMsg = store.state.msgList[store.state.msgList.length - 1];
      context.emit("scrollB");
      ctx.$msim
        .sendMessage(msgObj)
        .then((res) => {
          oldMsg.sendStatus = res.data.sendStatus;
          oldMsg.msgId = res.data.msgId;
        })
        .catch((err) => {
          nextTick(() => {
            oldMsg.sendStatus =
              ctx.$IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SEND_FAIL;
            return ctx.$message.error({
              message: err?.msg || err,
            });
          });
        });
    }

    // 重发
    function resend(msgObj) {
      msgObj.sendStatus = 0;
      ctx.$msim
        .resendMessage(msgObj)
        .then((res) => {
          msgObj.sendStatus = res.data.sendStatus;
          msgObj.msgId = res.data.msgId;
        })
        .catch((err) => {
          msgObj.sendStatus = 2;
          return ctx.$message.error({
            message: err?.msg || err,
          });
        });
    }

    // 选择图片
    function selectFile(fileObj) {
      let file = fileObj.file;
      // im_image
      // im_video
      // im_voice
      let fileExtension = file.name.split(".").pop().toLowerCase();
      if (
        fileExtension !== "jpg" &&
        fileExtension !== "jpeg" &&
        fileExtension !== "png" &&
        fileExtension != "gif"
      ) {
        return ctx.$message.error({
          message: "目前只支持jpe,jpeg,png,gif格式文件",
        });
      }
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        let image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          let width = this.width;
          let height = this.height;
          let msgObj = ctx.$msim.createImageMessage({
            to: props.curChat.uid,
            payload: {
              height: height,
              width: width,
              url: "",
              progress: 0,
            },
          });
          let name = new Date().getTime();
          context.emit("hide");
          cos.putObject(
            {
              Bucket: bucket /* 必须 */,
              Region: region /* 存储桶所在地域，必须字段 */,
              Key: `im_image/${name}.${fileExtension}` /* 必须 */,
              Body: file,
              onProgress: (progressData) => {
                msgObj.progress = progressData.percent * 100;
              },
            },
            (err, data) => {
              if (data && data.statusCode === 200) {
                msgObj.url = "https://" + data.Location;
                if (msgObj) {
                  sendMsg(msgObj);
                }
              }
            }
          );
        };
      };
    }
    return {
      data,
      emojiJson,
      clearMsg,
      selectEmoji,
      sendText,
      resend,
      selectFile,
    };
  },
};
</script>

<style scoped>
.footer_more {
  height: 200px;
  transition: height 0.2s;
  color: #eee;
  overflow: auto;
}
.more_cont {
  padding: 5vw;
}

.footer_more.is_head_more {
  height: 0px;
}

.more_wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
}

.more_item {
  font-size: 40px;
  color: #2880e6;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #fff;
}

.emoji_wrapper {
  position: relative;
}
.clear_btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 5px 15px;
  background-color: #fff;
  color: #000;
  font-size: 25px;
  font-weight: bold;
  border-radius: 5px;
  box-shadow: var(--shadow);
}

.emoji_item {
  width: 9vw;
  padding-right: 2vw;
  padding-bottom: 2vw;
}

.footer_input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background-color: #fff;
  --van-cell-vertical-padding: 5px;
  padding: 0 15px;
}
.footer_wrapper .van-cell {
  flex: 1;
  border: 1px solid #666;
  border-radius: 4px;
}
.footer_wrapper .emoji_btn {
  margin-left: 10px;
  margin-right: 10px;
}
.footer_wrapper .van-button--mini {
  width: 50px;
}
</style>