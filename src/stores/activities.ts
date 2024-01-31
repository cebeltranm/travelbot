import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { executeCommand,  getCommandStatus} from '@/api';

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref(null)
  const context = ref('the user is located in Bogotá, Colombia, and is looking for activities around 6PM, he likes food experience and know othre remote workers')
  const activitiesCommand = ref( 'list the activities in json format and include prices, reservation links, locations, time, and duration');
  const moreInfoCommand = ref('give me more info about this, including price, trasportation suggestions, links to reservetations in json format ');
  const instructions = ref('you are a travel assistant who recommends activities for remote workers who enjoy knowing the city and around while working, using the Travel Planning plugin, and returning the content in a JSON format')
  let thread = sessionStorage.getItem('thread');
  let lastActivityRun = sessionStorage.getItem('lastRunId');

  async function loadLastActivities() {
    if (thread && lastActivityRun && thread !== '' && lastActivityRun !== '') {
      const { data } = await getCommandStatus(lastActivityRun, thread, true);
      if (data && typeof data.messageContent === 'object' && data.messageContent !== null && data.messageContent.activities){
        activities.value = data.messageContent.activities;
      }
    }
  } 

  async function loadActivities() {
    try {
      activities.value = null;

      const { data, ...threadInfo } = await executeCommand(context.value, activitiesCommand.value, instructions.value, thread, true);
      if (thread !== threadInfo.thread) {
        sessionStorage.setItem('thread', threadInfo.thread);
        thread = threadInfo.thread
      }
      if (data && typeof data.messageContent === 'object' && data.messageContent !== null && data.messageContent.activities){
        activities.value = data.messageContent.activities;
        lastActivityRun = threadInfo.runId;
        sessionStorage.setItem('lastRunId', lastActivityRun || '');
      }
    } catch (error) {
      return error
    }
  }

  return { activities,context,activitiesCommand,moreInfoCommand, instructions, 
    loadActivities, loadLastActivities }
})
