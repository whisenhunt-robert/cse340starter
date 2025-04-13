const { response, request } = require("express");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

// Build Management View
invCont.showManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
 
    // Build select for classification
    const classificationList = await utilities.buildClassificationList()
 
    // Add links
    let addClassification =
      '<a href="/inventory/add-classification" id="add-classification-form"> Add Classification</a>'
    let addItem =
      '<a href="/inventory/add-item" id="add-inventory-form"> Add Inventory Item</a>'
        
    // Render the management view
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      addClassification,
      addItem,
      errors: null,
      accountData: res.locals.accountData,
    })
  } catch (error) {
    next(`Error building account view: ${error}`)
  }
}

// Show Add Item Form
invCont.showAddItemForm = async function (req, res) {
  let nav = await utilities.getNav();
  try {
    // Log the classificationList to check if it is an array
    let classificationList = await utilities.buildClassificationList();
    console.log("Classification List:", classificationList);  // Debugging log
    console.log(req.body);

    if (req.body) {
    let make = req.body.make;
    let model = req.body.model;
    let year = req.body.year;
    let description = req.body.description;
    let price = req.body.price;
    let miles = req.body.miles;
    let color = req.body.color;

    res.render("inventory/add-item", {
      title: "Add New Inventory Item",
      classificationList: classificationList,
      nav,
      make:make,
      model,
      year,
      description,
      price,
      miles,
      color,
      errors: null,
    });
    }
    else {
      res.render("inventory/add-item", {
        title: "Add New Inventory Item",
        classificationList: classificationList,
        nav,
        make: null,
        model: null,
        year: null,
        description: null,
        price: null,
        miles: null,
        color: null,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error loading add item form:", error);
    res.status(500).send("Server Error");
  }
};

// Add New Inventory Item
invCont.addItem = async function (req, res) {
  const item = { make: req.body.make, 
    model: req.body.model, 
    year: req.body.year, 
    description: req.body.description, 
    imagePath: "/images/vehicles/no-image.png", 
    thumbnail: "/images/vehicles/no-image-tn.png", 
    price: req.body.price, 
    miles: req.body.miles, 
    color: req.body.color, 
    classification_id: req.body.classification_id };
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();

  try {
    // Insert the new vehicle into the database
    await invModel.addInventoryItem(item);

      // Success message
    req.flash("messages", "New vehicle added successfully!");
    res.redirect("/inventory/");
  } catch (error) {
    console.error("Error adding inventory item:", error);
    req.flash("messages", "Error adding inventory item. Please try again.");
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
  }
};

/* ***************************
 *  Add Classification Form
 * ************************** */

// Show the Add Classification Form
invCont.showAddClassificationForm = async function (req, res) {
  try {
    // Get the navigation bar or any other necessary data
    let nav = await utilities.getNav(); // Changed to utilities.getNav

    // Render the add-classification view with nav passed in
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav, // Pass nav to the view
    });
  } catch (error) {
    console.error("Error loading add classification form:", error);
    res.status(500).send("Server Error");
  }
};

// Add New Classification (Server-side validation and insertion)
invCont.addClassification = async function (req, res) {
  const { classificationName } = req.body;

  // Server-side validation (no spaces or special characters)
  const pattern = /^[A-Za-z0-9]+$/;
  if (!classificationName.match(pattern)) {
    req.flash("messages", "Classification name must only contain letters and numbers, without spaces or special characters.");
    return res.redirect("/inventory/add-classification");
  }

  try {
    // Insert the classification into the database
    await invModel.addClassification(classificationName);

    // If successful, flash a success message and render the management page
    req.flash("messages", "New classification added successfully!");
    return res.redirect("/inventory"); // Redirect to the management view

  } catch (error) {
    // If insertion fails, flash an error message
    req.flash("messages", "Error adding classification. Please try again.");
    return res.redirect("/inventory/add-classification");
  }
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav(); // Changed to use utilities.getNav
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
    const nav = await utilities.getNav(); // Changed to use utilities.getNav

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

// Get Inventory items based on Classification ID (JSON response)
invCont.getInventoryJSON = async function (req, res, next) {
  const { classification_id } = req.params; // Get the classification_id from the URL params

  try {
    // Fetch the inventory items for this classification from the database
    const result = await invModel.getInventoryByClassificationId(classification_id); // Assuming invModel has this function

    // If no items are found for the classification, return an empty array
    if (result.length === 0) {
      return res.json([]); // Return an empty array if no items are found
    }

    // Return the inventory items as JSON
    return res.json(result); // Send the fetched items as a JSON response
  } catch (error) {
    // Log any errors and send a 500 status with an error message
    console.error("Error fetching inventory:", error);
    return res.status(500).json({ error: 'Unable to fetch inventory items' });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
/* invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
} */

invCont.buildInvEdit = async function (req, res) {
  let nav = await utilities.getNav();
  const editID = parseInt(req.params.id)
  try {
    let itemData = await invModel.getVehicleById(editID);
    let classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    console.log("Classification Select:", classificationSelect);

    res.render("./inventory/edit-item", {
      title: "Edit " + itemName,
      itemName,
      nav,
      classificationSelect, // Make sure EJS uses this
      errors: null,
      id: itemData.inv_id,
      make: itemData.inv_make,
      model: itemData.inv_model,
      year: itemData.inv_year,
      description: itemData.inv_description,
      image: itemData.inv_image,
      thumbnail: itemData.inv_thumbnail,
      price: itemData.inv_price,
      miles: itemData.inv_miles,
      color: itemData.inv_color,
      classification_id: itemData.classification_id
    })

  } catch (error) {
    console.error("Error loading edit item form:", error);
    res.status(500).send("Server Error");
  }
};

// Update Inventory Item
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  
  try {
    const {
      inv_id,
      make,
      model,
      year,
      description,
      price,
      miles,
      color,
      classification_id
    } = req.body;

    // Placeholder image paths for now
    const imagePath = "/images/vehicles/no-image.png";
    const thumbnail = "/images/vehicles/no-image-tn.png";

    // Call the model to update
    const updateResult = await invModel.updateInventoryItem({
      inv_id,
      make,
      model,
      year,
      description,
      imagePath,
      thumbnail,
      price,
      miles,
      color,
      classification_id
    });

    if (updateResult) {
      const itemName = `${make} ${model}`;
      req.flash("messages", `The ${itemName} was successfully updated.`);
      return res.redirect("/inventory/");
    } else {
      throw new Error("Update failed.");
    }

  } catch (error) {
    console.error("Error updating inventory item:", error);

    // Safely grab fallback values if error happened before destructuring
    const {
      inv_id,
      make,
      model,
      year,
      description,
      price,
      miles,
      color,
      classification_id
    } = req.body;

    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${make} ${model}`;

    req.flash("messages", "Error updating inventory item. Please try again.");
    return res.status(500).render("inventory/edit-item", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      make,
      model,
      year,
      description,
      price,
      miles,
      color,
      classification_id
    });
  }
};

module.exports = invCont;