# 🚀 Mettre le site en ligne sur Hostinger (guide pas-à-pas)

Ce guide t'explique, étape par étape, comment installer le site (catalogue, espace vendeur, comptes clients) sur ton hébergement Hostinger. Aucune connaissance technique n'est requise : suis simplement les étapes dans l'ordre.

Tu auras besoin d'environ **20 minutes**.

---

## Étape 1 — Créer la base de données MySQL

1. Connecte-toi à **hPanel** (le panneau de gestion Hostinger).
2. Dans le menu, cherche **« Bases de données »** → **« Bases de données MySQL »**.
3. Clique sur **« Créer une nouvelle base de données »**.
4. Choisis un nom, par exemple `saotech` (Hostinger va l'afficher avec un préfixe du type `u123456789_saotech`).
5. Crée un utilisateur MySQL (ou utilise celui proposé automatiquement) et choisis un **mot de passe fort**.
6. Une fois créée, **note bien ces 3 informations** quelque part (tu en auras besoin à l'étape 3) :
   - Nom de la base (ex. `u123456789_saotech`)
   - Nom d'utilisateur (ex. `u123456789_saotech`)
   - Mot de passe

---

## Étape 2 — Créer les tables (importer schema.sql)

1. Toujours dans hPanel → **« Bases de données »** → clique sur **« phpMyAdmin »** (souvent un bouton à côté de ta base).
2. Une fois dans phpMyAdmin, clique sur ta base de données **dans la colonne de gauche** pour la sélectionner.
3. En haut, clique sur l'onglet **« Importer »**.
4. Clique sur **« Choisir un fichier »** et sélectionne le fichier `backend/schema.sql` (fourni dans le dossier du site).
5. Clique sur **« Exécuter »** (en bas de la page).
6. Tu dois voir un message de succès, et **4 nouvelles tables** doivent apparaître à gauche : `sellers`, `seller_products`, `customers` et `orders`.

> C'est le seul fichier SQL à importer pour une première mise en ligne. (Les fichiers `migration_*.sql` présents dans `backend/` ne servent que si le site était déjà en ligne *avant* une mise à jour — pas ton cas ici, tu peux les ignorer pour l'instant.)

---

## Étape 3 — Indiquer tes identifiants au site

1. Ouvre le fichier `backend/config.php` (avec un éditeur de texte, ou directement dans le **Gestionnaire de fichiers** de Hostinger, qui a un bouton "Éditer" pour les fichiers texte/code).
2. Remplace les 3 valeurs par celles notées à l'étape 1 :

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_saotech');   // ← ton nom de base
define('DB_USER', 'u123456789_saotech');   // ← ton utilisateur MySQL
define('DB_PASS', 'ton_mot_de_passe_ici'); // ← ton mot de passe
```

3. Enregistre le fichier.

> `DB_HOST` reste presque toujours `localhost` sur Hostinger. Si jamais ça ne fonctionne pas à l'étape 6, hPanel affiche l'adresse exacte du serveur MySQL dans les informations de ta base de données.

---

## Étape 4 — Envoyer le site sur Hostinger

1. Dans hPanel, va dans **« Fichiers »** → **« Gestionnaire de fichiers »**.
2. Ouvre le dossier **`public_html`** (c'est la racine de ton site).
3. S'il y a déjà quelque chose dedans, sauvegarde ou supprime son contenu.
4. Compresse tout le contenu du dossier **« Sao Tech Market »** (celui qui contient `index.html`, `css/`, `js/`, `backend/`…) en un fichier `.zip` sur ton ordinateur.
5. Dans le Gestionnaire de fichiers, clique sur **« Importer »** (ou "Upload") et envoie ce fichier `.zip` dans `public_html`.
6. Une fois envoyé, clic droit sur le `.zip` → **« Extraire »**.
7. Vérifie que `index.html` se trouve bien directement dans `public_html` (et pas dans un sous-dossier `public_html/Sao Tech Market/`) — si besoin, déplace tout son contenu d'un niveau au-dessus.

---

## Étape 5 — Vérifier le HTTPS (cadenas 🔒)

1. Dans hPanel → **« Sécurité »** → **« SSL »**, vérifie que le certificat SSL gratuit est actif pour ton domaine (Hostinger l'active généralement tout seul en quelques minutes après la création du site).
2. C'est important : ça chiffre les mots de passe de tes vendeurs et de tes clients quand ils s'inscrivent ou se connectent.

---

## Étape 6 — Tester !

Une fois le site ouvert dans le navigateur (ton sous-domaine ou domaine Hostinger), vérifie ces 3 parcours dans l'ordre :

**A) Le catalogue**
- Survole **« Nos produits »** dans le menu : le méga-menu à 4 colonnes doit s'afficher (Gadgets Électroniques, Matériaux de Construction, Vêtements et Chaussures, Imprimantes).
- Clique sur une catégorie précise (ex. « Chaussures ») : la page doit se filtrer correctement.

**B) L'espace vendeur**
1. Clique sur **« Vendeur »** → **« Créer ma boutique »**, remplis le formulaire et valide.
2. Tu dois arriver sur ton tableau de bord vendeur. 🎉
3. Ajoute un produit test en choisissant un rayon (ex. « Vêtements et Chaussures ») → va sur **« Nos produits »** → il doit apparaître dans ce rayon avec le badge **« VENDEUR »**.
4. Vérifie dans **phpMyAdmin** → table `sellers` → ta boutique doit apparaître comme une ligne.

**C) Le compte client**
1. Clique sur **« Compte »** dans l'en-tête → onglet **« Inscription »**, crée un compte test.
2. Ajoute un produit au panier, clique **« Passer la commande »**, remplis l'adresse de livraison et confirme.
3. Va dans **« Mon compte »** : la commande doit apparaître dans l'historique avec son numéro (ex. `CMD-...`).
4. Vérifie dans **phpMyAdmin** → tables `customers` et `orders` → tu dois voir les nouvelles lignes.

---

## ⭐ Activer ta « Boutique officielle » (optionnel)

Si tu veux ajouter tes propres produits sans passer par moi ni éditer le code, utilise ton propre compte vendeur — mais marqué comme « officiel » pour que ses produits affichent un badge **« OFFICIEL »** (au lieu de « VENDEUR ») et n'affichent pas de ligne « Vendu par » sur la fiche produit.

1. Crée d'abord un compte vendeur normalement sur le site (bouton **« Vendeur »** → **« Créer ma boutique »**), avec l'e-mail que tu veux utiliser toi-même.
2. Va dans **phpMyAdmin** → ta base de données → onglet **« SQL »**.
3. Colle cette commande, en remplaçant l'e-mail par celui que tu viens d'utiliser, puis clique **« Exécuter »** :

```sql
UPDATE sellers SET is_official = 1 WHERE email = 'ton-email@exemple.cd';
```

4. Déconnecte-toi et reconnecte-toi à ton espace vendeur sur le site : le tableau de bord affiche désormais **« BOUTIQUE OFFICIELLE »**, et tous les produits que tu ajoutes depuis ce compte porteront le badge officiel.

> Tu peux avoir autant de comptes « officiels » que tu veux (par exemple un par membre de ton équipe) — répète juste l'étape 3 avec chaque e-mail concerné.

---

## 🛠️ En cas de problème

| Problème | Cause probable | Solution |
|---|---|---|
| Page blanche ou « Erreur 500 » après inscription | Mauvais identifiants dans `backend/config.php` | Revérifie les 3 valeurs (étape 3) |
| « Connexion à la base de données impossible » | La base ou l'utilisateur n'existe pas / mauvais mot de passe | Recrée les identifiants dans hPanel et remets-les dans `config.php` |
| Le bouton « Créer ma boutique » ou « S'inscrire » ne fait rien | Le dossier `backend/` n'a pas été envoyé, ou mal placé | Vérifie que `public_html/backend/api/register.php` existe bien via le Gestionnaire de fichiers |
| Les produits/vendeurs n'apparaissent pas après rafraîchissement | Les tables n'ont pas été créées | Refais l'étape 2 (import de `schema.sql`) |
| « Vous devez être connecté(e) » alors qu'on vient de se connecter | Le HTTPS n'est pas encore actif (étape 5) et le cookie de session est bloqué | Attends l'activation du SSL puis réessaie |

Pour voir le détail d'une erreur technique : hPanel → **« Avancé »** → **« Journaux d'erreurs PHP »** (« PHP Error Logs ») te montrera le message exact.

---

## Ce que fait ce backend, en résumé

- Un dossier `backend/` avec des petits fichiers PHP (un par action : inscription, connexion, ajout de produit, passage de commande…) qui parlent à ta base MySQL.
- **4 tables** : `sellers` (comptes vendeurs), `seller_products` (leurs produits, avec le rayon choisi), `customers` (comptes clients), `orders` (commandes passées).
- Les mots de passe (vendeurs et clients) sont **chiffrés** (jamais stockés en clair).
- Chaque vendeur ne peut modifier ou supprimer **que ses propres produits** (vérifié côté serveur, pas seulement côté site).
- Chaque client ne peut voir **que ses propres commandes**.
- Le reste du site (catalogue officiel, panier, pages d'info) continue de fonctionner exactement comme avant — les espaces « vendeur » et « compte client » utilisent ce backend, le reste est indépendant.

---

## 🔄 Pour une future mise à jour du site

Si tu me demandes d'autres modifications plus tard et que je touche à nouveau la base de données, je te fournirai un nouveau fichier `migration_*.sql` à importer (mêmes clics qu'à l'étape 2, onglet "Importer") — pas besoin de tout réinstaller à chaque fois.

> ⚠️ **Très important, maintenant que ton site est en ligne** : ne remplace **jamais** ton fichier `backend/config.php` déjà en place par celui d'un nouveau zip que je te donne — le tien contient tes vrais identifiants de base de données, celui du zip contient des valeurs à remplacer. Envoie uniquement les fichiers qui ont changé (je te le préciserai), ou envoie tout le zip **sauf** `backend/config.php`.

---

## 📬 Mise à jour : notifications de commande + upload de photos + correctif catalogue

Cette mise à jour ajoute 3 choses, sans nouvelle table à importer :

**1. Notifications par e-mail à chaque commande**
- Ton équipe reçoit un e-mail récapitulatif à **chaque nouvelle commande** (tous les articles, quel que soit le vendeur).
- Si la commande contient un ou plusieurs produits d'un vendeur tiers, ce vendeur reçoit aussi un e-mail, mais uniquement avec **ses propres articles** de la commande.
- Pour que ça parte à la bonne adresse, ajoute cette ligne dans ton `backend/config.php` déjà en ligne (à la suite des `define(...)` existants) :
```php
define('ADMIN_NOTIFICATION_EMAIL', 'ton-adresse@saotechmarket.com');
```
- Si tu ne l'ajoutes pas, une adresse par défaut est utilisée (`contact@saotechmarket.com`) — ça ne casse rien, mais autant mettre la bonne adresse tout de suite.
- ℹ️ Ces e-mails partent via la fonction `mail()` de PHP, standard sur l'hébergement Hostinger. Si jamais un e-mail n'arrive pas (dossier spam, configuration de ton hébergement), dis-le-moi : on pourra passer à un envoi plus fiable (SMTP) si besoin.

**2. Les vendeurs peuvent envoyer une photo depuis leur téléphone/ordinateur**
- Dans le formulaire "Ajouter un produit", chaque champ photo propose maintenant un bouton pour choisir un fichier, en plus de coller un lien.
- Nouveau dossier `uploads/products/` à envoyer avec les fichiers du site (il stocke les photos envoyées). Assure-toi qu'il est bien présent dans `public_html/uploads/products/` après l'envoi.
- Limite : 5 Mo par photo (JPG, PNG, WEBP ou GIF).

**3. Correctif : "Tous nos produits" sur l'accueil**
- Cette section n'affichait que le rayon "Gadgets Électroniques" à cause d'un double bug d'affichage (les nouveaux produits ne devaient volontairement plus alourdir la liste, et les 12 premiers produits du catalogue étaient tous en électronique). C'est corrigé : chaque rayon affiche maintenant bien ses propres produits.

**Fichiers à renvoyer** : tout le dossier du site **sauf** `backend/config.php` (voir l'avertissement ci-dessus).

---

## 💬 Mise à jour : notifications fiables + messagerie client ↔ vendeur

**Nouvelles tables à importer** : `backend/migration_add_notifications_and_chat.sql` (mêmes clics que d'habitude dans phpMyAdmin → Importer).

**1. Notification fiable dans le tableau de bord (en plus de l'e-mail)**
- Les e-mails automatiques (`mail()` PHP) arrivent parfois en spam ou pas du tout selon les hébergeurs — désormais, chaque vendeur voit **aussi** une cloche 🔔 avec un badge dans son tableau de bord dès qu'un de ses produits est commandé. Beaucoup plus fiable.

**2. Messagerie directe entre client et vendeur**
- Sur la fiche d'un produit vendeur, le client voit un bouton **« Poser une question au vendeur »**.
- Les deux peuvent ensuite discuter : le client depuis **Mon compte**, le vendeur depuis le bouton **Messages** de son tableau de bord.

**⚠️ Rappel important sur le bug du point "Tous nos produits"** : ce problème a déjà été corrigé dans la mise à jour précédente (voir section ci-dessus). Si tu le vois encore sur ton site en ligne, c'est presque certainement que les fichiers `js/main.js` et `js/pages.js` les plus récents n'ont pas encore été renvoyés sur Hostinger, ou que ton navigateur affiche une version mise en cache. J'ai ajouté un numéro de version (`?v=6`) à tous les fichiers du site pour forcer les navigateurs à recharger la dernière version — renvoie bien **tout le dossier** (sauf `config.php`) pour que ça prenne effet, puis fais un rechargement forcé de la page (Ctrl+Maj+R ou Cmd+Maj+R).

**Fichiers à renvoyer** : tout le dossier du site **sauf** `backend/config.php`.

---
