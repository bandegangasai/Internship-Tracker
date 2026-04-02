const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const internshipsRouter = require("./routes/internships");
const { Internship } = require("./models/Internship");
const sampleInternships = require("./seed/sampleData");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/internship-tracker";
const frontendPath = path.join(__dirname, "..", "frontend");

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.get("/api/health", (_req, res) => {
  res.json({ message: "Internship Tracker API is running" });
});

app.use("/api/internships", internshipsRouter);

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((err, _req, res, _next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((item) => item.message),
    });
  }

  console.error("Server error:", err);

  res.status(500).json({
    message: "Something went wrong on the server",
  });
});

const seedDatabase = async () => {
  const count = await Internship.countDocuments();

  if (count === 0) {
    // Seed starter data so the dashboard is useful on first launch.
    await Internship.insertMany(sampleInternships);
    console.log("Sample internships inserted.");
  }
};

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
