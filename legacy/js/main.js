// ===================== FRAÎCHEUR DES PRODUITS (30 JOURS) =====================
// Un produit est considéré "nouveau" pendant 30 jours après sa création, puis
// devient automatiquement un produit "ancien" — sans aucune action manuelle.
// - Catalogue officiel (data.js) : utilise le champ "createdAt" (date fixe).
// - Produits vendeurs : utilise "createdAt", renvoyé par le backend (colonne
//   created_at de la base de données, remplie automatiquement à la création).
const NEW_PRODUCT_WINDOW_DAYS = 30;

function isProductNew(product) {
    if (!product || !product.createdAt) return false;
    const createdTime = new Date(product.createdAt).getTime();
    if (isNaN(createdTime)) return false;
    const ageInDays = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
    return ageInDays >= 0 && ageInDays <= NEW_PRODUCT_WINDOW_DAYS;
}

// ===================== IMAGES PRODUITS =====================
// Construit l'URL d'une image produit à partir du champ "image" de data.js.
// - Si "image" commence par "http" (URL complète) → utilisée telle quelle.
// - Si "image" contient "/" ou une extension (.jpg, .png, .webp...) → c'est un
//   fichier local, ex: "images/products/telephone-1.jpg" → utilisé tel quel.
// - Sinon (comportement d'origine) → traité comme un identifiant de photo Unsplash.
function getProductImageUrl(image, width, height) {
    if (!image) return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=${width}&h=${height}&fit=crop&auto=format`;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.includes('/') || /\.(jpe?g|png|webp|gif|avif)$/i.test(image)) return image;
    return `https://images.unsplash.com/photo-${image}?w=${width}&h=${height}&fit=crop&auto=format`;
}

// ===================== DEVISE (FRANC CONGOLAIS) =====================
let usdToCdfRate = FALLBACK_USD_TO_CDF_RATE;

// Récupère le taux de change USD → CDF du jour auprès d'une API publique
// gratuite, et le met en cache 12h dans le navigateur pour éviter de le
// re-télécharger à chaque page. En cas d'échec (pas d'internet, API en
// panne...), le taux de secours défini dans data.js est utilisé.
async function loadExchangeRate() {
    try {
        const cached = JSON.parse(localStorage.getItem('usdCdfRate') || 'null');
        const twelveHours = 12 * 60 * 60 * 1000;
        if (cached && cached.rate && (Date.now() - cached.timestamp) < twelveHours) {
            usdToCdfRate = cached.rate;
            return;
        }
    } catch (e) {
        // localStorage indisponible : on continue, le taux de secours sera utilisé si le fetch échoue aussi
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data && data.rates && data.rates.CDF) {
            usdToCdfRate = data.rates.CDF;
            try {
                localStorage.setItem('usdCdfRate', JSON.stringify({ rate: usdToCdfRate, timestamp: Date.now() }));
            } catch (e) {
                // pas grave si on ne peut pas mettre en cache
            }
        }
    } catch (e) {
        console.warn('Taux de change du jour indisponible, utilisation du taux de secours.');
    }
}

// Convertit un montant stocké en USD (dans data.js) et le formate en
// francs congolais, ex : 650 → "1 820 000 FC"
function formatPrice(usdAmount) {
    const cdf = Math.round(usdAmount * usdToCdfRate);
    return new Intl.NumberFormat('fr-FR').format(cdf) + ' FC';
}

// ===================== GESTION D'ÉTAT =====================
let currentPage = 'home';
let currentSlide = 0;
let cart = [];
let currentProduct = null;
let selectedColor = '';
let selectedSize = '';
let quantity = 1;
let collectionCategoryFilter = 'All';
let collectionDepartmentFilter = 'All';
let sellerOnlyFilter = false;
let searchQuery = '';

// Libellés d'affichage des rayons (départements) du menu "Nos produits"
const departmentLabels = {
    electronique: 'Gadgets Électroniques',
    construction: 'Matériaux de Construction',
    vetements: 'Vêtements et Chaussures',
    imprimantes: 'Imprimantes'
};

// Navigation depuis le menu déroulant "Collections" : ouvre la page collection
// directement filtrée sur la catégorie choisie.
function navigateToCollection(category) {
    collectionCategoryFilter = category;
    collectionDepartmentFilter = 'All';
    searchQuery = '';
    navigateTo('collection');
}

