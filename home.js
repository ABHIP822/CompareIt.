let page = 1;

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');

const limit = 20;
let requestCount = 0;
let currentProducts = [];
let isLoading = false;

// Reset API count every minute
setInterval(() => {
    requestCount = 0;
}, 60000);

// FETCH PRODUCTS
const fetchProducts = async (query = "", pageNum = 1) => {
    if (isLoading) return;

    if (requestCount >= limit) {
        showRateLimit();
        return;
    }

    isLoading = true;
    loadingIndicator.classList.remove('hidden');

    try {
        // small delay (safe API usage)
        await new Promise(resolve => setTimeout(resolve, 500));

        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&page=${pageNum}&json=1`;

        requestCount++;

        const response = await fetch(url);
        const data = await response.json();

        const newProducts = data.products || [];

        // append (important for scroll)
        currentProducts = [...currentProducts, ...newProducts];

        displayProducts(currentProducts);

    } catch (error) {
        console.error("Fetch Error:", error);
    }

    loadingIndicator.classList.add('hidden');
    isLoading = false;
};

// DISPLAY PRODUCTS
const displayProducts = (products) => {
    productList.innerHTML = "";

    if (!products.length) {
        productList.innerHTML = "<p>No products found</p>";
        return;
    }

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

        // SELECT TOGGLE
        productCard.addEventListener('click', () => {
            productCard.classList.toggle('selected');
        });
    });
};

// INFINITE SCROLL
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
        page++;
        fetchProducts(searchInput.value, page);
    }
});

observer.observe(scrollAnchor);

// SEARCH (DEBOUNCE)
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

// PRODUCT DETAILS CLICK
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

// SHOW PRODUCT DETAILS
const showProductDetails = (product) => {
    document.getElementById('product-details').classList.remove('hidden');

    document.getElementById('detail-img').src = product.image_url || '';
    document.getElementById('detail-name').innerText = product.product_name || 'Unknown';
    document.getElementById('detail-brand').innerText = 'Brand: ' + (product.brands || 'N/A');
    document.getElementById('detail-price').innerText = 'Category: ' + (product.categories || 'N/A');
    document.getElementById('detail-ingredients').innerText =
        'Ingredients: ' + (product.ingredients_text || 'N/A');
};

// RATE LIMIT MESSAGE
const showRateLimit = () => {
    document.getElementById('limit-message').classList.remove('hidden');
};

// SETTINGS BUTTON (IMPORTANT FIX)
document.getElementById('settings-btn').addEventListener('click', () => {
    // 👉 change this if your profile page name is different
    window.location.href = "profile.html";
});

// INITIAL LOAD (VERY IMPORTANT)
fetchProducts("food", 1);