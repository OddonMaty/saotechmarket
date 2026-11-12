// =====================================================================
// TEMPLATES DE PAGES — Sao Tech Market
// Toutes les pages sont intégrées directement en JavaScript (pas de fetch())
// afin que le site fonctionne en ouvrant simplement index.html,
// sans avoir besoin d'un serveur local.
// =====================================================================

// ----------------------- EN-TÊTE COMMUN -----------------------
function navHeader(active) {
    const is = (name) => active === name ? ' active' : '';
    return `
<!-- Barre du haut -->
<div class="top-bar">
    <div class="container">
        <div class="top-bar-left">
            <span><i class="fas fa-phone"></i> +243 907 261 113</span>
            <span class="hidden-mobile"><i class="fas fa-envelope"></i> contact@saotechmarket.com</span>
        </div>
        <div class="top-bar-right">
            <span class="hidden-mobile">Livraison gratuite à Bukavu et Uvira dès 280 000 FC d'achat · Aussi à Goma et Baraka</span>
            <span>FR / CDF</span>
        </div>
    </div>
</div>

<!-- En-tête -->
<header class="header">
    <div class="container header-content">
        <div class="logo" onclick="navigateTo('home')">
            <img src="images/brand/logo.png" alt="Sao Tech Market" class="logo-img">
        </div>
        
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Rechercher un produit, une marque, une catégorie…" onkeydown="handleSearchKeydown(event)">
            <button onclick="performSearch()"><i class="fas fa-search"></i></button>
        </div>

        <div class="header-actions">
            <button class="header-btn" onclick="navigateTo('seller')">
                <i class="fas fa-store"></i>
                <span class="hidden-mobile">Vendeur</span>
            </button>
            <button class="header-btn" onclick="handleAccountButtonClick()">
                <i class="fas fa-user"></i>
                <span class="hidden-mobile">Compte</span>
            </button>
            <button class="header-btn">
                <i class="fas fa-heart"></i>
                <span class="hidden-mobile">Favoris</span>
            </button>
            <button class="header-btn" onclick="toggleCart()">
                <i class="fas fa-shopping-cart"></i>
                <span class="hidden-mobile">Panier</span>
                <span class="cart-badge" id="cartBadge">0</span>
            </button>
        </div>
    </div>
</header>

<!-- Navigation -->
<nav class="navigation">
    <div class="container">
        <button class="nav-item${is('home')}" onclick="navigateTo('home')">Accueil</button>
        <div class="nav-dropdown mega-menu-wrapper">
            <button class="nav-item${is('collection')}" onclick="navigateToDepartment('All')">Nos produits <i class="fas fa-chevron-down"></i></button>
            <div class="mega-menu">
                <div class="mega-menu-column">
                    <button class="mega-menu-heading" onclick="navigateToDepartment('electronique')"><i class="fas fa-mobile-alt"></i> Gadgets Électroniques</button>
                    <button onclick="navigateToDepartment('electronique', 'Smartphone')">Smartphone</button>
                    <button onclick="navigateToDepartment('electronique', 'Tablette')">Tablette</button>
                    <button onclick="navigateToDepartment('electronique', 'Audio')">Audio</button>
                    <button onclick="navigateToDepartment('electronique', 'Montre connectée')">Montre connectée</button>
                    <button onclick="navigateToDepartment('electronique', 'Ordinateur')">Ordinateur</button>
                    <button onclick="navigateToDepartment('electronique', 'Appareil photo')">Appareil photo</button>
                    <button onclick="navigateToDepartment('electronique', 'Télévision')">Télévision</button>
                </div>
                <div class="mega-menu-column">
                    <button class="mega-menu-heading" onclick="navigateToDepartment('construction')"><i class="fas fa-hard-hat"></i> Matériaux de Construction</button>
                    <button onclick="navigateToDepartment('construction', 'Ciment')">Ciment</button>
                    <button onclick="navigateToDepartment('construction', 'Fer à béton')">Fer à béton</button>
                    <button onclick="navigateToDepartment('construction', 'Peinture')">Peinture</button>
                    <button onclick="navigateToDepartment('construction', 'Carrelage')">Carrelage</button>
                </div>
                <div class="mega-menu-column">
                    <button class="mega-menu-heading" onclick="navigateToDepartment('vetements')"><i class="fas fa-tshirt"></i> Vêtements et Chaussures</button>
                    <button onclick="navigateToDepartment('vetements', 'Chemises')">Chemises</button>
                    <button onclick="navigateToDepartment('vetements', 'Robes')">Robes</button>
                    <button onclick="navigateToDepartment('vetements', 'Pantalons')">Pantalons</button>
                    <button onclick="navigateToDepartment('vetements', 'Chaussures')">Chaussures</button>
                </div>
                <div class="mega-menu-column">
                    <button class="mega-menu-heading" onclick="navigateToDepartment('imprimantes')"><i class="fas fa-print"></i> Imprimantes</button>
                    <button onclick="navigateToDepartment('imprimantes', 'Imprimante Laser')">Imprimante Laser</button>
                    <button onclick="navigateToDepartment('imprimantes', 'Imprimante Jet d\'encre')">Imprimante Jet d'encre</button>
                    <button onclick="navigateToDepartment('imprimantes', 'Multifonction')">Multifonction</button>
                </div>
            </div>
        </div>
        <button class="nav-item${is('about')}" onclick="navigateTo('about')">À propos</button>
        <button class="nav-item${is('contact')}" onclick="navigateTo('contact')">Contact</button>
        <button class="nav-item${is('faq')}" onclick="navigateTo('faq')">FAQ</button>
    </div>
</nav>`;
}

