let page = 1;
let currentQuery = "food";
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');

// ലോഡിംഗ് ആനിമേഷൻ (Skeleton) കാണിക്കാൻ
const showSkeletons = () => {
    for (let i = 0; i < 8; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        productList.appendChild(skeleton);
    }
};

const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;

    // ആദ്യ പേജ് ആണെങ്കിൽ പഴയത് മാറ്റി Skeleton കാണിക്കുക
    if (pageNum === 1) {
        productList.innerHTML = "";
        showSkeletons();
    } else {
        loadingIndicator.classList.remove('hidden');
    }

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=24&json=1`;
        
        // API സ്പീഡ് കൂട്ടാൻ User-Agent സഹായിക്കും
        const response = await fetch(url, { 
            headers: { 'User-Agent': 'CompareIt/1.0 (Contact: mail@example.com)' } 
        });
        const data = await response.json();

        if (pageNum === 1) productList.innerHTML = ""; // ലോഡിംഗ് കഴിഞ്ഞാൽ skeleton കളയുക
        displayProducts(data.products || [], pageNum === 1);
    } catch (e) {
        console.error("API Error:", e);
        if(pageNum === 1) productList.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Error connection. Try again!</p>";
    } finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
    }
};

const displayProducts = (products, isNew) => {
    if (products.length === 0 && isNew) {
        productList.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No products found.</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        if(selectedProducts.find(p => p._id === product._id)) card.classList.add('selected');

        card.innerHTML = `
            <div class="select-indicator"></div>
            <img src="${product.image_front_small_url || 'https://via.placeholder.com/150'}" 
                 alt="product" loading="lazy">
            <h4 style="font-size:11px; margin:8px 0; height: 30px; overflow: hidden;">${product.product_name || 'Unnamed Product'}</h4>
        `;
        card.onclick = () => toggleSelect(product, card);
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
            alert("Already 2 selected! Deselect one to add this.");
        }
    }
    updateCompareSection();
};

const updateCompareSection = () => {
    const section = document.getElementById('compare-section');
    const detailsArea = document.getElementById('full-details-area');

    if (selectedProducts.length === 2) {
        section.classList.remove('hidden');
        const [p1, p2] = selectedProducts;

        document.getElementById('compare1').innerHTML = `<img src="${p1.image_front_small_url || ''}"><p style="font-size:12px;"><b>${(p1.product_name || '').substring(0,15)}</b></p>`;
        document.getElementById('compare2').innerHTML = `<img src="${p2.image_front_small_url || ''}"><p style="font-size:12px;"><b>${(p2.product_name || '').substring(0,15)}</b></p>`;

        detailsArea.innerHTML = `
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Brand</div> ${p1.brands || 'N/A'}</div>
                <div class="detail-col"><div class="detail-label">Brand</div> ${p2.brands || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Grade</div> ${p1.nutrition_grades?.toUpperCase() || 'N/A'}</div>
                <div class="detail-col"><div class="detail-label">Grade</div> ${p2.nutrition_grades?.toUpperCase() || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Sugar/100g</div> ${p1.nutriments?.sugars_100g || 0}g</div>
                <div class="detail-col"><div class="detail-label">Sugar/100g</div> ${p2.nutriments?.sugars_100g || 0}g</div>
            </div>
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Energy</div> ${p1.nutriments?.energy_value || 0} ${p1.nutriments?.energy_unit || 'kcal'}</div>
                <div class="detail-col"><div class="detail-label">Energy</div> ${p2.nutriments?.energy_value || 0} ${p2.nutriments?.energy_unit || 'kcal'}</div>
            </div>
             <div class="detail-row">
                <a href="https://world.openfoodfacts.org/product/${p1._id}" target="_blank" class="off-link">Details P1 🔗</a>
                <a href="https://world.openfoodfacts.org/product/${p2._id}" target="_blank" class="off-link">Details P2 🔗</a>
            </div>
        `;
    } else {
        section.classList.add('hidden');
    }
};

// Search Logic with Debounce (സ്പീഡ് കൂട്ടാൻ സഹായിക്കും)
let timer;
searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        page = 1;
        currentQuery = searchInput.value || "food";
        fetchProducts(currentQuery, 1);
    }, 600); // 0.6 സെക്കൻഡ് ടൈപ്പിംഗ് നിർത്തിയാൽ സെർച്ച് തുടങ്ങും
});

// Infinite Scroll
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && currentQuery !== "") {
        page++;
        fetchProducts(currentQuery, page);
    }
}, { rootMargin: '100px' }); // താഴെ എത്തുന്നതിന് മുൻപേ ലോഡ് ചെയ്യാൻ

observer.observe(scrollAnchor);

document.getElementById('close-compare').onclick = () => {
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    updateCompareSection();
};

// Initial Load
fetchProducts("food", 1);
