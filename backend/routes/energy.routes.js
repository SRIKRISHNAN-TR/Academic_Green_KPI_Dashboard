const router = require("express").Router();
const c = require("../controllers/energy.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/", c.getAll);
router.get("/:id", c.getById);
router.post("/", auth, role("admin", "data-entry"), c.create);
router.put("/:id", auth, role("admin", "data-entry"), c.update);
router.delete("/:id", auth, role("admin"), c.remove);

module.exports = router;