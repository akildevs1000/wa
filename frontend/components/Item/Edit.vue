<template>
  <div class="">
    <v-dialog v-model="dialog" width="400">
      <AssetsIconClose left="390" @click="close" />
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on">
          <v-icon color="primary" small> mdi-pencil </v-icon>
          Edit
        </div>
      </template>

      <v-card>
        <v-alert flat class="grey lighten-3" dense>
          <span>Edit {{ model }}</span>
        </v-alert>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="payload.name"
                label="Name"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-autocomplete
                :items="categpries"
                item-text="name"
                item-value="id"
                outlined
                dense
                hide-details
                v-model="payload.item_category_id"
                label="Category"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12">
              <v-file-input
                color="primary"
                prepend-icon=""
                append-icon="mdi-upload"
                dense
                hide-details
                v-model="payload.image"
                label="Upload Image"
                outlined
                accept="image/*"
                show-size
                required
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                rows="2"
                outlined
                dense
                hide-details
                v-model="payload.status"
                label="Status"
              ></v-switch>
            </v-col>

            <v-col cols="12" v-if="errorResponse">
              <span class="red--text">{{ errorResponse }}</span>
            </v-col>
            <v-col cols="12" class="text-right">
              <v-btn @click="close" class="grey white--text" small>Close</v-btn>
              &nbsp;
              <v-btn @click="submit" class="primary" small>Submit</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: ["item", "endpoint", "model"],

  data() {
    return {
      payload: {
        name: "",
        user_id: 0,
        item_category_id: 0,
        status: 0,
        image: null,
      },
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
    };
  },
  async created() {

    this.payload = this.item;

    await this.getCategoryDropDownlist();
  },

  methods: {
    async getCategoryDropDownlist() {
      let { data } = await this.$axios.get(`item-categories-list`);

      this.categpries = data;
    },

    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
    },
    createFormData(payload) {
      const formData = new FormData();

      // Append each key-value pair to the FormData object
      for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
          if (key === "image" && payload[key] instanceof File) {
            // For the `image` field, ensure it's a File object
            formData.append(key, payload[key]);
          } else {
            formData.append(key, payload[key]);
          }
        }
      }

      return formData;
    },

    async submit() {
      const formData = this.createFormData(this.payload);

      // Submit the FormData using an API request
      try {
        const response = await this.$axios.post(
          `/items-update/${this.item.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.close();
        this.$emit("response", "Record has been inserted");
      } catch (error) {
        this.errorResponse = error?.response?.data?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
