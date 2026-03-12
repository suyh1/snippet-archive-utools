import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from 'motion-v'
import App from './App.vue'
import './styles/tailwind.css'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(MotionPlugin)
app.mount('#app')
