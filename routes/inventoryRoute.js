// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Add new route for displaying a specific vehicle's details by ID
router.get("/vehicles/:id", invController.getVehicleDetails);

module.exports = router;