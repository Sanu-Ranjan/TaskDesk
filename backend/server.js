require("dotenv").config();
const { initializeDB } = require("./db/config.mongo");
const { app } = require("./app");

const PORT = process.env.PORT || 3000;

(async () => {
  await initializeDB();

  app.listen(PORT, () => {
    console.log("Server listening on port : ", PORT);
  });
})();
