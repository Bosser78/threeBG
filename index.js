const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotEnv = require("dotenv");

const path = require("path");
const { readdirSync } = require("fs");
const morgan = require("morgan");

const app = express();
app.use(bodyParser.json());
app.use(morgan("dev"));
dotEnv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
});
const PORT = process.env.PORT || 3001;

// // const allowedOrigins = ["http://localhost:3000", "http://localhost:3100"];
// const allowedOrigins = ["*"];

// const options = {
//   origin: allowedOrigins,
// };
// app.use(cors(options));

app.use(cors()); // อนุญาตให้ localhost:4200 เข้าถึง


app.use("/api", require("./routes/auth"));

app.use("/category", require("./routes/categoryRoutes"));

app.use("/post", require("./routes/postRoutes"));

app.use("/comment", require("./routes/commentRoutes"));

app.use("/user", require("./routes/userroutes"));

app.use("/ban", require("./middleware/noaction/banRouter"));
// readdirSync("./routes").map((file) => {
//   app.use("/api", require('./routes/' + file));
// });

// readdirSync("./routes").map((file) => { console.log(file); app.use("/api", require('./routes/' + file)); });

////////////////check///////////////////////
app.get("/hello", (req, res) => {
  return res.status(200).send(`Hello Auth by token`);
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
  console.log(`DATABASE CONNECT :: ${process.env.DATABASE_URL}`);
  console.log(`.env.${process.env.NODE_ENV}`);
});
