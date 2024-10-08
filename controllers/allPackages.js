const express = require("express");
// const app = express();
const router = express.Router();
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const {bcryptPassword,comparePassword}= require("./bcryptPassword");
const { middleware,verify } = require("./Authentication");
const argon = require("argon2");

const bcrypt = require("bcrypt");
const path = require("path");
const cookieParser = require("cookie-parser");
const commonRouter = require("../routes/commonRouter");
// const adminRouter = require("../routes/adminRouter");
const userRouter = require("../routes/userRouter");
const SellerRouter= require("../routes/SellerRouter");
const {makeToken,getUser}=require("../controllers/token");
module.exports = {
    express,
    bcrypt,
    path,
    argon,
    cookieParser,
    // adminRouter,
    userRouter,
    SellerRouter,
    commonRouter,
    // router,
    userModel,
    productModel,
    bcryptPassword,
    comparePassword,
    middleware,
    verify
}