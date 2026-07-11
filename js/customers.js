// =====================================================================
// COMPTE CLIENT — Sao Tech Market
//
// Ce module gère la création de compte, la connexion, et le suivi des
// commandes des clients, via le backend PHP/MySQL (dossier backend/).
// Il fonctionne en miroir de js/sellers.js, mais pour les acheteurs
// plutôt que pour les vendeurs — ce sont deux systèmes de comptes
// totalement séparés (une même personne peut avoir les deux).
// =====================================================================

const CUSTOMER_API = 'backend/api';

let currentCustomerCache = null;

// Le bouton "Compte" de l'en-tête : va directement au tableau de bord si déjà
// connecté, sinon ouvre le modal de connexion/inscription.
function handleAccountButtonClick() {
    if (getCurrentCustomer()) {
        navigateTo('account');
    } else {
        toggleLoginModal();
    }
}

// ----------------------- SESSION -----------------------
async function refreshCurrentCustomer() {
    try {
        const res = await fetch(`${CUSTOMER_API}/customer-session.php`);
        const data = await res.json();
        currentCustomerCache = data.customer || null;
    } catch (e) {
        console.warn('Impossible de vérifier la session client.', e);
        currentCustomerCache = null;
    }
}

function getCurrentCustomer() {
    return currentCustomerCache;
}

// ----------------------- INSCRIPTION / CONNEXION (modal de l'en-tête) -----------------------
async function handleCustomerRegisterSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const payload = {
        firstName: form.elements['firstName'].value.trim(),
        lastName: form.elements['lastName'].value.trim(),
        email: form.elements['email'].value.trim().toLowerCase(),
        phone: form.elements['phone'].value.trim(),
        city: form.elements['city'].value,
        password: form.elements['password'].value,
        newsletter: form.elements['newsletter'].checked
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone || !payload.password) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${CUSTOMER_API}/customer-register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Impossible de créer le compte.");
            return;
        }

        currentCustomerCache = data;
        toggleLoginModal();
        showNotification(`Bienvenue ${data.firstName} ! Votre compte a été créé.`);

        if (pendingCheckoutAfterLogin) {
            pendingCheckoutAfterLogin = false;
            navigateTo('checkout');
        } else if (currentPage === 'account') {
            renderAccountPage();
        }
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function handleCustomerLoginSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const email = form.elements['email'].value.trim().toLowerCase();
    const password = form.elements['password'].value;
    if (!email || !password) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${CUSTOMER_API}/customer-login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "E-mail ou mot de passe incorrect.");
            return;
        }

        currentCustomerCache = data;
        toggleLoginModal();
        showNotification(`Content de vous revoir, ${data.firstName} !`);

        if (pendingCheckoutAfterLogin) {
            pendingCheckoutAfterLogin = false;
            navigateTo('checkout');
        } else if (currentPage === 'account') {
            renderAccountPage();
        }
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function logoutCustomer() {
    try {
        await fetch(`${CUSTOMER_API}/customer-logout.php`, { method: 'POST' });
    } catch (e) {
        // on déconnecte quand même localement
    }
    currentCustomerCache = null;
    showNotification('Vous êtes déconnecté(e) de votre compte.');
    navigateTo('home');
}

// ----------------------- PAGE "MON COMPTE" -----------------------
function loadAccountPage() {
    document.getElementById('app').innerHTML = pageTemplates.account;
    renderAccountPage();
    updateCartBadge();
}

