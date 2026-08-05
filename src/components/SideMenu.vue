<template>
  <ion-menu content-id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-menu-toggle v-for="(page, index) in appPages" :key="index" auto-hide="false">
          <ion-item :router-link="page.url" routerDirection="none" :detail="false">
            <template #start><ion-icon :ios="page.iosIcon" :md="page.mdIcon"></ion-icon></template>
            <ion-label>{{ page.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>

      <ion-list v-if="showAdmin">
        <ion-list-header>
          <ion-label>Admin</ion-label>
        </ion-list-header>
        <ion-menu-toggle v-for="(page, index) in adminPages" :key="index" auto-hide="false">
          <ion-item :router-link="page.url" routerDirection="none" :detail="false">
            <template #start><ion-icon :ios="page.iosIcon" :md="page.mdIcon"></ion-icon></template>
            <ion-label>{{ page.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonToolbar,
  IonHeader,
  IonTitle,
} from '@ionic/vue'
import {
  homeOutline,
  homeSharp,
  documentOutline,
  documentSharp,
  cloudUploadOutline,
  cloudUploadSharp,
  barChartOutline,
  barChartSharp,
  peopleOutline,
  peopleSharp,
  settingsOutline,
  settingsSharp,
  readerOutline,
  readerSharp,
  checkmarkDoneOutline,
  checkmarkDoneSharp,
  receiptOutline,
  receiptSharp,
  ribbonOutline,
  ribbonSharp,
} from 'ionicons/icons'

const appPages = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: 'Documents',
    url: '/documents',
    iosIcon: documentOutline,
    mdIcon: documentSharp,
  },
  {
    title: 'Upload',
    url: '/upload',
    iosIcon: cloudUploadOutline,
    mdIcon: cloudUploadSharp,
  },
  {
    title: 'Reports',
    url: '/reports',
    iosIcon: barChartOutline,
    mdIcon: barChartSharp,
  },
]

const adminPages = [
  {
    title: 'Accreditations',
    url: '/accreditation',
    iosIcon: ribbonOutline,
    mdIcon: ribbonSharp,
  },
  {
    title: 'Users',
    url: '/users',
    iosIcon: peopleOutline,
    mdIcon: peopleSharp,
  },
  {
    title: 'Audit',
    url: '/audit',
    iosIcon: readerOutline,
    mdIcon: readerSharp,
  },
  {
    title: 'Submissions',
    url: '/submissions',
    iosIcon: receiptOutline,
    mdIcon: receiptSharp,
  },
  {
    title: 'QA Review',
    url: '/qa-review',
    iosIcon: checkmarkDoneOutline,
    mdIcon: checkmarkDoneSharp,
  },
  {
    title: 'Settings',
    url: '/settings',
    iosIcon: settingsOutline,
    mdIcon: settingsSharp,
  },
]
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const authStore = useAuthStore()

const showAdmin = computed(() => {
  const role = (authStore.userRole || '').toString()
  return !!authStore.hasGroup || ['super-admin', 'dean', 'program-chair'].includes(role)
})
</script>

<style scoped>
</style>
