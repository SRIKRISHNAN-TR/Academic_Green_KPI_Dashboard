const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const c = require("../controllers/notification.controller");

router.get("/", auth, c.getAll);
router.get("/unread-count", auth, c.getUnreadCount);
router.put("/read-all", auth, c.markAllAsRead);
router.put("/:id/read", auth, c.markAsRead);
router.put("/:id/resolve", auth, role("admin"), c.toggleResolved);
router.delete("/:id", auth, role("admin"), c.deleteOne);

module.exports = router;