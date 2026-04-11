let page = 1;
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');

const limit = 30;
let requestCount = 0;
let currentProducts = [];
let isLoading = false;

// Reset request count every minute
setInterval(() => {
    requestCount = 0;
}, 60000);

// Fetch products
const fetchProducts = async (query = "", pageNum = 1) => {
    if (isLoading) return;

    if (requestCount >= limit) {
        showRateLimit();
        return;
    }

    isLoading = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&page=${pageNum}&json=1`;

        requestCount++;

        const response = await fetch(url);
        const data = await response.json();

        // Append new products (infinite scroll)
        currentProducts = [...currentProducts, ...data.products];

        displayProducts(currentProducts);

    } catch (error) {
        console.error("Error fetching data:", error);
    }

    isLoading = false;
};

// Display products
const displayProducts = (products) => {
    productList.innerHTML = ""; // clear

    products.forEach((product) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <img src="${product.image_url || 'https://via.placeholder.com/150'}">
            <h3>${product.product_name || 'Unknown Product'}</h3>
            <p>Brand: ${product.brands || 'N/A'}</p>
            <p>Category: ${product.categories || 'N/A'}</p>
        `;

        productList.appendChild(productCard);
    });
};

// Infinite scroll
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
        page++;
        fetchProducts(searchInput.value, page);
    }
});

observer.observe(loadingIndicator);

// Search (debounce)
let timeout = null;

searchInput.addEventListener('input', () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        page = 1;
        requestCount = 0;
        currentProducts = [];

        fetchProducts(searchInput.value, page);
    }, 500);
});

// Product click → show details
productList.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');

    if (card) {
        const index = Array.from(productList.children).indexOf(card);
        const product = currentProducts[index];

        if (product) {
            showProductDetails(product);
        }
    }
});

// Show details
const showProductDetails = (product) => {
    document.getElementById('product-details').classList.remove('hidden');

    document.getElementById('detail-img').src = product.image_url || '';
    document.getElementById('detail-name').innerText = product.product_name || 'Unknown';
    document.getElementById('detail-brand').innerText = 'Brand: ' + (product.brands || 'N/A');
    document.getElementById('detail-ingredients').innerText =
        'Ingredients: ' + (product.ingredients_text || 'N/A');
};

// Rate limit message
const showRateLimit = () => {
    document.getElementById('limit-message').classList.remove('hidden');
};

// Initial load
fetchProducts();