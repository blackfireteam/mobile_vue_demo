import { createApp } from "vue";
import App from "./App.vue";
import router from "./route/index";
import store from "./store/index";
import fetch from "@/utils/fetch";
import IM from "msim";
// import IM from "@/utils/MSIM";
import "lib-flexible";
import {
  Lazyload,
  Icon,
  Image,
  Field,
  Button,
  NavBar,
  Grid,
  Uploader,
  List,
  PullRefresh,
  Cell,
  CellGroup,
  SwipeCell,
  Tabbar,
  TabbarItem,
  Form,
  Switch,
  Toast,
} from "vant";
import "vant/lib/index.css";

const components = [
  Icon,
  Image,
  Field,
  Button,
  NavBar,
  Grid,
  Uploader,
  List,
  PullRefresh,
  Cell,
  CellGroup,
  SwipeCell,
  Tabbar,
  TabbarItem,
  Form,
  Switch,
];
const plugins = [Lazyload, Toast];

var app = createApp(App);
app.config.globalProperties.$IM = IM;
app.config.globalProperties.$msim = IM.create();
app.config.globalProperties.$http = fetch;
components.forEach((component) => {
  app.component(component.name, component);
});
plugins.forEach((plugin) => {
  app.use(plugin);
});
app.use(store);
app.use(router);
app.mount("#app");
