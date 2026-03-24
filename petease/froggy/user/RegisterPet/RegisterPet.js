// Mock data for registered pets
let registeredPets = JSON.parse(localStorage.getItem('registeredPets')) || [
    {
        name: 'Buddy',
        type: 'Dog',
        breed: 'Golden Retriever',
        color: 'Golden',
        birthday: '2020-05-15',
        gender: 'Male',
        description: 'Friendly and energetic dog.',
        medicalHistory: 'Vaccinated, no known issues.',
        image: '../assets/browndog.jpg'
    },
    {
        name: 'Whiskers',
        type: 'Cat',
        breed: 'Persian',
        color: 'White',
        birthday: '2019-03-10',
        gender: 'Female',
        description: 'Calm and affectionate cat.',
        medicalHistory: 'Regular check-ups, minor allergies.',
        image: '../assets/whitecat.jpg'
    }
];

// Mock data for appointments
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Function to render pet cards
function renderPets() {
    const container = document.getElementById('pets-container');
    container.innerHTML = '';

    if (registeredPets.length === 0) {
        container.innerHTML = '<p>No pets registered yet.</p>';
        return;
    }

    registeredPets.forEach((pet, index) => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        petCard.innerHTML = `
            <img src="${pet.image}" alt="${pet.name}">
            <div class="card-content">
                <h3>${pet.name}</h3>
                <p>${pet.type}</p>
                <p>${pet.breed}</p>
                <p>${pet.color}</p>
                <p>8 months old</p>
                <p>${pet.gender}</p>
                <p>${pet.description}</p>
                <p>${pet.medicalHistory}</p>
            </div>
            <button class="edit-btn" data-index="${index}">Edit</button>
        `;
        container.appendChild(petCard);
    });
}

// Function to render appointments
function renderAppointments() {
    const container = document.getElementById('appointments-list');
    if (!container) {
        console.warn('Appointments list container not found');
        return;
    }
    container.innerHTML = '';

    if (appointments.length === 0) {
        container.innerHTML = '<p>No appointments booked yet.</p>';
        return;
    }

    appointments.forEach((appointment, index) => {
        const appointmentItem = document.createElement('div');
        appointmentItem.className = 'appointment-item';
        appointmentItem.innerHTML = `
            <div>
                <p><strong>Pet:</strong> ${appointment.petName}</p>
                <p><strong>Type:</strong> ${appointment.type}</p>
                <p><strong>Date:</strong> ${appointment.date}</p>
            </div>
        `;
        container.appendChild(appointmentItem);
    });
}

// Function to show modal
function showModal(isEdit = false, index = null) {
    const modal = document.getElementById('pet-form-modal');
    const formTitle = document.getElementById('form-title');
    const form = document.getElementById('pet-form');

    if (isEdit && index !== null) {
        formTitle.textContent = 'Edit Pet';
        populateForm(registeredPets[index]);
        form.dataset.editIndex = index;
    } else {
        formTitle.textContent = 'Register New Pet';
        form.reset();
        delete form.dataset.editIndex;
    }

    modal.style.display = 'flex';
}

// Function to hide modal
function hideModal() {
    const modal = document.getElementById('pet-form-modal');
    modal.style.display = 'none';
}

// Function to populate form with pet data
function populateForm(pet) {
    document.getElementById('pet-name').value = pet.name;
    document.getElementById('pet-type').value = pet.type.toLowerCase();
    document.getElementById('pet-breed').value = pet.breed;
    document.getElementById('pet-color').value = pet.color;
    document.getElementById('pet-birthday').value = pet.birthday;
    document.querySelector(`input[name="gender"][value="${pet.gender.toLowerCase()}"]`).checked = true;
    document.getElementById('pet-description').value = pet.description;
    document.getElementById('pet-medical').value = pet.medicalHistory;
    // Note: Image input can't be pre-populated for security reasons
}

// Function to save pet
function savePet(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const pet = {
        name: formData.get('name'),
        type: formData.get('type'),
        breed: formData.get('breed'),
        color: formData.get('color'),
        birthday: formData.get('birthday'),
        gender: formData.get('gender'),
        description: formData.get('description'),
        medicalHistory: formData.get('medicalHistory'),
        image: '../assets/ginger.jpg' // Default image, will be updated if file uploaded
    };

    const fileInput = document.getElementById('pet-image');
    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            pet.image = e.target.result;
            finalizeSave(pet);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeSave(pet);
    }
}

function finalizeSave(pet) {
    const editIndex = document.getElementById('pet-form').dataset.editIndex;
    if (editIndex !== undefined) {
        registeredPets[editIndex] = pet;
    } else {
        registeredPets.push(pet);
    }

    localStorage.setItem('registeredPets', JSON.stringify(registeredPets));
    renderPets();
    hideModal();
}

// Function to populate pet select
function populatePetSelect() {
    const select = document.getElementById('appointment-pet');
    select.innerHTML = '<option value="">Select Pet</option>';
    registeredPets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.name;
        option.textContent = pet.name;
        select.appendChild(option);
    });
}

// Function to show appointment type modal
function showAppointmentTypeModal() {
    populatePetSelect();
    document.getElementById('appointment-type-modal').style.display = 'block';
}

// Function to hide appointment type modal
function hideAppointmentTypeModal() {
    document.getElementById('appointment-type-modal').style.display = 'none';
}

// Function to show unavailable modal
function showUnavailableModal() {
    document.getElementById('unavailable-modal').style.display = 'block';
}

// Function to hide unavailable modal
function hideUnavailableModal() {
    document.getElementById('unavailable-modal').style.display = 'none';
}

