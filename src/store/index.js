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
      console.error("Login failed");
      break;
    case "login_success":
      store
        .dispatch("getUserData")
        .then(data => store.commit("setLoggedInUser", data))
        .catch(console.error);
      break;
    case "destroy":
      store.commit("setLoggedInUser", null);
      break;
    default:
      console.log(message);
      break;
  }
}

const skyid = new SkyID("skyidtestapp", skyidCallback, skyidOptions);

const store = new Vuex.Store({
  state: {
    loggedInUser: null
  },
  mutations: {
    setLoggedInUser(state, newUser) {
      state.loggedInUser = newUser;
    }
  },
  actions: {
    login() {
      skyid.sessionStart();
    },
    logout() {
      skyid.sessionDestroy();
    },
    getUserData() {
      return new Promise((resolve, reject) => {
        if (!skyid.userId) return reject("No user id found.");
        skyid.getProfile(data => {
          resolve({ userId: skyid.userId, ...JSON.parse(data) });
        });
      });
    }
  },
  modules: {}
});

export default store;
