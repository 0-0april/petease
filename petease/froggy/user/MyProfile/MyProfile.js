document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const petsContainer = document.getElementById('pets-container');

    // Mock pets data categorized
    const mockPets = {
        appointment: [
            { id: 1, name: 'Buddy', type: 'dog', breed: 'Golden Retriever', age: '6 months', description: 'Friendly golden retriever needing checkup', image: '../assets/browndog.jpg' },
            { id: 2, name: 'Whiskers', type: 'cat', breed: 'Tabby', age: '5 months', description: 'Playful tabby cat for vaccination', image: '../assets/tabby cat.jpg' },
        ],
        adoption: [
            { id: 3, name: 'Max', type: 'dog', breed: 'Shih Tzu', age: '1 year', description: 'Energetic puppy looking for home', image: '../assets/whiteshitzu.jpg' },
            { id: 4, name: 'Luna', type: 'cat', breed: 'White Cat', age: '4 months', description: 'Gentle white cat available for adoption', image: '../assets/whitecat.jpg' },
        ],
        adopted: [
            { id: 5, name: 'Shadow', type: 'cat', breed: 'Black Cat', age: '2 years', description: 'Mysterious black cat, now part of the family', image: '../assets/blackwhitecat.jpg' },
            { id: 6, name: 'Bella', type: 'dog', breed: 'Brown Dog', age: '4 years', description: 'Loyal brown dog, adopted last year', image: '../assets/browndog.jpg' },
        ]
    };

    let currentCategory = 'appointment';

    function renderPets(category) {
        const pets = mockPets[category] || [];
        petsContainer.innerHTML = '';
        pets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.innerHTML = `
                <div class="pet-image">
                    <img src="${pet.image}" alt="${pet.name}">
                </div>
                <div class="pet-info">
                    <h3>${pet.name}</h3>
                    <p><strong>Breed:</strong> ${pet.breed}</p>
                    <p><strong>Age:</strong> ${pet.age}</p>
                    <p>${pet.description}</p>
                    <button class="btn" onclick="viewPetDetails(${pet.id}, '${category}')">View Details</button>
                </div>
            `;
            petsContainer.appendChild(petCard);
        });
    }

    // Navigation button event listeners
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            renderPets(currentCategory);
        });
    });

    // Initial render
    renderPets(currentCategory);
});

function viewPetDetails(petId, category) {
    // Mock function to view pet details
    alert(`Viewing details for pet ID: ${petId} in category: ${category}`);
    // In a real app, this could open a modal or navigate to a detail page
}
