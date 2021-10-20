import { createRouter, createWebHashHistory } from "vue-router";
// import Login from "../view/Login.vue";
// import Register from "../view/Register.vue";
// import Layout from "../view/Layout.vue";
// import Chats from "../view/Chats.vue";
// import Search from "../view/Search.vue";
// import My from "../view/My.vue";
// import Messages from "../view/Messages.vue";

const routerHistory = createWebHashHistory();

const router = createRouter({
  history: routerHistory,
  routes: [
    /* 登录页 */
    {
      path: "/",
      name: "login",
      component: () =>
        import(/* webpackChunkName: "login" */ "@/view/Login.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () =>
        import(/* webpackChunkName: "register" */ "@/view/Register.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: () =>
        import(/* webpackChunkName: "home" */ "@/view/Layout.vue"),
      redirect: "/chats",
      children: [
        {
          path: "/chats",
          name: "chats",
          component: () =>
            import(/* webpackChunkName: "chats" */ "@/view/Chats.vue"),
        },
        {
          path: "/search",
          name: "search",
          component: () =>
            import(/* webpackChunkName: "search" */ "@/view/Search.vue"),
        },
        {
          path: "/my",
          name: "my",
          component: () => import(/* webpackChunkName: "my" */ "@/view/My.vue"),
        },
      ],
    },
    {
      path: "/messages/:conversationID/:uid",
      name: "messages",
      component: () =>
        import(/* webpackChunkName: "messages" */ "@/view/Messages.vue"),
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