// Navigation depuis le mega-menu "Nos produits" : ouvre la page collection
// filtrée sur un rayon entier (ex. Divertissement), et éventuellement une
// catégorie précise à l'intérieur de ce rayon (ex. Whisky).
function navigateToDepartment(department, category) {
    collectionDepartmentFilter = department;
    collectionCategoryFilter = category || 'All';
    searchQuery = '';
    navigateTo('collection');
}

// ===================== RECHERCHE =====================
// Normalise une chaîne pour une comparaison insensible à la casse et aux accents
function normalizeSearchText(text) {
    return (text || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function matchesSearch(product, query) {
    if (!query) return true;
    const q = normalizeSearchText(query);
    return normalizeSearchText(product.name).includes(q)
        || normalizeSearchText(product.category).includes(q)
        || normalizeSearchText(product.description).includes(q)
        || (product.isSellerProduct && normalizeSearchText(product.sellerName).includes(q));
}

function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
    }
}

function performSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    searchQuery = query;
    collectionCategoryFilter = 'All';
    collectionDepartmentFilter = 'All';
    sellerOnlyFilter = false;
    navigateTo('collection');
}

function clearSearch() {
    searchQuery = '';
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    renderCollectionProducts();
}

// ===================== INITIALISATION =====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Charger le panier sauvegardé depuis localStorage (si disponible)
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartBadge();
        }
    } catch (e) {
        console.warn('localStorage indisponible : le panier ne sera pas mémorisé entre deux visites.');
    }

    // Initialiser le popup newsletter (affiché après 5 secondes)
    setTimeout(() => {
        showNewsletterPopup();
    }, 5000);

    // Récupérer le taux de change du jour, ainsi que les données vendeurs
    // (produits publiés + session en cours) avant d'afficher la page d'accueil
    await Promise.all([loadExchangeRate(), initSellerData(), refreshCurrentCustomer(), refreshCustomerAddresses()]);

    // Charger la page d'accueil
    loadPage('home');
}

// ===================== NAVIGATION =====================
function navigateTo(page) {
    loadPage(page);
    window.scrollTo(0, 0);
}

function loadPage(page) {
    currentPage = page;
    const app = document.getElementById('app');

    // Vider le contenu actuel
    app.innerHTML = '';

    // Charger la page appropriée
    switch(page) {
        case 'home':
            loadHomePage();
            break;
        case 'collection':
            loadCollectionPage();
            break;
        case 'product':
            loadProductPage();
            break;
        case 'faq':
            loadFaqPage();
            break;
        case 'about':
            loadAboutPage();
            break;
        case 'contact':
            loadContactPage();
            break;
        case 'shipping':
        case 'terms':
        case 'payments':
        case 'csr':
        case 'careers':
        case 'privacy':
            loadInfoPage(page);
            break;
        case 'seller':
            loadSellerPage();
            break;
        case 'seller-dashboard':
            loadSellerDashboardPage();
            break;
        case 'account':
            loadAccountPage();
            break;
        case 'checkout':
            loadCheckoutPage();
            break;
        default:
            loadHomePage();
    }

    // Réafficher la recherche en cours (le champ est recréé à chaque page)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = searchQuery;
}

// ===================== PAGE D'ACCUEIL =====================
function loadHomePage() {
    document.getElementById('app').innerHTML = pageTemplates.home;
    initializeHeroSlider();
    renderHeroPrices();
    renderNewProducts();
    renderDealsProducts();
    homeCatalogSectorFilter = 'All';
    renderHomeCatalogProducts();
    updateCartBadge();
}

function renderHeroPrices() {
    document.querySelectorAll('.hero-price[data-hero-product-id]').forEach(el => {
        const product = products.find(p => p.id === Number(el.dataset.heroProductId));
        if (product) el.textContent = `À partir de ${formatPrice(product.price)}`;
    });
}

function initializeHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.getElementById('heroDots');

    // Créer les puces
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.onclick = () => goToSlide(index);
        if (index === 0) dot.classList.add('active');
        dots.appendChild(dot);
    });

    // Rotation automatique des slides toutes les 5 secondes
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateHeroSlide();
    }, 5000);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.hero-slide');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    updateHeroSlide();
}

function goToSlide(index) {
    currentSlide = index;
    updateHeroSlide();
}

function updateHeroSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dots button');

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function renderNewProducts() {
    const grid = document.getElementById('newProductsGrid');
    if (!grid) return;

    const newProducts = getAllProducts().filter(isProductNew);
    grid.innerHTML = newProducts.length > 0
        ? newProducts.map(product => createProductCard(product)).join('')
        : `<p class="empty-collection">Aucun nouveau produit pour le moment.</p>`;
    addProductCardListeners();
}

let countdownIntervalId = null;

function renderDealsProducts() {
    const grid = document.getElementById('dealsProductsGrid');
    if (!grid) return;

    // Toute réduction réelle (prix barré > prix actuel), tous vendeurs et
    // catalogue officiel confondus — pas seulement les 4 premiers produits
    // « maison ». Les plus grosses réductions sont mises en avant en premier.
    const dealsProducts = getAllProducts()
        .filter(p => p.originalPrice && p.originalPrice > p.price)
        .sort((a, b) => (b.discount || 0) - (a.discount || 0))
        .slice(0, 8);

    grid.innerHTML = dealsProducts.length > 0
        ? dealsProducts.map(product => createProductCard(product)).join('')
        : `<p class="empty-collection">Aucune offre en ce moment. Revenez bientôt !</p>`;

    // Éviter d'empiler plusieurs minuteurs si cette section est réaffichée
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    updateCountdownTimer();
    countdownIntervalId = setInterval(updateCountdownTimer, 1000);
    addProductCardListeners();
}

function createProductCard(product) {
    return `
        <div class="product-card" onclick="selectProduct(${product.id})">
            <div class="product-image">
                <img src="${getProductImageUrl(product.image, 300, 300)}" alt="${product.name}">
                <div class="product-badges">
                    ${isProductNew(product) ? '<span class="product-badge">NOUVEAU</span>' : ''}
                    ${product.tags.includes('bestseller') ? '<span class="product-badge">BEST-SELLER</span>' : ''}
                    ${product.isSellerProduct && product.isOfficial ? '<span class="product-badge official-badge">OFFICIEL</span>' : ''}
                    ${product.isSellerProduct && !product.isOfficial ? '<span class="product-badge seller-badge">VENDEUR</span>' : ''}
                </div>
                <div class="product-actions-hover">
                    <button onclick="event.stopPropagation(); toggleWishlist(this)"><i class="fas fa-heart"></i></button>
                    <button onclick="event.stopPropagation(); selectProduct(${product.id})"><i class="fas fa-eye"></i></button>
                    <button onclick="event.stopPropagation(); addProductToCart(${product.id}, 1)"><i class="fas fa-shopping-cart"></i></button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">${renderStars(product.rating)}</div>
                    <span class="review-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
                </div>
                <p class="product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                    ${product.inStock ? 'En stock' : 'Rupture de stock'}
                </p>
            </div>
        </div>
    `;
}

function renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < Math.floor(rating)) {
            stars += '<span class="star"><i class="fas fa-star"></i></span>';
        } else if (i < rating) {
            stars += '<span class="star"><i class="fas fa-star-half-alt"></i></span>';
        } else {
            stars += '<span class="star"><i class="far fa-star"></i></span>';
        }
    }
    return stars;
}

function addProductCardListeners() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('onclick').match(/\d+/)[0]);
            selectProduct(productId);
        });
    });
}

function filterNewProducts(department) {
    const buttons = document.querySelectorAll('#newProductsFilterTabs .tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');

    const newProducts = getAllProducts().filter(isProductNew);
    const filtered = department === 'All' ? newProducts : newProducts.filter(p => p.department === department);
    const grid = document.getElementById('newProductsGrid');
    grid.innerHTML = filtered.length > 0
        ? filtered.map(product => createProductCard(product)).join('')
        : `<p class="empty-collection">Aucun nouveau produit dans ce rayon pour le moment.</p>`;
    addProductCardListeners();
}

// ===================== SECTION "TOUS NOS PRODUITS" (ACCUEIL) =====================
// Regroupe tout le catalogue (officiel + vendeurs) hors nouveautés déjà mises
// en avant plus haut sur la page, avec un filtre par secteur de vente sur le côté.
let homeCatalogSectorFilter = 'All';

