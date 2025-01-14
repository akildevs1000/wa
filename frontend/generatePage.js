const fs = require('fs');
const path = require('path');

// Function to generate a Nuxt.js page
function generatePage(pageName) {
  if (!pageName) {
    console.error('Error: Page name is required.');
    return;
  }

  // Sanitize the page name to avoid invalid file names
  const sanitizedPageName = pageName.replace(/[^a-zA-Z0-9-_]/g, '');
  const pagesDir = path.join(__dirname, 'pages');
  const pagePath = path.join(pagesDir, `${sanitizedPageName}.vue`);

  // Check if the page already exists
  if (fs.existsSync(pagePath)) {
    console.error(`Error: Page "${sanitizedPageName}" already exists.`);
    return;
  }

  // Basic template for the new page
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

  // Write the file to the pages directory
  fs.writeFileSync(pagePath, template, 'utf-8');
  console.log(`Page "${sanitizedPageName}" has been created successfully!`);
}

// Get the page name from command-line arguments
const pageName = process.argv[2];
generatePage(pageName);
