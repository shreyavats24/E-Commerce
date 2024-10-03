const express = require("express");
const router = express.Router();
// const multer = require("multer");
// const path = require("path");
const {getUser, makeToken} = require("../controllers/token");
const productModel = require("../models/productSchema");
const passport = require("passport");
const middleWare= require("../controllers/adminAuth");
const userModel = require("../models/userSchema");
const {upload,updateProduct,deleteProduct,saveProduct} = require("../controllers/commonFunctions");
const {get5Products,getyourProducts,getProducts} = require("../controllers/getProducts")

router.get("/profile",passport.authenticate('jwt',{session:false,failureRedirect:"/login"}),(req,res)=>{
    middleWare(req,res,async ()=>{
        var sessionData = getUser(req.cookies.mycookie);
        const user = await userModel.findOne({email:sessionData.email});
        var date = new Date();
        date =date.toLocaleDateString();
        let products=await getyourProducts(user._id);
        //disply data
        if(sessionData.role == "seller")
        res.render("sellerProfile",{"name":sessionData.username,"createdAt":date,"email":sessionData.email,"username":sessionData.username,login:true,productObj:products,role:sessionData.role,image:sessionData.image});
        else
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
    })
})
router.get("/productPage",middleWare,(req,res)=>{
    var sessionData = getUser(req.cookies.mycookie);
    if(sessionData)
    res.render("productPage",{login:true,username:sessionData.username,role:sessionData.role});
})
//save the product to DB 
router.post("/saveProduct",upload.single('image'),middleWare,async (req,res)=>{
    await saveProduct(req,res);
})

//update the product details
router.put("/updateProduct",async (req,res)=>{
    // console.log("/seller/updateProduct");
    const data = req.body.data;
    let productId = req.body.id;
    updateProduct(data,productId,res);
})

//delete product 
router.delete("/deleteProduct",async (req,res)=>{
    try{
        await deleteProduct(req.body.id,res);
    }
    catch(err){
        console.log(err);
    }
})


module.exports=router;