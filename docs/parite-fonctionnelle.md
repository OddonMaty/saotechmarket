# Inventaire de l'Existant & Matrice de Parité Fonctionnelle

Ce document recense l'intégralité des fonctionnalités, pages, scripts JavaScript, endpoints API PHP et tables MySQL de l'ancien site (`legacy/`). Chaque élément est analysé dans son fonctionnement réel et mappé vers sa tâche de reconstruction dans la nouvelle architecture (TypeScript strict, Node.js Fastify, Next.js App Router, Prisma MySQL).

---

## 1. Pages du Site (`legacy/js/pages.js`)

| Page / Vue | Fichier d'origine | Rôle et comportement réel dans le code legacy | Tâche de reconstruction cible |
| :--- | :--- | :--- | :--- |
| **Accueil (`home`)** | `legacy/js/pages.js` (L.181) | Diaporama Hero avec ventes flash, sélecteur de rayons, grille de nouveautés & offres, bannière promo, newsletter. | **Tâche 1** (squelette/état API) & **Tâche 6** (catalogue complet) |
| **Catalogue (`collection`)** | `legacy/js/pages.js` (L.280) | Affichage en grille avec barre latérale de filtres (catégories, rayons, prix, promo, vendeurs), recherche textuelle. | **Tâche 6** (Catalogue & Recherche) |
| **Fiche Produit (`product`)** | `legacy/js/pages.js` (L.350) | Galerie photo, sélection de couleur/taille, calcul dynamique de prix en FC, bouton "Poser une question au vendeur". | **Tâche 6** (Catalogue & Page Produit) |
| **Espace Vendeur (`seller`)** | `legacy/js/pages.js` (L.440) | Page de présentation de l'opportunité vendeur, formulaire d'inscription/connexion boutique. | **Tâche 4** (Création boutique & Abonnements) |
| **Dashboard Vendeur (`seller-dashboard`)** | `legacy/js/pages.js` (L.530) | Gestionnaire CRUD de produits, téléversement de photos, centre de notifications de commandes, messagerie vendeur. | **Tâche 5** (Tableau de bord Vendeur & Produits) |
| **Mon Compte Client (`account`)** | `legacy/js/pages.js` (L.640) | Historique des commandes passées, carnet d'adresses de livraison, messagerie avec les vendeurs. | **Tâche 3** (Authentification & Profils utilisateurs) |
| **Commande (`checkout`)** | `legacy/js/pages.js` (L.750) | Choix de l'adresse de livraison, sélection du paiement (Cash / Mobile Money), enregistrement de commande. | **Phase 2** (Paiement en ligne Flexpaie & Panier — exclu de la Phase 1 selon cahier des charges) |
| **Pages d'aide & légale** (`faq`, `about`, `contact`, `shipping`, `terms`, `payments`, `csr`, `careers`, `privacy`) | `legacy/js/pages.js` (L.830+) | Contenus textuels institutionnels, agences de Bukavu et Uvira, coordonnées, FAQ avec accordéons dépliables. | **Tâche 7** (Pages institutionnelles & Support) |

---

## 2. Endpoints API PHP (`legacy/backend/api/`)

