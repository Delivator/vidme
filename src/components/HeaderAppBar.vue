<template>
  <v-app-bar app color="primary" dark v-if="loggedIn">
    <h1>vidme.</h1>

    <v-spacer></v-spacer>

    <v-btn
      href="https://github.com/vuetifyjs/vuetify/releases/latest"
      target="_blank"
      text
    >
      <span class="mr-2">Login with MySky</span>
      <v-icon>login</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: "HeaderAppBar",
  data: () => ({
    loggedIn: false,
  }),
};
</script>
