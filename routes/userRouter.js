const userModel = require("../models/userSchema");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { getUser } = require("../controllers/token");

//middleware checks if its user or not passport verify if the user is in DB
router.get("/profile", passport.authenticate('jwt', { session: false, failureRedirect: "/login" }), async (req, res) => {
    console.log("inside /profile");
    var sessionData = getUser(req.cookies.mycookie);
    if (sessionData.role == "user") {
        var date = new Date();
        date = date.toLocaleDateString();
        const user = await userModel.findOne({ email: sessionData.email });
        //disply data
        res.render("profile",
            {
                "name": sessionData.username, "createdAt": date, "email": sessionData.email,
                "username": sessionData.username, login: true, role: sessionData.role, image: user.image
            });
    }
    else if (sessionData.role) {
        res.redirect(`/${sessionData.role}/profile`);
    }
    else {
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
    }
})


module.exports = router;