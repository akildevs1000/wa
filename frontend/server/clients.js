const fs = require("fs");
const path = require("path");

export default function (req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const { pageName } = JSON.parse(body);

    if (!pageName) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "Page name is required" }));
    }

    // Sanitize the page name and split for nested paths
    const sanitizedPageName = pageName
      .replace(/[^a-zA-Z0-9-_/]/g, "") // Allow slashes for nested paths
      .replace(/\/+/g, "/"); // Avoid double slashes

    const pagesDir = path.join(__dirname, "../../pages");
    const pagePath = path.join(pagesDir, `${sanitizedPageName}.vue`);

    // Ensure directory exists for nested paths
    const dirPath = path.dirname(pagePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Check if the page already exists
    if (fs.existsSync(pagePath)) {
      res.statusCode = 409;
      return res.end(
        JSON.stringify({
          message: `Page "${sanitizedPageName}" already exists.`,
        })
      );
    }

    // Template for the new page
    const template = `
<template>
  <div>
    <h1>${sanitizedPageName} Page</h1>
    <p>This is a dynamically generated page.</p>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: '${sanitizedPageName}',
    };
  },
};
</script>
    `;

    fs.writeFileSync(pagePath, template, "utf-8");
    res.statusCode = 201;
    return res.end(
      JSON.stringify({
        message: `Page "${sanitizedPageName}" created successfully!`,
      })
    );
  });
}
