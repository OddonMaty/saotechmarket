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
let customerAddressesCache = [];

async function refreshCustomerAddresses() {
    try {
        const res = await fetch(`${CUSTOMER_API}/customer-addresses.php`);
        const data = await res.json();
        customerAddressesCache = data.addresses || [];
    } catch (e) {
        console.warn('Impossible de charger le carnet d\'adresses.', e);
        customerAddressesCache = [];
    }
}

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
        await refreshCustomerAddresses();
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
        await refreshCustomerAddresses();
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
            <h2>Mes messages</h2>
            <div id="customerConversationsList"><p class="empty-collection">Chargement…</p></div>
            <div id="customerConversationThread" class="seller-product-form-wrapper" style="display:none; margin-top: 1rem;"></div>
        </div>

        <div class="seller-products-table-wrapper">
            <div class="seller-dashboard-header" style="padding: 0 0 1rem; margin-bottom: 1.5rem; border-bottom: none;">
                <h2 style="font-size: 1.3rem;">Mes adresses</h2>
                <button class="btn btn-primary" onclick="showAddressForm()"><i class="fas fa-plus"></i> Ajouter une adresse</button>
            </div>
            <div id="addressFormWrapper" class="seller-product-form-wrapper" style="display:none;"></div>
            <div id="customerAddressesList"></div>
        </div>

        <div class="seller-products-table-wrapper">
            <h2>Mes commandes</h2>
            <div id="customerOrdersList"><p class="empty-collection">Chargement de vos commandes…</p></div>
        </div>
    `;

    if (customerChatPollInterval) {
        clearInterval(customerChatPollInterval);
        customerChatPollInterval = null;
    }
    customerActiveConversationId = null;

    renderCustomerAddressesList();
    renderCustomerConversationsList();

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
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Livraison : ${order.shippingAddress} · ${order.shippingPhone}</p>
                ${order.status === 'En attente' ? `
                    <div class="seller-form-actions" style="margin-top: 0.75rem;">
                        <button class="link-btn" onclick="showEditOrderAddressForm('${order.orderNumber}', this)">Modifier l'adresse de livraison</button>
                    </div>
                    <div class="order-address-edit-wrapper" style="display:none; margin-top: 1rem;"></div>
                ` : ''}
            </div>
        `).join('');
    } catch (e) {
        const listEl = document.getElementById('customerOrdersList');
        if (listEl) listEl.innerHTML = `<p class="empty-collection">Connexion au serveur impossible. Réessayez plus tard.</p>`;
    }
}

