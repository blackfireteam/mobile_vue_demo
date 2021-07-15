<template>
  <div class="message_wrapper">
    <div class="group_tip_wrapper" v-if="message.type === 31">
      {{ isSelf ? "你" : "对方" }}撤回了一条消息
    </div>
    <div v-else class="c2c_layout" :class="{ position_right: isSelf }">
      <div class="col_1">
        <div class="avatar">
          <img
            v-if="isSelf"
            src="@/assets/img/curUser.jpg"
            class="avatar_img"
            alt=""
          />
          <img v-else src="@/assets/img/avatar.png" class="avatar_img" alt="" />
        </div>
      </div>
      <div class="col_2">
        <div class="content_wrapper">
          <div class="message_status">
            <i v-if="message.sendStatus === 0" class="el-icon-loading"></i>
            <span
              v-else-if="isSelf && message.sendStatus === 1"
              class="revoke_btn"
              @click.stop="$emit('revoke', message)"
              >撤回</span
            >
            <i
              v-else-if="message.sendStatus === 2"
              class="el-icon-warning send_faild"
              @click.stop="$emit('resend')"
            ></i>
          </div>
          <div
            :class="isSelf ? 'message_send' : 'message_received'"
            class="message_content"
          >
            <span
              v-if="message.type === 0"
              class="text_box"
              v-html="handleMsg(message.text)"
            ></span>
            <img
              v-else-if="message.type === 1"
              class="image_element"
              :src="message.url"
            />
            <span v-else-if="message.type === 2" class="text_box">[音频]</span>
            <img
              v-else-if="message.type === 3"
              class="image_element"
              :src="message.url"
            />
            <span v-else-if="message.type === 100" class="text_box"
              >[自定义消息]</span
            >
            <span v-else>{{ message.body }}</span>
          </div>
        </div>
        <div class="base" :class="isSelf ? 'right' : 'left'">
          <div class="date">
            {{ new Date(message.showMsgTime).toLocaleString() }}
          </div>
        </div>
      </div>
      <div class="col_3"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: Object,
    isSelf: Boolean,
  },
  setup() {
    const emojiMap = require("@/assets/emoji/emojiMap.json");
    function handleMsg(text) {
      let temp = text;
      let html = "";
      let left = -1;
      let right = -1;
      while (temp.length > 0) {
        left = temp.indexOf("[");
        right = temp.indexOf("]");
        if (right > left && left > -1) {
          let img = temp.slice(left, right + 1);
          if (emojiMap[img]) {
            html += temp.slice(0, left);
            html += `<img class="emoji_icon" src="${require("@/assets/emoji/" +
              emojiMap[img])}">`;
          } else {
            html += temp.slice(0, right + 1);
          }
          temp = temp.slice(right + 1);
        } else {
          let n = right < left ? left : right;
          if (n === -1) {
            html += temp;
            temp = "";
          } else {
            html += temp.slice(0, n + 1);
            temp = temp.slice(n + 1);
          }
        }
      }
      return html;
    }
    return {
      handleMsg,
    };
  },
};
</script>
<style>
.emoji_icon {
  width: 25px;
  height: 25px;
  vertical-align: middle;
}
</style>
<style scoped>
.message_wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}
.group_tip_wrapper {
  background: #fff;
  padding: 4px 15px;
  border-radius: 3px;
  color: #a5b5c1;
  font-size: 12px;
}

.position_right {
  flex-direction: row-reverse;
}
.position_right .col_2 {
  align-items: flex-end;
}

.c2c_layout {
  display: flex;
  flex: 1;
}
.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: var(--shadow2);
}
.avatar_img {
  width: 100%;
  height: 100%;
}

.col_2 {
  display: flex;
  flex-direction: column;
}

.content_wrapper {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
.message_status {
  margin-right: 10px;
}
.send_faild {
  color: #f35f5f;
  cursor: pointer;
}
.revoke_btn {
  font-size: 12px;
  color: #6e7981;
  cursor: pointer;
}

.message_content {
  outline: none;
  font-size: 14px;
  position: relative;
  max-width: 45vw;
  word-wrap: break-word;
  word-break: break-all;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: var(--shadow2);
}
.message_content::before {
  position: absolute;
  top: 6px;
  width: 0;
  height: 0;
  content: "";
  width: 8px;
  height: 8px;
  transform: rotate(135deg);
  box-shadow: var(--shadow2);
}

.message_content::after {
  position: absolute;
  top: 4px;
  content: "";
  width: 10px;
  height: 20px;
}

.message_send {
  background-color: #5cadff;
  margin-right: 15px;
  color: #fff;
}
.message_send::before {
  right: -4px;
  background-color: #5cadff;
}
.message_send::after {
  right: 0px;
  background-color: #5cadff;
}

.message_received {
  background-color: #fff;
  margin-left: 15px;
}
.message_received::before {
  left: -4px;
  background-color: #fff;
}
.message_received::after {
  left: 0px;
  background-color: #fff;
}

.text_box {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  line-height: 25px;
}
.image_element {
  max-width: 40vw;
  /* cursor: zoom-in; */
}

.base {
  margin-top: 3px;
  color: #a5b5c1;
  font-size: 12px;
  line-height: 16px;
}

.right {
  display: flex;
  flex-direction: row-reverse;
  margin-right: 15px;
}
.left {
  flex-direction: row;
  margin-left: 15px;
}
.col_3 {
  width: 30px;
}
</style>