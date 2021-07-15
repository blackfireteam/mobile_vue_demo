<template>
  <div class="chat_item">
    <div class="avatar">
      <!-- <van-image
        round
        width="2rem"
        height="2rem"
        src="@/assets/img/avatar.png"
      /> -->
      <img class="avatar_img" src="@/assets/img/avatar.png" alt="" />
    </div>
    <div class="info">
      <div class="user_info">
        <div class="user_name van-ellipsis">{{ chat.conversationID }}</div>
        <div class="unread_sign">
          <span v-if="chat.unread > 0" class="badge">{{ chat.unread }}</span>
        </div>
      </div>
      <div class="last_msg">
        <div class="last_msg_body van-ellipsis">
          {{
            chat.showMsgType === 1
              ? "[图片]"
              : chat.showMsgType === 2
              ? "[音频]"
              : chat.showMsgType === 3
              ? "[视频]"
              : chat.showMsgType === 31
              ? "[已撤回]"
              : chat.showMsgType === 100
              ? "[自定义消息]]"
              : chat.showMsg
          }}
        </div>
        <div class="last_msg_time">
          {{
            chat.showTime ? new Date(chat.showTime).toLocaleTimeString() : ""
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    chat: Object,
  },
};
</script>

<style scoped>
.chat_item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  overflow: hidden;
}
.avatar {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
}
.avatar_img {
  width: 100%;
  height: 100%;
}

.info {
  flex: 1;
  height: 60px;
  overflow: hidden;
  font-size: 16px;
}
.user_info {
  height: 32px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.user_name {
  color: #000;
  flex: 1;
  min-width: 0;
}
.unread_sign {
  padding-left: 10px;
  flex-shrink: 0;
  color: #76828c;
  font-size: 12px;
  box-sizing: border-box;
}
.badge {
  vertical-align: bottom;
  background-color: #f35f5f;
  border-radius: 10px;
  color: #fff;
  display: inline-block;
  font-size: 12px;
  height: 18px;
  max-width: 40px;
  line-height: 18px;
  padding: 0 6px;
  text-align: center;
  white-space: nowrap;
}

.last_msg {
  display: flex;
  align-items: center;
  padding-top: 5px;
  box-sizing: border-box;
}
.last_msg_body {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  color: #a5b5c1;
  box-sizing: border-box;
}
.last_msg_time {
  flex-shrink: 0;
  padding-left: 10px;
  font-size: 14px;
  text-align: right;
  color: #76828c;
}
</style>