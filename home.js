let page = 1;
let currentQuery = "food";
let isLoading = false;

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const limitMessage = document.getElementById('limit-message');
const scrollAnchor = document.getElementById('scroll-anchor');

const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;
    
    loadingIndicator.classList.remove('hidden');
    limitMessage.classList.add('hidden');

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        
        const response = await fetch(url, {
            headers: {
                // ഈ ഹെഡർ ഉണ്ടെങ്കിൽ മാത്രമേ API ബ്ലോക്ക് ചെയ്യാതിരിക്കൂ
                'User-Agent': 'CompareItApp/1.0 (contact: test@example.com)'
            }
        });

        if (response.status === 429) {
            limitMessage.classList.remove('hidden');
            isLoading = false;
            loadingIndicator.classList.add('hidden');
            return;
        }

        const data = await response.json();
        displayProducts(data.products || [], pageNum === 1);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
    }
};

const displayProducts = (products, isNewSearch) => {
    if (isNewSearch) productList.innerHTML = "";

    if (products.length === 0 && isNewSearch) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image_front_small_url || 'https://via.placeholder.com/150'}" alt="product">
            <h4>${product.product_name || 'Unknown'}</h4>
            <p style="font-size:12px; color:gray;">${product.brands || 'No Brand'}</p>
        `;
        card.onclick = () => showDetails(product);
        productList.appendChild(card);
    });
};

const showDetails = (product) => {
    const details = document.getElementById('product-details');
    details.classList.remove('hidden');
    document.getElementById('detail-img').src = product.image_front_url || '';
    document.getElementById('detail-name').innerText = product.product_name || 'Unknown';
    document.getElementById('detail-brand').innerText = "Brand: " + (product.brands || 'N/A');
    document.getElementById('detail-ingredients').innerText = "Ingredients: " + (product.ingredients_text || 'Not listed');
    details.scrollIntoView({ behavior: 'smooth' });
};

// Search with Debounce
let timer;
searchInput.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        page = 1;
        currentQuery = searchInput.value || "food";
        fetchProducts(currentQuery, 1);
    }, 800);
};

// Infinite Scroll
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
        page++;
        fetchProducts(currentQuery, page);
    }
});
observer.observe(scrollAnchor);

// Settings button
document.getElementById('settings-btn').onclick = () => {
    window.location.href = 'profile.html';
};

// Initial Load
fetchProducts("food", 1);
