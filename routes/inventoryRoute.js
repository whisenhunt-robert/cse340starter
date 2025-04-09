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

module.exports = router;