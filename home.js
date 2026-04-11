let page = 1;
let currentQuery = "food"; // തുടക്കത്തിൽ 'food' എന്നത് ലോഡ് ആകും
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');

// ലോഡിംഗ് ആനിമേഷൻ
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
    
    // ആദ്യ പേജ് ആണെങ്കിൽ മാത്രം പഴയത് മാറ്റി Skeleton കാണിക്കുക
    if (pageNum === 1) {
        productList.innerHTML = "";
        showSkeletons();
    } else {
        loadingIndicator.classList.remove('hidden');
    }

    try {
        // Open Food Facts API URL
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=24&json=1`;
        
        const response = await fetch(url, { 
            headers: { 'User-Agent': 'CompareIt/1.0' } 
        });
        const data = await response.json();

        if (pageNum === 1) productList.innerHTML = ""; 
        displayProducts(data.products || [], pageNum === 1);
    } catch (e) {
        console.error("API Error:", e);
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

// Search Logic - ഇവിടെയാണ് പ്രധാന മാറ്റം
let timer;
searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        const query = searchInput.value.trim();
        page = 1;
        currentQuery = query || "food"; // സെർച്ച് ബോക്സ് കാലിയാണെങ്കിൽ തിരിച്ച് 'food' ലോഡ് ചെയ്യും
        fetchProducts(currentQuery, 1);
    }, 600);
});

// Infinite Scroll - താഴേക്ക് പോകുമ്പോൾ കൂടുതൽ ലോഡ് ചെയ്യാൻ
const observer = new IntersectionObserver((entries) => {
    // യൂസർ താഴെ എത്തുമ്പോൾ മാത്രം അടുത്ത പേജ് ലോഡ് ചെയ്യുക
    if (entries[0].isIntersecting && !isLoading) {
        page++;
        fetchProducts(currentQuery, page);
    }
}, { threshold: 1.0 }); // കൃത്യമായി ആങ്കർ കാണുമ്പോൾ മാത്രം

observer.observe(scrollAnchor);

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
            alert("Already 2 selected!");
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
                <div class="detail-col"><div class="detail-label">Sugar</div> ${p1.nutriments?.sugars_100g || 0}g</div>
                <div class="detail-col"><div class="detail-label">Sugar</div> ${p2.nutriments?.sugars_100g || 0}g</div>
            </div>
        `;
    } else {
        section.classList.add('hidden');
    }
};

document.getElementById('close-compare').onclick = () => {
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    updateCompareSection();
};

// വെബ്സൈറ്റ് തുറക്കുമ്പോൾ തന്നെ ഫുഡ് പ്രോഡക്റ്റുകൾ കാണിക്കാൻ
fetchProducts(currentQuery, 1);
