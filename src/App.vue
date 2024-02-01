
<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar prominent>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Wíinik</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
        location="left">
      <v-list>
        <v-list-item title="">
          <v-textarea label="context" v-model="store.context"></v-textarea>
        </v-list-item>
        <v-list-item title="">
          <v-textarea label="activities command" v-model="store.activitiesCommand"></v-textarea>
        </v-list-item>
        <v-list-item title="">
          <v-textarea label="more info command" v-model="store.moreInfoCommand"></v-textarea>
        </v-list-item>
        <v-list-item title="">
          <v-textarea label="base instructions" v-model="store.instructions"></v-textarea>
        </v-list-item>        
        <v-list-item title="">
          <v-btn @click.stop="run" :disabled="store.isProcessing">Run</v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
      <RouterView />
    </v-main>
  </v-layout>
  
</template>

<style scoped>
</style>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useActivitiesStore } from '@/stores/activities'

const drawer = ref(false);

const store = useActivitiesStore();

function run() {
  store.loadActivities()
}

onMounted(async () => {
  await store.loadLastActivities();
  if (!store.activities) {
    store.loadActivities();
  }
}) ;

</script>
