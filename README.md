# Sao Tech Market — Monorepo

> **Plateforme SaaS e-commerce multi-vendeurs** conçue en TypeScript strict, démarrant en République Démocratique du Congo (RDC) et destinée à l'échelle panafricaine.

---

## 🏗️ Architecture & Structure du Dépôt

Dépôt unique géré avec **pnpm workspaces** :

```text
saotechmarket/
├── apps/
│   ├── api/                     # Backend Fastify, Zod, Pino, Helmet, CORS, Rate Limit
│   └── web/                     # Frontend Next.js 15 (App Router), React 19, Tailwind
├── packages/
│   └── shared/                  # Schémas Zod et types TypeScript partagés
├── legacy/                      # Référence en lecture seule de l'ancien site PHP/JS
├── design-reference/            # Captures d'écran de référence (390px et 1440px)
├── docs/
│   └── parite-fonctionnelle.md  # Inventaire exhaustif et plan de migration
├── .github/
│   └── workflows/ci.yml         # CI automatisée (install, lint, typecheck, tests)
├── docker-compose.yml           # Base de données MySQL 8.4 pour développement
├── pnpm-workspace.yaml          # Configuration de l'espace de travail pnpm
├── tsconfig.base.json           # Configuration TypeScript stricte commune
└── README.md                    # Ce guide
```

---

## ⚙️ Prérequis

- **Node.js** : `v22.x` (LTS) — voir `.nvmrc`
- **pnpm** : `v9.x` ou supérieur (`corepack enable` ou `npm install -g pnpm@9`)
- **Base de données** : MySQL 8.x (via Docker Compose ou installation locale native)

---

## 🚀 Installation & Démarrage

### 1. Installation des dépendances

```bash
pnpm install
```

### 2. Configuration des variables d'environnement

Copiez les fichiers d'exemple et renseignez les valeurs de développement :

```bash
# Pour l'API
cp apps/api/.env.example apps/api/.env

# Pour le Web
cp apps/web/.env.example apps/web/.env
```

### 3. Démarrage de la base de données MySQL

#### Option A — Via Docker (recommandé si disponible) :
```bash
docker compose up -d
```

#### Option B — Via MySQL local :
1. Installez MySQL Server 8.x sur votre machine.
2. Créez la base de données et l'utilisateur :
   ```sql
   CREATE DATABASE saotech_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'saotech_user'@'localhost' IDENTIFIED BY 'saotech_password';
   GRANT ALL PRIVILEGES ON saotech_market.* TO 'saotech_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Ajustez `DATABASE_URL` dans `apps/api/.env`.

### 4. Lancement en mode développement

```bash
pnpm dev
```

- **Site Web** : [http://localhost:3000](http://localhost:3000)
- **API Fastify** : [http://localhost:4000](http://localhost:4000)
- **Vérification d'état** : [http://localhost:4000/health](http://localhost:4000/health)

---

## 🛠️ Commandes Disponibles

| Commande | Description |
| :--- | :--- |
| `pnpm dev` | Démarre l'API et le Web en parallèle |
| `pnpm build` | Compile `shared`, `api` et `web` |
| `pnpm lint` | Vérifie le respect des règles de style (ESLint) |
| `pnpm typecheck` | Contrôle strict des types TypeScript sur tous les paquets |
| `pnpm test` | Exécute la suite de tests automatisés |
| `pnpm format` | Formate le code avec Prettier |

---

## 🔒 Principes d'Ingénierie & Sécurité

- **TypeScript strict** : `noUncheckedIndexedAccess: true` activé sur tout le projet.
- **Validation Zod** : Toutes les variables d'environnement et entrées d'API sont validées à l'exécution.
- **Journalisation sécurisée** : Pino masque automatiquement mots de passe, jetons, cookies et autorisations.
- **Gestion d'erreurs unifiée** : Toutes les erreurs d'API répondent au format `{ error: { code, message } }`.
- **Fidélité au design** : Les composants d'`apps/web` reprennent scrupuleusement la charte et le rendu visuel de `legacy/`.

