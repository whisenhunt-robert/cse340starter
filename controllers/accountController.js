const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountCont = {};

/* ****************************************
*  Deliver management view
* *************************************** */
accountCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;

  // 👇 This builds the dropdown select element
  const classificationList = await utilities.buildClassificationList();

  res.render("account/management", {
    title: "Management",
    nav,
    classificationList, // 👈 Pass to the view
    accountData,
    errors: null
  });
}

/* ****************************************
*  Deliver login view
* *************************************** */
accountCont.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
};

/* ****************************************
*  Deliver registration view
* *************************************** */
accountCont.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
};

/* ****************************************
*  Process Registration
* *************************************** */
accountCont.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
};

/* ****************************************
 * Handle login process
 * *************************************** */
accountCont.handleLogin = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    const user = await accountModel.getAccountByEmail(account_email);
    if (!user) throw new Error("Invalid email or password.");

    const match = await bcrypt.compare(account_password, user.account_password);
    if (!match) throw new Error("Invalid email or password.");

    const accountData = {
      account_id: user.account_id,
      account_firstname: user.account_firstname,
      account_lastname: user.account_lastname,
      account_email: user.account_email,
      account_type: user.account_type
    };

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000
    });

    req.flash("notice", "Successfully logged in!");
    return res.redirect("/account/management");

  } catch (error) {
    // Use `errors` flash to store errors as an array
    req.flash("errors", [{ msg: error.message }]);  // Store the error message
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: req.flash("errors"),  // Pass it as an array
      account_email: req.body.account_email,  // Retain email input in case of errors
    });
  }
};

/* ****************************************
*  Handle logout process
* *************************************** */
accountCont.logout = function (req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/");
};

/* ****************************************
 * Deliver account update view
 * *************************************** */
accountCont.buildAccountUpdateView = async function (req, res) {
  const account_id = parseInt(req.params.account_id);
  const nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(account_id);

  res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null,
    accountData
  });
};

/* ****************************************
 * Process account update
 * *************************************** */
accountCont.accountUpdate = async function (req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  try {
    // Fetch the current account data
    const currentAccount = await accountModel.getAccountById(account_id);

    // Check if the email has been changed
    let emailExists = false;
    if (account_email !== currentAccount.account_email) {
      // Only check for email duplication if it's being changed
      emailExists = await accountModel.getAccountByEmail(account_email);
    }

    if (emailExists) {
      req.flash("error", "That email is already in use.");
      return res.redirect(`/account/update/${account_id}`);
    }

    // Proceed to update the account information
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      req.flash("success", "Account information updated successfully.");
      return res.redirect("/account/management");
    } else {
      req.flash("error", "Update failed. Please try again.");
      return res.redirect(`/account/update/${account_id}`);
    }

  } catch (error) {
    console.error("Update error:", error);
    req.flash("error", "An error occurred. Please try again.");
    return res.redirect(`/account/update/${account_id}`);
  }
};

/* ****************************************
 * Handle password update
 * *************************************** */
accountCont.passwordUpdate = async function (req, res) {
  const { account_id, account_password } = req.body;
  const nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("success", "Password successfully updated.");
    } else {
      req.flash("error", "Password update failed.");
    }

    const accountData = await accountModel.getAccountById(account_id);

    // Render the management page and pass the flash messages to the view
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      errors: req.flash("error"), // Pass errors to the view
    });

  } catch (error) {
    console.error("Password update error:", error);
    req.flash("error", "There was an issue updating the password.");

    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      errors: req.flash("error"), // Pass errors to the view
    });
  }
};

module.exports = accountCont;