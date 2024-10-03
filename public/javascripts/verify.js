document.getElementById("resetPasswordForm").addEventListener("submit", function (event) {
    
});


  // JavaScript to verify that new password and confirm password match
var reset = document.getElementById("reset");

reset.addEventListener("click",(event)=>{
    // alert("clicked");
    var newPassword = document.getElementById("newPassword").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var oldPassword= document.getElementById("oldPassword").value;
    if(confirmPassword.trim()==""|| oldPassword.trim()==""||newPassword.trim()=="")
    {
        alert("please Enter data!!!");
    }
    else if (newPassword !== confirmPassword) {
        event.preventDefault();  // Prevent form submission
        document.getElementById("errorMessage").style.display = "block";  // Show error message
    } else {
        document.getElementById("errorMessage").style.display = "none";  // Hide error message if they match
    }
    updatePassword(oldPassword,newPassword,confirmPassword);    
})


function updatePassword(oldPassword,newPassword,confirmPassword)
{
    console.log("hii");
    fetch("/resetpassword/verify",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({old:oldPassword,newp:newPassword,password:confirmPassword})
    }).then((res)=>{
        if(res.ok)
        return res.text();
    }).then((data)=>{
        if(data=="success")
        {
            alert("Password successfully updated!!");
            window.location.href="/user/profile" ;
        }
        else
        {
            alert(data);
        }
    }).catch((err)=>console.log(err));
}