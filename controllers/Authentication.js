const { sendEmail, sendResetEmail } = require("./mailer");
const validator = require("validator");
const argon = require("argon2");
const {bcryptPassword,comparePassword} = require("../controllers/bcryptPassword");
const {makeToken,getUser } = require("../controllers/token");
const userModel = require("../models/userSchema");
var errMsg = null;
//verification of email and otp sending
async function verify(req, res, next) {
  console.log("in verify function");
  if (!req.body.email) {
    console.log("token data taken");
    req.body = getUser(req.cookies.mycookieD);
  }
  const user = await userModel.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  }); //chck if username exists
  var isAdmin = await userModel.findOne({ role: "admin" });
  if (!user && isAdmin.role != req.body.role) {
    // console.log("inn data");
    if (validator.isEmail(req.body.email)) {
      var otp = await sendEmail(req.body.email); //send entered mail nd send otp
      console.log("otp", otp);
      otp = await argon.hash(otp); //hashed otp
      res.cookie("mycookieO", otp);
      next();
    } else {
      res.redirect(
        "please enter a valid email!!<p>Don't have an account? <a href='/signup'>Sign Up</a></p><p>Do have an account? <a href='/login'>Login</a></p>"
      );
    }
  } else if (isAdmin.role == req.body.role) {
    res.send(
      "you can't signin as admin...<p>Don't have an account? <a href='/signup'>Sign Up</a></p><p>Do have an account? <a href='/login'>Login</a></p>"
    );
  } else {
    errMsg = "email or username is already used!!!";
    res.render("signup", {
      errMsg: errMsg,
      login: null,
      username: null,
      role: null,
    });
    errMsg = null;
  }
}

// verifying otp
async function check(req, res, next) {
    // console.log("inn checkk");
    if (req.cookies.mCe) {
        let data = req.body.otp;
        data = data.toString();//stringify to match value of otp
        let otp = await argon.verify(req.cookies.mycookieO, data)
        if (otp) {
            res.clearCookie('mycookieO');//clear otp cookie
            next();
        }
        else {
            res.send("Invalid Data!!!<a href='/'>Go to home page</a>")
        }
    }
    else {
        res.send("unauthorised");
    }
}

// Signin
async function signin(req, res) {
  console.log("inside /signin");
  try {
    let data = req.body.otp;
    data = data.toString(); //stringify to match value of otp
    let otp = await argon.verify(req.cookies.mycookieO, data);
    if (otp) {
      console.log("otp");
      res.clearCookie("mycookieO"); //clear otp cookie
      const user = getUser(req.cookies.mycookieD); //signup detaild
      let passcode = await bcryptPassword(user.password); //bcrypt password
      var obj = new userModel({
        username: user.username,
        email: user.email,
        password: passcode,
        role: user.role,
        isdisable: false,
      });
      await obj
        .save() //stored in db
        .then((doc) => {
          console.log("Document created:", doc);
          // res.clearCookie('mycookieD');//clear signup cookie
        })
        .catch((err) => console.error("Error:", err));
      res.redirect(`/login`); //login page
    } else if (!otp) {
      res.redirect("/verify");
    } else {
      // console.log("else");
      res.redirect("/signup");
    }
  } catch (err) {
    console.log(err);
  }
}

// login
async function login(req, res) {
  console.log("inside /login");
  if (validator.isEmail(req.body.email)) {
    try {
      var user = await userModel.findOne({ email: req.body.email });
      if (user) {
        if (!user.isdisable) {
          let check = await comparePassword(req.body.passcode, user.password); //compare bcrypt pswrd to plain pssword
          if (check) {
            var obj = {
              username: user.username,
              email: user.email,
              role: user.role,
              id: user._id,
              image: user.image,
            };
            const token = makeToken(obj); //create token
            res.cookie("mycookie", token); //store in cookie
            errorMsg = null;
            res.redirect(`/${user.role}/profile`);
          } else {
            errorMsg = "Invalid Credentials!!";
            res.redirect("/login");
          }
        } else if (user.isdisable) {
          res.send("Sorry,you are disabled by admin!!!");
        } else if (user.username != req.body.username) {
          errorMsg = "Invalid Credentials!!";
          res.redirect("/login");
        }
      } else {
        errorMsg = "Please Signup!!";
        res.redirect("/login");
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    errorMsg = "Invalid Credentials!!";
    res.redirect("/login");
  }
}
//forgetpassword middleware
async function changePassword(req, res, next) {
  if (validator.isEmail(req.body.email)) {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) res.redirect("/signup");
    if (!user.isdisable) {
      var otp = await sendEmail(req.body.email); //send entered mail nd send otp
      console.log("otp", otp);
      otp = await argon.hash(otp); //hashed otp
      res.cookie("mycookieO", otp);
      next();
    } else {
      res.send("Sorry,you are disabled by admin!!!");
    }
  } else {
    res.send(
      "Please Enter a Valid email!!<br><br><p>Don't have an account? <a href='/signup'>Sign Up</a></p><p>Do have an account? <a href='/login'>Login</a></p>"
    );
  }
}

//profile checking middleware
function middleware(req, res, next) {
  //chck if cookies exists verified token nd given access to profile
  const token = req.cookies.mycookie;
  const user = getUser(token);
  // console.log(user);
  if (user) {
    req.user = user;
    next();
  } else {
    res.redirect("/");
  }
}

async function checkdisable(req, res, next) {
  var sessionData = getUser(req.cookies.mycookie);
  let data;
  if (sessionData) {
    var user = await userModel.findOne({ email: sessionData.email });
    if (!user.isdisable) {
      next();
    } else if (user.isdisable) {
      data = `Sorry,Admin disabled you!!<br><a href="/">Go to home page</a>`;
      res.send({ data });
    } else {
      data = "failure";
      res.send({ data });
    }
  } else {
    data = "failure";
    res.send({ data });
    // res.redirect("/")
  }
}
async function checkdisableUser(req, res, next) {
  var sessionData = getUser(req.cookies.mycookie);
  let data;
  if (sessionData) {
    var user = await userModel.findOne({ email: sessionData.email });
    if (!user.isdisable) {
      next();
    } else if (user.isdisable) {
      data = `Sorry,Admin disabled you!!<br><a href="/">Go to home page</a>`;
      res.send({ data });
    } else {
      res.redirect("/");
    }
  } else {
    data = "failure";
    res.redirect("/");
  }
}
async function updatePasswordInDB(req,res){
    let password = req.body.confirmpassword;
    let mail = getUser(req.cookies.mCe);
    let Bpassword = await bcryptPassword(password);
    if (mail && Bpassword) {
        try {
            await userModel.findOneAndUpdate({ email: mail.email }, { password: Bpassword })
            res.clearCookie("mCe");
            res.send("Successfully Updated!!");
        } catch (err) {
            console.log(err);
        }
    }
    else {
        res.send('Something went wrong <a href="/">Go to home page</a>')
    }
}
module.exports = {
  verify,
  middleware,
  changePassword,
  checkdisable,
  checkdisableUser,
  signin,
  login,
  check,
  updatePasswordInDB
};
