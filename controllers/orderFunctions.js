const { calculateBill,checkQuantity, deleteItem, updateQtyEmptyCart } = require("../controllers/cartFunction");
const {makeToken,getUser} = require("./token");
const ordersModel =require("../models/ordersSchema");
const userModel = require("../models/userSchema");
async function placeOrder(req,res){
    let place = req.body.address;
    let mode = req.body.mod;
    let sessionData = getUser(req.cookies.mycookie);
    if (sessionData) {
        try {
            const user = await userModel.findOne({ email: sessionData.email }).populate("cart.pId");
            const orderData = await ordersModel.findOne({ userId: user._id });
            if (user.cart.length > 0) {
                let result = await checkQuantity(user.cart);
                // console.log("R",result);
                if(result.check)
                {
                    const ordersDetails = {
                        cart: user.cart,
                        address: place,
                        modeOfPayment: mode,
                        totalBill: user.billAmount + 10,   //rs 10 shipping charges 
                    }
                    let order;
                    if (!orderData) {
                        //if user dont have order history till now create a new 
                        order = new ordersModel({
                            userId: user._id,
                            // email: sessionData.email,
                            // status: true,
                            orders: [ordersDetails]
                        })
                        await order.save();
                        if (order)
                            await updateQtyEmptyCart(user.cart, sessionData.email, res);
                        else {
                            res.send("Something Went Wrong!!");
                        }
                    }
                    else {
                        //update existing order doc
                        order = await ordersModel.findOneAndUpdate({ userId: user._id }, {
                            $push: { orders: ordersDetails }
                        }, { new: true });
                        if (order) {
                            await updateQtyEmptyCart(user.cart, sessionData.email, res);
                        }
                    }
                }
                else
                {
                    console.log("else");
                    res.send(`${result.pname} have only ${result.qty} quantity available!!`);
                }    
            }
            else {
                res.send("Cart is Empty!!");
            }
        } catch (err) {
            console.log(err);
            res.send("Failed");
        }
    }
    else {
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
    }
}
module.exports = {
    placeOrder
}