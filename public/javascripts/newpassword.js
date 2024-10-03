var btn = document.getElementById("submit-btn");
        var p =document.getElementById("p");
        var c =document.getElementById("c");
        var newPassword = document.getElementById("password");
        var confirmpassword = document.getElementById("confirmpassword");

        p.addEventListener("click",()=>{
            toggle(newPassword,p);
        })
        var confirmpassword = document.getElementById("confirmpassword");
        c.addEventListener("click",()=>{
            console.log("c");
        toggle(confirmpassword,c);
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
        btn.addEventListener("click",()=>{
            if(newPassword.value.trim()==""||confirmpassword.value.trim()==""){
                alert("please fill data!!");
            }
            else{
                if(newPassword.value==confirmpassword.value){
                    fetch("/change",{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({confirmpassword:confirmpassword.value})
                    }).then((res)=>{
                        return res.text();
                    }).then((data)=>{
                        if(data)
                        {
                            alert(data);
                            window.location.href="/login";
                        }
                    }).catch((err)=>console.log(err));
                }
                else{
                    alert("Please enter same password!!")
                }
            }
        })