# Compte-Rendu Flash

Application web de gestion des Comptes-Rendus Flash. Permet aux managers de creer, visualiser, sauvegarder en brouillon, soumettre et modifier leurs comptes-rendus.

## Stack technique

- **Frontend** : React + TypeScript + Vite + TailwindCSS + Tiptap (editeur riche)
- **Backend** : Express.js + TypeScript
- **Base de donnees** : SQLite + Drizzle ORM
- **Export** : xlsx (Excel) + jsPDF/html2canvas (PDF)

## Installation

```bash
# Installer toutes les dependances (racine + client + server)
npm run install:all

# Initialiser la base de donnees
npm run db:migrate

# Peupler la base avec les donnees de test
npm run db:seed
```

## Lancement

```bash
# Lancer le serveur backend et le client frontend en parallele
npm run dev
```

- Frontend : http://localhost:5173
- Backend API : http://localhost:3001

## Comptes de test

| Role    | Email                      | Mot de passe |
| ------- | -------------------------- | ------------ |
| Admin   | admin@crflash.fr           | admin123     |
| Manager | marie.dupont@crflash.fr    | manager123   |
| Manager | jean.martin@crflash.fr     | manager123   |

## Structure du projet

```
/project-root
├── /client               # Frontend React
│   ├── /src
│   │   ├── /components   # Composants reutilisables
│   │   ├── /pages        # Pages de l'application
│   │   ├── /hooks        # Hooks React personnalises
│   │   ├── /services     # Appels API
│   │   ├── /types        # Types TypeScript
│   │   └── App.tsx       # Composant racine + routing
│   └── ...
├── /server               # Backend Express.js
│   ├── /src
│   │   ├── /db           # Schema Drizzle, migrations, seed
│   │   ├── /routes       # Routes API
│   │   ├── /services     # Logique metier
│   │   ├── /middleware    # Authentification JWT
│   │   └── server.ts     # Point d'entree
│   └── ...
└── package.json          # Scripts racine
```

## Fonctionnalites

- Authentification JWT (login/logout)
- Tableau de bord avec liste des CR (admin voit tout, manager voit les siens)
- Creation et edition de CR avec editeurs de texte riche (Tiptap)
- Sauvegarde automatique en brouillon toutes les 30 secondes
- Previsualisation du CR avant soumission
- Modification des CR soumis avec historique des changements
- Export Excel et PDF des CR soumis
- Panneau d'administration pour gerer les GT/Commissions et Managers
