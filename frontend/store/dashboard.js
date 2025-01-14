// store/dashboard.js

export const state = () => ({
  dashboardData: null,
  date_from: null, // Add 'date_from' property
  date_to: null, // Add 'date_to' property
  recent_logs: null, // Add 'date_to' property
  previous_week_attendance_count: null, // Add 'date_to' property
  attendance_count: null, // Add 'date_to' property
  off_devices_count: null, // Add 'date_to' property
  leaves_request_count: null, // Add 'date_to' property
  announcements: null, // Add 'date_to' property
  every_hour_count: null,
  web_logins: null,
  attendance_count_by_department: null,
  branch_id: null,
  system_user_id: null,

  visitor_every_hour_count: null,
});

export const mutations = {
  RESET_STATE(state) {
    Object.keys(state).forEach((key) => {
      state[key] = null;
    });
  },
  setDashboardData(state, data) {
    state.dashboardData = data;
  },

  branch_id(state, branch_id) {
    // Mutation to set 'date_from'
    state.branch_id = branch_id;
  },
  date_from(state, date_from) {
    // Mutation to set 'date_from'
    state.date_from = date_from;
  },
  date_to(state, date_to) {
    // Mutation to set 'date_to'
    state.date_to = date_to;
  },
  system_user_id(state, system_user_id) {
    // Mutation to set 'date_to'
    state.system_user_id = system_user_id;
  },
  recent_logs(state, recent_logs) {
    // Mutation to set 'recent_logs'
    state.recent_logs = recent_logs;
  },
  previous_week_attendance_count(state, previous_week_attendance_count) {
    // Mutation to set 'previous_week_attendance_count'
    state.previous_week_attendance_count = previous_week_attendance_count;
  },
  attendance_count(state, attendance_count) {
    // Mutation to set 'attendance_count'
    state.attendance_count = attendance_count;
  },
  off_devices_count(state, off_devices_count) {
    // Mutation to set 'off_devices_count'
    state.off_devices_count = off_devices_count;
  },
  leaves_request_count(state, leaves_request_count) {
    // Mutation to set 'leaves_request_count'
    state.leaves_request_count = leaves_request_count;
  },
  announcements(state, announcements) {
    // Mutation to set 'announcements'
    state.announcements = announcements;
  },
  every_hour_count(state, every_hour_count) {
    // Mutation to set 'every_hour_count'
    state.every_hour_count = every_hour_count;
  },
  visitor_every_hour_count(state, visitor_every_hour_count) {
    // Mutation to set 'every_hour_count'
    state.visitor_every_hour_count = visitor_every_hour_count;
  },
  web_logins(state, web_logins) {
    // Mutation to set 'web_logins'
    state.web_logins = web_logins;
  },
  attendance_count_by_department(state, attendance_count_by_department) {
    // Mutation to set 'attendance_count_by_department'
    state.attendance_count_by_department = attendance_count_by_department;
  },
};

export const actions = {
  resetState({ commit }) {
    commit("RESET_STATE");
  },
  async states_for_7_days({ commit, state }) {
    if (
      state.dashboardData &&
      state.date_from &&
      state.date_to &&
      state.branch_id &&
      state.system_user_id
    ) {
      return state.dashboardData; // Return cached data if available.
    }

    try {
      const { data } = await this.$axios.get("dashboard_counts_last_7_days", {
        params: {
          company_id: this.$auth.user.company_id,
          date_from: state.date_from,
          date_to: state.date_to,
          branch_id: state.branch_id > 0 ? state.branch_id : null,
          system_user_id:
            state.system_user_id > 0 ? state.system_user_id : null,
        },
      });

      commit("setDashboardData", data);

      return data;
    } catch (error) {
      return error;
    }
  },

  async every_hour_count({ commit, state }) {
    if (state.every_hour_count) return state.every_hour_count;
    try {
      const { data } = await this.$axios.get(
        "dashboard_get_counts_today_hour_in_out",
        {
          params: {
            company_id: this.$auth.user.company_id,
            branch_id: state.branch_id > 0 ? state.branch_id : null,
            system_user_id:
              state.system_user_id > 0 ? state.system_user_id : null,
          },
        }
      );
      commit("every_hour_count", data);
      return data;
    } catch (error) {
      return error;
    }
  },
  async visitor_every_hour_count({ commit, state }) {
    if (state.visitor_every_hour_count) return state.visitor_every_hour_count;
    try {
      const { data } = await this.$axios.get(
        "dashboard_get_visitor_counts_today_hour_in_out",
        {
          params: {
            company_id: this.$auth.user.company_id,
            branch_id: state.branch_id > 0 ? state.branch_id : null,
            system_user_id:
              state.system_user_id > 0 ? state.system_user_id : null,
          },
        }
      );
      commit("visitor_every_hour_count", data);
      return data;
    } catch (error) {
      return error;
    }
  },
  setDates({ commit }, { date_from, date_to, branch_id, system_user_id }) {
    //console.log(date_from);
    // Action to set 'date_from' and 'date_to'
    commit("date_from", date_from);
    commit("date_to", date_to);
    commit("branch_id", branch_id);
    commit("system_user_id", system_user_id);
  },
};
