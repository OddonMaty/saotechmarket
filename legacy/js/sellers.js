// =====================================================================
// ESPACE VENDEUR — Sao Tech Market
//
// Ce module communique avec le backend PHP/MySQL du site (dossier
// backend/). Les comptes vendeurs et leurs produits sont donc désormais
// stockés sur le serveur, dans une vraie base de données — partagés par
// tous les visiteurs, avec mots de passe chiffrés côté serveur.
//
// Principe de fonctionnement :
// - Au chargement du site, on récupère une fois la liste de tous les
//   produits vendeurs (BACKEND_API + '/products.php') et le vendeur
//   actuellement connecté (BACKEND_API + '/session.php'), et on les garde
//   en mémoire (sellerProductsCache / currentSellerCache).
// - getAllProducts() et getSellerProducts() lisent ce cache directement
//   (rapide, sans attente), exactement comme avant.
// - Après chaque action (inscription, connexion, ajout/modif/suppression
//   de produit...), on réinterroge le serveur pour rafraîchir le cache.
// =====================================================================

const BACKEND_API = 'backend/api';

let sellerProductsCache = [];
let currentSellerCache = null;

// ----------------------- CHARGEMENT DEPUIS LE SERVEUR -----------------------

// Recharge la liste de tous les produits vendeurs (tous vendeurs confondus)
async function refreshSellerProductsCache() {
    try {
        const res = await fetch(`${BACKEND_API}/products.php`);
        const data = await res.json();
        sellerProductsCache = Array.isArray(data.products) ? data.products : [];
    } catch (e) {
        console.warn('Impossible de charger les produits vendeurs depuis le serveur.', e);
        sellerProductsCache = [];
    }
}

// Recharge les informations du vendeur actuellement connecté (ou null)
async function refreshCurrentSeller() {
    try {
        const res = await fetch(`${BACKEND_API}/session.php`);
        const data = await res.json();
        currentSellerCache = data.seller || null;
    } catch (e) {
        console.warn('Impossible de vérifier la session vendeur.', e);
        currentSellerCache = null;
    }
}

// Appelé une fois au tout début du chargement du site (voir main.js)
async function initSellerData() {
    await Promise.all([refreshSellerProductsCache(), refreshCurrentSeller()]);
}

function getSellerProducts() {
    return sellerProductsCache;
}

function getCurrentSeller() {
    return currentSellerCache;
}

// Fusionne le catalogue officiel (data.js) avec les produits ajoutés par les vendeurs
function getAllProducts() {
    return products.concat(sellerProductsCache);
}

// ----------------------- INSCRIPTION / CONNEXION -----------------------
async function handleSellerRegisterSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const payload = {
        shopName: form.elements['shopName'].value.trim(),
        ownerName: form.elements['ownerName'].value.trim(),
        phone: form.elements['phone'].value.trim(),
        email: form.elements['email'].value.trim().toLowerCase(),
        city: form.elements['city'].value,
        password: form.elements['password'].value
    };

    if (!payload.shopName || !payload.ownerName || !payload.phone || !payload.email || !payload.password) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${BACKEND_API}/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Impossible de créer la boutique.");
            return;
        }

        currentSellerCache = data;
        showNotification(`Bienvenue ${data.shopName} ! Votre boutique a été créée.`);
        navigateTo('seller-dashboard');
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function handleSellerLoginSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const email = form.elements['email'].value.trim().toLowerCase();
    const password = form.elements['password'].value;
    if (!email || !password) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${BACKEND_API}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "E-mail ou mot de passe incorrect.");
            return;
        }

        currentSellerCache = data;
        await refreshSellerProductsCache();
        navigateTo('seller-dashboard');
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function logoutSeller() {
    try {
        await fetch(`${BACKEND_API}/logout.php`, { method: 'POST' });
    } catch (e) {
        // même en cas d'erreur réseau, on déconnecte localement
    }
    currentSellerCache = null;
    showNotification('Vous êtes déconnecté de votre espace vendeur.');
    navigateTo('home');
}

