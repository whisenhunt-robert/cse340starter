const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Get details for a specific vehicle by ID
 * ************************** */
invCont.getVehicleDetails = async function (req, res, next) {
  const vehicleId = req.params.id; // Get the vehicle ID from the URL
  try {
    // Fetch the vehicle details from the model
    const vehicle = await invModel.getVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).send('Vehicle not found'); // Handle case where vehicle is not found
    }

    // Format the vehicle data into HTML
    const vehicleHtml = utilities.formatVehicleDetails(vehicle);

    // Get the navigation bar and any additional data
    const nav = await utilities.getNav();

    // Send the rendered vehicle details view
    res.render("inventory/vehicleDetail", {
      title: `${vehicle.make} ${vehicle.model} - Details`, // Set page title
      nav,
      vehicle: vehicleHtml, // Pass the vehicle HTML to the view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports = invCont;