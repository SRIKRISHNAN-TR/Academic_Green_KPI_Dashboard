const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { getAll, updateRole, deleteUser, createUser } = require("../controllers/user.controller");

router.get("/", auth, role("admin"), getAll);
router.post("/", auth, role("admin"), createUser);
router.put("/:id/role", auth, role("admin"), updateRole);
router.delete("/:id", auth, role("admin"), deleteUser);

module.exports = router;