function switchSellerTab(tab) {
    const loginForm = document.getElementById('sellerLoginForm');
    const registerForm = document.getElementById('sellerRegisterForm');
    if (loginForm) loginForm.classList.toggle('active', tab === 'login');
    if (registerForm) registerForm.classList.toggle('active', tab === 'register');
    document.querySelectorAll('[data-seller-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-seller-tab') === tab);
    });
}

// ----------------------- PAGE : ACCUEIL / CONNEXION VENDEUR -----------------------
function loadSellerPage() {
    document.getElementById('app').innerHTML = pageTemplates.seller;
    renderSellerArea();
    updateCartBadge();
}

function renderSellerArea() {
    const container = document.getElementById('sellerAreaContent');
    if (!container) return;

    // Déjà connecté → direction le tableau de bord
    if (getCurrentSeller()) {
        navigateTo('seller-dashboard');
        return;
    }

    container.innerHTML = `
        <div class="seller-landing">
            <div class="seller-pitch">
                <h2>Pourquoi vendre sur Sao Tech Market ?</h2>
                <div class="seller-pitch-item">
                    <i class="fas fa-users"></i>
                    <div>
                        <p class="usp-title">Une audience déjà là</p>
                        <p class="usp-sub">Touchez des milliers de clients à Bukavu, Uvira et dans tout le Sud-Kivu.</p>
                    </div>
                </div>
                <div class="seller-pitch-item">
                    <i class="fas fa-mobile-alt"></i>
                    <div>
                        <p class="usp-title">Paiements Mobile Money</p>
                        <p class="usp-sub">Vos clients paient comme ils en ont déjà l'habitude.</p>
                    </div>
                </div>
                <div class="seller-pitch-item">
                    <i class="fas fa-store"></i>
                    <div>
                        <p class="usp-title">Votre propre boutique</p>
                        <p class="usp-sub">Ajoutez, modifiez et supprimez vos produits en quelques clics, à tout moment.</p>
                    </div>
                </div>
            </div>

            <div class="seller-auth-card">
                <div class="modal-tabs">
                    <button class="modal-tab active" data-seller-tab="login" onclick="switchSellerTab('login')">Se connecter</button>
                    <button class="modal-tab" data-seller-tab="register" onclick="switchSellerTab('register')">Créer ma boutique</button>
                </div>

                <form id="sellerLoginForm" class="form-content active" onsubmit="handleSellerLoginSubmit(event)">
                    <div class="form-group">
                        <label>Adresse e-mail *</label>
                        <input type="email" name="email" placeholder="vendeur@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe *</label>
                        <input type="password" name="password" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary full-width">Se connecter à ma boutique</button>
                </form>

                <form id="sellerRegisterForm" class="form-content" onsubmit="handleSellerRegisterSubmit(event)">
                    <div class="form-group">
                        <label>Nom de la boutique *</label>
                        <input type="text" name="shopName" placeholder="Ex. TechPlus Bukavu" required>
                    </div>
                    <div class="form-row">
                        <input type="text" name="ownerName" placeholder="Votre nom complet *" required>
                        <input type="tel" name="phone" placeholder="Téléphone (+243...)" required>
                    </div>
                    <div class="form-group">
                        <label>Adresse e-mail *</label>
                        <input type="email" name="email" placeholder="vendeur@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Ville</label>
                        <select name="city">
                            <option value="Bukavu">Bukavu</option>
                            <option value="Uvira">Uvira</option>
                            <option value="Goma">Goma</option>
                            <option value="Baraka">Baraka (territoire de Fizi)</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe *</label>
                        <input type="password" name="password" placeholder="••••••••" required minlength="4">
                    </div>
                    <p class="seller-form-note">
                        Vos informations sont enregistrées de façon sécurisée sur le serveur de Sao Tech Market (mot de passe chiffré).
                    </p>
                    <button type="submit" class="btn btn-primary full-width">Créer ma boutique vendeur</button>
                </form>
            </div>
        </div>
    `;
}

// ----------------------- PAGE : TABLEAU DE BORD VENDEUR -----------------------
let editingSellerProductId = null;

