# PrixncAI

## Description
PrixncAI est une application permettant aux utilisateurs de rechercher des produits et d'obtenir leurs prix ainsi que leur localisation dans les magasins de Nouvelle-Calédonie.L'application effectue du web scraping sur le site (https://prix.nc) pour récupérer ces informations et intègre un agent ia pour l'optimisation du trajet et pour le meilleurs rapport couts/trajet.

## Fonctionnalités
- Recherche de produits par **texte** (prompt a un agent ia) via **image** (liste de course) ou manuellement (par recherche de mots clés) .
- Récupération des **prix** et des **magasins** où les produits sont disponibles.
- Affichage des résultats sous une forme lisible et interactive.
- Intégration future d'une **application mobile**.

## Technologies utilisées
- **Web scraping** : via la lib fetch
- **Base de données** : Postgres 
- **Backend** : À définir (Node.js)
- **Frontend** : Site web en premier, puis une application mobile

## Installation et utilisation
### Prérequis
- **Postgres** pour gérer les données
- **Node.js** (selon le choix du backend)


### Installation
1. **Cloner le projet** :
   ```bash
   git clone https://github.com/karimdev731/Ia-comp.prix-nc.git
   cd PrixncAI
   ```
2. **Installer les dépendances** :
   ```bash  
   npm install
       ou
   pnpm install  
   ```
3. **Configurer l'environnement** :
   - Ajouter les informations nécessaires pour l'accès à la base de données.
   - Définir les paramètres de google api pour connexion utilisateur (implementer dans ce projet avec Nextauth).

### Exécution du projet
- **Lancer le serveur** :
   ```bash
   npm start
      ou
   pnpm start   
   ```


### Reste a implementer

- Tesseract pour la transcription image to text (pour les liste de course)
- Langchain pour gérer toute la partie ia 
- Implementation de quelques composant front pour les 2 points citer précédemment


## Évolution prévue
- Amélioration du modèle d’IA pour une reconnaissance d’image plus efficace.
- Développement d’une application mobile


## Contributeurs
- Claverie Karim (HNC)
 

Projet en développement 🚀

