require("dotenv").config();

// dev
const dev = {
  app: {
    port: process.env.PORT || 4000,
  },
  db: {
    url: process.env.DB_URL || "mongodb://localhost:27017/userDemo",
  },
};

module.exports = dev;
