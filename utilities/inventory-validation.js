const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const inventoryModel = require("../models/inventory-model");

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => { // Fixed the typo here
  return [
    // make is required and must be a string
    body("make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a make."), // on error this message is sent.

    // model is required and must be a string
    body("model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a model."), // on error this message is sent.

    // valid year is required
    body("year")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Please provide a year."),

    // valid description is required
    body("description")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a description."),

    // valid price is required
    body("price")
    .trim()
    .escape()
    .notEmpty()
    .isInt()
    .withMessage("Please provide a price."),

    // Milage is required
    body("description")
    .trim()
    .escape()
    .notEmpty()
    .isNumeric()
    .withMessage("Please provide milage."),

    // Color is required
    body("color")
    .trim()
    .escape()
    .notEmpty()
    .isAlpha()
    .withMessage("Please provide a color."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkInvData = async (req, res, next) => {
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-item", {
        title: "Add New Item",
        nav,
        errors: null,
        make: req.body.make, 
      model: req.body.model, 
      year: req.body.year, 
      description: req.body.description, 
      price: req.body.price, 
      miles: req.body.miles, 
      color: req.body.color,
      classificationList,
      });
    return;
  }
  next();
};

/* ******************************
 * Errors will be directed back to the edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    const itemName = `${make} ${model}`;
    res.render("inventory/edit-item", {
        title: "Edit " + itemName,
        nav,
        inv_id,
        errors: null,
        make: req.body.make, 
      model: req.body.model, 
      year: req.body.year, 
      description: req.body.description, 
      price: req.body.price, 
      miles: req.body.miles, 
      color: req.body.color,
      classificationList,
      });
    return;
  }
  next();
};

module.exports = { validate }; // Fixed the export of validate object