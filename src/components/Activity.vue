<template>
    <v-card
      class="mx-auto my-3"
      max-width="374"
    >
      <template v-slot:loader="{ isActive }">
        <v-progress-linear
          :active="isActive"
          color="deep-purple"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>
  
      <v-card-item>
        <v-card-title>{{ activity.name }}</v-card-title>
        <v-card-subtitle>
          <div><span v-if="activity.time">Time:  {{  activity.time }},</span><span v-if="activity.duration">Duration: {{ activity.duration }}</span></div>
          <div v-if="activity.location">Location: <a href="#" @click.stop.prevent="showMap = true">{{  activity.location }}</a></div>
          <div>price:  {{  activity.price }}</div>
        </v-card-subtitle>
      </v-card-item>
  
      <v-card-text>
        <div>
            <p>{{  activity.description }}</p>
            <p v-if="activity.notes && activity.notes !== ''">{{  activity.notes }}</p>
            <p v-if="activity.reservation_link && !['','Not applicable'].includes(activity.reservation_link) && !isUrl(activity.reservation_link)">
                Reservation: {{ activity.reservation_link }}
            </p>
        </div>
      </v-card-text>
  
      <v-card-actions>
        <v-btn
          color="indigo-accent-3"
          variant="text"
          v-if="isUrl(activity.reservation_link)"
          :href="activity.reservation_link"
          target="_blank"
        >
        Reservation  
        </v-btn>
        <v-btn
          color="indigo-accent-3"
          @click="$emit('showMoreInfo')"
        >
        More Info  
        </v-btn>
      </v-card-actions>
    </v-card>
    

    <v-dialog
        transition="dialog-top-transition"
        width="auto"
        :modelValue="showMap"
      >
          <v-card>
            <v-card-text v-if="showMap">
              <iframe :src="`https://maps.google.com/maps?output=embed&q=${activity.location}`" width="360" height="270" frameborder="0" style="border:0"></iframe>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                variant="text"
                @click="showMap = false"
              >Close</v-btn>
            </v-card-actions>
          </v-card>
      </v-dialog>


  </template>
  <script lang="ts" setup>
import { ref } from 'vue';

const showMap = ref(false);

const props = defineProps<{
    activity: any,
}>();


const isUrl = (str: string) => {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
};

</script>
