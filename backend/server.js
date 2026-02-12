const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { seedAdmin } = require("./controllers/auth.controller");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB().then(() => seedAdmin());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/energy", require("./routes/energy.routes"));
app.use("/api/water", require("./routes/water.routes"));
app.use("/api/waste", require("./routes/waste.routes"));
app.use("/api/targets", require("./routes/target.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));