function loadSellerDashboardPage() {
    document.getElementById('app').innerHTML = pageTemplates['seller-dashboard'];
    renderSellerDashboard();
    updateCartBadge();
}

function renderSellerDashboard() {
    const container = document.getElementById('sellerDashboardContent');
    if (!container) return;

    const seller = getCurrentSeller();
    if (!seller) {
        navigateTo('seller');
        return;
    }

    const myProducts = getSellerProducts().filter(p => p.sellerId === seller.id);

    container.innerHTML = `
        <div class="seller-dashboard-header">
            <div>
                <h1>${seller.shopName} ${seller.isOfficial ? '<span class="product-badge official-badge" style="position: static; vertical-align: middle;">BOUTIQUE OFFICIELLE</span>' : ''}</h1>
                <p>Espace vendeur — ${seller.ownerName} · ${seller.email}</p>
            </div>
            <div class="seller-dashboard-actions">
                <button class="btn btn-outline notif-bell-btn" onclick="toggleSellerNotifications()">
                    <i class="fas fa-bell"></i> Notifications
                    <span class="notif-badge" id="sellerNotifBadge" style="display:none;">0</span>
                </button>
                <button class="btn btn-outline" onclick="toggleSellerInbox()"><i class="fas fa-comments"></i> Messages</button>
                <button class="btn btn-primary" onclick="showSellerProductForm()"><i class="fas fa-plus"></i> Ajouter un produit</button>
                <button class="btn btn-outline" onclick="logoutSeller()">Déconnexion</button>
            </div>
        </div>

        <div id="sellerNotificationsPanel" class="seller-product-form-wrapper" style="display:none;"></div>
        <div id="sellerInboxPanel" class="seller-product-form-wrapper" style="display:none;"></div>

        ${seller.isOfficial ? `<p class="seller-form-note" style="margin-top: -1rem; margin-bottom: 1.5rem;">Les produits que tu ajoutes ici apparaissent comme des produits « Boutique officielle » sur le site, sans mention de vendeur tiers.</p>` : ''}

        <div class="seller-stats">
            <div class="seller-stat-card">
                <span class="seller-stat-value">${myProducts.length}</span>
                <span class="seller-stat-label">Produits en ligne</span>
            </div>
            <div class="seller-stat-card">
                <span class="seller-stat-value">${myProducts.filter(p => p.inStock).length}</span>
                <span class="seller-stat-label">En stock</span>
            </div>
            <div class="seller-stat-card">
                <span class="seller-stat-value">${formatPrice(myProducts.reduce((sum, p) => sum + p.price, 0))}</span>
                <span class="seller-stat-label">Valeur du catalogue</span>
            </div>
        </div>

        <div id="sellerProductFormWrapper" class="seller-product-form-wrapper" style="display:none;"></div>

        <div class="seller-products-table-wrapper">
            <h2>Mes produits</h2>
            ${myProducts.length === 0 ? `
                <p class="empty-collection">Vous n'avez pas encore ajouté de produit. Cliquez sur « Ajouter un produit » pour commencer à vendre.</p>
            ` : `
                <div class="seller-products-table-scroll">
                    <table class="seller-products-table">
                        <thead>
                            <tr><th></th><th>Nom</th><th>Rayon</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th></th></tr>
                        </thead>
                        <tbody>
                            ${myProducts.map(p => `
                                <tr>
                                    <td><img src="${getProductImageUrl(p.image, 60, 60)}" alt="${p.name}" class="seller-product-thumb"></td>
                                    <td>${p.name}</td>
                                    <td>${departmentLabels[p.department] || p.department || '—'}</td>
                                    <td>${p.category}</td>
                                    <td>${formatPrice(p.price)}</td>
                                    <td class="${p.inStock ? 'in-stock' : 'out-of-stock'}">${p.inStock ? 'En stock' : 'Rupture'}</td>
                                    <td class="seller-product-row-actions">
                                        <button class="link-btn" onclick="showSellerProductForm(${p.id})">Modifier</button>
                                        <button class="link-btn" onclick="deleteSellerProduct(${p.id})">Supprimer</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    refreshSellerNotifBadge();
}

// ----------------------- NOTIFICATIONS VENDEUR -----------------------
async function refreshSellerNotifBadge() {
    const badge = document.getElementById('sellerNotifBadge');
    if (!badge) return;

    try {
        const res = await fetch(`${BACKEND_API}/seller-notifications.php`);
        const data = await res.json();
        const count = data.unreadCount || 0;
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (e) {
        // silencieux : le badge reste simplement masqué
    }
}

async function toggleSellerNotifications() {
    const panel = document.getElementById('sellerNotificationsPanel');
    if (!panel) return;

    // Un seul panneau ouvert à la fois
    const inbox = document.getElementById('sellerInboxPanel');
    if (inbox) inbox.style.display = 'none';

    if (panel.style.display !== 'none') {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    panel.innerHTML = `<p class="empty-collection">Chargement…</p>`;
    panel.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch(`${BACKEND_API}/seller-notifications.php`);
        const data = await res.json();
        const notifications = data.notifications || [];

        panel.innerHTML = `
            <div class="seller-dashboard-header" style="padding: 0 0 1rem; margin-bottom: 1rem; border-bottom: none;">
                <h2 style="font-size: 1.2rem;">Notifications</h2>
                ${notifications.some(n => !n.isRead) ? `<button class="link-btn" onclick="markSellerNotificationsRead()">Tout marquer comme lu</button>` : ''}
            </div>
            ${notifications.length === 0 ? `
                <p class="empty-collection">Aucune notification pour le moment. Tu seras prévenu(e) ici dès qu'un de tes produits sera commandé.</p>
            ` : notifications.map(n => `
                <div class="seller-stat-card" style="text-align: left; margin-bottom: 0.75rem; ${!n.isRead ? 'border-color: var(--primary);' : ''}">
                    <p style="font-weight: ${n.isRead ? '400' : '700'};">
                        🛒 Commande ${n.orderNumber} — ${n.productName} (x${n.quantity})
                    </p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${new Date(n.createdAt).toLocaleString('fr-FR')}</p>
                </div>
            `).join('')}
        `;

        // Le simple fait d'ouvrir le panneau marque tout comme lu
        if (notifications.some(n => !n.isRead)) {
            await markSellerNotificationsRead(true);
        }
    } catch (e) {
        panel.innerHTML = `<p class="empty-collection">Connexion au serveur impossible. Réessaie plus tard.</p>`;
    }
}

async function markSellerNotificationsRead(silent) {
    try {
        await fetch(`${BACKEND_API}/mark-notifications-read.php`, { method: 'POST' });
        await refreshSellerNotifBadge();
        if (!silent) toggleSellerNotifications();
    } catch (e) {
        if (!silent) showNotification("Connexion au serveur impossible. Réessaie plus tard.");
    }
}

// ----------------------- MESSAGERIE VENDEUR -----------------------
let sellerActiveConversationId = null;
let sellerChatPollInterval = null;

async function toggleSellerInbox() {
    const panel = document.getElementById('sellerInboxPanel');
    if (!panel) return;

    const notifPanel = document.getElementById('sellerNotificationsPanel');
    if (notifPanel) notifPanel.style.display = 'none';

    if (panel.style.display !== 'none') {
        panel.style.display = 'none';
        if (sellerChatPollInterval) { clearInterval(sellerChatPollInterval); sellerChatPollInterval = null; }
        return;
    }

    panel.style.display = 'block';
    panel.innerHTML = `
        <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Messages</h2>
        <div id="sellerConversationsList"><p class="empty-collection">Chargement…</p></div>
        <div id="sellerConversationThread" style="display:none; margin-top: 1rem;"></div>
    `;
    panel.scrollIntoView({ behavior: 'smooth' });
    await renderSellerConversationsList();
}

async function renderSellerConversationsList() {
    const listEl = document.getElementById('sellerConversationsList');
    if (!listEl) return;

    try {
        const res = await fetch(`${BACKEND_API}/list-conversations.php`);
        const data = await res.json();
        const conversations = data.conversations || [];

        if (conversations.length === 0) {
            listEl.innerHTML = `<p class="empty-collection">Aucune conversation pour le moment. Elles apparaîtront ici dès qu'un client t'écrira depuis une fiche produit.</p>`;
            return;
        }

        listEl.innerHTML = conversations.map(c => `
            <div class="checkout-address-option ${c.unreadCount > 0 ? 'active' : ''}" onclick="openSellerConversation(${c.id})" style="cursor:pointer;">
                <div style="flex:1;">
                    <p style="font-weight: 700;">${c.otherName} ${c.contextProductName ? '— <span style="font-weight:400; color:var(--text-muted);">' + c.contextProductName + '</span>' : ''}</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.lastMessage}</p>
                </div>
                ${c.unreadCount > 0 ? `<span class="notif-badge">${c.unreadCount}</span>` : ''}
            </div>
        `).join('');
    } catch (e) {
        listEl.innerHTML = `<p class="empty-collection">Connexion au serveur impossible. Réessaie plus tard.</p>`;
    }
}

async function openSellerConversation(conversationId) {
    sellerActiveConversationId = conversationId;
    const threadEl = document.getElementById('sellerConversationThread');
    if (!threadEl) return;

    threadEl.style.display = 'block';
    await loadSellerConversationThread();

    if (sellerChatPollInterval) clearInterval(sellerChatPollInterval);
    sellerChatPollInterval = setInterval(loadSellerConversationThread, 8000);
}

async function loadSellerConversationThread() {
    const threadEl = document.getElementById('sellerConversationThread');
    if (!threadEl || !sellerActiveConversationId) return;

    try {
        const res = await fetch(`${BACKEND_API}/get-messages.php?conversationId=${sellerActiveConversationId}`);
        const data = await res.json();
        if (!res.ok) return;

        threadEl.innerHTML = `
            <h3 style="font-size: 1rem; margin-bottom: 1rem;">Conversation avec ${data.conversation.customerName}</h3>
            <div class="chat-messages" id="sellerChatMessages">
                ${data.messages.map(m => `
                    <div class="chat-bubble ${m.senderType === 'seller' ? 'chat-bubble-mine' : 'chat-bubble-theirs'}">
                        <p>${m.message}</p>
                        <span class="chat-bubble-time">${new Date(m.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                `).join('')}
            </div>
            <form onsubmit="sendSellerChatMessage(event)" class="chat-reply-form">
                <input type="text" name="message" placeholder="Écris ta réponse..." required>
                <button type="submit" class="btn btn-primary">Envoyer</button>
            </form>
        `;
        const msgContainer = document.getElementById('sellerChatMessages');
        if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;

        renderSellerConversationsList();
    } catch (e) {
        // silencieux
    }
}

async function sendSellerChatMessage(event) {
    event.preventDefault();
    const form = event.target;
    const message = form.elements['message'].value.trim();
    if (!message || !sellerActiveConversationId) return;

    form.elements['message'].value = '';

    try {
        await fetch(`${BACKEND_API}/send-message.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: sellerActiveConversationId, message })
        });
        await loadSellerConversationThread();
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    }
}

