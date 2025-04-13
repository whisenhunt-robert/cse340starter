const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();  // Use utilities.getNav here
  res.render("account/management", {
      title: "Management",
      nav, 
      errors: null,
  });
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();  // Use utilities.getNav here
  res.render("account/login", {
      title: "Login",
      nav, 
      errors: null,
  });
}

/* ****************************************
*  Handle login process
* *************************************** */
async function handleLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  if (!account_email || !account_password) {
    req.flash("notice", "Please provide both email and password.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: req.flash("notice"),
    });
  }

  try {
    const user = await accountModel.getAccountByEmail(account_email);

    if (!user) {
      req.flash("notice", "Invalid email or password.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: req.flash("notice"),
      });
    }

    const match = await bcrypt.compare(account_password, user.account_password);

    if (!match) {
      req.flash("notice", "Invalid email or password.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: req.flash("notice"),
      });
    }

    // ✅ Strip out password before creating token
    const accountData = {
      account_id: user.account_id,
      account_firstname: user.account_firstname,
      account_lastname: user.account_lastname,
      account_email: user.account_email,
      account_type: user.account_type
    };

    // ✅ Sign JWT token
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    // ✅ Set token as cookie
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000 // 1 hour
    });

    // ✅ Flash success and redirect
    req.flash("notice", "Successfully logged in!");
    return res.redirect("/account/management");

  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred during login.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: req.flash("notice"),
    });
  }
}

/* ****************************************
*  Handle logout process
* *************************************** */
function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/");
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();  // Use utilities.getNav here
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();  // Use utilities.getNav here
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.');
        return res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        });
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword,
    );

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        );
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
            errors,
        });
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

module.exports = { buildManagement, buildLogin, logout, buildRegister, registerAccount, handleLogin, accountLogin};