const express=require("express");
const router = express.Router();
const {getUser} = require("../controllers/token");
const userModel = require("../models/userSchema");
const {bcryptPassword,comparePassword} = require("../controllers/bcryptPassword");


router.get("/",(req,res)=>{
    const data = getUser(req.cookies.mycookie);
    if(data)
    res.render("reset",{ login: true, username:data.username , role: null });
    else
    res.redirect("/");
})

router.post("/verify",async (req,res)=>{
    console.log("verify");
    let old = req.body.old;
    let newP = req.body.newp;
    let password = req.body.password;
    try{
        const data = getUser(req.cookies.mycookie);
        if(data){
        const user = await userModel.findOne({email:data.email});
        let result = await comparePassword(old,user.password);
        if(result)
        {
            if(newP == password)
            {
                password =await bcryptPassword(password);
                await userModel.findOneAndUpdate({email:data.email},{
                    password:password
                });
                res.send("success");
            }
            else
            {
                res.send("new Passwords not matched with each other!!")
            }
        }
        else{
            res.send("Old Password not matched!!");
        }
        }
        else{
            res.send("Unauthorised!!");
        }
    }catch(err)
    {
        console.log("Reset Password Error:",err);
        res.send("Something Went wrong!!!");
    }

    
})
module.exports=router;