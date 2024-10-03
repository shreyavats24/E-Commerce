const bcrypt = require("bcrypt");

async function bcryptPassword(passcode)
{
    try {
        const salt = await bcrypt.genSalt(10); // Await for salt generation
        const hash = await bcrypt.hash(passcode, salt); // Await for password hashing
        return hash;
    } 
    catch (err) {
        console.error('Error hashing password:', err);
    }
}

async function comparePassword(passcode,hash){
    let res;
    res = await bcrypt.compare(passcode,hash);
    return res;
}
module.exports={
    bcryptPassword,
    comparePassword
}
