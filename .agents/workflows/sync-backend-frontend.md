---
description: Synchronisation des entités et API entre le Backend et le Frontend (adminClient)
---

Ce workflow guide la mise à jour du backend pour s'aligner sur les besoins et la structure des données du frontend (`adminClient`).

### 1. Analyse de l'Entité Frontend
- Examiner le fichier de type dans `adminClient/types/[entity].ts`.
- Identifier les champs manquants ou différents dans le backend.
- Noter les DTOs (`CreateEntityDTO`, `UpdateEntityDTO`).

### 2. Mise à jour de la Base de Données
- Modifier `backend/prisma/schema.prisma` pour refléter les nouveaux champs ou relations.
- Exécuter la migration :
```bash
npx prisma migrate dev --name sync_[entity]_with_frontend
```

### 3. Alignement de la Couche Domaine (Backend)
- Mettre à jour `backend/src/domain/entities/[entity].ts` avec les nouvelles interfaces TypeScript (souvent identiques à celles du frontend).
- Mettre à jour `backend/src/domain/entities/index.ts` si c'est une nouvelle entité.

### 4. Alignement de la Couche Application (Backend)
- Mettre à jour ou créer les DTOs Zod dans `backend/src/application/dtos/[entity].dto.ts`.
- Mettre à jour les Use Cases dans `backend/src/application/use-cases/[entity]/` pour gérer les nouveaux champs.
- Vérifier les types de retour des Use Cases.

### 5. Alignement de la Couche Web (Backend)
- Mettre à jour les routes dans `backend/src/web/routes/[entity].routes.ts`.
- Vérifier la documentation Swagger dans les schémas Zod.
- S'assurer que le contrôleur passe correctement les données au Use Case.

### 6. Synchronisation des Hooks Frontend
- Mettre à jour les hooks React Query dans `adminClient/hooks/use-[entity].ts`.
- Vérifier que les paramètres de requête et les types de réponse correspondent au backend mis à jour.

### 7. Validation
- Relancer les tests unitaires du backend : `npm test` dans le dossier backend.
- Vérifier l'interface adminClient pour s'assurer que les données s'affichent correctement.
