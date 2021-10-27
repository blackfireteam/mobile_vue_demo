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
        <van-grid :gutter="10">
          <van-grid-item>
            <van-uploader
              :accept="acceptTypes.join()"
              :after-read="afterRead"
              :before-read="beforeRead"
              :max-count="1"
            >
              <van-icon class="more_icon" name="photo" />
            </van-uploader>
          </van-grid-item>
        </van-grid>
      </div>
    </div>
    <div
      class="footer_more emoji_wrapper"
      :class="{ is_head_more: isHideEmoji }"
    >
      <div class="more_cont">
        <van-grid :gutter="10" column-num="8">
          <van-grid-item
            @click.stop="selectEmoji(item)"
            :title="item.key"
            v-for="item in emojiJson"
            :key="item.key"
            :icon="require(`@/assets/emoji/${item.url}`)"
          >
          </van-grid-item>
        </van-grid>
      </div>
      <div class="clear_btn" @click.stop="clearMsg()">
        <van-icon name="cross" />
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, reactive, nextTick } from "vue";
import { useStore } from "vuex";
import { getCosOptions } from "@/utils/getCos.js";
export default {
  props: {
    isHideEmoji: Boolean,
    isHideMore: Boolean,
    uid: Number,
  },
  setup(props, context) {
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const store = useStore();
    const acceptTypes = ["image/jpg", "image/jpeg", "image/gif", "image/png"];
    const emojiJson = require("@/assets/json/emoji.json");
    const emojiMap = require("@/assets/json/emojiMap.json");
    const data = reactive({
      msgText: "",
    });

    function clearMsg(e) {
      let strEnd = data.msgText.length;
      if (e) {
        strEnd = e.target.selectionEnd;
      }
      if (strEnd === 0) return;
      let temp = data.msgText;
      let curKey = data.msgText.slice(strEnd - 1, strEnd);
      if (curKey === "]") {
        let left = data.msgText.lastIndexOf("[", strEnd - 1);
        if (left > -1) {
          let img = temp.slice(left, strEnd);
          if (emojiMap[img]) {
            data.msgText =
              data.msgText.slice(0, left) + data.msgText.slice(strEnd);
            if (e) {
              nextTick(() => {
                e.target.setSelectionRange(left - 1, left - 1);
              });
            }
            return;
          }
        }
      }
      data.msgText =
        data.msgText.slice(0, strEnd - 1) + data.msgText.slice(strEnd);
      if (e) {
        nextTick(() => {
          e.target.setSelectionRange(strEnd - 1, strEnd - 1);
        });
      }
    }

    // 选择表情
    function selectEmoji(emoji) {
      data.msgText += emoji.key;
    }

    // 发送文本消息
    function sendText() {
      if (!data.msgText.trim()) {
        data.msgText = "";
        return ctx.$toast("不能发空消息");
      }
      let result = ctx.$msim.createTextMessage({
        to: props.uid,
        payload: {
          text: data.msgText,
        },
      });
      data.msgText = "";
      store.commit("addMsg", result.message);
      context.emit("scrollB");
      sendMsg(result.message);
    }

    // 发送消息
    function sendMsg(msgObj) {
      ctx.$msim
        .sendMessage(msgObj)
        .then((res) => {
          msgObj.sendStatus = res.data.sendStatus;
          msgObj.msgId = res.data.msgId;
        })
        .catch((err) => {
          nextTick(() => {
            msgObj.sendStatus =
              ctx.$IM.TYPES.SEND_STATE.BFIM_MSG_STATUS_SEND_FAIL;
            return ctx.$toast({
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
          return ctx.$toast({
            message: err?.msg || err,
          });
        });
    }

    function beforeRead(file) {
      if (acceptTypes.includes(file.type.toLowerCase())) {
        return true;
      } else {
        ctx.$toast("目前只支持jpg,jpeg,png,gif格式文件");
        return false;
      }
    }

    // 选择图片
    function afterRead(fileObj) {
      let file = fileObj.file;
      // im_image
      // im_video
      // im_voice
      let fileExtension = file.type.slice(6).toLowerCase();
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        let image = new Image();
        image.src = e.target.result;
        image.onload = function () {
          let width = this.width;
          let height = this.height;
          let result = ctx.$msim.createImageMessage({
            to: props.uid,
            payload: {
              height: height,
              width: width,
              url: e.target.result,
              progress: 0,
            },
          });
          context.emit("hide");
          store.commit("addMsg", result.message);
          getCosOptions().then((options) => {
            uploadFile(result.message, fileExtension, file, options);
          });
        };
      };
    }

    // 上传图片到云
    function uploadFile(msgObj, fileExtension, file, options) {
      let name = new Date().getTime();
      options.cos.putObject(
        {
          Bucket: options.cosConfig.bucket /* 必须 */,
          Region: options.cosConfig.region /* 存储桶所在地域，必须字段 */,
          Key: `${options.cosConfig.path}/${name}.${fileExtension}` /* 必须 */,
          Body: file.raw,
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
    }

    return {
      data,
      emojiJson,
      acceptTypes,
      clearMsg,
      selectEmoji,
      sendText,
      resend,
      afterRead,
      beforeRead,
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
  flex: 1;
  padding: 20px 10px;
}

.footer_more.is_head_more {
  height: 0px;
}

.more_wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
}

.more_icon {
  font-size: 40px;
  color: #2880e6;
}

.emoji_wrapper {
  position: relative;
  --van-grid-item-content-padding: 0;
  --van-grid-item-content-background-color: transparent;
}

.clear_btn {
  position: fixed;
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
.footer_more.is_head_more .clear_btn {
  position: absolute;
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