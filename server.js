var PORT = process.env.PORT || 3000;
const express = require("express");
const path = require("path");

const app = express();
app.use("/static", express.static("public"));

app.get("/", function (rep, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(PORT);
