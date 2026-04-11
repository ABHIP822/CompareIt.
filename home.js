let page = 1;
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const limit = 30; // API rate limit set to 100
let requestCount = 0;
let currentProducts = [];
let isLoading = false;

setInterval(() => {
requestCount = 0;
},60000);
// Fetch products from Open Food Facts API

const fetchProducts = async (query = "", pageNum = 1) => {
    if (isLoading) return; 

    if (requestCount >= limit) {
        showRateLimit();
        return;
    }
    
    //Add a small delay to avoid immediate repid-fire requeste

    isLoading = true; 

    await new Promise(resolve =>
    setTimeout(resolve, 800));

    const userAgent = "CompareIt/1.0 (Contact: ap7258616@gmail.com)";
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&page=${pageNum}&json=1`;
    try {
        requestCount++;
        const response = await fetch(url, {
            headers: { "User-Agent": userAgent }
        });
        const data = await response.json();

        currentProducts = 
[...currentProducts, ...data.products];

        displayProducts(currentProducts);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
    // CHANGE 2: reset loading
    isLoading = false;
};

// Display products on the page
const displayProducts = (products) => {
    productList.innerHTML = ""; // Clear previous results
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image_url || 'placeholder.png'}" alt="${product.product_name}">
            <h3>${product.product_name || 'Unknown Product'}</h3>
            <p>Brand: ${product.brands || 'N/A'}</p>
            <p>Price: ₹${product.price || 'N/A'}</p>
        `;
        productList.appendChild(productCard);

        // Add click to select product
        productCard.addEventListener('click', () => {
            productCard.classList.toggle('selected');
        });
    });
};

// Infinite scrolling
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        page++;

        if (!isLoading) {
        fetchProducts(searchInput.value, page);
    }
  }
}, { threshold: 1.0 });
observer.observe(loadingIndicator);

// Search functionality
let timeout = null;
searchInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        productList.innerHTML = ""; // Clear current list
        page = 1;
        requestCount = 0; 
// CHANGE 4: reset old products(IMPORTANT)
        currentProducts = [];

        fetchProducts(searchInput.value, page);
    }, 500);
});

// Show product details when a product is clicked
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

const showProductDetails = (product) => {
    document.getElementById('product-details').classList.remove('hidden');
    document.getElementById('detail-img').src = product.image_url || '';
    document.getElementById('detail-name').innerText = product.product_name || 'Unknown';
    document.getElementById('detail-brand').innerText = 'Brand: ' + (product.brands || 'N/A');
    document.getElementById('detail-price').innerText = 'Price: ₹' + (product.price || 'N/A');
    document.getElementById('detail-ingredients').innerText = 'Ingredients: ' + (product.ingredients_text || 'N/A');
};

const showRateLimit = () => {
    document.getElementById('limit-message').classList.remove('hidden');
};

// Initial fetch
fetchProducts();
