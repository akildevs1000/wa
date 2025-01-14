export default ({ $axios, store }, inject) => {
  let holdRequests = false; // Flag to hold subsequent requests
  // Add an interceptor to modify requests globally
  $axios.onRequest(async (config) => {
    // Append the branchid parameter to all requests
    let user = store.state.auth.user;

    if (user?.role?.role_type == "guard") {
      if (user && user.employee && user.employee.branch_id > 0) {
        config.params = {
          ...config.params,
          branch_id: user.employee.branch_id,
        };
      }
    }
    if (user && user.branch_id && user.branch_id > 0) {
      config.params = {
        ...config.params,
        branch_id: user && user.branch_id,
      };
    }
    // console.log("holdRequests Requests", holdRequests);

    // if (holdRequests) {
    //   // Prevent subsequent requests if holdRequests flag is true
    //   return Promise.reject(new Error("Requests are on hold"));
    // }

    return config; // Return the modified config
  });

  // $axios.onResponse(async (response) => {
  //   console.log("response", response);

  //   if (response.status === 503) {
  //     // If response status is 503 (Service Unavailable), hold subsequent requests for 5 seconds
  //     holdRequests = true;
  //     console.log(
  //       "Service Unavailable. Holding subsequent requests for 5 seconds..."
  //     );
  //     await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
  //     holdRequests = false; // Allow requests after the wait
  //   }

  //   return response; // Return the response
  // });
};
