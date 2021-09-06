import { createRouter, createWebHashHistory } from "vue-router";
import Login from "../view/Login.vue";
import Register from "../view/Register.vue";
import Layout from "../view/Layout.vue";
import Chats from "../view/Chats.vue";
import Search from "../view/Search.vue";
import My from "../view/My.vue";
import Messages from "../view/Messages.vue";

const routerHistory = createWebHashHistory();

const router = createRouter({
  history: routerHistory,
  routes: [
    /* 登录页 */
    {
      path: "/",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/home",
      name: "home",
      component: Layout,
      redirect: "/chats",
      children: [
        {
          path: "/chats",
          name: "chats",
          component: Chats,
        },
        {
          path: "/search",
          name: "search",
          component: Search,
        },
        {
          path: "/my",
          name: "my",
          component: My,
        },
      ],
    },
    {
      path: "/messages/:conversationID/:uid",
      name: "messages",
      component: Messages,
    },
  ],
});

router.beforeEach((to, from, next) => {
  let userId = window.localStorage.getItem("userId") || null;
  if (!userId && to.name !== "login" && to.name !== "register") {
    next({ name: "login" });
  } else if (to.name) {
    next();
  } else {
    next("/home");
  }
});

export default router;
