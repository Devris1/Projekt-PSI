let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];
let currentCategory = "Wszystkie";
let searchTerm = "";

// --- OBSŁUGA DROPDOWN ---
function toggleDropdown() {
    document.getElementById('mobile-dropdown').classList.toggle('open');
}

function selectDropdown(cat, label) {
    document.querySelector('.dropdown-selected').innerText = label;
    document.getElementById('mobile-dropdown').classList.remove('open');
    
    document.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.classList.toggle('active', opt.innerText === cat || (cat === "Wszystkie" && opt.innerText === "Wszystkie"));
    });

    changeCategory(cat);
}

// Zamykanie dropdowna po kliknięciu poza nim
window.addEventListener('click', (e) => {
    if (!document.getElementById('mobile-dropdown').contains(e.target)) {
        document.getElementById('mobile-dropdown').classList.remove('open');
    }
});

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
        article.innerHTML = `
            <button class="fav-icon-btn ${isFav ? 'active' : ''}" onclick="toggleFav(${car.id})">${isFav ? '❤️' : '🤍'}</button>
            <div class="image-wrapper"><img src="${car.img}" onclick="showDetails(${car.id})"></div>
            <div class="car-info">
                <span class="car-cat-label">${car.category}</span>
                <h3>${car.brand} ${car.model}</h3>
                <p class="price-tag">${car.price}</p>
                <button class="details-btn" onclick="showDetails(${car.id})">Szczegóły</button>
            </div>
        `;
        container.appendChild(article);
    });
    document.getElementById('fav-count').innerText = favorites.length;
}

document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => changeCategory(btn.getAttribute('data-category')));
});

function toggleFav(id) {
    if(favorites.includes(id)) favorites = favorites.filter(f => f !== id);
    else favorites.push(id);
    localStorage.setItem('myFavs', JSON.stringify(favorites));
    render();
}

function showDetails(id) {
    const car = carData.find(c => c.id === id);
    document.getElementById('modal-body-img').innerHTML = `<img src="${car.img}">`;
    document.getElementById('modal-body-info').innerHTML = `
        <span class="car-cat-label">${car.category}</span>
        <h2>${car.brand} ${car.model}</h2>
        <p style="margin:10px 0; color:var(--primary); font-weight:bold;">${car.hp} KM | ${car.price}</p>
        <p>${car.desc}</p>
    `;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }
render();