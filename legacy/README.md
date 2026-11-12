# Sao Tech Market — Site e-commerce (HTML/CSS/JS + backend PHP/MySQL)

🚀 **Marketplace électronique, mode et construction pour la RDC — front-end HTML/CSS/JS natif, avec un backend PHP/MySQL pour les comptes vendeurs et clients.**

---

## 📋 Structure du projet

```
Sao Tech Market/
├── index.html                 # Point d'entrée du site
├── css/
│   └── styles.css             # Tout le style (couleurs, mise en page, responsive)
├── js/
│   ├── data.js                # Catalogue officiel (19 produits), FAQ
│   ├── pages.js                # Contenu de toutes les pages, intégré en JS
│   ├── sellers.js              # Espace vendeur : appelle le backend (voir plus bas)
│   ├── customers.js            # Comptes clients + suivi de commandes : appelle le backend
│   └── main.js                 # Logique de l'application (navigation, panier, filtres…)
├── backend/                    # ⭐ Backend PHP/MySQL
│   ├── config.php               # Identifiants de connexion à ta base de données (à remplir)
│   ├── db.php                    # Connexion PDO à MySQL
│   ├── helpers.php               # Fonctions communes (JSON, session, sécurité, rayons/villes autorisés)
│   ├── schema.sql                # Structure des 4 tables à importer dans phpMyAdmin (1ère mise en ligne)
│   ├── migration_add_department.sql        # Migration (uniquement si site déjà en ligne)
│   ├── migration_add_customer_accounts.sql # Migration (uniquement si site déjà en ligne)
│   └── api/                      # Un fichier PHP par action (inscription, connexion, produits, commandes…)
├── DEPLOIEMENT.md              # ⭐ Guide pas-à-pas pour mettre le site en ligne sur Hostinger
└── README.md                   # Ce fichier
```

> ℹ️ **Important** : le site a besoin d'un serveur PHP + MySQL pour que l'espace vendeur et les comptes clients fonctionnent — ce n'est donc plus une simple page HTML à double-cliquer. Le catalogue, le panier et les pages d'info s'affichent bien sans backend, mais inscription, connexion, ajout de produit et passage de commande ont besoin du serveur pour répondre. **Pour la mise en ligne, suis le guide `DEPLOIEMENT.md`.**

---

## 🛍️ Nos produits — 4 rayons

Le menu **« Nos produits »** propose un méga-menu à 4 colonnes :
- **Gadgets Électroniques** — Smartphone, Tablette, Audio, Montre connectée, Ordinateur, Appareil photo, Télévision
- **Matériaux de Construction** — Ciment, Fer à béton, Peinture, Carrelage
- **Vêtements et Chaussures** — Chemises, Robes, Pantalons, Chaussures
- **Imprimantes** — Imprimante Laser, Imprimante Jet d'encre, Multifonction

Chaque rayon (ou chaque catégorie précise) peut s'ouvrir directement depuis le menu, avec filtres, recherche et badge **« VENDEUR »** pour les produits ajoutés par des vendeurs tiers.

---

## 🏪 Espace vendeur

Le site permet aux vendeurs tiers d'ouvrir leur propre boutique via le bouton **« Vendeur »** dans l'en-tête :
- Créer un compte boutique (nom, contact, ville — Bukavu, Uvira, Goma, Baraka ou autre) ou se connecter à un compte existant.
- Ajouter, modifier et supprimer ses propres produits depuis un tableau de bord dédié, en choisissant un **rayon** (parmi les 4 ci-dessus) — prix saisis en **francs congolais (FC)**.
- Les produits ajoutés apparaissent automatiquement dans le rayon choisi, avec un badge **« VENDEUR »**.

Les comptes vendeurs et leurs produits sont stockés dans une vraie base de données MySQL, partagés par tous les visiteurs. Mots de passe chiffrés côté serveur ; chaque vendeur ne peut modifier/supprimer que ses propres produits (vérifié côté serveur, pas seulement côté site).

**Boutique officielle** : n'importe quel compte vendeur peut être marqué comme « officiel » (une seule commande SQL à exécuter une fois dans phpMyAdmin — voir `DEPLOIEMENT.md`). Ses produits affichent alors un badge **« OFFICIEL »** au lieu de « VENDEUR », sans ligne « Vendu par » — pratique pour que le propriétaire du site ajoute ses propres produits sans toucher au code.

---

## 👤 Compte client & suivi de commande

Le bouton **« Compte »** dans l'en-tête ouvre l'inscription/connexion client :
- Créer un compte (nom, e-mail, téléphone, ville, mot de passe).
- Ajouter des produits au panier puis **« Passer la commande »** : le client renseigne son adresse de livraison, et la commande est enregistrée.
- La page **« Mon compte »** affiche l'historique des commandes passées (articles, ville de livraison, statut, total).

Comme pour les vendeurs, chaque client ne voit que ses propres commandes (vérifié côté serveur).

**Carnet d'adresses** : depuis « Mon compte », un client peut enregistrer plusieurs adresses (ex. Maison, Bureau) pour les réutiliser en un clic à ses prochaines commandes, sans tout retaper. Il peut aussi ajouter une nouvelle adresse directement au moment de commander (avec option de l'enregistrer pour la prochaine fois), et modifier l'adresse de livraison d'une commande déjà passée tant qu'elle est encore « En attente ».

