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

// 1. പഴയ കോഡിലുണ്ടായിരുന്ന ഷിമ്മർ ആനിമേഷൻ ഫങ്ക്ഷൻ
const showShimmer = () => {
    loadingIndicator.innerHTML = ""; // പഴയ കണ്ടന്റ് കളയുന്നു
    for (let i = 0; i < 4; i++) {
        const shimmerCard = document.createElement('div');
        shimmerCard.className = 'shimmer-card'; // നിങ്ങളുടെ CSS-ലെ അതേ ക്ലാസ്സ്
        shimmerCard.innerHTML = `
            <div class="shimmer-img"></div>
            <div class="shimmer-line"></div>
            <div class="shimmer-line short"></div>
        `;
        loadingIndicator.appendChild(shimmerCard);
    }
    loadingIndicator.classList.remove('hidden');
};

const hideShimmer = () => {
    loadingIndicator.classList.add('hidden');
};

// API Fetching
const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;
    showShimmer(); // ലോഡിംഗ് സമയത്ത് ആനിമേഷൻ കാണിക്കുന്നു

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'CompareItApp/1.0' } });
        const data = await response.json();
        displayProducts(data.products || [], pageNum === 1);
    } catch (e) {
        console.error("Fetch error:", e);
    } finally {
        isLoading = false;
        hideShimmer(); // ലോഡിംഗ് കഴിഞ്ഞാൽ ആനിമേഷൻ മറയ്ക്കുന്നു
    }
};

// ലിസ്റ്റിൽ പ്രോഡക്റ്റുകൾ കാണിക്കുന്നു
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
                <h4 style="font-size:11px; margin:5px 0;">${product.product_name}</h4>
                <div class="grade-badge">${product.nutrition_grades || 'N/A'}</div>
            </div>
        `;

        // വലതുവശത്തെ സർക്കിളിൽ (Checkbox) തൊട്ടാൽ കംപാരിസൺ
        const indicator = card.querySelector('.select-indicator');
        indicator.onclick = (e) => {
            e.stopPropagation(); 
            toggleSelect(product, card);
        };

        // കാർഡിൽ ക്ലിക്ക് ചെയ്താൽ മാത്രം ഫുൾ ഡീറ്റെയിൽസ് (നിങ്ങൾ പറഞ്ഞ ഓർഡറിൽ)
        card.onclick = () => showSingleProductDetails(product);

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
            alert("രണ്ട് പ്രോഡക്റ്റുകൾ മാത്രം കംപയർ ചെയ്യുക.");
        }
    }
    updateCompareView();
};

const updateCompareView = () => {
    if (selectedProducts.length === 2) {
        compareSection.classList.remove('hidden');
        const [p1, p2] = selectedProducts;
        document.getElementById('compare1').innerHTML = `<img src="${p1.image_front_small_url || ''}"><p><b>${p1.product_name}</b></p>`;
        document.getElementById('compare2').innerHTML = `<img src="${p2.image_front_small_url || ''}"><p><b>${p2.product_name}</b></p>`;
        detailsArea.innerHTML = generateDetailsHTML(p1, p2);
    } else {
        compareSection.classList.add('hidden');
    }
};

const showSingleProductDetails = (p) => {
    compareSection.classList.remove('hidden');
    document.getElementById('compare-vs').style.display = 'none';
    document.getElementById('compare2').style.display = 'none';
    
    document.getElementById('compare1').innerHTML = `
        <img src="${p.image_front_small_url || ''}" style="width:120px; height:120px; object-fit:contain;">
        <h2 style="margin-top:10px;">${p.product_name}</h2>
    `;

    // നിങ്ങൾ പറഞ്ഞ ഓർഡർ: Image -> Name -> Grade -> Company Name -> Full Details
    detailsArea.innerHTML = `
        <div style="padding:15px; text-align:left;">
            <div style="margin-bottom:15px;">
                <span class="detail-label">Grade:</span> 
                <span style="font-size:20px; font-weight:bold; color:green; text-transform:uppercase;">${p.nutrition_grades || 'N/A'}</span>
            </div>
            <div style="margin-bottom:15px;">
                <span class="detail-label">Company / Brand:</span> 
                <p style="font-size:16px; margin:5px 0;">${p.brands || 'Unknown Brand'}</p>
            </div>
            <hr>
            <div class="detail-label" style="margin-top:10px;">All Product Details:</div>
            <p style="font-size:14px; color:#555; line-height:1.6;">${p.ingredients_text || 'No description available for this product.'}</p>
            
            <div style="background:#f9f9f9; padding:10px; border-radius:8px; margin-top:10px;">
                <small>Energy: ${p.nutriments?.energy_100g || 'N/A'} kcal</small><br>
                <small>Fat: ${p.nutriments?.fat_100g || 'N/A'}g</small><br>
                <small>Sugar: ${p.nutriments?.sugars_100g || 'N/A'}g</small>
            </div>
        </div>
    `;
};

const generateDetailsHTML = (p1, p2) => {
    return `
        <div class="detail-row">
            <div class="detail-col"><b>Grade:</b> ${p1.nutrition_grades || 'N/A'}</div>
            <div class="detail-col"><b>Grade:</b> ${p2.nutrition_grades || 'N/A'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-col"><b>Brand:</b> ${p1.brands || 'N/A'}</div>
            <div class="detail-col"><b>Brand:</b> ${p2.brands || 'N/A'}</div>
        </div>
        <div class="detail-row" style="flex-direction:column; gap:10px;">
             <div style="width:100%; font-size:12px; color:#666;"><b>P1 Details:</b> ${p1.ingredients_text || 'N/A'}</div>
             <div style="width:100%; font-size:12px; color:#666;"><b>P2 Details:</b> ${p2.ingredients_text || 'N/A'}</div>
        </div>
    `;
};

// Search & Scroll
let timer;
searchInput.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { page = 1; currentQuery = searchInput.value || "food"; fetchProducts(currentQuery, 1); }, 800);
};

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) { page++; fetchProducts(currentQuery, page); }
});
observer.observe(scrollAnchor);

document.getElementById('close-compare').onclick = () => {
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    compareSection.classList.add('hidden');
    document.getElementById('compare-vs').style.display = 'block';
    document.getElementById('compare2').style.display = 'block';
};

fetchProducts("food", 1);
