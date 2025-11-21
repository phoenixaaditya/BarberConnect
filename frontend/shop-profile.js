document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get the barber's ID from the URL
    const params = new URLSearchParams(window.location.search);
    const barberId = params.get('id');

    if (!barberId) {
        document.body.innerHTML = '<h1>Barber not found. Please select a shop from the dashboard.</h1>';
        return;
    }

    // 2. Fetch the specific barber's profile data from the backend
    try {
        const response = await fetch(`http://localhost:5000/api/barbers/${barberId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        const { barber, services } = data;

        // 3. Populate the page with the fetched data
        document.querySelector('.shop-info-header h1').textContent = barber.shopName;
        document.querySelector('.shop-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${barber.shopAddress}`;
        document.title = `${barber.shopName} - BarberConnect`;

        const servicesContainer = document.querySelector('.services-column');
        servicesContainer.innerHTML = '<h2>Our Services</h2>';

        if (services.length === 0) {
            servicesContainer.innerHTML += '<p>This shop has not listed any services yet.</p>';
        } else {
            const serviceListHtml = services.map(service => `
                <div class="service-item" data-id="${service._id}" data-name="${service.name}" data-price="${service.price}" data-duration="${service.duration}">
                    <div class="service-details">
                        <h4>${service.name}</h4>
                        <p>₹${service.price} • ${service.duration} min</p>
                    </div>
                    <button class="btn btn-add">Book</button>
                </div>
            `).join('');
            
            servicesContainer.innerHTML += `<div class="service-list-container">${serviceListHtml}</div>`;
        }
        
        // After populating, attach the booking widget logic, passing the barber info
        initializeBookingWidget(barber, services);

    } catch (error) {
        console.error('Failed to load shop profile:', error);
        document.body.innerHTML = `<h1>Error: ${error.message}</h1><a href="dashboard.html">Go Back</a>`;
    }
});

// MODIFIED: This function now accepts barber and services data
function initializeBookingWidget(barber, allServices) {
    const addServiceButtons = document.querySelectorAll('.btn-add');
    const selectedServicesList = document.getElementById('selected-services-list');
    const totalPriceEl = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-btn');
    
    let selectedServiceIds = [];

    addServiceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceItem = this.closest('.service-item');
            const serviceId = serviceItem.dataset.id;
            
            selectedServiceIds.push(serviceId);
            updateBookingSummary();
            
            this.textContent = 'Added';
            this.classList.add('added');
            this.disabled = true;
        });
    });

    function updateBookingSummary() {
        selectedServicesList.innerHTML = '';
        if (selectedServiceIds.length === 0) {
            selectedServicesList.innerHTML = '<p class="empty-cart">Select services to begin booking.</p>';
            checkoutButton.disabled = true;
        } else {
            let totalPrice = 0;
            let totalDuration = 0;
            
            selectedServiceIds.forEach(id => {
                const service = allServices.find(s => s._id === id);
                if(service) {
                    const li = document.createElement('div');
                    li.className = 'selected-service';
                    li.innerHTML = `<span>${service.name}</span> <span>₹${service.price}</span>`;
                    selectedServicesList.appendChild(li);
                    totalPrice += service.price;
                    totalDuration += service.duration;
                }
            });

            totalPriceEl.textContent = `₹${totalPrice}`;
            checkoutButton.disabled = false;

            // Store the calculated details for the next page
            sessionStorage.setItem('bookingDetails', JSON.stringify({
                barberId: barber._id,
                barberName: barber.shopName,
                barberAddress: barber.shopAddress,
                serviceIds: selectedServiceIds,
                totalPrice: totalPrice,
                totalDuration: totalDuration
            }));
        }
    }

    // This click listener now just handles the redirect
    checkoutButton.addEventListener('click', () => {
        if (!checkoutButton.disabled) {
            window.location.href = 'checkout.html';
        }
    });
}

