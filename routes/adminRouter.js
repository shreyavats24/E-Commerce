// const {router,AdminModel,middleware,verify} = require("../controllers/allPackages");
const multer = require("multer");
const express = require("express");
const path = require("path");
const router = express.Router();
const {getUser, makeToken} = require("../controllers/token");
const productModel = require("../models/productSchema");
const passport = require("passport");
const middleWare= require("../controllers/adminAuth");
const userModel = require("../models/userSchema");
const {} = require("../controllers/commonFunctions");
// const upload = require("../controllers/multer");
var img;
const {getProducts}=require("../controllers/getProducts");
//multer used for storing profile img and product image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images'); // Save to the 'uploads' folder
    }, 
    filename: async function (req, file, cb) {
      img=await file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null,img); // Define the file name
    }
});

const upload = multer({storage: storage});

//passport js jwt authentication for profile that will chck the token we have generated and match it 
//middleware will check if its admin or not after verification async function will work
router.get("/profile",passport.authenticate('jwt',{session:false,failureRedirect:"/login"}),(req,res)=>{
    middleWare(req,res,async ()=>{
        var sessionData = getUser(req.cookies.mycookie);
        var date = new Date();
        date =date.toLocaleDateString();
        let products=await getProducts();
        //disply data
        res.render("adminProfile",{"name":sessionData.username,"createdAt":date,"email":sessionData.email,"username":sessionData.username,login:true,productObj:products,role:sessionData.role,image:sessionData.image});
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
    try{
        var data = getUser(req.cookies.mycookie);
        var products=await new productModel({
            adminId:data.id,
            image:"/images/"+img,
            productName:req.body.productName,
            price:req.body.price,
            quantity:req.body.qty, 
            Size:req.body.size,
            description:req.body.description
        })
        products.save().then(async (doc)=>{
            console.log("Product created:",doc);
            try{
                //store the ref of product id to the admin product array
                await userModel.findOneAndUpdate({_id:doc.adminId},{
                    $push:{
                        products:doc._id
                    }
                })
            }
            catch(err){
                console.log("error occured in pushing",err);
            }    
            res.redirect("/");
        })
        .catch((err)=>console.log(err));
    }
    catch(err){
        console.log("error:",err);
    }
})

//delete product from DB find the elem by _id and delete from both products array and products collection
router.delete("/deleteProduct",async (req,res)=>{
    try{
        await productModel.findByIdAndDelete({_id:req.body.id});
        var data = getUser(req.cookies.mycookie);
        await userModel.findOneAndUpdate({email:data.email},{ $pull: { products: req.body.id }});
        res.send("success");
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
    try{
        const user = await productModel.findByIdAndUpdate(productId,{
            productName:data.name,
            price:data.price,
            quantity:data.quantity,
            Size:data.size,
            description:data.description
        },{new:true});
        if(user)
        {
            console.log(user);
            res.send("success");
        }    
    }
    catch(err){
        console.log(err);
        res.send("failure");
    }
})

router.get("/data",async (req, res) => {
    var sessionData = getUser(req.cookies.mycookie);

    if(sessionData)
    {
        if(sessionData.role =="admin")
        {
            try {
                // const userId = req.params.id; // Get user ID from route
                const user = await userModel.find({}).populate('products').populate('cart.pId').populate('orderId');
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

router.patch("/disable",async (req,res)=>{
    console.log("in disable");
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