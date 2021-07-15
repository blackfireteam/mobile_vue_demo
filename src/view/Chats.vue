<template>
  <div class="chat_wrapper">
    <van-nav-bar class="shadow_bottom" title="会话列表" />
    <div class="chat_list" @scroll.passive="chatScroll">
      <van-swipe-cell
        class="goods_card"
        :key="item.conversationID"
        v-for="item in chatList"
      >
        <ChatItem @click="chatChange(item)" :chat="item"></ChatItem>
        <template #right>
          <van-button
            text="删除"
            type="danger"
            square
            @click="deleteChat(item)"
            class="delete_button"
          />
        </template>
      </van-swipe-cell>
      <van-swipe-cell
        class="goods_card"
        :key="item.conversationID"
        v-for="item in chatList"
      >
        <ChatItem @click="chatChange(item)" :chat="item"></ChatItem>
        <template #right>
          <van-button
            text="删除"
            type="danger"
            square
            @click="deleteChat(item)"
            class="delete_button"
          />
        </template>
      </van-swipe-cell>
      <van-swipe-cell
        class="goods_card"
        :key="item.conversationID"
        v-for="item in chatList"
      >
        <ChatItem @click="chatChange(item)" :chat="item"></ChatItem>
        <template #right>
          <van-button
            text="删除"
            type="danger"
            square
            @click="deleteChat(item)"
            class="delete_button"
          />
        </template>
      </van-swipe-cell>
      <van-swipe-cell
        class="goods_card"
        :key="item.conversationID"
        v-for="item in chatList"
      >
        <ChatItem @click="chatChange(item)" :chat="item"></ChatItem>
        <template #right>
          <van-button
            text="删除"
            type="danger"
            square
            @click="deleteChat(item)"
            class="delete_button"
          />
        </template>
      </van-swipe-cell>
    </div>
  </div>
</template>

<script>
import ChatItem from "@/components/ChatItem.vue";
import { computed, onMounted, getCurrentInstance, watch, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
export default {
  components: {
    ChatItem,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const chatList = computed(() => store.state.chatList);
    const connState = computed(() => store.state.connState);
    const data = reactive({
      dialogVisible: false,
      userId: null,
    });
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    onMounted(() => {
      store.commit("clearChats");
      initChat();
    });

    function initChat(conversationID) {
      ctx.$msim
        .getConversationList({
          conversationID: conversationID,
        })
        .then((res) => {
          let chats = res.data.chats;
          if (chats.length > 0) {
            store.commit("addChats", chats, true);
          }
        })
        .catch((err) => {
          return ctx.$toast.fail(err?.msg || err);
        });
    }

    function chatScroll(evt) {
      let scrollTop = evt.target.scrollTop;
      let clientHeight = evt.target.clientHeight;
      let heigth = evt.target.scrollHeight;
      let list = chatList.value;
      if (scrollTop + clientHeight >= heigth) {
        if (list && list.length > 0) {
          let conversationID = list[list.length - 1].conversationID;
          initChat(conversationID);
        }
      }
    }

    function chatChange(chat) {
      if (chat && chat.conversationID) {
        // TODO怎么判断已读
        store.commit("changeChat", chat);
        router.push("/messages/" + chat.conversationID);
      }
    }
    function setRead(conversationID) {
      ctx.$msim.setMessageRead({
        conversationID: conversationID,
      });
    }
    function deleteChat(chat) {
      ctx.$msim
        .deleteConversation({
          conversationID: chat.conversationID,
        })
        .then((res) => {
          return ctx.$toast.success(`删除会话[${chat.conversationID}]成功`);
        })
        .catch((err) => {
          return ctx.$toast.fail(err?.msg || err);
        });
    }
    function contact() {
      if (!data.userId || data.userId == store.state.curUserId) {
        cancel();
        return;
      }
      let chat = chatList.value.find((chatItem) => chatItem.uid == data.userId);
      if (!chat) {
        chat = {
          conversationID: "C2C_" + data.userId,
          uid: parseInt(data.userId),
        };
        store.commit("addChat", chat);
      }
      store.commit("changeChat", chat);
      cancel();
    }
    function cancel() {
      data.userId = null;
      data.dialogVisible = false;
    }
    return {
      data,
      cancel,
      contact,
      chatScroll,
      chatChange,
      deleteChat,
      chatList: chatList,
      connState: connState,
    };
  },
};
</script>

<style scoped>
.chat_wrapper {
  height: 100%;
}
.chat_list {
  height: calc(100% - 100px);
  overflow: auto;
  flex: 1;
}
.goods_card {
  margin: 0;
  background-color: #fff;
  border-bottom: 1px solid #ccc;
}

.delete_button {
  height: 100%;
}
</style>