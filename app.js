const {express,cookieParser,commonRouter,userRouter,SellerRouter,path}=require("./controllers/allPackages");
// adminRouter,
const app = express();
const passport = require("passport");
const jwtMethod = require("./controllers/passport");
const adminRouter = require("./routes/sampleAdmin");
const resetRouter= require("./routes/resetPassword");
const cartRouter = require("./routes/CartRouter");
app.use(passport.initialize());
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));


jwtMethod(passport);

app.use(commonRouter);
app.use("/user",userRouter);
app.use("/cart",cartRouter);
app.use("/seller",SellerRouter);
app.use("/admin",adminRouter);
app.use("/resetpassword",resetRouter);
//if other then then there is get route then go to home page
app.get("*",(req,res)=>{
    res.redirect("/");
})

app.listen(2000,(err)=>{
    if(err)
        console.log(err);
    else
        console.log("server is running");
})