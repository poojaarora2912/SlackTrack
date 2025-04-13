// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const routes = require("./routes");

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());


// app.use((req, res, next) => {
//   console.log(req.path, req.method)
//   next()
// })

// app.use("/api", routes);

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();
const routes = require('./src/routes/slackTrackRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/", routes);

// module.exports = app;

app.listen(4000, ()=> {
  console.log("Hello");
}) 
