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
- Contrat statique : `node scripts/audit.cjs` (46 appels RPC, 74 fonctions SQL,
  14 tables, 27 références littérales d'assets ; ce n'est pas un test d'intégration).
- Inscription et création de profil ; confirmation d'e-mail requise.
- Connexion de deux comptes de test ; sessions conservées après actualisation
  et réouverture du navigateur ; pseudo du joueur A conservé.
- Lecture du profil, solde et statistiques ; solde A de 250 pièces confirmé en SQL.
- Liars Bar normal : création d'un salon, jointure du second compte,
  affichage des deux joueurs sans actualisation, lancement sur les deux clients,
  carte jouée et passage de tour synchronisé, accusation soumise.
- Pas de partie complète ni de récompense de fin de partie validée à ce stade.
- Who is Who : salon à deux, lancement, votes des deux joueurs et révélation
  synchronisée ; départ B reflété chez A par la fin de partie.
  Une alerte `not_room_host` est apparue au lancement malgré le démarrage réussi :
  anomalie à reproduire et diagnostiquer avant validation complète.
- Blackjack : création et lancement solo, table affichée. Compte B sans pièces
  (0 confirmé en SQL) ; aucune manche complète validée.
- Publication Realtime vérifiée en SQL : `public.rooms` et `public.room_players`.

## Vérifications encore nécessaires

- Fin de partie Liars Bar et persistance des récompenses, XP, badges.
- Roulette russe, Chaos, Blackjack, Who is Who et True Only de bout en bout.
- Dead 21 et Photo Roulette : code backend/frontend présent mais aucun accès
  dans le sélecteur de jeux de la version fournie ; ne pas les annoncer jouables.
- Upload, lecture et suppression Storage, refus d'accès entre utilisateurs.
- Achats et équipement boutique, roue, déconnexion/reconnexion explicite.
- Liaison Git automatique Vercel et essais de jeu complets sur le domaine public.

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
Le site restauré est déployé sur `https://latableronde.vercel.app` (déploiement
`dpl_F3xQEVSXCJEf1NL7g397PNY3jCrj`, état READY). La page, le JavaScript,
le CSS et plusieurs images répondent en HTTP 200 ; un essai de connexion invalide
reçoit la réponse attendue de Supabase Auth. URL de site et trois redirections
exactes configurées dans Supabase Auth : domaine public, `127.0.0.1:4173` et
`localhost:4173`. Le dépôt `main` contient le dernier correctif de cache CSS
(`8b075b9`).

La connexion Git automatique Vercel reste en attente : le compte GitHub lié à
Vercel est `Sancacaprout`. Une invitation à l'accès Write sur le dépôt ciblé a
été envoyée avec l'accord de l'utilisateur, mais doit être acceptée par ce compte.
Les déploiements actuels ont été effectués manuellement via la CLI Vercel liée
au projet existant.

## Retrait demandé le 23 septembre 2026

Dark Market supprimé : bouton, fenêtre, styles, état JavaScript, événements et
appel RPC retirés. La fonction Supabase a été supprimée et son absence vérifiée.
Le script ciblé `supabase-remove-dark-market.sql` ne modifie aucune donnée joueur.
Boutique normale, inventaires et roue conservés. Un contrôle de non-régression
empêche le retour de cette fonctionnalité dans les fichiers frontend.
Les anciennes versions restent dans Git et les sauvegardes ; aucun historique
n'a été réécrit. Le retrait est maintenant en production ; le cache CSS a été
actualisé et le HTML/JS public ne contient plus Dark Market.

Ce document est un état intermédiaire, pas une validation complète de production.
