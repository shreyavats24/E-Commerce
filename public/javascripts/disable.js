var disableUser = document.getElementsByClassName("disableBtn");
// console.log(disableUser);
for(var btn of disableUser){
    btn.addEventListener("click",(event)=>{
        // alert("click");
        // var parentId = 
        var parentId = event.target.parentElement.id;
        console.log(parentId);
        if(event.target.id=="on"){
            event.target.id="off"
            event.target.innerHTML="Off";
            
            disable(parentId,false);
            // event.target.value="Off";
        }
        else{ 
            event.target.id="on";
            event.target.innerHTML="On";
            disable(parentId,true);
        }   
    })
}
function disable(parentId,value){
    fetch("/admin/disable",{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({id:parentId,state:value})
    }).then((res)=>{
        return res.text();
    }).then((result)=>{
        if(result=="success")
        {
            alert("Changes Successful!!");
        }
        else{
            alert("No Changes are Saved!!");
        }
    })
} 