function showSellerProductForm(id) {
    editingSellerProductId = id || null;
    const wrapper = document.getElementById('sellerProductFormWrapper');
    if (!wrapper) return;

    const existing = id ? getSellerProducts().find(p => p.id === id) : null;

    wrapper.style.display = 'block';
    wrapper.innerHTML = `
        <h2>${existing ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
        <form class="contact-form" onsubmit="saveSellerProduct(event)">
            <div class="form-row">
                <input type="text" name="name" placeholder="Nom du produit *" value="${existing ? existing.name : ''}" required>
                <select name="department" required>
                    <option value="" disabled ${!existing ? 'selected' : ''}>Choisir un rayon *</option>
                    ${Object.entries(departmentLabels).map(([key, label]) => `
                        <option value="${key}" ${existing && existing.department === key ? 'selected' : ''}>${label}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-row">
                <input type="text" name="category" placeholder="Catégorie * (ex. Smartphone, Chemises…)" value="${existing ? existing.category : ''}" required>
            </div>
            <input type="number" name="price" step="1" min="0" placeholder="Prix de vente (FC) *" value="${existing ? Math.round(existing.price * usdToCdfRate) : ''}" required>

            <label class="checkbox-label promo-checkbox">
                <input type="checkbox" id="promoToggle" ${existing && existing.originalPrice ? 'checked' : ''} onchange="togglePromoField(this)">
                <span>🔥 Mettre ce produit en promotion</span>
            </label>
            <div class="form-row" id="originalPriceWrapper" style="display: ${existing && existing.originalPrice ? 'grid' : 'none'};">
                <input type="number" name="originalPrice" step="1" min="0" placeholder="Prix barré (FC) — plus élevé que le prix de vente" value="${existing && existing.originalPrice ? Math.round(existing.originalPrice * usdToCdfRate) : ''}">
            </div>
            <p class="seller-form-note" id="promoHint" style="display: ${existing && existing.originalPrice ? 'block' : 'none'};">
                En cochant cette case et en indiquant un prix barré, ce produit apparaîtra automatiquement dans la section <strong>« Offres du jour »</strong> de la page d'accueil, tant que la réduction est active.
            </p>

            <div class="form-group">
                <label>Photo principale</label>
                <input type="text" name="image" placeholder="Colle un lien d'image (optionnel)..." value="${existing ? (existing.image || '') : ''}">
                <input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp,image/gif" style="margin-top: 0.5rem;">
                <p class="seller-form-note" style="margin-top: 0.35rem;">Choisis une photo depuis ton téléphone/ordinateur, ou colle un lien ci-dessus — si tu choisis un fichier, il sera utilisé en priorité.</p>
            </div>
            <div class="form-group">
                <label>Photos supplémentaires (autres angles)</label>
                <input type="text" name="images" placeholder="Ou colle plusieurs liens séparés par des virgules..." value="${existing ? (existing.images || []).join(', ') : ''}">
                <input type="file" name="imagesFiles" accept="image/jpeg,image/png,image/webp,image/gif" multiple style="margin-top: 0.5rem;">
                <p class="seller-form-note" style="margin-top: 0.35rem;">Tu peux choisir plusieurs photos à la fois depuis ton appareil pour montrer le produit sous différents angles.</p>
            </div>
            <div class="form-row">
                <input type="text" name="colors" placeholder="Couleurs (séparées par des virgules)" value="${existing ? (existing.colors || []).join(', ') : ''}">
                <input type="text" name="sizes" placeholder="Capacités / tailles (séparées par des virgules)" value="${existing ? (existing.sizes || []).join(', ') : ''}">
            </div>
            <textarea name="description" rows="4" placeholder="Description du produit *" required>${existing ? existing.description : ''}</textarea>
            <label class="checkbox-label">
                <input type="checkbox" name="inStock" ${!existing || existing.inStock ? 'checked' : ''}>
                <span>Produit en stock</span>
            </label>
            <p class="seller-form-note">
                Le rayon détermine dans quelle colonne du menu « Nos produits » votre article apparaîtra sur le site.
            </p>
            <div class="seller-form-actions">
                <button type="submit" class="btn btn-primary">${existing ? 'Enregistrer les modifications' : 'Publier le produit'}</button>
                <button type="button" class="btn btn-outline" onclick="cancelSellerProductForm()">Annuler</button>
            </div>
        </form>
    `;
    wrapper.scrollIntoView({ behavior: 'smooth' });
}

// Affiche/masque le champ "prix barré" selon la case "Mettre en promotion"
function togglePromoField(checkbox) {
    const wrapper = document.getElementById('originalPriceWrapper');
    const hint = document.getElementById('promoHint');
    if (wrapper) wrapper.style.display = checkbox.checked ? 'grid' : 'none';
    if (hint) hint.style.display = checkbox.checked ? 'block' : 'none';
    if (!checkbox.checked) {
        const input = wrapper ? wrapper.querySelector('input[name="originalPrice"]') : null;
        if (input) input.value = '';
    }
}

function cancelSellerProductForm() {
    editingSellerProductId = null;
    const wrapper = document.getElementById('sellerProductFormWrapper');
    if (wrapper) {
        wrapper.style.display = 'none';
        wrapper.innerHTML = '';
    }
}

// Envoie un fichier image choisi sur l'appareil du vendeur vers le serveur,
// et renvoie le chemin à utiliser comme image du produit. Lève une erreur
// (avec un message clair) si l'envoi échoue.
async function uploadProductImageFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BACKEND_API}/upload-image.php`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Impossible d'envoyer cette photo.");
    }

    return data.path;
}

