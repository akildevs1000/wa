:hide-details="!errors.field_name"
:error-messages="errors && errors.field_name && errors.field_name[0]"

## Versions 1.0.0
"refresh": "cp -r .nuxt/* .nuxt-31/ && cp -r local-publish/* .nuxt/ && pm2 reload 19"
Installation Guide:

- clone repo
- npm i
- set env variables
  - LOCAL_IP=192.168.2.174
  - LOCAL_PORT=3000
  - BACKEND_URL=http://localhost:8000/api
  - SOCKET_ENDPOINT=web socket endpoint
- npm run dev (dev environment)
- npm run build && npm run start (production environment)
- pm2 start "npm run start" --name "Nuxt"
- pm2 start "dotnet FCardProtocolAPI.dll" --name "sdk production"

npm install cropper

vue.js version2 crop image file

npm install --save vue-notification

npm install --save vue-cropperjs

npm install data-uri-to-buffer
npm install xml2js 


<v-dialog v-model="dialogVisible" max-width="500px">
  <v-card flat dense class="white--text">
    <v-card-title class="background">
      <span class="headline">Filter</span>
    </v-card-title>
    <v-progress-linear
      v-if="loadinglinear"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <br />

    <v-card-text>
      <v-autocomplete
        outlined
        dense
        @change="getDataFromApi()"
        x-small
        item-value="id"
        item-text="name"
        v-model="department_filter_id"
        :items="[{ name: `All Departments`, id: `` }, ...departments]"
        placeholder="Department"
      ></v-autocomplete>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn dark color="background" @click="dialogVisible = false"
        >Close</v-btn
      >
    </v-card-actions>

  </v-card>
</v-dialog>

<v-icon @click="dialogVisible = true" class="mx-1 white--text"

> mdi mdi-filter</v-icon

<!-- dialogVisible: false, -->

let data = {
    "filo": [
        "01-Sep-23: No Data Found",
        "02-Sep-23: No Data Found",
        "03-Sep-23: No Data Found",
        "04-Sep-23: No Data Found",
        "05-Sep-23: No Data Found",
        "06-Sep-23: No Data Found",
        "07-Sep-23: No Data Found",
        "08-Sep-23: No Data Found"
    ],
    "single": [
        "01-Sep-23: No Data Found",
        "02-Sep-23: No Data Found",
        "03-Sep-23: No Data Found",
        "04-Sep-23: No Data Found",
        "05-Sep-23: No Data Found",
        "06-Sep-23: No Data Found",
        "07-Sep-23: No Data Found",
        "08-Sep-23: No Data Found"
    ]
};

const targetArray = [];
const sourceArray = Object.keys(data);

let index = 0;

function pushValueWithDelay() {

    if (index < sourceArray.length) {
        const currentKey = sourceArray[index];

        // Push the current key from the source array to the target array
        targetArray.push(currentKey);
        console.log(targetArray); // Optional: Display the target array

        const currentArray = data[currentKey];

        if (currentArray.length > 0) {
            // Push the first value from the current array with a 1-second delay
            setTimeout(() => {
                targetArray.push(currentArray.shift());
                console.log(targetArray); // Optional: Display the target array
                pushValueWithDelay(); // Call the function recursively
            }, 1000);
        } else {
            // If the current array is empty, move to the next key
            index++;
            pushValueWithDelay(); // Call the function recursively
        }
    }
}

// Start the process by calling the function for the first time
pushValueWithDelay();