| Endpoint | Méthode | Rôle précis & tables touchées | Tâche de reconstruction cible |
| :--- | :--- | :--- | :--- |
| `register.php` | POST | Inscription d'un nouveau vendeur dans `sellers` (nom boutique, ville, mot de passe hashé). | **Tâche 4** (Création boutique / `POST /api/v1/shops`) |
| `login.php` | POST | Authentification vendeur via session PHP (`$_SESSION['seller_id']`). | **Tâche 3** (Auth unifiée JWT/Session sécurisée) |
| `logout.php` | POST | Destruction de la session vendeur. | **Tâche 3** (Auth unifiée / `POST /api/v1/auth/logout`) |
| `session.php` | GET | Renvoie les informations du vendeur connecté en session. | **Tâche 3** (Auth / `GET /api/v1/auth/me`) |
| `products.php` | GET | Liste publique des produits vendeurs avec offset d'ID (`SELLER_ID_OFFSET = 100000`). | **Tâche 6** (`GET /api/v1/products`) |
| `add-product.php` | POST | Ajout d'un produit par un vendeur connecté dans `seller_products`. | **Tâche 5** (`POST /api/v1/vendor/products`) |
| `update-product.php` | POST | Modification d'un produit vendeur existant (contrôle de propriété `seller_id`). | **Tâche 5** (`PUT /api/v1/vendor/products/:id`) |
| `delete-product.php` | POST | Suppression d'un produit vendeur (contrôle de propriété `seller_id`). | **Tâche 5** (`DELETE /api/v1/vendor/products/:id`) |
| `upload-image.php` | POST | Réception et validation binaire d'images (`getimagesize()`, whitelist MIME, max 5 Mo). | **Tâche 5** (Upload de médias produits / stockage sécurisé) |
| `seller-notifications.php` | GET | Récupère la liste des notifications de vente non lues (`seller_notifications`). | **Tâche 8** (Système de notifications vendeur) |
| `mark-notifications-read.php` | POST | Marque les notifications comme lues (`is_read = 1`). | **Tâche 8** (Notifications vendeur) |
| `customer-register.php` | POST | Inscription d'un acheteur dans `customers`. | **Tâche 3** (Auth unifiée / `POST /api/v1/auth/register`) |
| `customer-login.php` | POST | Connexion client dans `$_SESSION['customer_id']`. | **Tâche 3** (Auth unifiée / `POST /api/v1/auth/login`) |
| `customer-logout.php` | POST | Déconnexion de la session client. | **Tâche 3** (Auth unifiée) |
| `customer-session.php` | GET | Vérification de la session client courante. | **Tâche 3** (Auth / `GET /api/v1/auth/me`) |
| `customer-orders.php` | GET | Liste des commandes du client connecté (`orders`). | **Phase 2** (Gestion des commandes & historique achats) |
| `place-order.php` | POST | Création d'une commande, notification mail admin et notification vendeur. | **Phase 2** (Paiement en ligne Flexpaie & Commandes) |
| `update-order-address.php` | POST | Modification de l'adresse tant que le statut est "En attente". | **Phase 2** (Gestion des commandes) |
| `customer-addresses.php` | GET | Liste des adresses enregistrées (`customer_addresses`). | **Tâche 3** (Carnet d'adresses acheteur) |
| `add-customer-address.php` | POST | Ajout d'une adresse de livraison réutilisable. | **Tâche 3** (Carnet d'adresses acheteur) |
| `update-customer-address.php` | POST | Modification d'une adresse du carnet. | **Tâche 3** (Carnet d'adresses acheteur) |
| `delete-customer-address.php` | POST | Suppression d'une adresse du carnet. | **Tâche 3** (Carnet d'adresses acheteur) |
| `start-conversation.php` | POST | Initialise une conversation client ↔ vendeur autour d'un produit. | **Tâche 9** (Messagerie directe client ↔ vendeur) |
| `list-conversations.php` | GET | Récupère la liste des conversations de l'utilisateur connecté. | **Tâche 9** (Messagerie directe) |
| `get-messages.php` | GET | Historique des messages d'une conversation et marquage de lecture. | **Tâche 9** (Messagerie directe) |
| `send-message.php` | POST | Envoi d'un message dans une conversation active. | **Tâche 9** (Messagerie directe) |

---

## 3. Schéma de Données (`legacy/backend/schema.sql`)

| Table legacy | Données portées | Évolution dans la nouvelle architecture Prisma / MySQL | Tâche cible |
| :--- | :--- | :--- | :--- |
| `sellers` | Boutiques et vendeurs | Remplacé par `shops` lié à `users` (relation n-n ou 1-n pour les rôles employés/propriétaires). | **Tâche 2** (Schéma Prisma & Migrations) |
| `seller_products` | Produits vendeurs | Remplacé par `products` avec identifiant ULID, relation vers `shops`, catégories normalisées, prix entier en plus petite unité. | **Tâche 2** |
| `customers` | Acheteurs | Fusionné dans la table unifiée `users` avec système de rôles cumulables (`buyer`, `seller`, `moderator`, `finance`, `admin`). | **Tâche 2** |
| `orders` | Commandes | Réorganisé en `orders` et `order_items` normalisés avec statuts de paiement Flexpaie. | **Phase 2** |
| `customer_addresses` | Carnet d'adresses | Porté vers `addresses` relié à `users`. | **Tâche 2** |
| `seller_notifications` | Alertes de vente | Table `notifications` généralisée (types : vente, modération, message, système). | **Tâche 8** |
| `conversations` & `conversation_messages` | Chat client-vendeur | Tables `conversations` et `messages` avec identifiants ULID. | **Tâche 9** |
| *Nouvelle table* `subscriptions` | Aucune en legacy | Gestion des 4 offres d'abonnements modifiables en base (nom, prix, % commission). | **Tâche 2** & **Tâche 4** |
| *Nouvelle table* `audit_logs` | Aucune en legacy | Journal d'audit immuable des actions administrateurs (qui, quoi, sur quoi, avant, après, quand). | **Tâche 2** & **Tâche 10** |

---

## 4. Points d'attention & Éléments validés pour la Phase 1

1. **Phase 1 sans paiement ni panier** :
   * Conformément aux consignes du produit, la Phase 1 se concentre sur :
     - La gestion des utilisateurs et rôles (`users`).
     - Le parcours commerçant (création de boutique, choix d'abonnement parmi les 4 offres en base).
     - La publication et modération des produits (jusqu'à 5 photos par produit).
     - Le catalogue public consultable sans fonction d'achat direct ni panier.
     - Le panneau d'administration pour la validation et certification des boutiques par les deux administrateurs.
   * Les fonctionnalités liées au panier (`cart`), passage de commande immédiat (`place-order.php`) et passerelle de paiement (Flexpaie) seront intégrées en **Phase 2**.
2. **Conservation des fonctionnalités phares** :
   * La messagerie directe client ↔ vendeur, l'envoi d'images produits, le carnet d'adresses, et la notion de boutique certifiée/officielle sont toutes planifiées dans les tâches correspondantes.

