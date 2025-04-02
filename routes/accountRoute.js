// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require('../utilities')
const accountController = require('../controllers/accountController')
const regValidate = require('../utilities/account-validation')

// Deliver Login View
router.get("/login",
  utilities.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the POST registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong!');
});

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  (req, res) => {
    res.status(200).send('login process')
  }
)

// Export the router
module.exports = router;