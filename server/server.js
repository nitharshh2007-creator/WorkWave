const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const connectDB = require("./config/db");

const path = require("path");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userRoutes);



app.get("/", (req, res) => {
  res.send("WorkWave API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});