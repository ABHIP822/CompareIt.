let page = 1;
let currentQuery = "food";
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
    } finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
    }
};

const displayProducts = (products, isNew) => {
    if (isNew) {
        productList.innerHTML = "";
        window.scrollTo(0,0);
    }

    products.forEach(product => {
        if (!product.product_name) return;

        const card = document.createElement('div');
        card.className = 'product-card';
        
        if (selectedProducts.find(p => p._id === product._id)) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <div class="select-indicator"></div>
            <img src="${product.image_front_small_url || 'https://via.placeholder.com/150?text=No+Image'}" alt="product">
            <h4 style="font-size:11px; margin:5px 0; height:30px; overflow:hidden;">${product.product_name}</h4>
            <p style="font-size:10px; color:gray;">${product.brands || ''}</p>
        `;
        card.onclick = () => openProductDetails(product);
        productList.appendChild(card);
    });
};

const openProductDetails = (product) => {
    let modal = document.getElementById('product-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <img id="modal-img" src="" alt="product">
                <h3 id="modal-name"></h3>
                <p><b>Grade:</b> <span id="modal-grade"></span></p>
                <p id="modal-details"></p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';
    }

    // Fill modal with product details
    document.getElementById('modal-img').src = product.image_front_small_url || '';
    document.getElementById('modal-name').innerText = product.product_name;
    document.getElementById('modal-grade').innerText = product.nutrition_grades || 'N/A';
    document.getElementById('modal-details').innerHTML = `
        <p><b>Brand:</b> ${product.brands || 'N/A'}</p>
        <p><b>Ingredients:</b> ${product.ingredients_text || 'N/A'}</p>
        <p><b>Description:</b> ${product.