function renderHomeCatalogProducts() {
    const grid = document.getElementById('homeCatalogGrid');
    if (!grid) return;

    // Le catalogue complet montre TOUS les produits d'un secteur, qu'ils
    // soient récents ou non (un produit peut très bien apparaître ici ET
    // dans "Nouveaux produits" plus haut sur la page).
    const allProducts = getAllProducts();
    let items;

    if (homeCatalogSectorFilter === 'All') {
        // Vue "Tous les secteurs" : on prend quelques produits de CHAQUE
        // rayon plutôt que de simplement couper les N premiers du tableau
        // (sinon, selon l'ordre du catalogue, certains rayons entiers
        // pourraient ne jamais apparaître ici).
        const departments = ['electronique', 'construction', 'vetements', 'imprimantes'];
        items = departments.flatMap(dep => allProducts.filter(p => p.department === dep).slice(0, 3));
    } else {
        items = allProducts.filter(p => p.department === homeCatalogSectorFilter).slice(0, 12);
    }

    grid.innerHTML = items.length > 0
        ? items.map(product => createProductCard(product)).join('')
        : `<p class="empty-collection">Aucun produit dans ce secteur pour le moment.</p>`;
    addProductCardListeners();
}

function setHomeCatalogSector(department, btn) {
    homeCatalogSectorFilter = department;
    document.querySelectorAll('#homeSectorFilters .sector-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderHomeCatalogProducts();
}

function updateCountdownTimer() {
    const now = new Date().getTime();
    const endOfDay = new Date().setHours(23, 59, 59, 999);
    const timeLeft = endOfDay - now;

    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const timers = document.querySelectorAll('.countdown-timer');
    timers.forEach(timer => {
        timer.innerHTML = `
            <div class="countdown-item">
                <div class="countdown-value">${String(hours).padStart(2, '0')}</div>
                <div class="countdown-label">H</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-value">${String(minutes).padStart(2, '0')}</div>
                <div class="countdown-label">MIN</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-value">${String(seconds).padStart(2, '0')}</div>
                <div class="countdown-label">S</div>
            </div>
        `;
    });
}

// ===================== PAGE COLLECTION =====================
function loadCollectionPage() {
    document.getElementById('app').innerHTML = pageTemplates.collection;
    renderCategoryPills();
    renderCollectionProducts();
    const priceValue = document.getElementById('priceValue');
    const priceRange = document.getElementById('priceRange');
    if (priceValue && priceRange) priceValue.textContent = formatPrice(priceRange.value);
    updateCartBadge();
}

const collectionCategories = ['All', 'Smartphone', 'Tablette', 'Audio', 'Montre connectée', 'Ordinateur', 'Appareil photo', 'Télévision'];
const collectionCategoryLabels = { 'All': 'Tous les produits' };

function renderCategoryPills() {
    const container = document.getElementById('categoryPills');
    if (!container) return;

    let baseProducts = getAllProducts();
    if (collectionDepartmentFilter !== 'All') {
        baseProducts = baseProducts.filter(p => p.department === collectionDepartmentFilter);
    }

    const categoriesInScope = [...new Set(baseProducts.map(p => p.category).filter(Boolean))];
    const allCategories = ['All', ...categoriesInScope];

    container.innerHTML = allCategories.map(cat => `
        <button class="tab-btn ${cat === collectionCategoryFilter ? 'active' : ''}" onclick="setCollectionCategory('${cat}')">${collectionCategoryLabels[cat] || cat}</button>
    `).join('');
}

function toggleSellerOnlyFilter(checkbox) {
    sellerOnlyFilter = checkbox.checked;
    renderCollectionProducts();
}

// Sur mobile, la barre de filtres est repliée par défaut (voir CSS) pour
// laisser toute la largeur aux produits. Ce bouton permet de l'afficher/masquer.
function toggleMobileFilters() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('sidebar-open');
}

function setCollectionCategory(category) {
    collectionCategoryFilter = category;
    searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderCategoryPills();
    renderCollectionProducts();
}

