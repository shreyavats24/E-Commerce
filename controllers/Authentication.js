const {sendEmail,sendResetEmail}=require("./mailer");
const validator = require('validator');
const argon = require("argon2");
const {getUser}=require("../controllers/token");
const userModel = require("../models/userSchema");
var errMsg=null;
//verification of email and otp sending
async function  verify(req,res,next)
{
    console.log("in verify function");
    if(!req.body.email)
    {
        console.log("token data taken");
        req.body = getUser(req.cookies.mycookieD);
    }
    const user = await userModel.findOne({
        $or:[
                {username:req.body.username},
                {email:req.body.email}
            ]
    });//chck if username exists
    var isAdmin = await userModel.findOne({role:"admin"});
    if(!user && isAdmin.role != req.body.role)
    {
        // console.log("inn data");
        if(validator.isEmail(req.body.email)){
            var otp = await sendEmail(req.body.email);//send entered mail nd send otp 
            console.log("otp",otp);
            otp= await argon.hash(otp);//hashed otp
            res.cookie("mycookieO",otp);
            next();
        }
        else{
            res.redirect("please enter a valid email!!<p>Don't have an account? <a href='/signup'>Sign Up</a></p><p>Do have an account? <a href='/login'>Login</a></p>")
        }
    }
    else if(isAdmin.role == req.body.role)
    {
        res.send("you can't signin as admin...<p>Don't have an account? <a href='/signup'>Sign Up</a></p><p>Do have an account? <a href='/login'>Login</a></p>");        
    }
    else 
    {
        errMsg="email or username is already used!!!";
        res.render("signup",{errMsg:errMsg,login: null, username: null, role: null });
        errMsg=null;
    }    
}
//forgetpassword middleware
async function changePassword(req,res,next)
{
    if(validator.isEmail(req.body.email)){
        const user = await userModel.findOne({email:req.body.email});
        if(!user)
            res.redirect("/signup");
        if(!user.isdisable)
        {
            var otp = await sendEmail(req.body.email);//send entered mail nd send otp 
            console.log("otp",otp);
            otp= await argon.hash(otp);//hashed otp
            res.cookie("mycookieO",otp);
            next();
        }
        else{
            res.send("Sorry,you are disabled by admin!!!");
        }
    }
    else{
        res.send("Please Enter a Valid email!!<br><br><p>Don't have an account? <a href='/signup'>Sign Up</a></p><p>Do have an account? <a href='/login'>Login</a></p>")
    }
    
}

//profile checking middleware
function middleware(req,res,next){//chck if cookies exists verified token nd given access to profile
    const token = req.cookies.mycookie;
    const user=getUser(token);
    // console.log(user);
    if(user)
    {
        req.user=user;
        next();
    }     
    else
    {
        res.redirect("/"); 
    }
}

async function checkRole(req,res,next){
   
    var sessionData = getUser(req.cookies.mycookie);
    let data;
    if(sessionData){
        var user = await userModel.findOne({email:sessionData.email});
        if(!user.isdisable)
        {
            next();
        }
        else if(user.isdisable){
            data="Sorry,Admin disabled you!!";
            res.send({data});
        }
        else
        {
            data="failure";
            res.send({data});
        }
    }
    else{
        data="failure";
        res.send({data});
    }
    
}
module.exports={
    verify,
    middleware,changePassword,checkRole
}