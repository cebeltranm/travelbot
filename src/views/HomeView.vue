<template>
  <v-card
    max-width="400"
    class="mx-auto"
    :loading="loading"
  >
  <v-container>
      <v-row dense>
        <template v-if="!loading" v-for="activity in store.activities" :key="activity.name">
          <v-col cols="12">
            <Activity 
              :activity="activity" 
              >
            </Activity>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-card>  
</template>

<script setup lang="ts">
import Activity from '@/components/Activity.vue';
import { ref, computed, onMounted } from 'vue';
import { useActivitiesStore } from '@/stores/activities'

const store = useActivitiesStore();

// store.$subscribe((mutation, state) => {
//   console.log('mutation', mutation);
//   console.log('state', state);
//   // localStorage.setItem('cart', JSON.stringify(state))
// })

const loading = computed(() => !store.activities);

onMounted(() => {
  store.loadLastActivities();
})

</script>
