// passport js is a middleware used for authentication we can do local ,jwt and through ur account on google facebook or insta
const jwtPassport = require("passport-jwt");
const Strategy = jwtPassport.Strategy;
const extractJWT = jwtPassport.ExtractJwt; 
const userModel = require("../models/userSchema");
const {getUser} = require("../controllers/token");

const tokenCookies = function(req)
{
    var token = null;
    if(req && req.cookies)
    {
        token = req.cookies.mycookie;
        // console.log("t",getUser(req.cookies.mycookie));
        // console.log("t",token);
        return token;
    }
    return null;
} 
const opts = {
    jwtFromRequest: extractJWT.fromExtractors([tokenCookies]),
    secretOrKey:"Shreya$123"
}

module.exports = function jwtMethod(passport){
    passport.use(new Strategy(opts,async (users,done)=>{
        try{
            const user = await userModel.findOne({username:users.username,email:users.email,role:users.role});
            if(!user)
            {
                throw new Error("User not found");
            }

            
            // else if(user.password!= users.password)
            // {
            //     // console.log("inside paswrd not");
            //     throw new Error("User credentials are incorrect!!");
            // }
            else if(user.isdisable)
            {
                done("Sorry,you are disabled by admin!!!",null)
            }
            else
            {
                done(null,user);
            }

        }
        catch(err){
            console.log("inside err");
            done(err,null);

        }
    }))
}