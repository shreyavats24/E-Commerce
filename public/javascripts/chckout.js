var address = document.getElementById("address");
const orderBtn = document.getElementsByClassName("placeorder-button")[0];
var nextBtn = document.getElementsByClassName("next-button")[0];

orderBtn.addEventListener("click",(event)=>{
    var paymentMethod = document.getElementById("payment-method").value;
    // alert("click")
    if(paymentMethod === 'debit' || paymentMethod === 'credit'){
        console.log(paymentMethod);
        var cardNum = document.getElementById("card-number");
        var exp = document.getElementById("expiry-date");
        var cvv = document.getElementById("cvv");
        if(cardNum.value.trim()=="" || exp.value.trim() == "" || cvv.value.trim() == ""||address.value.trim()=="")
        {
            alert("fill up all details");
        }
        else{
            order(paymentMethod,address.value);
        }
    }
    else if(paymentMethod === 'upi')
    {
        console.log(paymentMethod);
        var id = document.getElementById("upi-id").value;
        if(id.trim()==""||address.value.trim()=="")
        {
            alert("please enter upi id!!");
        }
        else{
            order(paymentMethod,address.value);
        }
    }
    else if(paymentMethod ==='cod')
    {
        if(address.value.trim()=="")
        {
            alert("please fill address!");
        }
        else
        {
            // console.log(address.value);
            order(paymentMethod,address.value);
        }
    }

})

//it will shift cart to order details and empty the cart  
function order(paymentMethod,address){
    fetch("/cart/submitOrder",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({mod:paymentMethod,address:address})
    }).then((res)=>{
        if(res.ok) return res.text();
    }).then((data)=>{
        if(data =="success"){
        alert("orderplaced successfully");
        window.location.href ="/";
        }
        else{
            alert(data);
            window.location.href ="/cart";
        }
    }).error((error)=>{
        alert("order failed");
    })   
}

function showNextStep(step) {
    // console.log(address.value);alert("please fill up address");
    document.querySelector('.checkout-step.active').classList.remove('active');
    document.getElementById(step).classList.add('active');
    updateSteps(step);
}


function showPreviousStep(step) {
    document.querySelector('.checkout-step.active').classList.remove('active');
    document.getElementById(step).classList.add('active');
    updateSteps(step);
}

function updateSteps(step) {
    const steps = document.querySelectorAll('.steps .step');
    steps.forEach(s => s.classList.remove('active'));
    if (step === 'review-cart') steps[0].classList.add('active');
    if (step === 'shipping-details') steps[1].classList.add('active');
    if (step === 'payment') steps[2].classList.add('active');
}
function togglePaymentFields() {
var paymentMethod = document.getElementById("payment-method").value;
const cardDetails = document.getElementById('card-details');
const upiDetails = document.getElementById('upi-details');
const codDetails = document.getElementById('cod-details');

// Hide all fields initially
cardDetails.style.display = 'none';
upiDetails.style.display = 'none';
codDetails.style.display = 'none';

// console.log(paymentMethod);

// Show fields based on payment method selection
if (paymentMethod === 'debit' || paymentMethod === 'credit') {
    cardDetails.style.display = 'block';
} else if (paymentMethod === 'upi') {
upiDetails.style.display = 'block';

} else if (paymentMethod === 'cod') {
codDetails.style.display = 'block';
}
}
