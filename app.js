let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];
let currentCategory = "Wszystkie";
let searchTerm = "";

// --- OBSŁUGA DROPDOWN (Menu mobilne) ---
function toggleDropdown() {
    const dropdown = document.getElementById('mobile-dropdown');
    dropdown.classList.toggle('open');
}

function selectDropdown(cat, label) {
    document.querySelector('.dropdown-selected').innerText = label;
    document.getElementById('mobile-dropdown').classList.remove('open');
    
    document.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.classList.toggle('active', opt.innerText === cat || (cat === "Wszystkie" && opt.innerText === "Wszystkie"));
    });

    changeCategory(cat);
}

window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('mobile-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

// --- LOGIKA GŁÓWNA ---

function changeCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === cat);
    });
    render();
}

function syncSearch(input) {
    searchTerm = input.value.toLowerCase();
    document.querySelectorAll('.search-input').forEach(i => i.value = input.value);
    render();
}

function toggleMobileSearch() {
    const bar = document.getElementById('mobile-search-bar');
    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
}

function render() {
    const container = document.getElementById('car-container');
    
    const filtered = carData.filter(car => {
        const matchesCat = currentCategory === "Wszystkie" || car.category === currentCategory;
        const matchesSearch = car.brand.toLowerCase().includes(searchTerm) || car.model.toLowerCase().includes(searchTerm);
        return matchesCat && matchesSearch;
    });

    container.innerHTML = '';
    
    filtered.forEach(car => {
        const isFav = favorites.includes(car.id);
        const article = document.createElement('article');
        article.className = 'car-card';
        
        // Dodano id do przycisku ulubionych, aby móc go łatwo znaleźć bez przerysowania całości
        article.innerHTML = `
            <button type="button" 
                    id="fav-btn-${car.id}"
                    class="fav-icon-btn ${isFav ? 'active' : ''}" 
                    onclick="event.stopPropagation(); toggleFav(${car.id})" 
                    title="${isFav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}">
                ${isFav ? '❤️' : '🤍'}
            </button>
            <div class="image-wrapper">
                <img src="${car.img}" alt="${car.alt || car.model}" onclick="showDetails(${car.id})">
            </div>
            <div class="car-info">
                <span class="car-cat-label">${car.category}</span>
                <h3>${car.brand} ${car.model}</h3>
                <p class="price-tag">${car.price}</p>
                <button type="button" class="details-btn" onclick="showDetails(${car.id})">Szczegóły</button>
            </div>
        `;
        container.appendChild(article);
    });
    
    updateFavCounter();
}

function updateFavCounter() {
    const counter = document.getElementById('fav-count');
    if (counter) counter.innerText = favorites.length;
}

// Obsługa przycisków kategorii na desktopie
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => changeCategory(btn.getAttribute('data-category')));
});

// --- FUNKCJE AKCJI ---

function toggleFav(id) {
    const index = favorites.indexOf(id);
    const isAdding = index === -1;

    if(isAdding) {
        favorites.push(id);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('myFavs', JSON.stringify(favorites));
    
    // Zamiast render(), aktualizujemy tylko konkretny przycisk w DOM
    const btn = document.getElementById(`fav-btn-${id}`);
    if (btn) {
        btn.classList.toggle('active', isAdding);
        btn.innerHTML = isAdding ? '❤️' : '🤍';
        btn.title = isAdding ? 'Usuń z ulubionych' : 'Dodaj do ulubionych';
    }

    updateFavCounter();
}

function showDetails(id) {
    const car = carData.find(c => c.id === id);
    if (!car) return;

    document.getElementById('modal-body-img').innerHTML = `<img src="${car.img}" alt="${car.alt || car.model}">`;
    document.getElementById('modal-body-info').innerHTML = `
        <span class="car-cat-label">${car.category}</span>
        <h2>${car.brand} ${car.model}</h2>
        <p style="margin:10px 0; color:var(--primary); font-weight:bold;">${car.hp} KM | ${car.price}</p>
        <p>${car.desc}</p>
    `;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
}

render();