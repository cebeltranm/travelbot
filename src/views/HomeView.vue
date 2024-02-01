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
              @showMoreInfo="showMoreInfo(activity)"
              >
            </Activity>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-card>  
  <v-dialog
      v-model="showMoreInfoDialog"
      :scrim="false"
      width="auto"
      persistent
    >
    <v-card class="detail_info" v-if="selecteActivity && selecteActivity._more_info">
      <v-card-title>
          <span class="text-h5">{{selecteActivity._more_info.name}}</span>
      </v-card-title>

      <v-card-text>
            <p v-if="selecteActivity._more_info.description"> {{ selecteActivity._more_info.description }}</p>
            <div v-if="selecteActivity._more_info.html" v-html="selecteActivity._more_info.html">

            </div>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="Close"
          @click="showMoreInfoDialog = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>

    <v-dialog
      v-model="store.isProcessing"
      :scrim="false"
      width="auto"
      persistent
    >
      <v-card
        color="primary"
      >
        <v-card-text>
          we are collecting all the information to give you the best suggestions
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog> 


    <v-layout-item
    class="text-end pointer-events-none"
    model-value
    position="bottom"
    size="88"
  >
    <div class="ma-4">
      <v-fab-transition>
        <v-btn
          class="mt-auto pointer-events-initial"
          color="primary"
          elevation="8"
          icon="mdi-help-circle"
          :elevation="1000"
          @click="showhelp = true"
        />
      </v-fab-transition>
    </div>
  </v-layout-item>
  <v-bottom-sheet v-model="showhelp">
    <v-list>
    <v-list-item v-for="item in helpList">
      <div v-html="item"></div>
      <v-divider></v-divider>
    </v-list-item>
    <v-list-item>
      <v-text-field
        v-model="helpQuestion"
      >
        <template v-slot:append>
          <v-btn
            class="mt-auto pointer-events-initial"
            color="primary"
            elevation="8"
            icon="mdi-play-circle"
            :disabled="store.isProcessing"
            @click="runHelp"
          />
        </template>
      </v-text-field>
    </v-list-item>
    </v-list>
  </v-bottom-sheet>  
</template>

<script setup lang="ts">
import Activity from '@/components/Activity.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useActivitiesStore } from '@/stores/activities'
import { detailsToHtml, detailsStringtoHtml } from '@/helpers';

const store = useActivitiesStore();

// store.$subscribe((mutation, state) => {
//   console.log('mutation', mutation);
//   console.log('state', state);
//   // localStorage.setItem('cart', JSON.stringify(state))
// })

const loading = computed(() => !store.activities);
const showMoreInfoDialog = ref(false);
const showhelp = ref(false);
const helpQuestion = ref('');
const helpList = ref([]);
const selecteActivity: any = ref(undefined);

watch(showMoreInfoDialog, (newValue) => {
  // helpList.value = [];  
  if (!newValue) {
    selecteActivity.value = undefined;
  }
})

async function fetchMoreInfo(activity:any) {
    const data = await store.run(store.moreInfoCommand, `the user wants more information about "${activity.name}"`);
    if (Array.isArray(data.messageContent) ) {
        activity._more_info = detailsToHtml(data.messageContent);
      } else if (Object.keys(data.messageContent).length === 1) {
        activity._more_info = detailsToHtml(data.messageContent[Object.keys(data.messageContent)[0]]);
      } else {
        console.log("no option used");
      }
}

function showMoreInfo(activity: any) {
    selecteActivity.value = activity;
    showMoreInfoDialog.value = true;
    if (!activity._more_info) {
        fetchMoreInfo(activity);
    }
}

async function runHelp() {
  const moreContext = selecteActivity.value ? `the user wants more information about "${selecteActivity.value.name}"` : '';
  if (helpQuestion.value) {
      const data = (await store.run(helpQuestion.value, moreContext));
      // const data = `Yes, in Bogotá, Colombia, and throughout the country, you should use Colombian Pesos (COP) for all transactions. This includes everything from museum entrances, public transportation fares, meals, and other purchases or services. Colombian Pesos is the official currency, and using it is the standard and expected method of payment.`
      helpQuestion.value = '';
      if (typeof data.messageContent === 'string') {
        helpList.value = [detailsStringtoHtml(data.messageContent)];
      } else if (data.messageContent && typeof data.messageContent === 'object') {
        store.setActivities(data);
        showhelp.value = false;
        selecteActivity.value = undefined;
        showMoreInfoDialog.value = false;
      } else {
        console.log('no option for type of object', typeof data, data);
      }
    }
}

</script>
<style>
.detail_info p::first-letter {
    text-transform: uppercase;
}
.detail_info h4::first-letter {
    text-transform: uppercase;
}
</style>
