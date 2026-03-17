// Multi-step wizard logic
let currentStep = 1;
const totalSteps = 6;
const preferencesData = {};

const steps = document.querySelectorAll('.step');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const stepIndicator = document.getElementById('stepIndicator');
const breedSelect = document.getElementById('breed');

// Breed options based on pet type
const breeds = {
    dog: ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Any'],
    cat: ['Persian', 'Maine Coon', 'Siamese', 'British Shorthair', 'Ragdoll', 'Bengal', 'Any']
};

// Function to show current step
function showStep(step) {
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    stepIndicator.textContent = `Step ${step} of ${totalSteps}`;
    prevBtn.disabled = step === 1;
    nextBtn.textContent = step === totalSteps ? 'Submit' : 'Next';
}

// Function to validate current step
function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    const inputs = stepElement.querySelectorAll('input[required], select[required]');
    for (let input of inputs) {
        if (!input.value) {
            alert('Please select an option before proceeding.');
            return false;
        }
    }
    return true;
}

// Function to collect data from current step
function collectData(step) {
    const stepElement = document.getElementById(`step${step}`);
    const inputs = stepElement.querySelectorAll('input[name], select[name]');
    inputs.forEach(input => {
        if (input.type === 'radio' && input.checked) {
            preferencesData[input.name] = input.value;
        } else if (input.type === 'select-one') {
            preferencesData[input.name] = input.value;
        }
    });
}

// Function to update breed options based on pet type
function updateBreeds() {
    const petType = preferencesData.petType;
    breedSelect.innerHTML = '<option value="">Select a breed</option>';
    if (petType && breeds[petType]) {
        breeds[petType].forEach(breed => {
            const option = document.createElement('option');
            option.value = breed.toLowerCase().replace(' ', '-');
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    }
}

// Event listeners
nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    collectData(currentStep);
    if (currentStep === 2) updateBreeds(); // Update breeds after selecting pet type
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    } else {
        // Submit data
        localStorage.setItem('userPreferences', JSON.stringify(preferencesData));
        alert('Preferences saved successfully! Redirecting to homepage...');
        // window.location.href = '../Homepage/Homepage.html'; // Uncomment when ready
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

// Initialize
showStep(currentStep);
