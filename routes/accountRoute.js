// accountRoute.js
const express = require("express");
const router = express.Router();
const utilities = require('../utilities');  // Ensure this points to the correct 'utilities.js'
const accountController = require('../controllers/accountController');
const { validate } = require('../utilities/account-validation');

// Deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Post Login (process the login)
router.post("/login", utilities.handleErrors(accountController.handleLogin)); // Using handleLogin for login logic

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the POST registration data
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Error handling middleware for any remaining errors
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong!');
});

// Export the router
module.exports = router;