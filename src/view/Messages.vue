<template>
  <div class="content" @click="hideAll">
    <van-nav-bar
      :title="curChat.conversationID"
      left-arrow
      @click-left="$router.go(-1)"
    />
    <div class="message_list" ref="msgRef">
      <van-list
        v-model:loading="data.loading"
        :finished="data.finished"
        finished-text="没有更多了"
        direction="up"
        @load="onLoad"
      >
        <MsgItem
          v-for="item in msgList"
          :key="item.msgId"
          :message="item"
          :isSelf="item.fromUid != curChat.uid"
          @preview="preview(item)"
          @revoke="revoke"
          @resend="sendRef.resend(item)"
        ></MsgItem>
      </van-list>
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
  <van-image-preview
    v-model:show="data.show"
    :images="data.images"
    :startPosition="data.imageListIndex"
  >
  </van-image-preview>
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
import { useRoute } from "vue-router";
import MsgItem from "@/components/MsgItem.vue";
import MsgFooter from "@/components/MsgFooter.vue";
export default {
  components: {
    MsgItem,
    MsgFooter,
  },
  setup(props, context) {
    const store = useStore();
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    const msgRef = ref("msgList");
    const sendRef = ref("sendRef");
    const route = useRoute();
    const msgList = computed(() => store.state.msgList);
    const curChat = computed(() => store.state.curChat);
    if (curChat.value === null) {
      store.commit("changeChat", {
        conversationID: route.params.id,
      });
    }
    const data = reactive({
      loading: false,
      finished: false,
      isHideMore: true,
      isHideEmoji: true,
      show: false,
      imageListIndex: 0,
      images: [],
    });
    let imgMsgIdObj = {};

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
        data.images = [];
        if (count > 0) {
          store.state.msgList.forEach((item) => {
            if (item.type === ctx.$IM.TYPES.MSG_TYPE.Img) {
              data.images.push(item.url);
              imgMsgIdObj[item.msgId] = data.images.length - 1;
            }
          });
        }
        if (prevCount > 0 && count > prevCount) {
          let el = msgRef.value;
          if (el) {
            let scrollTop = el.scrollTop;
            let clientHeight = el.clientHeight;
            let heigth = el.scrollHeight;
            if (scrollTop > 0 && heigth - 100 < clientHeight + scrollTop) {
              scrollBottom();
            }
          }
        }
      }
    );

    onMounted(() => {
      // initMessage();
    });

    function preview(item) {
      if (item.type !== ctx.$IM.TYPES.MSG_TYPE.Img) return;
      data.imageListIndex = imgMsgIdObj[item.msgId];
      data.show = true;
    }

    function initMessage(msgId) {
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
          } else {
            data.finished = true;
          }
          data.loading = false;
        })
        .catch((err) => {
          data.loading = false;
          return ctx.$toast(err?.msg || err);
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
          return ctx.$toast(err?.msg || err);
        });
    }

    function scrollBottom() {
      nextTick(() => {
        if (msgRef.value) {
          msgRef.value.scrollTop = msgRef.value.scrollHeight;
        }
      });
    }
    function onLoad() {
      let msgId;
      if (msgList.value && msgList.value.length > 0) {
        msgId = msgList.value[0].msgId;
      }
      initMessage(msgId);
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
      onLoad,
      preview,
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
  overflow: auto;
  padding: 0 10px;
  height: calc(100% - 50px);
}
</style>