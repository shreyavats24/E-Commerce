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
