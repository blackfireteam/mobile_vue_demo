import { createStore } from "vuex";
const store = createStore({
  state() {
    return {
      curUserId: null, // 当前登录用户ID
      chatList: [], // 会话列表
      msgList: [], // 消息列表
      curConversationID: null, // 当前会话ID
    };
  },
  mutations: {
    clear(state) {
      state.curUserId = null;
      state.chatList = [];
      state.msgList = [];
      state.curConversationID = null;
    },
    setUserId(state, userId) {
      state.curUserId = userId;
    },
    clearChats(state) {
      state.chatList = [];
    },
    addChats(state, chats) {
      state.chatList.push(...chats);
    },
    addChat(state, chat) {
      state.chatList.unshift(chat);
    },
    changeChat(state, conversationID) {
      state.curConversationID = conversationID;
      state.msgList = [];
    },
    updateChats(state, chats) {
      chats.forEach((newChat) => {
        if (newChat.deleted) {
          // 如果是删除会话
          state.chatList = state.chatList.filter((chat) => {
            if (newChat.conversationID === state.curConversationID) {
              state.curConversationID = null;
            }
            return chat.conversationID !== newChat.conversationID;
          });
        } else {
          // 更新其他会话
          let oldChat = state.chatList.find(
            (chat) => chat.conversationID === newChat.conversationID
          );
          if (oldChat) {
            Object.assign(oldChat, newChat);
          } else {
            state.chatList.unshift(newChat);
          }
        }
      });
      state.chatList.sort((pre, next) => {
        return next.showMsgTime - pre.showMsgTime;
      });
      if (!state.curConversationID && state.chatList.length) {
        state.curConversationID = state.chatList[0].conversationID;
        state.msgList = [];
      }
    },
    addMsgs(state, msgs) {
      state.msgList.unshift(...msgs);
    },
    addMsg(state, msg) {
      state.msgList.push(msg);
    },
    updateMsgs(state, messages) {
      if (!state.curConversationID) return;
      messages.forEach((newMsg) => {
        if (newMsg.conversationID === state.curConversationID) {
          let msg = state.msgList.find(
            (msgItem) => msgItem.onlyId === newMsg.onlyId
          );
          if (msg) {
            Object.assign(msg, newMsg);
          } else {
            state.msgList.push(newMsg);
          }
        }
      });
    },
    revokeMsgs(state, messages) {
      if (!state.curConversationID) return;
      messages.forEach((newMsg) => {
        if (newMsg.conversationID === state.curConversationID) {
          let msg = state.msgList.find(
            (msgItem) => msgItem.msgId === newMsg.msgId
          );
          if (msg) {
            Object.assign(msg, newMsg);
          }
        }
      });
    },
    updateMsg(state, msg) {
      let oldMsg = state.msgList.find(
        (msgItem) =>
          msgItem.conversationID === msg.conversationID &&
          msgItem.onlyId === msg.onlyId
      );
      if (oldMsg) {
        Object.assign(oldMsg, msg);
      }
    },
  },
});

export default store;
