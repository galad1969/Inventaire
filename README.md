# 📦 Inventaire Privé (Offline-First) — Manuel d'Utilisation

> Application personnelle de gestion d'inventaire, de factures et d'objets de valeur, conçue selon les standards **Apple Design**, **100% Locale (Local-First)** et compatible **PWA Hors-Ligne**.

---

## 🌟 Points Clés & Philosophie

1. **Confidentialité Totale (0% Cloud)** : Vos données et photos sont stockées exclusivement dans l'**IndexedDB** de votre navigateur. Aucun compte requis, aucun pistage.
2. **PWA Réelle & Hors-ligne** : Grâce au Service Worker Workbox et au Manifest web, l'application fonctionne sans aucune connexion Internet.
3. **Poupées Russes (Localisation 4 Niveaux)** : `Résidence → Pièce → Meuble → Sous-emplacement / Tiroir`.
4. **Illustration par Défaut** : Vous pouvez désigner une photo spécifique comme miniature de référence pour chaque objet.
5. **Ventes & Générateur d'Annonces** : Génération en un clic d'annonces formatées pour *Le Bon Coin*, *Vinted*, *eBay*, etc.
6. **Rapport Assurance Certifié** : Édition d'un rapport PDF prêt à imprimer pour votre assureur avec sous-totaux par pièce et emplacement pour signature.
7. **Sauvegardes Universelles** : Export / import complet en **JSON** et export tabulaire **CSV (Excel & Google Sheets)**.
8. **Dark Mode Apple** : Interface adaptative respectant les couleurs et contrastes de macOS et iOS.

---

## 🚀 Installation PWA (Mode Application Native)

### Sur iPhone et iPad (Safari iOS)
1. Ouvrez l'application dans Safari.
2. Touchez le bouton **Partager** (carré avec une flèche vers le haut).
3. Choisissez **« Sur l'écran d'accueil »**.
4. L'application se lancera en plein écran sans barre d'URL.

### Sur Mac, Windows, Chrome & Android
1. Cliquez sur le bouton **« Installer l'application »** présent dans la barre supérieure ou la barre latérale.
2. Ou cliquez sur l'icône d'installation dans la barre d'adresse de Google Chrome.
3. Confirmez l'installation.

---

## 📖 Guide des Fonctionnalités

### 1. Ajouter un objet & Sélectionner la Photo par Défaut
- Cliquez sur **« Nouvel objet »** dans la barre de navigation.
- Dans l'onglet **« 1. Informations »**, renseignez le nom, la catégorie, l'état (Neuf, Très bon état...), la marque, le modèle et le numéro de série constructeur (S/N).
- Dans l'onglet **« 4. Médias »** :
  - Utilisez l'encadré supérieur **« Photo d'illustration principale »** pour téléverser votre photo de couverture.
  - Vous pouvez également cliquer sur le bouton **« Par défaut » (étoile dorée)** sur n'importe quelle photo téléversée pour la promouvoir comme illustration principale.
  - Ajoutez vos factures d'achat en format image ou **PDF**.

### 2. Le Système d'Emplacement en Poupées Russes
Dans l'onglet **« 2. Emplacement »**, définissez l'arborescence :
- **Niveau 1** : Résidence (ex: *Résidence Principale*, *Maison de campagne*)
- **Niveau 2** : Pièce (ex: *Bureau*, *Salon*, *Atelier*)
- **Niveau 3** : Meuble (ex: *Bureau d'angle*, *Armoire vitrée*)
- **Niveau 4** : Sous-emplacement (ex: *Tiroir du haut*, *Carton #2*)

### 3. Emballages & Boîtes d'origine Déportés
Dans l'onglet **« 5. Boîtes & Accessoires »** :
- Liez la boîte d'origine ou les câbles à l'objet.
- Si la boîte est stockée ailleurs (ex: *Grenier → Rayonnage A → Carton #4*), activez **« Localisé ailleurs »** pour conserver sa trace exacte sans encombrer la pièce de vie.

### 4. Vente d'Objets & Générateur d'Annonces
- Basculez le statut de l'objet sur **« 🏷️ En Vente »** et fixez votre prix espéré.
- Dans la page **« En vente »**, cliquez sur **« Générer l'annonce »**.
- Choisissez la plateforme cible (*Le Bon Coin, Vinted, eBay, Facebook Marketplace*).
- Cliquez sur **« Copier l'annonce »** et collez-la directement sur le site marchand.
- Lorsque l'objet est vendu, cliquez sur **« Vendu »** pour enregistrer la vente dans l'historique financier.

### 5. Rapport d'Assurance & Suivi de Garanties
- Cliquez sur **« Rapport Assurance »** pour générer l'état estimatif et descriptif de tous vos biens meubles et électroniques.
- Utilisez **« Imprimer / Sauvegarder PDF »** pour enregistrer le document ou l'envoyer à votre assureur en cas de sinistre.
- Dans **« Sous garantie »**, suivez vos alertes pour les objets dont la garantie expire sous 60 jours.

### 6. Sauvegardes & Exports
- Rendez-vous sur la page **« Sauvegardes »** :
  - **Export JSON** : Télécharge une sauvegarde complète comprenant objets, relations, photos et factures.
  - **Export CSV** : Exporte un fichier tableur lisible directement dans Excel et Google Sheets avec délimiteur configurable (`;` ou `,`) et encodage UTF-8 avec BOM.
  - **Restauration** : Importez votre fichier JSON pour restaurer instantanément votre inventaire sur un autre ordinateur ou smartphone.

---

## ⌨️ Raccourcis Clavier
- `⌘ + K` ou `Ctrl + K` : Ouvrir la barre de recherche globale (Omnibar).
- `Échap / Esc` : Fermer la modale ou le volet latéral en cours.
