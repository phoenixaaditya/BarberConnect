document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Get Logged-in Customer and Booking Info ---
    const customerToken = localStorage.getItem('userToken');
    const bookingDetailsString = sessionStorage.getItem('bookingDetails');

    // --- 2. Security & Data Checks ---
    if (!customerToken) {
        alert('You must be logged in to book an appointment.');
        window.location.href = 'auth.html';
        return;
    }
    if (!bookingDetailsString) {
        alert('Booking details not found. Please select services first.');
        window.location.href = 'dashboard.html';
        return;
    }

    // --- 3. Parse Data and Get Element References ---
    const bookingDetails = JSON.parse(bookingDetailsString);
    const summaryCard = document.querySelector('.booking-summary-card');
    const dateSlots = document.querySelectorAll('.date-slot');
    const timeSlots = document.querySelectorAll('.time-slot:not(:disabled)');
    const confirmButton = document.getElementById('confirm-booking-btn');
    
    let selectedDate = "2025-09-24"; // Default value
    let selectedTime = null;

    // --- 4. Populate the Summary Card with Real Data ---
    function populateSummary() {
        summaryCard.querySelector('.summary-shop-details h4').textContent = bookingDetails.barberName;
        summaryCard.querySelector('.summary-shop-details p').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${bookingDetails.barberAddress}`;
        
        // In a real app, you'd fetch service names from their IDs, but for now we'll just show the total
        const servicesList = summaryCard.querySelector('.summary-services-list');
        servicesList.innerHTML = `<div class="summary-service-item"><span>Total for ${bookingDetails.serviceIds.length} service(s)</span></div>`;
        
        summaryCard.querySelector('.summary-total span:last-child').textContent = `₹${bookingDetails.totalPrice}`;
    }
    
    // --- 5. Date and Time Selection Logic (no changes) ---
    const todaySlot = document.querySelector('.date-slot[data-date="2025-09-24"]');
    if (todaySlot) {
        todaySlot.classList.add('active');
    }
    dateSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            dateSlots.forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
            selectedDate = slot.dataset.date;
        });
    });
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
            selectedTime = slot.textContent.trim();
            confirmButton.disabled = false;
        });
    });

    // --- 6. Handle Final Booking Confirmation ---
    confirmButton.addEventListener('click', async () => {
        if (confirmButton.disabled) return;

        // Combine selected date and time into a proper Date object
        const finalDateTime = new Date(`${selectedDate}T${convertTimeTo24Hour(selectedTime)}`);

        // Prepare the final appointment data object to send to the backend
        const appointmentData = {
            barber: bookingDetails.barberId,
            services: bookingDetails.serviceIds,
            dateTime: finalDateTime,
            totalPrice: bookingDetails.totalPrice,

            totalDuration: bookingDetails.totalDuration
        };

        try {
            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${customerToken}`
                },
                body: JSON.stringify(appointmentData)
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Could not book appointment.');
            }

            // Clean up session storage after successful booking
            sessionStorage.removeItem('bookingDetails');

            alert('Booking Confirmed! Your appointment has been scheduled.');
            window.location.href = 'dashboard.html';

        } catch (error) {
            alert(`Booking Failed: ${error.message}`);
        }
    });

    // Helper function to convert "10:30 AM" to "10:30:00"
    function convertTimeTo24Hour(time) {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        return `${hours}:${minutes}:00`;
    }

    // --- Initialize Page ---
    populateSummary();
});

