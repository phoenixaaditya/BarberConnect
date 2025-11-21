document.addEventListener('DOMContentLoaded', () => {
    // Get the container where we will display the barber cards
    const resultsGrid = document.querySelector('.results-grid');
    const resultsHeader = document.querySelector('.results-header h2');

    // Function to fetch and display the approved barbers
    const fetchApprovedBarbers = async () => {
        try {
            // 1. Call our new public API endpoint
            const response = await fetch('http://localhost:5000/api/barbers');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Could not fetch barbers.');
            }

            // 2. Clear the old placeholder cards from the HTML
            resultsGrid.innerHTML = '';
            
            // Update the header text
            resultsHeader.textContent = `Showing ${data.barbers.length} Shops in Pune`;

            if (data.barbers.length === 0) {
                resultsGrid.innerHTML = '<p>No approved barber shops found at the moment. Please check back later!</p>';
                return;
            }

            // 3. Loop through the barbers from the database and create a new card for each one
            data.barbers.forEach(barber => {
                const barberCard = document.createElement('div');
                barberCard.className = 'barber-card';

                // Determine the correct class and text for the shop category tag
                let cardTypeClass = '';
                let cardTypeText = '';
                if (barber.shopCategory === 'barbershop') {
                    cardTypeClass = 'barber';
                    cardTypeText = 'Barber Shop';
                } else if (barber.shopCategory === 'salon') {
                    cardTypeClass = 'salon';
                    cardTypeText = 'Salon';
                } else {
                    cardTypeClass = 'unisex'; // You can add a style for this if you like
                    cardTypeText = 'Unisex Salon';
                }

                // Create the HTML for the card using the data from the database
                barberCard.innerHTML = `
                    <div class="card-image">
                        <img src="https://images.unsplash.com/photo-1536520002442-9979a8413220?q=80&w=2070" alt="Barber Shop Interior">
                        <span class="card-rating"><i class="fas fa-star"></i> 4.9</span> <!-- Static for now -->
                    </div>
                    <div class="card-content">
                        <span class="card-type ${cardTypeClass}">${cardTypeText}</span>
                        <h3>${barber.shopName}</h3>
                        <p class="card-location"><i class="fas fa-map-marker-alt"></i> ${barber.shopAddress}</p>
                        <div class="card-services">
                            <!-- We will populate this from the barber's services later -->
                            <span>Haircut</span>
                            <span>Beard Trim</span>
                        </div>
                        <p class="card-status open">Open Now</p> <!-- Static for now -->
                        
                        <!-- IMPORTANT: We add the barber's unique ID to the link -->
                        <a href="shop-profile.html?id=${barber._id}" class="btn btn-secondary">View & Book</a>
                    </div>
                `;
                
                // Add the newly created card to the grid
                resultsGrid.appendChild(barberCard);
            });

        } catch (error) {
            console.error('Error fetching barbers:', error);
            resultsGrid.innerHTML = '<p>There was an error loading shops. Please try again later.</p>';
        }
    };

    // Run the function when the page loads
    fetchApprovedBarbers();
});
