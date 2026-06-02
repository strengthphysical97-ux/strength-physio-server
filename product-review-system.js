document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('product-review-area');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    container.innerHTML = `
        <div style="display:flex; gap:20px; border-bottom:2px solid #ddd; margin-bottom:20px;">
            <button id="tab-desc" style="padding:10px; cursor:pointer; background:none; border:none; font-weight:bold;">Description</button>
            <button id="tab-rev" style="padding:10px; cursor:pointer; background:none; border:none; font-weight:bold;">Reviews</button>
        </div>

        <div id="content-desc" style="display:none;">
            <h3>Product Description</h3>
            <p id="desc-content">Loading description...</p>
        </div>

        <div id="content-rev" style="display:none;">
            <h3>Customer Reviews</h3>
            <div id="p-reviews-list"></div>
            <button id="show-more-btn" style="display:none; margin: 10px 0; padding:5px 10px; cursor:pointer;">Show More Reviews</button>
            <br>
            <button id="toggle-p-form" style="padding:10px; margin-top:10px; cursor:pointer;">Write a Review</button>
            <div id="p-form" style="display:none; margin-top:15px; padding:15px; border:1px solid #ddd;">
                <input type="text" id="p-name" placeholder="Name" style="width:100%; margin-bottom:5px;"><br>
                <div id="star-rating" style="font-size:25px; cursor:pointer; color:#ffc107;">
                    <span data-value="1">☆</span><span data-value="2">☆</span>
                    <span data-value="3">☆</span><span data-value="4">☆</span><span data-value="5">☆</span>
                </div>
                <textarea id="p-msg" placeholder="Review..." style="width:100%; height:60px;"></textarea><br>
                <button id="submit-p-review" style="margin-top:10px;">Submit</button>
            </div>
        </div>
    `;

    // Fetch Description from DB (Assuming your product API returns full detail)
    function loadSameProductDescription() {

    const urlParams = new URLSearchParams(window.location.search);

    const productId = urlParams.get('id');
    const category = urlParams.get('cat');

    if (
        !window.allCategories ||
        !window.allCategories[category]
    ) {
        document.getElementById('desc-content').innerText =
            "Description unavailable.";
        return;
    }

    const currentProduct =
        window.allCategories[category].find(
            p => p.id == productId
        );

    document.getElementById('desc-content').innerText =
        currentProduct?.desc ||
        "No description found.";
}

window.addEventListener('dataReady', loadSameProductDescription);

    // --- BAKI SAB PURE WAISE HI HAIN ---
    document.getElementById('tab-desc').onclick = () => {
        const descDiv = document.getElementById('content-desc');
        descDiv.style.display = (descDiv.style.display === 'none') ? 'block' : 'none';
        document.getElementById('content-rev').style.display = 'none';
    };

    document.getElementById('tab-rev').onclick = () => {
        const revDiv = document.getElementById('content-rev');
        revDiv.style.display = (revDiv.style.display === 'none') ? 'block' : 'none';
        document.getElementById('content-desc').style.display = 'none';
    };

    document.getElementById('toggle-p-form').onclick = () => {
        const f = document.getElementById('p-form');
        f.style.display = (f.style.display === 'none') ? 'block' : 'none';
    };

    let currentStars = 0;
    const stars = document.querySelectorAll('#star-rating span');
    stars.forEach(star => {
        star.onclick = (e) => {
            currentStars = parseInt(e.target.dataset.value);
            stars.forEach((s, i) => s.innerText = i < currentStars ? '★' : '☆');
        };
    });

    document.getElementById('submit-p-review').onclick = async () => {
        await fetch('http://localhost:3000/api/product-reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, name: document.getElementById('p-name').value, rating: currentStars, message: document.getElementById('p-msg').value })
        });
        document.getElementById('p-form').style.display = 'none';
        loadProductReviews();
    };

    let allReviews = [];
    let visibleCount = 2;

    async function loadProductReviews() {
        const res = await fetch(`http://localhost:3000/api/product-reviews/${productId}`);
        allReviews = await res.json();
        renderReviews();
    }

    function renderReviews() {
        const list = document.getElementById('p-reviews-list');
        const btn = document.getElementById('show-more-btn');
        list.innerHTML = allReviews.slice(0, visibleCount).map(r => 
            `<div style="margin-bottom:10px;"><strong>${r.name}</strong> (<span style="color:#ffc107;">${'★'.repeat(r.rating)}</span>)<br>${r.message}</div><hr>`
        ).join('');
        
        if (allReviews.length > 2) {
            btn.style.display = 'block';
            btn.innerText = (visibleCount < allReviews.length) ? 'Show More Reviews' : 'Show Less Reviews';
        }
    }

    document.getElementById('show-more-btn').onclick = () => {
        visibleCount = (visibleCount < allReviews.length) ? visibleCount + 2 : 2;
        renderReviews();
    };
    
    loadProductReviews();
});