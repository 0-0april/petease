// // // Appointment JavaScript for managing appointments

// // document.addEventListener('DOMContentLoaded', function() {
// //     const appointmentsList = document.querySelector('.appointments-list');
// //     const feedbackMessage = document.getElementById('feedback-message');

// //     // Modal elements
// //     const modal = document.getElementById('appointment-modal');
// //     const modalFeedbackMessage = document.getElementById('modal-feedback-message');
// //     const closeBtn = document.querySelector('.close');
// //     const addAppointmentBtn = document.getElementById('add-appointment-btn');

// //     // Form elements
// //     const appointmentForm = document.getElementById('appointment-form');
// //     const unavailableMessage = document.getElementById('unavailable-message');

// //     // Step elements
// //     const steps = document.querySelectorAll('.form-step');
// //     const stepIndicators = document.querySelectorAll('.step');

// //     // Button elements
// //     const nextBtn = document.getElementById('next-btn');
// //     const backBtn = document.getElementById('back-btn');
// //     const submitBtn = document.getElementById('submit-btn');

// //     // Mock data for appointments
// //     let appointments = JSON.parse(localStorage.getItem('appointments')) || [
// //         {
// //             id: 1,
// //             petName: 'Buddy',
// //             type: 'Consultation',
// //             date: '2024-12-15'
// //         },
// //         {
// //             id: 2,
// //             petName: 'Whiskers',
// //             type: 'Anti-Rabies Vaccination',
// //             date: '2024-12-18'
// //         },
// //         {
// //             id: 3,
// //             petName: 'Max',
// //             type: 'Consultation',
// //             date: '2024-12-20'
// //         }
// //     ];

// //     // Mock registered pets
// //     const registeredPets = [
// //         { id: 1, name: 'Buddy', type: 'Dog' },
// //         { id: 2, name: 'Whiskers', type: 'Cat' },
// //         { id: 3, name: 'Max', type: 'Dog' },
// //         { id: 4, name: 'Fluffy', type: 'Cat' }
// //     ];

// //     // Track current selections
// //     let currentStep = 1;
// //     let selectedPets = [];
// //     let selectedAppointmentType = '';
// //     let selectedDate = null;

// //     // Function to display feedback message
// //     function showFeedback(message, type = 'success') {
// //         const targetMessage = (type === 'error' && modal.style.display === 'block') ? modalFeedbackMessage : feedbackMessage;
// //         targetMessage.textContent = message;
// //         targetMessage.className = `feedback ${type}`;
// //         targetMessage.classList.remove('hidden');

// //         // Hide the message after 5 seconds
// //         setTimeout(() => {
// //             targetMessage.classList.add('hidden');
// //         }, 5000);
// //     }

// //     // Function to render appointments
// //     function renderAppointments() {
// //         appointmentsList.innerHTML = '';

// //         if (appointments.length === 0) {
// //             appointmentsList.innerHTML = '<p class="no-appointments">No appointments found.</p>';
// //             return;
// //         }

// //         appointments.forEach(appointment => {
// //             const appointmentItem = document.createElement('div');
// //             appointmentItem.className = 'appointment-item';

// //             // Format date to readable format
// //             const appointmentDate = new Date(appointment.date);
// //             const formattedDate = appointmentDate.toLocaleDateString('en-US', {
// //                 weekday: 'long',
// //                 year: 'numeric',
// //                 month: 'long',
// //                 day: 'numeric'
// //             });

// //             appointmentItem.innerHTML = `
// //                 <div class="appointment-details">
// //                     <div class="appointment-pet-name">
// //                         <strong>${appointment.petName}</strong>
// //                     </div>
// //                     <div class="appointment-type">
// //                         <span>${appointment.type}</span>
// //                     </div>
// //                     <div class="appointment-date">
// //                         <span>${formattedDate}</span>
// //                     </div>
// //                 </div>
// //             `;
// //             appointmentsList.appendChild(appointmentItem);
// //         });
// //     }

// //     // Function to render pet list
// //     function renderPetList() {
// //         const petList = document.getElementById('pet-list');
// //         petList.innerHTML = '';

// //         registeredPets.forEach(pet => {
// //             const petItem = document.createElement('div');
// //             petItem.className = 'pet-item';
// //             petItem.innerHTML = `
// //                 <button type="button" class="pet-button" data-pet-id="${pet.id}">${pet.name} (${pet.type})</button>
// //             `;
// //             petList.appendChild(petItem);
// //         });

// //         // Add event listeners for pet selection
// //         document.querySelectorAll('.pet-button').forEach(button => {
// //             button.addEventListener('click', (e) => {
// //                 const petId = parseInt(e.target.dataset.petId);
// //                 const pet = registeredPets.find(p => p.id === petId);
// //                 if (selectedPets.some(p => p.id === petId)) {
// //                     // Deselect
// //                     selectedPets = selectedPets.filter(p => p.id !== petId);
// //                     button.classList.remove('selected');
// //                 } else {
// //                     // Select
// //                     selectedPets.push(pet);
// //                     button.classList.add('selected');
// //                 }
// //             });
// //         });
// //     }

