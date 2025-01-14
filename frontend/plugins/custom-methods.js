export default ({ app }, inject) => {
  inject("dateFormat", {
    format1: (inputdate) => {
      // Create a Date object with the date "2023-09-13"  Output Sun, Jan 01, 2023
      const inputDate = new Date(inputdate);
      const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        weekday: "short",
      };
      const formattedDate = inputDate.toLocaleDateString("en-US", options);
      return formattedDate;
    },
    format2: (inputdate) => {
      // Create a Date object with the date "2023-09-13"  Output: "23-09-13"
      const date = new Date(inputdate);

      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Note: Month is zero-indexed
      const day = date.getDate().toString().padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
    format3: (inputdate) => {
      const currentDate = new Date(inputdate);

      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 to month because it's zero-based.
      const day = currentDate.getDate().toString().padStart(2, "0");
      const hours = currentDate.getHours().toString().padStart(2, "0");
      const minutes = currentDate.getMinutes().toString().padStart(2, "0");
      const seconds = currentDate.getSeconds().toString().padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes} `;
    },
    format4: (inputdate) => {
      const currentDate = new Date(inputdate);

      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 to month because it's zero-based.
      const day = currentDate.getDate().toString().padStart(2, "0");
      const hours = currentDate.getHours().toString().padStart(2, "0");
      const minutes = currentDate.getMinutes().toString().padStart(2, "0");
      const seconds = currentDate.getSeconds().toString().padStart(2, "0");

      const inputDate = new Date(inputdate);
      const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        weekday: "short",
      };
      const formattedDate = inputDate.toLocaleDateString("en-US", options);

      return `${formattedDate}  ${hours}:${minutes} `;
    },
    monthStartEnd: (inputdate) => {
      // Get the current date
      const currentDate = new Date(inputdate);

      // Get the first day of the current month
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      // Get the last day of the current month
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Format the dates as strings (in 'YYYY-MM-DD' format)
      const formattedFirstDay = `${firstDayOfMonth.getFullYear()}-${(
        firstDayOfMonth.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-01`;
      const formattedLastDay = `${lastDayOfMonth.getFullYear()}-${(
        lastDayOfMonth.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${lastDayOfMonth.getDate()}`;

      return { first: formattedFirstDay, last: formattedLastDay };
    },
    time2Hm: (inputdate) => {
      // Split the time string by ':'
      const timeParts = inputdate.split(":");

      // Extract the hour and minutes
      const hour = timeParts[0];
      const minutes = timeParts[1];

      // console.log(`Hour: ${hour}`);
      // console.log(`Minutes: ${minutes}`);
      return `${hour}:${minutes}`;
    },
    format_month_name_year: (inputdate) => {
      // Create a Date object with the date "2023-09-13"  Output: "23-09-13"
      const date = new Date(inputdate);

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const currentDate = date;
      const currentMonth = months[currentDate.getMonth()];
      const currentYear = currentDate.getFullYear();

      return `${currentMonth} ${currentYear}`;
    },

    can(per, thisobj) {
      let u = thisobj.$auth.user;

      return (
        (u && u.permissions.some((e) => e == per || per == "/")) ||
        u.is_master ||
        u.user_type == "branch"
      );
    },
  });

  inject("pagePermission", {
    can(per, thisobj) {
      let u = thisobj.$auth.user;

      // return (
      //   (u && u.permissions.some((e) => e == per || per == "/")) ||
      //   u.is_master ||
      //   u.user_type == "branch"
      // );

      return (
        (u && u.permissions.some((e) => e == per || per == "/")) || u.is_master
      );
    },
  });
};
