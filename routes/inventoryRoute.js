// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

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

// Add new route for displaying a specific vehicle's details by ID
router.get("/vehicles/:id", invController.getVehicleDetails);

// Add new route for showing the management view
router.get("/", invController.showManagementView);

module.exports = router;