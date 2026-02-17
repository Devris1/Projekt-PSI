let favorites = JSON.parse(localStorage.getItem('myFavs')) || [];
let currentCategory = "Wszystkie";
let searchTerm = "";


const imageCache = new Map();

function toggleDropdown() {
    document.getElementById('mobile-dropdown')?.classList.toggle('open');
}

function selectDropdown(cat, label) {
    document.querySelector('.dropdown-selected').innerText = label;
    document.getElementById('mobile-dropdown').classList.remove('open');
    changeCategory(cat);
}

window.addEventListener('click', e => {
    const dropdown = document.getElementById('mobile-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

function changeCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === cat);
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

async function preloadImages() {
    for (const car of carData) {
        if (imageCache.has(car.img)) continue;

        const res = await fetch(car.img, { cache: 'force-cache' });
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);

        imageCache.set(car.img, bitmap);
    }
}

function render() {
    const container = document.getElementById('car-container');

    // Jeśli karty jeszcze nie istnieją – tworzymy je tylko raz
    if (!container.dataset.initialized) {
        carData.forEach(car => {
            const article = document.createElement('article');
            article.className = 'car-card';
            article.dataset.category = car.category;
            article.dataset.brand = car.brand.toLowerCase();
            article.dataset.model = car.model.toLowerCase();
            article.dataset.id = car.id;

            const isFav = favorites.includes(car.id);

            article.innerHTML = `
                <button type="button"
                    id="fav-btn-${car.id}"
                    class="fav-icon-btn ${isFav ? 'active' : ''}"
                    onclick="event.stopPropagation(); toggleFav(${car.id})">
                    ${isFav ? '❤️' : '🤍'}
                </button>
                <div class="image-wrapper" onclick="showDetails(${car.id})">
                    <img src="${car.img}" alt="${car.alt || car.model}" loading="lazy">
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

        container.dataset.initialized = 'true';
    }

    document.querySelectorAll('.car-card').forEach(card => {
        const matchesCat = currentCategory === 'Wszystkie' || card.dataset.category === currentCategory;
        const matchesSearch =
            card.dataset.brand.includes(searchTerm) ||
            card.dataset.model.includes(searchTerm);

        card.style.display = matchesCat && matchesSearch ? '' : 'none';
    });

    updateFavCounter();
}

function updateFavCounter() {
    const counter = document.getElementById('fav-count');
    if (counter) counter.innerText = favorites.length;
}

function toggleFav(id) {
    const index = favorites.indexOf(id);
    const isAdding = index === -1;

    if (isAdding) {
        favorites.push(id);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem('myFavs', JSON.stringify(favorites));

    const btn = document.getElementById(`fav-btn-${id}`);
    if (btn) {
        btn.classList.toggle('active', isAdding);
        btn.innerHTML = isAdding ? '❤️' : '🤍';
    }

    updateFavCounter();
}

function showDetails(id) {
    const car = carData.find(c => c.id === id);
    if (!car) return;

    const imgContainer = document.getElementById('modal-body-img');
    const infoContainer = document.getElementById('modal-body-info');

    imgContainer.innerHTML = '';

    const bitmap = imageCache.get(car.img);

    if (bitmap) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const containerWidth = imgContainer.clientWidth || 600;
        const aspect = bitmap.width / bitmap.height;

        canvas.width = containerWidth;
        canvas.height = Math.round(containerWidth / aspect);

        // Zachowanie jakości
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';

        imgContainer.appendChild(canvas);
    }

    infoContainer.innerHTML = `
        <span class="car-cat-label">${car.category}</span>
        <h2>${car.brand} ${car.model}</h2>
        <p style="margin:10px 0; font-weight:bold;">${car.hp} KM | ${car.price}</p>
        <p>${car.desc}</p>
    `;

    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

(async () => {
    await preloadImages();

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.category;
            if (cat && cat !== currentCategory) {
                changeCategory(cat);
            }
        });
    });

    render();
})();
