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
- Deux nouveaux comptes de test confirmés créés dans Supabase Auth et connectés
  sur deux origines locales indépendantes. Déconnexion/reconnexion explicite du
  joueur B réussie ; session et profil du joueur A conservés après actualisation.
  Les mots de passe de ces comptes temporaires n'ont pas été enregistrés.
- Lecture du profil, solde et statistiques ; solde A de 250 pièces confirmé en SQL.
- Liars Bar normal : création d'un salon, jointure du second compte,
  affichage des deux joueurs sans actualisation, lancement sur les deux clients,
  carte jouée et passage de tour synchronisé. Partie complète à deux : bluff,
  accusations justes et fausse accusation, élimination naturelle de B,
  victoire de A et gain de 250 pièces. Résultat, XP et statistiques retrouvés
  dans les profils après retour à l'accueil.
- Roulette russe Liars Bar : deux joueurs synchronisés, carte bluffée,
  accusation, tir à blanc et compteur de tir synchronisé. Après abandon de B,
  A a reçu 150 pièces, persistées après retour au profil. Le SQL exclut
  volontairement les parties avec forfait des statistiques et de l'XP :
  ce résultat de forfait n'a donc pas compté comme partie jouée.
- Deux parties Roulette russe terminées naturellement après un tir fatal :
  victoire, 150 pièces, statistiques et XP persistés. Une double comptabilisation
  des accusations a été corrigée dans le client puis vérifiée sur la seconde
  partie : une accusation de plus à l'écran correspond à une unité de plus
  au profil. La première partie de test conserve son ancien comptage doublé
  dans le profil du compte A ; aucune statistique historique n'a été réécrite.
  La sortie du résultat côté B ne déclenche plus d'alerte AFK indue.
- Who is Who : salon à deux, lancement, votes des deux joueurs et révélation
  synchronisée ; partie complète de dix questions et classement final sur les
  deux clients. Le classement comptait le dernier vote deux fois (11 au lieu
  de 10) : corrigé et vérifié sur les deux clients après actualisation.
  L'alerte `not_room_host` vue sur un lancement précédent ne s'est pas
  reproduite lors de cette partie complète.
- Liars Bar Chaos : après le test initial de carte Demon et de tour synchronisé,
  partie complète à deux dans le salon SWEU. Accusation juste de A, puis deux
  accusations erronées de B, tirs synchronisés et élimination naturelle de B.
  Classement final identique sur les deux clients : A vainqueur (+250 pièces),
  B perdant. Après actualisation, A avait 250 pièces, 1 partie/1 victoire et
  B avait 0 pièce, 1 partie/0 victoire, 3 tirs/1 mort ; XP persistée aussi.
- True Only : salon à deux, lancement, anecdotes des deux joueurs, votes,
  révélations et classement final synchronisés. Les libellés accentués ont été
  corrigés sans modifier les règles ; vérification de l'affichage local.
- Blackjack : manche solo complète, mise de 50, score joueur 20 contre 17,
  victoire et gain de 50. Solde passé de 250 à 300, résultat et statistiques
  conservés après actualisation et retour au profil.
- Roue : gain de 300 pièces, délai de trois heures et blocage d'un second
  tour conservés après actualisation.
- Boutique : skin de revolver « Bois » acheté pour 500 pièces puis équipé ;
  solde et équipement conservés après actualisation. Le compte B affichait
  toujours zéro pièce et aucun achat.
- Publication Realtime vérifiée en SQL : `public.rooms` et `public.room_players`.
- Storage vérifié dans le tableau de bord Supabase : bucket `photo-roulette`
  présent et public, quatre policies actives. INSERT, UPDATE et DELETE exigent
  un utilisateur authentifié et un chemin dont le deuxième segment est son UID,
  comme le chemin construit dans `app.js`. SELECT autorise tout utilisateur
  authentifié pour ce bucket ; les URLs publiques restent lisibles sans compte.
- Storage testé avec un seul fichier texte synthétique dans le chemin du joueur
  A : import, lecture et mise à jour réussis ; modification par B rejetée par
  RLS, lecture par B autorisée (bucket public), suppression par B de 0 objet,
  suppression par A de 1 objet. Une lecture HTTP directe sans cache a ensuite
  renvoyé `NoSuchKey`. Le navigateur pouvait encore afficher l'ancien contenu
  depuis son cache. Le fichier témoin a été supprimé définitivement avec
  l'accord de l'utilisateur ; aucune photo personnelle n'a été touchée.
- Sur le domaine public, connexion du nouveau compte A et lecture du profil
  validées : 250 pièces, 1 partie/1 victoire et niveau 2, cohérents avec la
  partie Chaos réalisée localement sur le même backend.

## Vérifications encore nécessaires

- Badges Liars Bar et comportement des récompenses en cas de forfait.
- Reproduction éventuelle de l'ancienne alerte `not_room_host` dans Who is Who.
- Dead 21 et Photo Roulette : code backend/frontend présent mais aucun accès
  dans le sélecteur de jeux de la version fournie ; ne pas les annoncer jouables.
- Partie complète à deux directement sur le domaine public (tests à deux
  réalisés sur le serveur local avec le même backend Supabase). La liaison Git
  automatique est écartée par choix de l'utilisateur. Les deux nouveaux comptes
  de test existent encore dans Auth ; aucun compte n'a été supprimé.

## Limites de sécurité à traiter

- Le bucket Photo Roulette de la version fournie est public ; connaître une URL
  peut permettre de lire une photo. Les règles d'écriture ne rendent pas la lecture privée.
- Plusieurs états et récompenses Liars Bar restent contrôlés par le client.
  La restauration des permissions ne constitue pas une protection anti-triche complète.
- Une victoire par forfait donne 150 pièces mais n'incrémente ni partie jouée
  ni XP ; vérifier si cette asymétrie est voulue avant de modifier la règle.
- Dans Chaos, deux cartes honnêtes de A accusées à tort par B ont augmenté la
  statistique libellée « Bluffs réussis » et donné des pièces. C'est la règle
  actuelle du jeu ; confirmer le libellé/la règle avant toute modification.
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
`dpl_2pTe4k2C7h7TZJmbv2iKf43br9h8`, état READY). La page, le JavaScript,
le CSS et plusieurs images répondent en HTTP 200 ; un essai de connexion invalide
reçoit la réponse attendue de Supabase Auth. URL de site et trois redirections
exactes configurées dans Supabase Auth : domaine public, `127.0.0.1:4173` et
`localhost:4173`. Le dépôt `main` contient les corrections de True Only,
du profil Roulette russe, de la sortie de salon et du classement Who is Who.
La version de script `restore-v5` reste stable dans l'URL du navigateur.
Les fichiers privés `.env.local`, SQL et ce rapport renvoient 404 sur le
domaine public.

La connexion Git automatique Vercel n'est pas active : le compte GitHub lié à
Vercel est `Sancacaprout`, tandis que le dépôt personnel appartient à
`editbysan-web`. Vercel exige le propriétaire pour cette liaison ; le droit
Write temporairement accordé à `Sancacaprout` n'a pas suffi et a été retiré.
L'utilisateur a choisi de préserver les autres projets Vercel et de publier
La Table Ronde manuellement via la CLI liée au projet existant.

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
