const userModel = require("../models/userSchema");
const express = require("express");
const multer = require("multer");
const validator = require("validator");
const argon = require("argon2");
const { bcryptPassword, comparePassword } = require("../controllers/bcryptPassword");
const router = express.Router();
const { makeToken, getUser } = require("../controllers/token");
const { verify, changePassword, middleware } = require("../controllers/Authentication");
const productModel = require("../models/productSchema");
const path = require("path");
// const ordersModel = require("../models/ordersSchema");
// const { checkRole } = require("../controllers/Authentication");
const { get5Products, getProducts,getProductexceptSelf } = require("../controllers/getProducts");
// const { calculateBill, deleteItem, updateQtyEmptyCart } = require("../controllers/cartFunction");
var img;
var errorMsg = null;

//multer used for profile image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Save to the 'uploads' folder
    },
    filename: async function (req, file, cb) {
        img = await file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, img); // Define the file name
    }
});

const upload = multer({ storage: storage });

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
    console.log("inside /login");
    if (validator.isEmail(req.body.email)) {
        try {
            var user = await userModel.findOne({email: req.body.email});
            if (user) 
            {
                if (!user.isdisable && user.role==req.body.role &&user.username ==req.body.username) {
                    let check = await comparePassword(req.body.passcode, user.password);//compare bcrypt pswrd to plain pssword
                    if (check) {
                        var obj = {
                            username: user.username,
                            email: user.email,
                            passcode: user.password,
                            role: user.role,
                            id: user._id,
                            image: user.image
                        };
                        // console.log("user.image", user.image);
                        const token = makeToken(obj); //create token
                        res.cookie("mycookie", token);//store in cookie 
                        errorMsg =null;
                        res.redirect(`/${user.role}/profile`);
                    }
                    else {
                        errorMsg ="Invalid Credentials!!";
                        res.redirect("/login");
                    }
                }
                else if(user.isdisable) {
                    res.send("Sorry,you are disabled by admin!!!")
                }
                else if(user.role!=req.body.role || user.username !=req.body.username) {
                    console.log(req.body);
                    errorMsg ="Invalid Credentials!!";
                    res.redirect("/login");
                }
            }
            else{
                res.redirect("/signup");
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    else{
        res.redirect("/login");
    }

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
    console.log("inside /signin");
    try {
        let data = req.body.otp;
        data = data.toString();//stringify to match value of otp
        let otp = await argon.verify(req.cookies.mycookieO, data)
        if (otp) {
            console.log("otp");
            res.clearCookie('mycookieO');//clear otp cookie
            const user = getUser(req.cookies.mycookieD);//signup detaild
            let passcode = await bcryptPassword(user.password);//bcrypt password
            var obj = new userModel({
                username: user.username,
                email: user.email,
                password: passcode,  
                role: user.role,
                isdisable: false
            });
            await obj.save()//stored in db
                .then(doc => {
                    console.log('Document created:', doc);
                    // res.clearCookie('mycookieD');//clear signup cookie
                })
                .catch(err => console.error('Error:', err));
            res.redirect(`/login`);//login page 
        }
        else if(!otp)
        {
            res.redirect("/verify");
        }
        else {
            // console.log("else");
            res.redirect("/signup");
        }
    }
    catch (err) {
        console.log(err);
    }
});


//upload profile using multer and store db
router.post("/uploadProfile", upload.single('profile'), async (req, res) => {
    var user = getUser(req.cookies.mycookie);
    if(user)
    {
        try{
            await userModel.findOneAndUpdate({ username: user.username, email: user.email }, {
                image: "/images/" + img
            });
        }catch(err){
            console.log("upload profile error:",err);
        }
        res.redirect("/user/profile");
    }
    else{
        res.redirect("/");
    }
    
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
router.get("/getProducts", async (req, res) => {
    const user = getUser(req.cookies.mycookie);
    if(user){
    const products = await productModel.find({ isdisable: false,adminId: { $ne: user.id } }).skip(5 * count).limit(5);
    count++;
    const nextdata = await productModel.find({ isdisable: false,adminId: { $ne: user.id }}).skip(5 * (count)).limit(5);
    if (products.length == 0)
        count = 1;
    res.json({ products, nextdata });  //return products array of objects to client side for dom creation
    }
    else{
        const products = await productModel.find({ isdisable: false}).skip(5 * count).limit(5);
        count++;
        const nextdata = await productModel.find({ isdisable: false}).skip(5 * (count)).limit(5);
        if (products.length == 0)
            count = 1;
        res.json({ products, nextdata });  //return products array of objects to client side for dom creation
    }
   
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

async function check(req, res, next) {
    // console.log("inn checkk");
    if (req.cookies.mCe) {
        let data = req.body.otp;
        data = data.toString();//stringify to match value of otp
        let otp = await argon.verify(req.cookies.mycookieO, data)
        if (otp) {
            res.clearCookie('mycookieO');//clear otp cookie
            next();
        }
        else {
            res.send("Invalid Data!!!<a href='/'>Go to home page</a>")
        }
    }
    else {
        res.send("unauthorised");
    }
}

//check if the email is there in the token verify the otp with otp user sent
// if both matches then render newpswrd page ask uh to enter it twice
router.post("/otpSent", check, (req, res) => {
    res.render("newpassword", { login: null, username: null, role: null });
})

// chnge the password in db
router.post("/change", async (req, res) => {
    let password = req.body.confirmpassword;
    let mail = getUser(req.cookies.mCe);
    let Bpassword = await bcryptPassword(password);
    if (mail && Bpassword) {
        try {
            console.log("inside try")
            await userModel.findOneAndUpdate({ email: mail.email }, { password: Bpassword })
            // res.redirect("/login");
            res.clearCookie("mCe");
            res.send("Successfully Updated!!");
        } catch (err) {
            console.log(err);
        }
    }
    else {
        res.send('Something went wrong <a href="/">Go to home page</a>')
    }

})

module.exports = router;