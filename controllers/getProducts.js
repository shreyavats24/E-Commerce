const productModel = require("../models/productSchema");
const {getUser,makeToken} = require("./token");
async function get5Products()
{
    let productObj = await productModel.find({isdisable:false}).limit(5);
    return productObj;
}
async function getyourProducts(userId)
{
    let productObj = await productModel.find({adminId:userId});
    return productObj;
}

async function getProducts(){
    let productObj = await productModel.find({isdisable:false});
    return productObj;
}
async function getProductexceptSelf(userId) {
    var productObj
    productObj = await productModel.find({ isdisable:false,adminId: { $ne: userId } }).limit(5);
    var len = await productModel.find({ isdisable:false,adminId: { $ne: userId } });
    len=len.length;
    return {productObj,len};
}
async function renderProducts(req,res){
    const user = getUser(req.cookies.mycookie);
    var count = req.params.num;
    // console.log(count);

    if(user){
    const products = await productModel.find({ isdisable: false,adminId: { $ne: user.id } }).skip(5 * count).limit(5);
    count++;
    const nextdata = await productModel.find({ isdisable: false,adminId: { $ne: user.id }}).skip(5 * (count)).limit(5);

    res.json({ products, nextdata });  //return products array of objects to client side for dom creation
    }
    else{
        const products = await productModel.find({ isdisable: false}).skip(5 * count).limit(5);
        count++;
        const nextdata = await productModel.find({ isdisable: false}).skip(5 * (count)).limit(5);
        // if (products.length == 0)
        //     count = 1;
        res.json({ products, nextdata });  //return products array of objects to client side for dom creation
    }
}
module.exports = {
    get5Products,getProducts,getyourProducts,getProductexceptSelf,renderProducts
}