if (!localStorage.getItem("user")) {
    window.location.href = "login.html";
}

let products = [];
let filteredProducts = [];
let currentPage = 1;
const perPage = 6;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function fetchProducts() {
    const res = await fetch("https://fakestoreapi.com/products");
    products = await res.json();

    products = products.map(p => ({
        ...p,
        stock: Math.floor(Math.random() * 20),
        ratingValue: p.rating.rate
    }));

    filteredProducts = [...products];
    populateCategories();
    displayProducts();
}

function populateCategories() {
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    const cats = [...new Set(products.map(p => p.category))];
    cats.forEach(cat => {
        categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

function displayProducts() {
    productGrid.innerHTML = "";

    const start = (currentPage - 1) * perPage;
    const pageItems = filteredProducts.slice(start, start + perPage);

    pageItems.forEach(p => {
        productGrid.innerHTML += `
        <div class="product">
            <img src="${p.image}">
            <h4>${p.title}</h4>
            <p>$${p.price}</p>
            <p>⭐ ${p.ratingValue}</p>
            <button onclick="openProduct(${p.id})">View</button>
            <button onclick="addToCart(${p.id})">Add</button>
        </div>`;
    });

    pageNumber.innerText =
        `Page ${currentPage} of ${Math.ceil(filteredProducts.length / perPage)}`;
}

function applyFilters() {
    filteredProducts = products.filter(p => {
        let ok = true;

        if (categoryFilter.value !== "all")
            ok &= p.category === categoryFilter.value;

        if (priceFilter.value !== "all") {
            const [min, max] = priceFilter.value.split("-");
            ok &= p.price >= min && p.price <= max;
        }

        if (ratingFilter.value !== "all")
            ok &= p.ratingValue >= ratingFilter.value;

        if (stockFilter.value === "in")
            ok &= p.stock > 0;

        return ok;
    });

    currentPage = 1;
    displayProducts();
}

sortSelect.onchange = function () {
    if (this.value === "priceLow")
        filteredProducts.sort((a, b) => a.price - b.price);

    if (this.value === "priceHigh")
        filteredProducts.sort((a, b) => b.price - a.price);

    if (this.value === "rating")
        filteredProducts.sort((a, b) => b.ratingValue - a.ratingValue);

    displayProducts();
};

function addToCart(id) {
    const item = cart.find(p => p.id === id);
    const product = products.find(p => p.id === id);

    if (item) item.quantity++;
    else cart.push({ ...product, quantity: 1 });

    updateCart();
}

function removeItem(id) {
    cart = cart.filter(p => p.id !== id);
    updateCart();
}

function changeQty(id, change) {
    const item = cart.find(p => p.id === id);
    item.quantity += change;
    if (item.quantity <= 0) removeItem(id);
    updateCart();
}

function updateCart() {
    cartItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(p => {
        subtotal += p.price * p.quantity;

        cartItems.innerHTML += `
        ${p.title}
        <button onclick="changeQty(${p.id}, -1)">-</button>
        ${p.quantity}
        <button onclick="changeQty(${p.id}, 1)">+</button>
        <button onclick="removeItem(${p.id})">Remove</button>
        <br>`;
    });

    const tax = subtotal * 0.1;
    totalPrice.innerHTML =
        `Subtotal: $${subtotal.toFixed(2)}<br>
         Tax (10%): $${tax.toFixed(2)}<br>
         Total: $${(subtotal + tax).toFixed(2)}`;

    localStorage.setItem("cart", JSON.stringify(cart));
    cart-count.innerText ;
        "Cart: " + cart.reduce((sum, p) => sum + p.quantity, 0);
}

function openProduct(id) {
    const p = products.find(p => p.id === id);

    productDetails.innerHTML = `
        <img src="${p.image}" width="150">
        <h2>${p.title}</h2>
        <p>${p.description}</p>
        <p>Stock: ${p.stock}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;

    productModal.style.display = "flex";
}

closeProductModal.onclick = () =>
    productModal.style.display = "none";

prevBtn.onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
    }
};

nextBtn.onclick = () => {
    if (currentPage < Math.ceil(filteredProducts.length / perPage)) {
        currentPage++;
        displayProducts();
    }
};

checkoutBtn.onclick = () => {
    if (cart.length === 0) return alert("Cart is empty");
    paymentModal.style.display = "flex";
};

payBtn.onclick = () => {
    alert("Payment Successful 🎉");
    cart = [];
    localStorage.removeItem("cart");
    paymentModal.style.display = "none";
    updateCart();
};

closePayModal.onclick = () =>
    paymentModal.style.display = "none";

gridViewBtn.onclick = () => productGrid.className = "grid";
listViewBtn.onclick = () => productGrid.className = "list";

logoutBtn.onclick = () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
};

document.querySelectorAll("select")
    .forEach(s => s.onchange = applyFilters);

fetchProducts();
updateCart();