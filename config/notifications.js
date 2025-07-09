//External modules imports
const dotenv = require("dotenv");
const webPush = require("web-push");

// Load environment variables
dotenv.config();

// set VAPID details
webPush.setVapidDetails(
  `mailto:${process.env.MAIL_USER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = webPush;