async function saveSellerProduct(event) {
    event.preventDefault();
    const seller = getCurrentSeller();
    if (!seller) {
        navigateTo('seller');
        return;
    }

    const form = event.target;
    const priceCdf = parseFloat(form.elements['price'].value);
    const originalPriceCdf = form.elements['originalPrice'].value ? parseFloat(form.elements['originalPrice'].value) : null;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Téléverse d'abord les fichiers choisis depuis l'appareil du vendeur
    // (un fichier choisi prend le pas sur un lien collé dans le même champ).
    let uploadedMainImage = '';
    let uploadedExtraImages = [];
    try {
        const mainFile = form.elements['imageFile'] && form.elements['imageFile'].files[0];
        if (mainFile) {
            showNotification('Envoi de la photo en cours…');
            uploadedMainImage = await uploadProductImageFile(mainFile);
        }

        const extraFiles = form.elements['imagesFiles'] ? Array.from(form.elements['imagesFiles'].files) : [];
        if (extraFiles.length > 0) {
            showNotification(`Envoi de ${extraFiles.length} photo(s) en cours…`);
            uploadedExtraImages = await Promise.all(extraFiles.map(f => uploadProductImageFile(f)));
        }
    } catch (e) {
        showNotification(e.message || "Impossible d'envoyer une des photos. Réessayez.");
        if (submitBtn) submitBtn.disabled = false;
        return;
    }

    // Les vendeurs saisissent leurs prix en francs congolais (FC). En interne, le
    // catalogue (data.js) raisonne en USD et reconvertit en FC à l'affichage selon
    // le taux du jour (voir formatPrice) — on applique donc la même logique ici,
    // pour que ces produits se comportent exactement comme le reste du catalogue.
    const typedImages = form.elements['images'].value.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
        name: form.elements['name'].value.trim(),
        department: form.elements['department'].value,
        category: form.elements['category'].value.trim(),
        price: priceCdf / usdToCdfRate,
        originalPrice: originalPriceCdf ? originalPriceCdf / usdToCdfRate : null,
        image: uploadedMainImage || form.elements['image'].value.trim(),
        description: form.elements['description'].value.trim(),
        colors: form.elements['colors'].value.split(',').map(c => c.trim()).filter(Boolean),
        sizes: form.elements['sizes'].value.split(',').map(s => s.trim()).filter(Boolean),
        images: [...uploadedExtraImages, ...typedImages],
        inStock: form.elements['inStock'].checked
    };

    if (!payload.name || !payload.department || !payload.category || isNaN(priceCdf) || !payload.description) {
        showNotification('Merci de remplir tous les champs obligatoires, y compris le rayon.');
        if (submitBtn) submitBtn.disabled = false;
        return;
    }

    const isEditing = !!editingSellerProductId;
    const url = isEditing ? `${BACKEND_API}/update-product.php` : `${BACKEND_API}/add-product.php`;
    if (isEditing) payload.id = editingSellerProductId;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Une erreur est survenue. Réessayez.");
            return;
        }

        await refreshSellerProductsCache();
        editingSellerProductId = null;

        showNotification(isEditing ? 'Produit mis à jour avec succès.' : 'Produit publié dans votre boutique !');
        cancelSellerProductForm();
        renderSellerDashboard();
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function deleteSellerProduct(id) {
    if (!confirm('Supprimer ce produit de votre boutique ?')) return;

    try {
        const res = await fetch(`${BACKEND_API}/delete-product.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Suppression impossible.");
            return;
        }

        await refreshSellerProductsCache();
        showNotification('Produit supprimé.');
        renderSellerDashboard();
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    }
}
