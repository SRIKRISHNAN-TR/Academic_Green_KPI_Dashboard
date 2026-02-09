const router = require("express").Router();
const c = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/summary", c.getSummary);
router.get("/highest-usage", c.getHighestUsage);
router.post("/snapshot", auth, role("admin"), c.generateSnapshot);
router.get("/snapshots", c.getSnapshots);

module.exports = router;