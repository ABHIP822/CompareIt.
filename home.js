let page = 1;
let currentQuery = "food";
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');
const compareSection = document.getElementById('compare-section');
const detailsArea = document.getElementById('full-details-area');

// 1. ലോഡിങ് സമയത്ത് ഷിമ്മർ ആനിമേഷൻ കാണിക്കുന്നു
const showShimmer = () => {
    loadingIndicator.classList.remove('hidden');
    loadingIndicator.style.display = "grid"; 
    loadingIndicator.innerHTML = ""; 

    // 8 ഷിമ്മർ കാർഡുകൾ ആനിമേഷനായി ഉണ്ടാക്കുന്നു
    for (let i = 0; i < 8; i++) { 
        const shimmerCard = document.createElement('div');
        shimmerCard.className = 'shimmer-card'; 
        shimmerCard.innerHTML = `
            <div class="shimmer-img pulse" style="background: #eee; height: 100px; margin-bottom: 10px; border-radius: 8px;"></div>
            <div class="shimmer-line pulse" style="background: #eee; height: 15px; width: 80%; margin-bottom: 8px; border-radius: 4px;"></div>
            <div class="shimmer-line short pulse" style="background: #eee; height: 15px; width: 50%; border-radius: 4px;"></div>
        `;
        loadingIndicator.appendChild(shimmerCard);
    }
};

const hideShimmer = () => {
    loadingIndicator.classList.add('hidden');
    loadingIndicator.style.display = "none";
};

// API-ൽ നിന്ന് വിവരങ്ങൾ എടുക്കുന്നു
const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;

    // ഡാറ്റ വരുന്നതിന് മുൻപ് ആനിമേഷൻ കാണിക്കാൻ
    showShimmer(); 

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'CompareItApp/1.0' } });
        const data = await response.json();

        // ഡാറ്റ വന്നുകഴിഞ്ഞാൽ ആനിമേഷൻ മാറ്റുക
        hideShimmer();
        displayProducts(data.products || [], pageNum === 1);
    } catch (e) {
        console.error("API Error:", e);
        hideShimmer();
    } finally {
        isLoading = false;
    }
};

// പ്രോഡക്റ്റുകൾ സ്ക്രീനിൽ കാണിക്കുന്നു
const displayProducts = (products, isNew) => {
    if (isNew) productList.innerHTML = "";

    products.forEach(product => {
        if (!product.product_name) return;

        const card = document.createElement('div');
        card.className = 'product-card';
        if(selectedProducts.find(p => p._id === product._id)) card.classList.add('selected');

        card.innerHTML = `
            <div class="select-indicator" id="check-${product._id}"></div>
            <div class="card-content">
                <img src="${product.image_front_small_url || 'https://via.placeholder.com/150?text=No+Image'}" alt="">
                <h4 style="font-size:11px; margin:5px 0; color:#333;">${product.product_name}</h4>
                <div class="grade-badge">${product.nutrition_grades || 'N/A'}</div>
            </div>
        `;

        const indicator = card.querySelector('.select-indicator');
        indicator.onclick = (e) => {
            e.stopPropagation(); 
            toggleSelect(product, card);
        };

        card.onclick = () => showSingleProductDetails(product);
        productList.appendChild(card);
    });
};

const showSingleProductDetails = (p) => {
    compareSection.classList.remove('hidden');
    document.getElementById('compare-vs').style.display = 'none';
    document.getElementById('compare2').style.display = 'none';

    document.getElementById('compare1').innerHTML = `
        <img src="${p.image_front_small_url || ''}" style="width:130px; height:130px; object-fit:contain; border-radius:10px;">
        <h2 style="margin:10px 0; font-size:18px;">${p.product_name}</h2>
    `;

    detailsArea.innerHTML = `
        <div style="padding:15px; text-align:left; border-top:1px solid #eee;">
            <div style="margin-bottom:12px;">
                <span style="color:#666; font-weight:bold;">Grade:</span> 
                <span style="font-size:22px; font-weight:900; color:#d32f2f; text-transform:uppercase; margin-left:10px;">${p.nutrition_grades || 'N/A'}</span>
            </div>
            <div style="margin-bottom:12px;">
                <span style="color:#666; font-weight:bold;">Company / Brand:</span> 
                <p style="font-size:16px; margin:5px 0; color:#222;">${p.brands || 'Not Specified'}</p>
            </div>
            <hr>
            <div style="margin-top:15px;">
                <span style="color:#666; font-weight:bold;">All Packaging Details:</span>
                <p style="font-size:14px; color:#444; line-height:1.6; margin-top:8px;">${p.ingredients_text || 'No description available for this product.'}</p>
            </div>
            <div style="background:#f8f9fa; padding:12px; border-radius:8px; margin-top:15px; font-size:12px;">
                <b>Nutriments (per 100g):</b><br>
                Energy: ${p.nutriments?.energy_100g || 0} kcal | 
                Sugar: ${p.nutriments?.sugars_100g || 0} g | 
                Fat: ${p.nutriments?.fat_100g || 0} g
            </div>
        </div>
    `;
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
            alert("രണ്ട് പ്രോഡക്റ്റുകൾ മാത്രം കംപയർ ചെയ്യുക.");
        }
    }
    updateCompareView();
};

const updateCompareView = () => {
    if (selectedProducts.length === 2) {
        compareSection.classList.remove('hidden');
        document.getElementById('compare-vs').style.display = 'block';
        document.getElementById('compare2').style.display = 'block';
        const [p1, p2] = selectedProducts;
        document.getElementById('compare1').innerHTML = `<img src="${p1.image_front_small_url || ''}"><p>${p1.product_name}</p>`;
        document.getElementById('compare2').innerHTML = `<img src="${p2.image_front_small_url || ''}"><p>${p2.product_name}</p>`;

        detailsArea.innerHTML = `
            <div class="detail-row">
                <div class="detail-col"><b>Grade:</b> ${p1.nutrition_grades || 'N/A'}</div>
                <div class="detail-col"><b>Grade:</b> ${p2.nutrition_grades || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-col"><b>Brand:</b> ${p1.brands || 'N/A'}</div>
                <div class="detail-col"><b>Brand:</b> ${p2.brands || 'N/A'}</div>
            </div>
        `;
    } else {
        compareSection.classList.add('hidden');
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
    compareSection.classList.add('hidden');
};

fetchProducts("food", 1);