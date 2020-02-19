import AsyncStorage from "@react-native-community/async-storage"
import BackgroundFetch from "react-native-background-fetch"
import {bgLocalLog} from "../localLog"

// todo can not work yet
const init = async (callback) => {

  BackgroundFetch.configure({
    minimumFetchInterval: 15,     // <-- minutes (15 is minimum allowed)
    // Android options
    forceAlarmManager: false,     // <-- Set true to bypass JobScheduler.
    stopOnTerminate: false,
    startOnBoot: true,
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
    requiresCharging: false,      // Default
    requiresDeviceIdle: false,    // Default
    requiresBatteryNotLow: false, // Default
    requiresStorageNotLow: false  // Default
  }, async (taskId) => {
    console.log("[js] Received background-fetch event: ", taskId);
    // Required: Signal completion of your task to native code
    // If you fail to do this, the OS can terminate your app
    // or assign battery-blame for consuming too much background-time
    /* my code start */
    if (callback) await callback()
    await bgLocalLog('Task: ' + taskId)
    /* my code end */
    BackgroundFetch.finish(taskId);
  }, (error) => {
    bgLocalLog("[js] RNBackgroundFetch failed to start").then();
  });

  // Optional: Query the authorization status.
  BackgroundFetch.status((status) => {
    switch(status) {
      case BackgroundFetch.STATUS_RESTRICTED:
        bgLocalLog("BackgroundFetch restricted").then();
        break;
      case BackgroundFetch.STATUS_DENIED:
        bgLocalLog("BackgroundFetch denied").then()
        break;
      case BackgroundFetch.STATUS_AVAILABLE:
        bgLocalLog("BackgroundFetch is enabled").then()
        BackgroundFetch.start().then()
        break;
    }
  });
}

export default {
  init,
}