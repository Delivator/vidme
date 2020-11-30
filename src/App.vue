<template>
  <v-app>
    <v-app-bar app color="red darken-3" dark>
      <router-link to="/" class="white--text text-decoration-none">
        <h4 class="logo-text text-h4 font-weight-medium">
          <span class="text-decoration-underline">vidme</span>.
        </h4>
      </router-link>
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

<style scoped>
.logo-text {
  font-family: "Inconsolata", monospace !important;
}
</style>

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
