const express = require("express");
const app = express();

app.use(express.json());

app.listen(5000, () => {
  console.log("server listening on port 5000");
});
