// Register Admin/Staff JavaScript for interactive functionality

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active sidebar link based on current page
    const currentFile = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');

    sidebarLinks.forEach(link => {
        const linkFile = link.getAttribute('href').split('/').pop();
        if (currentFile === linkFile) {
            link.classList.add('active');
        }
    });

    
    const form = document.getElementById('registration-form');
    const roleSelect = document.getElementById('role');
    const permissionsSection = document.getElementById('permissions-section');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    const previewBtn = document.querySelector('.preview-btn');
    const registrationPreview = document.getElementById('registration-preview');
    const confirmRegistration = document.getElementById('confirm-registration');
    const editRegistration = document.getElementById('edit-registration');
    const clearBtn = document.querySelector('.clear-btn');

    // Role-based permissions
    const rolePermissions = {
        admin: ['user-management', 'appointment-management', 'announcement-management', 'report-review', 'service-config', 'staff-management', 'system-settings', 'data-export'],
        'vet-staff': ['appointment-management', 'report-review', 'service-config'],
        support: ['user-management', 'appointment-management', 'announcement-management']
    };

    roleSelect.addEventListener('change', function() {
        const selectedRole = this.value;
        const permissionCheckboxes = document.querySelectorAll('#permissions-section input[type="checkbox"]');

        if (selectedRole) {
            permissionsSection.style.display = 'block';

            // Reset all checkboxes
            permissionCheckboxes.forEach(cb => cb.checked = false);

            // Check permissions for selected role
            if (rolePermissions[selectedRole]) {
                rolePermissions[selectedRole].forEach(permission => {
                    const checkbox = document.querySelector(`input[value="${permission}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        } else {
            permissionsSection.style.display = 'none';
        }
    });

    // Password strength checker
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('Uppercase letter');

        if (/[0-9]/.test(password)) strength++;
        else feedback.push('Number');

        if (/[^A-Za-z0-9]/.test(password)) strength++;
        else feedback.push('Special character');

        // Update UI
        strengthFill.className = 'strength-fill';
        if (strength <= 2) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Password strength: Weak';
        } else if (strength <= 4) {
            strengthFill.classList.add('medium');
            strengthText.textContent = 'Password strength: Medium';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Password strength: Strong';
        }

        strengthFill.style.width = (strength / 5) * 100 + '%';
    });

    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;

        if (password !== confirmPassword) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });

    // Preview registration
    previewBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#dc3545';
            } else {
                field.style.borderColor = '#ddd';
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }

        // Check password match
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Passwords do not match.');
            return;
        }

        // Populate preview
        document.getElementById('preview-name').textContent =
            document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value;
        document.getElementById('preview-email').textContent = document.getElementById('email').value;
        document.getElementById('preview-phone').textContent = document.getElementById('phone').value;
        document.getElementById('preview-dob').textContent = new Date(document.getElementById('date-of-birth').value).toLocaleDateString();
        document.getElementById('preview-address').textContent = document.getElementById('address').value;
        document.getElementById('preview-username').textContent = document.getElementById('username').value;
        document.getElementById('preview-role').textContent = roleSelect.options[roleSelect.selectedIndex].text;
        document.getElementById('preview-department').textContent = document.getElementById('department').options[document.getElementById('department').selectedIndex].text;

        // Permissions
        const checkedPermissions = document.querySelectorAll('#permissions-section input:checked');
        const permissionNames = Array.from(checkedPermissions).map(cb => cb.parentElement.textContent.trim());
        document.getElementById('preview-permissions').textContent = permissionNames.length > 0 ? permissionNames.join(', ') : 'No permissions selected';

        // Show preview
        registrationPreview.style.display = 'block';
        registrationPreview.scrollIntoView({ behavior: 'smooth' });
    });

    // Confirm registration
    confirmRegistration.addEventListener('click', function() {
        alert('Staff member has been registered successfully!');
        registrationPreview.style.display = 'none';
        form.reset();
        permissionsSection.style.display = 'none';
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Password strength: Weak';
    });

    // Edit registration
    editRegistration.addEventListener('click', function() {
        registrationPreview.style.display = 'none';
    });

    // Clear form
    clearBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the form?')) {
            form.reset();
            permissionsSection.style.display = 'none';
            registrationPreview.style.display = 'none';
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Password strength: Weak';

            // Reset border colors
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.style.borderColor = '#ddd');
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect all form data
        const formData = {
            personal: {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                dateOfBirth: document.getElementById('date-of-birth').value,
                address: document.getElementById('address').value
            },
            account: {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            },
            role: {
                role: document.getElementById('role').value,
                department: document.getElementById('department').value,
                permissions: Array.from(document.querySelectorAll('#permissions-section input:checked')).map(cb => cb.value)
            },
            additional: {
                qualifications: document.getElementById('qualifications').value,
                emergencyContact: document.getElementById('emergency-contact').value
            }
        };

        // In a real application, this would send data to the server
        console.log('Registering staff member:', formData);

        alert('Staff member has been registered successfully!');
        form.reset();
        permissionsSection.style.display = 'none';
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Password strength: Weak';
    });

    // Username validation
    document.getElementById('username').addEventListener('input', function() {
        const username = this.value;
        const regex = /^[a-zA-Z0-9_]+$/;

        if (!regex.test(username)) {
            this.setCustomValidity('Username can only contain letters, numbers, and underscores');
        } else {
            this.setCustomValidity('');
        }
    });

    // Enable/Disable functionality for registered staff accounts
    const toggleButtons = document.querySelectorAll('.toggle-status-btn');
    const disableModal = document.getElementById('disable-confirmation-modal');
    const confirmDisableBtn = document.getElementById('confirm-disable-btn');
    const cancelDisableBtn = document.getElementById('cancel-disable-btn');
    let currentItemToToggle = null;

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.registration-item');
            const currentStatus = this.dataset.status;

            if (currentStatus === 'enabled') {
                // Show confirmation modal for disabling
                currentItemToToggle = item;
                disableModal.style.display = 'flex';
            } else {
                // Enable immediately
                toggleAccountStatus(item, 'enabled');
            }
        });
    });

    // Confirm disable action
    confirmDisableBtn.addEventListener('click', function() {
        if (currentItemToToggle) {
            toggleAccountStatus(currentItemToToggle, 'disabled');
            currentItemToToggle = null;
        }
        disableModal.style.display = 'none';
    });

    // Cancel disable action
    cancelDisableBtn.addEventListener('click', function() {
        currentItemToToggle = null;
        disableModal.style.display = 'none';
    });

    // Function to toggle account status
    function toggleAccountStatus(item, newStatus) {
        const button = item.querySelector('.toggle-status-btn');

        if (newStatus === 'disabled') {
            item.classList.add('disabled');
            button.textContent = 'Enable';
            button.dataset.status = 'disabled';
            button.style.background = '#28a745';
        } else {
            item.classList.remove('disabled');
            button.textContent = 'Disable';
            button.dataset.status = 'enabled';
            button.style.background = '';
        }

        // In a real application, this would send a request to the server
        console.log(`Account ${item.dataset.id} status changed to: ${newStatus}`);
    }

    console.log('Register Admin/Staff page loaded successfully');
});
