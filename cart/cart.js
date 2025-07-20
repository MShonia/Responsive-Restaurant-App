
document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalElement = document.getElementById("cartTotal");
    const clearCartButton = document.getElementById("clearCart");
    const checkoutButton = document.getElementById("checkout");
    const checkoutPopup = document.querySelector(".checkout-popup");
    const pickupButton = document.querySelector(".pickup-button");
    const deliveryButton = document.querySelector(".delivery-button");
    const deliveryAddress = document.querySelector(".delivery-address");
    const saveButton = document.querySelector(".save-button");
    const addressTextarea = document.getElementById("address");
    const messageDiv = document.createElement("div"); 
    
    checkoutPopup.querySelector(".checkout-popup-content").appendChild(messageDiv); 
    
    checkoutButton.addEventListener("click", () => {
        checkoutPopup.style.display = "flex";
        messageDiv.textContent = "";
    });
    
    pickupButton.addEventListener("click", () => {
        deliveryAddress.style.display = "none";
        messageDiv.textContent = "Your order will be ready in 15 minutes.\nPickup from: Tbilisi, Georgia";
    });
    
    deliveryButton.addEventListener("click", () => {
        deliveryAddress.style.display = "block";
        messageDiv.textContent = "";
    });
    
    saveButton.addEventListener("click", () => {
        const deliveryMethod = deliveryAddress.style.display === "block" ? "Delivery" : "Pickup";
        const address = addressTextarea.value.trim(); 
    
        if (deliveryMethod === "Delivery" && address.toLowerCase() !== "tbilisi") {
            messageDiv.textContent = "No results found.";
            return;
        }
        const fullScreenMessage = document.createElement("div");
        fullScreenMessage.textContent = "Your order has been received. Thank you for choosing us!";
        fullScreenMessage.classList.add("full-screen-message");
    
        const checkmark = document.createElement("div");
        checkmark.classList.add("checkmark");
        fullScreenMessage.prepend(checkmark); 
    
        document.body.appendChild(fullScreenMessage);
    
        setTimeout(() => {
            document.body.removeChild(fullScreenMessage);
            checkoutPopup.style.display = "none";
            messageDiv.textContent = "";
        }, 3000);
    
        addressTextarea.value = ""; 
    });
    
    checkoutPopup.addEventListener("click", (event) => {
        if (event.target === checkoutPopup) {
            checkoutPopup.style.display = "none";
            messageDiv.textContent = ""; 
        }
    });
    function loadCart() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your Cart is Empty</p>";
            cartTotalElement.textContent = "";
            return;
        }

        let total = 0;
        let groupedCart = groupCartItems(cart);

        groupedCart.forEach((item) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" width="100">
                <h2>${item.name}</h2>
                <p>Price: ${item.price} GEL</p>
                <div class="quantity-control">
                    <button class="decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase" data-id="${item.id}">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });

        cartTotalElement.textContent = `Total: ${total} GEL`;
    }

    function groupCartItems(cart) {
        let grouped = {};
        cart.forEach((item) => {
            if (grouped[item.id]) {
                grouped[item.id].quantity++;
            } else {
                grouped[item.id] = { ...item, quantity: 1 };
            }
        });
        return Object.values(grouped);
    }

    function updateQuantity(id, change) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let index = cart.findIndex((item) => item.id === id);

        if (index !== -1) {
            if (change === 1) {
                cart.push(cart[index]);

                sendUpdateRequest(cart[index]);
            } else if (change === -1) {
                cart.splice(index, 1);
                if (cart.filter((item) => item.id === id).length === 0) {
    
                }
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            loadCart();
        }
    }
     // PUT
    function sendUpdateRequest(item) {
        fetch(`https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("რაოდენობა განახლდა:", data);
            })
            .catch((error) => {
                console.error("რაოდენობის განახლების შეცდომა:", error);
            });
    }

    cartItemsContainer.addEventListener("click", (event) => {
        const id = parseInt(event.target.dataset.id);
        if (event.target.classList.contains("decrease")) {
            updateQuantity(id, -1);
        } else if (event.target.classList.contains("increase")) {
            updateQuantity(id, 1);
        }
    });

    clearCartButton.addEventListener("click", () => {
        localStorage.removeItem("cart");
        loadCart();
    });
// post
    checkoutButton.addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        fetch("https://restaurant.stepprojects.ge/api/Baskets/AddToBasket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cart),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("შეკვეთა წარმატებით გაიგზავნა:", data);
                localStorage.removeItem("cart");
                loadCart();
            })
            .catch((error) => {
                console.error("შეკვეთის გაგზავნის შეცდომა:", error);
            });
    });

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        document.querySelector(".cart-icon span").textContent = cart.length;
    }

    loadCart();
    updateCartCount();
});


