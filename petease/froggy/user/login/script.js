

document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authenticationForm = document.getElementById('authentication-form');

    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authenticationForm.classList.add('hidden');
    });

    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        authenticationForm.classList.add('hidden');
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

        window.location.href = '../browse_pets/index.html';
        // if (user) {
        //     localStorage.setItem('currentUser', JSON.stringify(user));
        //     alert('Login successful!');
        //     // Navigate to dashboard or home
        //     window.location.href = '../browse_pets/index.html';
        // } else {
        //     alert('Invalid credentials. Please try again.');
        // }
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const retypePassword = document.getElementById('retype-register-password').value;

        if (password !== retypePassword) {
            alert('Passwords do not match.');
            return;
        }

        // Store registration data temporarily
        localStorage.setItem('tempRegister', JSON.stringify({ username, email, password }));

        // Hide register form and show authentication form
        registerForm.classList.add('hidden');
        authenticationForm.classList.remove('hidden');
    });

    authenticationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const authCode = document.getElementById('authentication-code').value;

        // Simulate authentication code check (in real app, this would be verified server-side)
        if (authCode !== '123456') {
            alert('Invalid authentication code. Please check your email/phone.');
            return;
        }

        const tempData = JSON.parse(localStorage.getItem('tempRegister'));
        if (!tempData) {
            alert('Registration data not found. Please try again.');
            return;
        }

        const { username, email, password } = tempData;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.username === username || u.email === email)) {
            alert('User already exists.');
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            role: 'user',
            pets: [],
            blockedUsers: []
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.removeItem('tempRegister'); // Clean up
        alert('Registration successful! Welcome to PetEase.');
        window.location.href = '../browse_pets/index.html';
    });
});
