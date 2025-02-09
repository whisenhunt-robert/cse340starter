/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require('./utilities');

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
app.get("/", baseController.buildHome);
// Inventory routes
app.use("/inv", inventoryRoute);
// Intentional Error route for Task 3
app.get("/trigger-error", (req, res, next) => {
  // This will intentionally cause an error
  next(new Error("Intentional Server Error for Testing"));
});
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  // Add navigation generation using utility
  let nav = await utilities.getNav();

  // Log error to the console
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  // Render the error page with error details
  res.render("errors/error", {
    title: err.status || 'Server Error', // Error status or default to 'Server Error'
    message: err.message,               // Error message to display
    nav,                               // Navigation HTML
  });
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