// ----------------------- CARNET D'ADRESSES -----------------------
function renderCustomerAddressesList() {
    const listEl = document.getElementById('customerAddressesList');
    if (!listEl) return;

    if (customerAddressesCache.length === 0) {
        listEl.innerHTML = `<p class="empty-collection">Aucune adresse enregistrée. Ajoutes-en une pour aller plus vite à ta prochaine commande.</p>`;
        return;
    }

    listEl.innerHTML = `
        <div class="seller-stats" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
            ${customerAddressesCache.map(addr => `
                <div class="seller-stat-card" style="text-align: left;">
                    <p style="font-weight: 700; margin-bottom: 0.25rem;">${addr.label} ${addr.isDefault ? '<span class="product-badge official-badge" style="position: static; font-size: 0.6rem; vertical-align: middle;">PAR DÉFAUT</span>' : ''}</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${addr.address}</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${addr.city} · ${addr.phone}</p>
                    <div class="seller-form-actions" style="margin-top: 0.75rem;">
                        <button class="link-btn" onclick="showAddressForm(${addr.id})">Modifier</button>
                        <button class="link-btn" onclick="deleteCustomerAddress(${addr.id})">Supprimer</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

let editingAddressId = null;

function showAddressForm(id) {
    editingAddressId = id || null;
    const wrapper = document.getElementById('addressFormWrapper');
    if (!wrapper) return;

    const existing = id ? customerAddressesCache.find(a => a.id === id) : null;

    wrapper.style.display = 'block';
    wrapper.innerHTML = `
        <h2>${existing ? 'Modifier l\'adresse' : 'Ajouter une adresse'}</h2>
        <form onsubmit="saveCustomerAddress(event)">
            <div class="form-row">
                <input type="text" name="label" placeholder="Nom (ex. Maison, Bureau)" value="${existing ? existing.label : ''}">
                <select name="city">
                    <option value="Bukavu" ${existing && existing.city === 'Bukavu' ? 'selected' : ''}>Bukavu</option>
                    <option value="Uvira" ${existing && existing.city === 'Uvira' ? 'selected' : ''}>Uvira</option>
                    <option value="Goma" ${existing && existing.city === 'Goma' ? 'selected' : ''}>Goma</option>
                    <option value="Baraka" ${existing && existing.city === 'Baraka' ? 'selected' : ''}>Baraka (territoire de Fizi)</option>
                    <option value="Autre" ${existing && existing.city === 'Autre' ? 'selected' : ''}>Autre ville</option>
                </select>
            </div>
            <textarea name="address" rows="2" placeholder="Quartier, avenue, référence..." required>${existing ? existing.address : ''}</textarea>
            <input type="tel" name="phone" placeholder="Téléphone pour cette adresse *" value="${existing ? existing.phone : ''}" required>
            <label class="checkbox-label">
                <input type="checkbox" name="isDefault" ${existing && existing.isDefault ? 'checked' : ''}>
                <span>Utiliser comme adresse par défaut</span>
            </label>
            <div class="seller-form-actions">
                <button type="submit" class="btn btn-primary">${existing ? 'Enregistrer' : 'Ajouter l\'adresse'}</button>
                <button type="button" class="btn btn-outline" onclick="cancelAddressForm()">Annuler</button>
            </div>
        </form>
    `;
    wrapper.scrollIntoView({ behavior: 'smooth' });
}

function cancelAddressForm() {
    editingAddressId = null;
    const wrapper = document.getElementById('addressFormWrapper');
    if (wrapper) {
        wrapper.style.display = 'none';
        wrapper.innerHTML = '';
    }
}

async function saveCustomerAddress(event) {
    event.preventDefault();
    const form = event.target;

    const payload = {
        label: form.elements['label'].value.trim() || 'Adresse',
        city: form.elements['city'].value,
        address: form.elements['address'].value.trim(),
        phone: form.elements['phone'].value.trim(),
        isDefault: form.elements['isDefault'].checked
    };

    if (!payload.address || !payload.phone) return;

    const isEditing = !!editingAddressId;
    if (isEditing) payload.id = editingAddressId;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${CUSTOMER_API}/${isEditing ? 'update-customer-address.php' : 'add-customer-address.php'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Impossible d'enregistrer cette adresse.");
            return;
        }

        await refreshCustomerAddresses();
        cancelAddressForm();
        renderCustomerAddressesList();
        showNotification(isEditing ? 'Adresse mise à jour.' : 'Adresse ajoutée à votre carnet.');
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function deleteCustomerAddress(id) {
    if (!confirm('Supprimer cette adresse de ton carnet ?')) return;

    try {
        const res = await fetch(`${CUSTOMER_API}/delete-customer-address.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Suppression impossible.");
            return;
        }

        await refreshCustomerAddresses();
        renderCustomerAddressesList();
        showNotification('Adresse supprimée.');
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    }
}

// ----------------------- MODIFIER L'ADRESSE D'UNE COMMANDE EXISTANTE -----------------------
function showEditOrderAddressForm(orderNumber, btnEl) {
    const wrapper = btnEl.closest('.seller-product-form-wrapper').querySelector('.order-address-edit-wrapper');
    if (!wrapper) return;

    const isOpen = wrapper.style.display !== 'none';
    if (isOpen) {
        wrapper.style.display = 'none';
        wrapper.innerHTML = '';
        return;
    }

    wrapper.style.display = 'block';
    wrapper.innerHTML = `
        <form onsubmit="submitOrderAddressUpdate(event, '${orderNumber}')">
            <div class="form-row">
                <select name="shippingCity">
                    <option value="Bukavu">Bukavu</option>
                    <option value="Uvira">Uvira</option>
                    <option value="Goma">Goma</option>
                    <option value="Baraka">Baraka (territoire de Fizi)</option>
                    <option value="Autre">Autre ville</option>
                </select>
                <input type="tel" name="shippingPhone" placeholder="Téléphone de livraison *" required>
            </div>
            <textarea name="shippingAddress" rows="2" placeholder="Nouvelle adresse complète..." required></textarea>
            <div class="seller-form-actions">
                <button type="submit" class="btn btn-primary">Mettre à jour l'adresse</button>
            </div>
        </form>
    `;
}

async function submitOrderAddressUpdate(event, orderNumber) {
    event.preventDefault();
    const form = event.target;

    const payload = {
        orderNumber,
        shippingCity: form.elements['shippingCity'].value,
        shippingAddress: form.elements['shippingAddress'].value.trim(),
        shippingPhone: form.elements['shippingPhone'].value.trim()
    };

    if (!payload.shippingAddress || !payload.shippingPhone) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${CUSTOMER_API}/update-order-address.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Impossible de mettre à jour l'adresse.");
            return;
        }

        showNotification(`Adresse de la commande ${orderNumber} mise à jour.`);
        renderAccountPage();
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ----------------------- MESSAGERIE : CÔTÉ CLIENT -----------------------

// Ouvre le petit formulaire "Poser une question" sur la fiche produit
function openAskSellerBox() {
    if (!getCurrentCustomer()) {
        showNotification('Connecte-toi pour envoyer un message au vendeur.');
        toggleLoginModal();
        return;
    }

    const wrapper = document.getElementById('askSellerWrapper');
    const box = document.getElementById('askSellerBox');
    if (!wrapper || !box) return;

    const isOpen = box.style.display !== 'none';
    if (isOpen) {
        box.style.display = 'none';
        box.innerHTML = '';
        return;
    }

    const productName = wrapper.dataset.productName || '';
    box.style.display = 'block';
    box.innerHTML = `
        <form onsubmit="submitAskSellerMessage(event)">
            <textarea name="message" rows="3" placeholder="Ta question à propos de « ${productName} »..." required></textarea>
            <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">Envoyer</button>
        </form>
    `;
}

async function submitAskSellerMessage(event) {
    event.preventDefault();
    const form = event.target;
    const wrapper = document.getElementById('askSellerWrapper');
    const sellerId = wrapper ? wrapper.dataset.sellerId : null;
    const productName = wrapper ? wrapper.dataset.productName : '';
    const message = form.elements['message'].value.trim();

    if (!sellerId || !message) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(`${CUSTOMER_API}/start-conversation.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId: Number(sellerId), productName, message })
        });
        const data = await res.json();

        if (!res.ok) {
            showNotification(data.error || "Impossible d'envoyer ce message.");
            return;
        }

        showNotification('Message envoyé ! Retrouve la conversation dans « Mon compte ».');
        document.getElementById('askSellerBox').innerHTML = '';
        document.getElementById('askSellerBox').style.display = 'none';
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ----------------------- MESSAGERIE : "MON COMPTE" -----------------------
let customerActiveConversationId = null;
let customerChatPollInterval = null;

async function renderCustomerConversationsList() {
    const listEl = document.getElementById('customerConversationsList');
    if (!listEl) return;

    try {
        const res = await fetch(`${CUSTOMER_API}/list-conversations.php`);
        const data = await res.json();
        const conversations = data.conversations || [];

        if (conversations.length === 0) {
            listEl.innerHTML = `<p class="empty-collection">Aucune conversation pour le moment. Pose une question depuis une fiche produit pour en démarrer une.</p>`;
            return;
        }

        listEl.innerHTML = conversations.map(c => `
            <div class="checkout-address-option ${c.unreadCount > 0 ? 'active' : ''}" onclick="openCustomerConversation(${c.id})" style="cursor:pointer;">
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

async function openCustomerConversation(conversationId) {
    customerActiveConversationId = conversationId;
    const threadEl = document.getElementById('customerConversationThread');
    if (!threadEl) return;

    threadEl.style.display = 'block';
    await loadCustomerConversationThread();
    threadEl.scrollIntoView({ behavior: 'smooth' });

    if (customerChatPollInterval) clearInterval(customerChatPollInterval);
    customerChatPollInterval = setInterval(loadCustomerConversationThread, 8000);
}

async function loadCustomerConversationThread() {
    const threadEl = document.getElementById('customerConversationThread');
    if (!threadEl || !customerActiveConversationId) return;

    try {
        const res = await fetch(`${CUSTOMER_API}/get-messages.php?conversationId=${customerActiveConversationId}`);
        const data = await res.json();
        if (!res.ok) return;

        threadEl.innerHTML = `
            <h2 style="font-size: 1.1rem; margin-bottom: 1rem;">Conversation avec ${data.conversation.sellerName}</h2>
            <div class="chat-messages" id="customerChatMessages">
                ${data.messages.map(m => `
                    <div class="chat-bubble ${m.senderType === 'customer' ? 'chat-bubble-mine' : 'chat-bubble-theirs'}">
                        <p>${m.message}</p>
                        <span class="chat-bubble-time">${new Date(m.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                `).join('')}
            </div>
            <form onsubmit="sendCustomerChatMessage(event)" class="chat-reply-form">
                <input type="text" name="message" placeholder="Écris ton message..." required>
                <button type="submit" class="btn btn-primary">Envoyer</button>
            </form>
        `;
        const msgContainer = document.getElementById('customerChatMessages');
        if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;

        renderCustomerConversationsList();
    } catch (e) {
        // silencieux : on réessaiera au prochain rafraîchissement
    }
}

async function sendCustomerChatMessage(event) {
    event.preventDefault();
    const form = event.target;
    const message = form.elements['message'].value.trim();
    if (!message || !customerActiveConversationId) return;

    form.elements['message'].value = '';

    try {
        await fetch(`${CUSTOMER_API}/send-message.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: customerActiveConversationId, message })
        });
        await loadCustomerConversationThread();
    } catch (e) {
        showNotification("Connexion au serveur impossible. Réessayez plus tard.");
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
    const hasSavedAddresses = customerAddressesCache.length > 0;
    const defaultAddr = customerAddressesCache.find(a => a.isDefault) || customerAddressesCache[0];
    selectedCheckoutAddressId = defaultAddr ? defaultAddr.id : null;

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

                <div id="savedAddressSection" style="display: ${hasSavedAddresses ? 'block' : 'none'};">
                    <div id="savedAddressesList" class="checkout-address-list">
                        ${customerAddressesCache.map(addr => `
                            <label class="checkout-address-option ${addr.id === selectedCheckoutAddressId ? 'active' : ''}" onclick="selectCheckoutAddress(${addr.id})">
                                <input type="radio" name="checkoutAddress" ${addr.id === selectedCheckoutAddressId ? 'checked' : ''}>
                                <div>
                                    <p style="font-weight: 700;">${addr.label}</p>
                                    <p style="font-size: 0.85rem; color: var(--text-muted);">${addr.address} · ${addr.city} · ${addr.phone}</p>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                    <button type="button" class="link-btn" style="margin: 0.75rem 0;" onclick="toggleNewCheckoutAddressForm(true)">+ Utiliser une nouvelle adresse</button>
                    <p class="seller-form-note">Le paiement se fait à la livraison (Mobile Money ou espèces), notre équipe vous contactera pour confirmer.</p>
                    <button type="button" class="btn btn-primary full-width" onclick="submitOrderWithSavedAddress()">Confirmer la commande</button>
                </div>

                <div id="newAddressSection" style="display: ${hasSavedAddresses ? 'none' : 'block'};">
                    ${hasSavedAddresses ? `<button type="button" class="link-btn" style="margin-bottom: 0.75rem;" onclick="toggleNewCheckoutAddressForm(false)">← Revenir à mes adresses enregistrées</button>` : ''}
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
                        <label class="checkbox-label">
                            <input type="checkbox" name="saveAddress" checked>
                            <span>Enregistrer cette adresse pour la prochaine fois</span>
                        </label>
                        <p class="seller-form-note">Le paiement se fait à la livraison (Mobile Money ou espèces), notre équipe vous contactera pour confirmer.</p>
                        <button type="submit" class="btn btn-primary full-width">Confirmer la commande</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

let selectedCheckoutAddressId = null;

function selectCheckoutAddress(id) {
    selectedCheckoutAddressId = id;
    document.querySelectorAll('.checkout-address-option').forEach(el => {
        el.classList.remove('active');
        el.querySelector('input[type="radio"]').checked = false;
    });
    const target = Array.from(document.querySelectorAll('.checkout-address-option')).find(el => el.getAttribute('onclick') === `selectCheckoutAddress(${id})`);
    if (target) {
        target.classList.add('active');
        target.querySelector('input[type="radio"]').checked = true;
    }
}

function toggleNewCheckoutAddressForm(showNew) {
    const savedSection = document.getElementById('savedAddressSection');
    const newSection = document.getElementById('newAddressSection');
    if (savedSection) savedSection.style.display = showNew ? 'none' : 'block';
    if (newSection) newSection.style.display = showNew ? 'block' : 'none';
}

// Commande passée en choisissant une adresse déjà enregistrée
async function submitOrderWithSavedAddress() {
    const addr = customerAddressesCache.find(a => a.id === selectedCheckoutAddressId);
    if (!addr) {
        showNotification('Merci de sélectionner une adresse.');
        return;
    }

    await placeOrderRequest({
        shippingPhone: addr.phone,
        shippingCity: addr.city,
        shippingAddress: addr.address
    });
}

async function submitOrder(event) {
    event.preventDefault();
    const form = event.target;

    const shippingPhone = form.elements['shippingPhone'].value.trim();
    const shippingCity = form.elements['shippingCity'].value;
    const shippingAddress = form.elements['shippingAddress'].value.trim();
    const shouldSave = form.elements['saveAddress'] && form.elements['saveAddress'].checked;

    if (!shippingPhone || !shippingAddress) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Si demandé, on enregistre d'abord cette adresse dans le carnet du client
    // (une erreur ici n'empêche pas la commande de continuer).
    if (shouldSave) {
        try {
            await fetch(`${CUSTOMER_API}/add-customer-address.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: 'Adresse',
                    city: shippingCity,
                    address: shippingAddress,
                    phone: shippingPhone,
                    isDefault: customerAddressesCache.length === 0
                })
            });
            await refreshCustomerAddresses();
        } catch (e) {
            // pas bloquant : on continue quand même vers la commande
        }
    }

    await placeOrderRequest({ shippingPhone, shippingCity, shippingAddress }, submitBtn);
}

// Envoie effectivement la commande au serveur, avec les informations de
// livraison fournies (issues du formulaire ou d'une adresse enregistrée).
async function placeOrderRequest(shippingInfo, submitBtn) {
    const payload = { items: cart, ...shippingInfo };

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
