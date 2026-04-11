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

// API-ൽ നിന്ന് പ്രോഡക്റ്റ് എടുക്കുന്ന ഫങ്ക്ഷൻ
const fetchProducts = async (query, pageNum) => {
    if (isLoading) return;
    isLoading = true;
    loadingIndicator.classList.remove('hidden');

    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=20&json=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'CompareItApp/1.0' } });
        const data = await response.json();
        displayProducts(data.products || [], pageNum === 1);
    } catch (e) { 
        console.error("Fetch error:", e); 
    } finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
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
            </div>
        `;

        // വലതുവശത്തെ സർക്കിളിൽ (Checkbox) തൊട്ടാൽ കംപാരിസൺ
        const indicator = card.querySelector('.select-indicator');
        indicator.onclick = (e) => {
            e.stopPropagation(); // കാർഡ് ക്ലിക്കിനെ തടയാൻ
            toggleSelect(product, card);
        };

        // ഇമേജിലോ പേരിലോ (Card) തൊട്ടാൽ സിംഗിൾ പ്രോഡക്റ്റ് ഡീറ്റെയിൽസ്
        card.onclick = () => showSingleProductDetails(product);

        productList.appendChild(card);
    });
};

// കംപാരിസൺ സെലക്ഷൻ മാനേജ് ചെയ്യുന്നു
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
    updateCompareView();
};

// കംപാരിസൺ വ്യൂ അപ്ഡേറ്റ് ചെയ്യുന്നു
const updateCompareView = () => {
    if (selectedProducts.length === 2) {
        compareSection.classList.remove('hidden');
        const [p1, p2] = selectedProducts;

        document.getElementById('compare1').innerHTML = `<img src="${p1.image_front_small_url || ''}"><p><b>${p1.product_name.substring(0,15)}</b></p>`;
        document.getElementById('compare2').innerHTML = `<img src="${p2.image_front_small_url || ''}"><p><b>${p2.product_name.substring(0,15)}</b></p>`;

        detailsArea.innerHTML = generateDetailsHTML(p1, p2);
    } else {
        compareSection.classList.add('hidden');
    }
};

// ഒരു പ്രോഡക്റ്റ് മാത്രം തൊടുമ്പോൾ ഡീറ്റെയിൽസ് കാണിക്കുന്നു
const showSingleProductDetails = (p) => {
    compareSection.classList.remove('hidden');
    // സിംഗിൾ വ്യൂ ആയതുകൊണ്ട് VS ഹൈഡ് ചെയ്യുന്നു
    document.getElementById('compare-vs').style.display = 'none';
    document.getElementById('compare2').style.display = 'none';
    
    document.getElementById('compare1').innerHTML = `
        <img src="${p.image_front_small_url || ''}" style="width:100px; height:100px;">
        <h3>${p.product_name}</h3>
    `;

    detailsArea.innerHTML = `
        <div style="padding:10px;">
            <div class="detail-label">Grade:</div>
            <div style="font-size:24px; font-weight:bold; color:#0097a7; text-transform:uppercase;">${p.nutrition_grades || 'N/A'}</div>
            
            <div class="detail-label" style="margin-top:10px;">Brand:</div>
            <p>${p.brands || 'N/A'}</p>
            
            <div class="detail-label">Description / Ingredients:</div>
            <p style="font-size:13px; line-height:1.4;">${p.ingredients_text || 'No description available.'}</p>
            
            <div class="detail-label">Full Technical Details:</div>
            <pre style="font-size:11px; background:#eee; padding:10px; overflow-x:auto; white-space: pre-wrap;">
                Energy: ${p.nutriments?.energy_100g || 'N/A'} kcal
                Sugar: ${p.nutriments?.sugars_100g || 'N/A'}g
                Fat: ${p.nutriments?.fat_100g || 'N/A'}g
                Proteins: ${p.nutriments?.proteins_100g || 'N/A'}g
                Salt: ${p.nutriments?.salt_100g || 'N/A'}g
            </pre>
            <a href="https://world.openfoodfacts.org/product/${p._id}" target="_blank" class="off-link">View on Open Food Facts website</a>
        </div>
    `;
};

// കംപാരിസൺ ഡീറ്റെയിൽസ് HTML നിർമ്മിക്കുന്നു
const generateDetailsHTML = (p1, p2) => {
    return `
        <div class="detail-row">
            <div class="detail-col">
                <div class="detail-label">Grade:</div>
                <b style="text-transform:uppercase; font-size:18px;">${p1.nutrition_grades || 'N/A'}</b>
            </div>
            <div class="detail-col">
                <div class="detail-label">Grade:</div>
                <b style="text-transform:uppercase; font-size:18px;">${p2.nutrition_grades || 'N/A'}</b>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-col"><div class="detail-label">Brand:</div> ${p1.brands || 'N/A'}</div>
            <div class="detail-col"><div class="detail-label">Brand:</div> ${p2.brands || 'N/A'}</div>
        </div>
        <div class="detail-row" style="flex-direction: column;">
            <div class="detail-label">Product 1 Details:</div>
            <p style="font-size:12px;">${p1.ingredients_text || 'No description'}</p>
            <div class="detail-label">Product 2 Details:</div>
            <p style="font-size:12px;">${p2.ingredients_text || 'No description'}</p>
        </div>
        <div class="detail-row">
            <div class="detail-col"><b>Sugar:</b> ${p1.nutriments?.sugars_100g || 0}g</div>
            <div class="detail-col"><b>Sugar:</b> ${p2.nutriments?.sugars_100g || 0}g</div>
        </div>
    `;
};

// സെർച്ച് ബോക്സ്
let timer;
searchInput.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { 
        page = 1; 
        currentQuery = searchInput.value || "food";
        fetchProducts(currentQuery, 1); 
    }, 800);
};

// ഇൻഫിനിറ്റ് സ്ക്രോൾ
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) { 
        page++; 
        fetchProducts(currentQuery, page); 
    }
});
observer.observe(scrollAnchor);

// ക്ലോസ് ബട്ടൺ
document.getElementById('close-compare').onclick = () => {
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    compareSection.classList.add('hidden');
    // VS സെക്ഷൻ റീസെറ്റ് ചെയ്യുന്നു
    document.getElementById('compare-vs').style.display = 'block';
    document.getElementById('compare2').style.display = 'block';
};

// ആദ്യം ലോഡ് ചെയ്യുമ്പോൾ
fetchProducts("food", 1);
