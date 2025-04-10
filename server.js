/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const static = require("./routes/static");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const inventoryRoute = require("./routes/inventoryRoute");
const baseController = require("./controllers/baseController");
const invController = require('./controllers/invController');
const utilities = require('./utilities');  // This will now correctly load index.js
const session = require("express-session");
const pool = require('./database/');
const accountRoute = require('./routes/accountRoute');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  // Add navigation generation using utility
  let nav = await utilities.getNav();

  // Log error to the console
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  if (err.status == 404) {
    message = err.message;
  }
  else {
    message = "Oh no! There was a crash! Maybe try a different route?"
  };

  // Render the error page with error details
  res.render("errors/error", {
    title: err.status || 'Server Error', // Error status or default to 'Server Error'
    message: err.message,               // Error message to display
    nav,                               // Navigation HTML
  });
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inventory", inventoryRoute);
app.use("/account", accountRoute);

// Intentional Error route for Task 3
app.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional Server Error for Testing"));
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});