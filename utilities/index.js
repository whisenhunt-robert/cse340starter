const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inventory/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications(); // Fetch classifications from the database
  let classificationList =
      '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  
  // Iterate over classifications and build options
  data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"';
      if (classification_id != null && row.classification_id == classification_id) {
          classificationList += " selected ";
      }
      classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
}

/* **************************************
 * Build the classification view HTML
 ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Format the vehicle details into HTML
 ************************************ */
Util.formatVehicleDetails = function(vehicle) {
  let vehicleHtml = "<div class='vehicle-details'>";
  
  // Title with make and model
  vehicleHtml += `<h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>`;
  
  // Full-size vehicle image
  vehicleHtml += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="full-image" />`;

  // Vehicle details: Make, Model, Year, Price
  vehicleHtml += `
    <div class="vehicle-info">
      <p><strong>Make:</strong> ${vehicle.inv_make}</p>
      <p><strong>Model:</strong> ${vehicle.inv_model}</p>
      <p><strong>Year:</strong> ${vehicle.inv_year}</p>
      <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
      <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
    </div>
  `;

  // Description if available
  if (vehicle.inv_description) {
    vehicleHtml += `
      <div class="vehicle-description">
        <h3>Description:</h3>
        <p>${vehicle.inv_description}</p>
      </div>
    `;
  }

  vehicleHtml += "</div>";

  return vehicleHtml;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util; // Exporting everything correctly