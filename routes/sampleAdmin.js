//this is the chnged admin router in which i have made use of functions 
// since seller and amdin have lots of similar functionalities
const express = require("express");
const path = require("path");
const router = express.Router();
const {getUser, makeToken} = require("../controllers/token");
const productModel = require("../models/productSchema");
const passport = require("passport");
const middleWare= require("../controllers/adminAuth");
const userModel = require("../models/userSchema");
const {upload,updateProduct,deleteProduct,saveProduct} = require("../controllers/commonFunctions");
// const upload = require("../controllers/multer");

const {getProducts,getyourProducts}=require("../controllers/getProducts");
//multer used for storing profile img and product image


//passport js jwt authentication for profile that will chck the token we have generated and match it 
//middleware will check if its admin or not after verification async function will work
router.get("/profile",passport.authenticate('jwt',{session:false,failureRedirect:"/login"}),(req,res)=>{
    middleWare(req,res,async ()=>{
        var sessionData = getUser(req.cookies.mycookie);
        if(sessionData){
            var date = new Date();
            date =date.toLocaleDateString();
            let products=await getyourProducts(sessionData.id);
            const user = await userModel.findOne({email:sessionData.email});
            //disply data
            if(sessionData.role == "admin")
            res.render("adminProfile",{"name":sessionData.username,"createdAt":date,"email":sessionData.email,"username":sessionData.username,login:true,productObj:products,role:sessionData.role,image:user.image});
            else
            res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
        }
        else
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');    
    })
})

//this will display a page for uploading product
//middleWare check if its admin or not who is coming to this route
router.get("/productPage",middleWare,(req,res)=>{
    var sessionData = getUser(req.cookies.mycookie);
    if(sessionData)
    res.render("productPage",{login:true,username:sessionData.username,role:sessionData.role});
})

//save the product to DB 
router.post("/saveProduct",upload.single('image'),middleWare,async (req,res)=>{
    await saveProduct(req,res);
})

//delete product from DB find the elem by _id and delete from both products array and products collection
router.delete("/deleteProduct",async (req,res)=>{
    try{
        await deleteProduct(req.body.id,res);
    }
    catch(err){
        console.log(err);
    }
})

//update the product details
router.put("/updateProduct",async (req,res)=>{
    console.log("/updateProduct");
    const data = req.body.data;
    let productId = req.body.id;
    if(data.name.trim()!="" && data.price.trim()!="" && data.size.trim()!="" && data.quantity.trim()!="" && data.quantity>=0 &&data.price>0)
    updateProduct(data,productId,res);
    else if(data.name.trim()=="" || data.price.trim()=="" || data.size.trim()==""|| data.quantity.trim()=="")
    res.send("Empty field is not allowed!!");
    else if(data.quantity<0 && data.price<1 )
    res.send("Quantity cant be less than 0 and price cant be less than 1 ");
    else if(data.price<1)
    res.send("Price should be greater or equal to 1");
    else if(data.quantity<0)
    res.send("Quantity Cant be less than 0")
})

router.get("/data",async (req, res) => {
    var sessionData = getUser(req.cookies.mycookie);

    if(sessionData)
    {
        if(sessionData.role =="admin")
        {
            try {
                // const userId = req.params.id; // Get user ID from route
                const user = await userModel.find({role:"user"}).populate('products').populate('cart.pId').populate('orderId');
                // console.log("user:",user);
                if (!user) {
                    return res.status(404).send("User not found");
                }
                res.render('alldetails', { users:user,login:true,username:sessionData.username,role:sessionData.role}); // Render the EJS page and pass user data
            } catch (error) {
                console.error(error);
                res.status(500).send("Server Error");
            }
        } 
        else{
            res.send("Sorry,You are not Authorised for this route!!!")
        }   
    }
    else{
        res.send("Sorry,You are not Authorised for this route!!!")
    }    
});

router.get("/sellerDetail",async (req,res)=>{
    var sessionData = getUser(req.cookies.mycookie);

    if(sessionData)
    {
        if(sessionData.role =="admin")
        {
            try{
                const user = await userModel.find({role:"seller"}).populate('products');
                if (!user) {
                    return res.status(404).send("Seller not found");
                }
                res.render('sellerDetails', { users:user,login:true,username:sessionData.username,
                role:sessionData.role}); // Render the EJS page and pass user data

            }catch(err){
                console.log("seller details:",err);
            }
        }
        else
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
    }
    else
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
})
router.patch("/disable",async (req,res)=>{
    let id = req.body.id;
    let state = req.body.state;
    try{
        await userModel.findByIdAndUpdate(id,{
            isdisable:state
        })
        const data = await productModel.updateMany(
            { adminId: id }, // Query to match documents
            { $set: { isdisable: state } } // Update operation
            ,{new:true}
        )
        console.log("data",data);
        res.send("success");
    }catch(err){
        console.log("disable Error:",err);
        res.send("Failed")
    }
})
module.exports=router;