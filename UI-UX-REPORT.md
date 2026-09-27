# Refonte UI/UX — La Table Ronde

Version : 2026-09-24-design-v1. Vérifications poursuivies le 27 septembre 2026.

## Visuel
- Palette commune vert sombre, crème et accents dorés pour l'accueil, les salons et les modales.
- Photos et illustrations existantes conservées. Aucun visuel généré.
- Accueil à deux colonnes sur ordinateur, raccourcis vers les quatre jeux accessibles.
- Textes promotionnels retirés au profit d'intitulés factuels.
- Modales centrées dans le viewport, tailles adaptées au contenu.
- Pseudos de Who is Who corrigés : le style des avatars ne s'applique plus aux noms.
- Annonce de Liars Bar placée sous les cartes, au lieu d'être tassée dessus.

## UX et accessibilité
- États de chargement et protection contre les doubles soumissions pour connexion, création/recherche de salon et pseudo.
- Notifications lisibles à la place des alertes simples ; confirmations métier conservées.
- Focus clavier visible, confinement du focus dans les modales, retour au déclencheur, fermeture Échap quand autorisée.
- Correction de la fermeture clavier de l'aperçu boutique.
- Copie du code avec confirmation ou message de secours.
- Barre d'XP et autres valeurs graphiques appliquées sans assouplir la politique CSP.

## Responsive
- Grilles adaptatives, panneaux défilables, champs et cibles tactiles agrandis.
- Sur téléphone : actions de jeu puis catalogue avant la grande photo.
- Suppression du blocage visuel en paysage, sans mise à l'échelle artificielle de l'application.
- Accueil contrôlé à 320, 375, 768 et 1280 px : pas de débordement horizontal détecté.
- Liars Bar contrôlé visuellement à 375 px : cartes visibles, actions accessibles, aucune image cassée détectée.
- Profil, boutique et fenêtre de salon contrôlés sur mobile au cours de la refonte.

## Performance
- Pas de dépendance ou framework ajouté.
- Animations permanentes de table, pile et certains effets lumineux retirés.
- Préférence de réduction des animations respectée.
- Images des raccourcis d'accueil chargées paresseusement.
- Aucun benchmark de performance avant/après : pas de gain chiffré revendiqué.

## Fichiers
Mêmes fichiers dans C:/LaTableRonde et dans le dépôt de publication C:/LaTableRonde/.restoration/publish :
- index.html
- app.js
- interface.css (nouveau)
- interface.js (nouveau)
- scripts/audit.cjs
- UI-UX-REPORT.md (ce rapport)

Les règles des jeux, scripts SQL, tables, RPC, politiques de sécurité, Storage et configuration Auth ne sont pas modifiés.

## Tests effectués
- Syntaxe JavaScript : node --check app.js et interface.js.
- Audit statique : 46 appels RPC, 74 fonctions SQL, 14 tables SQL, 29 chemins d'assets littéraux ; aucune erreur signalée.
- Comparaison au code précédent : aucun identifiant HTML supprimé, aucun doublon d'identifiant ; liste des appels RPC inchangée.
- git diff --check : valide.
- Restauration des deux sessions de test après rechargement.
- Création/rejoindre un salon et apparition du deuxième joueur sans recharger.
- Who is Who : dix questions, votes des deux joueurs, résultats synchronisés, classement final, Rejouer puis retour au salon et à l'accueil.
- Liars Bar normal : choix du mode, salon à deux, lancement, sélection et jeu de carte, passage de tour, accusations justes/fausses et diminution des vies.
- True Only : salon à deux, lancement, saisie et validation des anecdotes, vote auteur/vérité reconnu juste, révélation et classement final puis retour à l'accueil.
- Blackjack : création du salon et affichage de la table avec cartes et croupier ; aucune mise effectuée.
- Profil : chargement, statistiques, progression ; largeur mesurée de la barre conforme à la valeur indiquée (6 %, puis 69 % après tests).
- Boutique : images, aperçu et fermeture clavier ; fenêtre de salon et retour de focus.
- Aucune erreur console observée dans les contrôles Who is Who, Liars Bar, True Only et Blackjack.

## Limites
- Pas de nouvelle inscription/connexion par mot de passe réalisée dans cette passe ; sessions existantes utilisées. Le réglage sans confirmation e-mail reste inchangé.
- Pas de validation exhaustive de toutes les variantes, du multijoueur à 6–8 joueurs ni de tous les navigateurs.
- Fin de partie Liars Bar, modes Roulette/Chaos, tours de Blackjack, achats et tirage de roue non revalidés intégralement dans cette passe.
- Photo Roulette et Dead21 restent dans le code mais n'ont pas de raccourci dans le sélecteur existant ; aucun accès inventé. Hear Me Out n'a pas été trouvé dans ce projet.
- Les tests utilisent les comptes de test existants et le backend connecté ; leurs statistiques peuvent donc évoluer.