// //     // Function to show step
// //     function showStep(step) {
// //         steps.forEach(s => s.style.display = 'none');
// //         stepIndicators.forEach((indicator, index) => {
// //             if (index + 1 === step) {
// //                 indicator.classList.add('active');
// //             } else {
// //                 indicator.classList.remove('active');
// //             }
// //         });

// //         document.getElementById(`step-${step}`).style.display = 'block';
// //         currentStep = step;

// //         // Update buttons
// //         backBtn.style.display = step > 1 ? 'inline-block' : 'none';
// //         nextBtn.style.display = step < 4 ? 'inline-block' : 'none';
// //         submitBtn.style.display = step === 4 ? 'inline-block' : 'none';

// //         // Special handling for each step
// //         if (step === 1) {
// //             renderPetList();
// //         } else if (step === 2) {
// //             unavailableMessage.style.display = 'none';
// //         } else if (step === 3) {
// //             // Small delay to ensure DOM is ready
// //             setTimeout(() => {
// //                 renderCalendar();
// //             }, 10);
// //         } else if (step === 4) {
// //             renderConfirmation();
// //         }
// //     }

// //     // Function to handle next button
// //     nextBtn.addEventListener('click', () => {
// //         if (currentStep === 1) {
// //             if (selectedPets.length === 0) {
// //                 showFeedback('Please select at least one pet.', 'error');
// //                 return;
// //             }
// //         } else if (currentStep === 2) {
// //             if (!selectedAppointmentType) {
// //                 showFeedback('Please select an appointment type.', 'error');
// //                 return;
// //             }
// //             if (selectedAppointmentType === 'Spay' || selectedAppointmentType === 'Neuter') {
// //                 showFeedback('This service is not available yet. Please wait for notifications.', 'error');
// //                 return;
// //             }
// //         } else if (currentStep === 3) {
// //             if (!selectedDate) {
// //                 showFeedback('Please select a date.', 'error');
// //                 return;
// //             }
// //         }

// //         if (currentStep < 4) {
// //             showStep(currentStep + 1);
// //         }
// //     });

// //     // Function to handle back button
// //     backBtn.addEventListener('click', () => {
// //         if (currentStep > 1) {
// //             showStep(currentStep - 1);
// //         }
// //     });

// //     // Handle appointment type selection
// //     document.getElementById('appointment-types').addEventListener('click', (e) => {
// //         if (e.target.tagName === 'BUTTON') {
// //             selectedAppointmentType = e.target.dataset.type;
// //             document.querySelectorAll('#appointment-types button').forEach(btn => btn.classList.remove('selected'));
// //             e.target.classList.add('selected');

// //             if (selectedAppointmentType === 'Spay' || selectedAppointmentType === 'Neuter') {
// //                 unavailableMessage.style.display = 'block';
// //             } else {
// //                 unavailableMessage.style.display = 'none';
// //             }
// //         }
// //     });

// //     // Function to render confirmation
// //     function renderConfirmation() {
// //         const confirmationDetails = document.getElementById('confirmation-details');
// //         const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
// //             weekday: 'long',
// //             year: 'numeric',
// //             month: 'long',
// //             day: 'numeric'
// //         });

// //         confirmationDetails.innerHTML = `
// //             <p><strong>Pet:</strong> ${selectedPet.name} (${selectedPet.type})</p>
// //             <p><strong>Appointment Type:</strong> ${selectedAppointmentType}</p>
// //             <p><strong>Date:</strong> ${formattedDate}</p>
// //         `;
// //     }

// //     // Modal functionality
// //     addAppointmentBtn.addEventListener('click', () => {
// //         modal.style.display = 'block';
// //         resetForm();
// //         showStep(1);
// //     });

// //     closeBtn.addEventListener('click', () => {
// //         modal.style.display = 'none';
// //         resetForm();
// //     });

// //     window.addEventListener('click', (event) => {
// //         if (event.target === modal) {
// //             modal.style.display = 'none';
// //             resetForm();
// //         }
// //     });

// //     // Form submission
// //     appointmentForm.addEventListener('submit', (e) => {
// //         e.preventDefault();

// //         // Create new appointments for each selected pet
// //         selectedPets.forEach(pet => {
// //             const newAppointment = {
// //                 id: Date.now() + Math.random(), // Ensure unique IDs
// //                 petName: pet.name,
// //                 type: selectedAppointmentType,
// //                 date: selectedDate
// //             };
// //             appointments.push(newAppointment);
// //         });