**Notifications vendeur** : dès qu'un produit est commandé, le vendeur reçoit à la fois un e-mail et une notification fiable directement dans son tableau de bord (icône cloche avec badge non lu) — pratique car les e-mails automatiques arrivent parfois en spam sur certains hébergements.

**Messagerie directe client ↔ vendeur** : sur la fiche d'un produit vendeur, le client peut cliquer « Poser une question au vendeur » pour démarrer une conversation. Les deux parties peuvent ensuite échanger des messages, consultables depuis « Mon compte » (client) ou le bouton « Messages » du tableau de bord (vendeur), avec badge de messages non lus.

---

## 🚀 Démarrage (mise en ligne)

Ce site a besoin d'un hébergement avec **PHP et MySQL** (ex. Hostinger) pour fonctionner pleinement — voir **`DEPLOIEMENT.md`** pour la marche à suivre complète, pas à pas.

En résumé :
1. Créer une base MySQL et y importer `backend/schema.sql`.
2. Renseigner tes identifiants de base dans `backend/config.php`.
3. Envoyer tout le dossier du site sur ton hébergement.
4. Vérifier le HTTPS, puis tester le catalogue, l'espace vendeur et le compte client.

---

## 🎨 Fonctionnalités

- **Accueil** — diaporama Hero, nouveaux produits, offres du jour, newsletter
- **Nos produits** — méga-menu à 4 rayons, grille de produits avec recherche, tri et filtres
- **Fiche produit** — couleur/capacité, quantité, ajout au panier
- **Espace vendeur** — inscription, tableau de bord, gestion des produits par rayon
- **Mon compte** — inscription/connexion client, historique de commandes
- **FAQ** — questions/réponses dépliables
- **À propos** — présentation, agences (Bukavu, Uvira)
- **Contact** — formulaire + coordonnées

- 🛒 Panier persistant (localStorage, avec repli silencieux si indisponible)
- 🖼️ Diaporama Hero automatique + contrôles manuels
- ⏱️ Compte à rebours pour les ventes flash
- 🔍 Recherche, filtres et tri des produits
- 📱 Design responsive (mobile, tablette, bureau)
- 📧 Popup newsletter (après 5 secondes)

---

## 🇨🇩 Adaptation marché RDC

- Marque : **Sao Tech Market**
- Contenus entièrement en français
- Numéros de téléphone au format congolais (+243), contact : **+243 907 261 113**
- Agences à **Bukavu (siège) et Uvira**
- Livraison couvrant **Bukavu, Uvira, Goma et Baraka** (territoire de Fizi), Mobile Money et cash à la livraison
- **Tous les prix sont affichés en francs congolais (FC)**, convertis automatiquement selon le taux du jour (voir `formatPrice()` dans `js/main.js`)

---

## 🛠️ Personnalisation

### Modifier les couleurs
Dans `css/styles.css`, en haut du fichier :
```css
:root {
    --primary: #2B8C87;
    --dark: #1E1E22;
    --light: #F5F5F5;
}
```

### Ajouter un produit au catalogue officiel
Dans `js/data.js`, tableau `products` — n'oublie pas le champ `department` (`electronique`, `construction`, `vetements` ou `imprimantes`) :
```javascript
{
    id: 20,
    name: "Nom du produit",
    price: 299,
    originalPrice: 399,
    discount: 25,
    department: "electronique",
    category: "Catégorie",
    image: "identifiant-photo-unsplash",
    rating: 4.5,
    reviews: 100,
    inStock: true,
    sku: "E-00020",
    colors: ["Noir", "Blanc"],
    sizes: ["64Go", "128Go"],
    tags: ["new"],
    description: "Description du produit"
}
```

### Ajouter un rayon au méga-menu
1. Dans `js/main.js`, ajoute une entrée à `departmentLabels`.
2. Dans `js/pages.js` (fonction `navHeader`), ajoute une colonne `.mega-menu-column` dans le méga-menu.
3. Dans `backend/helpers.php`, ajoute la clé du rayon à `ALLOWED_DEPARTMENTS` (sinon le serveur refusera les produits vendeurs de ce rayon).

### Modifier une page (texte, mise en page)
Ouvrez `js/pages.js` : chaque page est une entrée de l'objet `pageTemplates` (`home`, `collection`, `product`, `faq`, `about`, `contact`, `seller`, `seller-dashboard`, `account`, `checkout`…), sous forme de code HTML classique à l'intérieur d'un template JavaScript.

### Modifier l'en-tête / le pied de page (communs à toutes les pages)
Toujours dans `js/pages.js` : fonction `navHeader()` pour l'en-tête/navigation/méga-menu, constante `footerBlock` pour le pied de page.

---

## 🚫 Limites actuelles

- Pas de vraie passerelle de paiement en ligne : le paiement se fait à la livraison (Mobile Money ou espèces), pas de carte bancaire.
- Pas d'interface d'administration : le statut d'une commande reste « En attente » (à changer manuellement en base si besoin) et il n'y a pas de tableau de modération des annonces vendeurs.
- Le stock n'est pas décrémenté automatiquement après une commande.
- Images produits chargées depuis Unsplash (nécessite une connexion internet).

---

## 🔧 Navigateurs supportés

Chrome, Firefox, Safari, Edge — versions récentes.

---

**Bon développement ! 🚀**
