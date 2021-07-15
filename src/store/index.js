import { createStore } from "vuex";
const store = createStore({
  state() {
    return {
      curUserId: null, // 当前登录用户ID
      chatList: [], // 会话列表
      msgList: [], // 消息列表
      curChat: null, // 当前会话
      connState: null,
    }
  },
  mutations: {
    clear(state) {
      state.curUserId = null;
      state.chatList = [];
      state.msgList = [];
      state.curChat = null;
      state.connState = null
    },
    setConnState(state, val) {
      state.connState = val;
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
    changeChat(state, chat) {
      state.curChat = chat;
      state.msgList = [];
    },
    updateChats(state, chats) {
      chats.forEach((newChat) => {
        if (newChat.deleted) {
          // 如果是删除会话
          state.chatList = state.chatList.filter(
            (chat) => {
              if (newChat.conversationID === state.curChat.conversationID) {
                state.curChat = null;
              }
              return chat.conversationID !== newChat.conversationID;
            }
          );
        } else {
          // 更新其他会话
          let oldChat = state.chatList.find(chat => chat.conversationID === newChat.conversationID)
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
      if (!state.curChat && state.chatList.length) {
        state.curChat = state.chatList[0];
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
      if (!state.curChat) return;
      messages.forEach((newMsg) => {
        if (newMsg.conversationID === state.curChat.conversationID) {
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
      if (!state.curChat) return;
      messages.forEach((newMsg) => {
        console.log(412421)
        if (newMsg.conversationID === state.curChat.conversationID) {
          let msg = state.msgList.find(
            (msgItem) => msgItem.msgId === newMsg.msgId
          );
          if (msg) {
            Object.assign(msg, newMsg);
            console.log(41, msg)
          }
        }
      });
    },
    updateMsg(state, msg) {
      let oldMsg = state.msgList.find(msgItem => msgItem.conversationID === msg.conversationID && msgItem.onlyId === msg.onlyId);
      if (oldMsg) {
        console.log(oldMsg, 14141)
        Object.assign(oldMsg, msg);
      }
    }
  }
})

export default store;