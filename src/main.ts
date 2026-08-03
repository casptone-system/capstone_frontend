import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'

import './assets/styles.css'
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

const app = createApp(App)
const pinia = createPinia()

app.use(IonicVue)
app.use(pinia)

const authStore = useAuthStore()

const bootstrap = async () => {
  await authStore.restoreSession()
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

bootstrap().catch((error) => {
  console.error('App bootstrap failed:', error)
})