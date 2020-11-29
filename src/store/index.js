import Vue from "vue";
import Vuex from "vuex";
import SkyID from "skyid";

Vue.use(Vuex);

let devMode;
if (
  window.location.hostname == "idtest.local" ||
  window.location.hostname == "localhost" ||
  window.location.protocol == "file:"
) {
  devMode = true;
} else {
  devMode = false;
}

const skyidOptions = { devMode };

function skyidCallback(message) {
  switch (message) {
    case "login_fail":
      console.log("Login failed");
      break;
    case "login_success":
      console.log("Login succeed!");
      console.log(skyid.userId);
      break;
    case "destroy":
      console.log("Logout succeed!");
      break;
    default:
      console.log(message);
      break;
  }
}

const skyid = new SkyID("skyidtestapp", skyidCallback, skyidOptions);

export default new Vuex.Store({
  state: {
    loggedInUser: null
  },
  mutations: {},
  actions: {
    login() {
      skyid.sessionStart();
    },
    logout() {
      skyid.sessionDestroy();
    }
  },
  modules: {}
});
