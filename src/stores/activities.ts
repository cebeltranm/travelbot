import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { executeCommand,  getCommandStatus} from '@/api';

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref(null)
  const context = ref('User wants to visit Toronto, and wants to do some remote work in a coffee shop in the morning. They like museums and activities that immerse them in the local culture. They like to eat local food and street food. They have a mid-range budget. They want suggestions for a place to meet other remote workers (this is important!), and is traveling with their dog so they would like dog-friendly activities. Include at least 1 Apple shop nearby in the results')
  const activitiesCommand = ref( 'list 7 activities for tomorrow in json format and include prices, reservation links, locations, time, and duration');
  const moreInfoCommand = ref('give me more info about this, including price, trasportation suggestions, links to reservetations in json format ');
  const instructions = ref('you are a travel assistant who recommends activities for remote workers who enjoy knowing the city and around while working, using the Travel Planning plugin, and returning the content in a JSON format')

  const isProcessing = ref(false);

  let thread = sessionStorage.getItem('thread');
  let lastActivityRun = sessionStorage.getItem('lastRunId');

  function setActivities(data) {
    if (data && typeof data.messageContent === 'object' && data.messageContent !== null) {
      if (Array.isArray(data.messageContent) ) {
        activities.value = data.messageContent
      } else if (Object.keys(data.messageContent).length === 1) {
        activities.value = data.messageContent[Object.keys(data.messageContent)[0]];
      } else {
        console.log("no option used");
      }
    }

  }

  async function loadLastActivities() {
    const lastActivities = sessionStorage.getItem('lastActivities');
    if (lastActivities) { 
      activities.value = JSON.parse(lastActivities);
    }
    else if (thread && lastActivityRun && thread !== '' && lastActivityRun !== '') {
      isProcessing.value = true;
      const { data } = await getCommandStatus(lastActivityRun, thread, true);
      setActivities(data);
      isProcessing.value = false;
    }
  } 

  async function loadActivities() {
    try {
      activities.value = null;

      isProcessing.value = true;
      const { data, ...threadInfo } = await executeCommand(context.value, activitiesCommand.value, instructions.value, thread, true);
      if (thread !== threadInfo.thread) {
        thread = threadInfo.thread
        sessionStorage.setItem('thread', thread || '');
      }
      setActivities(data);
      lastActivityRun = threadInfo.runId;
      // sessionStorage.setItem('lastRunId', lastActivityRun || '');
      if (activities.value) {
        sessionStorage.setItem('lastActivities', JSON.stringify(activities.value));
      }
      isProcessing.value = false;

    } catch (error) {
      isProcessing.value = false;
      return error
    }
  }

  async function run(command: string, moreContext: string = '') {
    try {
      isProcessing.value = true;
      const { data, ...threadInfo } = await executeCommand(`${context.value} ${moreContext}`, command, undefined, thread, true);
      if (thread !== threadInfo.thread) {
        sessionStorage.setItem('thread', threadInfo.thread);
        thread = threadInfo.thread
      }
      isProcessing.value = false;
      return data;
    } catch (error) {
      return error
    }

  }

  return { 
      activities,
      context,
      activitiesCommand,
      moreInfoCommand, instructions, 
      isProcessing ,
    loadActivities, loadLastActivities, run, setActivities }
})
