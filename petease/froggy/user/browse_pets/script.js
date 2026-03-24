document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const filterToggle = document.getElementById('filter-toggle');
    const advancedFilters = document.getElementById('advanced-filters');
    const filterColor = document.getElementById('filter-color');
    const filterAge = document.getElementById('filter-age');
    const petsContainer = document.getElementById('pets-container');
    const recommendedPetsContainer = document.getElementById('recommended-pets-container');
    const categoryButtons = document.querySelectorAll('.category-btn');

    // Sample pets data (in a real app, this would come from a backend)
    const samplePets = [
        { id: 1, name: 'Buddy', type: 'dog', breed:'golden retriever', age: '6', color: 'golden', description: 'Friendly golden retriever', medicalHistory: "none", owner: 'John Doe', image: '../assets/browndog.jpg' },
        { id: 2, name: 'Whiskers', type: 'cat', breed:'golden retriever', age: '5', color: 'tabby', description: 'Playful tabby cat', medicalHistory: "none", owner: 'Jane Smith', image: '../assets/tabby cat.jpg' },
        { id: 3, name: 'Tweety', type: 'bird', breed:'golden retriever', age: '4', color: 'colorful', description: 'Colorful parrot', medicalHistory: "none", owner: 'Bob Johnson', image: '../assets/ginger.jpg' },
        { id: 4, name: 'Max', type: 'dog', breed:'golden retriever', age: '1', color: 'brown', description: 'Energetic puppy', medicalHistory: "none", owner: 'Alice Brown', image: '../assets/whiteshitzu.jpg' },
        { id: 5, name: 'Luna', type: 'cat', breed:'golden retriever', age: '4', color: 'white', description: 'Gentle white cat', medicalHistory: "none", owner: 'Charlie Wilson', image: '../assets/whitecat.jpg' },
        { id: 6, name: 'Shadow', type: 'cat', breed:'golden retriever', age: '2', color: 'black', description: 'Mysterious black cat', medicalHistory: "none", owner: 'Diana Lee', image: '../assets/blackwhitecat.jpg' },
        { id: 7, name: 'Bella', type: 'dog', breed:'golden retriever', age: '4', color: 'brown', description: 'Loyal brown dog', medicalHistory: "none", owner: 'Eve Garcia', image: '../assets/browndog.jpg' },
        { id: 8, name: 'Milo', type: 'cat', breed:'golden retriever', age: '10', color: 'tabby', description: 'Curious tabby kitten', medicalHistory: "none", owner: 'Frank Miller', image: '../assets/tabby cat.jpg' },
        { id: 9, name: 'Coco', type: 'bird', breed:'golden retriever', age: '12', color: 'colorful', description: 'Wise old parrot', medicalHistory: "none", owner: 'Grace Taylor', image: '../assets/ginger.jpg' },
        { id: 10, name: 'Rocky', type: 'dog', breed:'golden retriever', age: '6', color: 'golden', description: 'Adventurous golden pup', medicalHistory: "none", owner: 'Henry Davis', image: '../assets/whiteshitzu.jpg' },
        { id: 11, name: 'Nala', type: 'cat', breed:'golden retriever', age: '7', color: 'white', description: 'Elegant white cat', medicalHistory: "none", owner: 'Ivy Rodriguez', image: '../assets/whitecat.jpg' },
        { id: 12, name: 'Oreo', type: 'cat', breed:'golden retriever', age: '8', color: 'black', description: 'Playful black and white kitten', medicalHistory: "none", owner: 'Jack Martinez', image: '../assets/blackwhitecat.jpg' },
        { id: 13, name: 'Daisy', type: 'dog', breed:'golden retriever', age: '8', color: 'brown', description: 'Sweet senior dog', medicalHistory: "none", owner: 'Kate Anderson', image: '../assets/browndog.jpg' },
        { id: 14, name: 'Simba', type: 'cat', breed:'golden retriever', age: '2', color: 'tabby', description: 'Majestic tabby cat', medicalHistory: "none", owner: 'Liam Thomas', image: '../assets/tabby cat.jpg' },
        { id: 15, name: 'Sunny', type: 'bird', breed:'golden retriever', age: '5', color: 'colorful', description: 'Bright and cheerful bird', medicalHistory: "none", owner: 'Mia Jackson', image: '../assets/ginger.jpg' },
    ];

    // Load pets from localStorage or use sample data
    // Clear any old data and set to samplePets
    localStorage.setItem('pets', JSON.stringify(samplePets));
    let pets = samplePets;

    let currentCategory = 'all';

    function renderPets(filteredPets, container) {
        container.innerHTML = '';
        filteredPets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.innerHTML = `
                <div class="pet-image">
                    <img src="${pet.image}" alt="${pet.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="pet-info">
                    <h3>${pet.name}</h3>
                    <p>${pet.breed}</p>
                    <p>${pet.age}</p>
                    <p>${pet.description}</p>
                </div>
            `;
            petCard.addEventListener('click', () => viewPetProfile(pet.id));
            container.appendChild(petCard);
        });
    }

    function filterPets() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedColor = filterColor.value;
        const selectedAge = filterAge.value;

        let filteredPets = pets.filter(pet => {
            const matchesSearch = pet.name.toLowerCase().includes(searchTerm) ||
                                  pet.breed.toLowerCase().includes(searchTerm) ||
                                  pet.description.toLowerCase().includes(searchTerm);
            const matchesColor = !selectedColor || pet.color === selectedColor;
            const matchesAge = !selectedAge || pet.age === selectedAge;
            const matchesCategory = currentCategory === 'all' || pet.breed === currentCategory;
            return matchesSearch && matchesColor && matchesAge && matchesCategory;
        });

        renderPets(filteredPets, petsContainer);
    }

    function renderRecommendedPets() {
        // Show first 3 pets as recommended
        const recommendedPets = pets.slice(0, 6);
        renderPets(recommendedPets, recommendedPetsContainer);
    }

    // Category button event listeners
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            filterPets();
        });
    });

    if (filterToggle) {
        filterToggle.addEventListener('click', function() {
            advancedFilters.classList.toggle('hidden');
        });
    }

    searchInput.addEventListener('input', filterPets);
    if (filterColor) filterColor.addEventListener('change', filterPets);
    if (filterAge) filterAge.addEventListener('change', filterPets);

    // Initial render
    renderRecommendedPets();
    renderPets(pets, petsContainer);
});

