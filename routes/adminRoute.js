const express = require("express");
const admin = express.Router();
const { authMiddleware, permitRole } = require("../middlewares/authMiddleware");
const adminCtrl = require("../controllers/adminController");

admin.post("/", authMiddleware, permitRole("admin"), adminCtrl.createAdmin);
admin.post("/test", adminCtrl.testAPIFeature);

admin.patch(
  "/",
  authMiddleware,
  permitRole("admin"),
  adminCtrl.restrictUsersAccess,
);

admin.get("/", authMiddleware, permitRole("admin"), adminCtrl.getAllAdmins);
admin.get("/users", authMiddleware, permitRole("admin"), adminCtrl.getAllUsers);

admin.delete(
  "/",
  authMiddleware,
  permitRole("admin"),
  adminCtrl.deleteAllUsers,
);

module.exports = admin;
