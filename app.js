import cars from './data.js';

const carGrid = document.getElementById('carGrid');
const searchInput = document.getElementById('searchInput');
const favCountSpan = document.getElementById('favCount');
const modal = document.getElementById('carModal');
const modalDetails = document.getElementById('modalDetails');
const closeModal = document.querySelector('.close-modal');

// 1. DYNAMICZNE RENDEROWANIE
function renderCars(data) {
    carGrid.innerHTML = '';
    
    // Pobieramy listę ulubionych z LocalStorage, aby wiedzieć, które przyciski zaznaczyć
    const favorites = JSON.parse(localStorage.getItem('favCars')) || [];

    data.forEach(car => {
        const isFav = favorites.includes(car.id);
        const card = document.createElement('article');
        card.className = 'car-card';
        card.innerHTML = `
            <img src="${car.image}" alt="${car.brand} ${car.model}">
            <div class="car-info">
                <h3>${car.brand} ${car.model}</h3>
                <p>${car.engine} | ${car.power}</p>
                <p class="price">${car.price}</p>
                <button class="btn-details" data-id="${car.id}">Szczegóły</button>
                <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${car.id}">
                    ${isFav ? '❤ Ulubiony' : '♡ Do ulubionych'}
                </button>
            </div>
        `;
        carGrid.appendChild(card);
    });
}

// 2. WYSZUKIWARKA W CZASIE RZECZYWISTYM
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = cars.filter(car => 
        car.brand.toLowerCase().includes(term) || 
        car.model.toLowerCase().includes(term)
    );
    renderCars(filtered);
});

// 3. OBSŁUGA KLIKNIĘĆ (Delegacja zdarzeń)
carGrid.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    
    if (e.target.classList.contains('btn-details')) {
        openModal(id);
    }
    
    if (e.target.classList.contains('btn-fav')) {
        toggleFavorite(id);
    }
});

// 4. MODAL (POP-UP)
function openModal(id) {
    const car = cars.find(c => c.id === id);
    modalDetails.innerHTML = `
        <h2>${car.brand} ${car.model}</h2>
        <img src="${car.image}" style="width:100%; border-radius:10px; margin: 15px 0;">
        <p><strong>Silnik:</strong> ${car.engine}</p>
        <p><strong>Moc:</strong> ${car.power}</p>
        <p><strong>V-Max:</strong> ${car.topSpeed}</p>
        <p style="margin-top: 15px;">${car.description}</p>
        <p class="price" style="margin-top: 15px;">Cena: ${car.price}</p>
    `;
    modal.style.display = 'flex';
}

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };

// 5. LOCAL STORAGE (Ulubione)
function toggleFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favCars')) || [];
    
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    
    localStorage.setItem('favCars', JSON.stringify(favorites));
    updateFavCount();
    renderCars(cars); // Odświeżamy widok, by zmienić ikony serc
}

function updateFavCount() {
    const favorites = JSON.parse(localStorage.getItem('favCars')) || [];
    favCountSpan.innerText = favorites.length;
}

// Inicjalizacja
renderCars(cars);
updateFavCount();