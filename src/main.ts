import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { addIcons } from 'ionicons'
import {
  mailOutline,
  lockClosedOutline,
  syncOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle,
  logoGithub,
  callOutline,
  calendarOutline,
  chevronDownOutline,
  notificationsOutline,
  documentTextOutline,
  barChartOutline,
  peopleOutline,
  layersOutline,
  listOutline,
  logOutOutline
} from 'ionicons/icons'

addIcons({
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'sync-outline': syncOutline,
  'person-outline': personOutline,
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'logo-google': logoGoogle,
  'logo-github': logoGithub,
  'call-outline': callOutline,
  'calendar-outline': calendarOutline,
  'chevron-down-outline': chevronDownOutline,
  'notifications-outline': notificationsOutline,
  'document-text-outline': documentTextOutline,
  'bar-chart-outline': barChartOutline,
  'people-outline': peopleOutline,
  'layers-outline': layersOutline,
  'list-outline': listOutline,
  'log-out-outline': logOutOutline
})

import './assets/styles.css'
import './assets/superadmin.css'
/* Core CSS required for Ionic components to work properly */
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

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
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