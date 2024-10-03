const mongoose = require("mongoose");
const config = require("config");
//it checks the environment on its own when dev happening take MONGODB_URI from dev if production happenning takes from production 
// mongoose.connect(`${config.get("MONGODB_URI")}/Ecommerce`)//much better and modular way to handle with config
// .then(()=>console.log("MongoDB is connected"))
// .catch((err)=>{
//     console.log("Could not connect MongoDB",err);
// });
module.exports=mongoose.connection;//provide controll over the databse we have specified like here its ecomm