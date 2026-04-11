let page = 1;
let currentQuery = "food"; // ഇത് എപ്പോഴും അപ്ഡേറ്റ് ചെയ്യപ്പെടണം
let isLoading = false;
let selectedProducts = [];

const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const scrollAnchor = document.getElementById('scroll-anchor');

// Fetch Products Function
const fetchProducts = async (query, pageNum) => {
if (isLoading) return;
isLoading = true;
loadingIndicator.classList.remove('hidden');

try {  
    // കുറച്ചുകൂടി കൃത്യമായ API URL  
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${pageNum}&page_size=24&json=1`;  
      
    const response = await fetch(url, {   
        headers: { 'User-Agent': 'CompareItApp/1.0' }   
    });  
      
    const data = await response.json();  
      
    if (data.products && data.products.length > 0) {  
        displayProducts(data.products, pageNum === 1);  
    } else if (pageNum === 1) {  
        productList.innerHTML = "<p style='text-align:center; width:100%;'>No products found.</p>";  
    }  
} catch (e) {   
    console.error("Error fetching data:", e);   
    if(pageNum === 1) productList.innerHTML = "<p style='text-align:center; width:100%;'>Error loading products.</p>";  
}  
finally {  
    isLoading = false;  
    loadingIndicator.classList.add('hidden');  
}

};

const displayProducts = (products, isNew) => {
if (isNew) {
productList.innerHTML = "";
window.scrollTo(0,0); // സെർച്ച് ചെയ്യുമ്പോൾ മുകളിലേക്ക് പോകാൻ
}

products.forEach(product => {  
    // ചിലപ്പോൾ പേര് ഉണ്ടാവില്ല, അത് ഒഴിവാക്കാൻ  
    if (!product.product_name) return;  

    const card = document.createElement('div');  
    card.className = 'product-card';  
      
    // നേരത്തെ സെലക്ട് ചെയ്തതാണെങ്കിൽ ഹൈലൈറ്റ് നിലനിർത്താൻ  
    if(selectedProducts.find(p => p._id === product._id)) {  
        card.classList.add('selected');  
    }  

    card.innerHTML = `  
        <div class="select-indicator"></div>  
        <img src="${product.image_front_small_url || 'https://via.placeholder.com/150?text=No+Image'}" alt="product">  
        <h4 style="font-size:11px; margin:5px 0; height:30px; overflow:hidden;">${product.product_name}</h4>  
        <p style="font-size:10px; color:gray;">${product.brands || ''}</p>  
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

    document.getElementById('compare1').innerHTML = `<img src="${p1.image_front_small_url || ''}"><p><b>${p1.product_name.substring(0,20)}</b></p>`;  
    document.getElementById('compare2').innerHTML = `<img src="${p2.image_front_small_url || ''}"><p><b>${p2.product_name.substring(0,20)}</b></p>`;  

    // ഡീറ്റെയിൽസ് കൃത്യമായി എടുക്കാൻ (Null checks added)  
    const getNutrient = (p, key) => p.nutriments?.[key] !== undefined ? p.nutriments[key] : 'N/A';  

    detailsArea.innerHTML = `  
        <div class="detail-row">  
            <div class="detail-col"><div class="detail-label">Brand:</div> ${p1.brands || 'N/A'}</div>  
            <div class="detail-col"><div class="detail-label">Brand:</div> ${p2.brands || 'N/A'}</div>  
        </div>  
        <div class="detail-row">  
            <div class="detail-col"><div class="detail-label">Nutrition Grade:</div> <span style="text-transform:uppercase; font-weight:bold;">${p1.nutrition_grades || 'N/A'}</span></div>  
            <div class="detail-col"><div class="detail-label">Nutrition Grade:</div> <span style="text-transform:uppercase; font-weight:bold;">${p2.nutrition_grades || 'N/A'}</span></div>  
        </div>  
        <div class="detail-row">  
            <div class="detail-col"><div class="detail-label">Sugar (100g):</div> ${getNutrient(p1, 'sugars_100g')}${p1.nutriments?.sugars_100g ? 'g' : ''}</div>  
            <div class="detail-col"><div class="detail-label">Sugar (100g):</div> ${getNutrient(p2, 'sugars_100g')}${p2.nutriments?.sugars_100g ? 'g' : ''}</div>  
        </div>  
        <div class="detail-row">  
            <div class="detail-col"><div class="detail-label">Energy:</div> ${p1.nutriments?.energy_100g || 'N/A'} kcal</div>  
            <div class="detail-col"><div class="detail-label">Energy:</div> ${p2.nutriments?.energy_100g || 'N/A'} kcal</div>  
        </div>  
        <div class="detail-row" style="flex-direction: column; gap:10px;">  
            <div>  
                <div class="detail-label">Ingredients (P1):</div>  
                <p style="font-size:11px; max-height:60px; overflow-y:auto; background:#f9f9f9; padding:5px;">${p1.ingredients_text || 'No ingredients data available'}</p>  
            </div>  
            <div>  
                <div class="detail-label">Ingredients (P2):</div>