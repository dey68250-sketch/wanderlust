const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport")
const { saveRedirectUrl } = require("../middlewar.js")

router.get("/signUp", (req, res) =>{
    res.render("user/signUp")
});

router.post("/signUp", async (req, res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) return next(err);
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });
    } catch(err){
        req.flash("error", err.message);
        res.redirect("/signUp");
    }
})

router.get("/login", (req, res) => {
    res.render("user/login")
})

router.post("/login", saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;