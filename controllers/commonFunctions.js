//this have all common function that seller and admin is using like add product edit product, delete product
const multer = require("multer");
const path = require("path");
const {getUser} = require("../controllers/token");
const productModel = require("../models/productSchema");
var img;
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

// save product that admin or seller is uploading...
async function saveProduct(req,res){
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
}

async function deleteProduct(id,res)
{
    try{
        await productModel.findByIdAndDelete({_id:id});
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

module.exports ={ saveProduct,upload,updateProduct,deleteProduct}