// Function to show calendar modal
function showCalendarModal(appointmentType) {
    currentAppointmentType = appointmentType;
    renderCalendar();
    document.getElementById('calendar-modal').style.display = 'block';
}

// Function to hide calendar modal
function hideCalendarModal() {
    document.getElementById('calendar-modal').style.display = 'none';
    selectedDate = null;
    document.getElementById('confirm-date-btn').style.display = 'none';
}

// Calendar variables
let calendarCurrentDate = new Date();
let selectedDate = null;
let currentAppointmentType = '';

// Function to render calendar with constraints
function renderCalendar() {
    const monthYear = document.getElementById('calendar-month-year');
    const daysContainer = document.getElementById('calendar-days');
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Clear previous days
    daysContainer.innerHTML = '';

    // Get first day of the month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'other-month');
        daysContainer.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const dayOfWeek = new Date(year, month, day).getDay(); // 0 = Sunday, 6 = Saturday
        const isPast = new Date(year, month, day) < new Date().setHours(0, 0, 0, 0);

        // Apply constraints based on appointment type
        let isDisabled = false;
        if (currentAppointmentType === 'consultation') {
            isDisabled = dayOfWeek !== 1 || isPast; // Only Mondays, not past
        } else if (currentAppointmentType === 'anti-rabies') {
            isDisabled = dayOfWeek === 0 || dayOfWeek === 6 || isPast; // Only weekdays, not past
        }

        if (isDisabled) {
            dayDiv.classList.add('disabled');
        } else {
            dayDiv.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.calendar .day.selected').forEach(el => el.classList.remove('selected'));
                // Select this day
                dayDiv.classList.add('selected');
                selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                document.getElementById('confirm-date-btn').style.display = 'inline-block';
            });
        }

        daysContainer.appendChild(dayDiv);
    }

    // Add empty cells for days after the last day of the month to fill the grid
    const totalCells = startDay + totalDays;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days = 42
    for (let i = 0; i < remainingCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'other-month');
        daysContainer.appendChild(emptyDiv);
    }
}

// Function to save appointment
function saveAppointment(petName, type, date) {
    const appointment = { petName, type, date };
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    renderAppointments();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    renderPets();
    renderAppointments();

    // Register new pet button
    document.getElementById('register-new-pet-btn').addEventListener('click', () => showModal());

    // Book appointment button
    document.getElementById('book-appointment-btn').addEventListener('click', showAppointmentTypeModal);

    // Edit buttons (event delegation)
    document.getElementById('pets-container').addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-btn')) {
            const index = event.target.dataset.index;
            showModal(true, index);
        }
    });

    // Close modals
    document.getElementById('close-modal').addEventListener('click', hideModal);
    document.getElementById('cancel-form').addEventListener('click', hideModal);
    document.getElementById('close-appointment-type-modal').addEventListener('click', hideAppointmentTypeModal);
    document.getElementById('cancel-appointment-type').addEventListener('click', hideAppointmentTypeModal);
    document.getElementById('close-unavailable-modal').addEventListener('click', hideUnavailableModal);
    document.getElementById('close-unavailable-btn').addEventListener('click', hideUnavailableModal);
    document.getElementById('close-calendar-modal').addEventListener('click', hideCalendarModal);
    document.getElementById('cancel-calendar').addEventListener('click', hideCalendarModal);

    // Check if calendar elements exist before adding listeners
    const calendarPrev = document.getElementById('calendar-prev');
    const calendarNext = document.getElementById('calendar-next');
    const confirmDateBtn = document.getElementById('confirm-date-btn');

    if (calendarPrev) {
        calendarPrev.addEventListener('click', () => {
            calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    if (calendarNext) {
        calendarNext.addEventListener('click', () => {
            calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
            renderCalendar();
        });
    }
    if (confirmDateBtn) {
        confirmDateBtn.addEventListener('click', function() {
            if (selectedDate) {
                const petName = document.getElementById('appointment-pet').value;
                const type = currentAppointmentType;
                saveAppointment(petName, type, selectedDate);
                hideCalendarModal();
            }
        });
    }

    // Click outside modals to close
    window.addEventListener('click', function(event) {
        const petModal = document.getElementById('pet-form-modal');
        const appointmentTypeModal = document.getElementById('appointment-type-modal');
        const unavailableModal = document.getElementById('unavailable-modal');
        const calendarModal = document.getElementById('calendar-modal');
        if (event.target === petModal) {
            hideModal();
        }
        if (event.target === appointmentTypeModal) {
            hideAppointmentTypeModal();
        }
        if (event.target === unavailableModal) {
            hideUnavailableModal();
        }
        if (event.target === calendarModal) {
            hideCalendarModal();
        }
    });

    // Form submissions
    document.getElementById('pet-form').addEventListener('submit', savePet);
    document.getElementById('appointment-type-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const petName = formData.get('pet');
        const type = formData.get('type');
        hideAppointmentTypeModal();
        if (type === 'spay' || type === 'neuter') {
            showUnavailableModal();
        } else {
            showCalendarModal(type);
        }
    });

    // Calendar navigation
    document.getElementById('calendar-prev').addEventListener('click', () => {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('calendar-next').addEventListener('click', () => {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
        renderCalendar();
    });

    // Confirm date
    document.getElementById('confirm-date-btn').addEventListener('click', function() {
        if (selectedDate) {
            const petName = document.getElementById('appointment-pet').value;
            const type = currentAppointmentType;
            saveAppointment(petName, type, selectedDate);
            hideCalendarModal();
        }
    });
});