// //         localStorage.setItem('appointments', JSON.stringify(appointments));
// //         renderAppointments();
// //         showFeedback('Appointments booked successfully!');
// //         modal.style.display = 'none';
// //         resetForm();
// //     });

// //     // Function to reset form
// //     function resetForm() {
// //         appointmentForm.reset();
// //         selectedPets = [];
// //         selectedAppointmentType = '';
// //         selectedDate = null;
// //         currentStep = 1;
// //         document.querySelectorAll('#appointment-types button').forEach(btn => btn.classList.remove('selected'));
// //         document.querySelectorAll('.pet-button').forEach(btn => btn.classList.remove('selected'));
// //         unavailableMessage.style.display = 'none';
// //     }

// //     // Initial render
// //     renderAppointments();
// //     renderCalendar();

// //     console.log('Appointment page loaded successfully');
// // });

// // // Calendar variables
// // const monthYear = document.getElementById('month-year');
// // const daysContainer = document.getElementById('days');
// // const prev_Btn = document.getElementById('previous');
// // const next_Btn = document.getElementById('next');

// // let currentDate = new Date();

// // function renderCalendar() {
// //     const year = currentDate.getFullYear();
// //     const month = currentDate.getMonth();

// //     // Update header
// //     const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// //     monthYear.textContent = `${monthNames[month]} ${year}`;

// //     // Clear previous days
// //     daysContainer.innerHTML = '';

// //     // Get first day of the month and last day
// //     const firstDay = new Date(year, month, 1);
// //     const lastDay = new Date(year, month + 1, 0);
// //     const startDay = firstDay.getDay(); // 0 = Sunday
// //     const totalDays = lastDay.getDate();

// //     // Add empty cells for days before the first day of the month
// //     for (let i = 0; i < startDay; i++) {
// //         const emptyDiv = document.createElement('div');
// //         emptyDiv.classList.add('day', 'other-month');
// //         daysContainer.appendChild(emptyDiv);
// //     }

// //     // Add days of the month
// //     for (let day = 1; day <= totalDays; day++) {
// //         const dayDiv = document.createElement('div');
// //         dayDiv.classList.add('day');
// //         dayDiv.textContent = day;

// //         const dayOfWeek = new Date(year, month, day).getDay(); // 0 = Sunday, 6 = Saturday

// //         if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
// //             dayDiv.classList.add('weekend');
// //         } else {
// //             dayDiv.addEventListener('click', () => {
// //                 // Remove previous selection
// //                 document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
// //                 // Select this day
// //                 dayDiv.classList.add('selected');
// //                 selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
// //                 console.log(`Selected: ${monthNames[month]} ${day}, ${year}`);
// //             });
// //         }

// //         daysContainer.appendChild(dayDiv);
// //     }

// //     // Add empty cells for days after the last day of the month to fill the grid
// //     const totalCells = startDay + totalDays;
// //     const remainingCells = 42 - totalCells; // 6 weeks * 7 days = 42
// //     for (let i = 0; i < remainingCells; i++) {
// //         const emptyDiv = document.createElement('div');
// //         emptyDiv.classList.add('day', 'other-month');
// //         daysContainer.appendChild(emptyDiv);
// //     }
// // }

// // // Event listeners for navigation
// // prev_Btn.addEventListener('click', () => {
// //     currentDate.setMonth(currentDate.getMonth() - 1);
// //     renderCalendar();
// // });

// // next_Btn.addEventListener('click', () => {
// //     currentDate.setMonth(currentDate.getMonth() + 1);
// //     renderCalendar();
// // });

// // // Initial render
// // renderCalendar();

// // console.log('Appointment script loaded');




// // Appointment JavaScript for managing appointments

// document.addEventListener('DOMContentLoaded', function() {
//     const appointmentsList = document.querySelector('.appointments-list');
//     const feedbackMessage = document.getElementById('feedback-message');

//     // Modal elements
//     const modal = document.getElementById('appointment-modal');
//     const modalFeedbackMessage = document.getElementById('modal-feedback-message');
//     const closeBtn = document.querySelector('.close');
//     const addAppointmentBtn = document.getElementById('add-appointment-btn');

//     // Form elements
//     const appointmentForm = document.getElementById('appointment-form');
//     const unavailableMessage = document.getElementById('unavailable-message');

//     // Step elements
//     const steps = document.querySelectorAll('.form-step');
//     const stepIndicators = document.querySelectorAll('.step');

//     // Button elements
//     const nextBtn = document.getElementById('next-btn');
//     const backBtn = document.getElementById('back-btn');
//     const submitBtn = document.getElementById('submit-btn');

