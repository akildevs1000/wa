import colors from "vuetify/es5/util/colors";

export default {
  buildDir: ".nuxt",
  // Target: https://go.nuxtjs.dev/config-target
  target: "static",
  generate: {
    // Interval in milliseconds between two render cycles to avoid
    // flooding a potential API with calls from the web application.
    interval: 500,
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "",
    title: "MyTime 2 Cloud",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],

    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },

      // { test
      //   rel: "stylesheet",
      //   href: "https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.10.2/mdb.min.css",
      // },
      // {
      //   rel: "stylesheet",
      //   href: "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons",
      // },
      // {
      //   rel: "stylesheet",
      //   href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css",
      // },
      // {
      //   rel: "stylesheet",
      //   href: "https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/4.4.95/css/materialdesignicons.min.css",
      // },
    ],
    script: [
      // {
      //   type: "text/javascript",
      //   src: "https://code.jquery.com/jquery-3.5.1.js",
      //   async: false,
      //   body: false,
      // }, // Insert in body
      // {
      //   type: "text/javascript",
      //   src: "https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js",
      //   async: false,
      //   body: false,
      // }, // Insert in body
      // {
      //   type: "text/javascript",
      //   src: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
      //   async: false,
      //   body: false,
      // }, // Insert in body
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  // css: ["~/assets/styles"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "~/plugins/qrcode.js",
    "~/plugins/custom-methods.js",
    { src: "~/plugins/crypto.js", mode: "client" },
    { src: "~/plugins/axios.js" },
    // { src: "~/plugins/TiptapVuetify", mode: "client" },
    { src: "~/plugins/vue-apexchart.js", ssr: false },
    { src: "~/plugins/vue-signature-pad.js", mode: "client" },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify",
    "@nuxtjs/dotenv",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    // https://go.nuxtjs.dev/pwa
    "@nuxtjs/pwa",
    "@nuxtjs/auth-next",
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.BACKEND_URL,
  },

  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: "login", method: "post", propertyName: "token" },
          logout: false,
          user: { url: "me", method: "get", propertyName: "user" },
        },

        //maxAge: 86400, // 24 hours
        refreshToken: true,

        token: {
          //property: "tokens.access.token",
          global: true,
          type: "Bearer",
          maxAge: 60 * 60 * 24 * 365, // 8 Hours
        },

        autoLogout: false,
      },
    },
  },

  router: {
    middleware: ["auth"],
  },

  // serverMiddleware: ['~middleware/verify.js'],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  // pwa: {
  //   manifest: {
  //     name: 'MyTime 2 Cloud',
  //     lang: 'en',
  //     icons: [
  //       {
  //         src: '/icon-512x512.png',
  //         sizes: '512x512',
  //         type: 'image/png',
  //       },
  //       // Add other sizes and formats as needed
  //     ],
  //   },
  // },

  pwa: {
    manifest: {
      name: "MyTime 2 Cloud",
      short_name: "MyTime 2 Cloud",
      lang: "en",
    },
    icon: {
      source: "icon-515x512.png", // Path to your app icon
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,

      themes: {
        light: {
          //primary: "#5fafa3", //green
          primary: "#6946dd", //violoet
          accent: "#d8363a",
          secondary: "#242424",
          background: "#34444c",
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
          main_bg: "#ECF0F4",
          violet: "#6946dd",
          popup_background: "#ecf0f4",
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ["vuetify/lib", "tiptap-vuetify", "vue-apexchart"],
    interval: 500,
  },

  server: {
    host: process.env.LOCAL_IP,
    port: process.env.LOCAL_PORT,
  },

  serverMiddleware: [
    { path: "/api/generate-page", handler: "~/server/api/generatePage.js" },
  ],

  // env: {
  //   BACKEND_ABSOLUTE_URL: process.env.BACKEND_ABSOLUTE_URL,

  // },
};
