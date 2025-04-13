const pool = require("../database/");

const invModel = {};

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

// Add a new classification to the database
async function addClassification(classificationName) {

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
async function addInventoryItem(item) {
  try {
    const query = await pool.query( `
      INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
  `,
  [item.make, item.model, item.year, item.description, item.imagePath, item.thumbnail, item.price, item.miles, item.color, item.classification_id],
  );
      return query;
  } catch (err) {
      console.error('Error inserting inventory item:', err);
      return null;
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
      WHERE i.inv_id = $1`, 
      [vehicleId]
    );

    return data.rows[0]; // Return the first result (vehicle data)
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}

// Update inventory item
async function updateInventory(item) {
  try {
    const query = await pool.query(`
      UPDATE public.inventory 
      SET 
        inv_make = $2,
        inv_model = $3,
        inv_year = $4,
        inv_description = $5,
        inv_image = $6,
        inv_thumbnail = $7,
        inv_price = $8,
        inv_miles = $9,
        inv_color = $10,
        classification_id = $11
      WHERE inv_id = $1
      RETURNING *
    `,
    [
      item.inv_id,
      item.make,
      item.model,
      item.year,
      item.description,
      item.imagePath,
      item.thumbnail,
      item.price,
      item.miles,
      item.color,
      item.classification_id
    ]);
    
    if (query.rowCount === 0) {
      throw new Error("No rows updated! Please verify inv_id exists in the database.");
    }
    
    return query.rows[0]; // Return the updated row
  } catch (err) {
    console.error('Error updating inventory item:', err);
    return null; // Return null on error
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    throw new Error("Delete Inventory Error")
  }
}

module.exports = { getClassifications, addClassification, addInventoryItem, getInventoryByClassificationId, getVehicleById, updateInventory, deleteInventory};