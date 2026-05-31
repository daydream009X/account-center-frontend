import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

//引入icon图标
import '@/assets/iconfont/iconfont.js'

//引入样式

import 'element-plus/dist/index.css'
import '@/assets/base.css'
import '@/assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