// ----------------------- PIED DE PAGE COMMUN -----------------------
const footerBlock = `
<!-- Pied de page -->
<footer class="footer">
    <div class="footer-newsletter">
        <div class="container">
            <div class="newsletter-footer">
                <div>
                    <p>Restez informé — <span>Abonnez-vous à la newsletter</span></p>
                </div>
                <div class="newsletter-input">
                    <input type="email" placeholder="Votre adresse e-mail">
                    <button class="btn btn-primary">S'abonner</button>
                </div>
            </div>
        </div>
    </div>

    <div class="footer-content">
        <div class="container">
            <div class="footer-columns">
                <div class="footer-column">
                    <h4>Service Client</h4>
                    <ul>
                        <li><button onclick="navigateTo('contact')">Contactez-nous</button></li>
                        <li><button onclick="navigateTo('faq')">Aide & conseils</button></li>
                        <li><button onclick="navigateTo('shipping')">Livraison & Retours</button></li>
                        <li><button onclick="navigateTo('terms')">Conditions générales</button></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Informations</h4>
                    <ul>
                        <li><button onclick="navigateTo('about')">À propos de nous</button></li>
                        <li><button onclick="navigateTo('account')">Mon compte</button></li>
                        <li><button onclick="navigateTo('payments')">Paiements & Retours</button></li>
                        <li><button onclick="navigateToCollection('All')">Voir les catalogues</button></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>À propos</h4>
                    <ul>
                        <li><button onclick="navigateTo('about')">Qui sommes-nous</button></li>
                        <li><button onclick="navigateTo('csr')">Responsabilité sociale</button></li>
                        <li><button onclick="navigateTo('careers')">Carrières</button></li>
                        <li><button onclick="navigateTo('privacy')">Politique de confidentialité</button></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Contactez-nous</h4>
                    <ul class="contact-list">
                        <li><i class="fas fa-phone"></i> +243 907 261 113</li>
                        <li><i class="fas fa-envelope"></i> contact@saotechmarket.com</li>
                        <li><i class="fas fa-clock"></i> Lun–Sam : 8h – 19h</li>
                    </ul>
                    <div class="social-links">
                        <button><i class="fab fa-facebook"></i></button>
                        <button><i class="fab fa-instagram"></i></button>
                        <button><i class="fab fa-twitter"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer-bottom">
        <div class="container">
            <p>&copy; 2026 Sao Tech Market. Tous droits réservés.</p>
            <p>Plateforme créée par <a href="https://saotechagency.com" target="_blank" rel="noopener noreferrer" class="footer-credit-link">Sao Tech Agency</a></p>
        </div>
    </div>
</footer>`;

