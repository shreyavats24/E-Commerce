const mongoose = require('mongoose');//firstly require the module moongose its third party which we had installed

mongoose.connect("mongodb://localhost:27017/Ecommerce").then(()=>{
    console.log("mongoDB connected")
}).catch((err)=>{
    console.log("MongoDB is not connected:",err);
})
//create a schema of todo
const User = new mongoose.Schema({//sub schema
    image:{
        type:String,
        default:"/images/profile.jpg"
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:
    {
        type:String,
        required:true
    },
    role:{type:String},
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        // default: undefined,    
    }],
    cart:[
        { 
            pId:{type:mongoose.Schema.Types.ObjectId,ref:"products"},
            pQuantity:{
                type:Number,
                min: [1, 'quantity cannot be negative or 0']
            },
            buyPrice:{
                type: Number,
                min: [1, 'quantity cannot be negative or 0']
            }
        }
    ],
    billAmount :{
        type:Number,
        min:[1,"price cant be negative"]
    },
    orderId:{type:mongoose.Schema.Types.ObjectId,
        ref:"orders"},
    isdisable:Boolean
});

const userModel = mongoose.model("users",User);

module.exports=userModel;