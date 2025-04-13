// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display the add classification form
router.get("/add-classification", invController.showAddClassificationForm);

// Route to handle form submission for adding classification
router.post("/add-classification", invController.addClassification);

// Route to show the Add Item form
router.get("/add-item", invController.showAddItemForm);

// Route to handle Add Item form submission
router.post("/add-item", invController.addItem);

// Route for displaying a specific vehicle's details by ID
router.get("/vehicles/:id", invController.getVehicleDetails);

// Route for showing the management view
router.get("/", invController.showManagementView);

// Route for getting inventory items based on classification_id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route for editing inventory by ID
router.get("/edit/:id", utilities.handleErrors(invController.buildInvEdit));

// Route to handle Edit Item Form submission
router.post("/edit-item", invController.updateInventory);

// Route to show delete confirmation page
router.get("/delete/:id", utilities.handleErrors(invController.buildDeleteItemView));

// Route to handle deletion logic
router.post("/delete", utilities.handleErrors(invController.deleteInventory));

module.exports = router;