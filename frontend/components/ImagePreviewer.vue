<template>
  <v-dialog v-model="dialog" width="100%">
    <AssetsIconClose left="96%" @click="dialog = false" />
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <v-avatar size="50" tile>
          <v-img :src="src"></v-img>
        </v-avatar>
      </div>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Preview</span>
      </v-alert>

      <v-card-text style="overflow: hidden">
        <v-img v-if="src" :src="src"></v-img>
        <v-alert v-else type="info" outlined class="mt-4">
          No image selected.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["src"],
  data() {
    return {
      dialog: false,
    };
  },

};
</script>