// ----------------------- PAGES -----------------------
const pageTemplates = {

    // ===================== ACCUEIL =====================
    home: `
${navHeader('home')}

<!-- Diaporama Hero -->
<section class="hero-slider">
    <div class="hero-slide active" style="background-image: url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&h=600&fit=crop&auto=format');">
        <div class="hero-content">
            <span class="hero-tag">Nouveauté</span>
            <h1>Vinova SmartPhone<br>Pro 12</h1>
            <p>108MP de clarté. Vitesse 5G. Batterie toute la journée. Le seul téléphone dont vous avez besoin.</p>
            <p class="hero-price" data-hero-product-id="1">À partir de ...</p>
            <button class="btn btn-primary" onclick="navigateToDepartment('All')">Acheter maintenant <i class="fas fa-arrow-right"></i></button>
        </div>
    </div>
    <div class="hero-slide" style="background-image: url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&h=600&fit=crop&auto=format');">
        <div class="hero-content">
            <span class="hero-tag">Meilleure vente</span>
            <h1>Audio Master<br>Pro XR</h1>
            <p>40 heures d'autonomie, réduction active du bruit, un son de qualité studio pour votre quotidien.</p>
            <p class="hero-price" data-hero-product-id="2">À partir de ...</p>
            <button class="btn btn-primary" onclick="navigateToDepartment('All')">Acheter maintenant <i class="fas fa-arrow-right"></i></button>
        </div>
    </div>
    <div class="hero-slide" style="background-image: url('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400&h=600&fit=crop&auto=format');">
        <div class="hero-content">
            <span class="hero-tag">Offre limitée</span>
            <h1>ProBook 15<br>Ultra</h1>
            <p>Intel Core i9 · RTX 4070 · 32 Go de RAM. Conçu pour les créateurs qui ne font aucun compromis.</p>
            <p class="hero-price" data-hero-product-id="5">À partir de ...</p>
            <button class="btn btn-primary" onclick="navigateToDepartment('All')">Acheter maintenant <i class="fas fa-arrow-right"></i></button>
        </div>
    </div>
    <button class="hero-nav hero-prev" onclick="changeSlide(-1)"><i class="fas fa-chevron-left"></i></button>
    <button class="hero-nav hero-next" onclick="changeSlide(1)"><i class="fas fa-chevron-right"></i></button>
    <div class="hero-dots" id="heroDots"></div>
</section>

<!-- Bandeau d'arguments -->
<section class="usp-band">
    <div class="container">
        <div class="usp-grid">
            <div class="usp-item">
                <i class="fas fa-truck"></i>
                <div>
                    <p class="usp-title">Livraison partout en RDC</p>
                    <p class="usp-sub">Le plus grand réseau logistique du pays</p>
                </div>
            </div>
            <div class="usp-item">
                <i class="fas fa-box"></i>
                <div>
                    <p class="usp-title">Livraison gratuite</p>
                    <p class="usp-sub">Le prix affiché est le prix payé</p>
                </div>
            </div>
            <div class="usp-item">
                <i class="fas fa-undo"></i>
                <div>
                    <p class="usp-title">Retours sous 30 jours</p>
                    <p class="usp-sub">Satisfait ou remboursé</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Nouveaux produits -->
<section class="products-section">
    <div class="container">
        <div class="section-header">
            <h2>Nouveaux produits</h2>
            <div class="filter-tabs" id="newProductsFilterTabs">
                <button class="tab-btn active" onclick="filterNewProducts('All')">Tous</button>
                <button class="tab-btn" onclick="filterNewProducts('electronique')">Électronique</button>
                <button class="tab-btn" onclick="filterNewProducts('construction')">Construction</button>
                <button class="tab-btn" onclick="filterNewProducts('vetements')">Vêtements</button>
                <button class="tab-btn" onclick="filterNewProducts('imprimantes')">Imprimantes</button>
            </div>
        </div>
        <div class="products-grid" id="newProductsGrid"></div>
    </div>
</section>

<!-- Bannière promo -->
<section class="promo-banner">
    <div class="container">
        <div class="promo-content">
            <div>
                <p class="promo-tag">Offre à durée limitée</p>
                <h3>Jusqu'à 40% de réduction sur l'audio</h3>
            </div>
            <button class="btn btn-secondary" onclick="navigateToDepartment('All')">Voir les promos <i class="fas fa-arrow-right"></i></button>
        </div>
    </div>
</section>

<!-- Offres du jour -->
<section class="deals-section">
    <div class="container">
        <div class="section-header deals-header">
            <div>
                <p class="section-tag">Aujourd'hui seulement</p>
                <h2>Offres du jour</h2>
            </div>
            <div class="countdown-timer" id="countdownTimer"></div>
        </div>
        <div class="products-grid" id="dealsProductsGrid"></div>
    </div>
</section>

<!-- Tous nos produits (catalogue complet, hors nouveautés) -->
<section class="products-section home-catalog-section">
    <div class="container">
        <div class="section-header">
            <h2>Tous nos produits</h2>
        </div>
        <div class="home-catalog-layout">
            <aside class="home-sector-filters" id="homeSectorFilters">
                <button class="sector-filter-btn active" onclick="setHomeCatalogSector('All', this)">Tous les secteurs</button>
                <button class="sector-filter-btn" onclick="setHomeCatalogSector('electronique', this)"><i class="fas fa-mobile-alt"></i> Gadgets Électroniques</button>
                <button class="sector-filter-btn" onclick="setHomeCatalogSector('construction', this)"><i class="fas fa-hard-hat"></i> Matériaux de Construction</button>
                <button class="sector-filter-btn" onclick="setHomeCatalogSector('vetements', this)"><i class="fas fa-tshirt"></i> Vêtements et Chaussures</button>
                <button class="sector-filter-btn" onclick="setHomeCatalogSector('imprimantes', this)"><i class="fas fa-print"></i> Imprimantes</button>
            </aside>
            <div class="products-grid" id="homeCatalogGrid"></div>
        </div>
        <div class="home-catalog-cta">
            <button class="btn btn-outline" onclick="navigateToDepartment('All')">Voir tout le catalogue <i class="fas fa-arrow-right"></i></button>
        </div>
    </div>
</section>

<!-- Newsletter -->
<section class="newsletter-section">
    <div class="container">
        <div class="newsletter-content">
            <p class="newsletter-tag">Newsletter</p>
            <h2>10% de réduction sur votre première commande</h2>
            <p>Abonnez-vous pour recevoir des offres exclusives, les nouveautés et des réductions réservées aux membres.</p>
            <div class="newsletter-form">
                <input type="email" placeholder="Entrez votre adresse e-mail">
                <button class="btn btn-dark">S'abonner</button>
            </div>
        </div>
    </div>
</section>

${footerBlock}`,

    // ===================== COLLECTION =====================
    collection: `
${navHeader('collection')}

<!-- Page Collection -->
<div class="container collection-container">
    <div class="breadcrumb">
        <button onclick="navigateTo('home')">Accueil</button>
        <i class="fas fa-chevron-right"></i>
        <span id="collectionBreadcrumbLabel">Tous les produits</span>
        <button id="collectionClearSearch" class="link-btn" style="display:none;" onclick="clearSearch()">✕ Effacer la recherche</button>
    </div>

    <div class="filter-tabs" id="categoryPills" style="margin-bottom: 1.5rem;"></div>

    <button class="filter-toggle-btn" onclick="toggleMobileFilters()">
        <i class="fas fa-sliders-h"></i> Filtres
    </button>

    <div class="collection-layout">
        <!-- Barre latérale -->
        <aside class="sidebar">
            <div class="filter-group">
                <h4>Disponibilité</h4>
                <label class="checkbox-label">
                    <input type="checkbox" onchange="applyFilters()">
                    <span>En stock (7)</span>
                </label>
            </div>

            <div class="filter-group">
                <h4>Prix</h4>
                <div class="price-range">
                    <p><span id="priceMinLabel">0 FC</span> — <span id="priceValue">0 FC</span></p>
                    <input type="range" id="priceRange" min="0" max="2500" value="2500" onchange="applyFilters()">
                </div>
            </div>

            <div class="filter-group">
                <h4>Marque</h4>
                <label class="checkbox-label">
                    <input type="checkbox">
                    <span>Sao Tech Market (5)</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox">
                    <span>Vinova (3)</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox">
                    <span>ProTech (2)</span>
                </label>
            </div>

            <div class="filter-group">
                <h4>Couleur</h4>
                <div class="color-options" id="colorOptions"></div>
            </div>

            <div class="filter-group">
                <h4>Boutique</h4>
                <label class="checkbox-label">
                    <input type="checkbox" id="sellerOnlyCheckbox" onchange="toggleSellerOnlyFilter(this)">
                    <span>Produits vendeurs uniquement</span>
                </label>
            </div>
        </aside>

        <!-- Produits -->
        <div class="products-area">
            <div class="products-toolbar">
                <div class="sort-options">
                    <span>Trier :</span>
                    <button class="sort-btn active" onclick="setSortOption(this)">Vedette</button>
                    <button class="sort-btn" onclick="setSortOption(this)">Meilleures ventes</button>
                    <button class="sort-btn" onclick="setSortOption(this)">Prix croissant</button>
                    <button class="sort-btn" onclick="setSortOption(this)">Prix décroissant</button>
                    <button class="sort-btn" onclick="setSortOption(this)">A-Z</button>
                </div>
                <div class="view-options">
                    <button class="view-btn active" onclick="setViewMode('grid')"><i class="fas fa-th"></i></button>
                    <button class="view-btn" onclick="setViewMode('list')"><i class="fas fa-list"></i></button>
                </div>
            </div>
            <div class="products-grid" id="collectionGrid"></div>
        </div>
    </div>
</div>

${footerBlock}`,

    // ===================== FICHE PRODUIT =====================
    product: `
${navHeader('collection')}

<!-- Page Fiche Produit -->
<div class="container product-container">
    <div class="breadcrumb">
        <button onclick="navigateTo('home')">Accueil</button>
        <i class="fas fa-chevron-right"></i>
        <button onclick="navigateToDepartment('All')">Nos produits</button>
        <i class="fas fa-chevron-right"></i>
        <span id="productBreadcrumb"></span>
    </div>

    <div class="product-layout">
        <!-- Galerie -->
        <div class="product-gallery">
            <div class="main-image">
                <img id="mainProductImage" src="" alt="Produit">
            </div>
            <div class="thumbnail-images" id="thumbnailImages"></div>
        </div>

        <!-- Infos produit -->
        <div class="product-info">
            <div class="product-meta">
                <i class="fas fa-eye"></i> Récemment consulté
            </div>
            <h1 id="productTitle"></h1>
            <div class="product-rating">
                <div class="stars" id="productStars"></div>
                <span id="reviewCount"></span>
                <button class="view-reviews">Voir tous les avis</button>
            </div>

            <div class="product-price">
                <span class="current-price" id="currentPrice"></span>
                <span class="original-price" id="originalPrice"></span>
                <span class="discount-badge" id="discountBadge"></span>
            </div>

            <p class="product-description" id="productDescription"></p>

            <!-- Chrono vente flash -->
            <div class="flash-sale">
                <i class="fas fa-bolt"></i>
                <div>
                    <p>Vente flash — Se termine dans :</p>
                    <div class="countdown-timer" id="productCountdown"></div>
                </div>
            </div>

            <!-- Détails produit -->
            <div class="product-details">
                <div class="detail-item">
                    <span class="detail-label">Disponibilité :</span>
                    <span id="availability" class="in-stock"></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Référence :</span>
                    <span id="productSku"></span>
                </div>
                <div class="detail-item" id="productSoldByRow" style="display:none;">
                    <span class="detail-label">Vendu par :</span>
                    <span id="productSoldBy"></span>
                </div>
                <div id="askSellerWrapper" style="display:none; margin-top: 0.5rem;">
                    <button class="btn btn-outline" onclick="openAskSellerBox()"><i class="fas fa-comment-dots"></i> Poser une question au vendeur</button>
                    <div id="askSellerBox" style="display:none; margin-top: 0.75rem;"></div>
                </div>
            </div>

            <!-- Choix couleur -->
            <div class="product-option">
                <p class="option-label">Couleur : <span id="selectedColor"></span></p>
                <div class="color-buttons" id="colorButtons"></div>
            </div>

            <!-- Choix capacité -->
            <div class="product-option">
                <p class="option-label">Capacité : <span id="selectedSize"></span></p>
                <div class="size-buttons" id="sizeButtons"></div>
            </div>

            <!-- Quantité & Ajout panier -->
            <div class="product-actions">
                <div class="quantity-selector">
                    <button onclick="decreaseQty()"><i class="fas fa-minus"></i></button>
                    <span id="qtyValue">1</span>
                    <button onclick="increaseQty()"><i class="fas fa-plus"></i></button>
                </div>
                <button class="btn btn-primary add-to-cart" onclick="addToCart()">
                    <i class="fas fa-shopping-cart"></i> Ajouter au panier
                </button>
                <button class="btn btn-outline"><i class="fas fa-heart"></i></button>
            </div>

            <div class="product-share">
                <button><i class="fas fa-share-alt"></i> Partager</button>
                <button><i class="fas fa-comment-dots"></i> Poser une question</button>
            </div>
        </div>
    </div>

    <!-- Onglets -->
    <div class="product-tabs">
        <div class="tabs-header">
            <button class="tab-header active" onclick="switchTab('description')">Description</button>
            <button class="tab-header" onclick="switchTab('shipping')">Livraison & Retours</button>
            <button class="tab-header" onclick="switchTab('faq')">FAQ</button>
        </div>
        <div class="tabs-content">
            <div id="description" class="tab-content active">
                <p id="descriptionText"></p>
            </div>
            <div id="shipping" class="tab-content">
                <p>Si vous n'êtes pas entièrement satisfait, retournez tout article sous 30 jours pour un remboursement complet ou un échange.</p>
                <ul>
                    <li>Les articles doivent être dans leur état d'origine avec l'emballage</li>
                    <li>Retours gratuits sur toutes les commandes en RDC</li>
                    <li>Remboursements traités sous 5 à 7 jours ouvrables</li>
                    <li>Échanges disponibles pour les variantes de taille/couleur</li>
                </ul>
            </div>
            <div id="faq" class="tab-content">
                <details>
                    <summary>Ce produit est-il couvert par une garantie ?</summary>
                    <p>Oui. Tous les produits incluent une garantie constructeur de 12 mois. Des options étendues sont disponibles au moment du paiement.</p>
                </details>
                <details>
                    <summary>Puis-je l'utiliser à l'international ?</summary>
                    <p>Oui, cet appareil prend en charge une tension universelle (100–240V) et est compatible avec les principaux réseaux du monde entier.</p>
                </details>
            </div>
        </div>
    </div>

    <!-- Produits similaires -->
    <section class="related-products">
        <h2>Produits similaires</h2>
        <div class="products-grid" id="relatedProductsGrid"></div>
    </section>
</div>

${footerBlock}`,

    // ===================== FAQ =====================
    faq: `
${navHeader('faq')}

<!-- Page FAQ -->
<div class="container faq-container">
    <div class="faq-header">
        <h1>Questions fréquentes</h1>
        <p>Retrouvez les réponses aux questions les plus courantes. Vous avez encore besoin d'aide ? Notre équipe support est disponible 7j/7.</p>
    </div>
    <div class="faq-list" id="faqList"></div>
    <div class="faq-contact">
        <h2>Vous ne trouvez pas la réponse ?</h2>
        <p>Nous sommes là pour vous aider. Contactez-nous et nous répondrons sous 24 heures.</p>
        <button class="btn btn-primary" onclick="navigateTo('contact')">Contactez-nous maintenant</button>
    </div>
</div>

${footerBlock}`,

    // ===================== À PROPOS =====================
    about: `
${navHeader('about')}

<!-- Hero À propos -->
<div class="about-hero">
    <h1>À propos de nous</h1>
    <p>Des équipements électroniques premium accessibles à tous, partout en RDC, depuis 2015</p>
</div>

<!-- Contenu À propos -->
<div class="container about-container">
    <div class="about-intro">
        <p>Sao Tech Market a été fondée avec une mission simple : rendre la technologie de pointe accessible à tous les Congolais. Ce qui a commencé comme une petite boutique en ligne à Bukavu est devenu l'un des revendeurs d'électronique grand public les plus dynamiques de l'Est de la République Démocratique du Congo.</p>
        <p>Nous travaillons directement avec les grandes marques internationales pour éliminer les intermédiaires et vous faire profiter des meilleurs prix. Chaque produit est sélectionné avec soin, testé, et soutenu par notre engagement envers l'excellence.</p>
    </div>

    <!-- Comment ça marche -->
    <section class="how-it-works">
        <h2>Comment ça marche</h2>
        <div class="steps-grid">
            <div class="step-card">
                <span class="step-number">01</span>
                <h3>Choisissez un produit</h3>
                <p>Parcourez plus de 10 000 produits électroniques sélectionnés parmi les plus grandes marques du monde.</p>
            </div>
            <div class="step-card">
                <span class="step-number">02</span>
                <h3>Passez votre commande</h3>
                <p>Paiement à la livraison (Mobile Money ou espèces) et traitement rapide.</p>
            </div>
            <div class="step-card">
                <span class="step-number">03</span>
                <h3>Recevez & profitez</h3>
                <p>Livraison rapide et retours faciles. Satisfaction garantie ou remboursé.</p>
            </div>
        </div>
    </section>

    <!-- Pourquoi nous -->
    <section class="why-us">
        <h2>Pourquoi nous choisir ?</h2>
        <ul class="benefits-list">
            <li><i class="fas fa-check"></i> Plus de 10 000 produits répartis en 20 catégories</li>
            <li><i class="fas fa-check"></i> Revendeur agréé de plus de 200 marques</li>
            <li><i class="fas fa-check"></i> Retours gratuits sur toutes les commandes à Bukavu et Uvira</li>
            <li><i class="fas fa-check"></i> Support 24/7 par chat et e-mail</li>
            <li><i class="fas fa-check"></i> Garantie du meilleur prix</li>
            <li><i class="fas fa-check"></i> Paiement à la livraison : Mobile Money ou espèces</li>
        </ul>
    </section>

    <!-- Zones de service -->
    <section class="locations">
        <h2>Nos zones de service</h2>
        <div class="locations-grid">
            <div class="location-card">
                <h3>Bukavu (siège)</h3>
                <p><i class="fas fa-clock"></i> 8h – 19h</p>
            </div>
            <div class="location-card">
                <h3>Uvira</h3>
                <p><i class="fas fa-clock"></i> 9h – 18h</p>
            </div>
        </div>
    </section>
</div>

${footerBlock}`,

    // ===================== CONTACT =====================
    contact: `
${navHeader('contact')}

<!-- Hero Contact -->
<div class="contact-hero">
    <i class="fas fa-phone"></i>
    <span>+243 907 261 113 — Service client en ligne, RDC</span>
</div>

<!-- Contenu Contact -->
<div class="container contact-container">
    <div class="contact-form-section">
        <h1>Contactez-nous</h1>
        <p>Une question sur une commande ou un produit ? Remplissez le formulaire et notre équipe vous répondra sous 24 heures.</p>
        <form class="contact-form" onsubmit="handleContactSubmit(event)">
            <div class="form-row">
                <input type="text" placeholder="Nom" required>
                <input type="email" placeholder="E-mail" required>
            </div>
            <input type="text" placeholder="Sujet" required>
            <textarea rows="5" placeholder="Message" required></textarea>
            <button type="submit" class="btn btn-primary">Envoyer maintenant <i class="fas fa-arrow-right"></i></button>
        </form>
    </div>

    <div class="contact-info">
        <h2>Informations de contact</h2>
        <div class="info-item">
            <i class="fas fa-envelope"></i>
            <div>
                <p class="info-label">E-mail</p>
                <p>contact@saotechmarket.com</p>
            </div>
        </div>
        <div class="info-item">
            <i class="fas fa-phone"></i>
            <div>
                <p class="info-label">Appelez-nous</p>
                <p>+243 907 261 113</p>
            </div>
        </div>
        <div class="info-item">
            <i class="fas fa-clock"></i>
            <div>
                <p class="info-label">Horaires d'ouverture</p>
                <p>Lun – Sam : 8h00 – 19h00</p>
            </div>
        </div>
    </div>
</div>

${footerBlock}`,

    // ===================== LIVRAISON & RETOURS =====================
    shipping: `
${navHeader('')}

<div class="page-header">
    <h1>Livraison & Retours</h1>
    <p>Tout ce qu'il faut savoir sur la réception et le retour de vos commandes en RDC</p>
</div>

<div class="container">
<div class="info-page">
    <section>
        <h2>Zones de livraison</h2>
        <p>Nous livrons actuellement à <strong>Bukavu</strong>, <strong>Uvira</strong>, <strong>Goma</strong> et <strong>Baraka</strong> (territoire de Fizi), ainsi que dans les communes environnantes. Pour les autres villes de la RDC, la commande est acheminée via notre partenaire transporteur jusqu'au point de retrait le plus proche.</p>
        <table class="info-table">
            <tr><th>Zone</th><th>Délai estimé</th><th>Frais</th></tr>
            <tr><td>Bukavu (centre-ville)</td><td>24 à 48 heures</td><td>Gratuit dès 280 000 FC d'achat</td></tr>
            <tr><td>Uvira</td><td>2 à 4 jours</td><td>14 000 FC</td></tr>
            <tr><td>Goma</td><td>3 à 5 jours</td><td>20 000 FC</td></tr>
            <tr><td>Baraka (territoire de Fizi)</td><td>4 à 7 jours</td><td>25 000 FC</td></tr>
            <tr><td>Autres villes (RDC)</td><td>4 à 8 jours</td><td>Calculé au moment de la commande</td></tr>
        </table>
    </section>

    <section>
        <h2>Suivi de commande</h2>
        <p>Dès l'expédition de votre commande, vous recevez une confirmation par SMS ou WhatsApp au numéro fourni lors de l'achat, avec le nom du livreur et un créneau horaire estimé. Vous pouvez aussi suivre l'état de vos commandes à tout moment depuis <button class="link-btn" onclick="navigateTo('account')">Mon compte</button>.</p>
    </section>

    <section>
        <h2>Retours & échanges</h2>
        <p>Vous disposez de <strong>30 jours</strong> à compter de la réception pour retourner un article qui ne vous convient pas.</p>
        <ul>
            <li>L'article doit être dans son état d'origine, avec l'emballage et les accessoires</li>
            <li>Retours gratuits pour toute commande passée depuis Bukavu ou Uvira</li>
            <li>Remboursement traité sous 5 à 7 jours ouvrables après réception de l'article retourné</li>
            <li>Échange possible pour une autre couleur ou capacité, selon le stock disponible</li>
        </ul>
        <p>Pour lancer un retour, contactez notre service client avec votre numéro de commande.</p>
    </section>

    <div class="info-cta">
        <p>Une question sur une livraison en cours ou un retour ?</p>
        <button class="btn btn-primary" onclick="navigateTo('contact')">Contactez notre service client</button>
    </div>
</div>
</div>

${footerBlock}`,

    // ===================== CONDITIONS GÉNÉRALES =====================
    terms: `
${navHeader('')}

<div class="page-header">
    <h1>Conditions générales de vente</h1>
    <p>Dernière mise à jour : janvier 2026</p>
</div>

<div class="container">
<div class="info-page">
    <section>
        <h2>1. Objet</h2>
        <p>Les présentes conditions générales de vente régissent les ventes de produits électroniques réalisées par Sao Tech Market sur ce site, à destination de tout client situé en République Démocratique du Congo.</p>
    </section>

    <section>
        <h2>2. Commandes</h2>
        <p>Toute commande passée sur le site vaut acceptation des présentes conditions. Sao Tech Market se réserve le droit d'annuler ou de refuser toute commande en cas de rupture de stock, d'erreur manifeste sur le prix, ou de suspicion de fraude.</p>
    </section>

    <section>
        <h2>3. Prix</h2>
        <p>Les prix sont indiqués en francs congolais (CDF), toutes taxes comprises, calculés selon le taux de change du jour. Sao Tech Market se réserve le droit de modifier ses prix à tout moment, étant entendu que le prix figurant sur la commande au moment de sa validation est le seul applicable.</p>
    </section>

    <section>
        <h2>4. Paiement</h2>
        <p>Le paiement peut être effectué par Mobile Money ou en espèces à la livraison, selon les options disponibles dans votre zone. Le paiement par carte bancaire n'est pas encore proposé.</p>
    </section>

    <section>
        <h2>5. Livraison</h2>
        <p>Les délais de livraison sont communiqués à titre indicatif et détaillés sur notre page <button onclick="navigateTo('shipping')" style="display:inline;background:none;border:none;color:var(--primary);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">Livraison & Retours</button>. Le risque de perte ou d'endommagement est transféré au client à la remise du colis.</p>
    </section>

    <section>
        <h2>6. Garantie</h2>
        <p>Tous les produits vendus bénéficient d'une garantie constructeur de 12 mois contre les défauts de fabrication, sauf indication contraire sur la fiche produit.</p>
    </section>

    <section>
        <h2>7. Droit de rétractation</h2>
        <p>Conformément à notre politique de retours, le client dispose de 30 jours pour retourner un produit non conforme à ses attentes, dans les conditions décrites sur la page Livraison & Retours.</p>
    </section>

    <section>
        <h2>8. Contact</h2>
        <p>Pour toute question relative à ces conditions, vous pouvez nous contacter à contact@saotechmarket.com ou au +243 907 261 113.</p>
    </section>
</div>
</div>

${footerBlock}`,

    // ===================== PAIEMENTS & RETOURS =====================
    payments: `
${navHeader('')}

<div class="page-header">
    <h1>Paiements & Retours</h1>
    <p>Les moyens de paiement acceptés et notre politique de remboursement</p>
</div>

<div class="container">
<div class="info-page">
    <section>
        <h2>Moyens de paiement acceptés</h2>
        <ul>
            <li><strong>Mobile Money</strong> — M-Pesa, Airtel Money, Orange Money</li>
            <li><strong>Cash à la livraison</strong> — disponible à Bukavu, Uvira, Goma et Baraka</li>
        </ul>
        <p>Le paiement en ligne par carte bancaire n'est pas encore disponible. Après avoir passé votre commande sur le site, notre équipe vous contacte par téléphone ou WhatsApp pour confirmer les modalités : soit un transfert Mobile Money au numéro communiqué, soit un paiement en espèces directement au livreur.</p>
    </section>

    <section>
        <h2>Devises</h2>
        <p>Les prix sont affichés uniquement en francs congolais (CDF), convertis automatiquement selon le taux de change du jour. Le montant à régler vous est confirmé par notre équipe avant la livraison.</p>
    </section>

    <section>
        <h2>Remboursements</h2>
        <p>En cas de retour accepté, le remboursement est effectué par Mobile Money, sur le numéro de votre choix, sous 5 à 7 jours ouvrables.</p>
    </section>

    <section>
        <h2>Échéancier de paiement</h2>
        <p>Sao Tech Market ne propose pas encore le paiement en plusieurs fois. Cette option est à l'étude pour les commandes de plus de 1 400 000 FC.</p>
    </section>

    <div class="info-cta">
        <p>Besoin d'aide pour un paiement ou un remboursement ?</p>
        <button class="btn btn-primary" onclick="navigateTo('contact')">Contactez notre service client</button>
    </div>
</div>
</div>

${footerBlock}`,

    // ===================== MON COMPTE =====================
    account: `
${navHeader('account')}

<div class="page-header">
    <h1>Mon compte</h1>
    <p>Suivez vos commandes, gérez vos informations et retrouvez votre historique d'achats</p>
</div>

<div class="container">
    <div id="accountAreaContent"></div>
</div>

${footerBlock}`,

    // ===================== COMMANDE (CHECKOUT) =====================
    checkout: `
${navHeader('account')}

<div class="page-header">
    <h1>Finaliser ma commande</h1>
    <p>Vérifiez votre commande et indiquez votre adresse de livraison</p>
</div>

<div class="container">
    <div id="checkoutContent"></div>
</div>

${footerBlock}`,

    // ===================== RESPONSABILITÉ SOCIALE =====================
    csr: `
${navHeader('')}

<div class="page-header">
    <h1>Responsabilité sociale</h1>
    <p>Notre engagement envers les communautés de Bukavu et d'Uvira</p>
</div>

<div class="container">
<div class="info-page">
    <section>
        <h2>Notre engagement local</h2>
        <p>Sao Tech Market est né à Bukavu et reste profondément ancré dans l'Est de la RDC. Une partie de notre mission consiste à rendre la technologie accessible tout en soutenant l'économie locale.</p>
    </section>

    <section>
        <h2>Emploi local</h2>
        <p>Nos deux agences, à Bukavu et à Uvira, emploient exclusivement du personnel local pour la logistique, la livraison et le service client.</p>
    </section>

    <section>
        <h2>Recyclage des appareils électroniques</h2>
        <p>Nous encourageons nos clients à nous rapporter leurs anciens appareils électroniques lors d'un nouvel achat en magasin, afin de garantir un recyclage responsable plutôt qu'un rejet dans la nature.</p>
    </section>

    <section>
        <h2>Accès à la technologie</h2>
        <p>Nous proposons régulièrement des offres réduites sur du matériel reconditionné pour les écoles et associations locales. Contactez-nous pour en savoir plus sur nos partenariats éducatifs.</p>
    </section>
</div>
</div>

${footerBlock}`,

    // ===================== CARRIÈRES =====================
    careers: `
${navHeader('')}

<div class="page-header">
    <h1>Carrières</h1>
    <p>Rejoignez l'équipe Sao Tech Market à Bukavu ou Uvira</p>
</div>

<div class="container">
<div class="info-page">
    <section>
        <h2>Pourquoi nous rejoindre ?</h2>
        <p>Nous sommes une équipe en pleine croissance qui veut changer la façon dont la technologie est distribuée en RDC. Nous valorisons l'initiative, la rigueur et le sens du service client.</p>
    </section>

    <section>
        <h2>Postes ouverts</h2>
        <div class="job-card">
            <div class="job-meta"><span>Bukavu</span><span>Temps plein</span></div>
            <h3>Agent(e) de service client</h3>
            <p>Répondre aux demandes des clients par téléphone, WhatsApp et en agence ; suivre les commandes et les retours.</p>
        </div>
        <div class="job-card">
            <div class="job-meta"><span>Uvira</span><span>Temps plein</span></div>
            <h3>Livreur / Livreuse</h3>
            <p>Assurer la livraison des commandes dans Uvira et ses environs, avec suivi rigoureux des créneaux horaires.</p>
        </div>
        <div class="job-card">
            <div class="job-meta"><span>Bukavu</span><span>Stage</span></div>
            <h3>Assistant(e) marketing digital</h3>
            <p>Participer à la gestion des réseaux sociaux et à la mise en avant des nouveaux produits sur le site.</p>
        </div>
    </section>

    <div class="info-cta">
        <p>Intéressé(e) par un poste ? Envoyez-nous votre candidature.</p>
        <button class="btn btn-primary" onclick="navigateTo('contact')">Postuler maintenant</button>
    </div>
</div>
</div>

${footerBlock}`,

    // ===================== POLITIQUE DE CONFIDENTIALITÉ =====================
    privacy: `
${navHeader('')}

<div class="page-header">
    <h1>Politique de confidentialité</h1>
    <p>Dernière mise à jour : janvier 2026</p>
</div>

<div class="container">
<div class="info-page">
    <section>
        <h2>1. Données collectées</h2>
        <p>Lorsque vous passez commande ou nous contactez, nous collectons votre nom, votre numéro de téléphone, votre adresse e-mail et votre adresse de livraison. Ces informations sont nécessaires au traitement de votre commande.</p>
    </section>

    <section>
        <h2>2. Utilisation des données</h2>
        <ul>
            <li>Traiter et livrer vos commandes</li>
            <li>Vous contacter au sujet du statut de votre commande</li>
            <li>Vous envoyer notre newsletter, si vous y avez consenti</li>
            <li>Améliorer nos produits et notre service client</li>
        </ul>
    </section>

    <section>
        <h2>3. Partage des données</h2>
        <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec nos partenaires de livraison, uniquement dans la mesure nécessaire à l'acheminement de votre commande.</p>
    </section>

    <section>
        <h2>4. Sécurité</h2>
        <p>Nous ne demandons jamais vos identifiants Mobile Money ou vos données bancaires sur le site. Le paiement se fait directement avec vous, par téléphone ou à la livraison.</p>
    </section>

    <section>
        <h2>5. Vos droits</h2>
        <p>Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données personnelles en nous contactant à contact@saotechmarket.com.</p>
    </section>

    <section>
        <h2>6. Cookies</h2>
        <p>Ce site utilise le stockage local de votre navigateur (localStorage) uniquement pour mémoriser le contenu de votre panier d'achat entre deux visites. Aucune donnée n'est transmise à des tiers à cette fin.</p>
    </section>
</div>
</div>

${footerBlock}`,

    // ===================== ESPACE VENDEUR (accueil / connexion) =====================
    seller: `
${navHeader('seller')}

<div class="page-header">
    <h1>Devenez vendeur sur Sao Tech Market</h1>
    <p>Ouvrez votre boutique en ligne et vendez vos produits électroniques à des milliers de clients à Bukavu, Uvira et partout en RDC.</p>
</div>

<div class="container">
    <div id="sellerAreaContent"></div>
</div>

${footerBlock}`,

    // ===================== TABLEAU DE BORD VENDEUR =====================
    'seller-dashboard': `
${navHeader('seller-dashboard')}

<div class="container">
    <div id="sellerDashboardContent"></div>
</div>

${footerBlock}`
};
