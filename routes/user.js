const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");

router.get("/signup", (req,res) => {
    res.render("./users/signup.ejs");
});

router.post("/signup", wrapAsync(
    async (req,res) => {
        try {
            let {username, email, password} = req.body;
            const newUser = new User({email, username});
            const registeredUser = await User.register(newUser, password);
            console.log(registeredUser);
            //automatically login after signup
            req.login(registeredUser, (err,next) => {
                if(err) {
                    return next(err);
                }
                req.flash("success", "Welcome to WanderLust");
                res.redirect("/listings");
            });
        } catch (error) {
            req.flash("error", error.message);
            res.redirect("/signup");
        }
    }
));

router.get("/login", (req,res) => {
    res.render("./users/login.ejs");
});

router.post("/login", 
    savedRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }), 
    async (req,res) => {
        req.flash("success", "Welcome back to WanderLust!");
        // console.log(res.locals.redirectUrl);
        let redirectUrl = res.locals.redirectUrl || "/listings";
        // console.log(redirectUrl);
        res.redirect(redirectUrl);
    }
);

router.get("/logout", (req,res,next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success" , "You are not logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;