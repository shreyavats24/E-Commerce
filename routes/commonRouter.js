const userModel = require("../models/userSchema");
const express = require("express");
const multer = require("multer");
const validator = require("validator");
const argon = require("argon2");
const { bcryptPassword, comparePassword } = require("../controllers/bcryptPassword");
const router = express.Router();
const {renderProducts} = require("../controllers/getProducts");
const { makeToken, getUser } = require("../controllers/token");
const { verify, changePassword, middleware,signin,login,check, updatePasswordInDB } = require("../controllers/Authentication");
const productModel = require("../models/productSchema");
const path = require("path");
const{upload,uploadProfile} = require("../controllers/commonFunctions")
const { get5Products, getProducts,getProductexceptSelf } = require("../controllers/getProducts");
var errorMsg = null;
var count = 1;

//load home page with 5 products 
router.get("/", async (req, res) => {
    count = 1;
    const obj = await get5Products();//5 product from db
    const len = await getProducts();//len of product
    var token = getUser(req.cookies.mycookie);
    if (token){
        const obj =await getProductexceptSelf(token.id);    
        res.render("Home", { login: token, username: token.username, productObj: obj.productObj, length: obj.len, role: token.role });
    }
    else 
        res.render("Home", { login: null, username: null, productObj: obj, length: len.length, role: null });
})

//login page of if already login redirect to their profile
router.get("/login", async (req, res) => {
    var token = getUser(req.cookies.mycookie)
    if (token) {
        res.redirect(`/${token.role}/profile`);
    }
    else{
        res.render("login", { login: null, username: null, role: null,errMsg:errorMsg });
        errorMsg=null;
    }
});

//find user in db if exits else redirect to signup page
router.post("/login", async (req, res) => {
    await login(req,res);
});

//render signup page
router.get("/signup", async (req, res) => {

    var token = getUser(req.cookies.mycookie)
    if (token)
        res.redirect(`/${token.role}/profile`);
    else
        res.render("signup", { login: null,errMsg:null, username: null, role: null });
});

//verify the email and send otp using node mailer
// render otp page
router.post("/verify", verify, (req, res) => {
    console.log("/verify");
    if (!req.cookies.mycookieD) {
        const token = makeToken(req.body); //signup data stored using token
        res.cookie("mycookieD", token);
    }
    res.render("otp", { login: null, username: null, role: null });
})

//verify otp and then create user in db
router.post("/signin", async (req, res) => {
    await signin(req,res);
});


//upload profile using multer and store db
router.post("/uploadProfile", upload.single('profile'), async (req, res) => {
    await uploadProfile(req,res);
})

//about us page 
router.get("/aboutus", (req, res) => {
    let token = getUser(req.cookies.mycookie);
    if (token)
        res.render("about", { username: token.username, role: token.role, login: true });
    else
        res.render("about", { username: token, role: null, login: null });
})

//give 5 products on show more btn and send len of next 5 
router.get("/getProducts:num", async (req, res) => {
   await renderProducts(req,res); 
})

// send product detail for description
router.post("/productDetail", async (req, res) => {
    console.log("inside /detail");
    let data = await productModel.findOne({ _id: req.body.id });
    res.json(data);
})

//logout and clear cookie
router.get("/logout", (req, res) => {
    console.log("inside logout");
    res.clearCookie('mycookie');//clear cpookie if user log out 
    res.redirect("/");//redirect to home page
})

//forgetpassword page ask uh to enter email 
router.get("/forgetPassword", (req, res) => {
    res.render("forgetPswrd", { login: null, username: null, role: null });
})

//find email in db and then send otp if exists and render a otp page for it
router.post("/forgetPassword", changePassword, async (req, res) => {
    let email = await makeToken(req.body, true);
    res.cookie("mCe", email);//hashed email stored in token so that can be accesed on another route
    res.render("Rotp", { login: null, username: null, role: null });
    // res.redirect("/login");
})


//check if the email is there in the token verify the otp with otp user sent
// if both matches then render newpswrd page ask uh to enter it twice
router.post("/otpSent", check, (req, res) => {
    res.render("newpassword", { login: null, username: null, role: null });
})

// chnge the password in db
router.post("/change", async (req, res) => {
    await updatePasswordInDB(req,res);

})

module.exports = router;