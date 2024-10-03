const productModel = require("../models/productSchema");
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
module.exports = {
    get5Products,getProducts,getyourProducts,getProductexceptSelf
}