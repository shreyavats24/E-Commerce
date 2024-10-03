const {getUser} = require("../controllers/token");
const userModel = require("../models/userSchema");
async function middleWare(req,res,next)
{
    var sessionData = getUser(req.cookies.mycookie);
    if(sessionData){
        const user = await userModel.findOne({email:sessionData.email});
        if(sessionData.role == "admin" || (sessionData.role == "seller" && (!user.isdisable)))
        {
            next();
        }
        else if(sessionData.role == "seller" && user.isdisable)
        {
            res.send('Sorry,you are disabled by admin!!!<br><br><a href="/">Go Back to Home Page</a>');
        }
        else{
            res.redirect("/"); 
        }
    }
    else
    {
        res.send("Unauthorized!!!");
    }
}

//earlier only checking admin
module.exports = middleWare;