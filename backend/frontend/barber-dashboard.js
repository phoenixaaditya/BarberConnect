document.addEventListener('DOMContentLoaded', function() {
    // --- Get User Info and Token from localStorage ---
    const barberToken = localStorage.getItem('barberToken');
    const barberInfo = JSON.parse(localStorage.getItem('barberInfo'));

    // --- Security Check: Redirect if not logged in ---
    if (!barberToken || !barberInfo) {
        alert('You must be logged in to view this page.');
        window.location.href = 'barber-auth.html';
        return; // Stop script execution
    }

    // --- Element References ---
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const mainViews = document.querySelectorAll('.main-view');
    // Service View Elements
    const addServiceBtn = document.getElementById('add-service-btn');
    const serviceModal = document.getElementById('service-modal');
    const cancelServiceBtn = document.getElementById('cancel-service-btn');
    const serviceForm = document.getElementById('service-form');
    const servicesTableBody = document.getElementById('services-table-body');
    const modalTitle = document.getElementById('modal-title');
    // Appointment View Elements
    const appointmentDateInput = document.getElementById('appointment-date');
    const appointmentListContainer = document.getElementById('appointment-list-container');
    
    let editingServiceId = null;

    // --- Single-Page App Router Logic ---
    function switchView(targetId) {
        mainViews.forEach(view => view.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));
        document.getElementById(targetId)?.classList.add('active');
        document.querySelector(`.nav-link[data-target="${targetId}"]`)?.classList.add('active');
        
        // Fetch the appropriate data when switching to a new view
        if (targetId === 'services-view') {
            fetchAndRenderServices();
        }
        if (targetId === 'appointments-view' && appointmentDateInput) { // Check if element exists
            fetchAndRenderAppointments();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            switchView(this.dataset.target);
        });
    });

    // --- Service Management (Data-Persistent) ---
    const fetchAndRenderServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services', {
                headers: { 'Authorization': `Bearer ${barberToken}` }
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            servicesTableBody.innerHTML = ''; 
            
            if (data.services.length === 0) {
                servicesTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">You have not added any services yet.</td></tr>';
            } else {
                data.services.forEach(service => {
                    const newRow = document.createElement('tr');
                    newRow.dataset.id = service._id; 
                    newRow.innerHTML = `
                        <td>${service.name}</td>
                        <td>₹${service.price}</td>
                        <td>${service.duration} min</td>
                        <td>
                            <button class="btn-icon edit"><i class="fas fa-pen"></i></button>
                            <button class="btn-icon delete"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    servicesTableBody.appendChild(newRow);
                });
            }
        } catch (error) {
            alert(`Could not load services: ${error.message}`);
        }
    };

    function openServiceModal(row = null) {
        serviceForm.reset();
        if (row) {
            editingServiceId = row.dataset.id;
            modalTitle.textContent = 'Edit Service';
            const cells = row.children;
            document.getElementById('service-name').value = cells[0].textContent;
            document.getElementById('service-price').value = parseInt(cells[1].textContent.replace('₹', ''));
            document.getElementById('service-duration').value = parseInt(cells[2].textContent);
        } else {
            editingServiceId = null;
            modalTitle.textContent = 'Add New Service';
        }
        serviceModal.classList.remove('hidden');
    }
    
    function closeServiceModal() {
        serviceModal.classList.add('hidden');
    }

    addServiceBtn?.addEventListener('click', () => openServiceModal());
    cancelServiceBtn?.addEventListener('click', closeServiceModal);
    serviceModal?.addEventListener('click', (e) => e.target === serviceModal && closeServiceModal());

    serviceForm?.addEventListener('submit', async function(event) {
        event.preventDefault();
        const serviceName = document.getElementById('service-name').value;
        const servicePrice = document.getElementById('service-price').value;
        const serviceDuration = document.getElementById('service-duration').value;

        const url = editingServiceId 
            ? `http://localhost:5000/api/services/${editingServiceId}`
            : 'http://localhost:5000/api/services';
        const method = editingServiceId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${barberToken}`
                },
                body: JSON.stringify({ name: serviceName, price: servicePrice, duration: serviceDuration })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            closeServiceModal();
            fetchAndRenderServices(); 
        } catch (error) {
            alert(`Failed to save service: ${error.message}`);
        }
    });
    
    servicesTableBody?.addEventListener('click', async (event) => {
        const target = event.target;
        const editButton = target.closest('.edit');
        const deleteButton = target.closest('.delete');

        if (editButton) {
            openServiceModal(editButton.closest('tr'));
        }

        if (deleteButton) {
            const rowToDelete = deleteButton.closest('tr');
            const serviceId = rowToDelete.dataset.id;
            if (confirm('Are you sure you want to delete this service?')) {
                try {
                    const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${barberToken}` }
                    });
                    const data = await response.json();
                    if (!data.success) throw new Error(data.message);
                    fetchAndRenderServices();
                } catch (error) {
                    alert(`Failed to delete service: ${error.message}`);
                }
            }
        }
    });

    // --- Appointment Management Logic ---
    const fetchAndRenderAppointments = async () => {
        if (!appointmentDateInput || !appointmentListContainer) return;
        const selectedDate = appointmentDateInput.value || new Date().toISOString().split('T')[0];
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/barber?date=${selectedDate}`, {
                headers: { 'Authorization': `Bearer ${barberToken}` }
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            appointmentListContainer.innerHTML = '';
            if (data.appointments.length === 0) {
                appointmentListContainer.innerHTML = '<p class="no-appointments">No appointments scheduled for this day.</p>';
                return;
            }
            data.appointments.forEach(app => {
                const appointmentEl = document.createElement('div');
                appointmentEl.className = 'appointment-item';
                const time = new Date(app.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const servicesHtml = app.services.map(s => `<li>${s.name} (₹${s.price})</li>`).join('');
                appointmentEl.innerHTML = `
                    <div class="appointment-time">${time}</div>
                    <div class="appointment-details"><h4>${app.customer.name}</h4><ul class="service-list">${servicesHtml}</ul></div>
                    <div class="appointment-total">Total: ₹${app.totalPrice}</div>`;
                appointmentListContainer.appendChild(appointmentEl);
            });
        } catch (error) {
            appointmentListContainer.innerHTML = `<p class="no-appointments">Could not load appointments: ${error.message}</p>`;
        }
    };
    
    appointmentDateInput?.addEventListener('change', fetchAndRenderAppointments);

    // --- Initial setup on page load ---
    switchView('dashboard-view');
});

