const express=require("express");
const app = express();
//multer is used to upload files it process form data that is multipart/form-data
const multer = require("multer");//its a middle ware 
const path = require("path");
var img;
// app.set("view engine","ejs");
app.use(express.static("./public"));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads'); // Save to the 'uploads' folder
    }, 
    filename: function (req, file, cb) {
      img=file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null,img); // Define the file name
    }
});

const upload = multer({storage: storage});
module.exports= {
  upload
}
