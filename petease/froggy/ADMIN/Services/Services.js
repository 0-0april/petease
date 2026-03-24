// Set Service Availability JavaScript for interactive functionality

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
    const form = document.getElementById('availability-form');
    const resetBtn = document.querySelector('.reset-btn');
    const addServiceBtn = document.getElementById('add-service-btn');
    const newServiceNameInput = document.getElementById('new-service-name');
    const servicesList = document.querySelector('.services-list');

    // Service enable/disable toggles
    function attachToggleListeners() {
        const serviceToggles = document.querySelectorAll('.service-item input[type="checkbox"]');
        serviceToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const serviceDetails = this.closest('.service-item').querySelector('.service-details');
                if (this.checked) {
                    serviceDetails.style.display = 'block';
                } else {
                    serviceDetails.style.display = 'none';
                }
            });
        });
    }

    attachToggleListeners();

    // Add new service functionality
    addServiceBtn.addEventListener('click', function() {
        const serviceName = newServiceNameInput.value.trim();
        if (serviceName === '') {
            alert('Please enter a service name.');
            return;
        }

        // Check if service already exists
        const existingServices = document.querySelectorAll('.service-name');
        for (let service of existingServices) {
            if (service.textContent.toLowerCase() === serviceName.toLowerCase()) {
                alert('Service already exists.');
                return;
            }
        }

        // Create new service item
        const serviceId = serviceName.toLowerCase().replace(/\s+/g, '-');
        const newServiceItem = document.createElement('div');
        newServiceItem.className = 'service-item';
        newServiceItem.innerHTML = `
            <div class="service-header">
                <label class="service-name">${serviceName}</label>
                <label class="switch">
                    <input type="checkbox" id="${serviceId}-enabled" checked>
                    <span class="slider"></span>
                </label>
                <button type="button" class="remove-service-btn" data-service="${serviceId}">Remove</button>
            </div>
            <div class="service-details" id="${serviceId}-details">
                <div class="detail-row">
                    <label>Slots:</label>
                    <div class="slot-options">
                        <label><input type="radio" name="${serviceId}-slots" value="unlimited" checked> Unlimited</label>
                        <label><input type="radio" name="${serviceId}-slots" value="limited"> Limited to <input type="number" min="1" value="10"></label>
                    </div>
                </div>
                <div class="detail-row">
                    <label>Date Available:</label>
                    <div class="date-options">
                        <label><input type="radio" name="${serviceId}-date" value="forever" checked> Forever</label>
                        <label><input type="radio" name="${serviceId}-date" value="specific"> Until <input type="date"></label>
                    </div>
                </div>
            </div>
        `;

        servicesList.appendChild(newServiceItem);
        newServiceNameInput.value = '';

        // Attach listeners to the new service
        attachToggleListeners();

        // Attach remove listener
        const removeBtn = newServiceItem.querySelector('.remove-service-btn');
        removeBtn.addEventListener('click', function() {
            if (confirm(`Are you sure you want to remove the "${serviceName}" service?`)) {
                newServiceItem.remove();
            }
        });

        alert(`Service "${serviceName}" added successfully!`);
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect all form data
        const servicesData = {};

        // Collect original services
        const originalServices = ['consultation', 'vaccination', 'surgery', 'dental', 'emergency'];
        originalServices.forEach(service => {
            const enabled = document.getElementById(`${service}-enabled`).checked;
            if (enabled) {
                const slotsRadio = document.querySelector(`input[name="${service}-slots"]:checked`).value;
                const slotsValue = slotsRadio === 'unlimited' ? 'unlimited' : document.querySelector(`input[name="${service}-slots"][value="limited"]`).nextElementSibling.value;

                const dateRadio = document.querySelector(`input[name="${service}-date"]:checked`).value;
                const dateValue = dateRadio === 'forever' ? 'forever' : document.querySelector(`input[name="${service}-date"][value="specific"]`).nextElementSibling.value;

                servicesData[service] = {
                    enabled: true,
                    slots: slotsValue,
                    dateAvailable: dateValue
                };
            } else {
                servicesData[service] = {
                    enabled: false
                };
            }
        });

        // Collect dynamically added services
        const allServiceItems = document.querySelectorAll('.service-item:not(.original-service)');
        allServiceItems.forEach(item => {
            const serviceName = item.querySelector('.service-name').textContent;
            const serviceId = serviceName.toLowerCase().replace(/\s+/g, '-');
            const enabled = document.getElementById(`${serviceId}-enabled`).checked;
            if (enabled) {
                const slotsRadio = document.querySelector(`input[name="${serviceId}-slots"]:checked`).value;
                const slotsValue = slotsRadio === 'unlimited' ? 'unlimited' : document.querySelector(`input[name="${serviceId}-slots"][value="limited"]`).nextElementSibling.value;

                const dateRadio = document.querySelector(`input[name="${serviceId}-date"]:checked`).value;
                const dateValue = dateRadio === 'forever' ? 'forever' : document.querySelector(`input[name="${serviceId}-date"][value="specific"]`).nextElementSibling.value;

                servicesData[serviceId] = {
                    name: serviceName,
                    enabled: true,
                    slots: slotsValue,
                    dateAvailable: dateValue
                };
            } else {
                servicesData[serviceId] = {
                    name: serviceName,
                    enabled: false
                };
            }
        });

        // In a real application, this would send data to the server
        console.log('Saving services:', servicesData);

        alert('Service availability settings have been saved successfully!');
    });

    // Reset to default
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            // Reset all services to default state
            const defaultServices = {
                consultation: { enabled: true, slots: 'unlimited', date: 'forever' },
                vaccination: { enabled: true, slots: 'unlimited', date: 'forever' },
                surgery: { enabled: false, slots: 'unlimited', date: 'forever' },
                dental: { enabled: true, slots: 'unlimited', date: 'forever' },
                emergency: { enabled: true, slots: 'unlimited', date: 'forever' }
            };

            Object.keys(defaultServices).forEach(service => {
                const config = defaultServices[service];
                const enabledCheckbox = document.getElementById(`${service}-enabled`);
                const detailsDiv = document.getElementById(`${service}-details`);

                enabledCheckbox.checked = config.enabled;
                if (config.enabled) {
                    detailsDiv.style.display = 'block';
                    // Set slots
                    document.querySelector(`input[name="${service}-slots"][value="${config.slots}"]`).checked = true;
                    // Set date
                    document.querySelector(`input[name="${service}-date"][value="${config.date}"]`).checked = true;
                } else {
                    detailsDiv.style.display = 'none';
                }
            });

            alert('Settings have been reset to default values.');
        }
    });

    // Initialize service toggles
    const allToggles = document.querySelectorAll('.service-item input[type="checkbox"]');
    allToggles.forEach(toggle => {
        toggle.dispatchEvent(new Event('change'));
    });

    console.log('Set Service Availability page loaded successfully');
});