async function renderAccountPage() {
    const container = document.getElementById('accountAreaContent');
    if (!container) return;

    const customer = getCurrentCustomer();

    if (!customer) {
        container.innerHTML = `
            <div class="seller-landing" style="grid-template-columns: 1fr;">
                <div class="seller-auth-card" style="max-width: 420px; margin: 0 auto;">
                    <p style="margin-bottom: 1.5rem; color: var(--text-muted);">Connectez-vous ou créez un compte pour suivre vos commandes, enregistrer vos adresses et retrouver votre historique d'achats.</p>
                    <button class="btn btn-primary full-width" onclick="toggleLoginModal()">Se connecter / Créer un compte</button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="seller-dashboard-header">
            <div>
                <h1>${customer.firstName} ${customer.lastName}</h1>
                <p>${customer.email} · ${customer.phone} · ${customer.city}</p>
            </div>
            <div class="seller-dashboard-actions">
                <button class="btn btn-outline" onclick="logoutCustomer()">Déconnexion</button>
            </div>
        </div>

        <div class="seller-products-table-wrapper">
            <h2>Mes commandes</h2>
            <div id="customerOrdersList"><p class="empty-collection">Chargement de vos commandes…</p></div>
        </div>
    `;

    try {
        const res = await fetch(`${CUSTOMER_API}/customer-orders.php`);
        const data = await res.json();
        const listEl = document.getElementById('customerOrdersList');
        if (!listEl) return;

        if (!res.ok) {
            listEl.innerHTML = `<p class="empty-collection">${data.error || "Impossible de charger vos commandes."}</p>`;
            return;
        }

        const orders = data.orders || [];
        if (orders.length === 0) {
            listEl.innerHTML = `<p class="empty-collection">Vous n'avez pas encore passé de commande. Vos achats apparaîtront ici.</p>`;
            return;
        }

        listEl.innerHTML = orders.map(order => `
            <div class="seller-product-form-wrapper" style="margin-bottom: 1.25rem;">
                <div class="seller-dashboard-header" style="padding: 0 0 1rem; margin-bottom: 1rem;">
                    <div>
                        <h2 style="font-size: 1.1rem;">Commande ${order.orderNumber}</h2>
                        <p style="font-size: 0.85rem;">${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · Livraison à ${order.shippingCity}</p>
                    </div>
                    <span class="product-badge" style="position: static;">${order.status}</span>
                </div>
                <div class="seller-products-table-scroll">
                    <table class="seller-products-table">
                        <thead><tr><th>Article</th><th>Qté</th><th>Prix</th></tr></thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}${item.color ? ' — ' + item.color : ''}${item.size ? ' — ' + item.size : ''}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <p style="text-align: right; margin-top: 0.75rem; font-weight: 700;">Total : ${formatPrice(order.totalPrice)}</p>
            </div>
        `).join('');
    } catch (e) {
        const listEl = document.getElementById('customerOrdersList');
        if (listEl) listEl.innerHTML = `<p class="empty-collection">Connexion au serveur impossible. Réessayez plus tard.</p>`;
    }
}

// ----------------------- PAGE DE COMMANDE (CHECKOUT) -----------------------
// Se déclenche quand un client clique "Passer la commande" alors qu'il
// n'est pas connecté : on ouvre le modal de connexion, et on l'enverra
// automatiquement au checkout une fois connecté.
let pendingCheckoutAfterLogin = false;

function goToCheckout() {
    if (cart.length === 0) return;

    if (!getCurrentCustomer()) {
        pendingCheckoutAfterLogin = true;
        toggleCart();
        showNotification('Connectez-vous pour finaliser votre commande.');
        toggleLoginModal();
        return;
    }

    navigateTo('checkout');
}

function loadCheckoutPage() {
    if (cart.length === 0 || !getCurrentCustomer()) {
        navigateTo(cart.length === 0 ? 'home' : 'account');
        return;
    }
    document.getElementById('app').innerHTML = pageTemplates.checkout;
    renderCheckoutPage();
    updateCartBadge();
}

function renderCheckoutPage() {
    const container = document.getElementById('checkoutContent');
    if (!container) return;

    const customer = getCurrentCustomer();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    container.innerHTML = `
        <div class="seller-landing">
            <div class="seller-pitch">
                <h2>Récapitulatif de votre commande</h2>
                ${cart.map(item => `
                    <div class="seller-pitch-item">
                        <img src="${getProductImageUrl(item.image, 60, 60)}" alt="${item.name}" class="seller-product-thumb">
                        <div>
                            <p class="usp-title">${item.name}</p>
                            <p class="usp-sub">Qté ${item.quantity}${item.color ? ' · ' + item.color : ''}${item.size ? ' · ' + item.size : ''} — ${formatPrice(item.price * item.quantity)}</p>
                        </div>
                    </div>
                `).join('')}
                <p style="font-weight: 700; font-size: 1.1rem; margin-top: 1rem;">Total : ${formatPrice(subtotal)}</p>
            </div>

            <div class="seller-auth-card">
                <h2 style="margin-bottom: 1rem;">Adresse de livraison</h2>
                <form onsubmit="submitOrder(event)">
                    <div class="form-group">
                        <label>Téléphone de livraison *</label>
                        <input type="tel" name="shippingPhone" placeholder="+243..." value="${customer.phone}" required>
                    </div>
                    <div class="form-group">
                        <label>Ville *</label>
                        <select name="shippingCity" required>
                            <option value="Bukavu" ${customer.city === 'Bukavu' ? 'selected' : ''}>Bukavu</option>
                            <option value="Uvira" ${customer.city === 'Uvira' ? 'selected' : ''}>Uvira</option>
                            <option value="Goma" ${customer.city === 'Goma' ? 'selected' : ''}>Goma</option>
                            <option value="Baraka" ${customer.city === 'Baraka' ? 'selected' : ''}>Baraka (territoire de Fizi)</option>
                            <option value="Autre" ${customer.city === 'Autre' ? 'selected' : ''}>Autre ville</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Adresse complète *</label>
                        <textarea name="shippingAddress" rows="3" placeholder="Quartier, avenue, référence..." required></textarea>
                    </div>
                    <p class="seller-form-note">Le paiement se fait à la livraison (Mobile Money ou espèces), notre équipe vous contactera pour confirmer.</p>
                    <button type="submit" class="btn btn-primary full-width">Confirmer la commande</button>
                </form>
            </div>
        </div>
    `;
}

async function submitOrder(event) {
    event.preventDefault();
    const form = event.target;

    const payload = {
        items: cart,
        shippingPhone: form.elements['shippingPhone'].value.trim(),
        shippingCity: form.elements['shippingCity'].value,
        shippingAddress: form.elements['shippingAddress'].value.trim()
    };

    if (!payload.shippingPhone || !payload.shippingAddress) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${CUSTOMER_API}/place-order.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Impossible d'enregistrer la commande.");
            return;
        }

        cart = [];
        saveCart();
        updateCartBadge();
        showNotification(`Commande ${data.orderNumber} confirmée ! Vous pouvez la suivre dans « Mon compte ».`);
        navigateTo('account');
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}