function renderCollectionProducts() {
    const grid = document.getElementById('collectionGrid');
    if (!grid) return;

    let filtered = getAllProducts();

    if (collectionDepartmentFilter !== 'All') {
        filtered = filtered.filter(p => p.department === collectionDepartmentFilter);
    }

    if (collectionCategoryFilter !== 'All') {
        filtered = filtered.filter(p => p.category === collectionCategoryFilter);
    }

    if (sellerOnlyFilter) {
        filtered = filtered.filter(p => p.isSellerProduct);
    }

    if (searchQuery) {
        filtered = filtered.filter(p => matchesSearch(p, searchQuery));
    }

    const breadcrumbLabel = document.getElementById('collectionBreadcrumbLabel');
    const clearSearchBtn = document.getElementById('collectionClearSearch');
    if (breadcrumbLabel) {
        if (searchQuery) {
            breadcrumbLabel.textContent = `Résultats pour « ${searchQuery} » (${filtered.length})`;
        } else {
            const departmentLabel = collectionDepartmentFilter !== 'All' ? departmentLabels[collectionDepartmentFilter] : null;
            const categoryLabel = collectionCategoryFilter !== 'All' ? (collectionCategoryLabels[collectionCategoryFilter] || collectionCategoryFilter) : null;

            if (departmentLabel && categoryLabel) {
                breadcrumbLabel.textContent = `${departmentLabel} — ${categoryLabel}`;
            } else if (departmentLabel) {
                breadcrumbLabel.textContent = departmentLabel;
            } else {
                breadcrumbLabel.textContent = categoryLabel || 'Tous les produits';
            }
        }
    }
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? '' : 'none';
    }

    if (filtered.length === 0) {
        grid.innerHTML = searchQuery
            ? `<p class="empty-collection">Aucun résultat pour « ${escapeHtml(searchQuery)} ». Essayez un autre mot-clé.</p>`
            : `<p class="empty-collection">Aucun produit dans cette catégorie pour le moment.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(product => createProductCard(product)).join('');
    addProductCardListeners();
}

function applyFilters() {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (priceRange && priceValue) {
        priceValue.textContent = formatPrice(priceRange.value);
    }
    renderCollectionProducts();
}

function setSortOption(button) {
    document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderCollectionProducts();
}

function setViewMode(mode) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('button').classList.add('active');
    // Pourrait basculer entre vue grille et liste
}

// ===================== PAGE FICHE PRODUIT =====================
function loadProductPage() {
    if (!currentProduct) {
        navigateTo('collection');
        return;
    }

    document.getElementById('app').innerHTML = pageTemplates.product;
    renderProductDetail();
    updateCartBadge();
}

function selectProduct(productId) {
    currentProduct = getAllProducts().find(p => p.id === productId);
    selectedColor = currentProduct.colors[0] || '';
    selectedSize = currentProduct.sizes[0] || '';
    quantity = 1;
    navigateTo('product');
}

// ===================== GALERIE PRODUIT (PLUSIEURS ANGLES) =====================
// Combine l'image principale (product.image) et les images supplémentaires
// éventuelles (product.images, un tableau) en une galerie de miniatures
// cliquables. S'il n'y a qu'une seule image, aucune miniature n'est affichée.
function renderProductGallery(product) {
    const container = document.getElementById('thumbnailImages');
    if (!container) return;

    const allImages = [product.image, ...(product.images || [])].filter(Boolean);

    if (allImages.length <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = allImages.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="selectGalleryImage('${img.replace(/'/g, "\\'")}', this)">
            <img src="${getProductImageUrl(img, 100, 100)}" alt="${product.name} — vue ${index + 1}">
        </div>
    `).join('');
}

function selectGalleryImage(image, thumbnailEl) {
    const mainImg = document.getElementById('mainProductImage');
    if (mainImg) mainImg.src = getProductImageUrl(image, 600, 600);

    document.querySelectorAll('#thumbnailImages .thumbnail').forEach(t => t.classList.remove('active'));
    if (thumbnailEl) thumbnailEl.classList.add('active');
}

