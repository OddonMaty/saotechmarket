# Sao Tech Market — Site e-commerce (HTML/CSS/JS + backend PHP/MySQL)

🚀 **Site e-commerce en HTML, CSS et JavaScript natifs, avec un petit backend PHP/MySQL pour l'espace vendeur.**

---

## 📋 Structure du projet

```
Sao Tech Market/
├── index.html               # Point d'entrée du site
├── css/
│   └── styles.css           # Tout le style (couleurs, mise en page, responsive)
├── js/
│   ├── data.js              # Produits du catalogue officiel, FAQ
│   ├── pages.js             # Contenu des pages, intégré en JS
│   ├── sellers.js           # Espace vendeur : appelle le backend (voir plus bas)
│   └── main.js              # Logique de l'application (navigation, panier, filtres…)
├── backend/                  # ⭐ Backend PHP/MySQL de l'espace vendeur
│   ├── config.php            # Identifiants de connexion à ta base de données (à remplir)
│   ├── db.php                 # Connexion PDO à MySQL
│   ├── helpers.php            # Fonctions communes (JSON, session, sécurité)
│   ├── schema.sql             # Structure des tables à importer dans phpMyAdmin
│   └── api/                   # Un fichier PHP par action (inscription, connexion, produits…)
├── DEPLOIEMENT.md             # ⭐ Guide pas-à-pas pour mettre le site en ligne sur Hostinger
└── README.md                  # Ce fichier
```

> ℹ️ **Important** : depuis l'ajout du backend, le site a besoin d'un serveur PHP + MySQL pour que l'espace vendeur fonctionne (ce n'est donc plus une simple page HTML à double-cliquer). Le reste du site (catalogue, panier, pages d'info) continue de s'afficher sans backend, mais l'inscription/connexion vendeur et l'ajout de produits ont besoin du serveur pour répondre. **Pour la mise en ligne, suis le guide `DEPLOIEMENT.md`.**

---

## 🏪 Espace vendeur

Le site permet aux vendeurs tiers d'ouvrir leur propre boutique via le bouton **« Vendeur »** dans l'en-tête :
- Créer un compte boutique (nom, contact, ville) ou se connecter à un compte existant.
- Ajouter, modifier et supprimer ses propres produits depuis un tableau de bord dédié — prix saisis en **francs congolais (FC)**.
- Les produits ajoutés par les vendeurs apparaissent automatiquement dans le catalogue général (accueil, page Collection, fiche produit), avec un badge **« VENDEUR »**, et peuvent être filtrés séparément depuis la barre latérale de la page Collection.

✅ **Ce qui a changé** : les comptes vendeurs et leurs produits sont maintenant stockés dans une **vraie base de données MySQL**, sur le serveur — partagés par tous les visiteurs du site (et non plus seulement sur un navigateur). Les mots de passe sont chiffrés côté serveur (jamais stockés en clair), et chaque vendeur ne peut modifier ou supprimer que ses propres produits (vérifié côté serveur). Voir `DEPLOIEMENT.md` pour l'installation sur Hostinger.

---


## 🚀 Démarrage

1. Décompressez le dossier.
2. Double-cliquez sur `index.html`.
3. C'est tout — le site s'ouvre dans votre navigateur, sans serveur ni connexion obligatoire (à part le chargement des images produits, hébergées sur Unsplash, et des polices/icônes via CDN).

Vous pouvez aussi le déposer tel quel sur n'importe quel hébergement statique (Netlify, GitHub Pages, un simple hébergement mutualisé, etc.) sans aucune configuration supplémentaire.

---

## 🎨 Fonctionnalités

- **Accueil** — diaporama Hero, nouveaux produits, offres du jour, newsletter
- **Collections** — grille de produits avec tri et filtres
- **Fiche produit** — couleur/capacité, quantité, ajout au panier
- **FAQ** — questions/réponses dépliables
- **À propos** — présentation, agences (Bukavu, Uvira)
- **Contact** — formulaire + coordonnées

- 🛒 Panier persistant (localStorage, avec repli silencieux si indisponible)
- 🖼️ Diaporama Hero automatique + contrôles manuels
- ⏱️ Compte à rebours pour les ventes flash
- 🔍 Filtres et tri des produits
- ❤️ Liste de favoris
- 📱 Design responsive (mobile, tablette, bureau)
- 📧 Popup newsletter (après 5 secondes)

---

## 🇨🇩 Adaptation marché RDC

- Marque : **Sao Tech Market**
- Contenus entièrement en français
- Numéros de téléphone au format congolais (+243)
- Agences à **Bukavu (siège) et Uvira**
- Livraison et FAQ adaptées à la zone de service (Bukavu / Uvira, Mobile Money, cash à la livraison)
- Prix affichés en USD (pratique courante pour l'électronique importée en RDC)

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

### Ajouter un produit
Dans `js/data.js`, tableau `products` :
```javascript
{
    id: 9,
    name: "Nom du produit",
    price: 299,
    originalPrice: 399,
    discount: 25,
    category: "Catégorie",
    image: "identifiant-photo-unsplash",
    rating: 4.5,
    reviews: 100,
    inStock: true,
    sku: "E-00009",
    colors: ["Noir", "Blanc"],
    sizes: ["64Go", "128Go"],
    tags: ["new"],
    description: "Description du produit"
}
```

### Modifier une page (texte, mise en page)
Ouvrez `js/pages.js` : chaque page est une entrée de l'objet `pageTemplates` (`home`, `collection`, `product`, `faq`, `about`, `contact`), sous forme de code HTML classique à l'intérieur d'un template JavaScript.

### Modifier l'en-tête / le pied de page (communs à toutes les pages)
Toujours dans `js/pages.js` : fonction `navHeader()` pour l'en-tête/navigation, constante `footerBlock` pour le pied de page.

---

## 🚫 Limites (démo front-end)

- Pas de backend ni de base de données — tout est en mémoire/JS
- Connexion/Inscription : interface uniquement, non fonctionnelle
- Paiement : le bouton « Passer la commande » n'est pas relié à un prestataire de paiement
- Images produits chargées depuis Unsplash (nécessite une connexion internet)

---

## 🔧 Navigateurs supportés

Chrome, Firefox, Safari, Edge — versions récentes.

---

**Bon développement ! 🚀**
