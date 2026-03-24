// Search Page JavaScript for interactive functionality

// Mock pet data
const mockPets = [
    {
        id: 1,
        name: 'Buddy',
        type: 'dog',
        age: 'young',
        breed: 'Golden Retriever',
        description: 'Friendly and energetic dog looking for a loving home.',
        image: '../assets/browndog.jpg',
        owner: 'John Doe',
        location: 'New York, NY'
    },
    {
        id: 2,
        name: 'Whiskers',
        type: 'cat',
        age: 'adult',
        breed: 'Siamese',
        description: 'Playful cat who loves cuddles and treats.',
        image: '../assets/browndog.jpg',
        owner: 'Jane Smith',
        location: 'Los Angeles, CA'
    },
    {
        id: 3,
        name: 'Max',
        type: 'dog',
        age: 'puppy',
        breed: 'Labrador',
        description: 'Adorable puppy full of energy and love.',
        image: '../assets/browndog.jpg',
        owner: 'Bob Johnson',
        location: 'Chicago, IL'
    },
    {
        id: 4,
        name: 'Tweety',
        type: 'bird',
        age: 'young',
        breed: 'Canary',
        description: 'Beautiful singing bird looking for a quiet home.',
        image: '../assets/browndog.jpg',
        owner: 'Alice Brown',
        location: 'Miami, FL'
    },
    {
        id: 5,
        name: 'Fluffy',
        type: 'other',
        age: 'senior',
        breed: 'Rabbit',
        description: 'Gentle senior rabbit who enjoys carrots and petting.',
        image: '../assets/browndog.jpg',
        owner: 'Charlie Wilson',
        location: 'Seattle, WA'
    }
];

let currentPet = null;

// Function to show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Function to display pets in masonry layout
function displayPets(pets) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    if (pets.length === 0) {
        resultsContainer.innerHTML = '<p>No pets found matching your criteria.</p>';
        return;
    }

    pets.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        petCard.innerHTML = `
            <img src="${pet.image}" alt="${pet.name}">
            <div class="pet-info">
                <h3>${pet.name}</h3>
                <p>${pet.breed} - ${pet.age.charAt(0).toUpperCase() + pet.age.slice(1)}</p>
                <p>${pet.location}</p>
            </div>
        `;
        petCard.addEventListener('click', () => viewPetProfile(pet));
        resultsContainer.appendChild(petCard);
    });
}

// Function to view pet profile
function viewPetProfile(pet) {
    if (!pet) {
        alert('Pet not found.');
        return;
    }

    const petProfile = document.getElementById('pet-profile');

    petProfile.innerHTML = `
        <div>
            <button class="close-btn" onclick="closePetProfile()">&times;</button>
            <div class="pet-header">
                <img src="${pet.image}" alt="${pet.name}" class="pet-image">
                <div class="pet-basic-info">
                    <h2>${pet.name}</h2>
                    <p>${pet.age.charAt(0).toUpperCase() + pet.age.slice(1)}</p>
                    <p>${pet.type} | ${pet.breed}</p>
                </div>
            </div>
            <div class="pet-details">
                <div class="detail-section">
                    <h3>Description</h3>
                    <p>${pet.description}</p>
                </div>
                <div class="detail-section">
                    <h3>Location</h3>
                    <p>${pet.location}</p>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn" onclick="requestAdoption(${pet.id})">Request Adoption</button>
                <button class="btn secondary" onclick="messageOwner('${pet.owner}')">Message Owner</button>
            </div>
        </div>
    `;

    petProfile.style.display = 'flex';
}

// Function to close pet profile
function closePetProfile() {
    const petProfile = document.getElementById('pet-profile');
    petProfile.style.display = 'none';
}

// Function to request adoption
function requestAdoption(petId) {
    const pet = mockPets.find(p => p.id === petId);
    if (pet) {
        showToast(`Adoption request sent for ${pet.name}!`, 'success');
        setTimeout(() => {
            window.location.href = '../AdoptionRequest/AdoptionRequest.html';
        }, 1500);
    }
}

// Function to message owner
function messageOwner(owner) {
    showToast(`Opening message to ${owner}...`, 'info');
    setTimeout(() => {
        window.location.href = '../MessageUser/MessageUser.html';
    }, 1500);
}

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');

    // Function to perform search
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();

        // Filter pets based on search criteria
        const filteredPets = mockPets.filter(pet => {
            const matchesSearch = pet.name.toLowerCase().includes(searchTerm) ||
                                pet.breed.toLowerCase().includes(searchTerm) ||
                                pet.description.toLowerCase().includes(searchTerm);

            return matchesSearch;
        });

        displayPets(filteredPets);
        showToast(`Found ${filteredPets.length} pet(s) matching your search.`);
    }

    // Event listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Initial load - show all pets
    displayPets(mockPets);

    console.log('Search page loaded successfully');
});

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
