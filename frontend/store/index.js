// holds your root state
export const state = () => ({
  first_login: 1,
  color: "primary",
  employee_id: "",
  main_report_type: "",
  loginType: "manager",

  devices: null,
  equipments: null,

  tickets: null,
  service_calls: null,
  contracts: null,
  quotations: null,
  invoices: null,
  login_token: "",
  email: "",
  password: "",
});

// contains your mutations
export const mutations = {
  RESET_STATE(state) {
    // Object.keys(state).forEach((key) => {
    //   state[key] = null;
    // });
    state = () => ({
      first_login: 1,
      color: "primary",
      employee_id: "",
      main_report_type: "",
      loginType: "manager",
      equipments: null,
      tickets: null,
      service_calls: null,
      contracts: null,
      quotations: null,
      invoices: null,
      roles: null,
      login_token: "",
      email: "",
      password: "",
    });
  },
  login_token(state, value) {
    state.login_token = value;
  },
  email(state, value) {
    state.email = value;
  },
  password(state, value) {
    state.password = value;
  },
  first_login(state, value) {
    state.first_login = value;
  },
  devices(state, value) {
    state.devices = value;
  },
  equipments(state, value) {
    state.equipments = value;
  },
  tickets(state, value) {
    state.tickets = value;
  },
  service_calls(state, value) {
    state.service_calls = value;
  },
  contracts(state, value) {
    state.contracts = value;
  },
  quotations(state, value) {
    state.quotations = value;
  },
  invoices(state, value) {
    state.invoices = value;
  },

  roles(state, value) {
    state.roles = value;
  },

  loginType(state, value) {
    state.loginType = value;
  },

  change_color(state, value) {
    state.color = value;
  },
};

export const actions = {
  resetState({ commit }) {
    commit("RESET_STATE");
  },

  async fetchData(
    { commit, state },
    { key, refresh, endpoint, options, filters }
  ) {
    try {
      // if (state[key] && !options.refresh) {
      //   return state[key];
      // }

      let configs = {
        params: {
          // company_id: this.$auth.user.company_id,
        },
      };

      if (options) {
        const { page, sortBy, sortDesc, itemsPerPage } = options;
        configs.params.page = page;
        configs.params.per_page = itemsPerPage;
        configs.params.sortBy = sortBy ? sortBy[0] : "";
        configs.params.sortDesc = sortDesc ? sortDesc[0] : "";
      }

      if (filters) {
        configs.params = { ...configs.params, ...filters };
      }

      const { data } = await this.$axios.get(endpoint, configs);
      console.log(`Fetching ${key}:`, data);

      // commit(key, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      throw new Error(`Failed to fetch ${key}: ${error.message}`);
    }
  },

  async fetchDropDowns({ commit }, { key, endpoint }) {
    try {
      const { data } = await this.$axios.get(endpoint, {
        params: {
          order_by: "name",
          company_id: this.$auth.user.company_id,
        },
      });
      commit(key, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      throw new Error(`Failed to fetch ${key}: ${error.message}`);
    }
  },
};