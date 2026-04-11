let selectedItems = [];
const productList = document.getElementById('product-list');

async function loadProducts() {
    // Open Food Facts API Example
    const res = await fetch('https://world.openfoodfacts.org/cgi/search.pl?search_terms=food&json=1&page_size=10');
    const data = await res.json();
    displayProducts(data.products);
}

function displayProducts(products) {
    productList.innerHTML = products.map(p => `
        <div class="product-card" id="card-${p._id}">
            <div class="select-dot" onclick="event.stopPropagation(); toggleSelect('${p._id}', ${JSON.stringify(p).replace(/"/g, '&quot;')})"></div>
            <div onclick="openDetails(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <img src="${p.image_front_url || ''}">
                <h4>${p.product_name || 'Product'}</h4>
                <p style="color:var(--primary); font-weight:bold;">Grade: ${p.nutrition_grades?.toUpperCase() || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

function openDetails(p) {
    const body = document.getElementById('details-body');
    body.innerHTML = `
        <img src="${p.image_front_url}" style="width:100%; border-radius:15px;">
        <h2>${p.product_name}</h2>
        <p><strong>Description:</strong> ${p.generic_name || 'No description available.'}</p>
        <p><strong>Malayalam:</strong> വിവരം ലഭ്യമല്ല (Malayalam translation can be added via translation API)</p>
        <hr>
        <p>Data provided by <a href="https://world.openfoodfacts.org/product/${p._id}" target="_blank">Open Food Facts</a></p>
    `;
    document.getElementById('details-overlay').classList.remove('hidden');
}

function toggleSelect(id, p) {
    const card = document.getElementById(`card-${id}`);
    const index = selectedItems.findIndex(item => item._id === id);

    if (index > -1) {
        selectedItems.splice(index, 1);
        card.classList.remove('selected');
    } else if (selectedItems.length < 2) {
        selectedItems.push(p);
        card.classList.add('selected');
    }

    const btn = document.getElementById('compare-main-btn');
    btn.classList.toggle('hidden', selectedItems.length < 2);
    btn.innerText = `Compare ${selectedItems.length} Products`;
}

document.getElementById('compare-main-btn').onclick = () => {
    const table = document.getElementById('compare-table');
    const [p1, p2] = selectedItems;

    table.innerHTML = `
        <tr><th class="feature-col">Feature</th><th>${p1.product_name}</th><th>${p2.product_name}</th></tr>
        <tr><td class="feature-col">Image</td><td><img src="${p1.image_front_small_url}" width="50"></td><td><img src="${p2.image_front_small_url}" width="50"></td></tr>
        <tr><td class="feature-col">Grade</td><td>${p1.nutrition_grades?.toUpperCase()}</td><td>${p2.nutrition_grades?.toUpperCase()}</td></tr>
        <tr><td class="feature-col">Ingredients</td><td>${p1.ingredients_text?.substring(0,50)}...</td><td>${p2.ingredients_text?.substring(0,50)}...</td></tr>
    `;
    document.getElementById('compare-overlay').classList.remove('hidden');
};

function closeOverlay(id) { document.getElementById(id).classList.add('hidden'); }

loadProducts();
