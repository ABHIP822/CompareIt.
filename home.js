let page = 1;
let currentQuery = "food";
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');

// സ്കെലറ്റൺ ലോഡിംഗ് കാണിക്കാനുള്ള ഫംഗ്ഷൻ
const showSkeleton = () => {
    const skeletons = Array(10).fill(0).map(() => `
        <div class="product-card skeleton-card" style="background: #f0f0f0; border: none; pointer-events: none;">
            <div style="width: 100%; height: 100px; background: #e0e0e0; border-radius: 8px; margin-bottom: 8px; animation: skeleton-blink 1.5s infinite;"></div>
            <div style="width: 80%; height: 12px; background: #e0e0e0; border-radius: 4px; animation: skeleton-blink 1.5s infinite;"></div>
        </div>
    `).join('');
    
    // ആനിമേഷനായി ഒരു ചെറിയ സ്റ്റൈൽ ആഡ് ചെയ്യുന്നു
    if (!document.getElementById('skeleton-style')) {
        const style = document.createElement('style');
        style.id = 'skeleton-style';
        style.innerHTML = `
            @keyframes skeleton-blink {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    productList.innerHTML += skeletons;
};

const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;
    loadingIndicator.classList.remove('hidden');
    
    // ലോഡ് ചെയ്യുന്ന സമയത്ത് സ്കെലറ്റൺ കാണിക്കുന്നു
    if (pageNum === 1) productList.innerHTML = "";
    showSkeleton();

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'CompareItApp/1.0' } });
        const data = await response.json();
        
        // ലോഡിംഗ് കഴിഞ്ഞാൽ സ്കെലറ്റൺ മാറ്റാൻ ലിസ്റ്റ് ക്ലിയർ ചെയ്യുന്നു
        const skeletons = document.querySelectorAll('.skeleton-card');
        skeletons.forEach(s => s.remove());

        displayProducts(data.products || [], pageNum === 1);
    } catch (e) { 
        console.error(e); 
        const skeletons = document.querySelectorAll('.skeleton-card');
        skeletons.forEach(s => s.remove());
    }
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
        if(selectedProducts.find(p => p._id === product._id)) card.classList.add('selected');

        card.innerHTML = `
            <div class="select-indicator"></div>
            <img src="${product.image_front_small_url || 'https://via.placeholder.com/150'}" alt="">
            <h4 style="font-size:11px; margin:5px 0;">${product.product_name || 'Unknown'}</h4>
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
            alert("Please deselect a product to add a new one.");
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

        document.getElementById('compare1').innerHTML = `<img src="${p1.image_front_small_url || ''}"><p><b>${p1.product_name.substring(0,15)}</b></p>`;
        document.getElementById('compare2').innerHTML = `<img src="${p2.image_front_small_url || ''}"><p><b>${p2.product_name.substring(0,15)}</b></p>`;

        detailsArea.innerHTML = `
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Brand:</div> ${p1.brands || 'N/A'}</div>
                <div class="detail-col"><div class="detail-label">Brand:</div> ${p2.brands || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Nutrition Grade:</div> ${p1.nutrition_grades?.toUpperCase() || 'N/A'}</div>
                <div class="detail-col"><div class="detail-label">Nutrition Grade:</div> ${p2.nutrition_grades?.toUpperCase() || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Sugar:</div> ${p1.nutriments?.sugars_100g || 0}g</div>
                <div class="detail-col"><div class="detail-label">Sugar:</div> ${p2.nutriments?.sugars_100g || 0}g</div>
            </div>
            <div class="detail-row">
                <div class="detail-col"><div class="detail-label">Energy:</div> ${p1.nutriments?.energy_value || 0} ${p1.nutriments?.energy_unit || 'kcal'}</div>
                <div class="detail-col"><div class="detail-label">Energy:</div> ${p2.nutriments?.energy_value || 0} ${p2.nutriments?.energy_unit || 'kcal'}</div>
            </div>
            <div class="detail-row" style="flex-direction: column;">
                <div class="detail-label">Ingredients 1:</div>
                <p style="margin-top:2px;">${p1.ingredients_text || 'No data'}</p>
                <div class="detail-label">Ingredients 2:</div>
                <p style="margin-top:2px;">${p2.ingredients_text || 'No data'}</p>
            </div>
            <div class="detail-row">
                <a href="https://world.openfoodfacts.org/product/${p1._id}" target="_blank" class="off-link">Open Food Facts (P1)</a>
                <a href="https://world.openfoodfacts.org/product/${p2._id}" target="_blank" class="off-link">Open Food Facts (P2)</a>
            </div>
        `;
    } else {
        section.classList.add('hidden');
    }
};

let timer;
searchInput.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { 
        page = 1; 
        currentQuery = searchInput.value || "food";
        fetchProducts(currentQuery, 1); 
    }, 800);
};

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

fetchProducts("food", 1);
