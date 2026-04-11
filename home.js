let page = 1;
let currentQuery = "food";
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');

const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;
    loadingIndicator.classList.remove('hidden');

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'CompareItApp/1.0' } });
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

        // മുകളിലെ കാർഡുകൾ
        document.getElementById('compare1').innerHTML = `<img src="${p1.image_front_small_url || ''}"><p><b>${p1.product_name.substring(0,15)}</b></p>`;
        document.getElementById('compare2').innerHTML = `<img src="${p2.image_front_small_url || ''}"><p><b>${p2.product_name.substring(0,15)}</b></p>`;

        // ഓട്ടോമാറ്റിക്കായി ഡീറ്റെയിൽസ് താഴെ വരുന്നു
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

// Search & Scroll
let timer;
searchInput.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { page = 1; fetchProducts(searchInput.value || "food", 1); }, 800);
};

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) { page++; fetchProducts(currentQuery, page); }
});
observer.observe(scrollAnchor);

document.getElementById('close-compare').onclick = () => {
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    updateCompareSection();
};

fetchProducts("food", 1);