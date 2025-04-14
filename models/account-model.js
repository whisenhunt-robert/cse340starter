const pool = require("../database/index");

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ***********************
 * Get account by ID
 * *********************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error:", error);
    throw error;
  }
}

/* ***************************
 * Update account info
 * *************************** */
async function updateAccount(account_id, firstname, lastname, email) {
  const sql = `
    UPDATE account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
    RETURNING *;
  `
  const data = await pool.query(sql, [firstname, lastname, email, account_id])
  return data.rows[0]
}

/* ***************************
 * Update password hash
 * *************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const result = await pool.query(
      `UPDATE public.account 
       SET account_password = $1 
       WHERE account_id = $2 
       RETURNING *`,
      [hashedPassword, account_id]
    );
    return result.rowCount; // 1 if successful
  } catch (error) {
    console.error("updatePassword error:", error);
    throw error;
  }
}

// Export the function to make it available for use in other files
module.exports = {
    registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword
  };