<template>
  <span>
    <v-alert flat dense class="mb-2 primary" dark>
      <div class="d-flex">
        {{ Model }}s
        <v-icon color="primary" right class="mt-1" @click="getDataFromApi()"
          >mdi-reload</v-icon
        >

        <v-spacer></v-spacer>
        <ItemCreate
          :model="Model"
          :endpoint="endpoint"
          @response="getDataFromApi"
        />
      </div>
    </v-alert>

    <v-data-table
      dense
      :headers="headers"
      :items="vendorCategories"
      :loading="loading"
      :options.sync="options"
      :footer-props="{
        itemsPerPageOptions: [100, 500, 1000],
      }"
      class="elevation-1"
    >
      <template v-slot:item.status="{ item }">
        <v-switch
          rows="2"
          outlined
          dense
          hide-details
          v-model="item.status"
        ></v-switch>
      </template>

      <template v-slot:item.image_url="{ item }">
        <ImagePreviewer v-if="item.image_url" :src="item.image_url" />
      </template>

      <template v-slot:item.options="{ item }">
        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list width="120" dense>
            <v-list-item>
              <v-list-item-title>
                <ItemEdit
                  :model="Model"
                  :endpoint="endpoint"
                  :item="item"
                  @response="getDataFromApi"
                />
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <ItemDelete
                  :id="item.id"
                  :endpoint="endpoint"
                  @response="getDataFromApi"
                />
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </span>
</template>

<script>
export default {
  data: () => ({
    Model: "Item",
    endpoint: "items",
    filters: {},
    options: {},
    loading: false,
    response: "",
    vendorCategories: [],
    errors: [],
    headers: [
      {
        text: "#",
        value: "id",
      },
      {
        text: "Name",
        value: "name",
      },
      {
        text: "Category",
        value: "category.name",
      },
      {
        text: "Image",
        value: "image_url",
      },
      {
        text: "Status",
        value: "status",
      },
      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "options",
      },
    ],
    componentKey: 1,
  }),

  async created() {
    this.getDataFromApi();
  },
  mounted() {},
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  methods: {
    async getDataFromApi() {
      this.loading = true;
      let { data } = await this.$axios.get(this.endpoint);
      this.loading = false;
      this.vendorCategories = data.data;
    },
  },
};
</script>
