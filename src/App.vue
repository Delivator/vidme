<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn v-if="!loggedInUser" @click="login" outlined>
        <span class="mr-2">Login with SkyID</span>
        <v-icon>mdi-account-circle-outline</v-icon>
      </v-btn>
      <v-menu v-else offset-y>
        <template v-slot:activator="{ on }">
          <h6 v-on="on" class="text-h6 text-uppercase mr-4">
            {{ loggedInUser.username }}
          </h6>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-account-arrow-right-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    //
  }),

  methods: {
    login() {
      this.$store.dispatch("login");
    },

    logout() {
      this.$store.dispatch("logout");
    }
  },

  computed: {
    loggedInUser() {
      return this.$store.state.loggedInUser;
    }
  },

  mounted() {
    this.$store
      .dispatch("getUserData")
      .then(data => this.$store.commit("setLoggedInUser", data))
      .catch(console.error);
  }
};
</script>
