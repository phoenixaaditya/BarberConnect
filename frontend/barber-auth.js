document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const authTitle = document.getElementById('auth-title');
    const signupView = document.getElementById('signup-view');
    const loginView = document.getElementById('login-view');
    const toggleText = document.getElementById('toggle-text');
    const showLoginLink = document.getElementById('show-login-link');
    const authForm = document.getElementById('auth-form');

    const signupInputs = signupView.querySelectorAll('input, textarea');
    const loginInputs = loginView.querySelectorAll('input');

    const showSignupLink = document.createElement('a');
    showSignupLink.href = '#';
    showSignupLink.id = 'show-signup-link';
    showSignupLink.textContent = 'Create a Business Account';

    // --- Loading Spinner ---
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    // (Spinner styles from your file)
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = 0;
    loadingOverlay.style.left = 0;
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.zIndex = '9999';
    loadingOverlay.style.color = '#fff';
    loadingOverlay.style.fontSize = '1.2rem';
    loadingOverlay.style.fontFamily = 'Arial, sans-serif';
    loadingOverlay.style.display = 'none'; 
    loadingOverlay.innerHTML = `
        <div style="text-align:center;">
            <div class="spinner" style="
                border: 6px solid #f3f3f3;
                border-top: 6px solid #ff6b6b;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px auto;
            "></div>
            <p id="loader-text">Submitting...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);

    // --- View Toggling Logic (No changes) ---
    function showLoginView(e) {
        if (e) e.preventDefault();
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
        authTitle.textContent = 'Business Log In';
        toggleText.innerHTML = "Don't have an account? ";
        toggleText.appendChild(showSignupLink);
        signupInputs.forEach(input => input.disabled = true);
        loginInputs.forEach(input => input.disabled = false);
    }

    function showSignupView(e) {
        if (e) e.preventDefault();
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
        authTitle.textContent = 'Create a Business Account';
        toggleText.innerHTML = 'Already have an account? ';
        toggleText.appendChild(showLoginLink);
        loginInputs.forEach(input => input.disabled = true);
        signupInputs.forEach(input => input.disabled = false);
    }

    showLoginLink.addEventListener('click', showLoginView);
    showSignupLink.addEventListener('click', showSignupView);

    const fileInput = document.getElementById('trade-license-image');
    const fileNameDisplay = document.getElementById('file-name-display');
    fileInput.addEventListener('change', () => {
        fileNameDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
    });

    // --- Form Submission Logic ---
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loaderText = document.getElementById('loader-text');

        // --- Handle Barber Registration ---
        if (!signupView.classList.contains('hidden')) {
            loaderText.textContent = 'Submitting your application...';
            // (Registration logic remains the same)
            const formData = new FormData();
            formData.append('ownerName', signupView.querySelector('input[placeholder="Your Full Name"]').value);
            formData.append('email', signupView.querySelector('input[placeholder="Email Address"]').value);
            formData.append('phone', signupView.querySelector('input[placeholder="Phone Number"]').value);
            formData.append('shopName', signupView.querySelector('input[placeholder="Shop Name"]').value);
            formData.append('shopAddress', signupView.querySelector('textarea[placeholder="Barber Shop Address"]').value);
            formData.append('shopCategory', signupView.querySelector('input[name="shop-type"]:checked').value);
            formData.append('tradeLicenseNumber', signupView.querySelector('input[placeholder="Trade License Number"]').value);
            formData.append('gstNumber', signupView.querySelector('input[placeholder="GST Number (Optional)"]').value);
            formData.append('password', signupView.querySelector('input[placeholder="Create Password"]').value);
            if (fileInput.files[0]) { formData.append('tradeLicenseImage', fileInput.files[0]); }

            try {
                loadingOverlay.style.display = 'flex';
                const response = await fetch('http://localhost:5000/api/barbers/register', { method: 'POST', body: formData });
                const data = await response.json();
                if (!response.ok) { throw new Error(data.message || `Server error: ${response.status}`); }
                window.location.href = 'registration-pending.html';
            } catch (error) {
                alert(`Registration failed: ${error.message}`);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        }
        
        // --- NEW: Handle Barber Login ---
        if (!loginView.classList.contains('hidden')) {
            loaderText.textContent = 'Logging you in...';
            const email = loginView.querySelector('input[placeholder="Email Address"]').value;
            const password = loginView.querySelector('input[placeholder="Password"]').value;

            try {
                loadingOverlay.style.display = 'flex';
                const response = await fetch('http://localhost:5000/api/barbers/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (!data.success) { // Check our custom success flag
                    throw new Error(data.message || 'An unknown error occurred.');
                }

                // If login is successful, save the data to localStorage
                localStorage.setItem('barberToken', data.token);
                localStorage.setItem('barberInfo', JSON.stringify({
                    _id: data._id,
                    shopName: data.shopName,
                    email: data.email
                }));

                // Redirect to the barber dashboard
                window.location.href = 'barber-dashboard.html';

            } catch (error) {
                alert(`Login failed: ${error.message}`);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        }
    });

    // Set initial disabled state
    loginInputs.forEach(input => input.disabled = true);
});

