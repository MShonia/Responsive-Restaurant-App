// burger
const burgerButton = document.getElementById("burger-button");
const navList = document.querySelector(".nav-list");
const closeButton = document.getElementById("close-button");

burgerButton.addEventListener("click", () => {
  navList.classList.add("active");
});

closeButton.addEventListener("click", () => {
  navList.classList.remove("active");
});

document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("popup");
  const popupClose = document.getElementById("popup-close");
  const popupContent = document.getElementById("popup-content");
  const popupOverlay = document.querySelector(".popup-overlay");
  let selectedItem = null;
  let quantity = 1;

  const menuItemsContainer = document.querySelector(".menu-items");
  const categoryFilters = document.querySelectorAll(".category-filter");
  const nutsCheckbox = document.getElementById("nuts");
  const vegetarianCheckbox = document.getElementById("vegetarian");
  const spicinessRange = document.getElementById("spiciness");
  const filterButton = document.getElementById("filter-button");
  const resetButton = document.getElementById("reset-button");

  let allMenuItems = [];

  fetch("https://restaurant.stepprojects.ge/api/Products/GetAll")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      allMenuItems = data;
      displayMenuItems(allMenuItems);
      setupEventListeners();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      menuItemsContainer.innerHTML = "Error loading menu.";
    });

  function displayMenuItems(items) {
    menuItemsContainer.innerHTML = items
      .map(
        (item) => `
          <div class="menu-item" data-item='${JSON.stringify(item)}'>
              <img src="${item.image}" alt="${item.name}">
              <h3>${item.name}</h3>
              <p>Price: ${item.price} GEL</p>
              <p>Spiciness: ${item.spiciness}</p>
              <p>Nuts: ${item.nuts ? "Yes" : "No"}</p>
              <p>Vegetarian: ${
                item.vegetarian && item.vegetarian.toLowerCase() === "yes"
                  ? "Yes"
                  : "No"
              }</p>
              <button class="add-to-cart-menu" data-item='${JSON.stringify(
                item
              )}'>Add to Cart</button>
          </div>
      `
      )
      .join("");
  }

  function setupEventListeners() {
    categoryFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        categoryFilters.forEach((btn) => btn.classList.remove("active"));
        filter.classList.add("active");
        filterMenuItems();
      });
    });

    filterButton.addEventListener("click", filterMenuItems);
    resetButton.addEventListener("click", resetFilters);

    popupClose.addEventListener("click", () => {
      popup.classList.remove("show");
    });

    menuItemsContainer.addEventListener("click", (event) => {
      const menuItem = event.target.closest(".menu-item");
      if (menuItem) {
        const itemData = JSON.parse(menuItem.dataset.item);
        showPopup(itemData);
      }

      if (event.target.classList.contains("add-to-cart-menu")) {
        const itemData = JSON.parse(event.target.dataset.item);
        addToCart(itemData, 1);
      }
    });

    popup.addEventListener("click", (event) => {
      if (event.target.classList.contains("add-to-cart-popup")) {
        const itemData = JSON.parse(event.target.dataset.item);
        const quantity = parseInt(popup.querySelector(".quantity").textContent);
        addToCart(itemData, quantity);
      }

      if (event.target.classList.contains("quantity-increase")) {
        const quantitySpan = popup.querySelector(".quantity");
        let quantity = parseInt(quantitySpan.textContent);
        quantity++;
        quantitySpan.textContent = quantity;
      } else if (event.target.classList.contains("quantity-decrease")) {
        const quantitySpan = popup.querySelector(".quantity");
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 0) {
          quantity--;
          quantitySpan.textContent = quantity;
        }
      }
    });
  }

  function filterMenuItems() {
    let filteredItems = allMenuItems;

    const activeCategory = document.querySelector(".category-filter.active")
      .dataset.category;

    if (activeCategory !== "all") {
      const categoryId = getCategoryIdByName(activeCategory);
      filteredItems = filteredItems.filter(
        (item) => item.categoryId === categoryId
      );
    }

    const nutsFilter = nutsCheckbox.checked;
    const vegetarianFilter = vegetarianCheckbox.checked;
    const spicinessFilter = parseInt(spicinessRange.value);

    filteredItems = filteredItems.filter((item) => {
      let nutsMatch = true;
      let vegetarianMatch = true;
      let spicinessMatch = true;

      if (nutsFilter) {
        nutsMatch = item.nuts;
      }

      if (vegetarianFilter) {
        vegetarianMatch =
          item.vegetarian && item.vegetarian.toLowerCase() === "yes";
      }

      if (spicinessFilter > 0) {
        spicinessMatch = item.spiciness >= spicinessFilter;
      }

      return nutsMatch && vegetarianMatch && spicinessMatch;
    });

    displayMenuItems(filteredItems);
  }

  function resetFilters() {
    categoryFilters.forEach((btn) => btn.classList.remove("active"));
    categoryFilters[0].classList.add("active");
    nutsCheckbox.checked = false;
    vegetarianCheckbox.checked = false;
    spicinessRange.value = 0;
    displayMenuItems(allMenuItems);
  }

  function getCategoryIdByName(categoryName) {
    const categories = {
      Salads: 1,
      Soups: 2,
      "Chicken-Dishes": 3,
      "Beef-Dishes": 4,
      "Seafood-Dishes": 5,
      "Vegetable-Dishes": 6,
      "Bits&Bites": 7,
      "On-The-Side": 8,
    };

    return categories[categoryName];
  }

  function showPopup(item) {
    selectedItem = item;
    popupContent.innerHTML = `
        <h2>${item.name}</h2>
        <p>Price: ${item.price} GEL</p>
        <img src="${item.image}" alt="${item.name}" style="max-width: 200px; max-height: 200px;">
        <div class="quantity-control">
            <button class="quantity-decrease">-</button>
            <span id="quantity">${quantity}</span>
            <button class="quantity-increase">+</button>
        </div>
        <button id="addToCart">Add to Cart</button>
    `;
    popup.style.display = "flex";
    popupOverlay.style.display = "block";
  }

  function hidePopup() {
    popup.style.display = "none";
    popupOverlay.style.display = "none";
    quantity = 1;
  }

  menuItemsContainer.addEventListener("click", (event) => {
    const menuItem = event.target.closest(".menu-item");
    if (menuItem) {
      const item = JSON.parse(menuItem.dataset.item);
      showPopup(item);
    }
  });

  popupClose.addEventListener("click", hidePopup);

  popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
      hidePopup();
    }
  });

  popup.addEventListener("click", (event) => {
    if (event.target.classList.contains("quantity-decrease")) {
      if (quantity > 1) {
        quantity--;
        document.getElementById("quantity").textContent = quantity;
      }
    } else if (event.target.classList.contains("quantity-increase")) {
      quantity++;
      document.getElementById("quantity").textContent = quantity;
    } else if (event.target.id === "addToCart") {
      if (selectedItem) {
        addToCart(selectedItem, quantity);
        hidePopup();
      }
    }
  });

  function addToCart(item, quantity) {
    let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    for (let i = 0; i < quantity; i++) {
      currentCart.push(item);
    }
    localStorage.setItem("cart", JSON.stringify(currentCart));
    console.log("Added to cart:", item, "Quantity:", quantity);
    updateCartCount();
  }

  function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCountSpan = document.querySelector(".cart-icon span");
    if (cartCountSpan) {
      cartCountSpan.textContent = cart.length;
    } else {
      console.error("Cart count span element not found.");
    }
  }

  updateCartCount();
});
//search
document.addEventListener("DOMContentLoaded", function () {
  const searchIcon = document.getElementById("search-icon");
  const searchBox = document.getElementById("search-box");
  const searchInput = document.getElementById("search-input");
  const menuItemsContainer = document.querySelector(".menu-items");

  searchIcon.addEventListener("click", function () {
    if (searchInput.style.display === "block") {
      searchInput.style.display = "none";
    } else {
      searchInput.style.display = "block";
      searchInput.focus();
    }
  });

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    console.log("Search term:", searchTerm);

    if (menuItemsContainer) {
      const cards = menuItemsContainer.querySelectorAll(".menu-item");
      console.log("Number of cards:", cards.length);

      cards.forEach((card) => {
        const productName = card.querySelector("h3").textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    } else {
      console.error("menuItemsContainer element not found.");
    }
  });

  document.addEventListener("click", function (event) {
    if (
      !searchIcon.contains(event.target) &&
      !searchBox.contains(event.target)
    ) {
      searchInput.style.display = "none";
    }
  });
});
