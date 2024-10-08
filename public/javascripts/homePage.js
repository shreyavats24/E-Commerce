var showMore = document.getElementById("show-more");
var profile = document.getElementById("profile");
var addTocart = document.getElementsByClassName("addTocart");
var count = 0;

var description = document.querySelectorAll(".description"); //get all the delete buttons
description.forEach(function (button) {
  button.addEventListener("click", function (event) {
    let parentId = event.target.parentElement.id;
    fetch("/productDetail", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: parentId }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data) {
          displayDescription(data);
        } else {
          alert("something went wrong!!");
        }
      });
  });
});

//add to cart req and event listener
for (const addButton of addTocart) {
  addButton.addEventListener("click", (event) => {
    // alert("click");
    count++;
    let parentId = event.target.parentElement.id; //parent Id is the id of product given to div
    // event.target.style.backgroundColor ="red";
    addProduct2Cart(parentId, event.target);
  });
}

function addProduct2Cart(id, elem) {
  fetch("/cart/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => {
      return res.json();
    })
    .then((result) => {
        console.log("r",result);
      if (result.data == "success") {
        // elem.style.backgroundColor="fdc58a"
        alert("added to cart");
        // elem.style.backgroundColor="red"
        // setTimeout(change(elem),2000);
      } else if (result.data == "failure") {
        let res = confirm("please login first to add");
        if (res) window.location.href = "/login";
      } else {
        alert(result.data);
      }
      // elem.style.backgroundColor="#fdc58a";
    })
    .catch((err) => console.log(err));
}
// function change(elem){
// elem.style.backgroundColor="fdc58a"
// }

function displayDescription(data) {
  let allDescriptionDivs = document.querySelectorAll(".container"); // Select all description divs
  allDescriptionDivs.forEach((descriptionDiv) => {
    document.body.removeChild(descriptionDiv); // Remove each description div
  });
  let div = document.createElement("div");
  div.classList.add("container");
  var cross = document.createElement("img");
  cross.src = "/images/cross.png";
  cross.id = "cross";
  var img = document.createElement("img");
  img.src = data.image;
  img.classList.add("product-image");
  var h3 = document.createElement("h3");
  h3.innerText = "Name:" + data.productName;
  var p = document.createElement("p");
  p.innerText =
    "Price:" +
    data.price +
    "\n" +
    "Quantity:" +
    data.quantity +
    "\n" +
    "Size:" +
    data.Size +
    "\n" +
    "Description:" +
    data.description;
  div.appendChild(img);
  div.appendChild(cross);
  div.appendChild(h3);
  div.appendChild(p);
  document.body.appendChild(div);
  cross.addEventListener("click", () => {
    document.body.removeChild(div);
  });
}

function displayProduct(data) {
  var section = document.getElementsByClassName("products")[0];
  var div = document.getElementsByClassName("product-grid")[0];
  data.forEach((elem) => {
    // console.log(elem);
    var div2 = document.createElement("div");
    div2.classList.add("product-card");
    var img = document.createElement("img");
    img.src = elem.image;
    img.classList.add("product-image");
    var h3 = document.createElement("h3");
    h3.innerText = elem.productName;
    var p = document.createElement("p");
    p.innerText = "₹" + elem.price;
    var button = document.createElement("button");
    button.innerText = "Add to cart";
    button.classList.add("addTocart");
    var descpbutton = document.createElement("button");
    descpbutton.innerText = "Description";
    descpbutton.classList.add("description");
    div2.id = elem._id;
    div2.appendChild(img);
    div2.appendChild(h3);
    div2.appendChild(p);
    div2.appendChild(button);
    div2.appendChild(descpbutton);
    div.appendChild(div2);
    descpbutton.addEventListener("click", () => {
      displayDescription(elem);
    });
    button.addEventListener("click", (event) => {
      let parentId = event.target.parentElement.id;
      addProduct2Cart(parentId);
    });
  });
  section.appendChild(div);
  if (!data.length) {
    showMore.style.display = "none";
  }
}
if(showMore){
showMore.addEventListener("click", (event) => {
  showMore.disabled = true;
  console.log("inside show more event ");
  fetch("/getProducts", {
    method: "GET",
  })
    .then((resp) => {
      return resp.json();
    })
    .then(async ({ products, nextdata }) => {
      if (nextdata.length == 0) {
        showMore.style.display = "none";
      }
      if (products) {
        try {
          await displayProduct(products);
        } catch (err) {
          console.log(err);
        }
      }
      showMore.disabled = false;
    })
    .catch((err) => console.log(err));
});
}