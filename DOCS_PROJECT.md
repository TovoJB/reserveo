# Architecture du Projet Reserveo

Ce document détaille l'arborescence et l'utilité des différents composants du projet Reserveo, basé sur une architecture **Clean Architecture** (pour le backend) et un monorepo contenant le client admin, l'application mobile et le serveur.

## 📂 Structure Globale

```text
reserveo/
├── admin/            # Client web admin (Vite + React) - Version simplifiée
├── adminClient/      # Client web admin principal (Next.js + Tailwind)
├── backend/          # Serveur API (Fastify + Prisma + PostgreSQL)
├── mobile/           # Application Mobile (Expo / React Native)
└── README.md         # Documentation générale d'installation
```

---

## 🏗️ Backend (Clean Architecture)

Le backend est structuré pour séparer la logique métier des détails d'implémentation (Base de données, API, Framework).

### `backend/src/domain/` (Cœur Métier)
Contient les règles métier essentielles qui ne dépendent d'aucun framework.
- `entities/` : Modèles de données purs (interfaces TypeScript).
- `services/` : Logique métier complexe inter-domaines (ex: `ConflictResolutionService`, `ExcalidrawSerializerService`).

### `backend/src/application/` (Cas d'Utilisation)
Orchestre le flux de données vers et depuis les entités.
- `use-cases/` : Implémentation des actions spécifiques (ex: `CreateReservation`, `SaveSpacePlan`).
- `dtos/` : Schémas de validation (Zod) pour les entrées/sorties de l'API.

### `backend/src/infrastructure/` (Implémentation)
Contient les outils externes et les adaptateurs.
- `repositories/` : Implémentation de l'accès aux données avec Prisma.
- `prisma/` : Schéma de base de données et hooks de synchronisation (PostgreSQL).
- `firebase/` : Intégration Firestore et Storage pour la synchronisation temps réel.
- `di.ts` : Configuration de l'Injection de Dépendances (Awilix).

### `backend/src/web/` (Point d'entrée API)
Couche de présentation REST.
- `routes/` : Définition des endpoints API.
- `plugins/` : Extensions Fastify (Swagger, Auth, Schemas).
- `middleware/` : Traitements pré-requête (Extraction du contexte utilisateur).
- `server.ts` : Point d'entrée de l'application (Démarrage du serveur).

---

## 💻 Admin Client (Next.js)

`adminClient/` est le tableau de bord principal pour les gestionnaires d'espaces.
- `app/` : Pages de l'application utilisant le App Router de Next.js (Dashboard, Plan de salle, Réservations).
- `components/` : Composants React réutilisables, incluant les graphiques (`revenue-flow-chart.tsx`) et les modaux.
- `store/` : Gestion de l'état global avec Zustand.
- `hooks/` : Hooks personnalisés (ex: `useWorkgroups`).
- `public/data/` : Contient les fichiers Excalidraw (`.excalidraw`) servant de templates pour les plans de salle.

---

## 📱 Mobile (Expo)

`mobile/` est l'application client/staff développée avec React Native et Expo.
- `app/` : Structure de navigation (Auth, Tabs, Profile).
- `components/` : Composants natifs, notamment `InteractiveImageFloorPlan.tsx` pour l'affichage du plan de salle interactif.
- `hooks/` : Logique de récupération de données (Products, Cart, Orders).
- `lib/api.ts` : Configuration d'Axios pour la communication avec le backend (Port 3001).
- `types/` : Définitions TypeScript partagées pour les entités mobiles.
- `scripts/` : Utilitaires comme `parse_floorplan.js` pour traiter les données Excalidraw.

---

## 🧪 Tests

- `backend/tests/unit/` : Tests de logique métier pure (Use Cases, Services).
- `backend/tests/api/` : Tests fonctionnels des endpoints (Integration/Functional).
- `backend/prisma/prisma-test-environment.ts` : Configuration de l'environnement de base de données isolé pour les tests.

---

## 📄 Fichiers de Configuration Clés

- `backend/.env` : Variables d'environnement (Port: 3001, URLs DB, Secrets Firebase).
- `backend/prisma/schema.prisma` : Définition de la structure de la base de données PostgreSQL.
- `backend/src/infrastructure/di.ts` : Cerveau de l'application où toutes les dépendances sont injectées.
- `backend/Dockerfile` : Configuration pour la conteneurisation (Expose 3001).
