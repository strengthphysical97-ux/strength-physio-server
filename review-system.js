document.addEventListener("DOMContentLoaded", () => {
    // 1. Function jo pure structure ko create aur inject karega
    function initReviewSystem() {
        if (document.getElementById('dynamic-review-track')) return; // Duplicate injection rokne ke liye

        const reviewWrapper = document.createElement('section');
        reviewWrapper.className = "review-section";
        reviewWrapper.innerHTML = `
            <div class="container">
                <h2 class="section-heading">What Our Clients Say</h2>
                <div class="heading-underline"></div>
                
                <button id="toggle-review-btn" style="display:block; margin: 10px auto; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Write a Review</button>

                <div id="review-form-container" style="display:none; max-width: 400px; margin: 20px auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                    <input type="text" id="r-name" placeholder="Your Name" style="width:100%; margin-bottom:10px; padding:8px;">
                    <select id="r-rating" style="width:100%; margin-bottom:10px; padding:8px;">
                        <option value="5">⭐⭐⭐⭐⭐</option>
                        <option value="4">⭐⭐⭐⭐</option>
                        <option value="3">⭐⭐⭐</option>
                    </select>
                    <textarea id="r-msg" placeholder="Your experience" style="width:100%; margin-bottom:10px; padding:8px;"></textarea>
                    <button id="submit-review-btn" style="width:100%; padding:10px; background:green; color:white; border:none; cursor:pointer;">Submit</button>
                </div>

                <div class="review-viewport">
                    <div class="review-track" id="dynamic-review-track"></div>
                </div>
            </div>
        `;

        const reviewContainer = document.getElementById("customer-reviews-section");

        if (reviewContainer) {
            reviewContainer.appendChild(reviewWrapper);
        }

        // 2. Event Listeners (Form Logic)
        document.getElementById('toggle-review-btn').addEventListener('click', () => {
            const form = document.getElementById('review-form-container');
            form.style.display = (form.style.display === 'none') ? 'block' : 'none';
        });

        document.getElementById('submit-review-btn').addEventListener('click', async () => {
            const name = document.getElementById('r-name').value;
            const rating = document.getElementById('r-rating').value;
            const message = document.getElementById('r-msg').value;

            if (!name || !message) return;

            await fetch('http://localhost:3000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, rating, message })
            });

            document.getElementById('r-name').value = '';
            document.getElementById('r-msg').value = '';
            document.getElementById('review-form-container').style.display = 'none';

            loadReviews();
        });
    }

    // 3. Reviews Fetch Logic
    async function loadReviews() {
        const track = document.getElementById('dynamic-review-track');
        if (!track) return;

        try {
            const res = await fetch('http://localhost:3000/api/reviews');
            const reviews = await res.json();
            track.innerHTML = reviews.map(r => `
                <div class="review-card">
                    <h4>- ${r.name}</h4>
                    <div class="stars">${'★'.repeat(r.rating)}</div>
                    <p>"${r.message}"</p>
                </div>
            `).join('');
        } catch (e) {
            console.log("Reviews load nahi ho paaye, server check karo.");
        }
    }

    // Initialization
    initReviewSystem();
    loadReviews();
});