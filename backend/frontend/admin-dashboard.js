document.addEventListener('DOMContentLoaded', () => {
    const adminToken = localStorage.getItem('adminToken');
    const tableBody = document.querySelector('.data-table tbody');

    if (!adminToken) {
        alert('You are not authorized. Please log in.');
        window.location.href = 'admin-login.html';
        return;
    }

    const fetchPendingBarbers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/pending-barbers', {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });

            if (!response.ok) throw new Error('Failed to fetch applications.');

            const barbers = await response.json();
            tableBody.innerHTML = '';

            if (barbers.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending applications found.</td></tr>';
                return;
            }

            barbers.forEach(barber => {
                const row = document.createElement('tr');
                // IMPORTANT: Add a data attribute to the row to store the barber's ID
                row.dataset.id = barber._id;
                row.innerHTML = `
                    <td>${barber.shopName}</td>
                    <td>${barber.ownerName}</td>
                    <td>${barber.email}</td>
                    <td><span class="status pending">${barber.status}</span></td>
                    <td>
                        <button class="btn-sm btn-approve">Approve</button>
                        <button class="btn-sm btn-reject">Reject</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            window.location.href = 'admin-login.html';
        }
    };

    // NEW: Function to handle status updates
    const handleStatusUpdate = async (barberId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/barbers/${barberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error(`Failed to ${newStatus} the application.`);

            // If successful, remove the row from the table for instant feedback
            const rowToRemove = tableBody.querySelector(`tr[data-id="${barberId}"]`);
            if (rowToRemove) {
                rowToRemove.remove();
            }

            // Check if the table is now empty
            if (tableBody.children.length === 0) {
                 tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending applications found.</td></tr>';
            }

        } catch (error) {
            console.error('Update Error:', error);
            alert(error.message);
        }
    };

    // NEW: Use event delegation to handle clicks on approve/reject buttons
    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const barberId = row.dataset.id;

        if (target.classList.contains('btn-approve')) {
            if (confirm(`Are you sure you want to approve this application?`)) {
                handleStatusUpdate(barberId, 'approved');
            }
        }

        if (target.classList.contains('btn-reject')) {
            if (confirm(`Are you sure you want to reject this application?`)) {
                handleStatusUpdate(barberId, 'rejected');
            }
        }
    });

    fetchPendingBarbers();
});