//     // Mock data for appointments
//     let appointments = JSON.parse(localStorage.getItem('appointments')) || [
//         {
//             id: 1,
//             petName: 'Buddy',
//             type: 'Consultation',
//             date: '2024-12-15'
//         },
//         {
//             id: 2,
//             petName: 'Whiskers',
//             type: 'Anti-Rabies Vaccination',
//             date: '2024-12-18'
//         },
//         {
//             id: 3,
//             petName: 'Max',
//             type: 'Consultation',
//             date: '2024-12-20'
//         }
//     ];

//     // Mock registered pets
//     const registeredPets = [
//         { id: 1, name: 'Buddy', type: 'Dog' },
//         { id: 2, name: 'Whiskers', type: 'Cat' },
//         { id: 3, name: 'Max', type: 'Dog' },
//         { id: 4, name: 'Fluffy', type: 'Cat' }
//     ];

//     // Track current selections
//     let currentStep = 1;
//     let selectedPets = [];
//     let selectedAppointmentType = '';
//     let selectedDate = null;

//     // Function to display feedback message
//     function showFeedback(message, type = 'success') {
//         const targetMessage = (type === 'error' && modal.style.display === 'block') ? modalFeedbackMessage : feedbackMessage;
//         targetMessage.textContent = message;
//         targetMessage.className = `feedback ${type}`;
//         targetMessage.classList.remove('hidden');

//         // Hide the message after 5 seconds
//         setTimeout(() => {
//             targetMessage.classList.add('hidden');
//         }, 5000);
//     }

//     // Function to render appointments
//     function renderAppointments() {
//         appointmentsList.innerHTML = '';

//         if (appointments.length === 0) {
//             appointmentsList.innerHTML = '<p class="no-appointments">No appointments found.</p>';
//             return;
//         }

//         appointments.forEach(appointment => {
//             const appointmentItem = document.createElement('div');
//             appointmentItem.className = 'appointment-item';

//             // Format date to readable format
//             const appointmentDate = new Date(appointment.date);
//             const formattedDate = appointmentDate.toLocaleDateString('en-US', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             });

//             appointmentItem.innerHTML = `
//                 <div class="appointment-details">
//                     <div class="appointment-pet-name">
//                         <strong>${appointment.petName}</strong>
//                     </div>
//                     <div class="appointment-type">
//                         <span>${appointment.type}</span>
//                     </div>
//                     <div class="appointment-date">
//                         <span>${formattedDate}</span>
//                     </div>
//                 </div>
//             `;
//             appointmentsList.appendChild(appointmentItem);
//         });
//     }

//     // Function to render pet list
//     function renderPetList() {
//         const petList = document.getElementById('pet-list');
//         petList.innerHTML = '';

//         registeredPets.forEach(pet => {
//             const petItem = document.createElement('div');
//             petItem.className = 'pet-item';
//             petItem.innerHTML = `
//                 <button type="button" class="pet-button" data-pet-id="${pet.id}">${pet.name} (${pet.type})</button>
//             `;
//             petList.appendChild(petItem);
//         });

//         // Add event listeners for pet selection
//         document.querySelectorAll('.pet-button').forEach(button => {
//             button.addEventListener('click', (e) => {
//                 const petId = parseInt(e.target.dataset.petId);
//                 const pet = registeredPets.find(p => p.id === petId);
//                 if (selectedPets.some(p => p.id === petId)) {
//                     // Deselect
//                     selectedPets = selectedPets.filter(p => p.id !== petId);
//                     button.classList.remove('selected');
//                 } else {
//                     // Select
//                     selectedPets.push(pet);
//                     button.classList.add('selected');
//                 }
//             });
//         });
//     }

//     // Function to show step
//     function showStep(step) {
//         steps.forEach(s => s.style.display = 'none');
//         stepIndicators.forEach((indicator, index) => {
//             if (index + 1 === step) {
//                 indicator.classList.add('active');
//             } else {
//                 indicator.classList.remove('active');
//             }
//         });

//         document.getElementById(`step-${step}`).style.display = 'block';
//         currentStep = step;

//         // Update buttons
//         backBtn.style.display = step > 1 ? 'inline-block' : 'none';
//         nextBtn.style.display = step < 4 ? 'inline-block' : 'none';
//         submitBtn.style.display = step === 4 ? 'inline-block' : 'none';

//         // Special handling for each step
//         if (step === 1) {
//             renderPetList();
//         } else if (step === 2) {
//             unavailableMessage.style.display = 'none';
//         } else if (step === 3) {
//             // Reset calendar to current month when entering step 3
//             currentDate = new Date();
//             // Small delay to ensure DOM is ready
//             setTimeout(() => {
//                 renderCalendar();
//             }, 10);
//         } else if (step === 4) {
//             renderConfirmation();
//         }
//     }

