const nodemailer = require("nodemailer");

async function sendEmail(mail)
{
    const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        auth:{
            user:"yourEmail@gmail.com",
            pass:"iqlzsuaskkywxmng"
        }
    });
    let otp= await getRandomFourDigit();

    let info = await transporter.sendMail({
        from:"yourEmail@gmail.com",
        to:mail,
        subject:"OTP verification",
        text:`This is your otp: ${otp} for verification.please don't share this with anyone.`
    },(err,resp)=>{
        if(err)
            console.log(err);
        else
        {
            console.log("otp sent.");
        }
    });    
    return otp.toString();
}
function getRandomFourDigit() {
    return Math.floor(1000 + Math.random() * 9000);
}

module.exports={
    sendEmail
}
