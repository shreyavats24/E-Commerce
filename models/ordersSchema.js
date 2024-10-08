const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    orders: [
        {
            cart: [{
                pId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
                pQuantity: {
                    type: Number,
                    min: [1, 'quantity cannot be negative or 0']
                },
                buyPrice:{
                    type: Number,
                    min: [1, 'quantity cannot be negative or 0']
                }
            }],
            address: {
                type: String
            },
            modeOfPayment: {
                type: String
            },
            totalBill: {
                type: Number,
                default: 0
            }
        }
    ]
})

const ordersModel = mongoose.model("orders", orderSchema);

module.exports = ordersModel;