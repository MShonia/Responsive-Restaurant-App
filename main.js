// burger
const burgerButton = document.getElementById("burger-button");
const navList = document.querySelector(".nav-list");
const closeButton = document.getElementById("close-button");
const siteChatIcon = document.getElementById("site-chat-icon");
const siteChatPopup = document.getElementById("site-chat-popup");
const siteCloseButton = document.getElementById("site-close-button");
const siteChatMessages = document.getElementById("site-chat-messages");
const siteUserInput = document.getElementById("site-user-input");
const siteSendButton = document.getElementById("site-send-button");
const questionButtons = document.querySelectorAll(".question-button");

burgerButton.addEventListener("click", () => {
  navList.classList.add("active");
});

closeButton.addEventListener("click", () => {
  navList.classList.remove("active");
});

//slider
let sliderContainer = document.getElementById("container");
let photoArray = [];
let updatedIndex = 0;
let visiblePhotos = 3;

function updateVisiblePhotos() {
  if (window.innerWidth < 768) {
    visiblePhotos = 1;
  } else if (window.innerWidth < 1200) {
    visiblePhotos = 2;
  } else {
    visiblePhotos = 3;
  }
}

fetch("https://restaurant.stepprojects.ge/api/Products/GetAll")
  .then((response) => response.json())
  .then((data) => {
    photoArray = data.map((item) => item.image);
    if (photoArray.length > 0) {
      updateVisiblePhotos();
      renderSlider();
    }
  })
  .catch((error) => console.error("Error", error));

function renderSlider() {
  sliderContainer.innerHTML = "";
  for (let i = 0; i < visiblePhotos; i++) {
    let imageIndex = (updatedIndex + i) % photoArray.length;

    let imgDiv = document.createElement("div");
    imgDiv.style.backgroundImage = `url(${photoArray[imageIndex]})`;
    imgDiv.style.backgroundSize = "cover";
    imgDiv.style.backgroundColor = "white";
    imgDiv.style.backgroundPosition = "center";
    sliderContainer.appendChild(imgDiv);
  }
}

function slider(direction) {
  updatedIndex += direction;
  if (updatedIndex < 0) {
    updatedIndex = photoArray.length - 1;
  } else if (updatedIndex >= photoArray.length) {
    updatedIndex = 0;
  }
  renderSlider();
}

window.addEventListener("resize", () => {
  updateVisiblePhotos();
  renderSlider();
});

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountSpan = document.querySelector(".cart-icon span");
  if (cartCountSpan) {
    cartCountSpan.textContent = cart.length;
  } else {
    console.error("Cart count span element not found.");
  }
}

function addToCart(item, quantity) {
  let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
  for (let i = 0; i < quantity; i++) {
    currentCart.push(item);
  }
  localStorage.setItem("cart", JSON.stringify(currentCart));
  console.log("Added to cart:", item, "Quantity:", quantity);
  updateCartCount();
}

updateCartCount();

function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messageElement.classList.add(sender);
  siteChatMessages.appendChild(messageElement);
  siteChatMessages.scrollTop = siteChatMessages.scrollHeight;
}

function handleUserInput() {
  const message = siteUserInput.value.trim();
  if (message) {
    addMessage(message, "user");
    siteUserInput.value = "";
    getChatResponse(message);
  }
}

function getChatResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("order")) {
    addMessage("Add to cart and checkout.", "chat");
  } else if (lowerMessage.includes("delivery")) {
    addMessage("Depends on location.", "chat");
  } else if (lowerMessage.includes("vegetarian")) {
    addMessage("Yes, we have vegetarian dishes.", "chat");
  } else {
    addMessage("Sorry, I don't understand.", "chat");
  }
}

siteSendButton.addEventListener("click", handleUserInput);
siteUserInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleUserInput();
  }
});

questionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.dataset.question;
    siteUserInput.value = question;
  });
});

siteChatIcon.addEventListener("click", () => {
  siteChatPopup.style.display = "flex";
});

siteCloseButton.addEventListener("click", () => {
  siteChatPopup.style.display = "none";
});
