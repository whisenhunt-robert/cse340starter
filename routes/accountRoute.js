// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require('../utilities')
const accountController = require('../controllers/accountController')

// Deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to register account
router.post('/register', utilities.handleErrors(accountController.registerAccount))

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong!');
});

// Export the router
module.exports = router;