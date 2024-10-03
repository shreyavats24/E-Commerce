var removeBtn = document.getElementsByClassName("remove-btn");
var plusBtn = document.getElementsByClassName("plus");
var minusBtn = document.getElementsByClassName("minus");
var totalPrice = document.getElementById("total-price");
var billBox = document.getElementsByClassName("cart-summary")[0]; 
var checkOut = document.getElementById("checkout-btn");
var totalItem = document.getElementById("total-items");
// var submitBtn = document.getElementById("checkout-btn");

for(var rbtn of removeBtn){
    rbtn.addEventListener("click",(event)=>{
        let parentId = event.target.parentElement.id;
        let res = confirm("Do you really want to remove this product from Cart");
        if(res)
        removeItem(parentId);
    })
}
for(var plus of plusBtn)
{
    plus.addEventListener("click",(event)=>{    //alert("change");
        let parentId = event.target.parentElement.id;
        let tag = event.target.parentElement.querySelector(".cart-quantity");
        let flag = 0;
        updateQuantity(parentId,tag,flag);
    })
}

for(var minus of minusBtn)
    {
        minus.addEventListener("click",(event)=>{   
            let parentId = event.target.parentElement.id;
            let tag = event.target.parentElement.querySelector(".cart-quantity");
            // tag.value= parseInt(tag.value)+1; //dom　manipulation
            let flag = 1;
            updateQuantity(parentId,tag,flag);
        })
    }

//delete item from cart of user
function removeItem(id){
    var elem = document.getElementById(id);
    fetch("/cart/deleteItem",{
        method:"DELETE",
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({ id: id })
    }).then((res)=>{
        return res.json();
    }).then((result)=>{
        console.log(result);
        if(result.data == "success")
        {
            elem.remove();
            if(result.bill)
            {
                totalPrice.innerHTML ="₹"+ result.bill;
                totalItem.innerHTML = result.len;
            }
            else{
                totalPrice.innerHTML ="₹"+ result.bill;
                totalItem.innerHTML = result.len;
            }
        }
        else if(result.data == "failed")
        {
            alert("could not remove!!!");
        }
    }).catch((err)=>
    {
        console.log(err);
    })
}

function updateQuantity(id,tag,flag){
    if(id!=undefined){
        fetch("/cart/changeQuantity",{
            method:"PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({id,flag})
        }).then((res)=>{
            return res.json();
        }).then((result)=>{
            // console.log("qty",result.len);
            if(result.data =="success" && flag == 0)
            {
               tag.value= result.qty;
               totalPrice.innerHTML ="₹"+ result.bill;
            }
            else if(result.data =="success" && flag == 1){
                // // if(result.qty<1){
                // //     document.getElementById(id).remove();
                //    if(result.bill){
                //         totalPrice.innerHTML ="₹"+ result.bill;
                //         totalItem.innerHTML = result.len;
                //     }
                //     else{
                //         totalPrice.innerHTML ="₹"+ 0;
                //         billBox.remove();
                //         var cart = documemt.getElementsByClassName("cart-summary")[0];                    
                //         cart.innerHTML="";    
                //     }    
                // // }
                // else
                // {
                    tag.value=result.qty;
                    totalPrice.innerHTML ="₹"+ result.bill;
                // }   
                var cartItem = document.getElementsByClassName("cart-item");
                if(cartItem.length==0)
                {
                    var cart = documemt.getElementsByClassName("cart-summary")[0];                    
                    cart.innerHTML="";    
                }
            }
            else{
                alert(result.data);
            }
        }).catch((err)=>console.log(err));
    }
    else{
        console.log("nothing to delete!!");
    }
    
}

