# Hear Me Out — 29 septembre 2026

Intégration ciblée au site HTML/CSS/JS existant, sans nouveau framework,
authentification ou lobby. Version frontend : `2026-09-29-hmo-v1`.

## Fonctionnement

- 2 à 8 joueurs, 1 à 7 images par joueur.
- Thème commun ou thèmes individuels secrets distincts, parmi 18 thèmes.
- Recherche Wikimedia Commons (domaine public/CC0) et import JPEG/PNG/WebP.
- Sélections privées, validation, tours synchronisés, défense orale,
  votes uniques Oui/Bof/Non hors auteur, résultats, gâteau progressif et PNG Canvas.
- Reprise après actualisation et traitement des départs explicites.
- Présence réutilisée : les autres clients actifs peuvent retirer un joueur
  sans signal depuis 120 secondes ; les règles mobiles existantes restent actives.

## Supabase

Sur une base disposant déjà de `supabase-multiplayer-setup.sql`, exécuter
`supabase-hear-me-out.sql` dans le SQL Editor. Script transactionnel et réexécutable.
Il a été appliqué au projet `yhdafozbxydqemphdqvb`.

- Schéma privé `hmo_private` : themes, games, players, choices, votes.
- RPC publique `hmo_rpc`, invoker ; contrôles d'identité, appartenance, rôle et phase
  dans la fonction privée ; tables privées non accessibles directement.
- Table publique `hmo_events` : seulement room et révision, RLS membres et Realtime.
- Bucket privé `hear-me-out`, images téléchargées avec la session du joueur,
  propriétaire seulement avant révélation, membres après révélation.
- Garde-fous sur l'entrée et le démarrage des salons Hear Me Out.
- Seul ajout aux jeux existants : autorisation du code `hear` dans la création de salon.

## Vérification réalisée

- Deux sessions authentifiées distinctes, même Supabase réel : partie commune
  complète de quatre choix, galerie et import, tous les votes, gâteau final.
- PNG téléchargé et inspecté : les quatre images sont présentes.
- Mode individuel à deux joueurs : thèmes différents, révélation, vote,
  départ de l'hôte pendant le vote suivant, fin accessible au joueur restant.
- Actualisation en partie et reprise sur une page mobile de 390 × 844 ;
  largeur du document = largeur visible, images chargées.
- Test SQL réel sous rôle authenticated : images secrètes d'un autre joueur
  invisibles, absence de privilège direct sur les choix.
- Security Advisor relancé : 0 erreur, 65 avertissements projet à examiner
  séparément (notamment fonctions historiques et configuration Auth/Storage).
- Tests PostgreSQL hors ligne : réapplication, deux modes, quatre tours,
  RLS, refus anonyme/extérieur, validation, révélation réservée à l'auteur,
  votes périmés/doubles/sur soi refusés, reprise, départ et gâteau final.

## Commandes de test

`node --check app.js`, `node --check hear-me-out.js`, `node scripts/audit.cjs`.

Le test `node scripts/test-hmo.cjs` utilise `@electric-sql/pglite@0.5.8`.
Installer cette version dans un répertoire d'outils local et définir `NODE_PATH`
vers son dossier `node_modules`. Aucun accès réseau ou secret n'est utilisé par
le test ; les tables Auth/Storage et le lobby sont simulés dans PostgreSQL mémoire.
Le fichier `scripts/hmo-responsive.html` sert uniquement aux tests locaux.

## Limites connues

- La galerie libre ne contient pas tous les personnages ; l'import personnel
  complète la recherche. Le respect du thème est à apprécier entre joueurs.
- Les fichiers privés retirés d'une sélection ou d'un salon supprimé ne sont pas
  purgés automatiquement : prévoir une politique de rétention avant forte utilisation.
- Le retrait automatique après fermeture brutale n'a pas été chronométré en navigateur ;
  le départ explicite et la résolution côté jeu ont été testés.
- Aucun test de charge à huit joueurs, ni essai sur appareil iOS/Android physique.

## Publication

Publication manuelle Vercel uniquement, projet `latableronde`. Ne pas modifier
la connexion GitHub du compte ni les autres projets. `.vercelignore` exclut les
secrets, SQL, documentation et scripts de test du site publié.
