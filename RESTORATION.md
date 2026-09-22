# La Table Ronde — restauration en cours

## Architecture et configuration

Site statique HTML/CSS/JavaScript, sans framework ni compilation.
Configuration publique centralisée dans `supabase-config.js`.
Projet Supabase autorisé : `yhdafozbxydqemphdqvb`.
Ne jamais ajouter de clé secrète au site.

Le SQL de référence a été importé dans le nouveau projet initialement vide,
avec restrictions des permissions des fonctions internes, RLS sur les récompenses,
verrouillage de la jointure des salons et corrections ciblées de Blackjack.
Les anciennes données du projet Supabase historique n'ont pas été récupérées.
Ne pas réexécuter tout le setup sur une base contenant des données sans analyse :
il remplace des fonctions/policies et resynchronise les pseudos depuis Auth.

## Vérifications effectuées

- Syntaxe JavaScript : `node --check app.js`.
- Contrat statique : `node scripts/audit.cjs` (47 appels RPC, 75 fonctions SQL,
  14 tables, 27 références littérales d'assets ; ce n'est pas un test d'intégration).
- Inscription et création de profil ; confirmation d'e-mail requise.
- Connexion de deux comptes de test ; sessions conservées après actualisation
  et réouverture du navigateur ; pseudo du joueur A conservé.
- Lecture du profil, solde initial et statistiques.
- Liars Bar normal : création d'un salon, jointure du second compte,
  affichage des deux joueurs sans actualisation, lancement sur les deux clients,
  carte jouée et passage de tour synchronisé, accusation soumise.
- Pas de partie complète ni de récompense de fin de partie validée à ce stade.

## Vérifications encore nécessaires

- Fin de partie Liars Bar et persistance des récompenses, XP, badges.
- Roulette russe, Chaos, Blackjack, Who is Who et True Only de bout en bout.
- Dead 21 et Photo Roulette : code backend/frontend présent mais aucun accès
  dans le sélecteur de jeux de la version fournie ; ne pas les annoncer jouables.
- Upload, lecture et suppression Storage, refus d'accès entre utilisateurs.
- Achats et équipement boutique, roue, déconnexion/reconnexion explicite.
- URLs Auth du domaine de production, configuration et déploiement Vercel.

## Limites de sécurité à traiter

- Le bucket Photo Roulette de la version fournie est public ; connaître une URL
  peut permettre de lire une photo. Les règles d'écriture ne rendent pas la lecture privée.
- Plusieurs états et récompenses Liars Bar restent contrôlés par le client.
  La restauration des permissions ne constitue pas une protection anti-triche complète.
- Les politiques de lecture des salons sont larges pour les comptes authentifiés.

## Exploitation locale

`node scripts/serve.cjs` ouvre le serveur sur `http://127.0.0.1:4173`.
Utiliser `http://localhost:4173` pour une seconde session indépendante.
Le serveur n'est pas un service Windows et doit rester lancé pendant les tests.
Les sauvegardes, outils locaux et fichiers privés `.env` sont exclus du dépôt.

## Publication

Dépôt cible : `editbysan-web/latableronde`, branche `main`.
Ancien projet Vercel à réutiliser : `latableronde`, domaine
`latableronde.vercel.app`, espace `ototosan42-3509s-projects`.
La connexion Git Vercel doit être vérifiée : l'ancien déploiement référence encore
`Sancacaprout/Latableronde`. Une publication GitHub seule ne prouve pas un déploiement.

Ce document est un état intermédiaire, pas une validation complète de production.
