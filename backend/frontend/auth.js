document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const authTitle = document.getElementById('auth-title');
    const signupView = document.getElementById('signup-view');
    const loginView = document.getElementById('login-view');
    const toggleText = document.getElementById('toggle-text');
    const showLoginLink = document.getElementById('show-login-link');
    const authForm = document.getElementById('auth-form');

    const signupInputs = signupView.querySelectorAll('input, textarea, select');
    const loginInputs = loginView.querySelectorAll('input');
    
    const showSignupLink = document.createElement('a');
    showSignupLink.href = '#';
    showSignupLink.id = 'show-signup-link';
    showSignupLink.textContent = 'Sign Up';

    // --- View Toggling Logic (Handles enabling/disabling inputs) ---
    function showLoginView(e) {
        if (e) e.preventDefault();
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
        authTitle.textContent = 'Log In';
        toggleText.innerHTML = 'Need an account? ';
        toggleText.appendChild(showSignupLink);
        signupInputs.forEach(input => input.disabled = true);
        loginInputs.forEach(input => input.disabled = false);
    }

    function showSignupView(e) {
        if (e) e.preventDefault();
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
        authTitle.textContent = 'Create Account';
        toggleText.innerHTML = 'Already have an account? ';
        toggleText.appendChild(showLoginLink);
        loginInputs.forEach(input => input.disabled = true);
        signupInputs.forEach(input => input.disabled = false);
    }

    showLoginLink.addEventListener('click', showLoginView);
    showSignupLink.addEventListener('click', showSignupView);

    // --- Form Submission Logic ---
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- Handle SIGNUP ---
        if (!signupView.classList.contains('hidden')) {
            const name = signupView.querySelector('input[placeholder="Full Name"]').value;
            const email = signupView.querySelector('input[placeholder="Email Address"]').value;
            const password = signupView.querySelector('input[placeholder="Password"]').value;
            try {
                const response = await fetch('http://localhost:5000/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                alert('Registration successful! You can now log in.');
                showLoginView();
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
        
        // --- Handle LOGIN ---
        if (!loginView.classList.contains('hidden')) {
            const email = loginView.querySelector('input[placeholder="Email Address"]').value;
            const password = loginView.querySelector('input[placeholder="Password"]').value;
            try {
                const response = await fetch('http://localhost:5000/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                // THE CRITICAL STEP: Save the token and user info to localStorage
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                }));

                // Redirect to the dashboard after successful login
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert(`Login Failed: ${error.message}`);
            }
        }
    });

    // Set initial disabled state
    loginInputs.forEach(input => input.disabled = true);
});

