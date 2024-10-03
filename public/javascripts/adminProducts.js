var deleteBtn = document.getElementsByClassName("deleteBtn");
for (const button of deleteBtn) {
    button.addEventListener("click", function() {
        // console.log("event");
        let parentId = button.parentElement.id;
        let res = confirm("Do you really want to delete it from database?");
        if(res)
        deleteProduct(parentId);
    });
}
var editbtn = document.getElementsByClassName("edit");
for(const button of editbtn){
    button.addEventListener("click", function(event) {
        //  alert("hiii");
        let parentId = button.parentElement.id;
        const inputBox=button.parentElement.querySelectorAll("input");
        const data = {
            name:inputBox[0].value,
            price:inputBox[1].value,
            size:inputBox[2].value,
            quantity:inputBox[3].value,
            description:inputBox[4].value
        };
        let res =confirm("Do you really want to save changes?");
        // console.log(data);
        if (res)
        editProduct(data,parentId)
});
}

function editProduct(data,id){
    fetch("/admin/updateProduct",
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({data,id})
        }
    ).then((res)=>{
        return res.text();
    }).then((data)=>{
        if(data){
            alert(data);
        }
    }).catch((err)=>{
        console.log(err);
    })
}
function deleteProduct(id)
{
    var elem = document.getElementById(id);
    // console.log("inside");
    fetch("/admin/deleteProduct",{
        method:"DELETE",
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({ id: id })
    }).then((res)=>{
        return res.text();
    }).then((data)=>{
        if(data)
        {
            elem.remove();
        }
    }).catch((err)=>
    {
        console.log(err);
    })
}