<template>
  <div class="content" @click="hideAll">
    <van-nav-bar
      :title="curChat.conversationID"
      left-arrow
      @click-left="$router.go(-1)"
    />
    <div class="message_list" ref="msgRef" @scroll.passive="msgScroll">
      <MsgItem
        v-for="item in msgList"
        :key="item.msgId"
        :message="item"
        :isSelf="item.fromUid != curChat.uid"
        @revoke="revoke"
        @resend="sendRef.resend(item)"
      ></MsgItem>
    </div>
    <MsgFooter
      :isHideMore="data.isHideMore"
      :isHideEmoji="data.isHideEmoji"
      :curChat="curChat"
      ref="sendRef"
      @scrollB="scrollBottom"
      @showMore="showMore"
      @showEmoji="showEmoji"
      @hide="hideAll"
    />
  </div>
</template>

<script>
import {
  computed,
  onMounted,
  getCurrentInstance,
  ref,
  watch,
  nextTick,
  reactive,
} from "vue";
import { useStore } from "vuex";
import MsgItem from "@/components/MsgItem.vue";
import MsgFooter from "@/components/MsgFooter.vue";
export default {
  components: {
    MsgItem,
    MsgFooter,
  },
  setup(props) {
    const store = useStore();
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const msgRef = ref("msgList");
    const sendRef = ref("sendRef");
    const msgList = computed(() => store.state.msgList);
    const curChat = computed(() => store.state.curChat);
    let msgMoreState = false;
    const data = reactive({
      isHideMore: true,
      isHideEmoji: true,
    });

    watch(
      () => curChat.value,
      (count, prevCount) => {
        if (count?.conversationID !== prevCount?.conversationID) {
          initMessage();
        }
      }
    );
    watch(
      () => msgList.value.length,
      (count, prevCount) => {
        if (prevCount > 0 && count > prevCount) {
          let el = msgRef.value;
          let scrollTop = el.scrollTop;
          let clientHeight = el.clientHeight;
          let heigth = el.scrollHeight;
          if (scrollTop > 0 && heigth - 100 < clientHeight + scrollTop) {
            scrollBottom();
          }
        }
      }
    );

    onMounted(() => {
      initMessage();
    });

    function initMessage(msgId) {
      msgMoreState = true;
      ctx.$msim
        .getMessageList({
          conversationID: curChat.value.conversationID,
          msgEnd: msgId,
        })
        .then((res) => {
          let msgs = res.data.messages;
          if (msgs && msgs.length > 0) {
            store.commit("addMsgs", msgs);
            if (!msgId) {
              scrollBottom();
            }
          }
        })
        .catch((err) => {
          return ctx.$toast.fail(err?.msg || err);
        })
        .finally(() => {
          msgMoreState = false;
        });
    }

    function revoke(msgObj) {
      ctx.$msim
        .revokeMessage({
          conversationID: msgObj.conversationID,
          msgId: msgObj.msgId,
        })
        .then((res) => {
          msgObj.type = 31;
          return ctx.$toast.success("撤回成功");
        })
        .catch((err) => {
          return ctx.$toast.fail(err?.msg || err);
        });
    }

    function scrollBottom() {
      nextTick(() => {
        msgRef.value.scrollTop = msgRef.value.scrollHeight;
      });
    }
    function msgScroll() {
      if (msgMoreState) return;
      let el = msgRef.value;
      let scrollTop = el.scrollTop;
      let clientHeight = el.clientHeight;
      let heigth = el.scrollHeight;
      if (scrollTop < 20 && heigth > clientHeight) {
        let msgId;
        if (msgList.value && msgList.value.length > 0) {
          msgId = msgList.value[0].msgId;
          initMessage(msgId);
        }
      }
    }
    function hideAll() {
      if (!data.isHideMore) data.isHideMore = true;
      if (!data.isHideEmoji) data.isHideEmoji = true;
    }
    function showMore() {
      if (data.isHideMore) data.isHideMore = false;
      if (!data.isHideEmoji) data.isHideEmoji = true;
    }
    function showEmoji() {
      if (data.isHideEmoji) data.isHideEmoji = false;
      if (!data.isHideMore) data.isHideMore = true;
    }
    return {
      data,
      msgRef,
      sendRef,
      showMore,
      showEmoji,
      hideAll,
      revoke,
      msgScroll,
      scrollBottom,
      curChat: curChat,
      msgList: msgList,
    };
  },
};
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: #eee;
}
.message_list {
  width: 100%;
  box-sizing: border-box;
  overflow-y: scroll;
  padding: 0 10px;
  height: calc(100% - 50px);
}
</style>