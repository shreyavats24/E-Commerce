const { calculateBill,checkQuantity, deleteItem, updateQtyEmptyCart } = require("../controllers/cartFunction");
const userModel = require("../models/userSchema");
const express = require("express");
const router = express.Router();
const { checkdisable,checkdisableOrder } = require("../controllers/Authentication");
const ordersModel = require("../models/ordersSchema");
const productModel = require("../models/productSchema");
const { makeToken, getUser } = require("../controllers/token");
const { placeOrder } = require("../controllers/orderFunctions");

// render cart page
router.get("/cart", checkdisable, async (req, res) => {
    console.log("inside get cart");
    var sessionData = getUser(req.cookies.mycookie);
    let user = await userModel.findOne({ email: sessionData.email }).populate("cart.pId");
    if (user)
        res.render("cart", { login: true, username: sessionData.username, role: sessionData.role, cart: user.cart });
    else {
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
    }
})

// add items to cart
router.post("/cart", checkdisable, async (req, res) => {
    console.log("inside post cart");
    var sessionData = getUser(req.cookies.mycookie);
    let pId = req.body.id;
    if (sessionData) {
        try {
            // console.log(sessionData.email);

            const user = await userModel.findOne(
                {
                    email: sessionData.email,
                    cart: { $elemMatch: { pId: pId } } // check pId already exist in cart
                }, { "cart.$": 1, pId }).populate("cart.pId");
            // by using $ rep matched cart 1 so variable user have only the cart matched in form of array
            if (user) {
                //if item is in cart
                if ((user.cart[0].pQuantity) < (user.cart[0].pId.quantity)) {
                    await userModel.findOneAndUpdate(
                        { email: sessionData.email, "cart._id": user.cart[0]._id }, // Query to match email and the cart with a specific pId
                        { $inc: { "cart.$.pQuantity": 1 } }, // Update the quantity of the matched cart item
                        { new: true } // Return the updated document
                    );
                    //calculate total bill based on qty chnge
                    const bill = await calculateBill(sessionData.email);
                    let data = "success"
                    res.json({ data, bill });
                }
                else {
                    let data = "out of Stock";
                    res.json({ data })
                }
            }
            else {
                //if item not in cart 
                let result = await productModel.findById({ _id: pId });
                if (result.quantity) {
                    await userModel.findOneAndUpdate({ email: sessionData.email }, {
                        $push: {
                            cart: { pId: pId, pQuantity: 1, buyPrice: result.price }
                        }
                    });
                    //calculate total bill based on qty chnge
                    const bill = await calculateBill(sessionData.email);
                    let data = "success"
                    res.json({ data, bill });
                }
                else {
                    let data = "out of Stock";
                    res.json({ data })
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
    }

})

router.get("/order", checkdisableOrder, async (req, res) => {
    var sessionData = getUser(req.cookies.mycookie);
    console.log("/order");
    if (sessionData) {
        const order = await ordersModel.findOne({ userId: sessionData.id }).populate("orders.cart.pId");
        if (order)
            res.render("order", { order: order.orders, data: order, len: order.orders.length, login: true, username: sessionData.username, role: sessionData.role });
        else
            res.send('<div style="text-align:center;border:2px solid red;margin:18%;padding:30px;">No order history!!<br><a href="/">Go to home page</a></div>');
    }
    else
        res.send('<div style="text-align:center;border:2px solid red;margin:18%;padding:30px;">No order history!!<br><a href="/">Go to home page</a></div>');

})

router.patch("/changeQuantity", async (req, res) => {
    console.log("in change qty");
    let sessionData = getUser(req.cookies.mycookie);
    let id = req.body.id;
    let flag = req.body.flag;
    var qty;
    try {
        const userdata = await userModel.findOne({ email: sessionData.email, "cart._id": id }, { "cart.$": 1 }).populate("cart.pId");
        if (flag == 0 && userdata) {
            //increment
            if ((userdata.cart[0].pQuantity) < (userdata.cart[0].pId.quantity)) {
                const user = await userModel.findOneAndUpdate(
                    { email: sessionData.email, "cart._id": id }, // Query to match email and the cart with a specific pId
                    { $inc: { "cart.$.pQuantity": 1 } }, // Update the quantity of the matched cart item
                    { new: true } // Return the updated document
                );
                user.cart.forEach((elem)=>{
                    if(elem._id == id)
                    {
                        qty = elem.pQuantity;
                    }
                })
                let data = "success";
                let bill = await calculateBill(sessionData.email);
                res.json({ data, bill,qty});
            }
            else {
                let data = "no more stock";
                let qty=userdata.cart[0].pQuantity;
                res.json({ data,qty});
            }
        }
        else if (flag == 1 && userdata) {
            //decrement 
            if (userdata.cart[0].pQuantity >= 1) {
                const user = await userModel.findOneAndUpdate(
                    { email: sessionData.email, "cart._id": id }, // Query to match email and the cart with a specific pId
                    { $inc: { "cart.$.pQuantity": -1 } }, // Update the quantity of the matched cart item
                    { new: true, "cart.$": 1, "cart.$._id": 1 } // Return the updated document
                )
                // if (user.cart[0].pQuantity < 1) {
                //     await deleteItem(user.email,id, res);
                // }
                // else {
                    let data = "success";
                    user.cart.forEach((elem)=>{
                        if(elem._id == id)
                        {
                            qty = elem.pQuantity;
                        }
                    })
                        let bill = await calculateBill(sessionData.email);
                        res.json({ data, bill, qty});
                    // }   
                // }
            }
            else{
                let data = "success";
                let qty=userdata.cart[0].pQuantity;
                // if(qty==0)
                // await deleteItem(userdata.email, id, res);
                let bill = await calculateBill(sessionData.email);
                res.json({ data, bill,qty});
            }
        }
    } catch (err) {
        console.log(err);
    }
})


router.get("/check",async (req, res) => {
    // console.log("inn");
    var sessionData = getUser(req.cookies.mycookie);
    if (!sessionData) {
        res.send("UnAuthorised!!");
    }
    else {
        let user = await userModel.findOne({ email: sessionData.email }).populate("cart.pId");
        // let result= checkQuantity(user.cart);
        // if(result)
        res.render("checkOut", { login: true, username: sessionData.username, role: sessionData.role, cart: user.cart, bill: user.billAmount, email: sessionData.email });
        
    }
})



router.post("/submitOrder", async (req, res) => {
    console.log("/submit");
    await placeOrder(req,res);
})

router.delete("/deleteItem", async (req, res) => {
    console.log("inside delete");
    let pId = req.body.id;
    var sessionData = getUser(req.cookies.mycookie);
    if (sessionData) {
        try {
            await deleteItem(sessionData.email, pId, res);
            // console.log(user);    
        } catch (err) {
            console.log(err);
            res.send("failed");
        }
    }
    else {
        res.send('Sorry,you are unauthorised for this route!!!<br><br><a href="/">Go Back to Home Page</a>');
    }

})

module.exports = router;