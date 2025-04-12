const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// Add this authentication bypass middleware
// app.use((req, res, next) => {
//   // Check for API key in query parameter
//   if (req.query.key === "2912") {
//     return next();
//   }
//   // Continue with normal flow
//   next();
// });

app.use("/api", routes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});