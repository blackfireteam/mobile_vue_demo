<template>
  <div class="chat_wrapper">
    <van-nav-bar class="shadow_bottom" title="会话列表" />
    <div class="chat_list">
      <van-pull-refresh v-model="data.refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="data.loading"
          :finished="data.finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
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
        </van-list>
      </van-pull-refresh>
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
    const data = reactive({
      loading: false,
      finished: false,
      refreshing: false,
    });
    const ctx = getCurrentInstance().appContext.config.globalProperties;
    onMounted(() => {
      store.commit("clearChats");
    });

    function onRefresh() {
      data.finished = false;
      data.loading = true;
      onLoad();
    }

    function initChat(conversationID) {
      ctx.$msim
        .getConversationList({
          conversationID: conversationID,
        })
        .then((res) => {
          let chats = res.data.chats;
          if (chats.length > 0) {
            store.commit("addChats", chats);
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

    function onLoad() {
      if (data.refreshing) {
        store.commit("clearChats");
        data.refreshing = false;
      }
      let conversationID;
      let list = chatList.value;
      if (list.length > 0) {
        conversationID = list[list.length - 1].conversationID;
      }
      initChat(conversationID);
    }

    function chatChange(chat) {
      if (chat && chat.conversationID) {
        // TODO怎么判断已读
        if (chat.unread > 0) {
          setRead(chat.conversationID);
        }
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
          return ctx.$toast(err?.msg || err);
        });
    }
    return {
      data,
      onLoad,
      onRefresh,
      chatChange,
      deleteChat,
      chatList: chatList,
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