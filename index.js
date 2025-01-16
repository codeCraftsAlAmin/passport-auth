// requires
const app = require("./app");
const config = require("./config/user.config");
const PORT = config.app.port;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
