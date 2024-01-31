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
            <template v-for="(value, key) in selecteActivity._more_info" :key="key">
                <template v-if="!['name', 'description'].includes(key)">
                    <h4 class="pt-5">{{ key.replaceAll('_', ' ').replace('reservation link', 'reservations') }}</h4>
                    <a v-if="isUrl(value)" class="pl-10" :href="value" target="_blank"> {{ value }} </a>
                    <p v-else class="pl-10"> {{ value }} </p>
                </template>
            </template>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          text="Close"
          @click="showMoreInfoDialog = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
      <v-card
        color="primary"
        v-if="selecteActivity && !selecteActivity._more_info"
      >
        <v-card-text>
          Please stand by
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
    if (data.messageContent.activity && typeof data.messageContent.activity === 'object') {
      activity._more_info = data.messageContent.activity;
    } else if (data.messageContent.description) {
      activity._more_info = data.messageContent;
    }

    // activity._more_info = {
    //     "name": "Bogotá Food & Local Markets Tour",
    //     "description": "Explore the rich culinary heritage of Bogotá on this guided tour of local markets. You'll have the chance to taste exotic fruits, traditional dishes, and learn about the ingredients that are essential to Colombian cuisine. This tour is an excellent way to understand the local food culture and meet other food enthusiasts.",
    //     "price": "35 USD per person",
    //     "duration": "3 hours",
    //     "time": "Starts at 6PM",
    //     "includes": "Guide, food samples",
    //     "does_not_include": "Transportation to meeting point, personal purchases",
    //     "transportation_suggestions": "The tour starts in La Candelaria, which is easily accessible by taxi or ridesharing apps like Uber. Public transportation is also available, but taking a taxi or Uber is recommended for convenience.",
    //     "reservation_link": "https://www.bogotafoodtour.com/reservations",
    //     "tips": "Wear comfortable walking shoes and bring a light jacket as Bogotá can be cool in the evening. Be sure to let your guide know of any dietary restrictions."
    // }
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
        helpList.value = [data.split('\n').map( (m: string) => {
          if (m==='') {
              return '<br />';
          }
          if (m.startsWith('###')) {
              return '<h3>' + m.replace('###', '') + '</h3>';
          }
          if (m.startsWith('-')) {
            return '<li>' + m.replace('-', '') + '</li>';
          }
          return `<p>${m}</p>`;
        }).join('').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')];
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

const isUrl = (str: string) => {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
};

onMounted(() => {
  store.loadLastActivities();
})

</script>
<style scoped>
.detail_info p::first-letter {
    text-transform: uppercase;
}
.detail_info h4::first-letter {
    text-transform: uppercase;
}
</style>
