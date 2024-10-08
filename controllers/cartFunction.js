const userModel= require("../models/userSchema");
const productModel = require("../models/productSchema");

async function emptyCart(email){
    // console.log(email);
    try{
        const user = await userModel.findOneAndUpdate({email:email},{
            $set:{ cart:[] ,billAmount:0}
        },{new:true});
        if(user){
            return true;
        }
        else{
            return false;
        }
    }catch(err){
        console.log("Empty cart: ",err);
    }

}

async function updateProductQuantity(cart){
    try{
        let updatedProducts = await Promise.all(
        cart.map(async (item)=>{
            let qty = item.pQuantity;
            let result= await productModel.findByIdAndUpdate({_id:item.pId._id},{
                $inc: { quantity: -qty }
            },{new:true});
        }));
        if (updatedProducts.length > 0) {
            return true;
        } 
        else {
            return false;
        }
    }
    catch(err){
        console.log("updating product qty err:",err);
        return false;
    }
}
async function updateQtyEmptyCart(cart,email,res){
    try{
        let update = await updateProductQuantity(cart);
        if(update){
        let result=await emptyCart(email);
        if(result){
            res.send("success");
        }            
        }
        else{
            throw new Error("Something went wrong in updating!!");
        }
    }catch(err){
        console.log(err);
        res.send("failed");
    }
}


async function deleteItem(email,pId,res){
    console.log("in delete");
    const user = await userModel.findOneAndUpdate(
        { email:email },
        {
          $pull: { cart: { "_id": pId } }
        },
        { new: true }
    );   
    // console.log("del user:",user);
    let data = "success";
    let qty=0;
    let len=user.cart.length;
    let bill = await calculateBill(email);
    res.json({data,bill,len,qty});
}

async function calculateBill(email){
    const user = await userModel.findOne({email:email}).populate("cart.pId");
    var totalBill = 0;
    if(user.cart){
        if(user.cart.length>0)
        {
            user.cart.forEach((elem)=>{
                totalBill+=elem.pId.price*elem.pQuantity;
            })
        }
        else{
            await userModel.findOneAndUpdate({email:email},{
                billAmount:0
            });
        }
    }
    try{
        await userModel.findOneAndUpdate({email:email},{
            billAmount:totalBill
        });    
    }catch(err){
        console.log(err);
    }
    return totalBill;
}

async function checkQuantity(cart){
    let flag=0;
    let obj ;
    console.log("inn check qty funct");
    const products = await productModel.find({isdisable:false});
    // console.log("Products",products);
    cart.forEach((elem)=>{
        products.forEach((pelem)=>{
            if(pelem._id.equals(elem.pId._id))
            {
                console.log("matched!");
                if(pelem.quantity<elem.pQuantity)
                {
                    // console.log("productName",pelem.productName)
                    obj ={
                        pname:pelem.productName,
                        check:0,qty:pelem.quantity,
                    };
                    flag=1;
                }
            }
        })
    })
    if(flag==1){
        return obj;
    }
    else{
        obj ={
            pname:"success",
            check:1
        };
        return obj;
    }
    
}

module.exports={
    calculateBill,
    updateProductQuantity,
    updateQtyEmptyCart,
    deleteItem,
    emptyCart,checkQuantity
}
