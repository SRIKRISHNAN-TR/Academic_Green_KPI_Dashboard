const router = require("express").Router();
const c = require("../controllers/target.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", c.getAll);
router.post("/", auth, role("admin", "data-entry"), c.create);
router.put("/:id", auth, role("admin", "data-entry"), c.update);
router.delete("/:id", auth, role("admin"), c.remove);

module.exports = router;