function renderProductDetail() {
    if (!currentProduct) return;

    // Fil d'Ariane
    document.getElementById('productBreadcrumb').textContent = currentProduct.name;

    // Images
    document.getElementById('mainProductImage').src = getProductImageUrl(currentProduct.image, 600, 600);
    document.getElementById('mainProductImage').alt = currentProduct.name;
    renderProductGallery(currentProduct);

    // Infos produit
    document.getElementById('productTitle').textContent = currentProduct.name;
    document.getElementById('productStars').innerHTML = renderStars(currentProduct.rating);
    document.getElementById('reviewCount').innerHTML = `<span class="review-count">(${currentProduct.reviews} avis)</span>`;

    // Prix
    document.getElementById('currentPrice').textContent = formatPrice(currentProduct.price);
    const originalPriceEl = document.getElementById('originalPrice');
    const discountBadgeEl = document.getElementById('discountBadge');
    if (currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price) {
        originalPriceEl.textContent = formatPrice(currentProduct.originalPrice);
        originalPriceEl.style.display = '';
        discountBadgeEl.textContent = `-${currentProduct.discount}%`;
        discountBadgeEl.style.display = '';
    } else {
        originalPriceEl.textContent = '';
        originalPriceEl.style.display = 'none';
        discountBadgeEl.textContent = '';
        discountBadgeEl.style.display = 'none';
    }

    // Description
    document.getElementById('productDescription').textContent = currentProduct.description;
    document.getElementById('descriptionText').textContent = currentProduct.description + ' Ce produit haut de gamme est conçu pour ceux qui exigent le meilleur.';

    // Détails
    document.getElementById('availability').textContent = currentProduct.inStock ? 'En stock' : 'Rupture de stock';
    document.getElementById('availability').className = currentProduct.inStock ? 'in-stock' : 'out-of-stock';
    document.getElementById('productSku').textContent = currentProduct.sku;

    // Vendeur (pour les produits publiés par un vendeur partenaire — pas pour
    // ceux de la boutique officielle, qui se fondent avec le reste du catalogue)
    const soldByRow = document.getElementById('productSoldByRow');
    if (currentProduct.isSellerProduct && !currentProduct.isOfficial) {
        document.getElementById('productSoldBy').textContent = currentProduct.sellerName || 'Vendeur partenaire';
        soldByRow.style.display = '';
    } else {
        soldByRow.style.display = 'none';
    }

    // Bouton "Poser une question au vendeur" — disponible pour tout produit
    // publié depuis un compte vendeur (y compris la boutique officielle).
    const askSellerWrapper = document.getElementById('askSellerWrapper');
    if (askSellerWrapper) {
        askSellerWrapper.style.display = currentProduct.isSellerProduct ? 'block' : 'none';
        askSellerWrapper.dataset.sellerId = currentProduct.sellerId || '';
        askSellerWrapper.dataset.productName = currentProduct.name || '';
        const box = document.getElementById('askSellerBox');
        if (box) { box.style.display = 'none'; box.innerHTML = ''; }
    }

    // Sélection couleur
    document.getElementById('selectedColor').textContent = selectedColor;
    const colorButtons = document.getElementById('colorButtons');
    colorButtons.innerHTML = currentProduct.colors.map(color => `
        <button class="color-option ${color === selectedColor ? 'active' : ''}" onclick="selectColor('${color}')">${color}</button>
    `).join('');

    // Sélection capacité
    document.getElementById('selectedSize').textContent = selectedSize;
    const sizeButtons = document.getElementById('sizeButtons');
    if (currentProduct.sizes.length > 0) {
        sizeButtons.innerHTML = currentProduct.sizes.map(size => `
            <button class="size-option ${size === selectedSize ? 'active' : ''}" onclick="selectSize('${size}')">${size}</button>
        `).join('');
    } else {
        sizeButtons.parentElement.style.display = 'none';
    }

    // Quantité
    document.getElementById('qtyValue').textContent = quantity;

    // Produits similaires
    const relatedProducts = getAllProducts().filter(p => p.id !== currentProduct.id).slice(0, 4);
    document.getElementById('relatedProductsGrid').innerHTML = relatedProducts.map(product => createProductCard(product)).join('');
    addProductCardListeners();

    // Compte à rebours
    updateCountdownTimer();
    setInterval(updateCountdownTimer, 1000);
}

function selectColor(color) {
    selectedColor = color;
    document.getElementById('selectedColor').textContent = color;
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === color);
    });
}

function selectSize(size) {
    selectedSize = size;
    document.getElementById('selectedSize').textContent = size;
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === size);
    });
}

function increaseQty() {
    quantity++;
    document.getElementById('qtyValue').textContent = quantity;
}

function decreaseQty() {
    if (quantity > 1) {
        quantity--;
        document.getElementById('qtyValue').textContent = quantity;
    }
}

