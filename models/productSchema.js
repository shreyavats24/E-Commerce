const mongoose = require("mongoose");


const productSchema = mongoose.Schema({
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    image:String,
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min: [0, 'quantity cannot be negative or 0']
    },
    quantity:
    {
        type:Number,
        required:true,
        min: [0, 'quantity cannot be negative or 0']
    } ,
    Size:String,
    description:String,
    isdisable:{
        type:Boolean,
        default:false
    }
});

const product = mongoose.model("products",productSchema);

module.exports=product;
