let page = 1;

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');
const limitMessage = document.getElementById('limit-message');

let currentProducts = [];
let isLoading = false;
let currentQuery = "food"; // Default query

// FETCH PRODUCTS
const fetchProducts = async (query = "food", pageNum = 1) => {
    if (isLoading) return;
    
    isLoading = true;
    loadingIndicator.classList.remove('hidden');
    limitMessage.classList.add('hidden'); // പഴയ എറർ മെസേജ് ഉണ്ടെങ്കിൽ മാറ്റാൻ

    try {
        // API URL - കൂടുതൽ കൃത്യമായ റിസൾട്ടിനായി URL പരിഷ്കരിച്ചു
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // പ്രധാനപ്പെട്ട മാറ്റം: ഇതാണ് API ബ്ലോക്ക് ആകാതിരിക്കാൻ സഹായിക്കുന്നത്
                'User-Agent': 'CompareItApp - Web - Version 1.0 - contact@yourdomain.com'
            }
        });

        if (response.status === 429) {
            showRateLimit();
            isLoading = false;
            loadingIndicator.classList.add('hidden');
            return;
        }

        const data = await response.json();
        const newProducts = data.products || [];

        if (pageNum === 1) {
            currentProducts = newProducts;
        } else {
            currentProducts = [...currentProducts, ...newProducts];
        }

        displayProducts(currentProducts);

    } catch (error) {
        console.error("Fetch Error:", error);
    } finally {
        loadingIndicator.classList.add('hidden');
        isLoading = false;
    }
};

// DISPLAY PRODUCTS
const displayProducts = (products) => {
    if (page === 1) productList.innerHTML = "";

    if (!products.length && page === 1) {
        productList.innerHTML = "<p>No products found</p>";
        return;
    }

    // ഓരോ തവണയും മുഴുവൻ ലിസ്റ്റും റീ-റെൻഡർ ചെയ്യുന്നത് ഒഴിവാക്കാൻ
    const startIndex = (page - 1) * 20;
    const productsToDisplay = products.slice(startIndex);

    productsToDisplay.forEach((product) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // പ്രോഡക്റ്റ് ഇമേജ് ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുന്നു
        const imgUrl = product.image_front_small_url || product.image_url || 'https://via.placeholder.com/150';

        productCard.innerHTML = `
            <img src="${imgUrl}" alt="${product.product_name}">
            <h3>${product.product_name || 'Unknown Product'}</h3>
            <p><strong>Brand:</strong> ${product.brands || 'N/A'}</p>
            <p><strong>Grade:</strong> ${product.nutrition_grades_tags ? product.nutrition_grades_tags[0].toUpperCase() : 'N/A'}</p>
        `;

        productCard.addEventListener('click', () => {
            showProductDetails(product);
            // സെലക്ട് ചെയ്യാൻ മാത്രം താല്പര്യമെങ്കിൽ താഴെയുള്ളത് ഉപയോഗിക്കാം
            document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
            productCard.classList.add('selected');
        });

        productList.appendChild(productCard);
    });
};

// INFINITE SCROLL
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && currentProducts.length > 0) {
        page++;
        fetchProducts(currentQuery, page);
    }
}, { threshold: 1.0 });

observer.observe(scrollAnchor);

// SEARCH (DEBOUNCE)
let timeout = null;
searchInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        page = 1;
        currentQuery = searchInput.value || "food";
        currentProducts = [];
        productList.innerHTML = ""; // ലിസ്റ്റ് ക്ലിയർ ചെയ്യാൻ
        fetchProducts(currentQuery, page);
    }, 800); // 800ms delay for safety
});

// SHOW PRODUCT DETAILS
const showProductDetails = (product) => {
    const detailsSection = document.getElementById('product-details');
    detailsSection.classList.remove('hidden');
    
    // ഡീറ്റെയിൽസ് കാണിക്കുമ്പോൾ അവിടേക്ക് സ്ക്രോൾ ചെയ്യാൻ
    detailsSection.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('detail-img').src = product.image_front_url || product.image_url || '';
    document.getElementById('detail-name').innerText = product.product_name || 'Unknown';
    document.getElementById('detail-brand').innerText = 'Brand: ' + (product.brands || 'N/A');
    document.getElementById('detail-price').innerText = 'Quantity: ' + (product.quantity || 'N/A');
    document.getElementById('detail-ingredients').innerText = 
        'Ingredients: ' + (product.ingredients_text || 'Ingredients information not available.');
};

// RATE LIMIT MESSAGE
const showRateLimit = () => {
    limitMessage.classList.remove('hidden');
    productList.innerHTML = "<p style='color:red;'>API limit reached. Please wait a minute and search again.</p>";
};

// SETTINGS BUTTON
document.getElementById('settings-btn').addEventListener('click', () => {
    window.location.href = "profile.html";
});

// INITIAL LOAD
fetchProducts(currentQuery, 1);
