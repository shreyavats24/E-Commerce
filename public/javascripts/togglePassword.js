// var eye = document.getElementsByClassName("eye")[0];
// var eye = document.getElementsByClassName("eye");
// ^(?=.*[A-Z])(?=.*[$%&#]){8,}$ regex
// [a-zA-Z]
var eye = document.getElementById("eye");
var passcode = document.getElementById("passcode");

eye.addEventListener("click",(event)=>{
    toggle(passcode,eye);
}) 

function toggle(elem,change)
{
    console.log(elem);
    console.log(change);
    if(elem.type=="password")
    {
        elem.type="text";
        change.classList.replace("fa-eye-slash","fa-eye");    
    }
    else
    {
        elem.type="password";
        change.classList.replace("fa-eye","fa-eye-slash");
    }   
}
// var formData = document.getElementById("signup");
// var StrongPswrd=document.getElementById("StrongPswrd");
// formData.addEventListener("click",(event)=>{
//     console.log("inside");
//     if(checkStrongPassword(passcode.value)){
//         event.preventDefault();
//         StrongPswrd.innerText="please make a strong password!!";
//         StrongPswrd.style.color="red";
//     }
//     else{
//         StrongPswrd.innerText="";
//     }
// })

// function checkStrongPassword(password)
// {
//     //paswrd must have uppercase, a special character and a number 
//     const regex =/^(?=.*[A-Z])(?=.*\d)(?=.*[$%&#])[A-Z\d$%&#]{8,}$/;
//     return regex.test(password);
// }

// for(var eyee in eye)
// {
//     eyee.addEventListener("click",(event)=>{
//         console.log("inn");    
//         if(event.target.type=="password")
//             {
//                 event.target.type="text";
//                 eye.classList.replace("fa-eye-slash","fa-eye");    
//             }
//             // else if(confirmpassword ==)
//             else
//             {
//                 event.target.type="password";
//                 eye.classList.replace("fa-eye","fa-eye-slash");
//             }    
//         })  


// }
// eye.forEach((eyee)=>{
    
// }) 