function viewPetProfile(petId) {
    const pets = JSON.parse(localStorage.getItem('pets')) || [];
    const pet = pets.find(p => p.id == petId);

    if (!pet) {
        alert('Pet not found.');
        return;
    }

    // Get owner info
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const owner = users.find(u => u.username === pet.owner) || { username: pet.owner, email: 'N/A', address: 'N/A' };

    const petProfile = document.getElementById('pet-profile');

    petProfile.innerHTML = `
        <div>
            <button class="close-btn" onclick="closePetProfile()">&times;</button>
            <div class="pet-header">
                <img src="${pet.image}" alt="${pet.name}" class="pet-image">
                <div class="pet-basic-info">
                    <h2>${pet.name}</h2>
                    <p>${pet.age} months old</p>
                    <p>${pet.type}  |  ${pet.breed}</p>
                </div>
            </div>
            <div class="pet-details">
                <div class="detail-section">
                    <h3>Description</h3>
                    <p>${pet.description}</p>
                </div>
                <div class="detail-section">
                    <h3>Medical History</h3>
                    <p>${pet.medicalHistory}</p>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn" ">Request Adoption</button>
                <button class="btn secondary" onclick="messageOwner('${owner.username}')">Message Owner</button>
            </div>
        </div>
    `;

    petProfile.style.display = 'flex';
}

function closePetProfile() {
    const petProfile = document.getElementById('pet-profile');
    petProfile.style.display = 'none';
}

function requestAdoption(petId) {
    localStorage.setItem('selectedPetId', petId);
}

function messageOwner(ownerUsername) {
    localStorage.setItem('selectedOwner', ownerUsername);
    window.location.href = '../MessageUser/MessageUser.html';
}

// Modal close functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('pet-profile');

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closePetProfile();
        }
    });
});
