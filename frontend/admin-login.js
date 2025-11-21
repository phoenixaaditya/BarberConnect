document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from reloading the page

        // 1. Get the data from the form inputs
        const email = adminLoginForm.querySelector('input[type="email"]').value;
        const password = adminLoginForm.querySelector('input[type="password"]').value;

        try {
            // 2. Send the data to our new admin login endpoint
            const response = await fetch('http://localhost:5000/api/users/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            // 3. Handle the response from the backend
            if (response.ok) {
                // If login is successful
                alert('Admin login successful!');
                // Save the token to local storage for future use
                localStorage.setItem('adminToken', data.token);
                // Redirect to the admin dashboard (which we will build next)
                window.location.href = 'admin-dashboard.html';
            } else {
                // If there's an error (e.g., wrong password, not an admin)
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('There was an error:', error);
            alert('Could not connect to the server. Please try again later.');
        }
    });
});
