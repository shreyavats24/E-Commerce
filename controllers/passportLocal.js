const LocalStrategy = require("passport-local").Strategy;
const userModel = require("../models/userSchema");
const { comparePassword } = require("./bcryptPassword");
module.exports=function initializingPassport(passport){
    passport.use( new LocalStrategy(async (username,passcode,done)=>{
        console.log(username);
        try{
            const user = await userModel.findOne({username});
            if(!user)
            {
                console.log("inside !user");
                done(null,false,{message:"user not found"});
            }
            const isMatch = await comparePassword(passcode, user.password);
            if (!isMatch) {
                console.log("Incorrect password");
                return done(null, false, { message: "Incorrect password" });
            }

            console.log("User authenticated");
            return done(null, user);
        }catch(err){
            console.log("Error:",err);
            return done(err,null);
        }
    }));
    passport.serializeUser((user,done)=>{
        // console.log(user);
        done(null,user.id);
    });
    passport.deserializeUser(async(id,done)=>{
        try{
            console.log(id);
            const user = await userModel.findById(id);
            done(null,user);
        }catch(err)
        {
            done(err,false);
        }
    });

}