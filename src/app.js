const express = require("express");
const app = express();

const { conncectdb } = require("./config/database");
const cors = require("cors");
app.use(cors({
  origin: ["http://localhost:5173", "http://13.60.226.82"],
  credentials: true,
}));


const cookie_parser = require("cookie-parser");

const { UserAuth } = require("./middlwares/auth.js");
console.log("UserAuth is:", UserAuth);

app.use(express.json());
app.use(cookie_parser());
app.use("/uploads", express.static("uploads"));


const { authRouter } = require("./Routers/Auth");
const { ProfileRouter } = require("./Routers/profile");
const { RequestRouter } = require("./Routers/sendrequest.js");
const { getuserrequest } = require("./Routers/getuserrequest.js");

app.use("/", authRouter);
app.use("/", ProfileRouter);
app.use("/", RequestRouter);
app.use("/", getuserrequest);

// ✅ Connect to MongoDB first
conncectdb()
  .then(() => {
    console.log(" Database connected successfully");

    // ✅ Start the server only after DB connection
    app.listen(3000, () => {
      console.log(" Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });
