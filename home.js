let page = 1;
let currentQuery = "food";
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const limitMessage = document.getElementById('limit-message');
const scrollAnchor = document.getElementById('scroll-anchor');

const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;
    loadingIndicator.classList.remove('hidden');

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'CompareItApp/1.0' }
        });

        if (response.status === 429) {
            limitMessage.classList.remove('hidden');
            return;
        }

        const data = await response.json();
        displayProducts(data.products || [], pageNum === 1);
    } catch (e) { console.error(e); }
    finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
    }
};

const displayProducts = (products, isNew) => {
    if (isNew) productList.innerHTML = "";
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        // നിലവിൽ സെലക്ട് ചെയ്തതാണോ എന്ന് നോക്കുന്നു
        if(selectedProducts.find(p => p._id === product._id)) card.classList.add('selected');

        card.innerHTML = `
            <div class="select-indicator"></div>
            <img src="${product.image_front_small_url || 'https://via.placeholder.com/150'}" alt="">
            <h4 style="font-size:12px; margin:5px 0;">${product.product_name || 'Unknown'}</h4>
        `;

        card.onclick = (e) => {
            // ടിക് ബട്ടണിലോ കാർഡിലോ ക്ലിക്ക് ചെയ്താൽ സെലക്ട് ആകും
            toggleSelect(product, card);
        };
        productList.appendChild(card);
    });
};

const toggleSelect = (product, card) => {
    const index = selectedProducts.findIndex(p => p._id === product._id);
    if (index > -1) {
        selectedProducts.splice(index, 1);
        card.classList.remove('selected');
    } else {
        if (selectedProducts.length < 2) {
            selectedProducts.push(product);
            card.classList.add('selected');
        } else {
            alert("Please deselect a product to add a new one (Max 2).");
        }
    }
    updateCompareSection();
};

const updateCompareSection = () => {
    const section = document.getElementById('compare-section');
    if (selectedProducts.length === 2) {
        section.classList.remove('hidden');
        selectedProducts.forEach((p, i) => {
            document.getElementById(`compare${i+1}`).innerHTML = `
                <img src="${p.image_front_small_url || ''}">
                <p><strong>${p.product_name.substring(0,15)}..</strong></p>
                <p>Grade: ${p.nutrition_grades?.toUpperCase() || 'N/A'}</p>
            `;
        });
    } else {
        section.classList.add('hidden');
    }
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

document.getElementById('close-compare').onclick = () => {
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    updateCompareSection();
};

// Initial Load
fetchProducts("food", 1);