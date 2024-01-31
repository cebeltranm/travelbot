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
  //   activities.value = [
  //     {
  //         "name": "Bogotá Food & Local Markets Tour",
  //         "description": "Explore Bogotá's culinary culture with a guided tour through vibrant markets. Sample traditional dishes and learn about local ingredients.",
  //         "time": "6PM",
  //         "duration": "3 hours",
  //         "price": "$35 USD",
  //         "reservation_link": "https://www.bogotafoodtour.com/book",
  //         "location": "La Candelaria, Bogotá",
  //         "_more_info": {
  //             "name": "Bogotá Food & Local Markets Tour",
  //             "description": "Explore the rich culinary heritage of Bogotá on this guided tour of local markets. You'll have the chance to taste exotic fruits, traditional dishes, and learn about the ingredients that are essential to Colombian cuisine. This tour is an excellent way to understand the local food culture and meet other food enthusiasts.",
  //             "price": "35 USD per person",
  //             "duration": "3 hours",
  //             "time": "Starts at 6PM",
  //             "includes": "Guide, food samples",
  //             "does_not_include": "Transportation to meeting point, personal purchases",
  //             "transportation_suggestions": "The tour starts in La Candelaria, which is easily accessible by taxi or ridesharing apps like Uber. Public transportation is also available, but taking a taxi or Uber is recommended for convenience.",
  //             "reservation_link": "https://www.bogotafoodtour.com/reservations",
  //             "tips": "Wear comfortable walking shoes and bring a light jacket as Bogotá can be cool in the evening. Be sure to let your guide know of any dietary restrictions."
  //         }
  //     },
  //     {
  //         "name": "La Mesa Food Tours - Evening Edition",
  //         "description": "Dive into the evening flavors of Bogotá with a food tour spanning multiple neighborhoods. Enjoy a range of tastings from coffee to complete meals.",
  //         "time": "6:30PM",
  //         "duration": "4 hours",
  //         "price": "$60 USD",
  //         "reservation_link": "https://www.lamesafoodtours.com/evening-tour",
  //         "location": "Various locations, Bogotá"
  //     },
  //     {
  //         "name": "Interactive Cooking Class with Locals",
  //         "description": "Learn how to prepare Colombian cuisine with a hands-on cooking class taught by local chefs. A great way to meet new people and enjoy a delicious meal together.",
  //         "time": "6PM",
  //         "duration": "2-3 hours",
  //         "price": "$40 USD",
  //         "reservation_link": "https://www.cookly.me/bogota-cooking-classes",
  //         "location": "Central Bogotá"
  //     },
  //     {
  //         "name": "Craft Beer Tasting and Brewery Tour",
  //         "description": "Join a guided tour through Bogotá's craft beer scene. Visit local breweries, taste a variety of beers, and learn about the brewing process.",
  //         "time": "6PM",
  //         "duration": "2 hours",
  //         "price": "$25 USD",
  //         "reservation_link": "https://www.bogotabeertour.com/reserve",
  //         "location": "Chapinero, Bogotá"
  //     }
  // ];
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

  async function run(command: string, moreContext: string = '') {
    try {
      const { data, ...threadInfo } = await executeCommand(`${context} ${moreContext}`, command, undefined, thread, true);
      if (thread !== threadInfo.thread) {
        sessionStorage.setItem('thread', threadInfo.thread);
        thread = threadInfo.thread
      }
      return data;
    } catch (error) {
      return error
    }

  }

  return { activities,context,activitiesCommand,moreInfoCommand, instructions, 
    loadActivities, loadLastActivities, run }
})