function addToCart() {
    addProductToCart(currentProduct.id, quantity);
    // Réinitialiser la quantité
    quantity = 1;
    document.getElementById('qtyValue').textContent = quantity;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-header').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// ===================== PAGE FAQ =====================
function loadFaqPage() {
    document.getElementById('app').innerHTML = pageTemplates.faq;
    renderFaqList();
    updateCartBadge();
}

function renderFaqList() {
    const container = document.getElementById('faqList');
    if (!container) return;

    container.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item" onclick="toggleFaq(this)">
            <button class="faq-question">
                ${faq.q}
                <span class="faq-toggle"><i class="fas fa-plus"></i></span>
            </button>
            <div class="faq-answer">${faq.a}</div>
        </div>
    `).join('');
}

function toggleFaq(element) {
    element.classList.toggle('open');
}

// ===================== PAGE À PROPOS =====================
function loadAboutPage() {
    document.getElementById('app').innerHTML = pageTemplates.about;
    updateCartBadge();
}

// ===================== PAGE CONTACT =====================
function loadContactPage() {
    document.getElementById('app').innerHTML = pageTemplates.contact;
    updateCartBadge();
}

// ===================== PAGES D'INFORMATION (pied de page) =====================
function loadInfoPage(page) {
    document.getElementById('app').innerHTML = pageTemplates[page];
    updateCartBadge();
}

function handleContactSubmit(event) {
    event.preventDefault();
    alert('Merci pour votre message ! Nous vous répondrons sous 24 heures.');
    event.target.reset();
}

// ===================== FONCTIONNALITÉS DU PANIER =====================
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    drawer.classList.toggle('active');
    if (drawer.classList.contains('active')) {
        renderCartItems();
    }
}

function addProductToCart(productId, qty) {
    const product = getAllProducts().find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: qty,
            color: selectedColor || '',
            size: selectedSize || ''
        });
    }

    saveCart();
    updateCartBadge();

    // Afficher une notification toast
    showNotification(`« ${product.name} » ajouté au panier`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    renderCartItems();
}

function updateCartItemQty(productId, qty) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, qty);
        saveCart();
        updateCartBadge();
        renderCartItems();
    }
}

function renderCartItems() {
    const itemsContainer = document.getElementById('cartItems');
    const footerContainer = document.getElementById('cartFooter');

    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>Votre panier est vide</p>
                <p>Commencez vos achats pour ajouter des articles</p>
            </div>
        `;
        footerContainer.innerHTML = '';
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${getProductImageUrl(item.image, 150, 150)}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-qty">Qté : <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQty(${item.id}, this.value)" style="width: 40px;"></div>
                <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:var(--primary-dark); cursor:pointer; font-size:0.75rem;">Retirer</button>
            </div>
        </div>
    `).join('');

    footerContainer.innerHTML = `
        <div class="cart-subtotal">
            <span>Sous-total</span>
            <span class="cart-subtotal-value">${formatPrice(subtotal)}</span>
        </div>
        <button class="btn btn-primary full-width" onclick="goToCheckout()">Passer la commande</button>
        <button class="btn btn-outline full-width" onclick="toggleCart()">Continuer mes achats</button>
    `;
}

function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.warn('localStorage indisponible : le panier ne sera pas mémorisé entre deux visites.');
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        badge.textContent = count;
    }
}

// ===================== MODALS =====================
function toggleLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.toggle('active');
    }
}

function switchLoginTab(tabName) {
    const signinForm = document.getElementById('signinForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.modal-tab');

    if (tabName === 'signin') {
        signinForm?.classList.add('active');
        registerForm?.classList.remove('active');
    } else {
        signinForm?.classList.remove('active');
        registerForm?.classList.add('active');
    }

    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
}

function showNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    if (popup) {
        popup.classList.add('active');
    }
}

function closeNewsletter() {
    const popup = document.getElementById('newsletterPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function subscribeNewsletter() {
    showNotification('Merci de votre abonnement ! Vérifiez votre e-mail pour votre offre spéciale.');
    closeNewsletter();
}

// ===================== UTILITAIRES =====================
function toggleWishlist(button) {
    button.classList.toggle('active');
    button.style.color = button.classList.contains('active') ? 'var(--primary)' : '';
}

function showNotification(message) {
    // Créer une notification toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #10B981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 2px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Ajouter les styles d'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Fermer les modals en cliquant sur l'overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.closest('.modal').classList.remove('active');
    }
    if (e.target.classList.contains('cart-overlay')) {
        e.target.closest('.cart-drawer').classList.remove('active');
    }
});
