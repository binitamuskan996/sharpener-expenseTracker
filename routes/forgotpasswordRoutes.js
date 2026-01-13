const express = require("express");
const router = express.Router();

const forgetpasswordController = require("../controllers/forgotpasswordController");

router.post("/forgotpassword",forgetpasswordController.forgotpassword);
router.post("/resetpassword", forgetpasswordController.resetPassword);

module.exports = router;