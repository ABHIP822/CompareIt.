Let page = 1;
let currentQuery = "food";
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');
const compareSection = document.getElementById('compare-section');
const detailsArea = document.getElementById('full-details-area');

/**
 * 1. ലോഡിങ് സമയത്ത് കാണിക്കേണ്ട ഷിമ്മർ ആനിമേഷൻ
 */
const showShimmer = () => {
    loadingIndicator.innerHTML = ""; 
    loadingIndicator.classList.remove('hidden');
    
    for (let i = 0; i < 4; i++) {
        const shimmerCard = document.createElement('div');
        shimmerCard.className = 'shimmer-card'; 
        shimmerCard.innerHTML = `
            <div class="shimmer-img pulse"></div>
            <div class="shimmer-line pulse"></div>
            <div class="shimmer-line short pulse"></div>
        `;
        loadingIndicator.appendChild(shimmerCard);
    }
};

const hideShimmer = () => {
    loadingIndicator.classList.add('hidden');
};

// API Fetching
const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;
    showShimmer();

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'CompareItApp/1.0' } });
        const data = await response.json();
        displayProducts(data.products || [], pageNum === 1);
    } catch (e) {
        console.error("Error fetching products:", e);
    } finally {
        isLoading = false;
        hideShimmer();
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

        const indicator = card.querySelector('.select-indicator');
        indicator.onclick = (e) => {
            e.stopPropagation(); 
            toggleSelect(product, card);
        };

        card.onclick = () => showSingleProductDetails(product);

        productList.appendChild(card);
    });
};

// സിംഗിൾ പ്രോഡക്റ്റ് ഡീറ്റെയിൽസ് (Image -> Name -> Guide -> All OpenFood Details)
const showSingleProductDetails = (p) => {
    compareSection.classList.remove('hidden');
    document.getElementById('compare-vs').style.display = 'none';
    document.getElementById('compare2').style.display = 'none';
    
    document.getElementById('compare1').innerHTML = `
        <img src="${p.image_front_small_url || ''}" style="width:130px; height:130px; object-fit:contain; border-radius:10px;">
        <h2 style="margin:10px 0; color:#333;">${p.product_name}</h2>
    `;

    detailsArea.innerHTML = `
        <div style="padding:15px; text-align:left; border-top:1px solid #eee;">
            <div style="margin-bottom:12px;">
                <span style="color:#666; font-weight:bold;">Grade:</span> 
                <span style="font-size:22px; font-weight:900; color:#2e7d32; text-transform:uppercase; margin-left:10px;">${p.nutrition_grades || 'N/A'}</span>
            </div>
            <div style="margin-bottom:12px;">
                <span style="color:#666; font-weight:bold;">Company / Brand:</span> 
                <p style="font-size:16px; margin:5px 0; color:#444;">${p.brands || 'Not Specified'}</p>
            </div>
            <div style="margin-bottom:12px;">
                <span style="color:#666; font-weight:bold;">Ingredients:</span>
                <p style="font-size:14px; color:#555; line-height:1.5; margin-top:8px;">${p.ingredients_text || 'No data available.'}</p>
            </div>
            <div style="background:#f0f4f7; padding:12px; border-radius:8px; margin-top:15px;">
                <h4 style="margin-top:0;">Nutritional Info (per 100g)</h4>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Energy:</span> <b>${p.nutriments?.energy_100g || 0} kcal</b></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Sugar:</span> <b>${p.nutriments?.sugars_100g || 0} g</b></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Fat:</span> <b>${p.nutriments?.fat_100g || 0} g</b></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Proteins:</span> <b>${p.nutriments?.proteins_100g || 0} g</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Salt:</span> <b>${p.nutriments?.salt_100g || 0} g</b></div>
            </div>
        </div>
    `;
};

// Comparison logic (2 products)
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
        
        document.getElementById('compare1').innerHTML = `
            <img src="${p1.image_front_small_url || ''}">
            <p style="font-weight:bold; font-size:12px;">${p1.product_name}</p>
            <div style="font-size:18px; color:green; font-weight:bold;">${p1.nutrition_grades?.toUpperCase() || 'N/A'}</div>
        `;
        document.getElementById('compare2').innerHTML = `
            <img src="${p2.image_front_small_url || ''}">
            <p style="font-weight:bold; font-size:12px;">${p2.product_name}</p>
            <div style="font-size:18px; color:green; font-weight:bold;">${p2.nutrition_grades?.toUpperCase() || 'N/A'}</div>
        `;
        
        detailsArea.innerHTML = generateCompareTable(p1, p2);
    } else {
        compareSection.classList.add('hidden');
    }
};

// കംപാരിസണിലും എല്ലാ ഡീറ്റെയിൽസും വരാനുള്ള ഫംഗ്ഷൻ
const generateCompareTable = (p1, p2) => {
    return `
        <div class="detail-row" style="background:#f9f9f9; padding:10px; border-bottom:1px solid #ddd;">
            <div class="detail-col"><b>Brand:</b> ${p1.brands || 'N/A'}</div>
            <div class="detail-col"><b>Brand:</b> ${p2.brands || 'N/A'}</div>
        </div>
        <div class="detail-row" style="padding:10px; border-bottom:1px solid #ddd;">
            <div class="detail-col"><b>Ingredients:</b> <small>${p1.ingredients_text || 'N/A'}</small></div>
            <div class="detail-col"><b>Ingredients:</b> <small>${p2.ingredients_text || 'N/A'}</small></div>
        </div>
        <div class="detail-row" style="background:#eef2f3; padding:10px;">
            <div class="detail-col">
                <b>Nutriments:</b><br>
                Energy: ${p1.nutriments?.energy_100g || 0} kcal<br>
                Sugar: ${p1.nutriments?.sugars_100g || 0}g<br>
                Fat: ${p1.nutriments?.fat_100g || 0}g
            </div>
            <div class="detail-col">
                <b>Nutriments:</b><br>
                Energy: ${p2.nutriments?.energy_100g || 0} kcal<br>
                Sugar: ${p2.nutriments?.sugars_100g || 0}g<br>
                Fat: ${p2.nutriments?.fat_100g || 0}g
            </div>
        </div>
    `;
};

// Search Timer
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

// Close Modal
document.getElementById('close-compare').onclick = () => {
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    compareSection.classList.add('hidden');
};

// Initial Load
fetchProducts("food", 1);
