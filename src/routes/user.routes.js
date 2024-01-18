const UserController = require("../controllers/user.controller");
const { Router } = require("express");
const router = Router();

/**
 * ! User Routes
 * * Get Method
 */

router.post("/saveUserDetails", UserController.saveUserDetails);

router.post("/verifyOTP", UserController.verifyOTP);

module.exports = router;