//     // Function to handle next button
//     nextBtn.addEventListener('click', () => {
//         if (currentStep === 1) {
//             if (selectedPets.length === 0) {
//                 showFeedback('Please select at least one pet.', 'error');
//                 return;
//             }
//         } else if (currentStep === 2) {
//             if (!selectedAppointmentType) {
//                 showFeedback('Please select an appointment type.', 'error');
//                 return;
//             }
//             if (selectedAppointmentType === 'Spay' || selectedAppointmentType === 'Neuter' || selectedAppointmentType === 'Deworming') {
//                 showFeedback('This service is not available yet. Please wait for notifications.', 'error');
//                 return;
//             }
//         } else if (currentStep === 3) {
//             if (!selectedDate) {
//                 showFeedback('Please select a date.', 'error');
//                 return;
//             }
//         }

//         if (currentStep < 4) {
//             showStep(currentStep + 1);
//         }
//     });

//     // Function to handle back button
//     backBtn.addEventListener('click', () => {
//         if (currentStep > 1) {
//             showStep(currentStep - 1);
//         }
//     });

//     // Handle appointment type selection
//     document.getElementById('appointment-types').addEventListener('click', (e) => {
//         if (e.target.tagName === 'BUTTON') {
//             selectedAppointmentType = e.target.dataset.type;
//             document.querySelectorAll('#appointment-types button').forEach(btn => btn.classList.remove('selected'));
//             e.target.classList.add('selected');

//             if (selectedAppointmentType === 'Spay' || selectedAppointmentType === 'Neuter' || selectedAppointmentType === 'Deworming') {
//                 unavailableMessage.style.display = 'block';
//             } else {
//                 unavailableMessage.style.display = 'none';
//             }
//         }
//     });

//     // Function to render confirmation
//     function renderConfirmation() {
//         const confirmationDetails = document.getElementById('confirmation-details');
//         const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });

//         const petNames = selectedPets.map(pet => `${pet.name} (${pet.type})`).join(', ');

//         confirmationDetails.innerHTML = `
//             <p><strong>Pet(s):</strong> ${petNames}</p>
//             <p><strong>Appointment Type:</strong> ${selectedAppointmentType}</p>
//             <p><strong>Date:</strong> ${formattedDate}</p>
//         `;
//     }

//     // Modal functionality
//     addAppointmentBtn.addEventListener('click', () => {
//         modal.style.display = 'block';
//         resetForm();
//         showStep(1);
//     });

//     closeBtn.addEventListener('click', () => {
//         modal.style.display = 'none';
//         resetForm();
//     });

//     window.addEventListener('click', (event) => {
//         if (event.target === modal) {
//             modal.style.display = 'none';
//             resetForm();
//         }
//     });

//     // Form submission
//     appointmentForm.addEventListener('submit', (e) => {
//         e.preventDefault();

//         // Create new appointments for each selected pet
//         selectedPets.forEach(pet => {
//             const newAppointment = {
//                 id: Date.now() + Math.random(), // Ensure unique IDs
//                 petName: pet.name,
//                 type: selectedAppointmentType,
//                 date: selectedDate
//             };
//             appointments.push(newAppointment);
//         });

//         localStorage.setItem('appointments', JSON.stringify(appointments));
//         renderAppointments();
//         showFeedback('Appointments booked successfully!');
//         modal.style.display = 'none';
//         resetForm();
//     });

//     // Function to reset form
//     function resetForm() {
//         appointmentForm.reset();
//         selectedPets = [];
//         selectedAppointmentType = '';
//         selectedDate = null;
//         currentStep = 1;
//         document.querySelectorAll('#appointment-types button').forEach(btn => btn.classList.remove('selected'));
//         document.querySelectorAll('.pet-button').forEach(btn => btn.classList.remove('selected'));
//         unavailableMessage.style.display = 'none';
//     }

//     // Initial render
//     renderAppointments();

//     console.log('Appointment page loaded successfully');
// });

// // Calendar variables
// const monthYear = document.getElementById('month-year');
// const daysContainer = document.getElementById('days');
// const prev_Btn = document.getElementById('previous');
// const next_Btn = document.getElementById('next');

// let currentDate = new Date();
// let selectedDate = null;
// let selectedAppointmentType = '';

// function renderCalendar() {
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Update header
//     const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//     monthYear.textContent = `${monthNames[month]} ${year}`;

//     // Clear previous days
//     daysContainer.innerHTML = '';

//     // Get first day of the month and last day
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const startDay = firstDay.getDay(); // 0 = Sunday
//     const totalDays = lastDay.getDate();

//     // Determine if the current displayed month is in the past
//     const currentMonthDate = new Date(year, month, 1);
//     const todayMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
//     const isPastMonth = currentMonthDate < todayMonthDate;

//     // Disable/Enable navigation buttons
//     prev_Btn.disabled = isPastMonth || (year === today.getFullYear() && month === today.getMonth());
    
