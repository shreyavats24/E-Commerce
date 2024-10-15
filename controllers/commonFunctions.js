//this have all common function that seller and admin is using like add product edit product, delete product
const multer = require("multer");
const path = require("path");
const {getUser} = require("../controllers/token");
const productModel = require("../models/productSchema");
const userModel = require("../models/userSchema");
var img;
//multer used for profile image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Save to the 'uploads' folder
    },
    filename: async function (req, file, cb) {
        img = await file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, img); // Define the file name
    }
});

const upload = multer({ storage: storage });

// save product that admin or seller is uploading...
async function saveProduct(req,res){
    try{
        if(img!="" && req.body.productName.trim() !="" && req.body.price.trim() !="" && req.body.size.trim() !=""  && req.body.price>1 && req.body.qty >0)
        {
            var data = getUser(req.cookies.mycookie);
            var products=await new productModel({
            adminId:data.id,
            image:"/images/"+img,
            productName:req.body.productName,
            price:req.body.price,
            quantity:req.body.qty, 
            Size:req.body.size,
            description:req.body.description||""
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
        else{
            res.redirect("/productPage");
        }
    }
    catch(err){
        console.log("error:",err);
    }
}

async function deleteProduct(id,res,req)
{
    try{
        await productModel.findByIdAndUpdate({_id:id});
        var data = getUser(req.cookies.mycookie);
        await userModel.findOneAndUpdate({email:data.email},{ $pull: { products: req.body.id }});
        res.send("successfully");
    }
    catch(err){
        console.log(err);
    }
}

async function updateProduct(data,productId,res)
{
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
            res.send("successfully updated!");
        }    
    }
    catch(err){
        console.log(err);
        res.send("failure");
    }
}

// upload profile image
async function uploadProfile(req,res){
    var user = getUser(req.cookies.mycookie);
    if(user)
    {
        try{
            await userModel.findOneAndUpdate({ username: user.username, email: user.email }, {
                image: "/images/" + img
            });
        }catch(err){
            console.log("upload profile error:",err);
        }
        res.redirect("/user/profile");
        img=undefined;
    }
    else{
        res.redirect("/");
    }
}

module.exports ={ saveProduct,uploadProfile,upload,updateProduct,deleteProduct}