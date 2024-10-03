// here i have performed authntication & bcrypted password before storing & sent otp to mail anf verified it..
//made use of token for storing cookies nd argon2 for hashing otp 
//useed token only for accessing otp on another route 
const express=require("express");
// const session=require("express-session");
const argon = require("argon2");
const {bcryptPassword,comparePassword}= require("../bcrypt/convert.js")//file having thse function
const app = express();
const cookieParser= require("cookie-parser");
const activeSessions=require("../sessionToken/activeSession.js");//schema
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use(cookieParser());
const {sendEmail} = require("../bcrypt/mailer.js");//nodemailer
app.set("view engine","ejs");

const {makeToken,getUser}=require("../sessionToken/jwtPrac.js");//creating nd verify token 

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

app.get("/",(req,res)=>{
    console.log("inside /");
    res.render("Home");
});
app.get("/login",(req,res)=>{
    console.log("inside /login get");
    res.render("login");
})

app.get("/signup",(req,res)=>{
    res.render("signup");
});

async function verify(req,res,next)
{
    const user = await activeSessions.findOne({email:req.body.email});//chck if username exists
    if(!user)
    {
        var otp = await sendEmail(req.body.email);//send entered mail nd send otp 
        otp= await argon.hash(otp);//hashed otp
        res.cookie("mycookieO",otp);
        next();
    }
    else
    {
        res.redirect("/signup");
    }    
}

app.post("/verify",verify,(req,res)=>{
    console.log("/verify");
    console.log(req.body);
    const token =makeToken(req.body); //signup data stored using token
    res.cookie("mycookieD",token);
    res.render("otp");
})
app.post("/signin",async(req,res)=>{
    console.log("inside /signin");
    try{
            let data = req.body.otp;
            data = data.toString();//stringify to match value of otp
            let otp =await argon.verify(req.cookies.mycookieO,data)
        if(otp)
            {
                res.clearCookie('mycookieO');//clear otp cookie
                const user = getUser(req.cookies.mycookieD);//signup detaild
                console.log("User:",user);
                let passcode=await bcryptPassword(user.password);//bcrypt password
                var obj=new activeSessions({
                    username:user.username,
                    email:user.email,
                    password:passcode,
                    role:user.role
                });
                await obj.save()//stored in db
                .then(doc => {
                console.log('Document created:', doc);
                res.clearCookie('mycookieD');//clear signup cookie
                }) 
            .catch(err => console.error('Error:', err)); 
            res.redirect("/");//login page 
            }
            else
            {
                res.redirect("/signup");
            }
        }           
    catch(err){
        console.log(err);
    }
});

app.post("/login",async (req,res)=>{
    console.log("inside /login");
    try{
        var user=await activeSessions.findOne({username:req.body.username,email:req.body.email});
        if(user)
        {
            let check=await comparePassword(req.body.passcode,user.password);//compare bcrypt pswrd to plain pssword
            if(check)
            {
                var obj ={
                    username:user.username,
                    email:user.email,
                    passcode:user.password,
                };
                const token = makeToken(obj); //create token
                res.cookie("mycookie",token);//store in cookie 
                res.redirect("/profile");
            }
            else
            {
                res.redirect("/");
            }
        }
        else
        {
            res.redirect("/signup");
        }
    }
    catch(err)
    {
        console.log(err);
    } 
});

app.get("/logout",async (req,res)=>{
    console.log("inside logout");
    res.clearCookie('mycookie');//clear cpookie if user log out 
    res.redirect("/");
})

app.get("/profile",middleware,(req,res)=>{
    var sessionData = req.user;
    var date = new Date();
    date =date.toLocaleDateString();
    //disply data
    res.render("profile",{"name":sessionData.username,"createdAt":date,"email":sessionData.email,"username":sessionData.username});
})

app.get("/addproducts",(req,res)=>{
    res.render("addProducts");
})

app.listen(6789,(err)=>{
    if(err)
        console.log(err);
    else
    console.log("server is running");
})