//     // Update button styles based on disabled state
//     if (prev_Btn.disabled) {
//         prev_Btn.style.opacity = '0.5';
//         prev_Btn.style.cursor = 'not-allowed';
//     } else {
//         prev_Btn.style.opacity = '1';
//         prev_Btn.style.cursor = 'pointer';
//     }

//     // Add empty cells for days before the first day of the month
//     for (let i = 0; i < startDay; i++) {
//         const emptyDiv = document.createElement('div');
//         emptyDiv.classList.add('day', 'other-month');
//         daysContainer.appendChild(emptyDiv);
//     }

//     // Add days of the month
//     for (let day = 1; day <= totalDays; day++) {
//         const dayDiv = document.createElement('div');
//         dayDiv.classList.add('day');
//         dayDiv.textContent = day;

//         const currentDayDate = new Date(year, month, day);
//         currentDayDate.setHours(0, 0, 0, 0);
//         const dayOfWeek = currentDayDate.getDay(); // 0 = Sunday, 6 = Saturday

//         // Check if day is in the past
//         const isPastDay = currentDayDate < today;

//         // Always disable past dates
//         if (isPastDay) {
//             dayDiv.classList.add('disabled');
//         } 
//         // Check appointment type and disable accordingly
//         else if (selectedAppointmentType === 'Consultation') {
//             // For Consultation: Only enable Monday (1), disable all other days
//             if (dayOfWeek !== 1) {
//                 dayDiv.classList.add('disabled');
//             }
//         } else if (selectedAppointmentType === 'Anti-Rabies Vaccination') {
//             // For Anti-Rabies Vaccination: Only disable weekends (Saturday=6, Sunday=0)
//             if (dayOfWeek === 0 || dayOfWeek === 6) {
//                 dayDiv.classList.add('disabled');
//             }
//         } else if (selectedAppointmentType === 'Deworming' || 
//                    selectedAppointmentType === 'Spay' || 
//                    selectedAppointmentType === 'Neuter') {
//             // These services are unavailable, so disable all dates
//             dayDiv.classList.add('disabled');
//         } else {
//             // Default: Disable weekends
//             if (dayOfWeek === 0 || dayOfWeek === 6) {
//                 dayDiv.classList.add('disabled');
//             }
//         }

//         // Add click event only if not disabled
//         if (!dayDiv.classList.contains('disabled')) {
//             dayDiv.addEventListener('click', () => {
//                 // Remove previous selection
//                 document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
//                 // Select this day
//                 dayDiv.classList.add('selected');
//                 selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//                 console.log(`Selected: ${monthNames[month]} ${day}, ${year}`);
//             });
//         }

//         daysContainer.appendChild(dayDiv);
//     }

//     // Add empty cells for days after the last day of the month to fill the grid
//     const totalCells = startDay + totalDays;
//     const remainingCells = 42 - totalCells; // 6 weeks * 7 days = 42
//     for (let i = 0; i < remainingCells; i++) {
//         const emptyDiv = document.createElement('div');
//         emptyDiv.classList.add('day', 'other-month');
//         daysContainer.appendChild(emptyDiv);
//     }
// }

// // Event listeners for navigation
// prev_Btn.addEventListener('click', () => {
//     if (!prev_Btn.disabled) {
//         currentDate.setMonth(currentDate.getMonth() - 1);
//         renderCalendar();
//     }
// });

// next_Btn.addEventListener('click', () => {
//     currentDate.setMonth(currentDate.getMonth() + 1);
//     renderCalendar();
// });

// // Initial render
// renderCalendar();

// console.log('Appointment script loaded');

// // Add this CSS dynamically if not in your CSS file
// const style = document.createElement('style');
// style.textContent = `
//     .day.disabled {
//         background-color: #f5f5f5;
//         color: #999;
//         cursor: not-allowed;
//         pointer-events: none;
//     }
// `;
// document.head.appendChild(style);



// Appointment JavaScript for managing appointments

