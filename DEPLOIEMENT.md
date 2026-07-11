# 🚀 Mettre le site en ligne sur Hostinger (guide pas-à-pas)

Ce guide t'explique, étape par étape, comment installer le nouveau backend (espace vendeur) sur ton hébergement Hostinger. Aucune connaissance technique n'est requise : suis simplement les étapes dans l'ordre.

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

> 🔄 **Site déjà en ligne ?** Si tu as déjà fait cette étape avant l'ajout des rayons (Gadgets Électroniques / Matériaux de Construction / Vêtements et Chaussures / Imprimantes), tu n'as pas besoin de tout refaire : importe simplement le fichier `backend/migration_add_department.sql` dans phpMyAdmin en suivant exactement les mêmes clics que ci-dessous (onglet "Importer"), puis renvoie les fichiers du site mis à jour (étape 4).
>
> 🔄 **De même**, si ton site était déjà en ligne avant l'ajout des comptes clients ("Mon compte" et le suivi de commandes), importe aussi le fichier `backend/migration_add_customer_accounts.sql` de la même façon.


1. Toujours dans hPanel → **« Bases de données »** → clique sur **« phpMyAdmin »** (souvent un bouton à côté de ta base).
2. Une fois dans phpMyAdmin, clique sur ta base de données **dans la colonne de gauche** pour la sélectionner.
3. En haut, clique sur l'onglet **« Importer »**.
4. Clique sur **« Choisir un fichier »** et sélectionne le fichier `backend/schema.sql` (fourni dans le dossier du site).
5. Clique sur **« Exécuter »** (en bas de la page).
6. Tu dois voir un message de succès, et deux nouvelles tables doivent apparaître à gauche : `sellers` et `seller_products`.

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
3. Si un ancien site s'y trouve déjà, sauvegarde ou supprime son contenu.
4. Compresse tout le contenu du dossier **« Sao Tech Market »** (celui qui contient `index.html`, `css/`, `js/`, `backend/`…) en un fichier `.zip` sur ton ordinateur.
5. Dans le Gestionnaire de fichiers, clique sur **« Importer »** (ou "Upload") et envoie ce fichier `.zip` dans `public_html`.
6. Une fois envoyé, clic droit sur le `.zip` → **« Extraire »**.
7. Vérifie que `index.html` se trouve bien directement dans `public_html` (et pas dans un sous-dossier `public_html/Sao Tech Market/`) — si besoin, déplace tout son contenu d'un niveau au-dessus.

---

## Étape 5 — Vérifier le HTTPS (cadenas 🔒)

1. Dans hPanel → **« Sécurité »** → **« SSL »**, vérifie que le certificat SSL gratuit est actif pour ton domaine (Hostinger l'active généralement tout seul en quelques minutes après la création du site).
2. C'est important : ça chiffre les mots de passe de tes vendeurs quand ils s'inscrivent ou se connectent.

---

## Étape 6 — Tester !

1. Ouvre ton site dans le navigateur (ton sous-domaine ou domaine Hostinger).
2. Clique sur **« Vendeur »** → **« Créer ma boutique »**, remplis le formulaire et valide.
3. Si tout fonctionne, tu arrives sur ton tableau de bord vendeur. 🎉
4. Va vérifier dans **phpMyAdmin** (étape 2) → table `sellers` → tu dois voir ta nouvelle boutique apparaître comme une ligne dans le tableau.
5. Ajoute un produit test depuis le tableau de bord, puis va sur la page **Collection** du site : il doit apparaître avec le badge **« VENDEUR »**.

---

## 🛠️ En cas de problème

| Problème | Cause probable | Solution |
|---|---|---|
| Page blanche ou « Erreur 500 » après inscription | Mauvais identifiants dans `backend/config.php` | Revérifie les 3 valeurs (étape 3) |
| « Connexion à la base de données impossible » | La base ou l'utilisateur n'existe pas / mauvais mot de passe | Recrée les identifiants dans hPanel et remets-les dans `config.php` |
| Le bouton « Créer ma boutique » ne fait rien | Le dossier `backend/` n'a pas été envoyé, ou mal placé | Vérifie que `public_html/backend/api/register.php` existe bien via le Gestionnaire de fichiers |
| Les produits/vendeurs n'apparaissent pas après rafraîchissement | Les tables n'ont pas été créées | Refais l'étape 2 (import de `schema.sql`) |

Pour voir le détail d'une erreur technique : hPanel → **« Avancé »** → **« Journaux d'erreurs PHP »** (« PHP Error Logs ») te montrera le message exact.

---

## Ce que fait ce backend, en résumé

- Un dossier `backend/` avec des petits fichiers PHP (un par action : inscription, connexion, ajout de produit…) qui parlent à ta base MySQL.
- Les mots de passe des vendeurs sont **chiffrés** (jamais stockés en clair).
- Chaque vendeur ne peut modifier ou supprimer **que ses propres produits** (vérifié côté serveur, pas seulement côté site).
- Le reste du site (catalogue officiel, panier, pages d'info) continue de fonctionner exactement comme avant — seule la partie « espace vendeur » utilise maintenant ce backend.
