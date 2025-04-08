// accountRoute.js
const express = require("express");
const router = express.Router();
const utilities = require('../utilities');  // Ensure this points to the correct 'utilities.js'
const accountController = require('../controllers/accountController');
const { validate } = require('../utilities/account-validation');

// Deliver Management View
router.get("/management", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Post Login (process the login)
router.post("/login", validate.loginRules(), validate.checkLoginData, utilities.handleErrors(accountController.handleLogin)); // Using handleLogin for login logic

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the POST registration data
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Export the router
module.exports = router;