document.addEventListener('DOMContentLoaded', function() {
    const appointmentsList = document.querySelector('.appointments-list');
    const feedbackMessage = document.getElementById('feedback-message');

    // Modal elements
    const modal = document.getElementById('appointment-modal');
    const modalFeedbackMessage = document.getElementById('modal-feedback-message');
    const closeBtn = document.querySelector('.close');
    const addAppointmentBtn = document.getElementById('add-appointment-btn');

    // Form elements
    const appointmentForm = document.getElementById('appointment-form');
    const unavailableMessage = document.getElementById('unavailable-message');

    // Step elements
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');

    // Button elements
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const submitBtn = document.getElementById('submit-btn');

    // Mock data for appointments
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [
        {
            id: 1,
            petName: 'Buddy',
            type: 'Consultation',
            date: '2024-12-15'
        },
        {
            id: 2,
            petName: 'Whiskers',
            type: 'Anti-Rabies Vaccination',
            date: '2024-12-18'
        },
        {
            id: 3,
            petName: 'Max',
            type: 'Consultation',
            date: '2024-12-20'
        }
    ];

    // Mock registered pets
    const registeredPets = [
        { id: 1, name: 'Buddy', type: 'Dog' },
        { id: 2, name: 'Whiskers', type: 'Cat' },
        { id: 3, name: 'Max', type: 'Dog' },
        { id: 4, name: 'Fluffy', type: 'Cat' }
    ];

    // Track current selections
    let currentStep = 1;
    window.selectedPets = [];
    window.selectedAppointmentType = '';
    window.selectedDate = null;

    // Function to display feedback message
    function showFeedback(message, type = 'success') {
        const targetMessage = (type === 'error' && modal.style.display === 'block') ? modalFeedbackMessage : feedbackMessage;
        targetMessage.textContent = message;
        targetMessage.className = `feedback ${type}`;
        targetMessage.classList.remove('hidden');

        // Hide the message after 5 seconds
        setTimeout(() => {
            targetMessage.classList.add('hidden');
        }, 5000);
    }

    // Function to render appointments
    function renderAppointments() {
        appointmentsList.innerHTML = '';

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-appointments">No appointments found.</p>';
            return;
        }

        appointments.forEach(appointment => {
            const appointmentItem = document.createElement('div');
            appointmentItem.className = 'appointment-item';

            // Format date to readable format
            const appointmentDate = new Date(appointment.date);
            const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            appointmentItem.innerHTML = `
                <div class="appointment-details">
                    <div class="appointment-pet-name">
                        <strong>${appointment.petName}</strong>
                    </div>
                    <div class="appointment-type">
                        <span>${appointment.type}</span>
                    </div>
                    <div class="appointment-date">
                        <span>${formattedDate}</span>
                    </div>
                </div>
            `;
            appointmentsList.appendChild(appointmentItem);
        });
    }

    // Function to render pet list
    function renderPetList() {
        const petList = document.getElementById('pet-list');
        petList.innerHTML = '';

        registeredPets.forEach(pet => {
            const petItem = document.createElement('div');
            petItem.className = 'pet-item';
            petItem.innerHTML = `
                <button type="button" class="pet-button" data-pet-id="${pet.id}">${pet.name} (${pet.type})</button>
            `;
            petList.appendChild(petItem);
        });

        // Add event listeners for pet selection
        document.querySelectorAll('.pet-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const petId = parseInt(e.target.dataset.petId);
                const pet = registeredPets.find(p => p.id === petId);
                if (window.selectedPets.some(p => p.id === petId)) {
                    // Deselect
                    window.selectedPets = window.selectedPets.filter(p => p.id !== petId);
                    button.classList.remove('selected');
                } else {
                    // Select
                    window.selectedPets.push(pet);
                    button.classList.add('selected');
                }
            });
        });
    }

    // Function to show step
    function showStep(step) {
        steps.forEach(s => s.style.display = 'none');
        stepIndicators.forEach((indicator, index) => {
            if (index + 1 === step) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        document.getElementById(`step-${step}`).style.display = 'block';
        currentStep = step;

        // Update buttons
        backBtn.style.display = step > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';

        // Change "Next" button text to "Book Appointment" on step 4
        if (step === 4) {
            nextBtn.textContent = 'Book Appointment';
        } else {
            nextBtn.textContent = 'Next';
        }

        // Special handling for each step
        if (step === 1) {
            renderPetList();
        } else if (step === 2) {
            unavailableMessage.style.display = 'none';
        } else if (step === 3) {
            // Reset calendar to current month when entering step 3
            currentDate = new Date();
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                renderCalendar();
            }, 10);
        } else if (step === 4) {
            renderConfirmation();
        }
    }

    // Function to handle next button
    nextBtn.addEventListener('click', () => {
        if (currentStep === 1) {
            if (window.selectedPets.length === 0) {
                showFeedback('Please select at least one pet.', 'error');
                return;
            }
        } else if (currentStep === 2) {
            if (!window.selectedAppointmentType) {
                showFeedback('Please select an appointment type.', 'error');
                return;
            }
            if (window.selectedAppointmentType === 'Spay' || window.selectedAppointmentType === 'Neuter' || window.selectedAppointmentType === 'Deworming') {
                showFeedback('This service is not available yet. Please wait for notifications.', 'error');
                return;
            }
        } else if (currentStep === 3) {
            if (!window.selectedDate) {
                showFeedback('Please select a date.', 'error');
                return;
            }
        } else if (currentStep === 4) {
            // Submit the appointment on step 4
            submitAppointment();
            return;
        }

        if (currentStep < 4) {
            showStep(currentStep + 1);
        }
    });

    // Function to handle back button
    backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });

    // Handle appointment type selection
    document.getElementById('appointment-types').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            window.selectedAppointmentType = e.target.dataset.type;
            document.querySelectorAll('#appointment-types button').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');

            if (window.selectedAppointmentType === 'Spay' || window.selectedAppointmentType === 'Neuter' || window.selectedAppointmentType === 'Deworming') {
                unavailableMessage.style.display = 'block';
            } else {
                unavailableMessage.style.display = 'none';
            }
        }
    });

    // Function to render confirmation
    function renderConfirmation() {
        const confirmationDetails = document.getElementById('confirmation-details');
        const formattedDate = new Date(window.selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const petNames = window.selectedPets.map(pet => `${pet.name} (${pet.type})`).join(', ');

        confirmationDetails.innerHTML = `
            <p><strong>Pet(s):</strong> ${petNames}</p>
            <p><strong>Appointment Type:</strong> ${window.selectedAppointmentType}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
        `;
    }

    // Modal functionality
    addAppointmentBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        resetForm();
        showStep(1);
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        resetForm();
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            resetForm();
        }
    });

    // Form submission
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // Function to submit appointment
    function submitAppointment() {
        // Create new appointments for each selected pet
        window.selectedPets.forEach(pet => {
            const newAppointment = {
                id: Date.now() + Math.random(), // Ensure unique IDs
                petName: pet.name,
                type: window.selectedAppointmentType,
                date: window.selectedDate
            };
            appointments.push(newAppointment);
        });

        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderAppointments();
        showFeedback('Appointments booked successfully!');
        modal.style.display = 'none';
        resetForm();
    }

    // Function to reset form
    function resetForm() {
        appointmentForm.reset();
        window.selectedPets = [];
        window.selectedAppointmentType = '';
        window.selectedDate = null;
        currentStep = 1;
        document.querySelectorAll('#appointment-types button').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.pet-button').forEach(btn => btn.classList.remove('selected'));
        unavailableMessage.style.display = 'none';
    }

    // Initial render
    renderAppointments();

    console.log('Appointment page loaded successfully');
});

