import { createApp } from 'vue'
import App from './App.vue'
import router from './route/index'
import store from './store/index'
import fetch from "@/utils/fetch";
import IM from '@/assets/js/MSIM'
import 'lib-flexible';
import Vant from 'vant'
import { Lazyload } from 'vant';
import 'vant/lib/index.css'

var app = createApp(App);
app.config.globalProperties.$IM = IM;
app.config.globalProperties.$msim = IM.create();
app.config.globalProperties.$http = fetch;
app.use(Vant)
app.use(Lazyload)
app.use(store)
app.use(router)
app.mount('#app')