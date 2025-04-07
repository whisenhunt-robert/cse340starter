const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");

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
    let nav = await utilities.getNav();  // Use utilities.getNav here
    const { account_email, account_password } = req.body;

    // Validate if email and password are provided
    if (!account_email || !account_password) {
        req.flash("notice", "Please provide both email and password.");
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: req.flash("notice"),
        });
    }

    try {
        // Check if account exists by email
        const user = await accountModel.getAccountByEmail(account_email);
        if (!user) {
            req.flash("notice", "Invalid email or password.");
            return res.status(401).render("account/login", {
                title: "Login",
                nav,
                errors: req.flash("notice"),
            });
        }

        // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(account_password, user.account_password);
        if (!match) {
            req.flash("notice", "Invalid email or password.");
            return res.status(401).render("account/login", {
                title: "Login",
                nav,
                errors: req.flash("notice"),
            });
        }

        // Successful login
        req.session.user = user;  // Store user session (consider security here)
        req.flash("notice", "Successfully logged in!");
        return res.redirect("/dashboard");  // Redirect to a dashboard or home page after login

    } catch (error) {
        console.error(error);
        req.flash("notice", "An error occurred while processing your login.");
        return res.status(500).render("account/login", {
            title: "Login",
            nav,
            errors: req.flash("notice"),
        });
    }
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

module.exports = { buildLogin, buildRegister, registerAccount, handleLogin };