// Calendar variables
const monthYear = document.getElementById('month-year');
const daysContainer = document.getElementById('days');
const prev_Btn = document.getElementById('previous');
const next_Btn = document.getElementById('next');

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // Determine if the current displayed month is in the past
    const currentMonthDate = new Date(year, month, 1);
    const todayMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const isPastMonth = currentMonthDate < todayMonthDate;

    // Disable/Enable navigation buttons
    prev_Btn.disabled = isPastMonth || (year === today.getFullYear() && month === today.getMonth());
    
    // Update button styles based on disabled state
    if (prev_Btn.disabled) {
        prev_Btn.style.opacity = '0.5';
        prev_Btn.style.cursor = 'not-allowed';
    } else {
        prev_Btn.style.opacity = '1';
        prev_Btn.style.cursor = 'pointer';
    }

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

        const currentDayDate = new Date(year, month, day);
        currentDayDate.setHours(0, 0, 0, 0);
        const dayOfWeek = currentDayDate.getDay(); // 0 = Sunday, 6 = Saturday

        // Check if day is in the past
        const isPastDay = currentDayDate < today;

        // Always disable past dates
        if (isPastDay) {
            dayDiv.classList.add('disabled');
        } 
        // Check appointment type and disable accordingly
        else if (window.selectedAppointmentType === 'Consultation') {
            // For Consultation: Only enable Monday (1), disable all other days
            if (dayOfWeek !== 1) {
                dayDiv.classList.add('disabled');
            }
        } else if (window.selectedAppointmentType === 'Anti-Rabies Vaccination') {
            // For Anti-Rabies Vaccination: Only disable weekends (Saturday=6, Sunday=0)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayDiv.classList.add('disabled');
            }
        } else if (window.selectedAppointmentType === 'Deworming' || 
                   window.selectedAppointmentType === 'Spay' || 
                   window.selectedAppointmentType === 'Neuter') {
            // These services are unavailable, so disable all dates
            dayDiv.classList.add('disabled');
        } else {
            // Default: Disable weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayDiv.classList.add('disabled');
            }
        }

        // Add click event only if not disabled
        if (!dayDiv.classList.contains('disabled')) {
            dayDiv.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
                // Select this day
                dayDiv.classList.add('selected');
                window.selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                console.log(`Selected: ${monthNames[month]} ${day}, ${year}`);
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

// Event listeners for navigation
prev_Btn.addEventListener('click', () => {
    if (!prev_Btn.disabled) {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }
});

next_Btn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Initial render
renderCalendar();

console.log('Appointment script loaded');

// Add this CSS dynamically if not in your CSS file
const style = document.createElement('style');
style.textContent = `
    .day.disabled {
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
        pointer-events: none;
    }
`;
document.head.appendChild(style);