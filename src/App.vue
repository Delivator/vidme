<template>
  <v-app>
    <header-app-bar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
html {
  overflow: auto;
}

html.noscroll {
  overflow: hidden;
}

#app {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>

<script>
import HeaderAppBar from "./components/HeaderAppBar.vue";
export default {
  name: "App",
  data: () => ({}),
  components: { HeaderAppBar },
};
</script>
