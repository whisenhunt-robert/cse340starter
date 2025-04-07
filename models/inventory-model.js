const pool = require("../database/");

const invModel = {};

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

// Add a new classification to the database
invModel.addClassification = async function (classificationName) {

  try {
    const query = await pool.query('INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *',
    [classificationName],
  )
  return query;
  } catch (error) {
      throw new Error("Database error: Unable to add classification.");
  }
};

// Add new inventory item
invModel.addInventoryItem = async function (item) {
  try {
    const query = await pool.query( `
      INSERT INTO inventory (make, model, year, description, imagePath, thumbnail, price, miles, color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `,
  [item.make, item.model, item.year, item.description, item.imagePath, item.thumbnail, item.price, item.miles, item.color, item.classification_id],
  );
      return query;
  } catch (err) {
      console.error('Error inserting inventory item:', err);
      throw new Error('Database insertion failed');
  }
};

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
  }
}

/* ***************************
 *  Get a specific vehicle by ID
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inventory_id = $1`, 
      [vehicleId]
    );

    return data.rows[0]; // Return the first result (vehicle data)
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById };