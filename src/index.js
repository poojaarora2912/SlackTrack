const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Add this authentication bypass middleware
app.use((req, res, next) => {
  // Check for API key in query parameter
  if (req.query.key === "2912") {
    return next();
  }
  // Continue with normal flow
  next();
});

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});