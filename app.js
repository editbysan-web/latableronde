const SUPABASE_CONFIG = {
  url: window.LTR_SUPABASE?.url,
  anonKey: window.LTR_SUPABASE?.anonKey,
};

function hasSupabaseConfig() {
  try {
    return new URL(SUPABASE_CONFIG.url).protocol === "https:"
      && typeof SUPABASE_CONFIG.anonKey === "string"
      && SUPABASE_CONFIG.anonKey.startsWith("sb_publishable_");
  } catch {
    return false;
  }
}

let db = window.supabase && hasSupabaseConfig()
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

const WHO_QUESTIONS = [
  "Qui peut mourir de facon stupide ?",
  "Qui est le plus egocentrique ?",
  "Qui est le plus radin ?",
  "Qui manipule le plus les gens ?",
  "Qui es-tu le moins susceptible de battre en 1v1 ?",
  "Qui est le plus intelligent ?",
  "Qui pourrait finir SDF ?",
  "Si tu devais te reincarner dans la vie de quelqu'un, ce serait qui ?",
  "Qui pourrait survivre dans une invasion de zombies ?",
  "Qui pourrait survivre dans Alice in Borderland ?",
  "Qui a le plus d'avenir dans le X ?",
  "Qui aura la calvitie en premier ?",
  "Qui est le plus gros pigeon ?",
  "Qui s'habille le mieux ?",
  "Qui sera le plus meconnaissable plus tard ?",
  "Qui est le plus gros menteur ?",
  "Qui a le plus d'autoderision ?",
  "Qui serait la plus grosse michto si vous etiez des meufs ?",
  "Qui sera riche plus tard ?",
  "Qui trahirait le groupe pour 1 million ?",
  "Qui finit en prison en premier ?",
  "Qui survivrait le moins longtemps dans un film d'horreur ?",
  "Qui a le plus de chances de devenir celebre ?",
  "Qui pourrait creer une secte ?",
  "Qui rage le plus pour rien ?",
  "Qui serait le pire parent ?",
];

const PROFILE_SELECT = "id,pseudo,created_at,coins,owned_weapon_skins,equipped_weapon_skin,owned_name_skins,equipped_name_skin,owned_death_skins,equipped_death_skin,last_lucky_wheel_spin_at,lucky_wheel_bonus_spins,liars_xp,liars_level,total_coins_earned,current_win_streak,best_win_streak";
const DEFAULT_PROFILE_SHOP = {
  coins: 0,
  createdAt: null,
  ownedWeaponSkins: [],
  equippedWeaponSkin: null,
  ownedNameSkins: [],
  equippedNameSkin: null,
  ownedDeathSkins: [],
  equippedDeathSkin: null,
  lastLuckyWheelSpinAt: null,
  luckyWheelBonusSpins: 0,
  liarsXp: 0,
  liarsLevel: 1,
  totalCoinsEarned: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
};
const ROOM_SESSION_KEY = "ltr.currentRoomId";
const ROOM_CLEANUP_KEY = "ltr.lastRoomCleanupAt";
const APP_BUILD_VERSION = "2026-09-23-restore-v3";
const PHOTO_BUCKET = "photo-roulette";
const JUNE_GIFT_AMOUNT = 1000;
let appBuildRefreshPending = false;
const ROOM_IDLE_LEAVE_MS = 90 * 60 * 1000;
const DEFAULT_WEAPON_IMAGE = "./Boutique/revolverdefault.png?v=2";

function ensureFreshAppBuild() {
  try {
    const key = "ltr.appBuildVersion";
    const params = new URLSearchParams(window.location.search);
    const urlVersion = params.get("appv");
    const storedVersion = localStorage.getItem(key);
    if (appBuildRefreshPending) return false;
    if (urlVersion !== APP_BUILD_VERSION) {
      appBuildRefreshPending = true;
      localStorage.setItem(key, APP_BUILD_VERSION);
      params.set("appv", APP_BUILD_VERSION);
      const nextSearch = params.toString();
      window.location.replace(`${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash || ""}`);
      return false;
    }
    localStorage.setItem(key, APP_BUILD_VERSION);
  } catch (error) {
    console.warn("Fresh build check failed:", error);
  }
  return true;
}

const WEAPON_SKINS = [
  { id: "revolverbois", name: "Bois", file: "revolverbois.png", price: 500 },
  { id: "revolverwali", name: "Le Distingué", file: "revolverwali.png", price: 1000 },
  { id: "revolvernelson", name: "L’Ingénieur", file: "revolvernelson.png", price: 1000 },
  { id: "revolvermarmol", name: "Le Penseur", file: "revolvermarmol.png", price: 1000 },
  { id: "revolversacha", name: "Le Tronc", file: "revolversacha.png", price: 1000 },
  { id: "revolverjules", name: "L’Intrépide", file: "revolverjules.png", price: 1000 },
  { id: "revolversael", name: "Le Soleil", file: "revolversael.png", price: 1000 },
  { id: "revolverlouis", name: "Le Croupier", file: "revolverlouis.png", price: 1000 },
  { id: "revolvervial", name: "Le Géographe", file: "revolvervial.png", price: 1000 },
  { id: "revolvertoma", name: "L’Épicurien", file: "revolvertoma.png", price: 1000 },
  { id: "revolvernerf", name: "Nerf", file: "revolvernerf.png", price: 1500 },
  { id: "revolverlego", name: "Lego", file: "revolverlego.png", price: 1500 },
  { id: "revolverog", name: "OG", file: "revolverog.png", price: 2000 },
  { id: "revolverreaver", name: "Reaver", file: "revolverreaver.png", price: 2000 },
  { id: "revolvercasino", name: "Casino", file: "revolvercasino.png", price: 3000 },
  { id: "revolvergod", name: "God", file: "revolvergod.png", price: 3000 },
  { id: "revolvergold", name: "Gold", file: "revolvergold.png", price: 4000 },
  { id: "revolverdiamant", name: "Diamant", file: "revolverdiamant.png", price: 5000 },
];

const NAME_SKINS = [
  { id: "blue", name: "Pseudo bleu", price: 1500, className: "name-blue" },
  { id: "red", name: "Pseudo rouge", price: 1500, className: "name-red" },
  { id: "green", name: "Pseudo vert", price: 1500, className: "name-green" },
  { id: "purple", name: "Pseudo violet", price: 1500, className: "name-purple" },
  { id: "rgb", name: "Pseudo RGB", price: 4000, className: "name-rgb" },
  { id: "gold", name: "Pseudo or", price: 5000, className: "name-gold" },
];

const DEATH_SKINS = [
  { id: "mortjules", name: "L’intrépide", file: "mortjules.png", price: 500 },
  { id: "mortlouis", name: "Le croupier", file: "mortlouis.png", price: 500 },
  { id: "mortmarmol", name: "Le penseur", file: "mortmarmol.png", price: 500 },
  { id: "mortnelson", name: "L’ingénieur", file: "mortnelson.png", price: 500 },
  { id: "mortsacha", name: "Le tronc", file: "mortsacha.png", price: 500 },
  { id: "mortsael", name: "Le soleil", file: "mortsael.png", price: 500 },
  { id: "mortthomas", name: "L’épicurien", file: "mortthomas.png", price: 500 },
  { id: "mortvial", name: "Le géographe", file: "mortvial.png", price: 500 },
];

const LUCKY_WHEEL_REWARDS = [
  { id: "coins_1", label: "1", detail: "pièce", coins: 1 },
  { id: "coins_100", label: "100", detail: "pièces", coins: 100 },
  { id: "bonus_spin", label: "Relancer", detail: "la roue", bonusSpin: true },
  { id: "coins_200", label: "200", detail: "pièces", coins: 200 },
  { id: "coins_300", label: "300", detail: "pièces", coins: 300 },
  { id: "coins_500", label: "500", detail: "pièces", coins: 500 },
  { id: "coins_1000", label: "1000", detail: "pièces", coins: 1000 },
  { id: "casino_skin", label: "Casino", detail: "skin", skinId: "revolvercasino", image: "./Boutique/revolvercasino.png" },
];
const luckyWheelImageCache = new Map();

const LIARS_MODE_RULES = {
  normal: {
    title: "🎭 LIARS BAR — RÈGLES",
    body: `🎭 LIARS BAR — RÈGLES

🧠 But du jeu
Sois le dernier joueur vivant ❤️

👥 Joueurs
2 à 4 joueurs

🃏 Cartes du deck
👑 Rois ×6
👸 Dames ×6
🂡 As ×6
🃏 Jokers ×2

❤️ Vies
Chaque joueur commence avec 3 vies

🎲 Début d’un round
Le jeu choisit une carte cible au hasard :
👑 Roi • 👸 Dame • 🂡 As

✅ Cartes valides
• La carte du round
• 🃏 Joker

❌ Cartes mensonges
Toute autre carte

🎯 À ton tour (temps limité ⏳)
Tu peux :

🃏 Jouer 1 à 3 cartes face cachée
→ Tu affirmes qu’elles sont valides

OU

🚨 Dire “MENTEUR !”
→ Tu accuses le joueur précédent

🔄 Tours
↩️ Sens antihoraire
🚫 Plus de cartes = tour passé

⚠️ Cas spécial
S’il ne reste qu’un joueur avec des cartes :
👉 Il doit accuser le joueur précédent

💥 Accusation
Les cartes sont révélées :

❌ Le joueur a menti
→ Il perd 1 vie ❤️

✅ Le joueur disait vrai
→ L’accusateur perd 1 vie ❤️

🗑️ Cartes jouées
Les cartes sont révélées puis jetées.
❌ Impossible de les récupérer

🔄 Fin du round
Quand tout le monde a joué (ou presque) :
🃏 Nouveau mélange
✋ 5 nouvelles cartes
🎲 Nouvelle carte cible

💀 Élimination
0 ❤️ = éliminé

🏆 Victoire
Le dernier joueur vivant gagne`
  },
  dead21: {
    title: "🎭 DEAD 21 — RÈGLES",
    body: `🎭 DEAD 21 — RÈGLES

🧠 But du jeu
Approche 21 sans le dépasser… et survie à la roulette russe 🔫

👥 Joueurs
2 à 4 joueurs

🃏 Deck du round (14 cartes)
👑👸🤵 4 figures (valent 10)
🔢 9 cartes entre 2 et 10
🂡 1 As obligatoire (vaut toujours 11)

⚠️ Maximum 4 cartes identiques par valeur

❤️ Objectif
Être le dernier survivant 💀

🎲 Début de manche
Chaque joueur reçoit 2 cartes secrètes 🃏🃏
👀 Tu vois uniquement tes cartes

🎯 Premier tour obligatoire
Tu dois jouer une carte ❗
🚫 Pas de pioche
🚫 Pas de “Rester”

🃏 Jouer une carte
Tu poses une carte face cachée et annonces une valeur.

Tu peux annoncer :

✅ Valeur réelle
✅ Valeur -1
✅ Valeur +1

Exemples :

🔢 Carte 8 → 7 / 8 / 9

🔢 Carte 2 → 2 / 3

👑 Figure (10) → 9 / 10 / 11

🂡 As → 10 / 11

🚫 Valeur interdite impossible

🤥 Bluff ou vérité ?
Dire la vraie valeur = ✅ vérité

Dire ±1 = 🤥 bluff (même si autorisé)

Exemple :
Carte 8, annonce 9 → bluff

🔫 Si tu es accusé et que tu bluffais :
👉 roulette russe

🚨 Accuser
Tu peux dire “MENTEUR !”

Conditions :

✅ Une carte doit avoir été jouée juste avant
✅ Même dès le premier tour si un joueur a joué avant toi

🚫 Pas de carte précédente = impossible
🚫 Carte déjà révélée = impossible
🚫 Joueur éliminé/resté = impossible

💥 Résultat accusation

❌ Le joueur mentait
→ Il tire 🔫

✅ Il disait vrai
→ L’accusateur tire 🔫

🔄 Après un tir :
🃏 Manche reset
✋ Nouvelles cartes
🎲 Nouvelle manche

📈 Score réel
Ton score = somme des vraies cartes jouées

❌ Les annonces ne comptent pas

Exemple :
8 annoncé 9 + Roi annoncé 10
→ Score réel = 18

➕ Deuxième tour et suivants
Tu peux :

🃏 Jouer une carte

OU

🎴 Piocher 1 carte
→ Puis jouer immédiatement une carte

🚫 Impossible de piocher puis passer

✋ Bouton RESTER
À partir du 2e tour personnel

Quand tu restes :

🔒 Ton score est bloqué
🗑️ Tes cartes restantes disparaissent
⏭️ Tu ne joues plus la manche

⚠️ Dépasser 21
22+ = danger immédiat 💀

À la fin de manche :
👉 Tu tires automatiquement 🔫

🏁 Fin de manche
Quand tout le monde :

✋ a Resté
OU
🃏 n’a plus de carte
OU
💀 est éliminé

Les scores sont révélés 👀

🏆 Qui est safe ?
Le meilleur score sans dépasser 21 est protégé 🛡️

Exemples :

21 = meilleur score 👑
20 > 18 > 15

⚠️ Dépasser 21 ne peut jamais gagner

💀 Punition finale
🔫 Tous les joueurs au-dessus de 21 tirent

Puis :

🔫 Tous les joueurs qui ne sont pas les meilleurs tirent

Exemple :

A → 21 ✅ SAFE
B → 18 🔫
C → 18 🔫
D → 16 🔫

Si plusieurs meilleurs scores :
🛡️ Tous sont safe

🔫 Roulette russe progressive
La pression monte 😈

1er tir → 1/4 💥
2e tir → 2/4 💥
3e tir → 3/4 💥
4e tir → 4/4 ☠️

Plus tu survives… plus ça devient dangereux.

🏆 Victoire
Quand il ne reste qu’un survivant ❤️‍🔥`
  },
  chaos: {
    title: "🎭 CHAOS MODE — RÈGLES",
    body: `🎭 CHAOS MODE — RÈGLES

☠️ MODE CHAOS

Version extrême de Liars Bar :

🧠 Bluff
🔫 Roulette russe
🤠 Duel Far West
💀 Cartes spéciales

👥 JOUEURS

2 à 6 joueurs

🃏 DECK CHAOS

2 joueurs

👑 5 Rois
👸 5 Reines
😈 1 Démon
🏹 1 Chasseur

3 joueurs

👑 5 Rois
👸 5 Reines
😈 1 Démon
🏹 1 Chasseur
🤠 1 Far West

4 joueurs

👑 5 Rois
👸 5 Reines
😈 1 Démon
🏹 1 Chasseur
🤠 1 Far West

5 joueurs

👑 7 Rois
👸 7 Reines
😈 1 Démon
🏹 1 Chasseur
🤠 1 Far West

6 joueurs

👑 7 Rois
👸 7 Reines
😈 2 Démons
🏹 2 Chasseurs
🤠 1 Far West

🎯 OBJECTIF

Être le dernier survivant.

🎲 TON TOUR
Tu peux :

🃏 Jouer 1 à 3 cartes cachées
🚨 Accuser le joueur précédent

🤥 BLUFF

❌ Mensonge → tu tires 🔫
✅ Vérité → l'accusateur tire 🔫

😈 DÉMON

⚠️ Carte jouable seule uniquement

Si elle est révélée après accusation :

💀 Tous les joueurs sauf le possesseur tirent

🏹 CHASSEUR

⚠️ Carte jouable seule uniquement

Si elle est révélée après accusation :

🔫 L'accusateur tire sur le possesseur

💀 Mort → éliminé
❤️ Survie → partie continue

🤠 FAR WEST

⚠️ Absent en 1v1 / quand il reste 2 joueurs

Jouée seule

➡️ Fonctionne comme une carte Joker
➡️ L'accusateur tire

Jouée avec toute la main

🚨 Déclenche un Duel Far West

Les deux joueurs tirent à tour de rôle :

🔫 accusateur
🔫 joueur Far West
🔫 accusateur
🔫 joueur Far West

💀 Jusqu'à la mort d'un joueur

🏆 Survivant → barillet reset

🏆 VICTOIRE

Le dernier survivant gagne.`
  },
  roulette: {
    title: "🎭 LIARS BAR — MODE ROULETTE RUSSE",
    body: `🎭 LIARS BAR — MODE ROULETTE RUSSE

🧠 Concept
Le bluff classique… mais sans vies ❤️

Chaque erreur peut tuer 💀

Tu bluffes 🃏
Tu accuses 🚨
Tu survis… ou pas 🔫

👥 Joueurs
2 à 4 joueurs

🃏 Deck

👑 Rois
👸 Dames
🂡 As
🃏 Jokers

🎯 But du jeu
Être le dernier survivant ❤️‍🔥

🎲 Début d’un round
Le jeu choisit une carte cible :

👑 Roi • 👸 Dame • 🂡 As

Chaque joueur reçoit 5 cartes 🃏

✅ Cartes valides
• Carte du round
• 🃏 Joker

❌ Cartes mensonges
Toute autre carte

🎯 À ton tour
Tu peux :

🃏 Jouer 1 à 3 cartes face cachée

OU

🚨 Dire “MENTEUR !”
→ accuse le joueur précédent

🤥 Bluff ou vérité
Tu peux mentir… ou dire vrai 👀

Si tu es accusé :

❌ Mensonge → tu tires 🔫
✅ Vérité → l’accusateur tire 🔫

🔫 Roulette russe

Chaque joueur possède un barillet personnel

Dedans :

💀 1 balle réelle
⚫ 5 chambres vides

🎲 Le barillet est mélangé secrètement au début de partie.

👀 Impossible de voir sa position

⚠️ Le barillet garde son état

Exemple :

Tu survis à 3 tirs 😰

Il reste moins de chambres → danger plus élevé 💀

📊 Risque de mort

1er tir → 1/6 💀
2e tir → 1/5
3e tir → 1/4
4e tir → 1/3
5e tir → 1/2

💥 Quand une accusation arrive

Les cartes sont révélées 👀

Deux cas :

❌ Le joueur mentait
→ il tire 🔫

✅ Le joueur disait vrai
→ l’accusateur tire 🔫

⚠️ IMPORTANT : le round s’arrête immédiatement

Après la roulette russe :

🗑️ cartes défaussées
🔄 nouveau round instantané
🎲 nouvelle carte cible
🃏 nouvelles cartes distribuées

🚫 On ne continue jamais le round actuel

Objectif : jeu rapide et nerveux ⚡

🔥 Rythme du mode

🃏 Bluff
🚨 Accusation
🔫 Roulette russe
💀 Suspense
🔄 Nouveau round

🎨 Ambiance

🌑 Plus sombre
🔴 Lumières rouges
📳 Tremblements caméra
🔊 Sons métalliques / heartbeat

⚡ Animation rapide (2 à 4 sec max) pour garder le rythme

🏆 Victoire
Le dernier survivant gagne 💀🔥`
  },
};
const state = {
  user: null,
  screen: "auth",
  authMode: "login",
  currentRoomId: "",
  leavingRoom: false,
  roomHostId: "",
  roomStatus: "lobby",
  roomChannel: null,
  roomStateChannel: null,
  roomStateLive: false,
  lobbyRefreshTimer: null,
  roomCode: "",
  game: "who",
  joinGame: "who",
  settings: {
    who: { rounds: 10, state: null },
    true: { state: null },
    photo: { rounds: 10 },
    liars: { lives: 3, mode: "normal", antiAfkEnabled: true },
    blackjack: { state: null },
  },
  players: [],
  who: {
    phaseTimer: null,
    ticker: null,
  },
  trueOnly: {
    ticker: null,
    revealTimer: null,
  },
  photo: {
    files: [],
    pool: [],
    round: 1,
    scores: {},
    timer: null,
    answered: new Set(),
    revealLeft: 0,
    uploading: false,
    renderedKey: "",
    phaseTimer: null,
    uploadProgress: "",
  },
  liars: {
    target: "Roi",
    lives: {},
    hand: [],
    selected: [],
    pile: 0,
    activePlayer: 0,
    state: null,
    syncTimer: null,
    saving: false,
    revealTimer: null,
    endTimer: null,
    lastRevealId: "",
    renderedPileKey: "",
    roundIntroId: "",
    turnToastId: "",
    turnToastTimer: null,
    rouletteLogTimer: null,
    endProfileRefreshGameId: "",
    profileFinalizeGameId: "",
    deadPrivate: null,
    deadSelectedCardId: "",
    deadSelectedAnnounce: null,
    deadPrivateTimer: null,
    lastDeadRevealId: "",
    deadRenderKey: "",
    handHidden: false,
    badgeUnlocks: [],
    badgeUnlockModalClosedFor: "",
  },
  blackjack: {
    busy: false,
    selectedBet: 50,
    renderKey: "",
    tickTimer: null,
    lastAction: null,
    actionLockUntil: 0,
    phase: "",
    phaseStartedAt: 0,
    dealerRevealCount: 0,
    dealerRevealStep: "",
    handCounts: {},
    remoteAction: null,
    lastRemoteCardKey: "",
    pendingDoubleBet: 0,
    pendingDoubleAt: 0,
    bustSeenAt: {},
    bustTimer: null,
    coinRefreshKey: "",
    coinRefreshBusy: false,
  },
  shop: {
    busy: false,
    previewClosedAt: 0,
    blockClicksUntil: 0,
  },
  luckyWheel: {
    busy: false,
    spinning: false,
    state: null,
    result: null,
    resultFresh: false,
    rotation: 0,
    countdownTimer: null,
  },
  juneGift: {
    loading: false,
    available: false,
    claimed: false,
    loadedAt: 0,
  },
  profileModal: {
    open: false,
    userId: "",
    tab: "global",
    data: null,
    busy: false,
  },
  roomIdle: {
    timer: null,
    lastActivity: Date.now(),
    lastResetAt: 0,
  },
  renderKeys: {
    lobby: "",
    liarsEnd: "",
  },
  homeHero: {
    timer: null,
    index: 0,
  },
  presence: {
    timer: null,
    kickTimer: null,
    countdownTimer: null,
    cleanupTimer: null,
    kickDeadline: 0,
    hiddenAt: 0,
    promptOpen: false,
    heartbeatBusy: false,
    cleanupBusy: false,
    hostPromptId: "",
  },
};

const screens = [...document.querySelectorAll(".screen")];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const DEAD21_SCORE_REVEAL_MS = 6000;
const DEAD21_SCORE_REVEAL_SETTLE_MS = 700;
const DEAD21_SCORE_REAL_DELAY_MS = 2000;
const DEAD21_SCORE_EXIT_DELAY_MS = 4000;
const DEAD21_SHOT_RESULT_VISIBLE_MS = 3600;
const DEAD21_FINAL_SHOT_MS = 4800;
const LIARS_PROFILE_TABS = [
  { id: "global", label: "Global" },
  { id: "badges", label: "Badges" },
  { id: "normal", label: "Mode normal" },
  { id: "roulette", label: "Roulette russe" },
  { id: "chaos", label: "Chaos" },
  { id: "blackjack", label: "Blackjack" },
];
const LIARS_BADGE_CATEGORIES = {
  roulette: { label: "Roulette russe", reward: 2000 },
  chaos: { label: "Chaos", reward: 3000 },
  blackjack: { label: "Blackjack", reward: 2000 },
};
const LIARS_BADGES = [
  { id: "miracule", category: "roulette", name: "Miraculé", image: "miracule.png", description: "Survivre à 3 tirs d'affilée", progressMax: 3 },
  { id: "immortel", category: "roulette", name: "Immortel", image: "immortel.png", description: "Survivre à un tir critique", progressMax: 1 },
  { id: "tetebrullee", category: "roulette", name: "Tête brûlée", image: "tetebrulee.png", description: "Survivre à 25 roulettes", progressMax: 25 },
  { id: "chanceinsolente", category: "roulette", name: "Chance insolente", image: "chance insolente.png", description: "Survivre à 5 tirs critiques", progressMax: 5 },
  { id: "allin", category: "roulette", name: "All-in", image: "allin.png", description: "Faire un bluff avec 3 cartes", progressMax: 1 },
  { id: "pokerface", category: "roulette", name: "Poker Face", image: "pokerface.png", description: "Gagner une partie sans mentir", progressMax: 1 },
  { id: "sherlock", category: "roulette", name: "Sherlock", image: "sherlock.png", description: "Réussir 5 accusations d'affilée", progressMax: 5 },
  { id: "menteurpro", category: "roulette", name: "Menteur professionnel", image: "menteurpro.png", description: "Réussir 50 bluffs", progressMax: 50 },
  { id: "intouchable", category: "roulette", name: "Intouchable", image: "intouchable.png", description: "Gagner une partie sans être accusé", progressMax: 1 },
  { id: "roidubluff", category: "roulette", name: "Roi du bluff", image: "roidubluff.png", description: "Réussir 10 bluffs dans une partie", progressMax: 10 },
  { id: "demoniste", category: "chaos", name: "Démoniste", image: "demoniste.png", description: "Faire mourir 2 joueurs avec Démon", progressMax: 2 },
  { id: "apocalyptique", category: "chaos", name: "Apocalyptique", image: "apocalyptique.png", description: "Déclencher un Démon et gagner la partie", progressMax: 1 },
  { id: "tireurdelite", category: "chaos", name: "Tireur d'élite", image: "tireurdelite.png", description: "Éliminer 5 joueurs avec Chasseur", progressMax: 5 },
  { id: "cowboy", category: "chaos", name: "Cowboy", image: "cowboy.png", description: "Gagner un duel Far West", progressMax: 1 },
  { id: "westernhardcore", category: "chaos", name: "Western Hardcore", image: "westernhardcore.png", description: "Survivre à 3 tirs dans un duel Far West", progressMax: 3 },
  { id: "derniersouffle", category: "chaos", name: "Dernier souffle", image: "derniersouffle.png", description: "Gagner après avoir survécu à un tir critique", progressMax: 1 },
  { id: "faibledesprit", category: "chaos", name: "Faible d'esprit", image: "faibledesprit.png", description: "Mourir tour 1", progressMax: 1 },
  { id: "chaosabsolu", category: "chaos", name: "Chaos absolu", image: "chaosabsolu.png", description: "Déclencher Démon, Chasseur et Far West dans une même partie", progressMax: 3 },
  { id: "professionel", category: "chaos", name: "Professionnel", image: "professionel.png", description: "Gagner avec un barillet dangereux", progressMax: 1 },
  { id: "maitredujeu", category: "chaos", name: "Maître du jeu", image: "maitredujeu.png", description: "Éliminer tous les joueurs d’une partie", progressMax: 1 },
  { id: "miseurfou", category: "blackjack", name: "Miseur Fou", image: "miseurfou.png", description: "Miser 1000 pièces au Blackjack", progressMax: 1000 },
  { id: "rpflorian", category: "blackjack", name: "RP Florian", image: "rpflorian.png", description: "Perdre 3 fois de suite au Blackjack", progressMax: 3 },
  { id: "mainroyale", category: "blackjack", name: "Main royale", image: "mainroyale.png", description: "Faire un Blackjack naturel", progressMax: 1 },
  { id: "doubleourien", category: "blackjack", name: "Double ou rien", image: "doubleourien.png", description: "Gagner après avoir doublé", progressMax: 1 },
  { id: "croupierhumilie", category: "blackjack", name: "Croupier humilié", image: "croupierhumilie.png", description: "Gagner 5 mains d’affilée", progressMax: 5 },
];
const LIARS_BADGE_BY_ID = Object.fromEntries(LIARS_BADGES.map((badge) => [badge.id, badge]));

function saveRoomSession(roomId) {
  try {
    if (roomId) localStorage.setItem(ROOM_SESSION_KEY, roomId);
  } catch (error) {
    console.warn("Room session save failed:", error);
  }
}

function clearRoomSession() {
  try {
    localStorage.removeItem(ROOM_SESSION_KEY);
  } catch (error) {
    console.warn("Room session clear failed:", error);
  }
}

function savedRoomSessionId() {
  try {
    return localStorage.getItem(ROOM_SESSION_KEY) || "";
  } catch (error) {
    console.warn("Room session read failed:", error);
    return "";
  }
}

function resetRoomIdleTimer() {
  state.roomIdle.lastActivity = Date.now();
  clearTimeout(state.roomIdle.timer);
  if (!state.currentRoomId || ["auth", "home", "games"].includes(state.screen)) return;
  state.roomIdle.timer = setTimeout(() => {
    const idleMs = Date.now() - state.roomIdle.lastActivity;
    if (state.currentRoomId && idleMs >= ROOM_IDLE_LEAVE_MS - 1000) {
      leaveCurrentRoom();
    } else {
      resetRoomIdleTimer();
    }
  }, ROOM_IDLE_LEAVE_MS);
}

function stopRoomIdleTimer() {
  clearTimeout(state.roomIdle.timer);
  state.roomIdle.timer = null;
}

function noteRoomActivity() {
  if (!state.currentRoomId) return;
  const now = Date.now();
  if (now - Number(state.roomIdle.lastResetAt || 0) < 1500) {
    state.roomIdle.lastActivity = now;
    return;
  }
  state.roomIdle.lastResetAt = now;
  resetRoomIdleTimer();
}

async function cleanupOldRoomsIfNeeded() {
  if (!db || !state.user?.id) return;
  let lastCleanup = 0;
  try {
    lastCleanup = Number(localStorage.getItem(ROOM_CLEANUP_KEY) || 0);
  } catch (error) {
    console.warn("Room cleanup timestamp read failed:", error);
  }
  if (Date.now() - lastCleanup < 20 * 60 * 1000) return;
  try {
    const { error } = await db.rpc("cleanup_old_rooms_rpc", {
      p_finished_after_hours: 2,
      p_abandoned_after_hours: 2,
      p_empty_lobby_after_hours: 1,
    });
    if (error) {
      if (!isMissingRpc(error)) console.warn("Old room cleanup failed:", error.message || error);
      return;
    }
    localStorage.setItem(ROOM_CLEANUP_KEY, String(Date.now()));
  } catch (error) {
    console.warn("Old room cleanup failed:", error);
  }
}

function cleanText(value, fallback = "") {
  return String(value || fallback)
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 40);
}

function cleanLogText(value, fallback = "") {
  return String(value || fallback)
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 120);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeProfile(profile = {}) {
  return {
    id: profile.id || state.user?.id || "",
    pseudo: cleanText(profile.pseudo || state.user?.pseudo, "Joueur"),
    coins: Number(profile.coins || 0),
    createdAt: profile.created_at || profile.createdAt || null,
    ownedWeaponSkins: Array.isArray(profile.owned_weapon_skins) ? profile.owned_weapon_skins : Array.isArray(profile.ownedWeaponSkins) ? profile.ownedWeaponSkins : [],
    equippedWeaponSkin: profile.equipped_weapon_skin || profile.equippedWeaponSkin || null,
    ownedNameSkins: Array.isArray(profile.owned_name_skins) ? profile.owned_name_skins : Array.isArray(profile.ownedNameSkins) ? profile.ownedNameSkins : [],
    equippedNameSkin: profile.equipped_name_skin || profile.equippedNameSkin || null,
    ownedDeathSkins: Array.isArray(profile.owned_death_skins) ? profile.owned_death_skins : Array.isArray(profile.ownedDeathSkins) ? profile.ownedDeathSkins : [],
    equippedDeathSkin: profile.equipped_death_skin || profile.equippedDeathSkin || null,
    lastLuckyWheelSpinAt: profile.last_lucky_wheel_spin_at || profile.lastLuckyWheelSpinAt || null,
    luckyWheelBonusSpins: Number(profile.lucky_wheel_bonus_spins || profile.luckyWheelBonusSpins || 0),
    liarsXp: Number(profile.liars_xp || profile.liarsXp || 0),
    liarsLevel: Math.max(1, Number(profile.liars_level || profile.liarsLevel || 1)),
    totalCoinsEarned: Number(profile.total_coins_earned || profile.totalCoinsEarned || 0),
    currentWinStreak: Number(profile.current_win_streak || profile.currentWinStreak || 0),
    bestWinStreak: Number(profile.best_win_streak || profile.bestWinStreak || 0),
  };
}

function applyProfileToUser(profile) {
  if (!state.user || !profile) return;
  const normalized = normalizeProfile(profile);
  state.user = {
    ...state.user,
    pseudo: normalized.pseudo || state.user.pseudo,
    coins: normalized.coins,
    ownedWeaponSkins: normalized.ownedWeaponSkins,
    equippedWeaponSkin: normalized.equippedWeaponSkin,
    ownedNameSkins: normalized.ownedNameSkins,
    equippedNameSkin: normalized.equippedNameSkin,
    ownedDeathSkins: normalized.ownedDeathSkins,
    equippedDeathSkin: normalized.equippedDeathSkin,
    lastLuckyWheelSpinAt: normalized.lastLuckyWheelSpinAt,
    luckyWheelBonusSpins: normalized.luckyWheelBonusSpins,
  };
}

function nameSkinClass(skinId) {
  return NAME_SKINS.find((skin) => skin.id === skinId)?.className || "";
}

function renderName(pseudo, skinId = null) {
  const cls = nameSkinClass(skinId);
  return `<span class="player-name ${cls}">${cleanText(pseudo, "Joueur")}</span>`;
}

function weaponSkinUrl(skinId) {
  const skin = WEAPON_SKINS.find((item) => item.id === skinId);
  return skin ? `./Boutique/${skin.file}` : DEFAULT_WEAPON_IMAGE;
}

function deathSkinUrl(skinId) {
  const skin = DEATH_SKINS.find((item) => item.id === skinId);
  return skin ? `./Boutique/${skin.file}` : cardImage("Mort");
}

function playerById(playerId) {
  return state.players.find((player) => player.id === playerId) || null;
}

function weaponSkinForPlayer(playerId, gameState = getLiarsState()) {
  return playerById(playerId)?.weaponSkin || gameState?.weaponSkins?.[playerId] || null;
}

function deathSkinForPlayer(playerId, gameState = getLiarsState()) {
  return playerById(playerId)?.deathSkin || gameState?.deathSkins?.[playerId] || null;
}

function deathTokenForPlayer(playerId, gameState = getLiarsState()) {
  return deathSkinUrl(deathSkinForPlayer(playerId, gameState));
}

async function liveWeaponSkinForPlayer(playerId, gameState = getLiarsState()) {
  if (!db || !state.currentRoomId || !playerId) return weaponSkinForPlayer(playerId, gameState);
  try {
    const { data, error } = await db
      .from("room_players")
      .select("weapon_skin")
      .eq("room_id", state.currentRoomId)
      .eq("user_id", playerId)
      .maybeSingle();
    if (!error && data) return data.weapon_skin || null;
  } catch (error) {
    console.warn("Live weapon skin lookup failed:", error);
  }
  return weaponSkinForPlayer(playerId, gameState);
}

function shotWeaponSkin(shot, fallbackPlayerId, gameState = getLiarsState()) {
  if (shot && Object.prototype.hasOwnProperty.call(shot, "weaponSkin") && shot.weaponSkin) return shot.weaponSkin;
  return weaponSkinForPlayer(fallbackPlayerId, gameState);
}

function cleanRoomCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 4);
}

function go(screen) {
  state.screen = screen;
  screens.forEach((item) => item.classList.toggle("active", item.dataset.screen === screen));
  const endScreen = document.querySelector('[data-screen="end"]');
  if (endScreen) endScreen.classList.toggle("who-screen", screen === "end" && state.game === "who");
  if (endScreen) endScreen.classList.toggle("true-screen", screen === "end" && state.game === "true");
  renderAccountLabel();
  if (screen === "lobby") renderLobby();
  if (screen === "who-game") startWhoGame();
  if (screen === "true-game") startTrueGame();
  if (screen === "liars-game") startLiarsGame();
  if (screen === "blackjack-game") startBlackjackGame();
  if (screen === "end") closeTransientModals();
  if (screen === "end") renderEnd();
  if (screen === "home") renderHome();
  if (screen === "home") startHomeHeroSlideshow();
  else stopHomeHeroSlideshow();
  if (screen !== "home") closeJoinModal();
  if (screen !== "games") closeLiarsModeModal();
}

function setNotice(message) {
  $("#auth-notice").textContent = message;
}

function showMessage(message) {
  if (state.screen === "auth") {
    setNotice(message);
    return;
  }
  window.alert(message);
}

function renderAccountLabel() {
  const label = $("#account-label");
  if (!label) return;
  label.innerHTML = state.user?.pseudo
    ? `Connecte en tant que <button class="inline-profile-link" type="button" id="home-profile-link">${renderName(state.user.pseudo, state.user.equippedNameSkin)}</button>`
    : "Connecte en tant que";
  $("#home-profile-link")?.addEventListener("click", () => openLiarsProfile(state.user?.id));
}

function renderHome() {
  const pseudoInput = $("#home-pseudo");
  if (pseudoInput && document.activeElement !== pseudoInput) {
    pseudoInput.value = state.user?.pseudo || "";
  }
  updateHomeHeroImage();
  renderJuneGiftButton();
  if (db && state.user?.id && !state.juneGift.loading && Date.now() - Number(state.juneGift.loadedAt || 0) > 45000) {
    loadJuneGiftState();
  }
}

function renderJuneGiftButton() {
  const button = $("#claim-june-gift");
  if (!button) return;
  const show = Boolean(state.juneGift.available && !state.juneGift.claimed);
  button.classList.toggle("hidden", !show);
  button.disabled = state.juneGift.loading;
  button.innerHTML = `
    <span>${state.juneGift.loading ? "Réclamation..." : `Réclamer ${JUNE_GIFT_AMOUNT} pièces`}</span>
    <small>Cadeau du 5 juin seulement</small>
  `;
}

async function loadJuneGiftState() {
  if (!db || !state.user?.id || state.juneGift.loading) return;
  state.juneGift.loading = true;
  try {
    const { data, error } = await db.rpc("get_june_5_gift_state_rpc");
    if (error) {
      if (!isMissingRpc(error)) console.warn("June gift state failed:", error);
      state.juneGift.available = false;
      state.juneGift.claimed = true;
      state.juneGift.loadedAt = Date.now();
      return;
    }
    state.juneGift.available = Boolean(data?.available);
    state.juneGift.claimed = Boolean(data?.claimed);
    state.juneGift.loadedAt = Date.now();
  } finally {
    state.juneGift.loading = false;
    renderJuneGiftButton();
  }
}

function playJuneGiftSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    [523, 659, 784, 1046].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index % 2 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, now + index * .075);
      gain.gain.exponentialRampToValueAtTime(.08, now + index * .075 + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, now + index * .075 + .28);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now + index * .075);
      oscillator.stop(now + index * .075 + .3);
    });
    setTimeout(() => ctx.close().catch(() => {}), 850);
  } catch (error) {
    console.warn("Gift sound unavailable:", error);
  }
}

function showJuneGiftPopup(amount = JUNE_GIFT_AMOUNT) {
  $(".june-gift-toast")?.remove();
  playJuneGiftSound();
  const modal = document.createElement("div");
  modal.className = "june-gift-toast";
  modal.innerHTML = `
    <div class="june-gift-panel" role="status" aria-live="polite">
      <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
      <span class="june-gift-coin"><img src="./Boutique/piece.png" alt="" /></span>
      <div>
        <span>Cadeau réclamé</span>
        <strong>+${Number(amount || JUNE_GIFT_AMOUNT)} pièces</strong>
        <small>Elles ont été ajoutées à ton compte.</small>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.remove(), 3200);
}

async function claimJuneGift() {
  if (!db || !state.user?.id || state.juneGift.loading || !state.juneGift.available || state.juneGift.claimed) return;
  state.juneGift.loading = true;
  renderJuneGiftButton();
  try {
    const { data, error } = await db.rpc("claim_june_5_gift_rpc");
    if (error) {
      const message = String(error.message || "");
      if (isMissingRpc(error)) showMessage("Lance le SQL du cadeau dans Supabase avant de le réclamer.");
      else if (message.includes("gift_not_available")) showMessage("Ce cadeau est disponible uniquement le 5 juin 2026.");
      else if (message.includes("gift_already_claimed")) showMessage("Tu as déjà réclamé ce cadeau.");
      else showMessage("Cadeau impossible à réclamer: " + (error.message || "erreur inconnue"));
      state.juneGift.loading = false;
      await loadJuneGiftState();
      return;
    }
    if (data?.profile) applyProfileToUser(data.profile);
    state.juneGift.available = false;
    state.juneGift.claimed = true;
    state.juneGift.loadedAt = Date.now();
    renderAccountLabel();
    renderJuneGiftButton();
    showJuneGiftPopup(Number(data?.coins || JUNE_GIFT_AMOUNT));
  } finally {
    state.juneGift.loading = false;
    renderJuneGiftButton();
  }
}

function updateHomeHeroImage() {
  const hero = $(".hero");
  if (!hero) return;
  const slide = (Math.max(0, state.homeHero.index) % 3) + 1;
  hero.style.setProperty("--hero-image", `url("./Image%20site/lobby${slide}.png")`);
}

function startHomeHeroSlideshow() {
  clearInterval(state.homeHero.timer);
  updateHomeHeroImage();
  state.homeHero.timer = setInterval(() => {
    state.homeHero.index = (state.homeHero.index + 1) % 3;
    updateHomeHeroImage();
  }, 5000);
}

function stopHomeHeroSlideshow() {
  clearInterval(state.homeHero.timer);
  state.homeHero.timer = null;
}

async function openShop() {
  const modal = $("#shop-modal");
  if (!modal) return;
  renderShop();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  await refreshProfile();
  renderShop();
}

function closeShop() {
  const modal = $("#shop-modal");
  if (!modal) return;
  closeShopWeaponPreview();
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function closeTransientModals() {
  closeShop();
  closeLuckyWheel();
  closeLiarsProfile();
  closeAfkHostPrompt();
  closeModeRules();
  closeLiarsModeModal();
  closeDead21DeckReview();
  $$(".dead21-announce-popover").forEach((element) => element.remove());
  state.liars.deadSelectedCardId = "";
  state.liars.deadSelectedAnnounce = null;
}

function isMobilePresenceDevice() {
  const coarsePointer = window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches;
  const smallViewport = Math.min(window.innerWidth || 0, window.innerHeight || 0) <= 820;
  const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
  return Boolean(mobileAgent || (coarsePointer && smallViewport));
}

const PRESENCE_AWAY_PROMPT_MS = 8000;
const PRESENCE_AWAY_KICK_GRACE_MS = 20000;

function presenceDeviceType() {
  return isMobilePresenceDevice() ? "mobile" : "desktop";
}

function liarsAntiAfkEnabled() {
  return state.game !== "liars" || state.settings.liars?.antiAfkEnabled !== false;
}

function updatePresenceCountdown() {
  const counter = $("#presence-countdown");
  if (!counter || !state.presence.kickDeadline) return;
  const secondsLeft = Math.max(0, Math.ceil((state.presence.kickDeadline - Date.now()) / 1000));
  counter.textContent = String(secondsLeft);
}

function enforcePresenceKickDeadline() {
  if (!state.presence.promptOpen || !state.presence.kickDeadline) return false;
  if (Date.now() < state.presence.kickDeadline) return false;
  if (!liarsAntiAfkEnabled()) {
    closePresencePrompt();
    sendPresenceSignal();
    return false;
  }
  closePresencePrompt();
  leaveCurrentRoom();
  return true;
}

function schedulePresenceKick(deadline) {
  state.presence.kickDeadline = Number(deadline || 0);
  clearTimeout(state.presence.kickTimer);
  clearInterval(state.presence.countdownTimer);
  updatePresenceCountdown();
  const delay = Math.max(0, state.presence.kickDeadline - Date.now());
  state.presence.kickTimer = setTimeout(enforcePresenceKickDeadline, delay);
  state.presence.countdownTimer = setInterval(() => {
    updatePresenceCountdown();
    enforcePresenceKickDeadline();
  }, 250);
}

function showPresencePrompt(kickDeadline = Date.now() + PRESENCE_AWAY_KICK_GRACE_MS) {
  if (!state.currentRoomId || state.presence.promptOpen) return;
  const modal = $("#presence-modal");
  if (!modal) return;
  state.presence.promptOpen = true;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  schedulePresenceKick(kickDeadline);
}

function clearPresenceKickTimers() {
  clearTimeout(state.presence.kickTimer);
  clearInterval(state.presence.countdownTimer);
  state.presence.kickTimer = null;
  state.presence.countdownTimer = null;
  state.presence.kickDeadline = 0;
}

function clearLocalRoomSession() {
  if (state.roomChannel) db?.removeChannel(state.roomChannel);
  if (state.roomStateChannel) db?.removeChannel(state.roomStateChannel);
  clearRoomSession();
  stopLobbyRefresh();
  stopPresenceHeartbeat();
  state.currentRoomId = "";
  state.roomCode = "";
  state.roomHostId = "";
  state.roomStatus = "lobby";
  state.roomChannel = null;
  state.roomStateChannel = null;
  state.roomStateLive = false;
  resetCurrentPlayer();
  go("home");
}

function closePresencePrompt() {
  const modal = $("#presence-modal");
  if (!modal) return;
  clearPresenceKickTimers();
  state.presence.promptOpen = false;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function isPresenceRoomScreen() {
  return Boolean(state.currentRoomId && state.user?.id && ["lobby", "liars-game", "who-game", "true-game", "photo-game", "end"].includes(state.screen));
}

async function sendPresenceSignal() {
  if (!db || !isPresenceRoomScreen() || state.presence.heartbeatBusy || document.visibilityState === "hidden") return;
  state.presence.heartbeatBusy = true;
  try {
    const { error } = await db.rpc("update_player_presence_rpc", {
      p_room_id: state.currentRoomId,
      p_presence_device: presenceDeviceType(),
    });
    if (error && isMissingRpc(error)) {
      const fallback = await db
        .from("room_players")
        .update({ last_seen_at: new Date().toISOString(), presence_device: presenceDeviceType() })
        .eq("room_id", state.currentRoomId)
        .eq("user_id", state.user.id);
      if (fallback.error && String(fallback.error.message || "").includes("presence_device")) {
        await db
          .from("room_players")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("room_id", state.currentRoomId)
          .eq("user_id", state.user.id);
      }
    } else if (error) {
      console.warn("Presence heartbeat failed:", error.message || error);
    }
  } catch (error) {
    console.warn("Presence heartbeat failed:", error);
  } finally {
    state.presence.heartbeatBusy = false;
  }
}

async function cleanupStalePresencePlayers() {
  if (!db || !isPresenceRoomScreen() || state.presence.cleanupBusy || document.visibilityState === "hidden") return;
  state.presence.cleanupBusy = true;
  try {
    const isLiarsRoom = state.game === "liars";
    const { data, error } = isLiarsRoom
      ? await db.rpc("check_liars_inactivity_rpc", {
        p_room_id: state.currentRoomId,
        p_stale_after_seconds: Math.ceil((PRESENCE_AWAY_PROMPT_MS + PRESENCE_AWAY_KICK_GRACE_MS) / 1000),
      })
      : await db.rpc("cleanup_stale_room_players_rpc", {
        p_room_id: state.currentRoomId,
        p_stale_after_seconds: Math.ceil((PRESENCE_AWAY_PROMPT_MS + PRESENCE_AWAY_KICK_GRACE_MS) / 1000),
        p_mobile_only: true,
      });
    if (error) {
      if (!isMissingRpc(error)) console.warn("Presence cleanup failed:", error.message || error);
      if (isLiarsRoom && isMissingRpc(error)) {
        await cleanupStalePresencePlayersFallback();
      }
      return;
    }
    const deletedIds = Array.isArray(data) ? data : Array.isArray(data?.deleted) ? data.deleted : [];
    const prompts = Array.isArray(data?.prompts) ? data.prompts : [];
    if (isRoomHost() && prompts.length) showAfkHostPrompt(prompts[0]);
    await loadCurrentRoom();
    await loadRoomPlayers();
    if (state.game === "liars" && isRoomHost() && deletedIds.length) {
      for (const playerId of deletedIds) {
        if (isLiarsDead21Mode()) await applyDead21ForfeitBeforeLeave(playerId, { silent: true });
        else await applyLiarsForfeitBeforeLeave(playerId);
      }
      await loadCurrentRoom();
      await loadRoomPlayers();
    }
  } catch (error) {
    console.warn("Presence cleanup failed:", error);
  } finally {
    state.presence.cleanupBusy = false;
  }
}

async function cleanupStalePresencePlayersFallback() {
  const { data, error } = await db.rpc("cleanup_stale_room_players_rpc", {
    p_room_id: state.currentRoomId,
    p_stale_after_seconds: Math.ceil((PRESENCE_AWAY_PROMPT_MS + PRESENCE_AWAY_KICK_GRACE_MS) / 1000),
    p_mobile_only: true,
  });
  if (error) {
    if (!isMissingRpc(error)) console.warn("Presence fallback cleanup failed:", error.message || error);
    return;
  }
  if (state.game === "liars" && isRoomHost() && Array.isArray(data) && data.length) {
    for (const playerId of data) {
      if (isLiarsDead21Mode()) await applyDead21ForfeitBeforeLeave(playerId, { silent: true });
      else await applyLiarsForfeitBeforeLeave(playerId);
    }
  }
}

function showAfkHostPrompt(prompt) {
  if (!prompt?.id || state.presence.hostPromptId === prompt.id) return;
  state.presence.hostPromptId = prompt.id;
  const modal = $("#afk-host-modal");
  if (!modal) return;
  $("#afk-host-text").textContent = `Le joueur ${cleanText(prompt.pseudo || "Joueur")} est inactif. Que voulez-vous faire ?`;
  modal.dataset.promptId = prompt.id;
  modal.dataset.targetId = prompt.userId || prompt.user_id || "";
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeAfkHostPrompt() {
  const modal = $("#afk-host-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  modal.dataset.promptId = "";
  modal.dataset.targetId = "";
}

async function respondAfkPrompt(action) {
  const modal = $("#afk-host-modal");
  const promptId = modal?.dataset.promptId || "";
  const targetId = modal?.dataset.targetId || "";
  if (!promptId || !targetId || !db || !state.currentRoomId) return;
  closeAfkHostPrompt();
  if (action === "kick") {
    if (isLiarsDead21Mode()) await applyDead21ForfeitBeforeLeave(targetId, { silent: true });
    else await applyLiarsForfeitBeforeLeave(targetId);
  }
  const { error } = await db.rpc("respond_liars_inactivity_rpc", {
    p_room_id: state.currentRoomId,
    p_prompt_id: promptId,
    p_target_user_id: targetId,
    p_action: action,
  });
  if (error && !isMissingRpc(error)) showMessage("Action Anti-AFK impossible: " + (error.message || "erreur inconnue"));
  await loadCurrentRoom();
  await loadRoomPlayers();
}

function startPresenceHeartbeat() {
  clearInterval(state.presence.timer);
  clearInterval(state.presence.cleanupTimer);
  sendPresenceSignal();
  cleanupStalePresencePlayers();
  state.presence.timer = setInterval(sendPresenceSignal, 8000);
  state.presence.cleanupTimer = setInterval(cleanupStalePresencePlayers, 4000);
}

function stopPresenceHeartbeat() {
  clearInterval(state.presence.timer);
  clearInterval(state.presence.cleanupTimer);
  clearPresenceKickTimers();
  state.presence.timer = null;
  state.presence.cleanupTimer = null;
  state.presence.hiddenAt = 0;
  state.presence.promptOpen = false;
  closePresencePrompt();
}

function markPresenceAway() {
  if (!isMobilePresenceDevice()) return;
  if (isPresenceRoomScreen()) state.presence.hiddenAt = Date.now();
}

async function handlePresenceReturn() {
  if (!isMobilePresenceDevice()) return;
  if (enforcePresenceKickDeadline()) return;
  if (!isPresenceRoomScreen()) return;
  if (!liarsAntiAfkEnabled()) {
    state.presence.hiddenAt = 0;
    closePresencePrompt();
    await sendPresenceSignal();
    return;
  }
  const awayMs = state.presence.hiddenAt ? Date.now() - state.presence.hiddenAt : 0;
  const kickDeadline = state.presence.hiddenAt + PRESENCE_AWAY_PROMPT_MS + PRESENCE_AWAY_KICK_GRACE_MS;
  state.presence.hiddenAt = 0;
  if (awayMs >= PRESENCE_AWAY_PROMPT_MS + PRESENCE_AWAY_KICK_GRACE_MS) {
    await leaveCurrentRoom();
    return;
  }
  if (awayMs >= PRESENCE_AWAY_PROMPT_MS) {
    showPresencePrompt(kickDeadline);
    return;
  }
  await sendPresenceSignal();
}

async function confirmPresenceStillHere() {
  closePresencePrompt();
  await sendPresenceSignal();
  await loadCurrentRoom();
  await loadRoomPlayers();
}

function renderShop() {
  const content = $("#shop-content");
  if (!content || !state.user) return;
  $("#shop-coins").textContent = Number(state.user.coins || 0);
  content.innerHTML = `
    <section class="shop-section">
      <h3>Skins de revolver</h3>
      <div class="shop-grid">
        ${renderDefaultWeaponCard()}
        ${WEAPON_SKINS.map(renderWeaponShopCard).join("")}
      </div>
    </section>
    <section class="shop-section">
      <h3>Skins de pseudo</h3>
      <div class="shop-grid">
        ${renderNormalNameCard()}
        ${NAME_SKINS.map(renderNameShopCard).join("")}
      </div>
    </section>
    <section class="shop-section">
      <h3>Jetons de mort</h3>
      <div class="shop-grid">
        ${renderDefaultDeathCard()}
        ${DEATH_SKINS.map(renderDeathShopCard).join("")}
      </div>
    </section>
  `;
}

function shopActionState(kind, skinId, price) {
  const owned = kind === "weapon"
    ? state.user.ownedWeaponSkins?.includes(skinId)
    : kind === "death"
      ? state.user.ownedDeathSkins?.includes(skinId)
      : state.user.ownedNameSkins?.includes(skinId);
  const equipped = kind === "weapon"
    ? state.user.equippedWeaponSkin === skinId
    : kind === "death"
      ? state.user.equippedDeathSkin === skinId
      : state.user.equippedNameSkin === skinId;
  const affordable = Number(state.user.coins || 0) >= price;
  return { owned, equipped, affordable };
}

function shopCardClasses(status) {
  return [
    "shop-card",
    status.equipped ? "equipped" : "",
    status.owned ? "owned" : "",
    !status.owned && !status.affordable ? "cant-afford" : "",
  ].filter(Boolean).join(" ");
}

function renderShopPrice(skin, status) {
  if (status.equipped) return `<small class="shop-badge equipped">Équipé</small>`;
  if (status.owned) return `<small class="shop-badge owned">Acheté</small>`;
  return `<div class="shop-price ${status.affordable ? "" : "cant-afford"}"><span>${skin.price}</span><img src="./Boutique/piece.png" alt="" /></div>`;
}

function isShopSkinSellable(skin, status) {
  return Boolean(skin?.id && status?.owned && Number(skin.price || 0) > 0 && Number(skin.price || 0) <= 1000);
}

function renderSellButton(kind, skin, status) {
  if (!isShopSkinSellable(skin, status)) return "";
  const refund = Math.floor(Number(skin.price || 0) / 2);
  return `<button class="shop-sell-button" type="button" data-shop-action="sell">Revendre +${refund}<img src="./Boutique/piece.png" alt="" /></button>`;
}

function renderWeaponShopCard(skin) {
  const status = shopActionState("weapon", skin.id, skin.price);
  const action = status.equipped ? "equipped" : status.owned ? "equip" : "buy";
  const disabled = status.equipped || (!status.owned && !status.affordable);
  return `
    <article class="${shopCardClasses(status)}" data-shop-kind="weapon" data-shop-id="${skin.id}">
      <button class="shop-card-media shop-preview-trigger" type="button" data-shop-preview="weapon" aria-label="Voir ${escapeAttr(skin.name)} en grand">
        <img src="./Boutique/${skin.file}" alt="${escapeAttr(skin.name)}" />
      </button>
      <strong>${cleanText(skin.name)}</strong>
      ${renderShopPrice(skin, status)}
      <button type="button" data-shop-action="${action}" ${disabled ? "disabled" : ""}>${status.equipped ? "Équipé" : status.owned ? "Équiper" : "Acheter"}</button>
      ${renderSellButton("weapon", skin, status)}
    </article>
  `;
}

function renderDefaultWeaponCard() {
  const equipped = !state.user.equippedWeaponSkin;
  return `
    <article class="shop-card ${equipped ? "equipped" : "owned"}" data-shop-kind="weapon" data-shop-id="">
      <button class="shop-card-media shop-preview-trigger" type="button" data-shop-preview="weapon" aria-label="Voir le revolver par défaut en grand">
        <img src="${DEFAULT_WEAPON_IMAGE}" alt="Revolver par defaut" onerror="this.onerror=null;this.src='./Image%20liarsbar/roulette.png';" />
      </button>
      <strong>Défaut</strong>
      <div class="shop-price free"><span>Gratuit</span></div>
      <small class="shop-badge ${equipped ? "equipped" : "owned"}">${equipped ? "Équipé" : "Possédé"}</small>
      <button type="button" data-shop-action="${equipped ? "equipped" : "equip"}" ${equipped ? "disabled" : ""}>${equipped ? "Équipé" : "Équiper"}</button>
    </article>
  `;
}

function renderNameShopCard(skin) {
  const status = shopActionState("name", skin.id, skin.price);
  const action = status.equipped ? "equipped" : status.owned ? "equip" : "buy";
  const disabled = status.equipped || (!status.owned && !status.affordable);
  return `
    <article class="${shopCardClasses(status)}" data-shop-kind="name" data-shop-id="${skin.id}">
      <button class="shop-card-media name-preview shop-preview-trigger" type="button" data-shop-preview="name" aria-label="Voir ${escapeAttr(skin.name)} en grand">${renderName(state.user.pseudo || "Thomas", skin.id)}</button>
      <strong>${cleanText(skin.name)}</strong>
      ${renderShopPrice(skin, status)}
      <button type="button" data-shop-action="${action}" ${disabled ? "disabled" : ""}>${status.equipped ? "Équipé" : status.owned ? "Équiper" : "Acheter"}</button>
      ${renderSellButton("name", skin, status)}
    </article>
  `;
}

function renderDeathShopCard(skin) {
  const status = shopActionState("death", skin.id, skin.price);
  const action = status.equipped ? "equipped" : status.owned ? "equip" : "buy";
  const disabled = status.equipped || (!status.owned && !status.affordable);
  return `
    <article class="${shopCardClasses(status)}" data-shop-kind="death" data-shop-id="${skin.id}">
      <button class="shop-card-media death-preview shop-preview-trigger" type="button" data-shop-preview="death" aria-label="Voir ${escapeAttr(skin.name)} en grand">
        <img src="./Boutique/${skin.file}" alt="${escapeAttr(skin.name)}" />
      </button>
      <strong>${cleanText(skin.name)}</strong>
      ${renderShopPrice(skin, status)}
      <button type="button" data-shop-action="${action}" ${disabled ? "disabled" : ""}>${status.equipped ? "Équipé" : status.owned ? "Équiper" : "Acheter"}</button>
      ${renderSellButton("death", skin, status)}
    </article>
  `;
}

function renderNormalNameCard() {
  const equipped = !state.user.equippedNameSkin;
  return `
    <article class="shop-card ${equipped ? "equipped" : "owned"}" data-shop-kind="name" data-shop-id="">
      <button class="shop-card-media name-preview shop-preview-trigger" type="button" data-shop-preview="name" aria-label="Voir le pseudo normal en grand">${renderName(state.user.pseudo || "Thomas", null)}</button>
      <strong>Pseudo normal</strong>
      <div class="shop-price free"><span>Gratuit</span></div>
      <small class="shop-badge ${equipped ? "equipped" : "owned"}">${equipped ? "Équipé" : "Possédé"}</small>
      <button type="button" data-shop-action="${equipped ? "equipped" : "equip"}" ${equipped ? "disabled" : ""}>${equipped ? "Équipé" : "Équiper"}</button>
    </article>
  `;
}

function renderDefaultDeathCard() {
  const equipped = !state.user.equippedDeathSkin;
  return `
    <article class="shop-card ${equipped ? "equipped" : "owned"}" data-shop-kind="death" data-shop-id="">
      <button class="shop-card-media death-preview shop-preview-trigger" type="button" data-shop-preview="death" aria-label="Voir le jeton normal en grand">
        <img src="${cardImage("Mort")}" alt="Jeton de mort par défaut" />
      </button>
      <strong>Jeton normal</strong>
      <div class="shop-price free"><span>Gratuit</span></div>
      <small class="shop-badge ${equipped ? "equipped" : "owned"}">${equipped ? "Équipé" : "Possédé"}</small>
      <button type="button" data-shop-action="${equipped ? "equipped" : "equip"}" ${equipped ? "disabled" : ""}>${equipped ? "Équipé" : "Équiper"}</button>
    </article>
  `;
}

function shopWeaponPreviewData(skinId) {
  if (!skinId) {
    return { name: "Défaut", file: DEFAULT_WEAPON_IMAGE };
  }
  const skin = WEAPON_SKINS.find((item) => item.id === skinId);
  return skin ? { name: skin.name, file: `./Boutique/${skin.file}` } : null;
}

function shopPreviewData(kind, skinId) {
  if (kind === "weapon") return shopWeaponPreviewData(skinId);
  if (kind === "death") {
    if (!skinId) return { name: "Jeton normal", file: cardImage("Mort") };
    const skin = DEATH_SKINS.find((item) => item.id === skinId);
    return skin ? { name: skin.name, file: `./Boutique/${skin.file}` } : null;
  }
  if (kind === "name") {
    if (!skinId) return { name: "Pseudo normal", nameSkin: null };
    const skin = NAME_SKINS.find((item) => item.id === skinId);
    return skin ? { name: skin.name, nameSkin: skin.id } : null;
  }
  return null;
}

function openShopItemPreview(card) {
  const kind = card?.dataset.shopKind || "weapon";
  const preview = shopPreviewData(kind, card?.dataset.shopId || "");
  if (!preview) return;
  closeShopWeaponPreview();
  const modal = document.createElement("div");
  modal.className = "shop-preview-modal";
  modal.id = "shop-preview-modal";
  const media = preview.nameSkin !== undefined
    ? `<div class="shop-preview-name">${renderName(state.user?.pseudo || "Thomas", preview.nameSkin)}</div>`
    : `<img src="${escapeAttr(preview.file)}" alt="${escapeAttr(preview.name)}" onerror="this.onerror=null;this.src='./Image%20liarsbar/roulette.png';" />`;
  modal.innerHTML = `
    <div class="shop-preview-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(preview.name)}">
      <button class="icon-btn shop-preview-close" type="button" aria-label="Fermer">×</button>
      ${media}
      <strong>${cleanText(preview.name)}</strong>
    </div>
  `;
  document.body.appendChild(modal);
}

function openBadgePreview(badgeId) {
  const badge = LIARS_BADGE_BY_ID[badgeId];
  if (!badge) return;
  const profileBadgeState = normalizeProfileBadges(state.profileModal.data?.badges || {})[badgeId]?.state;
  if (profileBadgeState === "COMPLETED_UNCLAIMED") return;
  closeShopWeaponPreview();
  const modal = document.createElement("div");
  modal.className = "shop-preview-modal badge-preview-modal";
  modal.id = "shop-preview-modal";
  modal.innerHTML = `
    <div class="shop-preview-panel badge-preview-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(badge.name)}">
      <button class="icon-btn shop-preview-close" type="button" aria-label="Fermer">×</button>
      <div class="badge-preview-image">
        <img src="./Badge/${escapeAttr(badge.image)}" alt="${escapeAttr(badge.name)}" onerror="this.remove(); this.closest('.badge-preview-image')?.classList.add('missing');" />
        <span>${cleanText(badgeInitials(badge.name))}</span>
      </div>
      <strong>${cleanText(badge.name)}</strong>
      <small>${cleanText(badge.description)}</small>
    </div>
  `;
  document.body.appendChild(modal);
}

function playBadgeClaimSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + index * .07);
      gain.gain.linearRampToValueAtTime(.06, now + index * .07 + .018);
      gain.gain.exponentialRampToValueAtTime(.001, now + index * .07 + .24);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now + index * .07);
      oscillator.stop(now + index * .07 + .26);
    });
    setTimeout(() => ctx.close().catch(() => {}), 650);
  } catch (error) {
    console.warn("Badge sound unavailable:", error);
  }
}

function showBadgeClaimPopup(badgeId) {
  const badge = LIARS_BADGE_BY_ID[badgeId];
  if (!badge) return;
  $(".badge-claim-toast")?.remove();
  playBadgeClaimSound();
  const modal = document.createElement("div");
  modal.className = "badge-claim-toast";
  modal.innerHTML = `
    <div class="badge-claim-panel" role="status" aria-live="polite">
      <i></i><i></i><i></i><i></i><i></i><i></i>
      ${renderBadgeImage(badge)}
      <div>
        <span>🏆 Badge débloqué</span>
        <strong>${cleanText(badge.name)}</strong>
        <small>${cleanText(badge.description)}</small>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.remove(), 2800);
}

function showBadgeRewardPopup(categoryId, coins = 0) {
  const category = LIARS_BADGE_CATEGORIES[categoryId] || {};
  const amount = Number(coins || category.reward || 0);
  $(".badge-claim-toast")?.remove();
  playBadgeClaimSound();
  const modal = document.createElement("div");
  modal.className = "badge-claim-toast badge-reward-toast";
  modal.innerHTML = `
    <div class="badge-claim-panel badge-reward-panel" role="status" aria-live="polite">
      <i></i><i></i><i></i><i></i><i></i><i></i>
      <span class="badge-reward-coin"><img src="./Boutique/piece.png" alt="" /></span>
      <div>
        <span>🏆 Récompense réclamée</span>
        <strong>${amount}<img class="coin-icon" src="./Boutique/piece.png" alt="" /></strong>
        <small>${cleanText(category.label || "Catégorie complétée")}</small>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.remove(), 3000);
}

function closeShopWeaponPreview() {
  const modal = $("#shop-preview-modal");
  if (!modal) return;
  state.shop.previewClosedAt = Date.now();
  modal.remove();
}

function formatWheelCountdown(seconds) {
  const total = Math.max(0, Math.ceil(Number(seconds || 0)));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}h${String(minutes).padStart(2, "0")}m`;
  }
  if (minutes > 0) {
    return `${minutes}m${String(secs).padStart(2, "0")}s`;
  }
  return `${secs} seconde${secs === 1 ? "" : "s"}`;
}

function luckyWheelRewardIndex(rewardId) {
  const normalized = rewardId === "casino_duplicate" || rewardId === "casino_zero" ? "casino_skin" : rewardId;
  return Math.max(0, LUCKY_WHEEL_REWARDS.findIndex((reward) => reward.id === normalized));
}

function ownsCasinoWheelSkin() {
  return Array.isArray(state.user?.ownedWeaponSkins) && state.user.ownedWeaponSkins.includes("revolvercasino");
}

function luckyWheelDisplayReward(reward) {
  if (reward?.id === "casino_skin" && ownsCasinoWheelSkin()) {
    return {
      ...reward,
      label: "0",
      detail: "",
      skinId: null,
      image: "./Boutique/piece.png",
      zeroPrize: true,
    };
  }
  return reward;
}

function renderLuckyWheelRewardContent(reward) {
  const image = reward.image || (reward.coins ? "./Boutique/piece.png" : "");
  return `
    <span class="lucky-wheel-prize">
      ${image ? `<img src="${escapeAttr(image)}" alt="" />` : `<span class="lucky-wheel-bonus-icon">↻</span>`}
      <strong>${cleanText(reward.label)}</strong>
      <small>${cleanText(reward.detail || "")}</small>
    </span>
  `;
}

function luckyWheelRewardImage(reward) {
  if (reward.image) return reward.image;
  if (reward.coins) return "./Boutique/piece.png";
  return "";
}

function cachedLuckyWheelImage(src) {
  if (!src) return null;
  if (luckyWheelImageCache.has(src)) return luckyWheelImageCache.get(src);
  const image = new Image();
  image.onload = () => drawLuckyWheelCanvas();
  image.onerror = () => drawLuckyWheelCanvas();
  image.src = src;
  luckyWheelImageCache.set(src, image);
  return image;
}

function drawLuckyWheelCanvas() {
  const canvas = $("#lucky-wheel-canvas");
  if (!canvas) return;
  const size = Math.max(260, Math.round(canvas.clientWidth || 390));
  const dpr = Math.max(2, Math.min(3.5, window.devicePixelRatio || 2));
  if (canvas.width !== Math.round(size * dpr) || canvas.height !== Math.round(size * dpr)) {
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size * .46;
  const innerRadius = size * .105;
  const segment = Math.PI * 2 / LUCKY_WHEEL_REWARDS.length;
  const golds = ["#d6a348", "#e7bd5d", "#c98c31", "#edc76b"];
  const darks = ["#15110c", "#1d1710"];

  ctx.save();
  ctx.translate(center, center);
  ctx.lineWidth = Math.max(8, size * .028);
  ctx.strokeStyle = "#d9a64d";
  ctx.beginPath();
  ctx.arc(0, 0, radius + ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();

  LUCKY_WHEEL_REWARDS.forEach((baseReward, index) => {
    const reward = luckyWheelDisplayReward(baseReward);
    const start = -Math.PI / 2 + index * segment;
    const end = start + segment;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    const fill = ctx.createRadialGradient(-radius * .2, -radius * .35, radius * .08, 0, 0, radius);
    if (index % 2) {
      fill.addColorStop(0, "#2b2318");
      fill.addColorStop(1, darks[index % darks.length]);
    } else {
      fill.addColorStop(0, "#ffe08a");
      fill.addColorStop(1, golds[(index / 2) % golds.length | 0]);
    }
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = "rgba(76, 47, 15, .88)";
    ctx.lineWidth = Math.max(2, size * .006);
    ctx.stroke();

    const mid = start + segment / 2;
    const labelRadius = radius * .56;
    const x = Math.cos(mid) * labelRadius;
    const y = Math.sin(mid) * labelRadius;
    const iconSize = reward.skinId ? size * .06 : size * .052;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(mid);

    const image = cachedLuckyWheelImage(luckyWheelRewardImage(reward));
    const labelFont = Math.round(size * .042);
    const detailFont = Math.round(size * .022);
    ctx.textBaseline = "middle";

    if (reward.coins) {
      ctx.fillStyle = "#fff1bc";
      ctx.font = `900 ${labelFont}px sans-serif`;
      ctx.textAlign = "left";
      ctx.lineWidth = Math.max(3, size * .01);
      ctx.strokeStyle = "rgba(5, 6, 8, .72)";
      const textX = -size * .065;
      const textY = 0;
      ctx.strokeText(reward.label, textX, textY);
      ctx.fillText(reward.label, textX, textY);
      if (image?.complete && image.naturalWidth) {
        const textWidth = ctx.measureText(reward.label).width;
        ctx.drawImage(image, textX + textWidth + size * .012, -iconSize * .36, iconSize, iconSize * .72);
      }
      ctx.restore();
      return;
    }

    if (image?.complete && image.naturalWidth) {
      ctx.drawImage(image, -iconSize / 2, -size * .07, iconSize, iconSize * .72);
    } else if (reward.bonusSpin) {
      ctx.fillStyle = "#ffe08a";
      ctx.font = `900 ${Math.round(size * .052)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("↻", 0, -size * .052);
    }

    ctx.fillStyle = "#fff1bc";
    ctx.font = `900 ${labelFont}px sans-serif`;
    ctx.textAlign = "center";
    ctx.lineWidth = Math.max(3, size * .01);
    ctx.strokeStyle = "rgba(5, 6, 8, .72)";
    ctx.strokeText(reward.label, 0, size * .012);
    ctx.fillText(reward.label, 0, size * .012);
    ctx.fillStyle = "rgba(255, 246, 220, .88)";
    ctx.font = `900 ${detailFont}px sans-serif`;
    ctx.strokeStyle = "rgba(5, 6, 8, .72)";
    ctx.lineWidth = Math.max(2, size * .006);
    ctx.strokeText(reward.detail || "", 0, size * .066);
    ctx.fillText(reward.detail || "", 0, size * .066);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
  const hub = ctx.createRadialGradient(-innerRadius * .25, -innerRadius * .35, innerRadius * .15, 0, 0, innerRadius);
  hub.addColorStop(0, "#fff4b8");
  hub.addColorStop(1, "#be792a");
  ctx.fillStyle = hub;
  ctx.fill();
  ctx.strokeStyle = "rgba(89, 55, 17, .54)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function normalizeWheelState(data) {
  const stateData = data || {};
  const profile = stateData.profile || {};
  return {
    canSpin: Boolean(stateData.canSpin),
    cooldownSeconds: Number(stateData.cooldownSeconds || stateData.cooldown_seconds || 0),
    bonusSpins: Number(stateData.bonusSpins || stateData.bonus_spins || profile.lucky_wheel_bonus_spins || 0),
    nextAvailableAt: stateData.nextAvailableAt || stateData.next_available_at || null,
    serverNow: stateData.serverNow || stateData.server_now || null,
    loading: Boolean(stateData.loading),
    error: stateData.error || "",
  };
}

function renderLuckyWheel() {
  const stage = $("#lucky-wheel-stage");
  if (!stage) return;
  const wheelState = state.luckyWheel.state || { canSpin: false, cooldownSeconds: 0, bonusSpins: 0 };
  const result = state.luckyWheel.result;
  const resultFresh = Boolean(state.luckyWheel.resultFresh);
  const hasError = Boolean(wheelState.error);
  const canSpin = Boolean(wheelState.canSpin || wheelState.bonusSpins > 0) && !hasError && !wheelState.loading && !state.luckyWheel.busy && !state.luckyWheel.spinning;
  const status = wheelState.loading
    ? "Chargement de la roue..."
    : hasError
      ? wheelState.error
      : wheelState.bonusSpins > 0
    ? `Relance disponible maintenant`
    : wheelState.canSpin
      ? "Lancer disponible maintenant"
      : `Prochain lancer disponible dans : ${formatWheelCountdown(wheelState.cooldownSeconds)}`;

  stage.innerHTML = `
    <div class="lucky-wheel-wrap">
      <i class="lucky-wheel-pointer"></i>
      <canvas class="lucky-wheel-canvas" id="lucky-wheel-canvas" width="520" height="520" style="--wheel-rotation:${state.luckyWheel.rotation}deg"></canvas>
    </div>
    <div class="lucky-wheel-status">${cleanText(status)}</div>
    ${result ? `<div class="lucky-wheel-result ${resultFresh ? "fresh" : ""}">${result.coins ? `<img src="./Boutique/piece.png" alt="" />` : ""}<strong>Vous avez gagné : ${cleanText(result.label || "Bonus")}</strong></div>` : ""}
    <div class="lucky-wheel-actions">
      <button class="primary" type="button" id="lucky-wheel-spin" ${canSpin ? "" : "disabled"}>${state.luckyWheel.spinning ? "La roue tourne..." : wheelState.bonusSpins > 0 ? "Relancer" : "Lancer"}</button>
    </div>
  `;
  state.luckyWheel.resultFresh = false;
  requestAnimationFrame(drawLuckyWheelCanvas);
}

function startLuckyWheelCountdown() {
  clearInterval(state.luckyWheel.countdownTimer);
  state.luckyWheel.countdownTimer = setInterval(() => {
    if (document.hidden) return;
    const wheelState = state.luckyWheel.state;
    if (!wheelState || wheelState.canSpin || wheelState.bonusSpins > 0) return;
    wheelState.cooldownSeconds = Math.max(0, Number(wheelState.cooldownSeconds || 0) - 1);
    if (wheelState.cooldownSeconds <= 0) wheelState.canSpin = true;
    renderLuckyWheel();
  }, 1000);
}

async function refreshLuckyWheelState() {
  if (!db || !state.user?.id) return;
  const { data, error } = await db.rpc("get_lucky_wheel_state_rpc");
  if (error) {
    state.luckyWheel.state = normalizeWheelState({
      canSpin: false,
      cooldownSeconds: 0,
      bonusSpins: 0,
      error: isMissingRpc(error)
        ? "Roue prête visuellement. Lance le SQL Supabase de la roue pour activer les lancers."
        : `Roue indisponible : ${error.message || "erreur inconnue"}`,
    });
    renderLuckyWheel();
    return;
  }
  state.luckyWheel.state = normalizeWheelState(data);
  state.luckyWheel.result = null;
  startLuckyWheelCountdown();
  renderLuckyWheel();
}

async function openLuckyWheel() {
  if (!requireSignedIn()) return;
  if (!(await ensureSupabaseClient())) {
    authUnavailable();
    return;
  }
  const modal = $("#lucky-wheel-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  state.luckyWheel.result = null;
  state.luckyWheel.state = normalizeWheelState({ loading: true });
  renderLuckyWheel();
  await refreshLuckyWheelState();
}

function closeLuckyWheel() {
  const modal = $("#lucky-wheel-modal");
  if (!modal) return;
  clearInterval(state.luckyWheel.countdownTimer);
  state.luckyWheel.countdownTimer = null;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function playWheelTickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const tick = (delay, frequency, duration = .025) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = frequency;
      gain.gain.value = .035;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + delay + duration);
      osc.stop(ctx.currentTime + delay + duration);
    };
    for (let index = 0; index < 36; index += 1) tick(index * .115, 760 + (index % 2) * 80);
    setTimeout(() => {
      tick(0, 520, .08);
      tick(.1, 760, .1);
      tick(.22, 1040, .14);
      setTimeout(() => ctx.close?.(), 650);
    }, 5050);
  } catch (error) {
    console.warn("Lucky wheel sound failed:", error);
  }
}

async function spinLuckyWheel() {
  if (state.luckyWheel.busy || state.luckyWheel.spinning) return;
  state.luckyWheel.busy = true;
  state.luckyWheel.result = null;
  renderLuckyWheel();
  const { data, error } = await db.rpc("spin_lucky_wheel_rpc");
  state.luckyWheel.busy = false;
  if (error) {
    if (String(error.message || "").includes("wheel_cooldown")) {
      await refreshLuckyWheelState();
      return;
    }
    showMessage("Lancer impossible: " + (error.message || "erreur inconnue"));
    renderLuckyWheel();
    return;
  }

  const result = data || {};
  const rewardIndex = luckyWheelRewardIndex(result.rewardId || result.reward_id);
  const segmentCenter = rewardIndex * 45 + 22.5;
  const nextRotation = state.luckyWheel.rotation + 1800 + (360 - segmentCenter);
  state.luckyWheel.spinning = true;
  renderLuckyWheel();
  requestAnimationFrame(() => {
    state.luckyWheel.rotation = nextRotation;
    $("#lucky-wheel-canvas")?.style.setProperty("--wheel-rotation", `${nextRotation}deg`);
    playWheelTickSound();
  });
  setTimeout(async () => {
    state.luckyWheel.spinning = false;
    state.luckyWheel.result = {
      id: result.rewardId || result.reward_id,
      label: result.label || "Bonus",
      coins: Number(result.coins || 0),
      skinId: result.skinId || result.skin_id || null,
    };
    state.luckyWheel.resultFresh = true;
    if (result.profile) applyProfileToUser(result.profile);
    await refreshProfile();
    state.luckyWheel.state = normalizeWheelState(result.state || result);
    startLuckyWheelCountdown();
    renderLuckyWheel();
  }, 5200);
}

async function refreshProfile() {
  if (!state.user?.id) return null;
  const profile = await loadProfile({ id: state.user.id });
  if (profile) applyProfileToUser(profile);
  renderAccountLabel();
  renderHome();
  if (state.screen === "lobby") renderLobby();
  return profile;
}

async function handleShopCard(card, requestedAction = "") {
  if (!card || state.shop.busy) return;
  const kind = card.dataset.shopKind;
  const skinId = card.dataset.shopId || null;
  const action = requestedAction || card.querySelector("[data-shop-action]")?.dataset.shopAction;
  if (!kind || action === "equipped") return;

  const skin = kind === "weapon"
    ? WEAPON_SKINS.find((item) => item.id === skinId)
    : kind === "death"
      ? DEATH_SKINS.find((item) => item.id === skinId)
      : NAME_SKINS.find((item) => item.id === skinId);
  if (action === "buy" && skin && Number(state.user.coins || 0) < skin.price) {
    showMessage("Pas assez de pièces");
    return;
  }
  if (action === "buy" && skin) {
    const confirmed = window.confirm(`Voulez-vous vraiment acheter ${skin.name} pour ${skin.price} pièces ?`);
    if (!confirmed) return;
  }
  if (action === "sell" && skin) {
    const refund = Math.floor(Number(skin.price || 0) / 2);
    const confirmed = window.confirm(`Voulez-vous vraiment revendre ${skin.name} pour ${refund} pièces ?`);
    if (!confirmed) return;
  }

  state.shop.busy = true;
  try {
    const rpcName = action === "buy" ? "buy_shop_item_rpc" : action === "sell" ? "sell_shop_item_rpc" : "equip_shop_item_rpc";
    const { data, error } = await db.rpc(rpcName, { p_kind: kind, p_skin_id: skinId });
    if (error) {
      if (isMissingRpc(error)) showMessage("Lance le SQL boutique dans Supabase avant d'utiliser la boutique.");
      else if (String(error.message || "").includes("not_enough_coins")) showMessage("Pas assez de pièces");
      else if (String(error.message || "").includes("skin_not_sellable")) showMessage("Ce skin ne peut pas être revendu.");
      else if (String(error.message || "").includes("skin_not_owned")) showMessage("Tu ne possèdes pas ce skin.");
      else showMessage("Action boutique impossible: " + (error.message || "erreur inconnue"));
      return;
    }
    applyProfileToUser(Array.isArray(data) ? data[0] : data);
    await refreshProfile();
    if (state.currentRoomId) {
      await syncCurrentPlayerProfile();
      await loadRoomPlayers();
    }
    renderShop();
  } finally {
    state.shop.busy = false;
  }
}

function authUnavailable() {
  setNotice(hasSupabaseConfig()
    ? "Connexion impossible: le service de compte ne s'est pas charge. Recharge la page."
    : "Connexion indisponible : la configuration du service de compte est absente ou invalide.");
}

function isMissingRpc(error) {
  return error?.code === "PGRST202" || String(error?.message || "").includes("Could not find the function");
}

function loadSupabaseScript() {
  return new Promise((resolve) => {
    if (window.supabase) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.min.js";
    script.onload = () => resolve(Boolean(window.supabase));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

async function ensureSupabaseClient() {
  if (db) return true;
  if (!hasSupabaseConfig()) return false;
  const loaded = await loadSupabaseScript();
  if (!loaded || !window.supabase) return false;
  db = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  return true;
}

async function saveProfile(user, pseudo) {
  if (!db || !user?.id) return null;
  const cleanPseudo = cleanText(pseudo || user.user_metadata?.pseudo || user.email?.split("@")[0], "Joueur");
  try {
    await db.auth.updateUser({ data: { pseudo: cleanPseudo } });
  } catch (error) {
    console.warn("Auth pseudo update failed:", error);
  }
  const { data, error } = await db
    .from("profiles")
    .upsert({ id: user.id, pseudo: cleanPseudo }, { onConflict: "id" })
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    if (!String(error.message || "").includes("coins") && !String(error.message || "").includes("owned_weapon_skins") && !String(error.message || "").includes("owned_death_skins") && !String(error.message || "").includes("lucky_wheel")) {
      console.warn("Profile save failed:", error.message);
      return null;
    }
    const fallback = await db
      .from("profiles")
      .upsert({ id: user.id, pseudo: cleanPseudo }, { onConflict: "id" })
      .select("id,pseudo")
      .single();
    if (fallback.error) {
      console.warn("Profile save failed:", fallback.error.message);
      return null;
    }
    return { ...DEFAULT_PROFILE_SHOP, ...fallback.data };
  }
  return data;
}

async function syncCurrentPlayerProfile() {
  if (!db || !state.currentRoomId || !state.user?.id) return;
  const { error } = await db
    .from("room_players")
    .update({
      pseudo: state.user.pseudo,
      weapon_skin: state.user.equippedWeaponSkin || null,
      name_skin: state.user.equippedNameSkin || null,
      death_skin: state.user.equippedDeathSkin || null,
      presence_device: presenceDeviceType(),
      last_seen_at: new Date().toISOString(),
    })
    .eq("room_id", state.currentRoomId)
    .eq("user_id", state.user.id);
  if (error && (String(error.message || "").includes("presence_device") || String(error.message || "").includes("death_skin"))) {
    const fallback = await db
      .from("room_players")
      .update({
        pseudo: state.user.pseudo,
        weapon_skin: state.user.equippedWeaponSkin || null,
        name_skin: state.user.equippedNameSkin || null,
        last_seen_at: new Date().toISOString(),
      })
      .eq("room_id", state.currentRoomId)
      .eq("user_id", state.user.id);
    if (fallback.error) console.warn("Room player profile sync failed:", fallback.error.message || fallback.error);
  } else if (error) {
    console.warn("Room player profile sync failed:", error.message || error);
  }
}

async function loadProfile(user) {
  if (!db || !user?.id) return null;
  const { data, error } = await db
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    if (!String(error.message || "").includes("coins") && !String(error.message || "").includes("owned_weapon_skins") && !String(error.message || "").includes("owned_death_skins") && !String(error.message || "").includes("lucky_wheel")) {
      console.warn("Profile load failed:", error.message);
      return null;
    }
    const fallback = await db
      .from("profiles")
      .select("id,pseudo")
      .eq("id", user.id)
      .maybeSingle();
    if (fallback.error) {
      console.warn("Profile load failed:", fallback.error.message);
      return null;
    }
    return { ...DEFAULT_PROFILE_SHOP, ...fallback.data };
  }
  return data;
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";
  $("#pseudo-field").classList.toggle("hidden", !isSignup);
  $("#pseudo").required = isSignup;
  $("#auth-submit").textContent = isSignup ? "Creer mon compte" : "Connexion";
  $$(".auth-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });
  setNotice(isSignup ? "Pseudo, email et mot de passe requis." : "Email et mot de passe suffisent.");
}

async function authWithPassword(action) {
  const pseudo = cleanText($("#pseudo").value);
  const email = cleanText($("#email").value).toLowerCase();
  const password = $("#password").value;

  if (!email || password.length < 8 || (action === "signup" && !pseudo)) {
    setNotice(action === "signup"
      ? "Pseudo, email valide et mot de passe de 8 caracteres minimum requis."
      : "Email valide et mot de passe de 8 caracteres minimum requis.");
    return;
  }

  if (!(await ensureSupabaseClient())) {
    authUnavailable();
    return;
  }

  const method = action === "signup" ? "signUp" : "signInWithPassword";
  const payload = { email, password };
  if (action === "signup") {
    payload.options = {
      data: { pseudo },
      emailRedirectTo: window.location.origin,
    };
  }

  let { data, error } = await db.auth[method](payload);
  if (error) {
    setNotice("Erreur Supabase: " + error.message);
    return;
  }

  if (action === "signup" && (!data.user || !data.session)) {
    const login = await db.auth.signInWithPassword({ email, password });
    if (login.error || !login.data?.session) {
      setNotice("Compte cree. Si Supabase demande une verification email, connecte-toi apres validation.");
      return;
    }
    data = login.data;
  }

  if (!data.user || !data.session) {
    setNotice("Connexion refusee: compte introuvable ou email non confirme.");
    return;
  }

  const profile = (await loadProfile(data.user)) || (await saveProfile(data.user, pseudo || data.user.user_metadata?.pseudo));

  state.user = {
    ...normalizeProfile(profile || {}),
    id: data.user.id,
    pseudo: cleanText(profile?.pseudo || data.user.user_metadata?.pseudo, pseudo || email.split("@")[0]),
    email,
  };

  resetCurrentPlayer();
  go("home");
}

function requireSignedIn() {
  if (state.user?.id) return true;
  go("auth");
  setNotice("Connecte-toi d'abord avec un compte verifie.");
  return false;
}

function resetCurrentPlayer() {
  const pseudo = state.user?.pseudo || "Joueur";
  state.players = [{ id: state.user?.id || "me", pseudo, score: 0 }];
  if (state.players[0]) {
    state.players[0].weaponSkin = state.user?.equippedWeaponSkin || null;
    state.players[0].nameSkin = state.user?.equippedNameSkin || null;
  }
}

function isRoomHost() {
  return Boolean(state.user?.id && state.roomHostId === state.user.id);
}

function renderCurrentRoomView() {
  if (state.screen === "lobby") renderLobby();
  if (state.screen === "who-game") renderWho();
  if (state.screen === "true-game") renderTrueOnly();
  if (state.screen === "photo-game") renderPhotoRoulette();
  if (state.screen === "liars-game") renderLiars();
  if (state.screen === "blackjack-game") renderBlackjack();
  if (state.screen === "end") renderEnd();
}

function roomScreenForCurrentState() {
  if (state.roomStatus !== "playing") return "lobby";
  if (state.game === "who") return state.settings.who.state?.status === "finished" ? "end" : "who-game";
  if (state.game === "true") return state.settings.true.state?.status === "finished" ? "end" : "true-game";
  if (state.game === "photo") return state.settings.photo.state?.status === "finished" ? "end" : "photo-game";
  if (state.game === "blackjack") return state.settings.blackjack.state?.phase === "finished" ? "end" : "blackjack-game";
  if (state.game === "liars") {
    const liarsState = state.settings.liars.state;
    return liarsState?.winner || liarsState?.phase === "game_over" ? "end" : "liars-game";
  }
  return "lobby";
}

function normalizeSettings(settings = {}) {
  return {
    photo: {
      rounds: Number(settings.photo?.rounds || state.settings.photo.rounds || 10),
      state: settings.photo?.state || null,
    },
    who: {
      rounds: Number(settings.who?.rounds || state.settings.who?.rounds || 10),
      state: settings.who?.state || null,
    },
    true: {
      state: settings.true?.state || null,
    },
    blackjack: {
      state: settings.blackjack?.state || null,
    },
    liars: {
      lives: Number(settings.liars?.lives || state.settings.liars.lives || 3),
      mode: ["normal", "roulette", "chaos"].includes(settings.liars?.mode) ? settings.liars.mode : ["normal", "roulette", "chaos"].includes(state.settings.liars.mode) ? state.settings.liars.mode : "normal",
      antiAfkEnabled: settings.liars?.antiAfkEnabled !== false,
      state: settings.liars?.state || null,
      lastOrder: Array.isArray(settings.liars?.lastOrder) ? settings.liars.lastOrder : state.settings.liars?.lastOrder || [],
    },
  };
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

async function addCurrentPlayerToRoom(roomId) {
  const { error } = await db.rpc("join_room_rpc", {
    p_room_id: roomId,
    p_pseudo: state.user.pseudo,
  });

  if (error) throw error;
}

async function loadRoomPlayers() {
  if (!state.currentRoomId) return;
  let { data, error } = await db
    .from("room_players")
    .select("user_id,pseudo,score,ready,weapon_skin,name_skin,death_skin")
    .eq("room_id", state.currentRoomId)
    .order("joined_at", { ascending: true });

  if (error && (String(error.message || "").includes("joined_at") || String(error.message || "").includes("weapon_skin") || String(error.message || "").includes("name_skin") || String(error.message || "").includes("death_skin") || String(error.message || "").includes("coins"))) {
    const fallback = await db
      .from("room_players")
      .select("user_id,pseudo,score,ready")
      .eq("room_id", state.currentRoomId)
      .order("pseudo", { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    showMessage("Impossible de charger les joueurs de la partie: " + (error.message || "erreur inconnue"));
    return;
  }

  state.players = data.map((player) => ({
    id: player.user_id,
    pseudo: player.pseudo,
    score: player.score || 0,
    ready: Boolean(player.ready),
    weaponSkin: player.weapon_skin || null,
    nameSkin: player.name_skin || null,
    deathSkin: player.death_skin || null,
    coins: 0,
  }));

  if (state.players.length) {
    let coinsRows = [];
    const coinsResult = await db.rpc("get_room_player_coins_rpc", { p_room_id: state.currentRoomId });
    if (!coinsResult.error) {
      coinsRows = coinsResult.data || [];
    } else if (!isMissingRpc(coinsResult.error)) {
      console.warn("Room coins RPC failed:", coinsResult.error);
    }
    if (!coinsRows.length) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id,coins")
        .in("id", state.players.map((player) => player.id));
      coinsRows = profiles || [];
    }
    const coinsById = Object.fromEntries((coinsRows || []).map((profile) => [profile.id || profile.user_id, Number(profile.coins || 0)]));
    state.players = state.players.map((player) => ({
      ...player,
      coins: player.id === state.user?.id ? Number(state.user?.coins || coinsById[player.id] || 0) : Number(coinsById[player.id] || 0),
    }));
  }

  if (!state.players.some((player) => player.id === state.user.id)) {
    clearLocalRoomSession();
    if (!state.leavingRoom) showMessage("Tu as ete deconnecte de la partie pour inactivite.");
    return;
  }

  if (state.game === "who" && state.roomStatus === "playing" && isRoomHost()) {
    await reconcileWhoPlayers();
  }
  if (state.game === "liars" && state.roomStatus === "playing" && isRoomHost()) {
    await reconcileLiarsPlayers();
  }

  renderCurrentRoomView();
}

function startLobbyRefresh() {
  clearInterval(state.lobbyRefreshTimer);
  state.lobbyRefreshTimer = setInterval(() => {
    if (document.hidden) return;
    if (state.screen === "lobby" && state.currentRoomId) {
      loadCurrentRoom();
      loadRoomPlayers();
    }
  }, 5000);
}

function stopLobbyRefresh() {
  clearInterval(state.lobbyRefreshTimer);
  state.lobbyRefreshTimer = null;
}

function subscribeToRoomPlayers() {
  if (!db || !state.currentRoomId) return;
  if (state.roomChannel) db.removeChannel(state.roomChannel);
  state.roomChannel = db
    .channel(`room_players:${state.currentRoomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${state.currentRoomId}` },
      () => loadRoomPlayers(),
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") loadRoomPlayers();
    });
}

async function loadCurrentRoom() {
  if (!state.currentRoomId) return;
  const { data, error } = await db
    .from("rooms")
    .select("id,code,game,host_id,status,settings")
    .eq("id", state.currentRoomId)
    .maybeSingle();

  if (error || !data) return;
  applyRoomState(data);
}

async function restoreRoomSession() {
  if (!db || !state.user?.id) return false;
  const roomId = savedRoomSessionId();
  if (!roomId) return false;

  const { data: room, error: roomError } = await db
    .from("rooms")
    .select("id,code,game,host_id,status,settings")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError || !room) {
    clearRoomSession();
    return false;
  }

  const { data: player, error: playerError } = await db
    .from("room_players")
    .select("user_id")
    .eq("room_id", roomId)
    .eq("user_id", state.user.id)
    .maybeSingle();

  if (playerError || !player) {
    clearRoomSession();
    return false;
  }

  applyRoomState(room);
  saveRoomSession(room.id);
  await syncCurrentPlayerProfile();
  await loadRoomPlayers();
  subscribeToRoomPlayers();
  subscribeToRoomState();
  startLobbyRefresh();
  startPresenceHeartbeat();
  resetRoomIdleTimer();
  go(roomScreenForCurrentState());
  return true;
}

function applyRoomState(room) {
  const previousRoomStatus = state.roomStatus;
  const previousLiarsState = JSON.stringify(state.settings.liars?.state || null);
  const previousWhoState = JSON.stringify(state.settings.who?.state || null);
  const previousTrueState = JSON.stringify(state.settings.true?.state || null);
  const previousPhotoState = JSON.stringify(state.settings.photo?.state || null);
  const previousBlackjackState = JSON.stringify(state.settings.blackjack?.state || null);
  state.currentRoomId = room.id;
  state.roomCode = room.code;
  state.game = room.game;
  state.roomHostId = room.host_id;
  state.roomStatus = room.status;
  state.settings = normalizeSettings(room.settings || state.settings);
  state.liars.state = state.settings.liars.state;
  if (previousRoomStatus === "lobby" && room.status === "playing") {
    closeTransientModals();
  }
  const nextPhotoState = JSON.stringify(state.settings.photo?.state || null);
  const photoStateChanged = previousPhotoState !== nextPhotoState && !state.photo.uploading;
  const nextWhoState = JSON.stringify(state.settings.who?.state || null);
  const whoStateChanged = previousWhoState !== nextWhoState;
  const nextTrueState = JSON.stringify(state.settings.true?.state || null);
  const trueStateChanged = previousTrueState !== nextTrueState;
  const nextLiarsState = JSON.stringify(state.settings.liars?.state || null);
  const liarsStateChanged = previousLiarsState !== nextLiarsState;
  const nextBlackjackState = JSON.stringify(state.settings.blackjack?.state || null);
  const blackjackStateChanged = previousBlackjackState !== nextBlackjackState;
  if (liarsStateChanged) {
    state.liars.selected = [];
    state.liars.deadSelectedCardId = "";
    state.liars.deadSelectedAnnounce = null;
    if (isLiarsDead21Mode(state.settings.liars.state)) {
      loadDead21PrivateState(false);
    }
  }
  if (state.screen === "lobby") renderLobby();
  if (state.screen === "who-game" && whoStateChanged) renderWho();
  if (state.screen === "true-game" && trueStateChanged) renderTrueOnly();
  if (state.screen === "photo-game" && photoStateChanged) renderPhotoRoulette();
  if (state.screen === "liars-game" && liarsStateChanged) renderLiars();
  if (state.screen === "blackjack-game" && blackjackStateChanged) renderBlackjack();
  if (room.status === "lobby" && ["end", "liars-game", "blackjack-game", "photo-game", "who-game", "true-game"].includes(state.screen)) {
    clearTimeout(state.liars.endTimer);
    clearTimeout(state.liars.revealTimer);
    clearTimeout(state.liars.rouletteLogTimer);
    state.liars.selected = [];
    go("lobby");
    return;
  }
  if (room.status === "playing" && state.screen === "lobby") {
    go(room.game === "who" ? "who-game" : room.game === "true" ? "true-game" : room.game === "photo" ? "photo-game" : room.game === "blackjack" ? "blackjack-game" : "liars-game");
  }
  if (room.status === "playing" && state.screen === "liars-game" && (state.liars.state?.winner || state.liars.state?.phase === "game_over")) {
    scheduleLiarsEnd(liarsEndDelay(state.liars.state));
  }
  if (room.status === "playing" && state.screen === "photo-game" && state.settings.photo.state?.status === "finished") {
    go("end");
  }
  if (room.status === "playing" && state.screen === "who-game" && state.settings.who.state?.status === "finished") {
    go("end");
  }
  if (room.status === "playing" && state.screen === "true-game" && state.settings.true.state?.status === "finished") {
    go("end");
  }
  if (room.status === "playing" && state.screen === "blackjack-game" && state.settings.blackjack.state?.phase === "finished") {
    go("end");
  }
}

function requestLiarsSync(delay = 350) {
  clearTimeout(state.liars.syncTimer);
  state.liars.syncTimer = setTimeout(() => {
    if (state.currentRoomId) loadCurrentRoom();
  }, delay);
}

function liarsRevealStartedAt(reveal) {
  const startedAt = Number(reveal?.startedAt || String(reveal?.id || "").split("-")[0]);
  if (!Number.isFinite(startedAt)) return Date.now();
  return startedAt < 1000000000000 ? startedAt * 1000 : startedAt;
}

const CHAOS_CARD_REVEALED_AT = 1250;
const CHAOS_SPECIAL_DELAY = CHAOS_CARD_REVEALED_AT + 2000;
const CHAOS_SPECIAL_DURATION = 2000;
const CHAOS_FIRST_SHOT_DELAY = CHAOS_SPECIAL_DELAY + CHAOS_SPECIAL_DURATION + 500;
const CHAOS_SHOT_INTERVAL = 4200;
const CHAOS_SHOT_ANIMATION_DURATION = 3950;
const CHAOS_SHOT_LOG_DELAY = 2050;
const CHAOS_SHOT_END_DELAY = 4550;

function liarsMaxPlayersForMode(mode) {
  return mode === "chaos" ? 6 : 4;
}

function liarsModePlayerLimitMessage(mode) {
  return mode === "chaos"
    ? "Le mode Chaos accepte 6 joueurs maximum."
    : "Normal et Roulette Russe acceptent 4 joueurs maximum.";
}

function liarsModeLockedByPlayerCount(mode, playerCount = state.players.length) {
  return Number(playerCount || 0) > liarsMaxPlayersForMode(mode);
}

function chaosShotVisibleCount(reveal) {
  const shots = reveal?.chaosShots || [];
  if (!shots.length) return 0;
  const elapsed = Date.now() - liarsRevealStartedAt(reveal);
  return shots.filter((_, index) => elapsed >= CHAOS_FIRST_SHOT_DELAY + index * CHAOS_SHOT_INTERVAL + CHAOS_SHOT_LOG_DELAY).length;
}

function chaosActiveShotIndex(reveal) {
  const shots = reveal?.chaosShots || [];
  if (!shots.length) return -1;
  const elapsed = Date.now() - liarsRevealStartedAt(reveal);
  return shots.findIndex((_, index) => {
    const start = CHAOS_FIRST_SHOT_DELAY + index * CHAOS_SHOT_INTERVAL;
    return elapsed >= start && elapsed < start + CHAOS_SHOT_ANIMATION_DURATION;
  });
}

function chaosRevealDuration(reveal) {
  const shotCount = Number(reveal?.chaosShots?.length || 0);
  if (!shotCount) return 6000;
  return CHAOS_FIRST_SHOT_DELAY + Math.max(0, shotCount - 1) * CHAOS_SHOT_INTERVAL + CHAOS_SHOT_END_DELAY;
}

function liarsSeatDeathMarkVisible(gameState, playerId, eliminated) {
  if (!eliminated) return false;
  const reveal = gameState?.reveal || null;
  if (!reveal?.id) return true;
  const elapsed = Date.now() - liarsRevealStartedAt(reveal);
  if (reveal.roulette?.dead && reveal.loserId === playerId) {
    return elapsed >= 7350;
  }
  const chaosShots = Array.isArray(reveal.chaosShots) ? reveal.chaosShots : [];
  const shotIndex = chaosShots.findIndex((shot) => shot?.playerId === playerId && shot?.dead);
  if (shotIndex >= 0) {
    return elapsed >= CHAOS_FIRST_SHOT_DELAY + shotIndex * CHAOS_SHOT_INTERVAL + 1900;
  }
  return true;
}

function liarsEndDelay(gameState) {
  if (isLiarsDead21Mode(gameState) && gameState?.reveal?.type === "final") {
    const finalShotCount = Array.isArray(gameState.reveal.shots) ? gameState.reveal.shots.length : 0;
    return dead21FinalScoreRevealDuration(gameState) + (finalShotCount ? finalShotCount * DEAD21_FINAL_SHOT_MS + 1200 : 1800);
  }
  if (gameState?.reveal?.chaosShots?.length) return chaosRevealDuration(gameState.reveal) + 650;
  if (gameState?.reveal?.roulette) return 10600;
  if (gameState?.reveal) return 6800;
  return 500;
}

function subscribeToRoomState() {
  if (!db || !state.currentRoomId) return;
  if (state.roomStateChannel) db.removeChannel(state.roomStateChannel);
  state.roomStateLive = false;
  state.roomStateChannel = db
    .channel(`rooms:${state.currentRoomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rooms", filter: `id=eq.${state.currentRoomId}` },
      (payload) => {
        if (payload.new) applyRoomState(payload.new);
      },
    )
    .subscribe((status) => {
      state.roomStateLive = status === "SUBSCRIBED";
      if (status === "SUBSCRIBED") loadCurrentRoom();
    });
}

async function leaveCurrentRoom() {
  if (!state.currentRoomId || !state.user?.id) {
    closeTransientModals();
    go("home");
    return;
  }

  state.leavingRoom = true;
  closeTransientModals();
  const roomId = state.currentRoomId;
  if (state.game === "liars" && state.roomStatus === "playing" && state.screen === "liars-game" && !getLiarsState()?.winner && isLiarsDead21Mode()) {
    const savedForfeit = await applyDead21ForfeitBeforeLeave(state.user.id);
    if (!savedForfeit) {
      state.leavingRoom = false;
      return;
    }
  }
  if (state.game === "liars" && state.roomStatus === "playing" && state.screen === "liars-game" && !getLiarsState()?.winner && !isLiarsDead21Mode()) {
    const savedForfeit = await applyLiarsForfeitBeforeLeave();
    if (!savedForfeit) {
      state.leavingRoom = false;
      return;
    }
  }
  if (state.game === "who" && state.roomStatus === "playing" && state.screen === "who-game" && getWhoState()?.status !== "finished") {
    const savedForfeit = await applyWhoForfeitBeforeLeave();
    if (!savedForfeit) {
      state.leavingRoom = false;
      return;
    }
  }
  if (state.game === "true" && state.roomStatus === "playing" && state.screen === "true-game" && getTrueState()?.status !== "finished") {
    const savedForfeit = await applyTrueForfeitBeforeLeave();
    if (!savedForfeit) {
      state.leavingRoom = false;
      return;
    }
  }

  const { error } = await db.rpc("leave_room_rpc", { p_room_id: roomId });
  if (error) {
    state.leavingRoom = false;
    showMessage("Impossible de quitter la partie: " + (error.message || "erreur inconnue"));
    return;
  }

  clearRoomSession();
  if (state.roomChannel) db.removeChannel(state.roomChannel);
  if (state.roomStateChannel) db.removeChannel(state.roomStateChannel);
  stopLobbyRefresh();
  stopPresenceHeartbeat();
  stopRoomIdleTimer();
  state.currentRoomId = "";
  state.roomCode = "";
  state.roomHostId = "";
  state.roomStatus = "lobby";
  state.roomChannel = null;
  state.roomStateChannel = null;
  state.roomStateLive = false;
  state.leavingRoom = false;
  resetCurrentPlayer();
  go("home");
}

async function startRoomForEveryone() {
  if (!state.currentRoomId || !isRoomHost()) {
    showMessage("Seul le chef peut lancer la partie.");
    return;
  }
  closeTransientModals();
  await loadRoomPlayers();
  if (state.game !== "blackjack" && state.players.length < 2) {
    showMessage("Il faut au moins 2 joueurs pour lancer la partie.");
    return;
  }
  if (state.game === "blackjack" && state.players.length < 1) {
    showMessage("Il faut au moins 1 joueur pour lancer le Blackjack.");
    return;
  }

  if (state.game === "who") {
    if (state.players.length > 8) {
      showMessage("Who is Who accepte 8 joueurs maximum.");
      return;
    }
    state.settings.who.state = createWhoInitialState(state.players);
    const settingsUpdate = await db.rpc("update_room_settings_rpc", {
      p_room_id: state.currentRoomId,
      p_settings: state.settings,
    });
    if (settingsUpdate.error) {
      if (!isMissingRpc(settingsUpdate.error)) {
        showMessage("Impossible de preparer la partie: " + (settingsUpdate.error.message || "erreur inconnue"));
        return;
      }
      const fallback = await db
        .from("rooms")
        .update({ settings: state.settings })
        .eq("id", state.currentRoomId)
        .eq("host_id", state.user.id)
        .eq("status", "lobby");
      if (fallback.error) {
        showMessage("Impossible de preparer la partie: " + (fallback.error.message || "erreur inconnue"));
        return;
      }
    }
  } else if (state.game === "true") {
    if (state.players.length > 8) {
      showMessage("True Only accepte 8 joueurs maximum.");
      return;
    }
    state.settings.true.state = createTrueInitialState(state.players);
    const settingsUpdate = await db.rpc("update_room_settings_rpc", {
      p_room_id: state.currentRoomId,
      p_settings: state.settings,
    });
    if (settingsUpdate.error) {
      if (!isMissingRpc(settingsUpdate.error)) {
        showMessage("Impossible de preparer la partie: " + (settingsUpdate.error.message || "erreur inconnue"));
        return;
      }
      const fallback = await db
        .from("rooms")
        .update({ settings: state.settings })
        .eq("id", state.currentRoomId)
        .eq("host_id", state.user.id)
        .eq("status", "lobby");
      if (fallback.error) {
        showMessage("Impossible de preparer la partie: " + (fallback.error.message || "erreur inconnue"));
        return;
      }
    }
  } else if (state.game === "photo") {
    if (state.players.length > 6) {
      showMessage("PhotoRoulette accepte 6 joueurs maximum.");
      return;
    }
    state.settings.photo.state = createPhotoInitialState(state.players);
    const settingsUpdate = await db.rpc("update_room_settings_rpc", {
      p_room_id: state.currentRoomId,
      p_settings: state.settings,
    });
    if (settingsUpdate.error) {
      if (!isMissingRpc(settingsUpdate.error)) {
        showMessage("Impossible de preparer la partie: " + (settingsUpdate.error.message || "erreur inconnue"));
        return;
      }
      const fallback = await db
        .from("rooms")
        .update({ settings: state.settings })
        .eq("id", state.currentRoomId)
        .eq("host_id", state.user.id)
        .eq("status", "lobby");
      if (fallback.error) {
        showMessage("Impossible de preparer la partie: " + (fallback.error.message || "erreur inconnue"));
        return;
      }
    }
  } else if (state.game === "blackjack") {
    if (state.players.length > 4) {
      showMessage("Blackjack accepte 4 joueurs maximum.");
      return;
    }
    const settingsUpdate = await db.rpc("start_blackjack_room_rpc", {
      p_room_id: state.currentRoomId,
    });
    if (settingsUpdate.error) {
      if (isMissingRpc(settingsUpdate.error)) showMessage("Lance le SQL Blackjack dans Supabase avant de lancer ce jeu.");
      else showMessage("Impossible de préparer le Blackjack: " + (settingsUpdate.error.message || "erreur inconnue"));
      return;
    }
  } else if (state.game === "liars") {
    const liarsMode = ["normal", "roulette", "chaos"].includes(state.settings.liars.mode) ? state.settings.liars.mode : "normal";
    state.settings.liars.mode = liarsMode;
    if (liarsModeLockedByPlayerCount(liarsMode)) {
      showMessage(liarsModePlayerLimitMessage(liarsMode));
      return;
    }

    state.settings.liars.state = createLiarsInitialState(state.players);
    const settingsUpdate = await db.rpc("update_room_settings_rpc", {
      p_room_id: state.currentRoomId,
      p_settings: state.settings,
    });
    if (settingsUpdate.error) {
      if (!isMissingRpc(settingsUpdate.error)) {
        showMessage("Impossible de preparer la partie: " + (settingsUpdate.error.message || "erreur inconnue"));
        return;
      }
      const fallback = await db
        .from("rooms")
        .update({ settings: state.settings })
        .eq("id", state.currentRoomId)
        .eq("host_id", state.user.id)
        .eq("status", "lobby");
      if (fallback.error) {
        showMessage("Impossible de preparer la partie: " + (fallback.error.message || "erreur inconnue"));
        return;
      }
    }
  }

  const { error } = await db.rpc("start_room_rpc", { p_room_id: state.currentRoomId });
  if (error) {
    if (!isMissingRpc(error)) {
      showMessage("Impossible de lancer la partie: " + (error.message || "erreur inconnue"));
      return;
    }

    const fallback = await db
      .from("rooms")
      .update({ status: "playing" })
      .eq("id", state.currentRoomId)
      .eq("host_id", state.user.id)
      .eq("status", "lobby");

    if (fallback.error) {
      showMessage("Impossible de lancer la partie: " + (fallback.error.message || "erreur inconnue"));
      return;
    }
  }

  await loadCurrentRoom();
}

async function enterRoom(room) {
  try {
    applyRoomState(room);
    await addCurrentPlayerToRoom(room.id);
    await loadCurrentRoom();
    await loadRoomPlayers();
    saveRoomSession(state.currentRoomId || room.id);
    subscribeToRoomPlayers();
    subscribeToRoomState();
    startLobbyRefresh();
    startPresenceHeartbeat();
    resetRoomIdleTimer();
    go("lobby");
  } catch (error) {
    state.currentRoomId = "";
    state.roomCode = "";
    state.roomHostId = "";
    state.roomStatus = "lobby";
    if (String(error.message || "").includes("room_full")) {
      showMessage("Ce salon est complet pour ce mode.");
      return;
    }
    showMessage("Partie trouvee, mais impossible de t'ajouter au lobby: " + (error.message || "erreur inconnue"));
  }
}

async function createRoomInDatabase(game) {
  let lastError = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = cleanRoomCode(generateRoomCode());
    const { data, error } = await db.rpc("create_room_rpc", {
      p_code: code,
      p_game: game,
      p_pseudo: state.user.pseudo,
      p_settings: state.settings,
    });

    if (!error) return Array.isArray(data) ? data[0] : data;
    lastError = error;
    if (error.code !== "23505") break;
  }

  throw lastError || new Error("Impossible de creer la partie.");
}

async function createRoom() {
  if (!requireSignedIn()) return;
  if (!(await ensureSupabaseClient())) {
    authUnavailable();
    return;
  }
  go("games");
}

function openLiarsModeModal() {
  const modal = $("#liars-mode-modal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeLiarsModeModal() {
  const modal = $("#liars-mode-modal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

async function createLiarsRoomWithMode(mode) {
  closeLiarsModeModal();
  state.settings = normalizeSettings({
    ...state.settings,
    liars: {
      ...state.settings.liars,
      mode: ["roulette", "chaos"].includes(mode) ? mode : "normal",
      state: null,
    },
  });
  try {
    const room = await createRoomInDatabase("liars");
    await enterRoom(room);
  } catch (error) {
    showMessage("Impossible de creer la partie: " + (error.message || "erreur inconnue"));
  }
}

async function joinRoom(code) {
  if (!requireSignedIn()) return;
  if (!(await ensureSupabaseClient())) {
    authUnavailable();
    return;
  }

  const normalizedCode = cleanRoomCode(code);
  if (!normalizedCode) {
    showMessage("Entre un code de partie.");
    return;
  }

  const { data, error } = await db
    .from("rooms")
    .select("id,code,game,host_id,status,settings")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    showMessage("Impossible de rejoindre cette partie.");
    return;
  }

  if (!data) {
    showMessage("Aucune partie trouvee avec ce code.");
    return;
  }

  if (data.status !== "lobby") {
    showMessage("Cette partie a deja commence ou n'est plus disponible.");
    return;
  }

  if (data.game === "liars") {
    const mode = ["normal", "roulette", "chaos"].includes(data.settings?.liars?.mode) ? data.settings.liars.mode : "normal";
    const { data: players, error: playersError } = await db
      .from("room_players")
      .select("user_id")
      .eq("room_id", data.id);
    if (!playersError) {
      const alreadyInRoom = (players || []).some((player) => player.user_id === state.user.id);
      if (!alreadyInRoom && Number(players?.length || 0) >= liarsMaxPlayersForMode(mode)) {
        showMessage(mode === "chaos" ? "Ce salon Chaos est complet." : "Ce salon Liars Bar est complet: ce mode accepte 4 joueurs maximum.");
        return;
      }
    }
  }

  await enterRoom(data);
}

function renderLobby() {
  const lobbyScreen = document.querySelector('[data-screen="lobby"]');
  const liarsMode = state.settings.liars.mode || "normal";
  const lobbyKey = JSON.stringify({
    game: state.game,
    code: state.roomCode,
    host: state.roomHostId,
    self: state.user?.id,
    status: state.roomStatus,
    settings: {
      who: state.settings.who?.rounds,
      photo: state.settings.photo?.rounds,
      liarsMode,
      antiAfkEnabled: state.settings.liars?.antiAfkEnabled !== false,
      blackjack: state.settings.blackjack?.state?.phase || "",
    },
    players: state.players.map((player) => [
      player.id,
      player.pseudo,
      player.score || 0,
      player.ready ? 1 : 0,
      player.weaponSkin || "",
      player.nameSkin || "",
    ]),
  });
  if (state.renderKeys.lobby === lobbyKey) return;
  state.renderKeys.lobby = lobbyKey;
  lobbyScreen?.classList.toggle("who-lobby-screen", state.game === "who");
  lobbyScreen?.classList.toggle("true-lobby-screen", state.game === "true");
  lobbyScreen?.classList.toggle("blackjack-lobby-screen", state.game === "blackjack");
  $("#room-label").textContent = state.roomCode || "TABLE1";
  renderLiarsAfkSetting();
  $("#room-label").classList.toggle("who-code-card", state.game === "who");
  $("#room-label").classList.toggle("true-code-card", state.game === "true");
  $(".players")?.classList.toggle("who-lobby-panel", state.game === "who");
  $(".players")?.classList.toggle("true-lobby-panel", state.game === "true");
  $(".settings")?.classList.toggle("who-lobby-panel", state.game === "who");
  $(".settings")?.classList.toggle("true-lobby-panel", state.game === "true");
  $("#lobby-title").textContent = state.game === "who"
    ? "Who is Who"
    : state.game === "true"
    ? "True Only"
    : state.game === "photo"
    ? "PhotoRoulette"
    : state.game === "blackjack"
    ? "Blackjack"
    : liarsMode === "chaos" ? "Liars Bar - Chaos" : liarsMode === "roulette" ? "Liars Bar - Roulette Russe" : "Liars Bar";
  $("#start-game").disabled = !isRoomHost();
  $("#start-game").textContent = isRoomHost() ? "Lancer" : "En attente";
  $("#players").innerHTML = state.players
    .map(
      (player) => `
        <div class="player-row">
          <button class="player-profile-link" type="button" data-profile-user="${player.id}">
            <strong>${player.id === state.roomHostId ? '<span class="host-crown">♛</span>' : ""}${renderName(player.pseudo, player.nameSkin)}</strong>
          </button>
          <span class="badge">${state.game === "who" ? (player.id === state.roomHostId ? "Chef" : "Joueur") : player.id === state.roomHostId ? "Chef" : "Joueur"}</span>
        </div>
      `,
    )
    .join("");

  const settings = state.game === "who" ? renderWhoSettings() : state.game === "true" ? renderTrueSettings() : state.game === "photo" ? renderPhotoSettings() : state.game === "blackjack" ? renderBlackjackSettings() : renderLiarsSettings();
  $("#settings-content").innerHTML = settings;
  $(".lobby-shop-open")?.classList.toggle("hidden", !["liars", "blackjack"].includes(state.game));
  bindSettings();
  bindLobbyProfileLinks();
}

function renderLiarsAfkSetting() {
  const panel = $("#lobby-afk-setting");
  if (!panel) return;
  if (state.game !== "liars") {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  const enabled = state.settings.liars?.antiAfkEnabled !== false;
  panel.classList.remove("hidden");
  panel.innerHTML = `
    <span>Anti-AFK</span>
    <button class="afk-toggle ${enabled ? "active" : ""}" type="button" id="liars-afk-toggle" ${isRoomHost() ? "" : "disabled"}>
      ${enabled ? "ON" : "OFF"}
    </button>
  `;
  $("#liars-afk-toggle")?.addEventListener("click", () => {
    if (!isRoomHost()) {
      showMessage("Seul le chef peut modifier l'Anti-AFK.");
      return;
    }
    state.settings.liars.antiAfkEnabled = !(state.settings.liars.antiAfkEnabled !== false);
    updateRoomSettings();
    renderLobby();
  });
}

function renderPhotoSettings() {
  return `
    <div class="setting-row">
      <span>Nombre de manches</span>
      <div class="chips" data-setting="photo.rounds">
        ${[10, 20, 30].map((value) => chip(value, state.settings.photo.rounds)).join("")}
      </div>
    </div>
  `;
}

function renderWhoSettings() {
  return `
    <div class="who-lobby-intro">
      <strong>Who is Who</strong>
      <p>Chaque question lance un vote entre amis. Tu peux voter pour quelqu'un ou pour toi-meme.</p>
      <p>Au reveal, on voit qui a vote pour qui et un camembert montre les plus vises.</p>
    </div>
    <div class="setting-row">
      <span>Nombre de questions</span>
      <div class="chips" data-setting="who.rounds">
        ${[10, 20].map((value) => chip(value, state.settings.who.rounds)).join("")}
      </div>
    </div>
  `;
}

function renderTrueSettings() {
  return `
    <div class="true-lobby-intro">
      <strong>True Only</strong>
      <p>Écris une vraie anecdote et une fausse. Les autres devront retrouver l'auteur et démasquer la vérité.</p>
      <p>Une fois validées, tes anecdotes sont verrouillées.</p>
    </div>
  `;
}

function renderBlackjackSettings() {
  return `
    <div class="true-lobby-intro blackjack-lobby-intro">
      <strong>Blackjack</strong>
      <p>1 à 4 joueurs contre le croupier. Mise minimum : 50 pièces.</p>
      <p>Blackjack naturel payé 3:2, victoire simple 1:1, égalité remboursée.</p>
    </div>
  `;
}

function renderLiarsSettings() {
  const mode = ["normal", "roulette", "chaos"].includes(state.settings.liars.mode) ? state.settings.liars.mode : "normal";
  return `
    <div class="setting-row liars-mode-setting-row">
      <div class="liars-mode-setting-list" data-setting="liars.mode">
        ${modeChip("normal", "Normal", mode)}
        ${modeChip("roulette", "Roulette Russe", mode)}
        ${modeChip("chaos", "Chaos", mode)}
      </div>
    </div>
  `;
}

function renderModeRules(mode) {
  const rules = LIARS_MODE_RULES[mode] || LIARS_MODE_RULES.normal;
  return `
    <div class="rules-modal" id="rules-modal">
      <article class="rules-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(rules.title)}">
        <button class="icon-btn rules-close" type="button" aria-label="Fermer">×</button>
        <h2>${escapeHtml(rules.title)}</h2>
        <div class="rules-body">${escapeHtml(rules.body)}</div>
      </article>
    </div>
  `;
}

function openModeRules(mode) {
  closeModeRules();
  document.body.insertAdjacentHTML("beforeend", renderModeRules(mode));
}

function closeModeRules() {
  $("#rules-modal")?.remove();
}

function bindLobbyProfileLinks() {
  $$(".player-profile-link").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.roomStatus !== "lobby" || state.screen !== "lobby") return;
      openLiarsProfile(button.dataset.profileUser);
    });
  });
}

function xpNeededForLevel(level) {
  const current = Math.max(1, Number(level || 1));
  return 100 + current * current * 35;
}

function formatDateShort(value) {
  if (!value) return "Inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Inconnue";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function percentText(numerator, denominator) {
  const total = Number(denominator || 0);
  if (!total) return "0%";
  return `${Math.round(Number(numerator || 0) * 100 / total)}%`;
}

function profileStatsValue(stats, key) {
  return Number(stats?.[key] || 0);
}

function normalizeProfileStats(stats = {}) {
  const normalized = {};
  LIARS_PROFILE_TABS.forEach((tab) => {
    if (tab.id === "badges") return;
    normalized[tab.id] = {
      ...(stats?.[tab.id] || {}),
      ...(stats?.[tab.id]?.extra || {}),
    };
  });
  return normalized;
}

function normalizeProfileBadges(raw = {}) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return Object.fromEntries(LIARS_BADGES.map((badge) => {
    const item = source[badge.id] || {};
    return [badge.id, {
      ...badge,
      state: item.state || "LOCKED",
      progress: Math.max(0, Number(item.progress || 0)),
      unlockedAt: item.unlocked_at || item.unlockedAt || null,
      claimedAt: item.claimed_at || item.claimedAt || null,
    }];
  }));
}

function normalizeBadgeRewards(raw = {}) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return Object.fromEntries(Object.entries(LIARS_BADGE_CATEGORIES).map(([id, category]) => {
    const item = source[id] || {};
    return [id, {
      ...category,
      claimedAt: item.claimed_at || item.claimedAt || null,
      coins: Number(item.coins || category.reward || 0),
    }];
  }));
}

function profileInventoryCards(items, ownedIds, equippedId, type = "weapon") {
  const owned = new Set(Array.isArray(ownedIds) ? ownedIds : []);
  return items
    .filter((item) => owned.has(item.id) || item.id === equippedId)
    .map((item) => {
      const image = type === "name"
        ? renderName("Pseudo", item.id)
        : `<img src="./Boutique/${escapeAttr(item.file)}" alt="" onerror="this.style.visibility='hidden';" />`;
      return `
        <div class="profile-inventory-card ${item.id === equippedId ? "equipped" : ""}">
          <div>${image}</div>
          <strong>${cleanText(item.name)}</strong>
          ${item.id === equippedId ? "<span>Équipé</span>" : "<small>Possédé</small>"}
        </div>
      `;
    })
    .join("") || `<p class="profile-empty">Aucun objet possédé.</p>`;
}

async function fetchLiarsProfile(userId) {
  if (!db || !userId) return null;
  try {
    const { data, error } = await db.rpc("get_liars_profile_rpc", { p_user_id: userId });
    if (!error && data) return data;
    if (error && !isMissingRpc(error)) console.warn("Profile RPC failed:", error.message || error);
  } catch (error) {
    console.warn("Profile RPC failed:", error);
  }
  if (userId === state.user?.id) {
    const profile = await loadProfile({ id: userId });
    return { profile, stats: {} };
  }
  return null;
}

async function openLiarsProfile(userId = state.user?.id, initialTab = "global") {
  if (!userId || !["home", "lobby", "liars-game", "blackjack-game"].includes(state.screen)) return;
  state.profileModal = {
    ...state.profileModal,
    open: true,
    userId,
    tab: initialTab || "global",
    data: null,
    busy: true,
  };
  renderLiarsProfileModal();
  const data = await fetchLiarsProfile(userId);
  state.profileModal.data = data;
  state.profileModal.busy = false;
  renderLiarsProfileModal();
}

function closeLiarsProfile() {
  state.profileModal.open = false;
  state.profileModal.userId = "";
  state.profileModal.data = null;
  $("#profile-modal")?.classList.add("hidden");
  $("#profile-modal")?.setAttribute("aria-hidden", "true");
}

function profileStatGrid(stats, mode) {
  const games = profileStatsValue(stats, "gamesPlayed");
  const wins = profileStatsValue(stats, "gamesWon");
  const accuseOk = profileStatsValue(stats, "accuseOk");
  const accuseWrong = profileStatsValue(stats, "accuseWrong");
  const rouletteShots = profileStatsValue(stats, "rouletteShots");
  const rouletteDeaths = profileStatsValue(stats, "rouletteDeaths");
  const rouletteSurvived = profileStatsValue(stats, "rouletteSurvived");
  const common = [
    ["🎮 Parties jouées", games],
    ["🏆 Victoires", wins],
    ["📈 Winrate", percentText(wins, games)],
    ["🥈 Deuxièmes places", profileStatsValue(stats, "secondPlaces")],
    ["🎯 Accusations réussies", accuseOk],
    ["❌ Accusations ratées", accuseWrong],
    ["🧠 Précision accusation", percentText(accuseOk, accuseOk + accuseWrong)],
    ["😏 Bluffs réussis", profileStatsValue(stats, "bluffsSuccessful")],
    ["🤥 Bluffs ratés", profileStatsValue(stats, "bluffsFailed")],
    ["🔫 Tirs roulette", rouletteShots],
    ["💀 Morts roulette", rouletteDeaths],
    ["🍀 Survies roulette", rouletteSurvived],
    ["📊 Taux survie roulette", percentText(rouletteSurvived, rouletteShots)],
    ["⚔️ 1v1 gagnés", profileStatsValue(stats, "duels1v1Won")],
  ];
  const chaos = [
    ["😈 Devil joués", profileStatsValue(stats, "devilPlayed")],
    ["🔥 Devil déclenchés", profileStatsValue(stats, "devilTriggered")],
    ["🏹 Hunter joués", profileStatsValue(stats, "hunterPlayed")],
    ["☠️ Hunter kills", profileStatsValue(stats, "hunterKills")],
    ["🤠 Far West jouées", profileStatsValue(stats, "farWestPlayed")],
    ["🔫 Duels Far West gagnés", profileStatsValue(stats, "farWestDuelsWon")],
    ["💥 Duels Far West perdus", profileStatsValue(stats, "farWestDuelsLost")],
    ["⭐ Éliminations spéciales", profileStatsValue(stats, "specialKills")],
  ];
  const blackjack = [
    ["🎮 Parties Blackjack jouées", games],
    ["🏆 Parties gagnées", wins],
    ["❌ Parties perdues", profileStatsValue(stats, "gamesLost")],
    ["🤝 Égalités", profileStatsValue(stats, "pushes")],
    ["📈 Winrate Blackjack", percentText(wins, games)],
    ["🪙 Total pièces misées", profileStatsValue(stats, "coinsBet")],
    ["💰 Total pièces gagnées", profileStatsValue(stats, "coinsWon")],
    ["🔥 Plus gros gain", profileStatsValue(stats, "bestWin")],
    ["💀 Plus grosse perte", profileStatsValue(stats, "worstLoss")],
    ["🂡 Blackjacks naturels", profileStatsValue(stats, "naturalBlackjacks")],
    ["💥 Busts", profileStatsValue(stats, "busts")],
    ["✖️ Doubles réussis", profileStatsValue(stats, "doubleWins")],
    ["✂️ Splits gagnés", profileStatsValue(stats, "splitWins")],
    ["🍀 Meilleure série", profileStatsValue(stats, "bestWinStreak")],
    ["🌧️ Pire série de défaites", profileStatsValue(stats, "worstLossStreak")],
  ];
  const dead21 = [
    ["Manches jouées", profileStatsValue(stats, "roundsPlayed")],
    ["Meilleur score", profileStatsValue(stats, "bestScore")],
    ["21 exacts", profileStatsValue(stats, "exact21")],
    ["Au-dessus de 21", profileStatsValue(stats, "busts")],
    ["Meilleur score safe", profileStatsValue(stats, "safeBest")],
    ["Punitions finales", profileStatsValue(stats, "finalPunishments")],
    ["Bluffs Dead 21 réussis", profileStatsValue(stats, "dead21BluffsSuccessful")],
    ["Accusations correctes", profileStatsValue(stats, "dead21AccuseOk")],
  ];
  const rows = mode === "chaos" ? common.concat(chaos) : mode === "blackjack" ? blackjack : mode === "dead21" ? common.concat(dead21) : common;
  return rows.map(([label, value]) => `
    <div class="profile-stat-card">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function badgeInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderBadgeImage(badge) {
  return `
    <div class="profile-badge-image">
      <img src="./Badge/${escapeAttr(badge.image)}" alt="" onerror="this.remove(); this.closest('.profile-badge-image')?.classList.add('missing');" />
      <span>${cleanText(badgeInitials(badge.name))}</span>
    </div>
  `;
}

function renderProfileBadges() {
  const badges = normalizeProfileBadges(state.profileModal.data?.badges || {});
  const rewards = normalizeBadgeRewards(state.profileModal.data?.badgeRewards || {});
  const stats = normalizeProfileStats(state.profileModal.data?.stats || {});
  const inferredProgress = (badge) => {
    if (badge.id === "tetebrullee") return profileStatsValue(stats.roulette, "rouletteSurvived");
    if (badge.id === "chanceinsolente") return profileStatsValue(stats.roulette, "criticalSurvivals");
    if (badge.id === "menteurpro") return profileStatsValue(stats.roulette, "bluffsSuccessful");
    if (badge.id === "tireurdelite") return profileStatsValue(stats.chaos, "hunterKills");
    if (badge.id === "miseurfou") return profileStatsValue(stats.blackjack, "maxBet");
    if (badge.id === "rpflorian") return profileStatsValue(stats.blackjack, "worstLossStreak");
    if (badge.id === "croupierhumilie") return profileStatsValue(stats.blackjack, "bestWinStreak");
    if (badge.id === "mainroyale") return profileStatsValue(stats.blackjack, "naturalBlackjacks");
    if (badge.id === "doubleourien") return profileStatsValue(stats.blackjack, "doubleWins");
    return 0;
  };
  return Object.entries(LIARS_BADGE_CATEGORIES).map(([categoryId, category]) => {
    const categoryBadges = LIARS_BADGES.filter((badge) => badge.category === categoryId).map((badge) => ({
      ...badges[badge.id],
      progress: Math.max(Number(badges[badge.id]?.progress || 0), inferredProgress(badge)),
    }));
    const claimedCount = categoryBadges.filter((badge) => badge.state === "CLAIMED").length;
    const completeCount = categoryBadges.filter((badge) => badge.state !== "LOCKED").length;
    const reward = rewards[categoryId] || {};
    const canClaimReward = claimedCount === categoryBadges.length && !reward.claimedAt;
    return `
      <section class="profile-badge-category">
        <header>
          <div>
            <span class="small-label">${category.label}</span>
            <h3>${claimedCount}/${categoryBadges.length} badges réclamés</h3>
            <small>${completeCount}/${categoryBadges.length} défis réussis</small>
          </div>
          <button type="button" class="badge-category-reward" data-badge-reward="${categoryId}" ${canClaimReward ? "" : "disabled"}>
            ${reward.claimedAt ? "Récompense réclamée" : `Réclamer ${category.reward} pièces`}
          </button>
        </header>
        <div class="profile-badge-grid">
          ${categoryBadges.map((badge) => {
            const progressMax = Math.max(1, Number(badge.progressMax || 1));
            const progress = Math.min(progressMax, Number(badge.progress || 0));
            const percent = Math.round(progress * 100 / progressMax);
            const canClaimBadge = badge.state === "COMPLETED_UNCLAIMED";
            return `
              <button type="button" class="profile-badge-card ${badge.state.toLowerCase()}" ${canClaimBadge ? `data-badge-claim="${badge.id}"` : `data-badge-preview="${badge.id}"`}>
                ${renderBadgeImage(badge)}
                <strong>${cleanText(badge.name)}</strong>
                <small>${cleanText(badge.description)}</small>
                <div class="badge-progress"><i style="width:${percent}%"></i></div>
                <span>${progress}/${progressMax}</span>
                ${badge.state === "LOCKED" ? "<b class=\"badge-lock\">🔒</b>" : ""}
                ${canClaimBadge ? `<em>À réclamer</em>` : ""}
                ${badge.state === "CLAIMED" ? "<em>Réclamé</em>" : ""}
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }).join("");
}

async function claimLiarsBadge(badgeId) {
  if (!badgeId || !db || state.profileModal.busy) return;
  const content = $("#profile-content");
  const scrollTop = content?.scrollTop || 0;
  state.profileModal.busy = true;
  try {
    const { data, error } = await db.rpc("claim_liars_badge_rpc", { p_badge_id: badgeId });
    if (error) {
      if (isMissingRpc(error)) showMessage("Lance le SQL badges dans Supabase avant de réclamer ce badge.");
      else showMessage("Badge impossible à réclamer: " + (error.message || "erreur inconnue"));
      return;
    }
    if (data?.profile) applyProfileToUser(data.profile);
    if (!state.profileModal.data) state.profileModal.data = {};
    state.profileModal.data.profile = data?.profile || state.profileModal.data.profile;
    state.profileModal.data.badges = {
      ...(state.profileModal.data.badges || {}),
      [badgeId]: {
        ...(state.profileModal.data.badges?.[badgeId] || {}),
        state: "CLAIMED",
        claimed_at: new Date().toISOString(),
      },
    };
    state.profileModal.busy = false;
    renderLiarsProfileModal();
    const nextContent = $("#profile-content");
    if (nextContent) requestAnimationFrame(() => {
      nextContent.scrollTop = scrollTop;
      nextContent
        .querySelectorAll("[data-badge-preview]")
        .forEach((button) => {
          if (button.dataset.badgePreview === badgeId) button.classList.add("just-claimed");
        });
    });
    showBadgeClaimPopup(badgeId);
  } finally {
    state.profileModal.busy = false;
  }
}

async function claimLiarsBadgeReward(categoryId) {
  if (!categoryId || !db || state.profileModal.busy) return;
  state.profileModal.busy = true;
  try {
    const { data, error } = await db.rpc("claim_liars_badge_category_reward_rpc", { p_category: categoryId });
    if (error) {
      if (isMissingRpc(error)) showMessage("Lance le SQL badges dans Supabase avant de réclamer la récompense.");
      else if (String(error.message || "").includes("category_not_complete")) showMessage("Tous les badges de cette catégorie ne sont pas encore réclamés.");
      else showMessage("Récompense impossible à réclamer: " + (error.message || "erreur inconnue"));
      return;
    }
    if (data?.profile) applyProfileToUser(data.profile);
    await openLiarsProfile(state.profileModal.userId || state.user?.id, "badges");
    showBadgeRewardPopup(categoryId, Number(data?.coins || LIARS_BADGE_CATEGORIES[categoryId]?.reward || 0));
  } finally {
    state.profileModal.busy = false;
  }
}

async function resetLiarsProfileStats() {
  if (!db || !state.user?.id || state.profileModal.busy) return;
  const confirmed = window.confirm("Tu veux vraiment réinitialiser toutes tes statistiques Liars Bar ? Tes badges, skins et pièces ne seront pas supprimés.");
  if (!confirmed) return;
  state.profileModal.busy = true;
  try {
    const { data, error } = await db.rpc("reset_liars_profile_stats_rpc");
    if (error) {
      if (isMissingRpc(error)) showMessage("Lance le SQL profil dans Supabase avant de réinitialiser les statistiques.");
      else showMessage("Réinitialisation impossible: " + (error.message || "erreur inconnue"));
      return;
    }
    if (data?.profile) applyProfileToUser(data.profile);
    await openLiarsProfile(state.user.id, "global");
    showMessage("Tes statistiques Liars Bar ont été réinitialisées.");
  } finally {
    state.profileModal.busy = false;
  }
}

function renderLiarsProfileModal() {
  const modal = $("#profile-modal");
  const content = $("#profile-content");
  if (!modal || !content) return;
  if (!state.profileModal.open) {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    return;
  }
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  if (state.profileModal.busy) {
    content.innerHTML = `<div class="profile-loading">Chargement du profil...</div>`;
    return;
  }
  const rawProfile = state.profileModal.data?.profile || {};
  const profile = normalizeProfile(rawProfile);
  const stats = normalizeProfileStats(state.profileModal.data?.stats || {});
  const tab = state.profileModal.tab || "global";
  const activeStats = stats[tab] || {};
  const xpNeed = xpNeededForLevel(profile.liarsLevel);
  const xpPercent = Math.max(0, Math.min(100, Math.round(profile.liarsXp * 100 / xpNeed)));
  const isSelfProfile = state.profileModal.data?.isSelf !== false && state.profileModal.userId === state.user?.id;
  content.innerHTML = `
    <section class="profile-hero">
      <div>
        <span class="small-label">Profil Liars Bar</span>
        <h2>${renderName(profile.pseudo, profile.equippedNameSkin)}</h2>
        <small>Membre depuis ${formatDateShort(profile.createdAt)}</small>
      </div>
      <div class="profile-level">
        <strong>Niv. ${profile.liarsLevel}</strong>
        <span>${profile.liarsXp}/${xpNeed} XP</span>
      </div>
    </section>
    <div class="profile-xp"><i style="width:${xpPercent}%"></i></div>
    <nav class="profile-tabs">
      ${LIARS_PROFILE_TABS.map((item) => `<button type="button" data-profile-tab="${item.id}" class="${item.id === tab ? "active" : ""}">${item.label}</button>`).join("")}
    </nav>
    ${tab === "global" ? `
      <section class="profile-summary-grid">
        <div class="profile-stat-card"><small>🪙 Pièces</small><strong class="profile-coin-value">${profile.coins}<img src="./Boutique/piece.png" alt="" /></strong></div>
        <div class="profile-stat-card"><small>💰 Total pièces gagnées</small><strong class="profile-coin-value">${profile.totalCoinsEarned}<img src="./Boutique/piece.png" alt="" /></strong></div>
        <div class="profile-stat-card"><small>🎮 Parties totales</small><strong>${profileStatsValue(activeStats, "gamesPlayed")}</strong></div>
        <div class="profile-stat-card"><small>🏆 Victoires totales</small><strong>${profileStatsValue(activeStats, "gamesWon")}</strong></div>
        <div class="profile-stat-card"><small>📈 Winrate global</small><strong>${percentText(profileStatsValue(activeStats, "gamesWon"), profileStatsValue(activeStats, "gamesPlayed"))}</strong></div>
        <div class="profile-stat-card"><small>🔥 Meilleure série</small><strong>${Math.max(profile.bestWinStreak, profileStatsValue(activeStats, "bestWinStreak"))}</strong></div>
        <div class="profile-stat-card"><small>🎯 Accusations réussies</small><strong>${profileStatsValue(activeStats, "accuseOk")}</strong></div>
        <div class="profile-stat-card"><small>🔫 Tirs roulette</small><strong>${profileStatsValue(activeStats, "rouletteShots")}</strong></div>
        <div class="profile-stat-card"><small>💀 Morts roulette</small><strong>${profileStatsValue(activeStats, "rouletteDeaths")}</strong></div>
        <div class="profile-stat-card"><small>⚠️ Danger moyen à la mort</small><strong>${profileStatsValue(activeStats, "rouletteDeathDangerCount") ? `${Math.round(profileStatsValue(activeStats, "rouletteDeathDangerTotal") * 100 / profileStatsValue(activeStats, "rouletteDeathDangerCount"))}%` : "0%"}</strong></div>
      </section>
      <section class="profile-inventory">
        <h3>Inventaire</h3>
        <h4>Revolvers</h4>
        <div class="profile-inventory-grid">${profileInventoryCards(WEAPON_SKINS, profile.ownedWeaponSkins, profile.equippedWeaponSkin, "weapon")}</div>
        <h4>Skins de pseudo</h4>
        <div class="profile-inventory-grid">${profileInventoryCards(NAME_SKINS, profile.ownedNameSkins, profile.equippedNameSkin, "name")}</div>
        <h4>Jetons de mort</h4>
        <div class="profile-inventory-grid">${profileInventoryCards(DEATH_SKINS, profile.ownedDeathSkins, profile.equippedDeathSkin, "death")}</div>
      </section>
    ` : tab === "badges" ? `
      <section class="profile-badges">${renderProfileBadges()}</section>
    ` : `<section class="profile-summary-grid">${profileStatGrid(activeStats, tab)}</section>`}
    ${isSelfProfile ? `
      <section class="profile-danger-zone">
        <div>
          <strong>Réinitialiser les statistiques</strong>
          <small>Remet à zéro les stats, le niveau et l’XP Liars Bar. Les badges, skins, pièces et inventaire restent intacts.</small>
        </div>
        <button type="button" data-reset-liars-stats>Réinitialiser</button>
      </section>
    ` : ""}
  `;
  $$("#profile-content [data-profile-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.profileModal.tab = button.dataset.profileTab;
      renderLiarsProfileModal();
    });
  });
  if (!content.dataset.badgeDelegationBound) {
    content.dataset.badgeDelegationBound = "true";
    content.addEventListener("click", (event) => {
      const claimTarget = event.target.closest("[data-badge-claim]");
      if (claimTarget) {
        event.preventDefault();
        event.stopPropagation();
        claimLiarsBadge(claimTarget.dataset.badgeClaim);
        return;
      }
      const previewTarget = event.target.closest("[data-badge-preview]");
      if (previewTarget) openBadgePreview(previewTarget.dataset.badgePreview);
    });
  }
  $$("#profile-content [data-badge-reward]").forEach((button) => {
    button.addEventListener("click", () => claimLiarsBadgeReward(button.dataset.badgeReward));
  });
  $("#profile-content [data-reset-liars-stats]")?.addEventListener("click", resetLiarsProfileStats);
}

function chip(value, active, suffix = "") {
  return `<button class="chip ${value === active ? "active" : ""}" type="button" data-value="${value}" ${isRoomHost() ? "" : "disabled"}>${value}${suffix}</button>`;
}

function modeChip(value, label, active) {
  const images = {
    normal: "./Image%20site/imagenormal.png",
    roulette: "./Image%20site/imagerouletterusse.png",
    chaos: "./Image%20site/imagechaos.png",
  };
  const locked = value !== active && liarsModeLockedByPlayerCount(value);
  const disabled = !isRoomHost() || locked;
  return `
    <div class="liars-mode-setting-item">
      <button class="liars-mode-setting-card ${value === active ? "active" : ""} ${locked ? "mode-locked" : ""}" type="button" data-value="${value}" title="${locked ? escapeAttr(liarsModePlayerLimitMessage(value)) : ""}" ${disabled ? "disabled" : ""}>
        <img src="${images[value] || images.normal}" alt="" />
        <span>${label}</span>
        ${locked ? `<small class="mode-limit-label">Max ${liarsMaxPlayersForMode(value)} joueurs</small>` : ""}
      </button>
      <button class="mode-rules-button" type="button" data-liars-rules="${value}">Règles</button>
    </div>
  `;
}

function bindSettings() {
  $$(".chips, .liars-mode-setting-list").forEach((group) => {
    group.addEventListener("click", (event) => {
      const rulesButton = event.target.closest("[data-liars-rules]");
      if (rulesButton) {
        openModeRules(rulesButton.dataset.liarsRules);
        return;
      }
      const button = event.target.closest(".chip, .liars-mode-setting-card");
      if (!button) return;
      if (!isRoomHost()) {
        showMessage("Seul le chef peut modifier les paramètres.");
        return;
      }
      if (button.disabled || button.classList.contains("mode-locked")) {
        showMessage(liarsModePlayerLimitMessage(button.dataset.value));
        return;
      }
      const [game, key] = group.dataset.setting.split(".");
      if (game === "liars" && key === "mode" && liarsModeLockedByPlayerCount(button.dataset.value)) {
        showMessage(liarsModePlayerLimitMessage(button.dataset.value));
        return;
      }
      state.settings[game][key] = key === "mode" ? button.dataset.value : Number(button.dataset.value);
      if (game === "liars" && key === "mode") state.settings.liars.lives = 3;
      updateRoomSettings();
      renderLobby();
    });
  });
}

async function updateRoomSettings() {
  if (!state.currentRoomId || !isRoomHost()) return;
  const { error } = await db.rpc("update_room_settings_rpc", {
    p_room_id: state.currentRoomId,
    p_settings: state.settings,
  });

  if (error) {
    if (!isMissingRpc(error)) {
      if (String(error.message || "").includes("liars_mode_too_many_players")) {
        showMessage("Impossible: Normal et Roulette Russe sont limites a 4 joueurs. Passe en Chaos ou retire des joueurs.");
        return;
      }
      showMessage("Impossible de modifier les paramètres: " + (error.message || "erreur inconnue"));
      return;
    }

    const fallback = await db
      .from("rooms")
      .update({ settings: state.settings })
      .eq("id", state.currentRoomId)
      .eq("host_id", state.user.id)
      .eq("status", "lobby");

    if (fallback.error) {
      showMessage("Impossible de modifier les paramètres: " + (fallback.error.message || "erreur inconnue"));
    }
  }
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createWhoInitialState(players) {
  const selectedPlayers = players.slice(0, 8);
  const rounds = Math.min(Number(state.settings.who.rounds || 10), WHO_QUESTIONS.length);
  const questionOrder = shuffleItems(WHO_QUESTIONS).slice(0, rounds);
  return {
    status: "voting",
    roundCount: rounds,
    currentRound: 1,
    question: questionOrder[0],
    questionOrder,
    votes: {},
    voteHistory: [],
    names: Object.fromEntries(selectedPlayers.map((player) => [player.id, player.pseudo])),
    playerIds: selectedPlayers.map((player) => player.id),
    phaseEndsAt: Date.now() + 15000,
    sequence: 1,
  };
}

function getWhoState() {
  return state.settings.who?.state;
}

async function saveWhoState(nextState) {
  state.settings.who.state = nextState;
  renderWho();
  const { error } = await db.rpc("update_who_state_rpc", {
    p_room_id: state.currentRoomId,
    p_state: nextState,
  });
  if (error) {
    showMessage(isMissingRpc(error)
      ? "Lance le SQL Who is Who dans Supabase avant de jouer en multi."
      : "Impossible de synchroniser Who is Who: " + (error.message || "erreur inconnue"));
    return false;
  }
  return true;
}

async function saveWhoVote(targetId) {
  const { error } = await db.rpc("update_who_vote_rpc", {
    p_room_id: state.currentRoomId,
    p_target_id: targetId || null,
  });
  if (error) {
    if (!isMissingRpc(error)) {
      showMessage("Impossible d'envoyer ton vote: " + (error.message || "erreur inconnue"));
      return false;
    }
    await loadCurrentRoom();
    const latest = cloneData(getWhoState());
    if (!latest || latest.status !== "voting" || latest.votes?.[state.user.id]) return false;
    latest.votes ||= {};
    if (targetId) latest.votes[state.user.id] = targetId;
    latest.sequence = Number(latest.sequence || 0) + 1;
    return saveWhoState(latest);
  }
  await loadCurrentRoom();
  return true;
}

async function reconcileWhoPlayers() {
  const whoState = cloneData(getWhoState());
  if (!whoState || !isRoomHost() || whoState.status === "finished") return;
  const presentIds = new Set(state.players.map((player) => player.id));
  const nextPlayerIds = (whoState.playerIds || []).filter((id) => presentIds.has(id));
  if (nextPlayerIds.length === (whoState.playerIds || []).length) return;
  whoState.playerIds = nextPlayerIds;
  Object.keys(whoState.votes || {}).forEach((voterId) => {
    if (!presentIds.has(voterId) || !presentIds.has(whoState.votes[voterId])) {
      delete whoState.votes[voterId];
    }
  });
  if (nextPlayerIds.length <= 1) {
    whoState.status = "finished";
  } else if (whoState.status === "voting" && Object.keys(whoState.votes || {}).length >= nextPlayerIds.length) {
    whoState.status = "reveal";
    whoState.voteHistory ||= [];
    whoState.voteHistory.push({ question: whoState.question, votes: whoState.votes });
  }
  whoState.sequence = Number(whoState.sequence || 0) + 1;
  await saveWhoState(whoState);
}

async function applyWhoForfeitBeforeLeave() {
  const whoState = cloneData(getWhoState());
  const leavingId = state.user?.id;
  if (!whoState?.playerIds?.includes(leavingId)) return true;
  whoState.playerIds = whoState.playerIds.filter((id) => id !== leavingId);
  if (whoState.votes) {
    delete whoState.votes[leavingId];
    Object.keys(whoState.votes).forEach((voterId) => {
      if (whoState.votes[voterId] === leavingId) delete whoState.votes[voterId];
    });
  }
  if (whoState.playerIds.length <= 1) {
    whoState.status = "finished";
  }
  whoState.sequence = Number(whoState.sequence || 0) + 1;
  return saveWhoState(whoState);
}

function startWhoGame() {
  clearTimeout(state.who.phaseTimer);
  clearInterval(state.who.ticker);
  renderWho();
}

function whoPlayers(whoState = getWhoState()) {
  const ids = whoState?.playerIds?.length ? whoState.playerIds : state.players.map((player) => player.id);
  return ids.map((id) => ({
    id,
    pseudo: whoState?.names?.[id] || state.players.find((player) => player.id === id)?.pseudo || "Joueur",
    nameSkin: state.players.find((player) => player.id === id)?.nameSkin || null,
  }));
}

function renderWho() {
  const whoState = getWhoState();
  if (!whoState) return;
  $("#who-round").textContent = whoState.status === "finished"
    ? "Fin"
    : `Question ${whoState.currentRound}/${whoState.roundCount}`;
  updateWhoTimer(whoState);
  clearInterval(state.who.ticker);
  if (whoState.status === "voting") {
    state.who.ticker = setInterval(() => updateWhoTimer(getWhoState()), 250);
  }
  if (whoState.status === "voting") renderWhoVoting(whoState);
  if (whoState.status === "reveal") renderWhoReveal(whoState);
  if (whoState.status === "finished") go("end");
  maybeRevealWhoWhenComplete(whoState);
}

function updateWhoTimer(whoState) {
  const timer = $("#who-timer");
  if (!timer || !whoState) return;
  if (whoState.status !== "voting") {
    timer.textContent = whoState.status === "reveal" ? "Reveal" : "";
    return;
  }
  const total = whoPlayers(whoState).length;
  timer.textContent = `${Object.keys(whoState.votes || {}).length}/${total}`;
}

function avatarInitial(name) {
  return cleanText(name, "J").slice(0, 1).toUpperCase();
}

function renderWhoVoting(whoState) {
  const players = whoPlayers(whoState);
  const myVote = whoState.votes?.[state.user.id];
  const votedCount = Object.keys(whoState.votes || {}).length;
  $("#who-stage").innerHTML = `
    <div class="who-question-card">
      <span>${votedCount}/${players.length} votes</span>
      <h2>${cleanLogText(whoState.question)}</h2>
      <small>${myVote ? "Vote verrouille. Attente des autres joueurs." : "Choisis la personne qui correspond le mieux."}</small>
    </div>
  `;
  $("#who-vote-grid").innerHTML = players.map((player) => `
    <button type="button" data-who-vote="${player.id}" class="${myVote === player.id ? "who-selected" : ""}" ${myVote ? "disabled" : ""}>
      <span>${avatarInitial(player.pseudo)}</span>
      <strong>${renderName(player.pseudo, player.nameSkin)}</strong>
    </button>
  `).join("");
  $("#who-skip").textContent = myVote ? "Vote envoye" : "Passer";
  $("#who-skip").disabled = Boolean(myVote);
  $("#who-next").textContent = "Vote en cours";
  $("#who-next").disabled = true;
}

function renderWhoReveal(whoState) {
  const players = whoPlayers(whoState);
  const counts = {};
  Object.values(whoState.votes || {}).forEach((targetId) => {
    counts[targetId] = Number(counts[targetId] || 0) + 1;
  });
  const totalVotes = Math.max(1, Object.values(counts).reduce((sum, count) => sum + count, 0));
  const votedPlayers = players.filter((player) => (counts[player.id] || 0) > 0);
  const pieSvg = renderWhoPieSvg(votedPlayers, counts, totalVotes, players);
  const voteLines = Object.entries(whoState.votes || {}).map(([voterId, targetId]) => ({
    voterId,
    targetId,
    voter: whoState.names?.[voterId] || "Joueur",
    target: whoState.names?.[targetId] || "Joueur",
  }));
  $("#who-stage").innerHTML = `
    <div class="who-results">
      <h2>${cleanLogText(whoState.question)}</h2>
      <div class="who-pie-wrap">
        ${pieSvg}
      </div>
      <div class="who-links">
        ${voteLines.length ? voteLines.map((line) => `
          <span>
            <b style="--who-name-color:${whoPlayerColor(line.voterId, players)}">${cleanText(line.voter)}</b>
            a vote pour
            <b style="--who-name-color:${whoPlayerColor(line.targetId, players)}">${cleanText(line.target)}</b>
          </span>
        `).join("") : "<span>Aucun vote sur cette question</span>"}
      </div>
    </div>
  `;
  $("#who-vote-grid").innerHTML = "";
  $("#who-skip").textContent = "Reveal";
  $("#who-skip").disabled = true;
  $("#who-next").textContent = isRoomHost() ? "Question suivante" : "En attente";
  $("#who-next").disabled = !isRoomHost();
}

function renderWhoPieSvg(votedPlayers, counts, totalVotes, allPlayers = votedPlayers) {
  if (!votedPlayers.length) {
    return `
      <svg class="who-pie" viewBox="0 0 120 120" role="img" aria-label="Aucun vote">
        <circle cx="60" cy="60" r="54" fill="#dbeafe"></circle>
      </svg>
    `;
  }

  let start = 0;
  const slices = votedPlayers.map((player) => {
    const percent = (counts[player.id] || 0) / totalVotes;
    const end = start + percent;
    const path = whoPieSlicePath(start, end);
    const label = whoPieLabelPoint(start, end);
    const percentLabel = `${Math.round(percent * 100)}%`;
    const nameLabel = cleanText(player.pseudo, "Joueur").slice(0, percent < .18 ? 8 : 12);
    const color = whoPlayerColor(player.id, allPlayers);
    start = end;
    return `
      <path d="${path}" fill="${color}"></path>
      <text x="${label.x}" y="${label.y}" text-anchor="middle" class="who-pie-label">
        <tspan x="${label.x}" dy="-2">${escapeAttr(nameLabel)}</tspan>
        <tspan x="${label.x}" dy="12">${percentLabel}</tspan>
      </text>
    `;
  }).join("");

  return `
    <svg class="who-pie" viewBox="0 0 120 120" role="img" aria-label="Repartition des votes">
      ${slices}
    </svg>
  `;
}

function whoPieLabelPoint(startPercent, endPercent) {
  const center = 60;
  const radius = endPercent - startPercent >= 0.999 ? 0 : 32;
  const angle = (((startPercent + endPercent) / 2) * 360) - 90;
  return polarPoint(center, center, radius, angle);
}

function whoPieSlicePath(startPercent, endPercent) {
  const center = 60;
  const radius = 54;
  const startAngle = (startPercent * 360) - 90;
  const endAngle = (endPercent * 360) - 90;
  const startPoint = polarPoint(center, center, radius, startAngle);
  const endPoint = polarPoint(center, center, radius, endAngle);
  const largeArc = endPercent - startPercent > 0.5 ? 1 : 0;

  if (endPercent - startPercent >= 0.999) {
    return `
      M ${center} ${center}
      m 0 -${radius}
      a ${radius} ${radius} 0 1 1 0 ${radius * 2}
      a ${radius} ${radius} 0 1 1 0 -${radius * 2}
      Z
    `;
  }

  return `M ${center} ${center} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y} Z`;
}

function polarPoint(cx, cy, radius, angle) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Number((cx + radius * Math.cos(radians)).toFixed(3)),
    y: Number((cy + radius * Math.sin(radians)).toFixed(3)),
  };
}

function whoPieColor(index) {
  return ["#315eff", "#18d5ff", "#76e4f7", "#93c5fd", "#0ea5e9", "#60a5fa", "#38bdf8", "#1d4ed8"][index % 8];
}

function whoPlayerColor(playerId, players = whoPlayers()) {
  const index = Math.max(0, players.findIndex((player) => player.id === playerId));
  return whoPieColor(index);
}

function getTrueState() {
  return state.settings.true?.state;
}

function truePlayers(trueState = getTrueState()) {
  const ids = trueState?.playerIds?.length ? trueState.playerIds : state.players.map((player) => player.id);
  return ids.map((id) => ({
    id,
    pseudo: trueState?.names?.[id] || state.players.find((player) => player.id === id)?.pseudo || "Joueur",
    nameSkin: state.players.find((player) => player.id === id)?.nameSkin || null,
  }));
}

function createTrueInitialState(players) {
  const selectedPlayers = players.slice(0, 8);
  const names = Object.fromEntries(selectedPlayers.map((player) => [player.id, player.pseudo]));
  const scores = Object.fromEntries(selectedPlayers.map((player) => [player.id, { score: 0, correct: 0, streak: 0 }]));
  return {
    status: "writing",
    playerIds: selectedPlayers.map((player) => player.id),
    names,
    entries: {},
    phrases: [],
    currentIndex: 0,
    votes: {},
    scores,
    history: [],
    phaseEndsAt: null,
    sequence: 1,
  };
}

async function saveTrueState(nextState) {
  state.settings.true.state = nextState;
  renderTrueOnly();
  const { error } = await db.rpc("update_true_state_rpc", {
    p_room_id: state.currentRoomId,
    p_state: nextState,
  });
  if (error) {
    showMessage(isMissingRpc(error)
      ? "Lance le SQL True Only dans Supabase avant de jouer en multi."
      : "Impossible de synchroniser True Only: " + (error.message || "erreur inconnue"));
    return false;
  }
  return true;
}

function trueReadyText(trueState = getTrueState()) {
  const submitted = Object.keys(trueState?.entries || {}).length;
  const total = truePlayers(trueState).length || 1;
  return `${submitted}/${total}`;
}

async function submitTrueEntries(realText, fakeText) {
  const { error } = await db.rpc("submit_true_entries_rpc", {
    p_room_id: state.currentRoomId,
    p_real_text: realText,
    p_fake_text: fakeText,
  });
  if (error) {
    showMessage("Impossible d'envoyer tes anecdotes: " + (error.message || "erreur inconnue"));
    return false;
  }
  await loadCurrentRoom();
  return true;
}

async function submitTrueVote(ownerId, truth) {
  const { error } = await db.rpc("submit_true_vote_rpc", {
    p_room_id: state.currentRoomId,
    p_owner_id: ownerId,
    p_truth: Boolean(truth),
  });
  if (error) {
    showMessage("Impossible d'envoyer ton vote: " + (error.message || "erreur inconnue"));
    return false;
  }
  await loadCurrentRoom();
  return true;
}

function startTrueGame() {
  clearInterval(state.trueOnly.ticker);
  renderTrueOnly();
  state.trueOnly.ticker = setInterval(() => {
    if (state.screen === "true-game") renderTrueTimer();
  }, 500);
}

function renderTrueTimer() {
  const trueState = getTrueState();
  const timer = $("#true-timer");
  if (timer && trueState?.status === "writing") {
    timer.textContent = trueReadyText(trueState);
    return;
  }
  if (!timer || !trueState?.phaseEndsAt) {
    if (timer) timer.textContent = "10s";
    return;
  }
  const left = Math.max(0, Math.ceil((Number(trueState.phaseEndsAt) - Date.now()) / 1000));
  timer.textContent = `${left}s`;
  if (left === 0 && isRoomHost() && trueState.status === "voting") {
    revealTrueOnly(cloneData(getTrueState()));
  }
  if (left === 0 && isRoomHost() && trueState.status === "reveal") {
    nextTrueStep(cloneData(getTrueState()));
  }
}

function currentTruePhrase(trueState = getTrueState()) {
  return trueState?.phrases?.[Number(trueState.currentIndex || 0)] || null;
}

function renderTrueOnly() {
  const trueState = getTrueState();
  if (!trueState) return;
  renderTrueTimer();
  const roundTotal = Math.max(1, trueState.phrases?.length || trueState.playerIds?.length * 2 || 1);
  $("#true-round").textContent = trueState.status === "writing"
    ? "Écriture"
    : `Phrase ${Number(trueState.currentIndex || 0) + 1}/${roundTotal}`;
  if (trueState.status === "writing") return renderTrueWriting(trueState);
  if (trueState.status === "voting") return renderTrueVoting(trueState);
  if (trueState.status === "reveal") return renderTrueReveal(trueState);
}

function renderTrueWriting(trueState) {
  const mine = trueState.entries?.[state.user.id];
  const submitted = Object.keys(trueState.entries || {}).length;
  const total = truePlayers(trueState).length;
  const form = $("#true-write-form");
  if (!mine && form) {
    $("#true-timer").textContent = `${submitted}/${total}`;
    maybeStartTrueVoting(trueState);
    return;
  }
  $("#true-stage").innerHTML = mine ? `
    <div class="true-card">
      <span class="true-kicker">Anecdotes envoyées</span>
      <h2>En attente des autres joueurs</h2>
      <p>${submitted}/${total} joueurs ont validé.</p>
    </div>
  ` : `
    <form class="true-card true-write-form" id="true-write-form">
      <span class="true-kicker">Phase d'écriture</span>
      <h2>Une vérité. Un mensonge.</h2>
      <label>Vraie anecdote<textarea id="true-real" maxlength="160" required></textarea></label>
      <label>Fausse anecdote<textarea id="true-fake" maxlength="160" required></textarea></label>
      <button class="primary true-primary" type="submit">Valider mes anecdotes</button>
    </form>
  `;
  $("#true-actions").innerHTML = "";
  $("#true-write-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const realText = cleanLogText($("#true-real").value, "");
    const fakeText = cleanLogText($("#true-fake").value, "");
    if (realText.length < 12 || fakeText.length < 12) {
      showMessage("Écris une anecdote un peu plus complète.");
      return;
    }
    await submitTrueEntries(realText, fakeText);
    maybeStartTrueVoting();
  });
  maybeStartTrueVoting(trueState);
}

async function maybeStartTrueVoting(trueState = getTrueState()) {
  if (!isRoomHost() || !trueState || trueState.status !== "writing") return;
  const players = truePlayers(trueState);
  if (players.length < 2 || Object.keys(trueState.entries || {}).length < players.length) return;
  const phrases = shuffleItems(players.flatMap((player) => {
    const entry = trueState.entries[player.id] || {};
    return [
      { id: `${player.id}:real`, ownerId: player.id, text: entry.real, truth: true },
      { id: `${player.id}:fake`, ownerId: player.id, text: entry.fake, truth: false },
    ];
  })).filter((item) => item.text);
  trueState.phrases = phrases;
  trueState.currentIndex = 0;
  trueState.votes = {};
  trueState.status = "voting";
  trueState.phaseEndsAt = Date.now() + 10000;
  trueState.sequence = Number(trueState.sequence || 0) + 1;
  await saveTrueState(trueState);
}

function renderTrueVoting(trueState) {
  const phrase = currentTruePhrase(trueState);
  const players = truePlayers(trueState);
  const myVote = trueState.votes?.[state.user.id];
  const existingPanel = $(".true-vote-panel");
  if (!myVote && existingPanel?.dataset.phraseId === phrase?.id) {
    maybeRevealTrueWhenComplete(trueState);
    return;
  }
  $("#true-stage").innerHTML = `
    <div class="true-card true-phrase-card">
      <span class="true-kicker">À qui est cette phrase ?</span>
      <h2>${cleanLogText(phrase?.text || "Phrase introuvable")}</h2>
      ${myVote ? "" : `<div class="true-truth-row compact">
        <button type="button" data-true-truth="true">Vrai</button>
        <button type="button" data-true-truth="false">Faux</button>
      </div>`}
      ${myVote ? "<p>Vote verrouillé. Attente des autres joueurs.</p>" : ""}
    </div>
  `;
  $("#true-actions").innerHTML = myVote ? "" : `
    <div class="true-vote-panel" data-phrase-id="${escapeAttr(phrase?.id || "")}">
      <div class="true-player-grid">
        ${players.map((player) => `<button type="button" data-true-owner="${player.id}">${cleanText(player.pseudo)}</button>`).join("")}
      </div>
      <button class="primary true-primary" type="button" id="true-submit-vote">Valider</button>
    </div>
  `;
  maybeRevealTrueWhenComplete(trueState);
}

function renderTrueReveal(trueState) {
  const phrase = currentTruePhrase(trueState);
  const names = trueState.names || {};
  const resultLines = Object.entries(trueState.votes || {}).map(([voterId, vote]) => {
    const okOwner = vote.ownerId === phrase?.ownerId;
    const okTruth = Boolean(vote.truth) === Boolean(phrase?.truth);
    const isRight = okOwner && okTruth;
    return `<span class="${isRight ? "good" : "bad"}">${cleanText(names[voterId] || "Joueur")} a eu <b>${isRight ? "juste" : "faux"}</b></span>`;
  }).join("");
  $("#true-stage").innerHTML = `
    <div class="true-card true-reveal-card">
      <span class="true-kicker">${phrase?.truth ? "Vrai" : "Faux"}</span>
      <h2>C'était la phrase à ${cleanText(names[phrase?.ownerId] || "Joueur")}</h2>
      <p>${cleanLogText(phrase?.text || "")}</p>
      <div class="true-vote-list">${resultLines || "<span>Aucun vote</span>"}</div>
    </div>
  `;
  $("#true-actions").innerHTML = "";
}

function renderTrueScoreboard(trueState) {
  const scores = trueState.scores || {};
  const names = trueState.names || {};
  const rows = truePlayers(trueState)
    .map((player) => [player, scores[player.id] || { score: 0, correct: 0, streak: 0 }])
    .sort((a, b) => b[1].score - a[1].score)
    .map(([player, score]) => `<li><b>${cleanText(player.pseudo)}</b><span>${score.score || 0} pts</span><small>${score.correct || 0} bonnes - serie x${score.streak || 0}</small></li>`)
    .join("");
  $("#true-stage").innerHTML = `
    <div class="true-card true-score-card">
      <span class="true-kicker">Scores</span>
      <h2>${cleanText(names[currentTruePhrase(trueState)?.ownerId] || "Auteur")} etait la reponse</h2>
      <ul class="true-score-list">${rows}</ul>
    </div>
  `;
  $("#true-actions").innerHTML = `<button class="primary true-primary" type="button" id="true-next">${isRoomHost() ? "Phrase suivante" : "En attente"}</button>`;
  $("#true-next").disabled = !isRoomHost();
}

async function revealTrueOnly(trueState = cloneData(getTrueState())) {
  if (!isRoomHost() || !trueState || trueState.status !== "voting") return;
  const phrase = currentTruePhrase(trueState);
  trueState.scores ||= {};
  truePlayers(trueState).forEach((player) => {
    const vote = trueState.votes?.[player.id];
    trueState.scores[player.id] ||= { score: 0, correct: 0, streak: 0 };
    const score = trueState.scores[player.id];
    const okOwner = vote?.ownerId === phrase?.ownerId;
    const okTruth = Boolean(vote?.truth) === Boolean(phrase?.truth);
    const points = okOwner && okTruth ? 2 : okOwner ? 1 : 0;
    score.score = Number(score.score || 0) + points;
    score.correct = Number(score.correct || 0) + (points === 2 ? 1 : 0);
    score.streak = points === 2 ? Number(score.streak || 0) + 1 : 0;
  });
  trueState.history ||= [];
  trueState.history.push({ phrase, votes: trueState.votes, scores: trueState.scores });
  trueState.status = "reveal";
  trueState.phaseEndsAt = Date.now() + 5000;
  trueState.sequence = Number(trueState.sequence || 0) + 1;
  await saveTrueState(trueState);
}

async function nextTrueStep(trueState = cloneData(getTrueState())) {
  if (!isRoomHost() || !trueState) return;
  if (trueState.status === "reveal") {
    if (Number(trueState.currentIndex || 0) >= (trueState.phrases?.length || 1) - 1) {
      trueState.status = "finished";
      await saveTrueState(trueState);
      return;
    }
    trueState.currentIndex = Number(trueState.currentIndex || 0) + 1;
    trueState.votes = {};
    trueState.status = "voting";
    trueState.phaseEndsAt = Date.now() + 10000;
  }
  trueState.sequence = Number(trueState.sequence || 0) + 1;
  await saveTrueState(trueState);
}

function maybeRevealTrueWhenComplete(trueState = getTrueState()) {
  if (!isRoomHost() || !trueState || trueState.status !== "voting") return;
  const total = truePlayers(trueState).length;
  if (Object.keys(trueState.votes || {}).length >= total) {
    setTimeout(() => revealTrueOnly(cloneData(getTrueState())), 150);
  }
}

async function applyTrueForfeitBeforeLeave() {
  const trueState = cloneData(getTrueState());
  const leavingId = state.user?.id;
  if (!trueState?.playerIds?.includes(leavingId)) return true;
  trueState.playerIds = trueState.playerIds.filter((id) => id !== leavingId);
  delete trueState.entries?.[leavingId];
  delete trueState.votes?.[leavingId];
  Object.keys(trueState.votes || {}).forEach((voterId) => {
    if (trueState.votes[voterId]?.ownerId === leavingId) delete trueState.votes[voterId];
  });
  if (trueState.playerIds.length <= 1) trueState.status = "finished";
  trueState.sequence = Number(trueState.sequence || 0) + 1;
  return saveTrueState(trueState);
}

function maybeRevealWhoWhenComplete(whoState = getWhoState()) {
  if (!isRoomHost() || !whoState || whoState.status !== "voting") return;
  const total = whoPlayers(whoState).length;
  if (total >= 2 && Object.keys(whoState.votes || {}).length >= total) {
    setTimeout(() => revealWho(cloneData(getWhoState())), 150);
  }
}

async function voteWho(playerId) {
  const whoState = cloneData(getWhoState());
  if (!whoState || whoState.status !== "voting" || whoState.votes?.[state.user.id]) return;
  await saveWhoVote(playerId);
  const latest = getWhoState();
  if (isRoomHost() && latest?.status === "voting" && Object.keys(latest.votes || {}).length >= whoPlayers(latest).length) {
    await revealWho(cloneData(latest));
  }
}

async function revealWho(whoState = cloneData(getWhoState())) {
  if (!isRoomHost() || !whoState || whoState.status !== "voting") return;
  const total = whoPlayers(whoState).length;
  if (Object.keys(whoState.votes || {}).length < total) return;
  whoState.status = "reveal";
  whoState.phaseEndsAt = null;
  whoState.voteHistory ||= [];
  whoState.voteHistory.push({ question: whoState.question, votes: whoState.votes });
  whoState.sequence = Number(whoState.sequence || 0) + 1;
  await saveWhoState(whoState);
}

async function nextWhoQuestion(whoState = cloneData(getWhoState())) {
  if (!isRoomHost() || !whoState || whoState.status !== "reveal") return;
  if (whoState.currentRound >= whoState.roundCount) {
    whoState.status = "finished";
    whoState.sequence = Number(whoState.sequence || 0) + 1;
    await saveWhoState(whoState);
    return;
  }
  whoState.currentRound = Number(whoState.currentRound || 1) + 1;
  whoState.question = whoState.questionOrder[whoState.currentRound - 1] || shuffleItems(WHO_QUESTIONS)[0];
  whoState.votes = {};
  whoState.status = "voting";
  whoState.phaseEndsAt = null;
  whoState.sequence = Number(whoState.sequence || 0) + 1;
  await saveWhoState(whoState);
}

function startPhotoRound() {
  clearTimeout(state.photo.phaseTimer);
  renderPhotoRoulette();
}

function renderMedia() {
  const stage = $("#photo-stage");
  const file = state.photo.files[(state.photo.round - 1) % Math.max(state.photo.files.length, 1)];
  if (!file) {
    stage.innerHTML = `
      <div class="upload-card">
        <span>ðŸ“¸</span>
        <strong>Ajoute jusqu'a 9 medias</strong>
        <small>Les medias sont utilises uniquement pendant la partie.</small>
        <input id="photo-input" type="file" accept="image/*,video/*" multiple />
      </div>
    `;
    $("#photo-input").addEventListener("change", collectFiles);
    return;
  }

  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");
  stage.innerHTML = isVideo
    ? `<video src="${url}" controls autoplay muted playsinline></video>`
    : `<img src="${url}" alt="Media a deviner" />`;
}

function collectFiles(event) {
  state.photo.files = [...event.target.files].slice(0, 9);
  renderMedia();
}

function renderVotes() {
  $("#vote-grid").innerHTML = state.players
    .map((player) => `<button type="button" data-vote="${player.id}">${cleanText(player.pseudo)}</button>`)
    .join("");
}

function vote(playerId) {
  const player = state.players.find((item) => item.id === playerId);
  if (!player) return;
  if (state.photo.answered.has(playerId)) return;
  state.photo.answered.add(playerId);
  player.score += 10;
  $("#photo-timer").textContent = state.photo.answered.size + "/" + state.players.length;
  if (state.photo.answered.size >= state.players.length) revealPhotoScore();
}

function revealPhotoScore() {
  clearInterval(state.photo.timer);
  state.photo.revealLeft = 5;
  $("#photo-timer").textContent = "5s";
  state.photo.timer = setInterval(() => {
    state.photo.revealLeft -= 1;
    $("#photo-timer").textContent = state.photo.revealLeft + "s";
    if (state.photo.revealLeft <= 0) nextPhoto();
  }, 1000);
}

function nextPhoto() {
  clearInterval(state.photo.timer);
  if (state.photo.round >= state.settings.photo.rounds) {
    go("end");
    return;
  }
  state.photo.round += 1;
  startPhotoRound();
}

function photoRequiredMedia(rounds = state.settings.photo.rounds) {
  return { 10: 9, 20: 16, 30: 20 }[Number(rounds)] || 9;
}

function createPhotoInitialState(players) {
  const selectedPlayers = players.slice(0, 6);
  return {
    status: "media_selection",
    roundCount: Number(state.settings.photo.rounds || 10),
    currentRound: 0,
    currentMedia: null,
    votes: {},
    recentOwners: [],
    frames: Object.fromEntries(selectedPlayers.map((player) => [player.id, { ready: false, media: [] }])),
    names: Object.fromEntries(selectedPlayers.map((player) => [player.id, player.pseudo])),
    nameSkins: Object.fromEntries(selectedPlayers.map((player) => [player.id, player.nameSkin || null])),
    scores: Object.fromEntries(selectedPlayers.map((player) => [player.id, { score: 0, streak: 0, correct: 0 }])),
    ownerCounts: Object.fromEntries(selectedPlayers.map((player) => [player.id, 0])),
    sequence: 1,
    phaseEndsAt: null,
  };
}

function getPhotoState() {
  return state.settings.photo.state;
}

async function savePhotoState(nextState) {
  state.settings.photo.state = nextState;
  renderPhotoRoulette();
  const { error } = await db.rpc("update_photo_state_rpc", {
    p_room_id: state.currentRoomId,
    p_state: nextState,
  });
  if (error) {
    showMessage(isMissingRpc(error)
      ? "Lance le SQL PhotoRoulette dans Supabase avant de jouer en multi."
      : "Impossible de synchroniser PhotoRoulette: " + (error.message || "erreur inconnue"));
    return false;
  }
  return true;
}

function renderPhotoRoulette() {
  const photoState = getPhotoState();
  if (!photoState) return;
  if (state.photo.uploading) {
    $("#photo-round").textContent = "Upload";
    $("#photo-timer").textContent = "";
    $("#photo-stage").innerHTML = `
      <div class="photo-selection">
        <strong>Chargement des medias...</strong>
        <small>${state.photo.uploadProgress || "Preparation"}</small>
        <div class="photo-loader"><span></span></div>
      </div>
    `;
    $("#vote-grid").innerHTML = "";
    $("#next-photo").textContent = "Chargement";
    $("#next-photo").disabled = true;
    return;
  }
  $("#photo-round").textContent = photoPhaseLabel(photoState);
  $("#photo-timer").textContent = photoState.status === "voting"
    ? `${Object.keys(photoState.votes || {}).length}/${state.players.length}`
    : "";
  if (photoState.status === "media_selection") renderPhotoSelection(photoState);
  if (photoState.status === "voting") renderPhotoVoting(photoState);
  if (photoState.status === "reveal") renderPhotoReveal(photoState);
  if (photoState.status === "scoreboard") renderPhotoScoreboard(photoState);
  if (photoState.status === "finished") go("end");
  schedulePhotoHostPhase(photoState);
}

function photoPhaseLabel(photoState) {
  if (!photoState) return "Selection";
  if (photoState.status === "media_selection") return "Cadres";
  if (photoState.status === "voting") return `Manche ${photoState.currentRound}/${photoState.roundCount}`;
  if (photoState.status === "reveal") return "Reveal";
  if (photoState.status === "scoreboard") return "Scores";
  return "Fin";
}

function renderPhotoSelection(photoState) {
  const required = photoRequiredMedia(photoState.roundCount);
  const frame = photoState.frames?.[state.user.id] || { ready: false, media: [] };
  $("#photo-stage").innerHTML = `
    <div class="photo-selection">
      <strong>${frame.ready ? "Cadre valide" : `Pioche aleatoire : ${required} medias`}</strong>
      <small>${frame.ready ? `${frame.media.length} medias prets` : `Selectionne un gros lot depuis ta galerie, le jeu en garde ${required} au hasard.`}</small>
      <input id="photo-input" type="file" accept="image/*,video/*" multiple ${frame.ready ? "disabled" : ""} />
      ${!frame.ready && state.photo.pool.length ? `<small>${state.photo.files.length}/${required} pioches dans ${state.photo.pool.length} medias autorises</small>` : ""}
      <div class="photo-frame-grid">
        ${(frame.ready ? frame.media : state.photo.files).slice(0, required).map((item, index) => `
          <span>${frame.ready ? (item.type === "video" ? "Video" : "Photo") : cleanText(item.name || `Media ${index + 1}`)}</span>
        `).join("")}
      </div>
    </div>
  `;
  $("#photo-input")?.addEventListener("change", collectFiles);
  $("#vote-grid").innerHTML = state.players.map((player) => {
    const playerFrame = photoState.frames?.[player.id];
    return `<button type="button" disabled class="${playerFrame?.ready ? "vote-correct" : ""}">${cleanText(player.pseudo)} ${playerFrame?.ready ? "pret" : "..."}</button>`;
  }).join("");
  $("#shuffle-media").textContent = "Changer";
  $("#next-photo").textContent = isRoomHost() && allPhotoFramesReady(photoState) ? "Lancer" : "Valider mon cadre";
  $("#next-photo").disabled = state.photo.uploading;
}

function renderPhotoVoting(photoState) {
  const media = photoState.currentMedia;
  $("#photo-stage").innerHTML = media?.type === "video"
    ? `<video src="${media.url}" autoplay muted playsinline></video>`
    : `<img src="${media?.url || ""}" alt="Media PhotoRoulette" />`;
  const myVote = photoState.votes?.[state.user.id];
  $("#vote-grid").innerHTML = state.players.map((player) => `
    <button type="button" data-vote="${player.id}" class="${myVote === player.id ? "vote-selected" : ""}">
      ${cleanText(player.pseudo)}
    </button>
  `).join("");
  $("#shuffle-media").textContent = " ";
  $("#next-photo").textContent = "Vote en cours";
  $("#next-photo").disabled = true;
}

function renderPhotoReveal(photoState) {
  const media = photoState.currentMedia;
  const ownerId = media?.ownerId;
  $("#photo-stage").innerHTML = `
    ${media?.type === "video" ? `<video src="${media.url}" muted playsinline></video>` : `<img src="${media?.url || ""}" alt="" />`}
    <div class="photo-reveal">C'etait ${cleanText(photoState.names?.[ownerId] || "Joueur")}</div>
  `;
  const myVote = photoState.votes?.[state.user.id];
  $("#vote-grid").innerHTML = state.players.map((player) => {
    const isOwner = player.id === ownerId;
    const isMine = player.id === myVote;
    return `<button type="button" disabled class="${isOwner ? "vote-owner" : isMine ? "vote-wrong" : ""}">${cleanText(player.pseudo)}</button>`;
  }).join("");
  $("#next-photo").textContent = "Reveal";
  $("#next-photo").disabled = true;
}

function renderPhotoScoreboard(photoState) {
  $("#photo-stage").innerHTML = `
    <div class="photo-scoreboard">
      <strong>Scores - Manche ${photoState.currentRound}</strong>
      ${Object.entries(photoState.scores || {})
        .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))
        .map(([id, score]) => `<span>${cleanText(photoState.names?.[id] || "Joueur")} : ${score.score || 0} pts - serie x${score.streak || 0}</span>`)
        .join("")}
    </div>
  `;
  $("#vote-grid").innerHTML = "";
  $("#next-photo").textContent = "Manche suivante";
  $("#next-photo").disabled = !isRoomHost();
}

function collectFiles(event) {
  state.photo.pool = [...event.target.files];
  state.photo.files = pickRandomPhotoFiles(state.photo.pool);
  renderPhotoRoulette();
}

function pickRandomPhotoFiles(files) {
  return [...files].sort(() => Math.random() - .5).slice(0, photoRequiredMedia());
}

async function getVideoDuration(file) {
  if (!file.type.startsWith("video/")) return 0;
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration || 0);
    };
    video.onerror = () => resolve(999);
    video.src = URL.createObjectURL(file);
  });
}

async function validatePhotoFrame() {
  const photoState = cloneData(getPhotoState());
  if (!photoState || photoState.status !== "media_selection") return;
  if (isRoomHost() && allPhotoFramesReady(photoState)) {
    await startPhotoGameplay(photoState);
    return;
  }
  const required = photoRequiredMedia(photoState.roundCount);
  if (state.photo.files.length < required) {
    showMessage(`Il faut ${required} medias.`);
    return;
  }
  state.photo.uploading = true;
  state.photo.uploadProgress = "Verification des fichiers";
  renderPhotoRoulette();
  const media = [];
  for (const [index, file] of state.photo.files.slice(0, required).entries()) {
    state.photo.uploadProgress = `Media ${index + 1}/${required}`;
    renderPhotoRoulette();
    const duration = await getVideoDuration(file);
    if (duration > 30) {
      showMessage("Les videos doivent durer moins de 30 secondes.");
      state.photo.uploading = false;
      state.photo.uploadProgress = "";
      renderPhotoRoulette();
      return;
    }
    const type = file.type.startsWith("video/") ? "video" : "photo";
    const path = `${state.currentRoomId}/${state.user.id}/${Date.now()}-${index}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const upload = await db.storage.from(PHOTO_BUCKET).upload(path, file, { upsert: true, contentType: file.type });
    if (upload.error) {
      showMessage("Upload impossible: " + (upload.error.message || "verifie le bucket photo-roulette."));
      state.photo.uploading = false;
      state.photo.uploadProgress = "";
      renderPhotoRoulette();
      return;
    }
    const publicUrl = db.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
    media.push({ id: path, ownerId: state.user.id, type, url: publicUrl, duration, alreadyUsed: false });
  }
  photoState.frames[state.user.id] = { ready: true, media };
  photoState.names[state.user.id] = state.user.pseudo;
  photoState.nameSkins ||= {};
  photoState.nameSkins[state.user.id] = state.user.equippedNameSkin || null;
  photoState.sequence = Number(photoState.sequence || 0) + 1;
  state.photo.files = [];
  state.photo.uploading = false;
  state.photo.uploadProgress = "";
  await savePhotoState(photoState);
}

function allPhotoFramesReady(photoState) {
  return state.players.length > 1 && state.players.every((player) => photoState.frames?.[player.id]?.ready);
}

async function startPhotoGameplay(photoState = cloneData(getPhotoState())) {
  await savePhotoState(selectNextPhotoMedia(photoState));
}

function selectNextPhotoMedia(photoState) {
  const recent = photoState.recentOwners || [];
  const blockedOwner = recent.length >= 2 && recent.at(-1) === recent.at(-2) ? recent.at(-1) : "";
  const allMedia = Object.values(photoState.frames || {}).flatMap((frame) => frame.media || []).filter((media) => !media.alreadyUsed);
  let candidates = allMedia.filter((media) => media.ownerId !== blockedOwner);
  if (!candidates.length) candidates = allMedia;
  candidates.sort((a, b) => (photoState.ownerCounts?.[a.ownerId] || 0) - (photoState.ownerCounts?.[b.ownerId] || 0));
  const chosen = candidates[0];
  if (!chosen) {
    photoState.status = "finished";
    return photoState;
  }
  Object.values(photoState.frames || {}).forEach((frame) => {
    (frame.media || []).forEach((media) => {
      if (media.id === chosen.id) media.alreadyUsed = true;
    });
  });
  const votingMs = chosen.type === "photo" ? 5000 : Math.min(Math.max((chosen.duration || 5) * 1000, 3000), 10000);
  photoState.currentRound = Number(photoState.currentRound || 0) + 1;
  photoState.currentMedia = chosen;
  photoState.votes = {};
  photoState.status = "voting";
  photoState.phaseEndsAt = Date.now() + votingMs;
  photoState.recentOwners = [...recent, chosen.ownerId].slice(-2);
  photoState.ownerCounts[chosen.ownerId] = Number(photoState.ownerCounts[chosen.ownerId] || 0) + 1;
  photoState.sequence = Number(photoState.sequence || 0) + 1;
  return photoState;
}

async function vote(playerId) {
  const photoState = cloneData(getPhotoState());
  if (!photoState || photoState.status !== "voting" || !photoState.currentMedia) return;
  photoState.votes ||= {};
  photoState.votes[state.user.id] = playerId;
  photoState.sequence = Number(photoState.sequence || 0) + 1;
  await savePhotoState(photoState);
  if (isRoomHost() && Object.keys(photoState.votes).length >= state.players.length) {
    await revealPhotoRound(photoState);
  }
}

async function revealPhotoRound(photoState = cloneData(getPhotoState())) {
  if (!isRoomHost() || !photoState || photoState.status !== "voting") return;
  const ownerId = photoState.currentMedia.ownerId;
  Object.keys(photoState.scores || {}).forEach((id) => {
    const correct = photoState.votes?.[id] === ownerId;
    if (correct) {
      photoState.scores[id].streak = Number(photoState.scores[id].streak || 0) + 1;
      photoState.scores[id].correct = Number(photoState.scores[id].correct || 0) + 1;
      photoState.scores[id].score = Number(photoState.scores[id].score || 0) + 100 + (photoState.scores[id].streak * 10);
    } else {
      photoState.scores[id].streak = 0;
    }
  });
  photoState.status = "reveal";
  photoState.phaseEndsAt = Date.now() + 2200;
  photoState.sequence = Number(photoState.sequence || 0) + 1;
  await savePhotoState(photoState);
}

async function showPhotoScoreboard(photoState = cloneData(getPhotoState())) {
  if (!isRoomHost() || !photoState || photoState.status !== "reveal") return;
  photoState.status = "scoreboard";
  photoState.phaseEndsAt = Date.now() + 5000;
  photoState.sequence = Number(photoState.sequence || 0) + 1;
  await savePhotoState(photoState);
}

async function nextPhoto() {
  const photoState = cloneData(getPhotoState());
  if (!isRoomHost() || !photoState || photoState.status !== "scoreboard") return;
  if (photoState.currentRound >= photoState.roundCount) {
    photoState.status = "finished";
    photoState.sequence = Number(photoState.sequence || 0) + 1;
    await savePhotoState(photoState);
    return;
  }
  await savePhotoState(selectNextPhotoMedia(photoState));
}

function schedulePhotoHostPhase(photoState) {
  clearTimeout(state.photo.phaseTimer);
  if (!isRoomHost() || !photoState?.phaseEndsAt) return;
  const delay = Math.max(250, photoState.phaseEndsAt - Date.now());
  state.photo.phaseTimer = setTimeout(() => {
    const latest = cloneData(getPhotoState());
    if (latest?.status === "voting") revealPhotoRound(latest);
    if (latest?.status === "reveal") showPhotoScoreboard(latest);
    if (latest?.status === "scoreboard") nextPhoto();
  }, delay);
}

function isLiarsChaosMode(gameState = getLiarsState()) {
  return (gameState?.mode || state.settings.liars.mode || "normal") === "chaos";
}

function isLiarsDead21Mode(gameState = getLiarsState()) {
  return (gameState?.mode || state.settings.liars.mode || "normal") === "dead21";
}

function buildDeck(mode = state.settings.liars.mode || "normal", playerCount = 4) {
  if (mode === "chaos") {
    const count = Number(playerCount || 4);
    if (count >= 6) {
      return [
        ...Array(7).fill("Roi"),
        ...Array(7).fill("Dame"),
        ...Array(2).fill("Demon"),
        ...Array(2).fill("Chasseur"),
        "FarWest",
      ].sort(() => Math.random() - 0.5);
    }
    if (count === 5) {
      return [
        ...Array(7).fill("Roi"),
        ...Array(7).fill("Dame"),
        "Demon",
        "Chasseur",
        "FarWest",
      ].sort(() => Math.random() - 0.5);
    }
    if (count === 4) {
      return [
        ...Array(5).fill("Roi"),
        ...Array(5).fill("Dame"),
        "Demon",
        "Chasseur",
        "FarWest",
      ].sort(() => Math.random() - 0.5);
    }
    return [
      ...Array(5).fill("Roi"),
      ...Array(5).fill("Dame"),
      "Demon",
      "Chasseur",
      ...(count >= 3 ? ["FarWest"] : []),
    ].sort(() => Math.random() - 0.5);
  }
  return [
    ...Array(6).fill("As"),
    ...Array(6).fill("Roi"),
    ...Array(6).fill("Dame"),
    ...Array(2).fill("Joker"),
  ].sort(() => Math.random() - 0.5);
}

function liarsCardsPerPlayer(mode = state.settings.liars.mode || "normal") {
  return mode === "chaos" ? 3 : 5;
}

function dealLiarsHands(playerIds, mode = state.settings.liars.mode || "normal") {
  const cardsPerPlayer = liarsCardsPerPlayer(mode);
  const ids = playerIds.slice();
  const hasChaosConflict = (hands) => mode === "chaos" && Object.values(hands).some(chaosHandHasInvalidSpecialMix);

  for (let attempt = 0; attempt < 800; attempt += 1) {
    const deck = buildDeck(mode, ids.length);
    const hands = Object.fromEntries(ids.map((id, index) => [
      id,
      deck.slice(index * cardsPerPlayer, index * cardsPerPlayer + cardsPerPlayer),
    ]));
    ensureChaosFarWestDealt(hands, deck, mode);
    if (Object.values(hands).every((hand) => hand.length === cardsPerPlayer) && !hasChaosConflict(hands)) {
      return hands;
    }
  }

  const deck = buildDeck(mode, ids.length);
  const hands = Object.fromEntries(ids.map((id, index) => [
    id,
    deck.slice(index * cardsPerPlayer, index * cardsPerPlayer + cardsPerPlayer),
  ]));
  ensureChaosFarWestDealt(hands, deck, mode);
  if (hasChaosConflict(hands)) {
    repairChaosSpecialHands(hands, ids);
  }
  return hands;
}

function chaosHandHasInvalidSpecialMix(hand = []) {
  const hasDemon = hand.includes("Demon");
  const hasHunter = hand.includes("Chasseur");
  const hasFarWest = hand.includes("FarWest");
  return (hasDemon && hasHunter) || (hasFarWest && (hasDemon || hasHunter));
}

function repairChaosSpecialHands(hands, ids) {
  ids.forEach((conflictId) => {
    const hand = hands[conflictId] || [];
    while (chaosHandHasInvalidSpecialMix(hand)) {
      const specialToMove = hand.includes("FarWest")
        ? (hand.includes("Demon") ? "Demon" : "Chasseur")
        : "Chasseur";
      const specialIndex = hand.indexOf(specialToMove);
      const swapId = ids.find((id) => id !== conflictId && (hands[id] || []).some((card) => !["Demon", "Chasseur", "FarWest"].includes(card)));
      if (!swapId || specialIndex < 0) break;
      const normalIndex = hands[swapId].findIndex((card) => !["Demon", "Chasseur", "FarWest"].includes(card));
      [hand[specialIndex], hands[swapId][normalIndex]] = [hands[swapId][normalIndex], hand[specialIndex]];
    }
  });
}

function ensureChaosFarWestDealt(hands, deck, mode) {
  if (mode !== "chaos" || !deck.includes("FarWest")) return;
  if (Object.values(hands).some((hand) => hand.includes("FarWest"))) return;
  const playerIds = Object.keys(hands).filter((id) => hands[id]?.length);
  const targetId = playerIds[Math.floor(Math.random() * playerIds.length)];
  if (!targetId) return;
  const replaceIndex = hands[targetId].findIndex((card) => !["Demon", "Chasseur", "FarWest"].includes(card));
  hands[targetId][replaceIndex >= 0 ? replaceIndex : 0] = "FarWest";
}

function randomTarget(mode = state.settings.liars.mode || "normal", playerCount = 4) {
  if (mode === "chaos") {
    const targets = ["Roi", "Dame"];
    return targets[Math.floor(Math.random() * targets.length)];
  }
  return ["As", "Roi", "Dame"][Math.floor(Math.random() * 3)];
}

function cardImage(card) {
  const paths = {
    As: "./Image%20liarsbar/as.png",
    Roi: "./Image%20liarsbar/roi.png",
    Dame: "./Image%20liarsbar/dame.png",
    Demon: "./Image%20liarsbar/demon.png",
    Chasseur: "./Image%20liarsbar/chasseur.png",
    FarWest: "./Image%20liarsbar/farwest.png",
    Joker: "./joker.png?v=3",
    Back: "./Image%20liarsbar/doscartes.png",
    Accuse: "./Image%20liarsbar/accuser.png",
    Life: "./vie.png?v=1",
    Roulette: "./Image%20liarsbar/roulette.png",
    Mort: "./mort.png?v=1",
  };
  return paths[card] || "";
}

function renderCardFace(card, alt = "") {
  if (card === "Back") {
    return `<img src="${cardImage("Back")}" alt="" />`;
  }
  if (card === "Joker") {
    return `<img src="${cardImage("Joker")}" alt="${alt || card}" onerror="this.onerror=null;this.src='./Image%20liarsbar/joker.png';" />`;
  }
  return `<img src="${cardImage(card)}" alt="${alt || card}" />`;
}

function pluralS(count) {
  return Number(count) > 1 ? "s" : "";
}

function targetLabel(target, count = 1) {
  if (target === "As") return "As";
  return `${target}${pluralS(count)}`;
}

function seatDirection(seatIndex) {
  return {
    0: "bottom",
    1: "top",
    2: "left",
    3: "right",
    4: "left",
    5: "right",
  }[seatIndex] || "center";
}

function chaosDeathTargetStyle(seatIndex) {
  const seat = Number.isFinite(seatIndex) ? $(`#seat-${seatIndex}`) : null;
  if (!seat) return "";
  const rect = seat.getBoundingClientRect();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const targetX = rect.left + rect.width / 2 - centerX;
  const targetY = rect.top + rect.height / 2 - centerY;
  return `--death-x:${Math.round(targetX)}px; --death-y:${Math.round(targetY)}px;`;
}

function seatCenterOffset(seatIndex) {
  const seat = Number.isFinite(seatIndex) ? $(`#seat-${seatIndex}`) : null;
  if (!seat) return { x: 0, y: 0 };
  const rect = seat.getBoundingClientRect();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  return {
    x: rect.left + rect.width / 2 - centerX,
    y: rect.top + rect.height / 2 - centerY,
  };
}

function chaosGunAimStyle(seatIndex, playerCount = 4, shooterSeatIndex = null) {
  const seat = Number.isFinite(seatIndex) ? $(`#seat-${seatIndex}`) : null;
  if (!seat) return "";
  const rect = seat.getBoundingClientRect();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;
  const dx = targetX - centerX;
  const dy = targetY - centerY;
  const direction = seatDirection(seatIndex);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const shooterOffset = seatCenterOffset(Number.isFinite(shooterSeatIndex) ? shooterSeatIndex : null);
  const endX = clamp(dx * .22, -92, 92);
  const endY = clamp(dy * .18, -76, 76);
  const motion = `--hunter-start-x:${Math.round(shooterOffset.x)}px; --hunter-start-y:${Math.round(shooterOffset.y)}px; --hunter-end-x:${Math.round(endX)}px; --hunter-end-y:${Math.round(endY)}px;`;
  const straightAim = {
    left: "--gun-rotation:0deg; --gun-flip:1; --gun-kick-x:-18px; --flash-x:calc(-50% - 142px); --flash-y:-50%;",
    right: "--gun-rotation:0deg; --gun-flip:-1; --gun-kick-x:-18px; --flash-x:calc(-50% + 142px); --flash-y:-50%;",
    top: "--gun-rotation:90deg; --gun-flip:1; --gun-kick-y:18px; --flash-x:-50%; --flash-y:calc(-50% - 142px);",
    bottom: "--gun-rotation:-90deg; --gun-flip:1; --gun-kick-y:-18px; --flash-x:-50%; --flash-y:calc(-50% + 142px);",
  };

  if (Number(playerCount || 0) >= 5 && (direction === "left" || direction === "right")) {
    const baseAngle = Math.atan2(dy, Math.max(1, Math.abs(dx))) * 180 / Math.PI;
    const rotation = clamp((direction === "left" ? -baseAngle : baseAngle) * .55, -20, 20);
    const flashOffset = clamp(dy * .34, -54, 54);
    const kickY = clamp(-flashOffset * .12, -7, 7);
    const flip = direction === "right" ? -1 : 1;
    const flashX = direction === "right" ? "calc(-50% + 142px)" : "calc(-50% - 142px)";
    return `${motion} --gun-rotation:${rotation.toFixed(1)}deg; --gun-flip:${flip}; --flash-x:${flashX}; --flash-y:calc(-50% + ${Math.round(flashOffset)}px); --gun-kick-y:${kickY.toFixed(1)}px;`;
  }

  if (Number(playerCount || 0) >= 5 && (direction === "top" || direction === "bottom")) {
    const baseAngle = Math.atan2(dx, Math.max(1, Math.abs(dy))) * 180 / Math.PI;
    const rotation = (direction === "top" ? 90 : -90) + clamp(baseAngle * .35, -12, 12);
    const flashOffset = clamp(dx * .2, -32, 32);
    return `${motion} --gun-rotation:${rotation.toFixed(1)}deg; --flash-x:calc(-50% + ${Math.round(flashOffset)}px);`;
  }

  return `${motion} ${straightAim[direction] || straightAim.left}`;
}

function liarsDynamicGunAimStyle(seatIndex, playerCount = 4, shooterSeatIndex = null) {
  return chaosGunAimStyle(seatIndex, playerCount, shooterSeatIndex);
}

function farWestDuelGunAimStyle(shooterSeatIndex, targetSeatIndex, playerCount = 4) {
  const fivePlus = Number(playerCount || 0) >= 5;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const table = $(".liars-table");
  const tableRect = table?.getBoundingClientRect?.();
  const viewportCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
  const seatOffset = (seatIndex) => {
    const numeric = Number(seatIndex);
    if (!Number.isFinite(numeric)) return { x: 0, y: 0 };
    return ({
      0: { x: 0, y: 30 },
      1: { x: 0, y: -30 },
      2: { x: -38, y: fivePlus ? 10 : 0 },
      4: { x: -38, y: -18 },
      3: { x: 38, y: fivePlus ? 10 : 0 },
      5: { x: 38, y: -18 },
    }[numeric] || { x: 0, y: 0 });
  };
  const seatCenter = (seatIndex) => {
    const numeric = Number(seatIndex);
    if (!Number.isFinite(numeric)) return null;
    const seat = $(`#seat-${numeric}`);
    const rect = seat?.getBoundingClientRect?.();
    if (rect?.width && rect?.height) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    const fallback = seatOffset(numeric);
    const basisW = tableRect?.width || window.innerWidth;
    const basisH = tableRect?.height || window.innerHeight;
    return {
      x: viewportCenter.x + fallback.x * basisW / 100,
      y: viewportCenter.y + fallback.y * basisH / 100,
    };
  };
  const shooter = seatCenter(shooterSeatIndex) || viewportCenter;
  const target = seatCenter(targetSeatIndex) || viewportCenter;
  const end = viewportCenter;
  const aimDx = target.x - end.x;
  const aimDy = target.y - end.y;
  const horizontal = Math.abs(aimDx) >= Math.abs(aimDy);
  let rotation = 0;
  let flip = 1;
  let flashX = "calc(-50% - 142px)";
  let flashY = "-50%";

  if (horizontal) {
    flip = aimDx >= 0 ? -1 : 1;
    rotation = clamp(Math.atan2(aimDy, Math.max(1, Math.abs(aimDx))) * 180 / Math.PI * (aimDx >= 0 ? 1 : -1), -24, 24);
    flashX = aimDx >= 0 ? "calc(-50% + 142px)" : "calc(-50% - 142px)";
    flashY = `calc(-50% + ${Math.round(clamp(aimDy * .16, -38, 38))}px)`;
  } else {
    rotation = (aimDy < 0 ? 90 : -90) + clamp(Math.atan2(aimDx, Math.max(1, Math.abs(aimDy))) * 180 / Math.PI * .35, -16, 16);
    flashX = `calc(-50% + ${Math.round(clamp(aimDx * .12, -34, 34))}px)`;
    flashY = aimDy < 0 ? "calc(-50% - 142px)" : "calc(-50% + 142px)";
  }

  return [
    `--hunter-start-x:${Math.round(shooter.x - viewportCenter.x)}px`,
    `--hunter-start-y:${Math.round(shooter.y - viewportCenter.y)}px`,
    `--hunter-end-x:0px`,
    `--hunter-end-y:0px`,
    `--fw-start-x:${Math.round(shooter.x - viewportCenter.x)}px`,
    `--fw-start-y:${Math.round(shooter.y - viewportCenter.y)}px`,
    `--fw-end-x:0px`,
    `--fw-end-y:0px`,
    `--fw-start-left:${Math.round(shooter.x)}px`,
    `--fw-start-top:${Math.round(shooter.y)}px`,
    `--fw-end-left:${Math.round(end.x)}px`,
    `--fw-end-top:${Math.round(end.y)}px`,
    `--gun-rotation:${rotation.toFixed(1)}deg`,
    `--gun-flip:${flip}`,
    `--flash-x:${flashX}`,
    `--flash-y:${flashY}`,
    `--gun-kick-x:${Math.round(clamp(aimDx * .025, -18, 18))}px`,
    `--gun-kick-y:${Math.round(clamp(aimDy * .025, -18, 18))}px`,
  ].join(";") + ";";
}

function seatBadgeTargetRect(seat) {
  if (!seat) return null;
  const badge = seat.querySelector(".life-badge");
  const name = seat.querySelector("strong");
  const rects = [badge, name]
    .map((node) => node?.getBoundingClientRect?.())
    .filter((rect) => rect && rect.width && rect.height);
  if (!rects.length) return seat.getBoundingClientRect();
  return rects.reduce((merged, rect) => ({
    left: Math.min(merged.left, rect.left),
    top: Math.min(merged.top, rect.top),
    right: Math.max(merged.right, rect.right),
    bottom: Math.max(merged.bottom, rect.bottom),
    width: Math.max(merged.right, rect.right) - Math.min(merged.left, rect.left),
    height: Math.max(merged.bottom, rect.bottom) - Math.min(merged.top, rect.top),
  }), rects[0]);
}

function overlayAccuseStyle(seatIndex, playerCount = 4) {
  if (!Number.isFinite(seatIndex)) return "";
  const seat = $(`#seat-${seatIndex}`);
  if (!seat) return "";
  const rect = seatBadgeTargetRect(seat);
  const table = $(".liars-table");
  const tableRect = table?.getBoundingClientRect?.();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const marginX = Number(playerCount || 0) >= 5 ? 48 : 56;
  const marginY = Number(playerCount || 0) >= 5 ? 46 : 54;
  const minX = tableRect ? tableRect.left + marginX : marginX;
  const maxX = tableRect ? tableRect.right - marginX : window.innerWidth - marginX;
  const minY = tableRect ? tableRect.top + marginY : marginY;
  const maxY = tableRect ? tableRect.bottom - marginY : window.innerHeight - marginY;
  const targetX = clamp(rect.left + rect.width / 2, minX, maxX);
  const targetY = clamp(rect.top + rect.height / 2, minY, maxY);
  return `left:${Math.round(targetX)}px; top:${Math.round(targetY)}px; --aim-x:0px; --aim-y:0px;`;
}

function liarsSeatAccuseMarkVisible(gameState, playerId) {
  const reveal = gameState?.reveal || null;
  if (!reveal?.id || !playerId) return false;
  if (reveal.dead21ScoreReveal || reveal.dead21Final) return false;
  const elapsed = Date.now() - liarsRevealStartedAt(reveal);
  if (elapsed > 1550) return false;
  return reveal.accuserId === playerId;
}

function dead21TableTokenTargetStyle(seatIndex) {
  const seat = Number.isFinite(seatIndex) ? $(`#seat-${seatIndex}`) : null;
  const table = $(".liars-table");
  if (!seat || !table) return "";
  const seatRect = seat.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  const originX = tableRect.left + tableRect.width / 2;
  const originY = tableRect.top + tableRect.height / 2;
  const targetX = seatRect.left + seatRect.width / 2;
  const targetY = seatRect.top + seatRect.height / 2;
  return `left:${Math.round(originX)}px; top:${Math.round(originY)}px; --death-x:${Math.round(targetX - originX)}px; --death-y:${Math.round(targetY - originY)}px;`;
}

function chaosSpecialLabel(special) {
  return {
    demon: "DÉMON",
    hunter: "CHASSEUR",
    farwest: "FAR WEST",
  }[special] || "CHAOS";
}

function chaosSpecialImageKey(special) {
  return {
    demon: "Demon",
    hunter: "Chasseur",
    farwest: "FarWest",
  }[special] || "Demon";
}

function renderLiarsOverlay(reveal, seatByPlayer = {}) {
  const overlay = $("#liars-overlay");
  if (!overlay) return;
  const gameState = getLiarsState();
  const roundIntro = gameState?.roundIntro;
  if (roundIntro?.id) {
    const overlayKey = `round:${roundIntro.id}`;
    if (overlay.dataset.overlayKey === overlayKey) return;
    overlay.dataset.overlayKey = overlayKey;
    overlay.className = "liars-overlay active round-mode";
    overlay.innerHTML = `
      <div class="round-splash">
        <strong>Tour ${roundIntro.round}</strong>
        <img src="${cardImage(roundIntro.target)}" alt="" />
      </div>
    `;
    return;
  }

  if (!reveal?.id) {
    if (overlay.dataset.overlayKey) {
      overlay.innerHTML = "";
      overlay.className = "liars-overlay";
      overlay.dataset.overlayKey = "";
    }
    return;
  }

  const accuserDirection = seatDirection(seatByPlayer[reveal.accuserId]);
  const loserDirection = seatDirection(seatByPlayer[reveal.loserId]);
  const accuserSeat = seatByPlayer[reveal.accuserId];
  const accuseTargetSeat = Number.isFinite(accuserSeat) ? accuserSeat : seatByPlayer[reveal.accusedId];
  const roulette = reveal.roulette || null;
  const chaosShots = reveal.chaosShots || [];
  const special = reveal.special || "";
  const elapsed = Date.now() - liarsRevealStartedAt(reveal);
  const activeShotIndex = chaosActiveShotIndex(reveal);
  const activeShot = activeShotIndex >= 0 ? chaosShots[activeShotIndex] : null;
  const showChaosSpecial = Boolean(chaosShots.length && elapsed < CHAOS_FIRST_SHOT_DELAY);
  const playerCount = Object.keys(seatByPlayer || {}).length;
  const seatForPlayer = (playerId) => {
    if (!playerId) return null;
    if (Number.isFinite(seatByPlayer[playerId])) return seatByPlayer[playerId];
    const entry = Object.entries(seatByPlayer || {}).find(([id]) => String(id) === String(playerId));
    return Number.isFinite(entry?.[1]) ? entry[1] : null;
  };
  const overlayKey = `reveal:${reveal.id}:${accuserDirection}:${accuseTargetSeat}:${loserDirection}:${special}:${roulette ? roulette.finalPosition : "classic"}:${chaosShots.length}:${activeShotIndex}:${showChaosSpecial ? 1 : 0}:${reveal.dead21ScoreReveal ? reveal.playerId : ""}`;
  if (overlay.dataset.overlayKey === overlayKey) return;
  overlay.dataset.overlayKey = overlayKey;
  if (reveal.dead21ScoreReveal) {
    const real = Number(reveal.realScore || 0);
    const announced = Number(reveal.announcedScore || 0);
    const delta = real - announced;
    const originStyle = dead21ScoreRevealOriginStyle(seatByPlayer[reveal.playerId]);
    overlay.className = `liars-overlay active dead21-score-reveal-overlay score-phase-${reveal.scorePhase || "announced"}`;
    overlay.innerHTML = `
      <div class="dead21-score-reveal-card ${reveal.punished ? "punished" : ""}" style="${originStyle}">
        <strong>${renderName(reveal.playerName || "Joueur", reveal.nameSkin)}</strong>
        <div class="dead21-score-flip">
          <small class="score-announced">Main annoncée: ${announced} pts</small>
          <small class="score-real">Main réelle: ${real} pts</small>
        </div>
        <em>${reveal.punished ? "Trop loin de 21" : delta === 0 ? "Annonce juste" : delta > 0 ? `+${delta} pts réels` : `${delta} pts réels`}</em>
      </div>
    `;
    return;
  }
  if (reveal.dead21Final && roulette) {
    const targetSeat = seatByPlayer[reveal.loserId];
    const targetDirection = seatDirection(targetSeat);
    const gunImage = weaponSkinUrl(shotWeaponSkin(reveal.roulette, reveal.shooterId || reveal.loserId, gameState));
    const gunAimStyle = liarsDynamicGunAimStyle(targetSeat, playerCount, seatByPlayer[reveal.shooterId || reveal.loserId]);
    overlay.className = `liars-overlay active dead21-final-overlay roulette-target-${targetDirection} death-${targetDirection}`;
    overlay.innerHTML = `
      <div class="roulette-splash dead21-final-roulette" style="${gunAimStyle}">
        <img class="roulette-gun" src="${escapeAttr(gunImage)}" alt="" onerror="this.onerror=null;this.src='${DEFAULT_WEAPON_IMAGE}';" />
        ${roulette.dead ? `<i class="roulette-gun-flash"></i>` : ""}
        <span>${cleanLogText(reveal.loserName || "Joueur")} ${roulette.dead ? "meurt" : "survit"}</span>
      </div>
    `;
    return;
  }
  if (chaosShots.length) {
    overlay.className = `liars-overlay active chaos-mode-overlay players-${Math.max(1, playerCount)} chaos-${special || "special"} accuse-${accuserDirection} accuse-seat-${accuseTargetSeat}`;
    overlay.innerHTML = `
      ${showChaosSpecial ? `<div class="chaos-special-splash">
        <strong>${chaosSpecialLabel(special)}</strong>
        <img class="chaos-card" src="${cardImage(chaosSpecialImageKey(special))}" alt="" />
      </div>` : ""}
      <div class="chaos-shot-list">
        ${activeShot ? (() => {
          const inferredShooterId = special === "farwest"
            ? (activeShot.shooterId || (activeShotIndex % 2 === 0 ? reveal.accuserId : reveal.accusedId))
            : activeShot.shooterId;
          const inferredTargetId = activeShot.playerId || (special === "farwest" && inferredShooterId === reveal.accuserId ? reveal.accusedId : reveal.accuserId);
          const targetSeat = seatForPlayer(inferredTargetId);
          const targetDirection = seatDirection(targetSeat);
          const shooterSeat = seatForPlayer(inferredShooterId);
          const shooterDirection = inferredShooterId ? seatDirection(shooterSeat) : "center";
          const gunImage = weaponSkinUrl(shotWeaponSkin(activeShot, inferredShooterId || inferredTargetId, gameState));
          const gunAimStyle = special === "farwest"
            ? farWestDuelGunAimStyle(shooterSeat, targetSeat, playerCount)
            : liarsDynamicGunAimStyle(targetSeat, playerCount, shooterSeat);
          return `
          <div class="chaos-roulette-splash roulette-target-${targetDirection} death-${targetDirection} shooter-${shooterDirection} shooter-seat-${shooterSeat} target-seat-${targetSeat}" style="${gunAimStyle}">
            <div class="demon-gun-shot" style="${gunAimStyle}">
              <img class="demon-gun-img" src="${escapeAttr(gunImage)}" alt="" onerror="this.onerror=null;this.src='${DEFAULT_WEAPON_IMAGE}';" />
              ${activeShot.dead ? `<i class="demon-gun-flash"></i>` : ""}
            </div>
            <span>${special === "farwest" && activeShot.shooterName ? `${cleanLogText(activeShot.shooterName)} tire sur ${cleanLogText(activeShot.name || "Joueur")} - ${activeShot.dead ? "meurt" : "survit"}` : `${cleanLogText(activeShot.name || "Joueur")} ${activeShot.dead ? "meurt" : "survit"}`}</span>
          </div>
        `})() : ""}
      </div>
    `;
    return;
  }
  if (roulette) {
    overlay.className = `liars-overlay active roulette-mode accuse-${accuserDirection} accuse-seat-${accuseTargetSeat} roulette-target-${loserDirection} death-${loserDirection}`;
    const resultLabel = roulette.dead
      ? `${cleanLogText(reveal.loserName || "Joueur")} meurt`
      : `${cleanLogText(reveal.loserName || "Joueur")} survit`;
    const gunImage = weaponSkinUrl(shotWeaponSkin(reveal.roulette, reveal.shooterId || reveal.loserId, gameState));
    const loserSeat = seatByPlayer[reveal.loserId];
    const gunAimStyle = liarsDynamicGunAimStyle(loserSeat, playerCount, seatByPlayer[reveal.shooterId || reveal.loserId]);
    overlay.innerHTML = `
      <div class="roulette-splash" style="${gunAimStyle}">
        <img class="roulette-gun" src="${escapeAttr(gunImage)}" alt="" onerror="this.onerror=null;this.src='${DEFAULT_WEAPON_IMAGE}';" />
        ${roulette.dead ? `<i class="roulette-gun-flash"></i>` : ""}
        <span>${resultLabel}</span>
      </div>
    `;
    return;
  }
  overlay.className = `liars-overlay active accuse-${accuserDirection} accuse-seat-${accuseTargetSeat} life-${loserDirection}`;
  overlay.innerHTML = `
    <img class="overlay-life" src="${cardImage("Life")}" alt="" />
  `;
}

function isLiarsBlocked(gameState = getLiarsState()) {
  return Boolean(gameState?.roundIntro?.id || gameState?.reveal?.id);
}

function showTurnToast(playerName, turnId) {
  const overlay = $("#liars-overlay");
  if (!overlay || state.liars.turnToastId === turnId) return;
  state.liars.turnToastId = turnId;
  clearTimeout(state.liars.turnToastTimer);
  overlay.className = "liars-overlay active turn-mode";
  overlay.innerHTML = `<div class="turn-splash">${cleanLogText(playerName)} doit jouer</div>`;
  state.liars.turnToastTimer = setTimeout(() => {
    if (!isLiarsBlocked()) {
      overlay.innerHTML = "";
      overlay.className = "liars-overlay";
    }
  }, 3250);
}

function liarsEvent(type, text) {
  return { type, text: String(text || "").replace(/\.+$/g, ""), at: Date.now() };
}

function pushLiarsEvents(gameState, events) {
  const nextEvents = Array.isArray(events) ? events : [events];
  gameState.events = [...(gameState.events || []), ...nextEvents].slice(-40);
  gameState.history = gameState.events.map((event) => event.text).slice(-8);
}

function isLiarsRouletteMode(gameState = getLiarsState()) {
  return ["roulette", "chaos"].includes(gameState?.mode || state.settings.liars.mode || "normal");
}

function createRouletteBarrel() {
  return {
    bulletPosition: Math.floor(Math.random() * 6),
    usedPositions: [],
  };
}

function resetRouletteBarrel(gameState, playerId) {
  if (!playerId) return;
  gameState.roulette ||= {};
  gameState.roulette[playerId] = createRouletteBarrel();
}

function ensureRouletteBarrels(gameState) {
  gameState.roulette ||= {};
  (gameState.order || []).forEach((id) => {
    gameState.roulette[id] ||= createRouletteBarrel();
    gameState.roulette[id].usedPositions ||= [];
    if (!Number.isFinite(gameState.roulette[id].bulletPosition)) {
      gameState.roulette[id].bulletPosition = Math.floor(Math.random() * 6);
    }
  });
  return gameState.roulette;
}

function shootRoulette(gameState, playerId) {
  const barrels = ensureRouletteBarrels(gameState);
  const barrel = barrels[playerId] || createRouletteBarrel();
  barrels[playerId] = barrel;
  const used = new Set(barrel.usedPositions || []);
  const available = [0, 1, 2, 3, 4, 5].filter((position) => !used.has(position));
  const finalPosition = available[Math.floor(Math.random() * available.length)] ?? barrel.bulletPosition;
  const dead = finalPosition === barrel.bulletPosition;
  if (!dead && !barrel.usedPositions.includes(finalPosition)) {
    barrel.usedPositions.push(finalPosition);
  }
  return {
    finalPosition,
    dead,
    remainingBefore: available.length,
    usedAfter: barrel.usedPositions.length,
  };
}

function rouletteBadge(gameState, playerId, isHit = false, reveal = null) {
  const barrel = gameState.roulette?.[playerId];
  const used = isHit && Number.isFinite(reveal?.roulette?.usedBefore)
    ? reveal.roulette.usedBefore
    : barrel?.usedPositions?.length || 0;
  if (isHit) return `TIR ${used}/6`;
  if ((gameState.lives?.[playerId] || 0) <= 0) return "KO";
  return `TIR ${used}/6`;
}

function nextAliveIdAfter(gameState, playerId) {
  const startIndex = Math.max(0, gameState.order.findIndex((id) => id === playerId));
  for (let offset = 1; offset <= gameState.order.length; offset += 1) {
    const id = gameState.order[(startIndex + offset) % gameState.order.length];
    if ((gameState.lives[id] || 0) > 0) return id;
  }
  return aliveLiarsPlayers(gameState)[0] || "";
}

function ensureLiarsStats(gameState) {
  gameState.stats ||= {};
  gameState.profileStats ||= {};
  gameState.badgeStats ||= {};
  (gameState.order || []).forEach((id) => {
    gameState.stats[id] ||= { accuseOk: 0, accuseWrong: 0 };
    gameState.stats[id].accuseOk = Number(gameState.stats[id].accuseOk || 0);
    gameState.stats[id].accuseWrong = Number(gameState.stats[id].accuseWrong || 0);
    gameState.profileStats[id] ||= {};
    gameState.badgeStats[id] ||= {};
  });
  gameState.eliminationOrder ||= [];
  return gameState.stats;
}

function addLiarsProfileStat(gameState, playerId, key, amount = 1) {
  if (!gameState || !playerId || !key) return;
  gameState.profileStats ||= {};
  gameState.profileStats[playerId] ||= {};
  gameState.profileStats[playerId][key] = Number(gameState.profileStats[playerId][key] || 0) + Number(amount || 0);
}

function setLiarsProfileStatMax(gameState, playerId, key, value) {
  if (!gameState || !playerId || !key) return;
  gameState.profileStats ||= {};
  gameState.profileStats[playerId] ||= {};
  gameState.profileStats[playerId][key] = Math.max(Number(gameState.profileStats[playerId][key] || 0), Number(value || 0));
}

function addLiarsBadgeStat(gameState, playerId, key, amount = 1) {
  if (!gameState || !playerId || !key) return;
  gameState.badgeStats ||= {};
  gameState.badgeStats[playerId] ||= {};
  gameState.badgeStats[playerId][key] = Number(gameState.badgeStats[playerId][key] || 0) + Number(amount || 0);
}

function setLiarsBadgeStatMax(gameState, playerId, key, value) {
  if (!gameState || !playerId || !key) return;
  gameState.badgeStats ||= {};
  gameState.badgeStats[playerId] ||= {};
  gameState.badgeStats[playerId][key] = Math.max(Number(gameState.badgeStats[playerId][key] || 0), Number(value || 0));
}

function setLiarsBadgeFlag(gameState, playerId, key, value = true) {
  if (!gameState || !playerId || !key) return;
  gameState.badgeStats ||= {};
  gameState.badgeStats[playerId] ||= {};
  gameState.badgeStats[playerId][key] = Boolean(value);
}

function liarsCriticalShot(shot) {
  return !shot?.dead && Number(shot.remainingBefore || 0) <= 2;
}

function markChaosSpecialRevealed(gameState, special) {
  if (!gameState || !special) return;
  gameState.badgeGlobal ||= {};
  gameState.badgeGlobal.chaosSpecials ||= {};
  gameState.badgeGlobal.chaosSpecials[special] = true;
}

function markLastUnaccusedBluff(gameState) {
  const last = gameState?.lastPlayBadge;
  if (!last || !last.playerId) return;
  if (last.lied) {
    addLiarsBadgeStat(gameState, last.playerId, "unaccusedBluffs", 1);
    if (Number(last.count || 0) >= 3) setLiarsBadgeFlag(gameState, last.playerId, "allIn", true);
  }
  gameState.lastPlayBadge = null;
}

function recordLiarsRouletteProfileShot(gameState, playerId, shot) {
  if (!playerId || !shot) return;
  addLiarsProfileStat(gameState, playerId, "rouletteShots", 1);
  if (shot.dead) {
    setLiarsBadgeStatMax(gameState, playerId, "maxRouletteSurvivalStreak", Number(gameState.badgeStats?.[playerId]?.rouletteSurvivalStreak || 0));
    gameState.badgeStats ||= {};
    gameState.badgeStats[playerId] ||= {};
    gameState.badgeStats[playerId].rouletteSurvivalStreak = 0;
    if (Number(gameState.round || 1) <= 1) setLiarsBadgeFlag(gameState, playerId, "diedRoundOne", true);
    addLiarsProfileStat(gameState, playerId, "rouletteDeaths", 1);
    const danger = shot.remainingBefore ? 1 / Number(shot.remainingBefore) : 0;
    addLiarsProfileStat(gameState, playerId, "rouletteDeathDangerTotal", danger);
    addLiarsProfileStat(gameState, playerId, "rouletteDeathDangerCount", 1);
  } else {
    addLiarsProfileStat(gameState, playerId, "rouletteSurvived", 1);
    addLiarsBadgeStat(gameState, playerId, "rouletteSurvivalStreak", 1);
    setLiarsBadgeStatMax(gameState, playerId, "maxRouletteSurvivalStreak", Number(gameState.badgeStats?.[playerId]?.rouletteSurvivalStreak || 0));
    if (liarsCriticalShot(shot)) {
      addLiarsProfileStat(gameState, playerId, "criticalSurvivals", 1);
      addLiarsBadgeStat(gameState, playerId, "criticalSurvivals", 1);
      setLiarsBadgeFlag(gameState, playerId, "criticalSurvivedThisGame", true);
    }
  }
}

function markLiarsEliminated(gameState, playerId) {
  if (!playerId) return;
  gameState.eliminationOrder ||= [];
  if (!gameState.eliminationOrder.includes(playerId)) {
    gameState.eliminationOrder.push(playerId);
  }
}

function aliveLiarsPlayers(gameState) {
  return (gameState?.order || []).filter((id) => (gameState.lives[id] || 0) > 0);
}

function playersWithCards(gameState) {
  return aliveLiarsPlayers(gameState).filter((id) => (gameState.hands[id]?.length || 0) > 0);
}

function liarsRewardLabel(rewardType) {
  return {
    accuse_success: "Accusation réussie",
    bluff_success: "Bluff réussi",
    winner: "Victoire",
    second_place: "Deuxième place",
    round_survivor: "Survivant de la manche",
  }[rewardType] || "Bonus";
}

async function awardLiarsReward(gameState, rewardType, rewardedUserId, sourceKey = "") {
  if (!db || !state.currentRoomId || !gameState?.gameId || !rewardedUserId) return 0;
  const rewardKey = `${gameState.gameId}:${rewardType}:${rewardedUserId}:${sourceKey || Number(gameState.version || 0)}`;
  try {
    const { data, error } = await db.rpc("award_liars_reward_rpc", {
      p_room_id: state.currentRoomId,
      p_game_id: gameState.gameId,
      p_reward_type: rewardType,
      p_reward_key: rewardKey,
      p_rewarded_user_id: rewardedUserId,
    });
    if (error) {
      console.warn("Liars reward failed:", error.message || error);
      return 0;
    }
    const amount = Number(data || 0);
    if (amount > 0) {
      gameState.coinRewards ||= {};
      gameState.coinRewardEvents ||= [];
      gameState.coinRewards[rewardedUserId] = Number(gameState.coinRewards[rewardedUserId] || 0) + amount;
      gameState.coinRewardEvents.push({
        userId: rewardedUserId,
        type: rewardType,
        amount,
        key: rewardKey,
      });
    }
    if (rewardedUserId === state.user?.id && amount > 0) {
      await refreshProfile();
    }
    return amount;
  } catch (error) {
    console.warn("Liars reward failed:", error);
    return 0;
  }
}

async function awardLiarsEndRewards(gameState, winnerId, secondId, sourceKey = "end") {
  ensureLiarsStats(gameState);
  if (winnerId) {
    const barrel = gameState.roulette?.[winnerId];
    if (barrel && Number(barrel.usedPositions?.length || 0) >= 3) {
      setLiarsBadgeFlag(gameState, winnerId, "dangerousBarrelWin", true);
    }
    const specials = gameState.badgeGlobal?.chaosSpecials || {};
    if (isLiarsChaosMode(gameState) && specials.demon && specials.hunter && specials.farwest) {
      setLiarsBadgeFlag(gameState, winnerId, "chaosAllSpecialsAlive", true);
    }
  }
  if (winnerId) await awardLiarsReward(gameState, "winner", winnerId, sourceKey);
  if (liarsParticipantCount(gameState) >= 3 && secondId && secondId !== winnerId) {
    await awardLiarsReward(gameState, "second_place", secondId, sourceKey);
  }
  const initialCount = Number(gameState.initialPlayerCount || liarsParticipantCount(gameState));
  const thirdId = thirdPlaceForLiars(gameState, winnerId, secondId);
  if (initialCount >= 5 && thirdId && thirdId !== winnerId && thirdId !== secondId) {
    await awardLiarsReward(gameState, "third_place", thirdId, sourceKey);
  }
}

async function finalizeLiarsProfileStats(gameState = getLiarsState()) {
  if (!db || !state.currentRoomId || !gameState?.gameId || state.liars.profileFinalizeGameId === gameState.gameId) return;
  state.liars.profileFinalizeGameId = gameState.gameId;
  try {
    const { data, error } = await db.rpc("finalize_liars_game_stats_rpc", {
      p_room_id: state.currentRoomId,
    });
    if (error) {
      if (!isMissingRpc(error)) console.warn("Liars profile stats failed:", error.message || error);
      return;
    }
    if (data?.profile && state.user?.id) applyProfileToUser(data.profile);
    state.liars.badgeUnlocks = Array.isArray(data?.newlyUnlockedBadges) ? data.newlyUnlockedBadges : [];
    if (state.screen === "end" && state.game === "liars") renderEnd();
  } catch (error) {
    console.warn("Liars profile stats failed:", error);
  }
}

function secondPlaceForLiars(gameState, fallbackId = "") {
  const eliminated = [...(gameState?.eliminationOrder || [])].filter((id) => id !== gameState?.winner);
  return eliminated.at(-1) || (fallbackId !== gameState?.winner ? fallbackId : "");
}

function thirdPlaceForLiars(gameState, winnerId = gameState?.winner, secondId = "") {
  const eliminated = [...(gameState?.eliminationOrder || [])].filter((id) => id && id !== winnerId && id !== secondId);
  return eliminated.at(-1) || "";
}

function closeBadgeUnlockModal() {
  state.liars.badgeUnlockModalClosedFor = getLiarsState()?.gameId || state.liars.badgeUnlockModalClosedFor || "";
  $("#badge-unlock-modal")?.remove();
}

function renderBadgeUnlockModal(badgeUnlocks = [], gameId = "") {
  $("#badge-unlock-modal")?.remove();
  if (!badgeUnlocks.length || state.liars.badgeUnlockModalClosedFor === gameId) return;
  const items = badgeUnlocks
    .map((badge) => ({ ...LIARS_BADGE_BY_ID[badge.badgeId || badge.badge_id || badge.id], ...badge }))
    .filter((badge) => badge.id || badge.badgeId || badge.badge_id);
  if (!items.length) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="badge-unlock-modal" id="badge-unlock-modal" aria-hidden="false">
      <section class="badge-unlock-panel" role="dialog" aria-modal="true" aria-label="Nouveau badge débloqué">
        <button class="icon-btn modal-close badge-unlock-close" type="button" data-close-badge-unlock aria-label="Fermer">x</button>
        <span class="small-label">Nouveau badge débloqué !</span>
        <div class="badge-unlock-list">
          ${items.map((badge) => `
            <article class="liars-badge-unlock">
              ${renderBadgeImage(badge)}
              <div>
                <strong>${cleanText(badge.name || "Badge")}</strong>
                <small>${cleanText(badge.description || "Défi accompli")}</small>
                <em>Réclamez-le dans votre profil</em>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `);
  $("#badge-unlock-modal")?.addEventListener("click", (event) => {
    if (event.target?.id === "badge-unlock-modal" || event.target.closest("[data-close-badge-unlock]")) {
      closeBadgeUnlockModal();
    }
  });
}

function liarsParticipantCount(gameState) {
  return new Set([
    ...(gameState?.order || []),
    ...Object.keys(gameState?.names || {}),
    ...(gameState?.eliminationOrder || []),
  ].filter(Boolean)).size;
}

function redealLiarsRound(gameState, message = "Nouveau round.", preferredStarterId = "") {
  markLastUnaccusedBluff(gameState);
  const alive = aliveLiarsPlayers(gameState);
  const nextTarget = randomTarget(gameState.mode, alive.length);
  gameState.hands = {
    ...Object.fromEntries((gameState.order || []).map((id) => [id, []])),
    ...dealLiarsHands(alive, gameState.mode),
  };
  gameState.pile = [];
  gameState.lastPlay = null;
  gameState.reveal = null;
  gameState.target = nextTarget;
  gameState.round = Number(gameState.round || 1) + 1;
  const starterId = alive.includes(preferredStarterId) ? preferredStarterId : alive[0];
  gameState.currentIndex = Math.max(0, gameState.order.findIndex((id) => id === starterId));
  gameState.announcement = message;
  gameState.turnText = `Tour de ${gameState.names[starterId] || "Joueur"}.`;
  gameState.roundIntro = {
    id: `${Date.now()}-${gameState.round}`,
    round: gameState.round,
    target: nextTarget,
  };
  pushLiarsEvents(gameState, [
    liarsEvent("round", `Round ${gameState.round} - Carte cible : ${nextTarget}`),
    liarsEvent("round", isLiarsChaosMode(gameState)
      ? `Nouveau round Chaos : seuls les ${nextTarget}s sont innocents.`
      : `Nouveau round : seuls les ${nextTarget}s et les Jokers sont innocents.`),
    liarsEvent("turn", gameState.turnText),
  ]);
}

function createLiarsInitialState(players) {
  closeBadgeUnlockModal();
  state.liars.badgeUnlocks = [];
  state.liars.badgeUnlockModalClosedFor = "";
  const previousOrder = state.settings.liars?.state?.order || state.settings.liars?.lastOrder || [];
  const mode = state.settings.liars.mode || "normal";
  const maxPlayers = mode === "chaos" ? 6 : 4;
  let orderedPlayers = shuffleItems(players.slice(0, maxPlayers));
  if (orderedPlayers.length > 1 && previousOrder.length === orderedPlayers.length) {
    for (let attempt = 0; attempt < 8 && orderedPlayers.every((player, index) => player.id === previousOrder[index]); attempt += 1) {
      orderedPlayers = shuffleItems(players.slice(0, maxPlayers));
    }
  }
  const order = orderedPlayers.map((player) => player.id);
  state.settings.liars.lastOrder = order;
  const hands = dealLiarsHands(orderedPlayers.map((player) => player.id), mode);
  const firstIndex = Math.floor(Math.random() * Math.max(orderedPlayers.length, 1));
  const initialState = {
    gameId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    mode,
    initialPlayerCount: orderedPlayers.length,
    order,
    names: Object.fromEntries(orderedPlayers.map((player) => [player.id, player.pseudo])),
    weaponSkins: Object.fromEntries(orderedPlayers.map((player) => [player.id, player.weaponSkin || null])),
    nameSkins: Object.fromEntries(orderedPlayers.map((player) => [player.id, player.nameSkin || null])),
    deathSkins: Object.fromEntries(orderedPlayers.map((player) => [player.id, player.deathSkin || null])),
    hands,
    lives: Object.fromEntries(orderedPlayers.map((player) => [player.id, ["roulette", "chaos"].includes(mode) ? 1 : 3])),
    roulette: ["roulette", "chaos"].includes(mode) ? Object.fromEntries(orderedPlayers.map((player) => [player.id, createRouletteBarrel()])) : null,
    target: randomTarget(mode, orderedPlayers.length),
    currentIndex: firstIndex,
    pile: [],
    lastPlay: null,
    selected: [],
    announcement: "La partie commence.",
    turnText: `Tour de ${orderedPlayers[firstIndex]?.pseudo || "Joueur"}.`,
    history: ["La partie commence."],
    winner: null,
    coinRewards: {},
    coinRewardEvents: [],
    stats: Object.fromEntries(orderedPlayers.map((player) => [player.id, { accuseOk: 0, accuseWrong: 0 }])),
    profileStats: Object.fromEntries(orderedPlayers.map((player) => [player.id, {}])),
    badgeStats: Object.fromEntries(orderedPlayers.map((player) => [player.id, {}])),
    badgeGlobal: {},
    eliminationOrder: [],
    version: 1,
    round: 1,
    reveal: null,
    roundIntro: {
      id: `${Date.now()}-1`,
      round: 1,
      target: null,
    },
    events: [],
  };
  initialState.roundIntro.target = initialState.target;
  pushLiarsEvents(initialState, [
    liarsEvent("round", `Round 1 - Carte cible : ${initialState.target}`),
    liarsEvent("round", mode === "chaos"
      ? `Nouveau round Chaos : seuls les ${initialState.target}s sont innocents.`
      : `Nouveau round : seuls les ${initialState.target}s et les Jokers sont innocents.`),
    liarsEvent("turn", initialState.turnText),
  ]);
  return initialState;
}

function getLiarsState() {
  return state.settings.liars.state || state.liars.state;
}

function getCurrentLiarsPlayerId(gameState = getLiarsState()) {
  if (!gameState?.order?.length) return "";
  return gameState.order[gameState.currentIndex % gameState.order.length];
}

function getPreviousLiarsPlayerId(gameState = getLiarsState()) {
  return gameState?.lastPlay?.playerId || "";
}

function isChaosSpecialCard(card) {
  return ["Demon", "Chasseur"].includes(card);
}

function isChaosFarWest(card) {
  return card === "FarWest";
}

function isLiarsCardSelectionLocked(hand, index, gameState = getLiarsState()) {
  if (!isLiarsChaosMode(gameState)) return false;
  if (state.liars.selected.includes(index)) return false;
  const card = hand[index];
  const selectedCards = state.liars.selected.map((item) => hand[item]).filter(Boolean);
  if (!selectedCards.length) return false;
  if (isChaosFarWest(card) || selectedCards.some(isChaosFarWest)) return false;
  if (selectedCards.some(isChaosSpecialCard)) return true;
  return isChaosSpecialCard(card);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function nextLiarsIndex(gameState, fromIndex = gameState.currentIndex) {
  const alive = playersWithCards(gameState);
  if (!alive.length) return fromIndex;
  for (let offset = 1; offset <= gameState.order.length; offset += 1) {
    const index = (fromIndex + offset) % gameState.order.length;
    const id = gameState.order[index];
    if (alive.includes(id)) return index;
  }
  return fromIndex;
}

async function applyLiarsForfeitBeforeLeave(leavingId = state.user?.id) {
  const gameState = cloneData(getLiarsState());
  if (!gameState?.order?.includes(leavingId)) return true;

  const leavingName = gameState.names?.[leavingId] || state.user?.pseudo || "Joueur";
  const leavingIndex = gameState.order.indexOf(leavingId);
  const wasCurrentTurn = getCurrentLiarsPlayerId(gameState) === leavingId;
  ensureLiarsStats(gameState);

  gameState.order = gameState.order.filter((id) => id !== leavingId);
  if (gameState.hands) delete gameState.hands[leavingId];
  if (gameState.lives) delete gameState.lives[leavingId];
  if (gameState.lastPlay?.playerId === leavingId) gameState.lastPlay = null;
  gameState.reveal = null;
  gameState.roundIntro = null;
  gameState.forfeitedPlayers = Array.from(new Set([...(gameState.forfeitedPlayers || []), leavingId]));
  gameState.announcement = `${leavingName} declare forfait`;
  markLiarsEliminated(gameState, leavingId);
  pushLiarsEvents(gameState, liarsEvent("accuse", `${leavingName} declare forfait`));

  const aliveAfterLeave = aliveLiarsPlayers(gameState);
  if (aliveAfterLeave.length <= 1) {
    const winnerId = aliveAfterLeave[0] || "";
    const winnerName = gameState.names?.[winnerId] || "Joueur";
    gameState.winner = winnerId;
    gameState.turnText = winnerId ? `${winnerName} gagne par forfait` : "Fin de partie";
    pushLiarsEvents(gameState, liarsEvent("turn", gameState.turnText));
    await awardLiarsEndRewards(gameState, winnerId, secondPlaceForLiars(gameState, leavingId), `forfeit-${Number(gameState.version || 0) + 1}`);
  } else if (gameState.order.length > 1) {
    if (leavingIndex < gameState.currentIndex) {
      gameState.currentIndex = Math.max(0, gameState.currentIndex - 1);
    }
    if (wasCurrentTurn || gameState.currentIndex >= gameState.order.length) {
      gameState.currentIndex = Math.max(0, leavingIndex) % gameState.order.length;
    }

    const currentId = getCurrentLiarsPlayerId(gameState);
    const currentCanPlay = currentId && (gameState.lives[currentId] || 0) > 0 && (gameState.hands[currentId]?.length || 0) > 0;
    if (!currentCanPlay) {
      gameState.currentIndex = nextLiarsIndex(gameState, Math.max(0, gameState.currentIndex - 1));
    }

    const nextId = getCurrentLiarsPlayerId(gameState);
    gameState.turnText = `Tour de ${gameState.names?.[nextId] || "Joueur"}`;
    pushLiarsEvents(gameState, liarsEvent("turn", gameState.turnText));
  }

  gameState.version = Number(gameState.version || 0) + 1;
  return saveLiarsState(gameState);
}

async function applyDead21ForfeitBeforeLeave(leavingId = state.user?.id, { silent = false } = {}) {
  if (!db || !state.currentRoomId || !leavingId) return true;
  const gameState = getLiarsState();
  if (!isLiarsDead21Mode(gameState) || !(gameState?.order || []).includes(leavingId)) return true;
  const { error } = await db.rpc("dead21_forfeit_player_rpc", {
    p_room_id: state.currentRoomId,
    p_player_id: leavingId,
  });
  if (error) {
    if (!silent) showMessage("Impossible de quitter Dead 21: " + (error.message || "erreur inconnue"));
    else console.warn("Dead 21 forfeit failed:", error.message || error);
    return false;
  }
  return true;
}

async function reconcileLiarsPlayers() {
  const gameState = getLiarsState();
  if (!gameState || gameState.winner || !isRoomHost()) return;
  if (isLiarsDead21Mode(gameState)) return;
  const presentIds = new Set(state.players.map((player) => player.id));
  const missingId = (gameState.order || []).find((id) => !presentIds.has(id));
  if (missingId) await applyLiarsForfeitBeforeLeave(missingId);
}

async function saveLiarsState(nextState) {
  if (state.liars.saving) return false;
  state.liars.saving = true;
  state.settings.liars.state = nextState;
  state.liars.state = nextState;
  renderLiars();

  const { error } = await db.rpc("update_liars_state_rpc", {
    p_room_id: state.currentRoomId,
    p_state: nextState,
  });

  if (error) {
    if (!isMissingRpc(error)) {
      state.liars.saving = false;
      showMessage("Impossible de synchroniser la partie: " + (error.message || "erreur inconnue"));
      return false;
    }

    if (!isRoomHost()) {
      state.liars.saving = false;
      showMessage("Supabase n'a pas encore la RPC Liars. Lance le SQL final dans le SQL Editor.");
      return false;
    }

    const syncedSettings = {
      ...state.settings,
      liars: {
        ...state.settings.liars,
        state: nextState,
      },
    };
    const fallback = await db
      .from("rooms")
      .update({ settings: syncedSettings })
      .eq("id", state.currentRoomId)
      .eq("status", "playing");

    if (fallback.error) {
      state.liars.saving = false;
      showMessage("Impossible de synchroniser la partie: " + (fallback.error.message || "erreur inconnue"));
      return false;
    }
  }

  if (!state.roomStateLive) requestLiarsSync(500);
  state.liars.saving = false;
  return true;
}

async function finalizeLiarsReveal(revealId) {
  const gameState = cloneData(getLiarsState());
  if (!gameState?.reveal || gameState.reveal.id !== revealId) return;
  if (gameState.reveal.accuserId !== state.user.id && !isRoomHost()) return;

  if (gameState.reveal.pendingRedeal) {
    const starter = gameState.reveal.nextStarterId || nextAliveIdAfter(gameState, gameState.reveal.accusedId || gameState.reveal.loserId || "");
    redealLiarsRound(gameState, gameState.reveal.text || gameState.reveal.announcement || "Nouveau round.", starter);
  } else {
    gameState.reveal = null;
  }

  gameState.version = Number(gameState.version || 0) + 1;
  await saveLiarsState(gameState);
}

function maybeFinalizeStaleLiarsReveal(gameState) {
  const reveal = gameState?.reveal;
  if (!reveal?.id) return;
  if (reveal.type === "final" || reveal.dead21ScoreReveal || reveal.dead21Final) return;
  if (reveal.accuserId !== state.user.id && !isRoomHost()) return;
  const elapsed = Date.now() - liarsRevealStartedAt(reveal);
  const duration = reveal.chaosShots?.length ? chaosRevealDuration(reveal) : reveal.roulette ? 9800 : 6000;
  if (elapsed < duration + 1800) return;
  if (state.liars.staleFinalizingRevealId === reveal.id) return;
  state.liars.staleFinalizingRevealId = reveal.id;
  finalizeLiarsReveal(reveal.id).finally(() => {
    if (state.liars.staleFinalizingRevealId === reveal.id) state.liars.staleFinalizingRevealId = "";
  });
}

async function finalizeRoundIntro(introId) {
  const gameState = cloneData(getLiarsState());
  if (!gameState?.roundIntro || gameState.roundIntro.id !== introId) return;
  if (!isRoomHost()) return;
  gameState.roundIntro = null;
  gameState.version = Number(gameState.version || 0) + 1;
  await saveLiarsState(gameState);
}

function scheduleLiarsEnd(delay = 500) {
  clearTimeout(state.liars.endTimer);
  state.liars.endTimer = setTimeout(() => {
    const liarsState = getLiarsState();
    if (state.screen === "liars-game" && (liarsState?.winner || liarsState?.phase === "game_over")) {
      go("end");
    }
  }, delay);
}

function startLiarsGame() {
  clearTimeout(state.liars.endTimer);
  state.liars.selected = [];
  state.liars.deadSelectedCardId = "";
  state.liars.deadSelectedAnnounce = null;
  if (isLiarsDead21Mode()) {
    loadDead21PrivateState(false);
  }
  renderLiars();
}

async function loadDead21PrivateState(force = false) {
  clearTimeout(state.liars.deadPrivateTimer);
  if (!db || !state.currentRoomId || !state.user?.id || !isLiarsDead21Mode()) return;
  try {
    const { data, error } = await db.rpc("get_dead21_private_state_rpc", { p_room_id: state.currentRoomId });
    if (error) {
      if (name === "blackjack_double_rpc") {
        state.blackjack.pendingDoubleBet = 0;
        state.blackjack.pendingDoubleAt = 0;
      }
      const message = String(error.message || "");
      if (message.includes("not_room_player")) {
        state.liars.deadPrivate = null;
        if (state.roomStatus === "playing" && state.screen === "liars-game") {
          state.liars.deadPrivateTimer = setTimeout(() => loadDead21PrivateState(false), 1400);
        }
        return;
      }
      if (force && !isMissingRpc(error)) showMessage("Etat prive Dead 21 indisponible: " + (error.message || "erreur inconnue"));
      return;
    }
    state.liars.deadPrivate = data || null;
    if (state.screen === "liars-game") renderLiars();
  } catch (error) {
    if (force) showMessage("Etat prive Dead 21 indisponible: " + (error.message || "erreur inconnue"));
  }
}

function dead21ActionError(error) {
  const message = String(error?.message || "");
  if (message.includes("wrong_turn")) return "Ce n'est pas ton tour.";
  if (message.includes("phase_blocked")) return "Attends la fin de l'animation.";
  if (message.includes("dead21_requires_2_to_4_players")) return "Dead 21 accepte entre 2 et 4 joueurs.";
  if (message.includes("draw_forbidden_first_turn")) return "Tu ne peux pas piocher au premier tour.";
  if (message.includes("stay_forbidden_first_turn")) return "Tu ne peux pas rester au premier tour.";
  if (message.includes("invalid_announcement")) return "Annonce invalide pour cette carte.";
  if (message.includes("no_valid_accusation")) return "Aucune accusation valide maintenant.";
  if (message.includes("must_resolve_draw")) return "Choisis d'abord quelle carte jouer apres la pioche.";
  if (message.includes("hand_already_full")) return "Tu as deja deux cartes.";
  return message || "Action Dead 21 impossible.";
}

async function runDead21Rpc(name, args = {}) {
  if (state.liars.saving || !state.currentRoomId) return false;
  state.liars.saving = true;
  const { error } = await db.rpc(name, { p_room_id: state.currentRoomId, ...args });
  state.liars.saving = false;
  if (error) {
    showMessage(dead21ActionError(error));
    return false;
  }
  state.liars.deadSelectedCardId = "";
  state.liars.deadSelectedAnnounce = null;
  await loadCurrentRoom();
  await loadDead21PrivateState(true);
  return true;
}

function dead21PrivateCards() {
  const hand = Array.isArray(state.liars.deadPrivate?.hand) ? state.liars.deadPrivate.hand : [];
  const pending = state.liars.deadPrivate?.pendingDraw || null;
  return pending ? [...hand, { ...pending, pendingDraw: true }] : hand;
}

function dead21AnnouncementOptions(card) {
  const value = Number(card?.value || 0);
  if (!value) return [];
  if (card?.rank === "As") return [10, 11];
  if (value === 2) return [2, 3];
  return [value - 1, value, value + 1].filter((item) => item >= 2 && item <= 11);
}

const DEAD21_CARD_IMAGES = {
  2: ["deuxpique.png", "deuxcoeur.png"],
  3: ["troistrefle.png", "troiscarreau.png"],
  4: ["quatrepique.png", "quatrecoeur.png"],
  5: ["cinqtrefle.png", "cinqcarreau.png"],
  6: ["sixpique.png", "sixcoeur.png"],
  7: ["septtrefle.png", "septcarreau.png"],
  8: ["huitpique.png", "huitcoeur.png"],
  9: ["neuftrefle.png", "neufcarreau.png"],
  10: ["dixpique.png", "dixcoeur.png"],
  As: ["aspique.png", "ascoeur.png", "astrefle.png", "ascarreau.png"],
  Valet: ["valetpique.png", "valetcoeur.png", "valettrefle.png", "valetcarreau.png"],
  Dame: ["damepique.png", "damecoeur.png", "dametrefle.png", "damecarreau.png"],
  Roi: ["roipique.png", "roicoeur.png", "roitrefle.png", "roicarreau.png"],
};

function dead21ImageNameVariants(fileName) {
  const cleanName = String(fileName || "").split("/").pop().trim();
  if (!cleanName) return [];
  const withoutPhotoroom = cleanName.replace("-Photoroom", "");
  const withPhotoroom = withoutPhotoroom.replace(/\.png$/i, "-Photoroom.png");
  const typoFix = withoutPhotoroom === "cinqtrefle.png" ? "cinqtrrefle.png" : "";
  return [...new Set([cleanName, withoutPhotoroom, withPhotoroom, typoFix, typoFix ? typoFix.replace(/\.png$/i, "-Photoroom.png") : ""].filter(Boolean))];
}

function dead21ImageCandidates(card) {
  const rank = card?.rank || card?.label || card?.value;
  const names = [
    ...dead21ImageNameVariants(card?.image),
    ...(DEAD21_CARD_IMAGES[rank] || []).flatMap(dead21ImageNameVariants),
  ];
  const folders = ["Image%20dead", "Image dead", "image%20dead", "images%20dead", "Images%20dead"];
  return [...new Set(names.flatMap((name) => folders.map((folder) => `./${folder}/${encodeURIComponent(name)}`)))];
}

function dead21CardImageFallback(img) {
  const candidates = JSON.parse(img.dataset.dead21Images || "[]");
  const nextIndex = Number(img.dataset.dead21Index || 0) + 1;
  if (candidates[nextIndex]) {
    img.dataset.dead21Index = String(nextIndex);
    img.src = candidates[nextIndex];
    return;
  }
  img.remove();
  img.parentElement?.classList.add("missing");
}

function dead21BackFace() {
  return `
    <span class="dead21-card-face dead21-back">
      <img src="./Image%20dead/doscartesdead21.png" alt="Dos carte Dead 21" />
    </span>
  `;
}

function dead21CardFace(card, hidden = false) {
  if (hidden) return dead21BackFace();
  const label = cleanText(card?.label || card?.rank || card?.value || "?", "?");
  const images = dead21ImageCandidates(card);
  return `
    <span class="dead21-card-face ${images.length ? "" : "missing"}" data-label="${escapeAttr(label)}">
      ${images.length ? `<img src="${escapeAttr(images[0])}" alt="${escapeAttr(label)}" data-dead21-index="0" data-dead21-images="${escapeAttr(JSON.stringify(images))}" onerror="dead21CardImageFallback(this)" />` : ""}
      <b>${cleanText(label, "?")}</b>
    </span>
  `;
}

function dead21SeatMap(count) {
  return {
    1: [0],
    2: [0, 1],
    3: [0, 2, 3],
    4: [0, 2, 1, 3],
    5: [0, 2, 4, 1, 3],
    6: [0, 2, 4, 1, 5, 3],
  }[count] || [0, 2, 4, 1, 5, 3];
}

function dead21PlayerMeta(gameState, playerId) {
  const player = state.players.find((item) => item.id === playerId);
  return {
    pseudo: gameState?.names?.[playerId] || player?.pseudo || "Joueur",
    nameSkin: gameState?.nameSkins?.[playerId] || player?.nameSkin || null,
  };
}

function dead21FinalScorePlayers(gameState) {
  const scores = gameState?.reveal?.scores || null;
  if (!scores || gameState?.reveal?.type !== "final") return [];
  const ids = new Set(Object.keys(scores));
  return (gameState.order || []).filter((id) => ids.has(id));
}

function dead21PunishedPlayers(gameState) {
  return new Set((gameState?.reveal?.shots || []).map((shot) => shot?.playerId).filter(Boolean));
}

function dead21FinalScoreRevealDuration(gameState) {
  const count = dead21FinalScorePlayers(gameState).length;
  return count ? count * DEAD21_SCORE_REVEAL_MS + DEAD21_SCORE_REVEAL_SETTLE_MS : 0;
}

function dead21FinalScoreProgress(gameState) {
  if (gameState?.reveal?.type !== "final" || !gameState.reveal?.scores) {
    return { players: [], activeIndex: -1, revealed: new Set(), scoreRevealDone: true, elapsed: 0 };
  }
  const players = dead21FinalScorePlayers(gameState);
  const elapsed = Date.now() - liarsRevealStartedAt(gameState.reveal);
  const activeIndex = Math.min(players.length - 1, Math.max(0, Math.floor(elapsed / DEAD21_SCORE_REVEAL_MS)));
  const scoreRevealDone = elapsed >= dead21FinalScoreRevealDuration(gameState);
  const revealed = new Set(players.filter((_, index) => scoreRevealDone || elapsed >= (index + 1) * DEAD21_SCORE_REVEAL_MS));
  return { players, activeIndex, revealed, scoreRevealDone, elapsed };
}

function dead21ScoreRevealOriginStyle(seatIndex) {
  const seat = Number.isFinite(seatIndex) ? $(`#seat-${seatIndex}`) : null;
  if (!seat) return "";
  const rect = seat.getBoundingClientRect();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const originX = rect.left + rect.width / 2 - centerX;
  const originY = rect.top + rect.height / 2 - centerY;
  return `--score-x:${Math.round(originX)}px; --score-y:${Math.round(originY)}px;`;
}

function dead21FinalShotVisualState(gameState, playerId) {
  const reveal = gameState?.reveal || null;
  const shots = Array.isArray(reveal?.shots) ? reveal.shots : [];
  const shotIndex = shots.findIndex((shot) => shot?.playerId === playerId);
  if (reveal?.type !== "final" || shotIndex < 0) {
    return {
      punished: false,
      eliminated: gameState?.eliminated?.[playerId] === true,
      danger: Number(gameState?.rouletteDanger?.[playerId] || 1),
      shotVisible: true,
    };
  }
  const scoreDuration = dead21FinalScoreRevealDuration(gameState);
  const elapsedAfterScores = Date.now() - liarsRevealStartedAt(reveal) - scoreDuration;
  const activeShotIndex = Math.floor(Math.max(0, elapsedAfterScores) / DEAD21_FINAL_SHOT_MS);
  const currentShotElapsed = Math.max(0, elapsedAfterScores - activeShotIndex * DEAD21_FINAL_SHOT_MS);
  const shot = shots[shotIndex];
  const shotVisible = elapsedAfterScores >= 0
    && (shotIndex < activeShotIndex || (shotIndex === activeShotIndex && currentShotElapsed >= DEAD21_SHOT_RESULT_VISIBLE_MS));
  return {
    punished: true,
    eliminated: shotVisible ? Boolean(shot.dead) : false,
    danger: shotVisible ? Number(gameState?.rouletteDanger?.[playerId] || shot.dangerBefore || 1) : Number(shot.dangerBefore || 1),
    shotVisible,
  };
}

function dead21ShouldShowRealScore(gameState, playerId, { isMe = false } = {}) {
  if (gameState?.reveal?.type === "final" && gameState.reveal?.scores) {
    return dead21FinalScoreProgress(gameState).revealed.has(playerId);
  }
  return Boolean(gameState?.reveal?.scores?.[playerId] !== undefined || isMe);
}

function dead21RealScoreLabel(gameState, playerId, { isMe = false } = {}) {
  const revealScores = gameState.reveal?.scores || null;
  const score = revealScores?.[playerId] ?? gameState.scores?.[playerId];
  if (score !== null && score !== undefined) return `Main réelle: ${Number(score)} pts`;
  if (isMe && state.liars.deadPrivate?.score !== null && state.liars.deadPrivate?.score !== undefined) {
    return `Main réelle: ${Number(state.liars.deadPrivate.score || 0)} pts`;
  }
  return "";
}

function dead21AnnouncedScoreLabel(gameState, playerId) {
  return `Main annoncée: ${Number(gameState.announcedScores?.[playerId] || 0)} pts`;
}

function dead21ScoreHtml(gameState, playerId, { isMe = false } = {}) {
  const real = dead21RealScoreLabel(gameState, playerId, { isMe });
  const announced = dead21AnnouncedScoreLabel(gameState, playerId);
  const showReal = real && dead21ShouldShowRealScore(gameState, playerId, { isMe });
  const dangerClass = gameState?.reveal?.type === "final" && showReal && dead21PunishedPlayers(gameState).has(playerId) ? " danger-score" : "";
  if (gameState?.reveal?.type === "final" && !showReal) {
    return `<small class="dead21-seat-score">${cleanText(announced)}</small>`;
  }
  if (isMe) {
    return `
      <span class="dead21-score-stack">
        <small class="dead21-seat-score${dangerClass}">${cleanText(real || "Main réelle: 0 pts")}</small>
        <small class="dead21-seat-score">${cleanText(announced)}</small>
      </span>
    `;
  }
  return `<small class="dead21-seat-score${dangerClass}">${cleanText(showReal ? real : announced)}</small>`;
}

function renderDead21Log(gameState) {
  return `<div class="dead21-round-name">Manche ${Number(gameState?.round || 1)}</div>`;
}

function dead21OverlayReveal(gameState) {
  const reveal = gameState?.reveal || null;
  const finalShots = Array.isArray(reveal?.shots) ? reveal.shots.filter(Boolean) : [];
  if (reveal?.id && reveal.type === "final" && reveal.scores) {
    const progress = dead21FinalScoreProgress(gameState);
    if (!progress.scoreRevealDone && progress.players.length) {
      const playerId = progress.players[progress.activeIndex];
      const phaseElapsed = progress.elapsed - progress.activeIndex * DEAD21_SCORE_REVEAL_MS;
      const meta = dead21PlayerMeta(gameState, playerId);
      return {
        id: `${reveal.id}:score:${progress.activeIndex}`,
        dead21ScoreReveal: true,
        playerId,
        playerName: meta.pseudo,
        nameSkin: meta.nameSkin,
        realScore: Number(reveal.scores?.[playerId] || 0),
        announcedScore: Number(gameState.announcedScores?.[playerId] || 0),
        danger: Number(gameState.rouletteDanger?.[playerId] || 1),
        punished: dead21PunishedPlayers(gameState).has(playerId),
        scorePhase: phaseElapsed >= DEAD21_SCORE_REAL_DELAY_MS ? "real" : "announced",
      };
    }
  }
  if (reveal?.id && finalShots.length) {
    const elapsed = Math.max(0, Date.now() - liarsRevealStartedAt(reveal) - dead21FinalScoreRevealDuration(gameState));
    const shotDuration = DEAD21_FINAL_SHOT_MS;
    const index = Math.min(finalShots.length - 1, Math.max(0, Math.floor(elapsed / shotDuration)));
    const shot = finalShots[index];
    return {
      id: `${reveal.id}:${index}`,
      dead21Final: true,
      accuserId: shot.playerId,
      loserId: shot.playerId,
      loserName: shot.name || gameState.names?.[shot.playerId] || "Joueur",
      shooterId: shot.playerId,
      activeShotIndex: index,
      shotCount: finalShots.length,
      shot,
      roulette: {
        shooterId: shot.playerId,
        weaponSkin: weaponSkinForPlayer(shot.playerId, gameState),
        finalPosition: Number(shot.roll || 0),
        dead: Boolean(shot.dead),
        usedBefore: Math.max(0, Number(shot.dangerBefore || 1) - 1),
        usedAfter: Boolean(shot.dead) ? 4 : Math.max(1, Number(shot.dangerBefore || 1)),
      },
    };
  }
  const shot = reveal?.shot || null;
  if (!reveal?.id || !shot?.playerId) return null;
  return {
    id: reveal.id,
    accuserId: reveal.accuserId || gameState.lastPlay?.playerId || shot.playerId,
    loserId: shot.playerId,
    loserName: shot.name || gameState.names?.[shot.playerId] || "Joueur",
    shooterId: shot.playerId,
    roulette: {
      shooterId: shot.playerId,
      weaponSkin: weaponSkinForPlayer(shot.playerId, gameState),
      finalPosition: Number(shot.roll || 0),
      dead: Boolean(shot.dead),
      usedBefore: Math.max(0, Number(shot.dangerBefore || 1) - 1),
      usedAfter: Boolean(shot.dead) ? 4 : Math.max(1, Number(shot.dangerBefore || 1)),
    },
  };
}

function dead21DeckIntroItems(deckIntro) {
  const cards = Array.isArray(deckIntro?.cards) ? deckIntro.cards : [];
  const rankOrder = {
    As: 14,
    Roi: 13,
    Dame: 12,
    Valet: 11,
    "10": 10,
    "9": 9,
    "8": 8,
    "7": 7,
    "6": 6,
    "5": 5,
    "4": 4,
    "3": 3,
    "2": 2,
  };
  const grouped = new Map();
  cards.forEach((card) => {
    const key = card?.image || card?.rank || card?.label || card?.value || "";
    if (!key) return;
    if (!grouped.has(key)) grouped.set(key, { card, count: 0 });
    grouped.get(key).count += 1;
  });
  return [...grouped.values()].sort((left, right) => {
    const leftRank = String(left.card?.rank || left.card?.label || left.card?.value || "");
    const rightRank = String(right.card?.rank || right.card?.label || right.card?.value || "");
    const byRank = (rankOrder[rightRank] || Number(right.card?.value || 0)) - (rankOrder[leftRank] || Number(left.card?.value || 0));
    if (byRank) return byRank;
    return right.count - left.count;
  });
}

function renderDead21DeckIntro(deckIntro, { review = false } = {}) {
  const overlay = $("#liars-overlay");
  if (!overlay || !deckIntro?.id) return;
  const introKey = `${review ? "dead21-deck-review" : "dead21-deck"}:${deckIntro.id}`;
  if (overlay.dataset.overlayKey === introKey) return;
  overlay.dataset.overlayKey = introKey;
  overlay.className = "liars-overlay active dead21-deck-overlay";
  const items = dead21DeckIntroItems(deckIntro);
  overlay.innerHTML = `
    <div class="dead21-deck-splash">
      ${review ? `<button class="icon-btn dead21-deck-close" type="button" data-dead21-close-deck aria-label="Fermer">x</button>` : ""}
      <strong>Deck de la manche ${Number(deckIntro.round || 1)}</strong>
      <div class="dead21-deck-grid">
        ${items.map(({ card, count }) => `
          <span class="dead21-deck-item">
            ${dead21CardFace(card)}
            <b>x${count}</b>
          </span>
        `).join("")}
      </div>
    </div>
  `;
}

function renderSpectatorPanel() {
  return `
    <div class="spectator-panel">
      <strong>Spectateur</strong>
      <button type="button" data-open-lucky-wheel>Roue de la chance</button>
      <button type="button" data-open-shop>Boutique</button>
    </div>
  `;
}

function liarsDeathIsVisuallyConfirmed(gameState = getLiarsState(), playerId = state.user?.id) {
  if (!playerId) return false;
  const reveal = gameState?.reveal || null;
  if (!reveal?.id) return true;
  const elapsed = Date.now() - liarsRevealStartedAt(reveal);
  if (reveal.dead21ScoreReveal) return false;
  if (reveal.dead21Final && reveal.loserId === playerId) return elapsed >= 3600;
  if (reveal.roulette && (reveal.loserId === playerId || reveal.playerId === playerId)) return elapsed >= 7600;
  const shots = Array.isArray(reveal.chaosShots) ? reveal.chaosShots : [];
  const ownShotIndex = shots.findIndex((shot) => shot?.playerId === playerId && shot.dead);
  if (ownShotIndex >= 0) return elapsed >= CHAOS_FIRST_SHOT_DELAY + ownShotIndex * CHAOS_SHOT_INTERVAL + 2200;
  return true;
}

function showDead21DeckReview() {
  const gameState = getLiarsState();
  const deck = gameState?.deckIntro || gameState?.deckPreview;
  if (!deck?.id) {
    showMessage("Le deck de cette manche n'est pas disponible.");
    return;
  }
  renderDead21DeckIntro(deck, { review: true });
}

function closeDead21DeckReview() {
  const overlay = $("#liars-overlay");
  if (!overlay?.classList.contains("dead21-deck-overlay")) return;
  overlay.innerHTML = "";
  overlay.className = "liars-overlay";
  overlay.dataset.overlayKey = "";
}

async function finalizeDead21DeckIntro(introId) {
  if (!introId || !isLiarsDead21Mode()) return;
  await runDead21Rpc("dead21_finalize_deck_intro_rpc", { p_intro_id: introId });
}

function renderDead21AnnouncePopover(gameState = getLiarsState()) {
  $$(".dead21-announce-popover").forEach((element) => element.remove());
  const selectedCard = dead21PrivateCards().find((card) => card.id === state.liars.deadSelectedCardId);
  const announceOptions = dead21AnnouncementOptions(selectedCard);
  if (!announceOptions.length) return;
  const optionsHtml = `
    <div class="dead21-announce-popover">
      <small>Annonce</small>
      <div class="dead21-announce-options">
        ${announceOptions.map((value) => `<button type="button" data-dead21-announce="${value}" class="${Number(state.liars.deadSelectedAnnounce) === value ? "active" : ""}">${value}</button>`).join("")}
      </div>
    </div>
  `;
  $(".liars-table")?.insertAdjacentHTML("beforeend", optionsHtml);
}

function refreshDead21SelectionUi(gameState = getLiarsState()) {
  const selectedCard = dead21PrivateCards().find((card) => card.id === state.liars.deadSelectedCardId);
  const currentPlayerId = getCurrentLiarsPlayerId(gameState);
  const isMyTurn = currentPlayerId === state.user?.id;
  const blocked = gameState?.phase !== "playing" || Boolean(gameState?.reveal?.id);
  const hasPendingDraw = Boolean(state.liars.deadPrivate?.pendingDraw);
  const turnCount = Number(state.liars.deadPrivate?.turnCount || gameState?.turnCounts?.[state.user?.id] || 0);
  const canAct = isMyTurn && !blocked && !gameState?.eliminated?.[state.user?.id] && !gameState?.stayed?.[state.user?.id];
  const playReady = canAct && selectedCard && Number.isFinite(Number(state.liars.deadSelectedAnnounce));
  const canDraw = canAct && !hasPendingDraw && turnCount > 0 && Number(gameState?.handCounts?.[state.user?.id] || 0) < 2;
  const canStay = canAct && turnCount > 0;
  const canAccuse = canAct && gameState?.lastPlay && gameState.lastPlay.playerId !== state.user?.id && !gameState.lastPlay.revealed;

  $$("#edge-hand-0 [data-dead21-card]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.dead21Card === state.liars.deadSelectedCardId);
  });
  $$(".dead21-announce-options button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.dead21Announce) === Number(state.liars.deadSelectedAnnounce));
  });
  const drawButton = $("#dead21-draw");
  const stayButton = $("#dead21-stay");
  const playButton = $("#play-cards");
  const accuseButton = $("#accuse");
  if (drawButton) drawButton.disabled = !canDraw;
  if (stayButton) stayButton.disabled = !canStay;
  if (playButton) {
    playButton.disabled = !playReady;
    playButton.classList.toggle("play-ready", Boolean(playReady));
  }
  if (accuseButton) accuseButton.disabled = !canAccuse;
}

function dead21RenderKey(gameState, privateCards) {
  const reveal = gameState?.reveal || null;
  const shots = Array.isArray(reveal?.shots) ? reveal.shots : [];
  const scoreProgress = dead21FinalScoreProgress(gameState);
  const elapsedAfterScores = Date.now() - liarsRevealStartedAt(reveal) - dead21FinalScoreRevealDuration(gameState);
  const activeShotIndex = shots.length
    ? Math.min(shots.length - 1, Math.max(0, Math.floor(elapsedAfterScores / DEAD21_FINAL_SHOT_MS)))
    : -1;
  const activeShotResultVisible = shots.length && elapsedAfterScores >= 0
    ? (elapsedAfterScores - activeShotIndex * DEAD21_FINAL_SHOT_MS) >= DEAD21_SHOT_RESULT_VISIBLE_MS
    : false;
  return JSON.stringify({
    version: gameState?.version || 0,
    phase: gameState?.phase || "",
    round: gameState?.round || 0,
    currentIndex: gameState?.currentIndex || 0,
    lastPlay: gameState?.lastPlay || null,
    revealId: reveal?.id || "",
    revealType: reveal?.type || "",
    activeShotIndex,
    activeShotResultVisible,
    activeScoreIndex: scoreProgress.scoreRevealDone ? "done" : scoreProgress.activeIndex,
    revealedScores: [...scoreProgress.revealed].join("|"),
    handCounts: gameState?.handCounts || {},
    scores: gameState?.scores || {},
    announcedScores: gameState?.announcedScores || {},
    stayed: gameState?.stayed || {},
    eliminated: gameState?.eliminated || {},
    danger: gameState?.rouletteDanger || {},
    privateHand: privateCards.map((card) => `${card?.id || ""}:${card?.pendingDraw ? 1 : 0}`).join("|"),
    privateScore: state.liars.deadPrivate?.score ?? "",
    privateTurn: state.liars.deadPrivate?.turnCount ?? "",
  });
}

function renderDead21(gameState) {
  const screen = document.querySelector('[data-screen="liars-game"]');
  screen?.classList.remove("chaos-screen");
  screen?.classList.add("dead21-screen");
  const phase = gameState.phase || "playing";
  const currentPlayerId = getCurrentLiarsPlayerId(gameState);
  const isMyTurn = currentPlayerId === state.user?.id;
  const blocked = !["playing"].includes(phase) || Boolean(gameState.reveal?.id);
  const showingDeckIntro = phase === "deck_intro" && Boolean(gameState.deckIntro?.id);
  const privateCards = showingDeckIntro ? [] : dead21PrivateCards();
  const selectedCard = privateCards.find((card) => card.id === state.liars.deadSelectedCardId);
  const announceOptions = dead21AnnouncementOptions(selectedCard);
  if (selectedCard && !announceOptions.includes(Number(state.liars.deadSelectedAnnounce))) {
    const realValue = Number(selectedCard.value);
    state.liars.deadSelectedAnnounce = announceOptions.includes(realValue) ? realValue : announceOptions[0] ?? null;
  }

  const renderKey = dead21RenderKey(gameState, privateCards);
  if (state.liars.deadRenderKey === renderKey) {
    renderDead21AnnouncePopover(gameState);
    refreshDead21SelectionUi(gameState);
    if (showingDeckIntro) renderDead21DeckIntro(gameState.deckIntro);
    return;
  }
  state.liars.deadRenderKey = renderKey;

  $(".liars-header .small-label").innerHTML = `
    <button class="dead21-deck-review-btn" type="button" data-dead21-show-deck aria-label="Voir le deck">
      <img src="./Image%20dead/carteinfo.png" alt="" />
    </button>
  `;
  $("#liars-title").innerHTML = "";
  $("#liars-log").innerHTML = renderDead21Log(gameState);
  const pile = $("#played-pile");
  pile.classList.remove("dead21-center");
  pile.classList.toggle("pile-empty", !gameState.lastPlay && !gameState.reveal?.card);
  pile.classList.toggle("pile-has-play", Boolean(gameState.lastPlay || gameState.reveal?.card));
  const revealShots = gameState.reveal?.shots || (gameState.reveal?.shot ? [gameState.reveal.shot] : []);
  const finalVisibleShots = gameState.reveal?.type === "final"
    ? revealShots.filter((shot) => dead21FinalShotVisualState(gameState, shot?.playerId).shotVisible)
    : revealShots;
  const pileNote = revealShots.length
    ? (finalVisibleShots.length
      ? finalVisibleShots.map((shot) => `${cleanText(shot?.name, "Joueur")} ${shot?.dead ? "meurt" : "survit"}`).join(" / ")
      : "Révélation des mains")
    : gameState.lastPlay
      ? `${gameState.names?.[gameState.lastPlay.playerId] || "Joueur"} annonce ${gameState.lastPlay.announcedValue}`
      : cleanLogText(gameState.announcement || gameState.turnText || "");
  pile.innerHTML = gameState.reveal?.card
    ? `
      <div class="revealed-cards dead21-center-cards">
        <span class="reveal-card" style="--i:0; --n:1">${dead21CardFace(gameState.reveal.card)}</span>
      </div>
      <span class="pile-announcement">${cleanLogText(pileNote)}</span>
    `
    : gameState.lastPlay
      ? `
        <div class="pile-facedown-cards">
          <span class="pile-facedown-card" style="--i:0; --n:1">${dead21BackFace()}</span>
        </div>
        <span class="pile-announcement">${cleanLogText(pileNote)}</span>
      `
      : "";

  const orderedPlayers = (gameState.order || []).map((id) => ({
    id,
    pseudo: gameState.names?.[id] || state.players.find((player) => player.id === id)?.pseudo || "Joueur",
    nameSkin: gameState.nameSkins?.[id] || state.players.find((player) => player.id === id)?.nameSkin || null,
  }));
  const myIndex = Math.max(0, orderedPlayers.findIndex((player) => player.id === state.user?.id));
  const relativePlayers = [...orderedPlayers.slice(myIndex), ...orderedPlayers.slice(0, myIndex)];
  const seats = dead21SeatMap(relativePlayers.length);
  const occupiedSeats = new Set();
  const seatByPlayer = {};
  relativePlayers.forEach((player, index) => {
    seatByPlayer[player.id] = seats[index];
    occupiedSeats.add(seats[index]);
  });

  [0, 1, 2, 3, 4, 5].forEach((index) => {
    const seat = $(`#seat-${index}`);
    const edgeHand = $(`#edge-hand-${index}`);
    if (!seat) return;
    if (!occupiedSeats.has(index)) {
      seat.classList.add("empty");
      seat.innerHTML = "";
      if (edgeHand) {
        edgeHand.classList.add("empty");
        edgeHand.innerHTML = "";
      }
    }
  });

  relativePlayers.forEach((player, index) => {
    const seatIndex = seats[index];
    const seat = $(`#seat-${seatIndex}`);
    const edgeHand = $(`#edge-hand-${seatIndex}`);
    if (!seat) return;
    const shotVisual = dead21FinalShotVisualState(gameState, player.id);
    const eliminated = shotVisual.eliminated;
    const showDeathMark = liarsSeatDeathMarkVisible(gameState, player.id, eliminated);
    const showAccuseMark = liarsSeatAccuseMarkVisible(gameState, player.id);
    const stayed = gameState.stayed?.[player.id] === true;
    const active = player.id === currentPlayerId && !blocked && !eliminated;
    const handCount = showingDeckIntro ? 0 : Number(gameState.handCounts?.[player.id] || 0);
    const danger = shotVisual.danger;
    const isMe = player.id === state.user?.id;
    seat.classList.remove("empty", "life-hit");
    seat.classList.toggle("dead21-punished", shotVisual.punished);
    seat.classList.toggle("active-turn", active);
    seat.innerHTML = `
      <strong>${renderName(player.pseudo, player.nameSkin)}</strong>
      <span class="life-badge roulette-badge">${eliminated ? "KO" : `TIR ${danger}/4`}</span>
      ${dead21ScoreHtml(gameState, player.id, { isMe })}
      ${showAccuseMark ? `<img class="seat-accuse-mark" src="${cardImage("Accuse")}" alt="" />` : ""}
      ${showDeathMark ? `<img class="seat-death-mark" src="${deathTokenForPlayer(player.id, gameState)}" alt="" onerror="this.onerror=null;this.src='${cardImage("Mort")}';" />` : ""}
    `;
    if (!edgeHand) return;
    edgeHand.classList.remove("empty");
    const cards = player.id === state.user?.id ? privateCards : Array.from({ length: handCount }, () => null);
    const hideOwnHand = player.id === state.user?.id && state.liars.handHidden;
    edgeHand.innerHTML = cards.map((card, cardIndex) => {
      const isMe = player.id === state.user?.id;
      const selected = isMe && card?.id === state.liars.deadSelectedCardId;
      return `
        <button class="table-card dead21-table-card ${selected ? "selected" : ""} ${card?.pendingDraw ? "pending-draw" : ""}" type="button" data-dead21-card="${escapeAttr(card?.id || "")}" ${isMe && isMyTurn && !blocked && !hideOwnHand && card?.id ? "" : "disabled"} style="--i:${cardIndex}; --n:${Math.max(1, cards.length)}">
          ${isMe && !hideOwnHand ? dead21CardFace(card) : dead21CardFace(null, true)}
        </button>
      `;
    }).join("");
  });

  $$(".dead21-only").forEach((button) => button.classList.remove("hidden"));
  refreshHandPrivacyToggle();
  renderDead21AnnouncePopover(gameState);
  refreshDead21SelectionUi(gameState);

  renderLiarsOverlay(dead21OverlayReveal(gameState), seatByPlayer);
  if (showingDeckIntro) {
    renderDead21DeckIntro(gameState.deckIntro);
    if (gameState.deckIntro.id !== state.liars.roundIntroId) {
      state.liars.roundIntroId = gameState.deckIntro.id;
      setTimeout(() => finalizeDead21DeckIntro(gameState.deckIntro.id), 6200);
    }
  }
  if (gameState.reveal?.id && gameState.reveal.id !== state.liars.lastDeadRevealId) {
    state.liars.lastDeadRevealId = gameState.reveal.id;
    clearTimeout(state.liars.revealTimer);
    clearInterval(state.liars.rouletteLogTimer);
    if (gameState.reveal.type === "final") {
      state.liars.rouletteLogTimer = setInterval(() => {
        if (getLiarsState()?.reveal?.id === gameState.reveal.id) renderLiars();
        else clearInterval(state.liars.rouletteLogTimer);
      }, 350);
    }
    const scoreRevealDelay = gameState.reveal.type === "final" ? dead21FinalScoreRevealDuration(gameState) : 0;
    const finalShotCount = Number(gameState.reveal.shots?.length || 0);
    state.liars.revealTimer = setTimeout(() => {
      if (getLiarsState()?.phase !== "game_over") dead21FinalizeReveal(gameState.reveal.id);
    }, gameState.reveal.type === "accuse" ? 9800 : scoreRevealDelay + (finalShotCount ? Math.max(DEAD21_FINAL_SHOT_MS + 600, finalShotCount * DEAD21_FINAL_SHOT_MS + 700) : 1600));
  }
  if (gameState.winner || phase === "game_over") scheduleLiarsEnd(gameState.reveal?.id ? liarsEndDelay(gameState) : 1000);
}

async function playDead21Card() {
  const selectedCard = dead21PrivateCards().find((card) => card.id === state.liars.deadSelectedCardId);
  if (!selectedCard) {
    showMessage("Choisis une carte.");
    return;
  }
  const announced = Number(state.liars.deadSelectedAnnounce);
  if (!dead21AnnouncementOptions(selectedCard).includes(announced)) {
    showMessage("Choisis une annonce valide.");
    return;
  }
  const pendingDraw = state.liars.deadPrivate?.pendingDraw;
  if (pendingDraw) {
    const choices = dead21PrivateCards();
    const kept = choices.find((card) => card.id !== selectedCard.id);
    if (!kept) {
      showMessage("Choisis la carte a garder apres la pioche.");
      return;
    }
    await runDead21Rpc("dead21_play_draw_choice_rpc", {
      p_played_card_id: selectedCard.id,
      p_kept_card_id: kept.id,
      p_announced_value: announced,
    });
    return;
  }
  await runDead21Rpc("dead21_play_card_rpc", {
    p_card_id: selectedCard.id,
    p_announced_value: announced,
  });
}

async function dead21Draw() {
  await runDead21Rpc("dead21_draw_card_rpc");
}

async function dead21Stay() {
  await runDead21Rpc("dead21_stay_rpc");
}

async function dead21Accuse() {
  await runDead21Rpc("dead21_accuse_rpc");
}

async function dead21FinalizeReveal(revealId) {
  if (!revealId || !isLiarsDead21Mode()) return;
  await runDead21Rpc("dead21_finalize_reveal_rpc", { p_reveal_id: revealId });
}

function renderLiars() {
  const gameState = getLiarsState();
  const screen = document.querySelector('[data-screen="liars-game"]');
  screen?.classList.toggle("chaos-screen", isLiarsChaosMode(gameState));
  screen?.classList.toggle("dead21-screen", isLiarsDead21Mode(gameState));
  if (!gameState) {
    $("#liars-title").innerHTML = "En attente";
    $("#played-pile").textContent = "0";
    $("#liars-log").textContent = "";
    renderLiarsOverlay(null);
    $$(".dead21-only").forEach((button) => button.classList.add("hidden"));
    [0, 1, 2, 3, 4, 5].forEach((index) => {
      const seat = $(`#seat-${index}`);
      const edgeHand = $(`#edge-hand-${index}`);
      if (seat) {
        seat.classList.add("empty");
        seat.innerHTML = "";
      }
      if (edgeHand) edgeHand.innerHTML = "";
    });
    return;
  }
  if (isLiarsDead21Mode(gameState)) {
    renderDead21(gameState);
    return;
  }
  $$(".dead21-only").forEach((button) => button.classList.add("hidden"));
  $("#played-pile")?.classList.remove("dead21-center");
  state.liars.deadRenderKey = "";
  $(".liars-header .small-label").textContent = "Valeur du tour";

  const currentPlayerId = getCurrentLiarsPlayerId(gameState);
  const isMyTurn = currentPlayerId === state.user.id;
  if (!isMyTurn && state.liars.selected.length) {
    state.liars.selected = [];
  }
  $("#liars-title").innerHTML = `<img class="target-card" src="${cardImage(gameState.target)}" alt="${gameState.target}" />`;
  const reveal = gameState.reveal || null;
  maybeFinalizeStaleLiarsReveal(gameState);
  const visibleChaosShots = chaosShotVisibleCount(reveal);
  const activeChaosShotIndex = chaosActiveShotIndex(reveal);
  const activeChaosShot = activeChaosShotIndex >= 0 ? (reveal?.chaosShots || [])[activeChaosShotIndex] : null;
  const revealCards = reveal?.cards || [];
  const pileElement = $("#played-pile");
  const pileText = gameState.lastPlay
    ? `${gameState.names[gameState.lastPlay.playerId] || "Joueur"} annonce ${gameState.lastPlay.count} ${targetLabel(gameState.target, gameState.lastPlay.count)}`
    : "";
  const pileBackCount = Math.max(1, Number(gameState.lastPlay?.count || gameState.pile?.length || 1));
  const pileKey = revealCards.length ? `reveal:${reveal.id}` : `pile:${pileBackCount}:${pileText || "back"}`;
  const isNewReveal = Boolean(reveal?.id && reveal.id !== state.liars.lastRevealId);
  if (!revealCards.length || isNewReveal) {
    pileElement.classList.remove("reveal-done");
  }
  pileElement.classList.toggle("pile-has-play", Boolean(pileText && !revealCards.length));
  pileElement.classList.toggle("pile-empty", Boolean(!pileText && !revealCards.length));
  pileElement.classList.remove("pile-text");
  if (state.liars.renderedPileKey !== pileKey) {
    state.liars.renderedPileKey = pileKey;
    pileElement.innerHTML = revealCards.length
      ? `
        <div class="revealed-cards">
          ${revealCards.map((card, index) => `
            <span class="reveal-card" style="--i:${index}; --n:${revealCards.length}">
              ${renderCardFace(card)}
            </span>
          `).join("")}
        </div>
      `
      : (pileText ? `
        <div class="pile-facedown-cards">
          ${Array.from({ length: Math.min(3, pileBackCount) }, (_, index) => `
            <span class="pile-facedown-card" style="--i:${index}; --n:${Math.min(3, pileBackCount)}">
              ${renderCardFace("Back")}
            </span>
          `).join("")}
        </div>
        <span class="pile-announcement">${cleanLogText(pileText)}</span>
      ` : "");
  }

  const orderedPlayers = gameState.order.map((id) => ({
    id,
    pseudo: gameState.names[id] || state.players.find((player) => player.id === id)?.pseudo || "Joueur",
    nameSkin: gameState.nameSkins?.[id] || state.players.find((player) => player.id === id)?.nameSkin || null,
  }));
  const rouletteMode = isLiarsRouletteMode(gameState);
  const myIndex = Math.max(0, orderedPlayers.findIndex((player) => player.id === state.user.id));
  const relativePlayers = [...orderedPlayers.slice(myIndex), ...orderedPlayers.slice(0, myIndex)];
  const seatByCount = {
    1: [0],
    2: [0, 1],
    3: [0, 2, 3],
    4: [0, 2, 1, 3],
    5: [0, 2, 4, 1, 3],
    6: [0, 2, 4, 1, 5, 3],
  };
  const seats = seatByCount[relativePlayers.length] || seatByCount[6];
  const table = $(".liars-table");
  table?.classList.remove("players-1", "players-2", "players-3", "players-4", "players-5", "players-6");
  table?.classList.add(`players-${Math.min(6, Math.max(1, relativePlayers.length))}`);
  const seatByPlayer = {};
  relativePlayers.forEach((player, index) => {
    seatByPlayer[player.id] = seats[index];
  });
  const occupiedSeats = new Set(Object.values(seatByPlayer));
  const blocked = isLiarsBlocked(gameState);

  [0, 1, 2, 3, 4, 5].forEach((index) => {
    const seat = $(`#seat-${index}`);
    const edgeHand = $(`#edge-hand-${index}`);
    if (!seat) return;
    if (occupiedSeats.has(index)) return;
    seat.classList.add("empty");
    seat.classList.remove("active-turn");
    seat.dataset.seatKey = "";
    seat.dataset.playerId = "";
    seat.innerHTML = "";
    if (edgeHand) {
      edgeHand.classList.add("empty");
      edgeHand.dataset.handKey = "";
      edgeHand.innerHTML = "";
    }
  });

  relativePlayers.forEach((player, index) => {
    const seatIndex = seats[index];
    const seat = $(`#seat-${seatIndex}`);
    const edgeHand = $(`#edge-hand-${seatIndex}`);
    if (!seat) return;
    const handCount = gameState.hands[player.id]?.length || 0;
    const lives = gameState.lives[player.id] || 0;
    const displayedLives = reveal?.loserId === player.id && Number.isFinite(reveal.livesBefore)
      ? reveal.livesBefore
      : lives;
    const isMe = player.id === state.user.id;
    const isActive = player.id === currentPlayerId && !blocked;
    const allChaosShots = reveal?.chaosShots || [];
    const visibleShotList = allChaosShots.slice(0, visibleChaosShots);
    const isShooterShot = (shot) => (shot?.shooterId || shot?.playerId) === player.id;
    const chaosShot = allChaosShots.find(isShooterShot);
    const latestVisibleChaosShot = [...visibleShotList].reverse().find(isShooterShot);
    const liveChaosShot = activeChaosShot && isShooterShot(activeChaosShot) ? activeChaosShot : null;
    const displayedChaosShot = liveChaosShot || latestVisibleChaosShot;
    const visibleTargetShot = [...visibleShotList].reverse().find((shot) => shot.playerId === player.id);
    const isLifeHit = reveal?.loserId === player.id || Boolean(visibleTargetShot);
    const isEliminated = Number(gameState.lives?.[player.id] || 0) <= 0;
    const showDeathMark = liarsSeatDeathMarkVisible(gameState, player.id, isEliminated);
    const showAccuseMark = liarsSeatAccuseMarkVisible(gameState, player.id);
    const badgeText = rouletteMode
      ? (chaosShot
        ? (displayedChaosShot ? `TIR ${Number(displayedChaosShot.usedAfter || 0)}/6` : `TIR ${Number(chaosShot.usedBefore || 0)}/6`)
        : (visibleTargetShot?.dead ? "KO" : null) || ((visibleTargetShot && reveal?.special === "hunter") ? rouletteBadge(gameState, player.id, false, reveal) : rouletteBadge(gameState, player.id, isLifeHit, reveal)))
      : ("♥".repeat(displayedLives) || "0");
    const seatKey = `${player.pseudo}|${player.nameSkin || ""}|${badgeText}|${isActive ? 1 : 0}|${isLifeHit ? 1 : 0}|${handCount}|${showDeathMark ? 1 : 0}|${showAccuseMark ? 1 : 0}`;
    seat.classList.remove("empty");
    seat.dataset.playerId = player.id;
    seat.classList.toggle("active-turn", isActive);
    seat.classList.toggle("life-hit", isLifeHit);
    seat.style.setProperty("--cards", Math.max(1, handCount));
    if (seat.dataset.seatKey !== seatKey) {
      seat.dataset.seatKey = seatKey;
      seat.innerHTML = `
        <strong>${renderName(player.pseudo, player.nameSkin)}</strong>
        <span class="life-badge ${rouletteMode ? "roulette-badge" : ""}">${cleanText(badgeText)}</span>
        ${showAccuseMark ? `<img class="seat-accuse-mark" src="${cardImage("Accuse")}" alt="" />` : ""}
        ${showDeathMark ? `<img class="seat-death-mark" src="${deathTokenForPlayer(player.id, gameState)}" alt="" onerror="this.onerror=null;this.src='${cardImage("Mort")}';" />` : ""}
      `;
    }
    if (edgeHand) {
      const cards = isMe ? (gameState.hands[player.id] || []) : Array.from({ length: handCount }, () => "Back");
      edgeHand.classList.remove("empty");
      const hideOwnHand = isMe && state.liars.handHidden;
      const spectator = isMe && isEliminated && liarsDeathIsVisuallyConfirmed(gameState, player.id);
      const handKey = `${seatIndex}|${player.id}|${spectator ? "spectator" : isMe && !hideOwnHand ? cards.join("|") : `backs:${handCount}`}|${isMe && isMyTurn && !blocked && !hideOwnHand ? "play" : "lock"}|${hideOwnHand ? 1 : 0}`;
      edgeHand.classList.toggle("spectator-hand", spectator);
      if (edgeHand.dataset.handKey !== handKey) {
        edgeHand.dataset.handKey = handKey;
        edgeHand.innerHTML = spectator
          ? renderSpectatorPanel()
          : cards
          .map((card, cardIndex) => {
            const selected = isMe && state.liars.selected.includes(cardIndex);
            const blockedByMax = isMe && isMyTurn && !selected && state.liars.selected.length >= 3;
            const blockedByChaosSpecial = isMe && isMyTurn && isLiarsCardSelectionLocked(cards, cardIndex, gameState);
            const disabled = isMe && isMyTurn && !blocked && !hideOwnHand && !blockedByMax && !blockedByChaosSpecial ? "" : "disabled";
            return `
              <button class="table-card ${selected ? "selected" : ""} ${blockedByMax || blockedByChaosSpecial ? "selection-locked" : ""}" type="button" data-card="${cardIndex}" ${isMe ? disabled : "disabled"} style="--i:${cardIndex}; --n:${cards.length}">
                ${isMe && !hideOwnHand ? renderCardFace(card) : renderCardFace("Back")}
              </button>
            `;
          })
          .join("");
      }
    }
  });

  refreshHandPrivacyToggle();
  renderLiarsOverlay(reveal, seatByPlayer);

  const rouletteLogReady = !reveal?.roulette || Date.now() - liarsRevealStartedAt(reveal) >= 8200;
  const chaosShotCount = Number(reveal?.chaosShots?.length || 0);
  const chaosSequenceEnd = chaosShotCount ? chaosRevealDuration(reveal) - 550 : 0;
  const chaosLogReady = !chaosShotCount || Date.now() - liarsRevealStartedAt(reveal) >= chaosSequenceEnd;
  let visibleShotEvents = 0;
  const events = (gameState.events || (gameState.history || []).map((text) => liarsEvent("info", text)))
    .filter((event) => ["turn", "accuse", "announce", "shot"].includes(event.type))
    .filter((event) => {
      if (rouletteLogReady && chaosLogReady) return true;
      const text = cleanLogText(event.text).toLowerCase();
      if (chaosShotCount && event.type === "shot") {
        visibleShotEvents += 1;
        return visibleShotEvents <= visibleChaosShots;
      }
      if (!chaosLogReady && (text.includes("meurt") || text.includes("survit") || text.includes("gagne la partie"))) return false;
      return !text.includes("tombe sur la balle") && !text.includes("tombe sur une chambre vide");
    })
    .slice(-8)
    .reverse();
  const logHtml = `
    <div class="log-scroll">
      ${events.map((event, index) => `<small class="log-line log-${cleanText(event.type, "info")} ${index === 0 ? "latest" : ""}"><b>${event.type === "turn" ? "TOUR" : event.type === "announce" ? "ANNONCE" : event.type === "shot" ? "TIR" : "ACCUSE"}</b>${cleanLogText(event.text)}</small>`).join("")}
    </div>
  `;
  const logElement = $("#liars-log");
  if (logElement.dataset.logKey !== logHtml) {
    logElement.dataset.logKey = logHtml;
    logElement.innerHTML = logHtml;
  }
  $("#play-cards").disabled = !isMyTurn;
  $("#play-cards").disabled = !isMyTurn || blocked || state.liars.selected.length < 1;
  $("#play-cards").classList.toggle("play-ready", isMyTurn && !blocked && state.liars.selected.length >= 1);
  $("#accuse").disabled = !isMyTurn || !gameState.lastPlay || blocked;

  if (gameState.roundIntro?.id && gameState.roundIntro.id !== state.liars.roundIntroId) {
    state.liars.roundIntroId = gameState.roundIntro.id;
    setTimeout(() => finalizeRoundIntro(gameState.roundIntro.id), 5300);
  }

  if (!isLiarsBlocked(gameState)) {
    const currentName = gameState.names[currentPlayerId] || "Joueur";
    showTurnToast(currentName, `${gameState.version || 0}-${currentPlayerId}`);
  }

  if (isNewReveal) {
    state.liars.lastRevealId = reveal.id;
    clearTimeout(state.liars.revealTimer);
    clearTimeout(state.liars.rouletteLogTimer);
    if (reveal.roulette) {
      state.liars.rouletteLogTimer = setTimeout(() => {
        if (getLiarsState()?.reveal?.id === reveal.id) renderLiars();
      }, 8200);
    } else if (reveal.chaosShots?.length) {
      state.liars.rouletteLogTimer = setInterval(() => {
        if (getLiarsState()?.reveal?.id === reveal.id) {
          renderLiars();
        } else {
          clearInterval(state.liars.rouletteLogTimer);
        }
      }, 350);
    }
    state.liars.revealTimer = setTimeout(() => {
      const pile = $("#played-pile");
      pile?.classList.add("reveal-done");
      if (getLiarsState()?.winner) scheduleLiarsEnd(650);
      finalizeLiarsReveal(reveal.id);
    }, reveal.chaosShots?.length ? chaosRevealDuration(reveal) : reveal.roulette ? 9800 : 6000);
  }
}

function toggleCard(index) {
  const gameState = getLiarsState();
  if (isLiarsBlocked(gameState)) return;
  if (getCurrentLiarsPlayerId(gameState) !== state.user.id) return;
  const hand = gameState.hands?.[state.user.id] || [];
  const card = hand[index];
  if (state.liars.selected.includes(index)) {
    if (
      isLiarsChaosMode(gameState)
      && !isChaosFarWest(card)
      && state.liars.selected.length === hand.length
      && state.liars.selected.some((item) => isChaosFarWest(hand[item]))
    ) {
      state.liars.selected = state.liars.selected.filter((item) => isChaosFarWest(hand[item]));
    } else {
      state.liars.selected = state.liars.selected.filter((item) => item !== index);
    }
  } else {
    if (isLiarsChaosMode(gameState)) {
      const selectedCards = state.liars.selected.map((item) => hand[item]).filter(Boolean);
      if (isChaosFarWest(card) && selectedCards.length) {
        state.liars.selected = hand.map((_, cardIndex) => cardIndex);
        renderLiarsSelection();
        return;
      }
      if (!isChaosFarWest(card) && selectedCards.some(isChaosFarWest)) {
        state.liars.selected = hand.map((_, cardIndex) => cardIndex);
        renderLiarsSelection();
        return;
      }
    }
    if (state.liars.selected.length >= 3) return;
    if (isLiarsCardSelectionLocked(hand, index, gameState)) return;
    state.liars.selected.push(index);
  }
  renderLiarsSelection();
}

function renderLiarsSelection() {
  const gameState = getLiarsState();
  const hand = gameState?.hands?.[state.user.id] || [];
  $$("#edge-hand-0 [data-card]").forEach((button) => {
    const index = Number(button.dataset.card);
    const selected = state.liars.selected.includes(index);
    const canFarWestCompleteHand = isLiarsChaosMode(gameState)
      && state.liars.selected.length < hand.length
      && (isChaosFarWest(hand[index]) || state.liars.selected.some((item) => isChaosFarWest(hand[item])));
    const locked = !selected && !canFarWestCompleteHand && (state.liars.selected.length >= 3 || isLiarsCardSelectionLocked(hand, index, gameState));
    button.classList.toggle("selected", selected);
    button.classList.toggle("selection-locked", locked);
    button.disabled = locked;
  });
  const ready = getCurrentLiarsPlayerId(gameState) === state.user.id && state.liars.selected.length >= 1 && !isLiarsBlocked(gameState);
  $("#play-cards").disabled = !ready;
  $("#play-cards").classList.toggle("play-ready", ready);
}

function refreshHandPrivacyToggle() {
  const button = $("#hand-privacy-toggle");
  if (!button) return;
  const show = state.screen === "liars-game";
  button.classList.toggle("hidden", !show);
  button.classList.toggle("active", Boolean(state.liars.handHidden));
  button.setAttribute("aria-label", state.liars.handHidden ? "Afficher la main" : "Cacher la main");
}

async function playCards() {
  if (state.liars.saving) return;
  const gameState = cloneData(getLiarsState());
  if (isLiarsBlocked(gameState)) return;
  if (!gameState || getCurrentLiarsPlayerId(gameState) !== state.user.id) {
    showMessage("Ce n'est pas ton tour.");
    return;
  }
  if (state.liars.selected.length < 1) return;
  if (state.liars.selected.length > 3) {
    showMessage("Tu peux poser 1 a 3 cartes maximum.");
    return;
  }
  if (playersWithCards(gameState).length <= 1 && gameState.lastPlay) {
    showMessage("Tu es le dernier avec des cartes: tu dois accuser.");
    return;
  }
  const selectedIndexes = [...state.liars.selected].sort((a, b) => a - b);
  const hand = gameState.hands[state.user.id] || [];
  const playedCards = selectedIndexes.map((index) => hand[index]).filter(Boolean);
  if (!playedCards.length) return;
  const hasFarWest = playedCards.some(isChaosFarWest);
  if (isLiarsChaosMode(gameState) && hasFarWest) {
    if (playedCards.length === 2) {
      showMessage("Far West ne peut pas etre jouee avec exactement 2 cartes.");
      return;
    }
    if (playedCards.length !== 1 && playedCards.length !== hand.length) {
      showMessage("Far West doit etre jouee seule ou avec toute ta main.");
      return;
    }
  }
  if (isLiarsChaosMode(gameState) && playedCards.some(isChaosSpecialCard) && playedCards.length !== 1) {
    showMessage("Demon et Chasseur doivent etre joues seuls.");
    return;
  }
  markLastUnaccusedBluff(gameState);
  const liedForBadge = playedCards.some((card) => card !== gameState.target && card !== "Joker" && card !== "FarWest");
  if (liedForBadge) setLiarsBadgeFlag(gameState, state.user.id, "liedThisGame", true);
  if (isLiarsChaosMode(gameState)) {
    if (playedCards.includes("Demon")) addLiarsProfileStat(gameState, state.user.id, "devilPlayed", 1);
    if (playedCards.includes("Chasseur")) addLiarsProfileStat(gameState, state.user.id, "hunterPlayed", 1);
    if (playedCards.includes("FarWest")) addLiarsProfileStat(gameState, state.user.id, "farWestPlayed", 1);
  }
  gameState.hands[state.user.id] = hand.filter((_, index) => !selectedIndexes.includes(index));
  gameState.pile.push(...playedCards);
  gameState.lastPlay = {
    playerId: state.user.id,
    cards: playedCards,
    count: playedCards.length,
    farWestFullHand: isLiarsChaosMode(gameState) && hasFarWest && playedCards.length === hand.length && playedCards.length > 2,
  };
  gameState.lastPlayBadge = {
    playerId: state.user.id,
    lied: liedForBadge,
    count: playedCards.length,
  };
  const announcement = `${state.user.pseudo} annonce ${playedCards.length} ${gameState.target}.`;
  gameState.announcement = announcement;
  pushLiarsEvents(gameState, [
    liarsEvent("announce", `${state.user.pseudo} annonce ${playedCards.length} ${targetLabel(gameState.target, playedCards.length)}.`),
  ]);
  const withCards = playersWithCards(gameState);
  if (!withCards.length) {
    redealLiarsRound(gameState, "Toutes les cartes ont ete jouees.");
  } else if (withCards.length === 1) {
    gameState.currentIndex = gameState.order.findIndex((id) => id === withCards[0]);
    gameState.turnText = `${gameState.names[withCards[0]] || "Joueur"} doit accuser.`;
    pushLiarsEvents(gameState, liarsEvent("turn", gameState.turnText));
  } else {
    gameState.currentIndex = nextLiarsIndex(gameState);
    const nextPlayerId = getCurrentLiarsPlayerId(gameState);
    const nextName = gameState.names[nextPlayerId] || "Joueur suivant";
    gameState.turnText = `Tour de ${nextName}.`;
    pushLiarsEvents(gameState, liarsEvent("turn", gameState.turnText));
  }
  gameState.version = Number(gameState.version || 0) + 1;
  state.liars.selected = [];
  await saveLiarsState(gameState);
}

async function resolveRouletteAccusation(gameState, details) {
  const {
    accusedId,
    accusedCards,
    lied,
    loserId,
    accuserName,
    accusedName,
    loserName,
    resultText,
  } = details;
  const shot = shootRoulette(gameState, loserId);
  recordLiarsRouletteProfileShot(gameState, loserId, shot);
  const loserLivesBefore = gameState.lives[loserId] || 1;
    if (shot.dead) {
      gameState.lives[loserId] = 0;
      markLiarsEliminated(gameState, loserId);
      addLiarsBadgeStat(gameState, lied ? state.user.id : accusedId, "responsibleKills", 1);
      if (isLiarsChaosMode(gameState)) resetRouletteBarrel(gameState, loserId);
    }
  const alive = aliveLiarsPlayers(gameState);
  const revealedText = accusedCards.join(", ");
  const nextStarterId = nextAliveIdAfter(gameState, loserId);
  const usedBefore = Math.max(0, Number(shot.usedAfter || 0) - (shot.dead ? 0 : 1));
  const shotWeaponSkinId = await liveWeaponSkinForPlayer(loserId, gameState);
  gameState.reveal = {
    id: `${Date.now()}-${Number(gameState.version || 0) + 1}`,
    startedAt: Date.now(),
    cards: accusedCards,
    target: gameState.target,
    accuserId: state.user.id,
    accusedId,
    loserId,
    loserName,
    livesBefore: loserLivesBefore,
    lied,
    text: shot.dead ? `${loserName} est elimine.` : `${loserName} survit au tir.`,
    pendingRedeal: alive.length > 1,
    nextStarterId,
    roulette: {
      shooterId: loserId,
      weaponSkin: shotWeaponSkinId,
      finalPosition: shot.finalPosition,
      dead: shot.dead,
      remainingBefore: shot.remainingBefore,
      usedBefore,
      usedAfter: shot.usedAfter,
    },
  };
  gameState.announcement = shot.dead ? `${loserName} est elimine.` : `${loserName} survit au tir.`;
  gameState.pile = [];
  gameState.lastPlay = null;
  pushLiarsEvents(gameState, [
    liarsEvent("accuse", `${accuserName} accuse ${accusedName} de mentir.`),
    liarsEvent("accuse", resultText),
    liarsEvent("accuse", `${loserName} tire a la roulette russe`),
    liarsEvent("accuse", shot.dead ? `${loserName} tombe sur la balle` : `${loserName} tombe sur une chambre vide`),
  ]);

  if (shot.dead) {
    pushLiarsEvents(gameState, [
      liarsEvent("elimination", `${loserName} est elimine.`),
      liarsEvent("elimination", `${loserName} quitte la table.`),
    ]);
  }

  if (alive.length <= 1) {
    gameState.winner = alive[0] || "";
    const winnerName = gameState.names[gameState.winner] || "Joueur";
    pushLiarsEvents(gameState, [
      liarsEvent("win", `${winnerName} gagne la partie.`),
      liarsEvent("win", `Fin de partie - ${winnerName} est le dernier survivant.`),
    ]);
    await awardLiarsEndRewards(gameState, gameState.winner, secondPlaceForLiars(gameState, shot.dead ? loserId : ""), `roulette-${gameState.reveal.id}`);
    gameState.version = Number(gameState.version || 0) + 1;
    await saveLiarsState(gameState);
    scheduleLiarsEnd(10600);
    return;
  }

  gameState.turnText = "Nouveau round apres le tir.";
  pushLiarsEvents(gameState, liarsEvent("round", "Nouveau round apres le tir."));
  gameState.version = Number(gameState.version || 0) + 1;
  state.liars.selected = [];
  await saveLiarsState(gameState);
}

async function resolveChaosDemon(gameState, { accusedId, accusedCards, accuserName, accusedName }) {
  ensureRouletteBarrels(gameState);
  markChaosSpecialRevealed(gameState, "demon");
  const shots = await Promise.all(aliveLiarsPlayers(gameState)
    .filter((id) => id !== accusedId)
    .map(async (id) => {
      const result = shootRoulette(gameState, id);
      recordLiarsRouletteProfileShot(gameState, id, result);
      if (result.dead) {
        gameState.lives[id] = 0;
        markLiarsEliminated(gameState, id);
        addLiarsProfileStat(gameState, accusedId, "specialKills", 1);
        addLiarsBadgeStat(gameState, accusedId, "demonKillsThisGame", 1);
        addLiarsBadgeStat(gameState, accusedId, "responsibleKills", 1);
      }
      const usedBefore = Math.max(0, Number(result.usedAfter || 0) - (result.dead ? 0 : 1));
      const shotWeaponSkinId = await liveWeaponSkinForPlayer(id, gameState);
      return {
        playerId: id,
        name: gameState.names[id] || "Joueur",
        shooterId: id,
        weaponSkin: shotWeaponSkinId,
        dead: result.dead,
        finalPosition: result.finalPosition,
        remainingBefore: result.remainingBefore,
        usedBefore,
        usedAfter: result.usedAfter,
      };
    }));
  const alive = aliveLiarsPlayers(gameState);
  const nextStarterId = nextAliveIdAfter(gameState, accusedId);
  gameState.reveal = {
    id: `${Date.now()}-${Number(gameState.version || 0) + 1}`,
    startedAt: Date.now(),
    special: "demon",
    cards: accusedCards,
    accuserId: state.user.id,
    accusedId,
    loserId: shots.find((shot) => shot.dead)?.playerId || shots[0]?.playerId || "",
    accusedName,
    chaosShots: shots,
    pendingRedeal: alive.length > 1,
    nextStarterId,
  };
  gameState.announcement = `${accusedName} revele le Demon.`;
  addLiarsProfileStat(gameState, accusedId, "devilTriggered", 1);
  setLiarsBadgeFlag(gameState, accusedId, "demonTriggeredThisGame", true);
  gameState.pile = [];
  gameState.lastPlay = null;
  pushLiarsEvents(gameState, [
    liarsEvent("accuse", `${accuserName} accuse ${accusedName} de mentir.`),
    liarsEvent("accuse", `${accusedName} revele le Demon.`),
    ...shots.map((shot) => liarsEvent("shot", `${shot.name} ${shot.dead ? "meurt" : "survit"}`)),
  ]);
  if (alive.length <= 1) {
    gameState.winner = alive[0] || accusedId;
    pushLiarsEvents(gameState, liarsEvent("win", `${gameState.names[gameState.winner] || "Joueur"} gagne la partie.`));
    await awardLiarsEndRewards(gameState, gameState.winner, secondPlaceForLiars(gameState), `demon-${gameState.reveal.id}`);
  }
  gameState.version = Number(gameState.version || 0) + 1;
  state.liars.selected = [];
  await saveLiarsState(gameState);
}

async function resolveChaosHunter(gameState, { accusedId, accusedCards, accuserName, accusedName }) {
  ensureRouletteBarrels(gameState);
  markChaosSpecialRevealed(gameState, "hunter");
  const shooterId = state.user.id;
  const result = shootRoulette(gameState, shooterId);
  recordLiarsRouletteProfileShot(gameState, accusedId, result);
  if (result.dead) {
    gameState.lives[accusedId] = 0;
    markLiarsEliminated(gameState, accusedId);
    resetRouletteBarrel(gameState, shooterId);
    addLiarsProfileStat(gameState, shooterId, "hunterKills", 1);
    addLiarsProfileStat(gameState, shooterId, "specialKills", 1);
    addLiarsBadgeStat(gameState, shooterId, "responsibleKills", 1);
  }
  const usedBefore = Math.max(0, Number(result.usedAfter || 0) - (result.dead ? 0 : 1));
  const alive = aliveLiarsPlayers(gameState);
  const nextStarterId = nextAliveIdAfter(gameState, accusedId);
  const shotWeaponSkinId = await liveWeaponSkinForPlayer(shooterId, gameState);
  gameState.reveal = {
    id: `${Date.now()}-${Number(gameState.version || 0) + 1}`,
    startedAt: Date.now(),
    special: "hunter",
    cards: accusedCards,
    accuserId: state.user.id,
    accusedId,
    loserId: accusedId,
    accusedName,
    shooterId,
    shooterName: accuserName,
    chaosShots: [{
      playerId: accusedId,
      name: accusedName,
      shooterId,
      shooterName: accuserName,
      weaponSkin: shotWeaponSkinId,
      dead: result.dead,
      finalPosition: result.finalPosition,
      remainingBefore: result.remainingBefore,
      usedBefore,
      usedAfter: result.usedAfter,
    }],
    pendingRedeal: alive.length > 1,
    nextStarterId,
  };
  gameState.announcement = `${accuserName} tire sur ${accusedName}.`;
  gameState.pile = [];
  gameState.lastPlay = null;
  pushLiarsEvents(gameState, [
    liarsEvent("accuse", `${accuserName} accuse ${accusedName} de mentir.`),
    liarsEvent("accuse", `${accusedName} revele le Chasseur.`),
    liarsEvent("shot", `${accuserName} tire sur ${accusedName}`),
    liarsEvent("shot", `${accusedName} ${result.dead ? "meurt" : "survit"}`),
  ]);
  if (alive.length <= 1) {
    gameState.winner = alive[0] || "";
    pushLiarsEvents(gameState, liarsEvent("win", `${gameState.names[gameState.winner] || "Joueur"} gagne la partie.`));
    await awardLiarsEndRewards(gameState, gameState.winner, secondPlaceForLiars(gameState, result.dead ? accusedId : ""), `hunter-${gameState.reveal.id}`);
  }
  gameState.version = Number(gameState.version || 0) + 1;
  state.liars.selected = [];
  await saveLiarsState(gameState);
}

async function resolveChaosFarWest(gameState, { accusedId, accusedCards, accuserName, accusedName }) {
  ensureRouletteBarrels(gameState);
  markChaosSpecialRevealed(gameState, "farwest");
  const accuserId = state.user.id;
  const shots = [];
  const survivedShots = {};
  let deadId = "";
  for (let index = 0; index < 24 && !deadId; index += 1) {
    const shooterId = index % 2 === 0 ? accuserId : accusedId;
    const targetId = shooterId === accuserId ? accusedId : accuserId;
    const result = shootRoulette(gameState, shooterId);
    recordLiarsRouletteProfileShot(gameState, targetId, result);
    if (result.dead) {
      deadId = targetId;
      gameState.lives[targetId] = 0;
      markLiarsEliminated(gameState, targetId);
    } else {
      survivedShots[targetId] = Number(survivedShots[targetId] || 0) + 1;
      setLiarsBadgeStatMax(gameState, targetId, "farWestDuelSurvivedShotsMax", survivedShots[targetId]);
    }
    const usedBefore = Math.max(0, Number(result.usedAfter || 0) - (result.dead ? 0 : 1));
    const shotWeaponSkinId = await liveWeaponSkinForPlayer(shooterId, gameState);
    shots.push({
      playerId: targetId,
      name: gameState.names[targetId] || "Joueur",
      shooterId,
      shooterName: gameState.names[shooterId] || "Joueur",
      weaponSkin: shotWeaponSkinId,
      dead: result.dead,
      finalPosition: result.finalPosition,
      remainingBefore: result.remainingBefore,
      usedBefore,
      usedAfter: result.usedAfter,
    });
  }

  const winnerId = deadId ? (deadId === accuserId ? accusedId : accuserId) : "";
  if (winnerId) resetRouletteBarrel(gameState, winnerId);
  if (winnerId) addLiarsProfileStat(gameState, winnerId, "farWestDuelsWon", 1);
  if (deadId) addLiarsProfileStat(gameState, deadId, "farWestDuelsLost", 1);
  if (deadId) addLiarsProfileStat(gameState, winnerId, "specialKills", 1);
  if (deadId) addLiarsBadgeStat(gameState, winnerId, "responsibleKills", 1);
  const alive = aliveLiarsPlayers(gameState);
  const nextStarterId = nextAliveIdAfter(gameState, deadId || accusedId);
  gameState.reveal = {
    id: `${Date.now()}-${Number(gameState.version || 0) + 1}`,
    startedAt: Date.now(),
    special: "farwest",
    cards: accusedCards,
    accuserId,
    accusedId,
    loserId: deadId || shots[shots.length - 1]?.playerId || "",
    accusedName,
    chaosShots: shots,
    pendingRedeal: alive.length > 1,
    nextStarterId,
  };
  gameState.announcement = deadId
    ? `${gameState.names[winnerId] || "Joueur"} gagne le duel Far West.`
    : "Le duel Far West continue.";
  gameState.pile = [];
  gameState.lastPlay = null;
  pushLiarsEvents(gameState, [
    liarsEvent("accuse", `${accuserName} accuse ${accusedName} de mentir.`),
    liarsEvent("accuse", `${accusedName} revele Far West.`),
    liarsEvent("shot", `Duel Far West: ${accuserName} contre ${accusedName}.`),
    ...shots.map((shot) => liarsEvent("shot", `${shot.shooterName} tire sur ${shot.name} - ${shot.dead ? "meurt" : "survit"}`)),
  ]);
  if (deadId) {
    const deadName = gameState.names[deadId] || "Joueur";
    pushLiarsEvents(gameState, [
      liarsEvent("elimination", `${deadName} est elimine.`),
      liarsEvent("elimination", `${deadName} quitte la table.`),
    ]);
  }
  if (alive.length <= 1) {
    gameState.winner = alive[0] || winnerId || "";
    pushLiarsEvents(gameState, liarsEvent("win", `${gameState.names[gameState.winner] || "Joueur"} gagne la partie.`));
    await awardLiarsEndRewards(gameState, gameState.winner, secondPlaceForLiars(gameState, deadId), `farwest-${gameState.reveal.id}`);
  }
  gameState.version = Number(gameState.version || 0) + 1;
  state.liars.selected = [];
  await saveLiarsState(gameState);
}

async function accuse() {
  if (state.liars.saving) return;
  const gameState = cloneData(getLiarsState());
  if (isLiarsBlocked(gameState)) return;
  if (!gameState || getCurrentLiarsPlayerId(gameState) !== state.user.id) {
    showMessage("Ce n'est pas ton tour.");
    return;
  }
  if (!gameState.lastPlay) {
    showMessage("Il faut attendre qu'un joueur pose des cartes.");
    return;
  }

  const accusedId = getPreviousLiarsPlayerId(gameState);
  const accusedCards = gameState.lastPlay.cards || [];
  const farWestDuel = isLiarsChaosMode(gameState)
    && Boolean(gameState.lastPlay.farWestFullHand)
    && accusedCards.includes("FarWest");
  const lied = accusedCards.some((card) => card !== gameState.target && card !== "Joker" && card !== "FarWest");
  const loserId = lied ? accusedId : state.user.id;
  const stats = ensureLiarsStats(gameState);
  setLiarsBadgeFlag(gameState, accusedId, "accusedThisGame", true);
  if (lied) {
    stats[state.user.id].accuseOk += 1;
    addLiarsProfileStat(gameState, state.user.id, "accuseOk", 1);
    addLiarsProfileStat(gameState, accusedId, "bluffsFailed", 1);
    addLiarsBadgeStat(gameState, state.user.id, "accuseStreak", 1);
    setLiarsBadgeStatMax(gameState, state.user.id, "maxAccuseStreak", Number(gameState.badgeStats?.[state.user.id]?.accuseStreak || 0));
  } else {
    stats[state.user.id].accuseWrong += 1;
    addLiarsProfileStat(gameState, state.user.id, "accuseWrong", 1);
    addLiarsProfileStat(gameState, accusedId, "bluffsSuccessful", 1);
    gameState.badgeStats ||= {};
    gameState.badgeStats[state.user.id] ||= {};
    gameState.badgeStats[state.user.id].accuseStreak = 0;
    addLiarsBadgeStat(gameState, accusedId, "bluffsSuccessfulThisGame", 1);
    setLiarsBadgeStatMax(gameState, accusedId, "maxBluffsSuccessfulThisGame", Number(gameState.badgeStats?.[accusedId]?.bluffsSuccessfulThisGame || 0));
  }
  gameState.lastPlayBadge = null;
  const accuserName = gameState.names[state.user.id] || state.user.pseudo || "Joueur";
  const accusedName = gameState.names[accusedId] || "Joueur";
  const loserName = gameState.names[loserId] || "Joueur";
  const revealedText = accusedCards.join(", ");
  await awardLiarsReward(
    gameState,
    lied ? "accuse_success" : "bluff_success",
    lied ? state.user.id : accusedId,
    `${Number(gameState.version || 0) + 1}-${accusedId}`,
  );
  if (farWestDuel) {
    await resolveChaosFarWest(gameState, { accusedId, accusedCards, accuserName, accusedName });
    return;
  }
  if (isLiarsChaosMode(gameState) && accusedCards.length === 1 && accusedCards[0] === "Demon") {
    await resolveChaosDemon(gameState, { accusedId, accusedCards, accuserName, accusedName });
    return;
  }
  if (isLiarsChaosMode(gameState) && accusedCards.length === 1 && accusedCards[0] === "Chasseur") {
    await resolveChaosHunter(gameState, { accusedId, accusedCards, accuserName, accusedName });
    return;
  }
  const resultText = lied
    ? `${accusedName} a menti.`
    : `${accusedName} disait la verite.`;
  if (isLiarsRouletteMode(gameState)) {
    await resolveRouletteAccusation(gameState, {
      accusedId,
      accusedCards,
      lied,
      loserId,
      accuserName,
      accusedName,
      loserName,
      resultText,
    });
    return;
  }
  const loserLivesBefore = gameState.lives[loserId] || 0;
  const loserLivesAfter = Math.max(0, (gameState.lives[loserId] || 0) - 1);
  gameState.lives[loserId] = loserLivesAfter;
  gameState.reveal = {
    id: `${Date.now()}-${Number(gameState.version || 0) + 1}`,
    startedAt: Date.now(),
    cards: accusedCards,
    target: gameState.target,
    accuserId: state.user.id,
    accusedId,
    loserId,
    livesBefore: loserLivesBefore,
    lied,
    text: resultText,
    pendingRedeal: false,
  };
  gameState.announcement = resultText;
  gameState.pile = [];
  gameState.lastPlay = null;
  pushLiarsEvents(gameState, [
    liarsEvent("accuse", `${accuserName} accuse ${accusedName} de mentir.`),
  ]);

  const alive = gameState.order.filter((id) => (gameState.lives[id] || 0) > 0);
  if (alive.length <= 1) {
    gameState.winner = alive[0] || "";
    if (loserLivesAfter <= 0) {
      markLiarsEliminated(gameState, loserId);
      pushLiarsEvents(gameState, [
        liarsEvent("elimination", `${loserName} est elimine.`),
        liarsEvent("elimination", `${loserName} quitte la table.`),
      ]);
    }
    const winnerName = gameState.names[gameState.winner] || "Joueur";
    pushLiarsEvents(gameState, [
      liarsEvent("win", `${winnerName} gagne la partie.`),
      liarsEvent("win", `Fin de partie - ${winnerName} est le dernier survivant.`),
    ]);
    await awardLiarsEndRewards(gameState, gameState.winner, secondPlaceForLiars(gameState, loserLivesAfter <= 0 ? loserId : ""), `classic-${gameState.reveal.id}`);
    gameState.version = Number(gameState.version || 0) + 1;
    await saveLiarsState(gameState);
    scheduleLiarsEnd(6800);
    return;
  }
  if (loserLivesAfter <= 0) {
    markLiarsEliminated(gameState, loserId);
    pushLiarsEvents(gameState, [
      liarsEvent("elimination", `${loserName} est elimine.`),
      liarsEvent("elimination", `${loserName} quitte la table.`),
    ]);
  }

  const withCards = playersWithCards(gameState);
  if (withCards.length <= 1) {
    gameState.reveal.pendingRedeal = true;
    gameState.turnText = "Redistribution apres la revelation.";
    pushLiarsEvents(gameState, liarsEvent("round", "Redistribution dans un instant."));
  } else {
    const preferredNextId = lied ? state.user.id : loserId;
    gameState.currentIndex = gameState.order.findIndex((id) => id === preferredNextId);
    if (
      gameState.currentIndex < 0 ||
      (gameState.lives[preferredNextId] || 0) <= 0 ||
      !(gameState.hands[preferredNextId]?.length)
    ) {
      gameState.currentIndex = nextLiarsIndex(gameState, Math.max(0, gameState.currentIndex));
    }
    const nextPlayerId = getCurrentLiarsPlayerId(gameState);
    gameState.turnText = `Tour de ${gameState.names[nextPlayerId] || "Joueur suivant"}.`;
    pushLiarsEvents(gameState, liarsEvent("turn", gameState.turnText));
  }
  gameState.version = Number(gameState.version || 0) + 1;
  state.liars.selected = [];
  await saveLiarsState(gameState);
}

function renderEnd() {
  $("#replay").disabled = !isRoomHost();
  $("#replay").textContent = isRoomHost() ? "Rejouer" : "En attente du chef";
  document.querySelector('[data-screen="end"]')?.classList.toggle("liars-end-screen", state.game === "liars");
  if (state.game === "liars") {
    const gameState = getLiarsState() || {};
    if ((gameState.winner || gameState.phase === "game_over") && gameState.gameId) {
      finalizeLiarsProfileStats(gameState);
    }
    if (gameState.gameId && state.liars.endProfileRefreshGameId !== gameState.gameId) {
      state.liars.endProfileRefreshGameId = gameState.gameId;
      refreshProfile().then(() => {
        if (state.screen === "end" && state.game === "liars") renderEnd();
      });
    }
    ensureLiarsStats(gameState);
    const liarsEndKey = JSON.stringify({
      gameId: gameState.gameId || "",
      winner: gameState.winner || "",
      phase: gameState.phase || "",
      order: gameState.order || [],
      eliminationOrder: gameState.eliminationOrder || [],
      stats: gameState.stats || {},
      coinRewards: gameState.coinRewards || {},
      badgeUnlocks: state.liars.badgeUnlocks || [],
      players: state.players.map((player) => [player.id, player.pseudo, player.nameSkin || ""]),
    });
    if (state.renderKeys.liarsEnd === liarsEndKey) return;
    state.renderKeys.liarsEnd = liarsEndKey;
    const names = {
      ...Object.fromEntries(state.players.map((player) => [player.id, player.pseudo])),
      ...(gameState.names || {}),
    };
    const nameSkins = {
      ...Object.fromEntries(state.players.map((player) => [player.id, player.nameSkin || null])),
      ...(gameState.nameSkins || {}),
    };
    const participantIds = [
      ...new Set([
        ...(gameState.order || []),
        ...(gameState.eliminationOrder || []),
        ...state.players.map((player) => player.id),
      ]),
    ];
    const eliminated = [...(gameState.eliminationOrder || [])].reverse();
    const remaining = participantIds
      .filter((id) => id !== gameState.winner && !eliminated.includes(id))
      .sort((a, b) => (gameState.lives?.[b] || 0) - (gameState.lives?.[a] || 0));
    const ranking = [
      ...(gameState.winner ? [gameState.winner] : []),
      ...eliminated,
      ...remaining,
    ].filter((id, index, list) => id && list.indexOf(id) === index);
    const myEarned = Number(gameState.coinRewards?.[state.user?.id] || 0);
    const rankBadge = (index) => ["🥇", "🥈", "🥉"][index] || `${index + 1}`;
    const badgeUnlocks = state.liars.badgeUnlocks || [];
    renderBadgeUnlockModal(badgeUnlocks, gameState.gameId || "");

    $("#ranking").innerHTML = `
      <li class="liars-coin-pop">
        <span class="coin-pop-icon"><img src="./Boutique/piece.png" alt="" /></span>
        <strong>Vous avez gagné ${myEarned} pièces</strong>
        <small>${myEarned > 0 ? "Elles ont été ajoutées à votre compte." : "Aucune pièce gagnée sur cette partie."}</small>
      </li>
      ${ranking.map((id, index) => {
      const stats = gameState.stats?.[id] || { accuseOk: 0, accuseWrong: 0 };
      const earned = Number(gameState.coinRewards?.[id] || 0);
      return `
        <li class="ranking-row liars-rank-card ${index === 0 ? "winner" : ""}">
          <span class="rank-place">${rankBadge(index)}</span>
          <strong>${renderName(names[id] || "Joueur", nameSkins[id])}</strong>
          <span class="rank-coins"><img src="./Boutique/piece.png" alt="" />+${earned}</span>
          <div class="rank-stats">
            <span>Accusations réussies: <b>${Number(stats.accuseOk || 0)}</b></span>
            <span>Accusations ratées: <b>${Number(stats.accuseWrong || 0)}</b></span>
          </div>
        </li>
      `;
    }).join("")}
    `;
    return;
  }

  if (state.game === "who" && getWhoState()) {
    const whoState = getWhoState();
    const players = whoPlayers(whoState);
    const totals = {};
    (whoState.voteHistory || []).forEach((round) => {
      Object.values(round.votes || {}).forEach((targetId) => {
        totals[targetId] = Number(totals[targetId] || 0) + 1;
      });
    });
    Object.values(whoState.votes || {}).forEach((targetId) => {
      totals[targetId] = Number(totals[targetId] || 0) + 1;
    });
    $("#ranking").innerHTML = players
      .map((player) => [player, totals[player.id] || 0])
      .sort((a, b) => b[1] - a[1])
      .map(([player, votes], index) => `
        <li class="ranking-row">
          <span class="rank-place">#${index + 1}</span>
          <strong>${renderName(player.pseudo, player.nameSkin)}</strong>
          <small>${votes} vote${votes > 1 ? "s" : ""} recu${votes > 1 ? "s" : ""}</small>
        </li>
      `).join("");
    return;
  }

  if (state.game === "true" && getTrueState()) {
    const trueState = getTrueState();
    const scores = trueState.scores || {};
    $("#ranking").innerHTML = truePlayers(trueState)
      .map((player) => [player, scores[player.id] || { score: 0, correct: 0, streak: 0 }])
      .sort((a, b) => b[1].score - a[1].score)
      .map(([player, score], index) => `
        <li class="ranking-row">
          <span class="rank-place">#${index + 1}</span>
          <strong>${renderName(player.pseudo, player.nameSkin)}</strong>
          <div class="rank-stats">
            <span>${score.score || 0} pts</span>
            <span>Bonnes reponses : ${score.correct || 0}</span>
            <span>Meilleure serie : x${score.streak || 0}</span>
          </div>
        </li>
      `).join("");
    return;
  }

  if (state.game === "photo" && getPhotoState()?.scores) {
    const photoState = getPhotoState();
    $("#ranking").innerHTML = Object.entries(photoState.scores)
      .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))
      .map(([id, score], index) => `
        <li class="ranking-row">
          <span class="rank-place">#${index + 1}</span>
          <strong>${renderName(photoState.names?.[id] || "Joueur", photoState.nameSkins?.[id] || state.players.find((player) => player.id === id)?.nameSkin)}</strong>
          <div class="rank-stats">
            <span>${score.score || 0} pts</span>
            <span>Bonnes reponses : ${score.correct || 0}</span>
            <span>Meilleure serie actuelle : x${score.streak || 0}</span>
          </div>
        </li>
      `).join("");
    return;
  }

  if (state.game === "blackjack" && getBlackjackState()) {
    const bj = getBlackjackState();
    const players = Array.isArray(bj.players) ? bj.players : state.players.map((player) => player.id);
    const names = { ...Object.fromEntries(state.players.map((player) => [player.id, player.pseudo])), ...(bj.names || {}) };
    const nameSkins = { ...Object.fromEntries(state.players.map((player) => [player.id, player.nameSkin || null])), ...(bj.nameSkins || {}) };
    $("#ranking").innerHTML = players.map((id, index) => {
      const result = bj.results?.[id] || {};
      const net = Number(result.net || 0);
      return `
        <li class="ranking-row">
          <span class="rank-place">#${index + 1}</span>
          <strong>${renderName(names[id] || "Joueur", nameSkins[id])}</strong>
          <div class="rank-stats">
            <span>${blackjackResultText(result) || "Main terminée"}</span>
            <span>${net >= 0 ? "+" : ""}${net} pièces</span>
          </div>
        </li>
      `;
    }).join("");
    return;
  }

  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  $("#ranking").innerHTML = sorted.map((player, index) => `
    <li class="ranking-row">
      <span class="rank-place">#${index + 1}</span>
      <strong>${renderName(player.pseudo, player.nameSkin)}</strong>
    </li>
  `).join("");
}

function getBlackjackState() {
  return state.settings.blackjack?.state || {};
}

function blackjackPhaseLabel(phase) {
  return {
    betting: "Mises",
    playing: "Tour joueur",
    dealer: "Tour croupier",
    settled: "Résultats",
    finished: "Fin",
  }[phase] || "Blackjack";
}

function blackjackCardFace(card, hidden = false) {
  if (hidden || card?.hidden) return blackjackBackFace();
  if (!card) return `<span class="dead21-card-face missing" data-label="?"><b>?</b></span>`;
  return dead21CardFace(card);
}

function blackjackBackFace() {
  return `
    <span class="dead21-card-face dead21-back blackjack-back">
      <img src="./Image%20dead/doscartesblackjack.png" alt="Dos carte Blackjack" onerror="this.onerror=null;this.src='./Image%20dead/doscartesdead21.png';" />
    </span>
  `;
}

function blackjackScoreText(hand = {}) {
  const score = Number(hand.score || 0);
  if (hand.status === "blackjack") return "Blackjack";
  if (hand.status === "bust") return `${score} - Bust`;
  return score ? `${score}` : "?";
}

function blackjackCardValue(card = {}) {
  const rank = String(card.rank || card.label || "").trim();
  if (rank === "As") return 11;
  if (["Roi", "Dame", "Valet"].includes(rank)) return 10;
  return Math.max(0, Number(card.value || rank || 0));
}

function blackjackCardsScore(cards = []) {
  let total = 0;
  let aces = 0;
  cards.forEach((card) => {
    const rank = String(card?.rank || card?.label || "").trim();
    if (rank === "As") aces += 1;
    total += blackjackCardValue(card);
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function blackjackDealerRevealView(cards = [], phase = "betting", startedAt = Date.now()) {
  const list = Array.isArray(cards) ? cards : [];
  const hiddenIndexes = new Set();
  if (!list.length) {
    return { cards: [], hiddenIndexes, visibleCards: [], scoreLabel: "?", done: true, step: "empty", nextDelay: 0 };
  }
  if (phase !== "settled") {
    const hideHoleCard = phase !== "dealer";
    const renderCards = list.slice(0, phase === "dealer" ? list.length : Math.min(2, list.length));
    if (hideHoleCard && renderCards.length > 1) hiddenIndexes.add(1);
    const visibleCards = renderCards.filter((_, index) => !hiddenIndexes.has(index));
    const visibleScore = blackjackCardsScore(visibleCards);
    return {
      cards: renderCards,
      hiddenIndexes,
      visibleCards,
      scoreLabel: phase === "dealer" ? blackjackScoreText({ cards: list, score: blackjackCardsScore(list) }) : (visibleScore ? String(visibleScore) : "?"),
      done: phase !== "dealer",
      step: `${phase}:${renderCards.length}:${hiddenIndexes.has(1) ? 0 : 1}`,
      nextDelay: 0,
    };
  }

  const elapsed = Math.max(0, Date.now() - Number(startedAt || Date.now()));
  const holeRevealMs = 900;
  const firstDrawMs = 1800;
  const drawIntervalMs = 1050;
  const resultDelayMs = 900;
  const holeRevealed = list.length < 2 || elapsed >= holeRevealMs;
  let renderCount = Math.min(2, list.length);
  if (list.length > 2 && elapsed >= firstDrawMs) {
    renderCount = Math.min(list.length, 2 + Math.floor((elapsed - firstDrawMs) / drawIntervalMs) + 1);
  }
  if (!holeRevealed && renderCount > 1) hiddenIndexes.add(1);
  const renderCards = list.slice(0, renderCount);
  const visibleCards = renderCards.filter((_, index) => !hiddenIndexes.has(index));
  const visibleScore = blackjackCardsScore(visibleCards);
  const lastRevealAt = list.length > 2 ? firstDrawMs + Math.max(0, list.length - 2) * drawIntervalMs : holeRevealMs;
  const allCardsRevealed = holeRevealed && renderCount >= list.length;
  const done = allCardsRevealed && elapsed >= lastRevealAt + resultDelayMs;
  let nextDelay = 0;
  if (!done) {
    if (!holeRevealed) nextDelay = holeRevealMs - elapsed;
    else if (renderCount < list.length) {
      const shownDraws = Math.max(0, renderCount - 2);
      const nextDrawAt = elapsed < firstDrawMs ? firstDrawMs : firstDrawMs + shownDraws * drawIntervalMs;
      nextDelay = nextDrawAt - elapsed;
    } else {
      nextDelay = lastRevealAt + resultDelayMs - elapsed;
    }
  }
  const finalScore = blackjackCardsScore(list);
  return {
    cards: renderCards,
    hiddenIndexes,
    visibleCards,
    scoreLabel: done ? blackjackScoreText({ score: finalScore, status: finalScore > 21 ? "bust" : "" }) : (visibleScore ? String(visibleScore) : "?"),
    done,
    step: `settled:${renderCount}:${holeRevealed ? 1 : 0}`,
    nextDelay: Math.max(90, Math.min(1200, nextDelay || 0)),
  };
}

function blackjackResultText(result = {}) {
  return {
    blackjack: "Blackjack",
    win: "Gagné",
    lose: "Perdu",
    push: "Égalité",
    bust: "Bust",
}[result.outcome] || result.outcome || "";
}

function blackjackLeaveRefundPreview() {
  if (state.game !== "blackjack" || !state.user?.id) return 0;
  const bj = getBlackjackState();
  const me = state.user.id;
  const bet = Number(bj.bets?.[me] || 0);
  if (!bet) return 0;
  if (bj.phase === "betting") return bet;
  if (bj.phase !== "playing") return 0;
  const hands = Array.isArray(bj.hands?.[me]) ? bj.hands[me] : [];
  if (hands.length !== 1) return 0;
  const hand = hands[0] || {};
  const cards = Array.isArray(hand.cards) ? hand.cards : [];
  const status = String(hand.status || "");
  return cards.length === 2 && ["playing", "blackjack", ""].includes(status) ? bet : 0;
}

function blackjackLeaveConfirmText() {
  const refund = blackjackLeaveRefundPreview();
  return `Tu veux vraiment quitter la partie ?${refund > 0 ? ` (vous êtes remboursé ${refund} pièces)` : ""}`;
}

function blackjackActionVisual(action, phase) {
  const startedAt = Number(state.blackjack.lastAction?.at || 0);
  const active = state.blackjack.lastAction?.action === action && Date.now() - startedAt < 1600;
  if (active) return true;
  return action === "dealer" && (phase === "dealer" || phase === "settled");
}

function blackjackPlayerOrder(players, me) {
  const list = Array.isArray(players) ? players.filter(Boolean) : [];
  if (!me || !list.includes(me)) return list;
  return [me, ...list.filter((id) => id !== me)];
}

function blackjackPlayerCardCount(bj = {}, playerId = "") {
  const hands = Array.isArray(bj.hands?.[playerId]) ? bj.hands[playerId] : [];
  return hands.reduce((sum, hand) => sum + (Array.isArray(hand?.cards) ? hand.cards.length : 0), 0);
}

function blackjackPlayerEffectiveBet(bj = {}, playerId = "") {
  const resultHands = bj.results?.[playerId]?.hands;
  if (Array.isArray(resultHands) && resultHands.length) {
    const total = resultHands.reduce((sum, hand) => sum + Number(hand?.bet || 0), 0);
    if (total > 0) return total;
  }
  const handBets = bj.handBets?.[playerId];
  if (handBets && typeof handBets === "object") {
    const values = Array.isArray(handBets) ? handBets : Object.values(handBets);
    const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
    if (total > 0) return total;
  }
  const baseBet = Number(bj.bets?.[playerId] || 0);
  if (
    playerId === state.user?.id &&
    baseBet > 0 &&
    Number(state.blackjack.pendingDoubleBet || 0) === baseBet &&
    Date.now() - Number(state.blackjack.pendingDoubleAt || 0) < 6000
  ) {
    return baseBet * 2;
  }
  return baseBet;
}

function normalizeBlackjackBet(value, fallback = 50) {
  const cleaned = String(value ?? "").replace(/[^\d]/g, "");
  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric) || numeric <= 0) return Math.max(50, Number(fallback || 50));
  return Math.max(50, Math.min(10000, Math.floor(numeric)));
}

function setBlackjackSelectedBet(value) {
  state.blackjack.selectedBet = normalizeBlackjackBet(value, state.blackjack.selectedBet || 50);
  return state.blackjack.selectedBet;
}

function blackjackHandClass(cards = [], isSelf = false) {
  const count = Array.isArray(cards) ? cards.length : 0;
  return [
    "blackjack-hand",
    `card-count-${Math.min(count, 6)}`,
    count >= 4 ? "card-grid" : "",
    isSelf ? "self-hand" : "",
  ].filter(Boolean).join(" ");
}

function renderBlackjackBalanceList(players = [], names = {}, bj = {}) {
  const playerMap = new Map(state.players.map((player) => [player.id, player]));
  const ordered = players.length ? players : state.players.map((player) => player.id);
  const coinImpactKey = `${bj.phase || ""}:${bj.roundId || bj.round_id || bj.gameId || ""}:${JSON.stringify(bj.bets || {})}:${JSON.stringify(bj.handBets || {})}:${JSON.stringify(bj.results || {})}`;
  const hasFreshCoins = coinImpactKey && state.blackjack.coinRefreshKey === coinImpactKey;
  return `
    <div class="blackjack-balance-list">
      ${ordered.map((id) => {
        const player = playerMap.get(id) || {};
        const baseCoins = id === state.user?.id ? Number(state.user?.coins || player.coins || 0) : Number(player.coins || 0);
        const visibleCoins = id === state.user?.id
          ? baseCoins
          : hasFreshCoins
          ? baseCoins
          : Math.max(0, baseCoins - Number(bj.bets?.[id] || 0) + Number(bj.results?.[id]?.payout || 0));
        return `
          <span class="blackjack-balance-pill">
            <b>${cleanText(names[id] || player.pseudo || "Joueur")}</b>
            <em>${visibleCoins}<img class="coin-icon" src="./Boutique/piece.png" alt="" /></em>
          </span>
        `;
      }).join("")}
    </div>
  `;
}

async function refreshBlackjackPlayerCoins({ rerender = false } = {}) {
  if (!db || !state.currentRoomId || state.blackjack.coinRefreshBusy) return;
  state.blackjack.coinRefreshBusy = true;
  try {
    const { data, error } = await db.rpc("get_room_player_coins_rpc", { p_room_id: state.currentRoomId });
    if (error || !Array.isArray(data)) return;
    const coinsById = Object.fromEntries(data.map((row) => [row.user_id || row.id, Number(row.coins || 0)]));
    state.players = state.players.map((player) => ({
      ...player,
      coins: Number(coinsById[player.id] ?? player.coins ?? 0),
    }));
    if (state.user?.id && coinsById[state.user.id] !== undefined) {
      state.user.coins = Number(coinsById[state.user.id] || 0);
    }
    if (rerender && state.screen === "blackjack-game") renderBlackjack();
  } finally {
    state.blackjack.coinRefreshBusy = false;
  }
}

function startBlackjackGame() {
  renderBlackjack();
}

async function runBlackjackRpc(name, args = {}) {
  if (!db || !state.currentRoomId || state.blackjack.busy) return false;
  state.blackjack.busy = true;
  try {
    const { data, error } = await db.rpc(name, { p_room_id: state.currentRoomId, ...args });
    if (error) {
      const message = String(error.message || "");
      if (isMissingRpc(error)) showMessage("Lance le SQL Blackjack dans Supabase avant de jouer.");
      else if (message.includes("not_enough_coins")) showMessage("Pas assez de pièces.");
      else if (message.includes("invalid_bet")) showMessage("Mise invalide.");
      else if (message.includes("wrong_turn")) showMessage("Ce n'est pas ton tour.");
      else showMessage("Action Blackjack impossible: " + (error.message || "erreur inconnue"));
      renderBlackjack();
      return false;
    }
    if (data?.profile) applyProfileToUser(data.profile);
    const returnedBlackjackState = data?.state || (data?.phase ? data : null);
    if (returnedBlackjackState) {
      state.settings.blackjack.state = returnedBlackjackState;
      if (name === "blackjack_double_rpc" && Number(state.blackjack.pendingDoubleBet || 0) > 0) {
        const id = state.user?.id;
        const resultHands = returnedBlackjackState.results?.[id]?.hands;
        const resultBet = Array.isArray(resultHands) ? resultHands.reduce((sum, hand) => sum + Number(hand?.bet || 0), 0) : 0;
        const rawHandBets = returnedBlackjackState.handBets?.[id];
        const handBetValues = rawHandBets && typeof rawHandBets === "object" ? (Array.isArray(rawHandBets) ? rawHandBets : Object.values(rawHandBets)) : [];
        const handBet = handBetValues.reduce((sum, value) => sum + Number(value || 0), 0);
        const baseBet = Number(returnedBlackjackState.bets?.[id] || 0);
        if (Math.max(resultBet, handBet, baseBet) > Number(state.blackjack.pendingDoubleBet || 0)) {
          state.blackjack.pendingDoubleBet = 0;
          state.blackjack.pendingDoubleAt = 0;
        }
      }
      if (state.screen === "blackjack-game") renderBlackjack();
    }
    await loadCurrentRoom();
    if (state.game === "blackjack") await refreshBlackjackPlayerCoins({ rerender: state.screen === "blackjack-game" });
    state.blackjack.busy = false;
    refreshProfile();
    return true;
  } finally {
    state.blackjack.busy = false;
  }
}

function renderBlackjack() {
  const table = $("#blackjack-table");
  const actions = $("#blackjack-actions");
  if (!table || !actions) return;
  const bj = getBlackjackState();
  const phase = bj.phase || "betting";
  if (state.blackjack.phase !== phase) {
    state.blackjack.phase = phase;
    state.blackjack.phaseStartedAt = Date.now();
    state.blackjack.dealerRevealCount = phase === "settled" ? 1 : 0;
    state.blackjack.dealerRevealStep = "";
    state.blackjack.handCounts = {};
    state.blackjack.remoteAction = null;
    state.blackjack.lastRemoteCardKey = "";
    if (phase === "betting") {
      state.blackjack.bustSeenAt = {};
      state.blackjack.coinRefreshKey = "";
    }
  }
  const rawPlayers = Array.isArray(bj.players) ? bj.players : state.players.map((player) => player.id);
  const names = { ...Object.fromEntries(state.players.map((player) => [player.id, player.pseudo])), ...(bj.names || {}) };
  const nameSkins = { ...Object.fromEntries(state.players.map((player) => [player.id, player.nameSkin || null])), ...(bj.nameSkins || {}) };
  const currentId = bj.currentPlayerId || "";
  const me = state.user?.id || "";
  const players = blackjackPlayerOrder(rawPlayers, me);
  [1, 2, 3, 4].forEach((count) => table.classList.toggle(`blackjack-count-${count}`, players.length === count));
  const previousHandCounts = state.blackjack.handCounts || {};
  const hadPreviousHandCounts = Object.keys(previousHandCounts).length > 0;
  const nextHandCounts = Object.fromEntries(players.map((id) => [id, blackjackPlayerCardCount(bj, id)]));
  if (phase === "playing" && hadPreviousHandCounts) {
    const remoteId = players.find((id) => id !== me && Number(nextHandCounts[id] || 0) > Number(previousHandCounts[id] || 0));
    const remoteKey = remoteId ? `${bj.gameId || ""}:${remoteId}:${previousHandCounts[remoteId] || 0}->${nextHandCounts[remoteId] || 0}` : "";
    if (remoteId && remoteKey !== state.blackjack.lastRemoteCardKey) {
      state.blackjack.lastRemoteCardKey = remoteKey;
      state.blackjack.remoteAction = { playerId: remoteId, at: Date.now(), consumed: false };
    }
  }
  state.blackjack.handCounts = nextHandCounts;
  const myBet = Number(bj.bets?.[me] || 0);
  const myResult = bj.results?.[me] || null;
  $("#blackjack-phase").textContent = "Pièces";
  $("#blackjack-title").innerHTML = renderBlackjackBalanceList(players, names, bj);
  $("#blackjack-bank").innerHTML = "";
  const dealer = bj.dealer || {};
  const dealerCards = Array.isArray(dealer.cards) ? dealer.cards : [];
  const dealerReveal = blackjackDealerRevealView(dealerCards, phase, state.blackjack.phaseStartedAt);
  const previousDealerStep = state.blackjack.dealerRevealStep || "";
  const dealerStepAnimation = phase === "settled" && previousDealerStep && previousDealerStep !== dealerReveal.step;
  state.blackjack.dealerRevealStep = dealerReveal.step;
  const dealerScoreLabel = phase === "settled" && dealerReveal.done ? blackjackScoreText(dealer) : dealerReveal.scoreLabel;
  const settledResultsVisible = phase !== "settled" || dealerReveal.done;
  const coinImpactKey = `${phase}:${bj.roundId || bj.round_id || bj.gameId || ""}:${JSON.stringify(bj.bets || {})}:${JSON.stringify(bj.handBets || {})}:${JSON.stringify(bj.results || {})}`;
  if (coinImpactKey && state.blackjack.coinRefreshKey !== coinImpactKey) {
    state.blackjack.coinRefreshKey = coinImpactKey;
    refreshBlackjackPlayerCoins({ rerender: true });
  }
  const myPayout = Number(myResult?.payout || 0);
  const myWinPayout = ["win", "blackjack"].includes(String(myResult?.outcome || "")) ? myPayout : 0;
  const actionAnimation = state.blackjack.lastAction && !state.blackjack.lastAction.consumed && Date.now() - Number(state.blackjack.lastAction.at || 0) < 2200
    ? state.blackjack.lastAction.action
    : "";
  const remoteAnimation = state.blackjack.remoteAction && !state.blackjack.remoteAction.consumed && Date.now() - Number(state.blackjack.remoteAction.at || 0) < 2200
    ? state.blackjack.remoteAction
    : null;
  const actionTargetSlot = remoteAnimation
    ? Math.max(1, players.indexOf(remoteAnimation.playerId) + 1)
    : 1;
  const tableClasses = [
    actionAnimation === "hit" ? "blackjack-anim-hit" : "",
    actionAnimation === "double" ? "blackjack-anim-double" : "",
    actionAnimation === "split" ? "blackjack-anim-split" : "",
    actionAnimation === "stand" ? "blackjack-anim-stand" : "",
    remoteAnimation ? "blackjack-anim-remote" : "",
    actionAnimation === "dealer" || dealerStepAnimation ? "blackjack-anim-dealer" : "",
  ].filter(Boolean).join(" ");
  table.innerHTML = `
    <section class="blackjack-dealer ${tableClasses}">
      <div class="blackjack-croupier">
        <img src="./Image%20dead/croupier.png" alt="Croupier" onerror="this.closest('.blackjack-croupier')?.classList.add('missing'); this.remove();" />
      </div>
      <span class="small-label">Croupier</span>
      <div class="${blackjackHandClass(dealerReveal.cards)}">
        ${dealerReveal.cards.length ? dealerReveal.cards.map((card, index) => blackjackCardFace(card, dealerReveal.hiddenIndexes.has(index))).join("") : blackjackBackFace()}
      </div>
      <strong>${dealerScoreLabel}</strong>
    </section>
    <section class="blackjack-players players-${Math.max(1, players.length)}">
      ${players.map((id, index) => {
        const playerHands = Array.isArray(bj.hands?.[id]) ? bj.hands[id] : [];
        const result = bj.results?.[id] || {};
        const active = id === currentId;
        const bet = blackjackPlayerEffectiveBet(bj, id);
        const activeHand = playerHands[Math.max(0, Number(bj.activeHand || 0))] || playerHands[0] || {};
        const resultVisible = result.outcome && settledResultsVisible;
        const scoreLabel = playerHands.length > 1
          ? playerHands.map((hand) => blackjackScoreText(hand)).join(" / ")
          : blackjackScoreText(activeHand);
        const roundKey = bj.roundId || bj.round_id || bj.gameId || "";
        let bustRerenderDelay = 0;
        const handRows = playerHands.length ? playerHands.map((hand, handIndex) => {
          const cards = Array.isArray(hand.cards) ? hand.cards : [];
          const bustKey = `${roundKey}:${id}:${handIndex}:${cards.length}`;
          const isBust = hand.status === "bust";
          if (isBust && !state.blackjack.bustSeenAt[bustKey]) state.blackjack.bustSeenAt[bustKey] = Date.now();
          const bustAge = isBust ? Date.now() - Number(state.blackjack.bustSeenAt[bustKey] || Date.now()) : 0;
          const hideBustCards = isBust && bustAge >= 3000;
          if (isBust && !hideBustCards) {
            const remaining = Math.max(80, 3050 - bustAge);
            bustRerenderDelay = bustRerenderDelay ? Math.min(bustRerenderDelay, remaining) : remaining;
          }
          const visibleCards = hideBustCards ? [] : cards;
          return `
            <div class="blackjack-hand-box ${Number(bj.activeHand || 0) === handIndex && active ? "active" : ""} ${hideBustCards ? "bust-cleared" : ""}">
              <div class="${blackjackHandClass(visibleCards, id === me)}">${visibleCards.map((card) => blackjackCardFace(card)).join("")}</div>
            </div>
          `;
        }).join("") : `<div class="${blackjackHandClass([{}, {}], id === me)}">${blackjackBackFace()}${blackjackBackFace()}</div>`;
        if (bustRerenderDelay) {
          clearTimeout(state.blackjack.bustTimer);
          state.blackjack.bustTimer = setTimeout(renderBlackjack, bustRerenderDelay);
        }
        return `
          <article class="blackjack-player player-slot-${index + 1} ${id === me ? "self" : ""} ${active ? "active" : ""} ${resultVisible ? `result-${result.outcome}` : ""}" data-player-id="${id}">
            <div class="blackjack-player-meta">
              <button class="blackjack-player-name" type="button" data-blackjack-profile="${id}">${renderName(names[id] || "Joueur", nameSkins[id])}</button>
              <small>${bet ? `Mise ${bet}` : "En attente de mise"} <img class="coin-icon" src="./Boutique/piece.png" alt="" /></small>
              <strong class="blackjack-score">Score ${scoreLabel}</strong>
            </div>
            <div class="blackjack-hand-list">
              ${handRows}
            </div>
          </article>
        `;
      }).join("")}
    </section>
    ${settledResultsVisible && myWinPayout > 0 ? `
      <div class="blackjack-win-splash">
        <small>${blackjackResultText(myResult) || "Gagné"}</small>
        <strong>Vous avez gagné ${myWinPayout}<img class="coin-icon" src="./Boutique/piece.png" alt="" /></strong>
      </div>
    ` : ""}
    ${tableClasses ? `<i class="blackjack-action-card target-slot-${actionTargetSlot}" aria-hidden="true">${blackjackBackFace()}</i>` : ""}
  `;
  if (phase === "settled" && !dealerReveal.done) {
    clearTimeout(state.blackjack.tickTimer);
    state.blackjack.tickTimer = setTimeout(renderBlackjack, dealerReveal.nextDelay);
  }
  if (state.blackjack.lastAction && actionAnimation && phase !== "settled") {
    state.blackjack.lastAction.consumed = true;
    clearTimeout(state.blackjack.tickTimer);
    state.blackjack.tickTimer = setTimeout(renderBlackjack, 1300);
  }
  if (remoteAnimation && phase !== "settled") {
    state.blackjack.remoteAction.consumed = true;
    clearTimeout(state.blackjack.tickTimer);
    state.blackjack.tickTimer = setTimeout(renderBlackjack, 1300);
  }

  if (phase === "betting") {
    const canBet = !myBet;
    actions.innerHTML = `
      <div class="blackjack-bet-panel">
        <button type="button" data-bj-bet-step="-100">-100</button>
        <label class="blackjack-bet-input-wrap" aria-label="Mise Blackjack">
          <input type="number" inputmode="numeric" pattern="[0-9]*" min="50" max="10000" step="50" data-bj-bet-input value="${Number(state.blackjack.selectedBet || 50)}" ${canBet ? "" : "disabled"} />
          <img class="coin-icon" src="./Boutique/piece.png" alt="" />
        </label>
        <button type="button" data-bj-bet-step="100">+100</button>
        <button class="primary" type="button" data-bj-action="bet" ${canBet ? "" : "disabled"}>${canBet ? "Miser" : "Mise validée"}</button>
      </div>
    `;
    return;
  }

  if (phase === "playing" && currentId === me) {
    const allowed = bj.availableActions || {};
    const busy = Date.now() < Number(state.blackjack.actionLockUntil || 0);
    const myHands = Array.isArray(bj.hands?.[me]) ? bj.hands[me] : [];
    const canSplitOnce = Boolean(allowed.split) && myHands.length <= 1;
    actions.innerHTML = `
      <button type="button" data-bj-action="hit" ${busy || allowed.hit === false ? "disabled" : ""}>Tirer</button>
      <button type="button" data-bj-action="stand" ${busy || allowed.stand === false ? "disabled" : ""}>Rester</button>
      <button type="button" data-bj-action="double" ${!busy && allowed.double ? "" : "disabled"}>Doubler</button>
      <button type="button" data-bj-action="split" ${!busy && canSplitOnce ? "" : "disabled"}>Séparer</button>
    `;
    return;
  }

  if (phase === "settled") {
    actions.innerHTML = `
      ${settledResultsVisible ? "" : `<strong>Le croupier joue...</strong>`}
      <button class="primary blackjack-replay-btn" type="button" data-bj-action="new-round" ${settledResultsVisible && isRoomHost() ? "" : "disabled"}>${isRoomHost() ? "Rejouer" : "En attente du chef"}</button>
    `;
    return;
  }

  actions.innerHTML = `<div class="blackjack-waiting">En attente...</div>`;
}

async function replayRoomToLobby() {
  if (!state.currentRoomId) {
    go("games");
    return;
  }
  if (!isRoomHost()) {
    showMessage("Seul le chef peut relancer le lobby.");
    return;
  }

  clearTimeout(state.liars.endTimer);
  clearTimeout(state.liars.revealTimer);
  clearTimeout(state.liars.rouletteLogTimer);
  state.liars.selected = [];
  state.liars.state = null;
  state.settings = normalizeSettings({
    ...state.settings,
    photo: {
      ...state.settings.photo,
      state: null,
    },
    who: {
      ...state.settings.who,
      state: null,
    },
    true: {
      ...state.settings.true,
      state: null,
    },
    blackjack: {
      ...state.settings.blackjack,
      state: null,
    },
    liars: {
      ...state.settings.liars,
      lastOrder: state.settings.liars.state?.order || state.settings.liars.lastOrder || [],
      state: null,
    },
  });

  const { error } = await db
    .from("rooms")
    .update({ status: "lobby", settings: state.settings })
    .eq("id", state.currentRoomId)
    .eq("host_id", state.user.id);

  if (error) {
    showMessage("Impossible de relancer le lobby: " + (error.message || "erreur inconnue"));
    return;
  }

  state.roomStatus = "lobby";
  await loadRoomPlayers();
  go("lobby");
}

function openJoinModal() {
  const modal = $("#join-modal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  $("#room-code").value = "";
  setTimeout(() => $("#room-code").focus(), 60);
}

function closeJoinModal() {
  const modal = $("#join-modal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

async function updatePseudoFromHome() {
  if (!requireSignedIn()) return;
  const nextPseudo = cleanText($("#home-pseudo").value, "").slice(0, 18).trim();
  if (!nextPseudo) {
    showMessage("Entre un pseudo.");
    renderHome();
    return;
  }
  if (!(await ensureSupabaseClient())) {
    authUnavailable();
    return;
  }

  const profile = await saveProfile({ id: state.user.id, email: state.user.email }, nextPseudo);
  if (!profile) {
    showMessage("Impossible de changer le pseudo.");
    renderHome();
    return;
  }

  applyProfileToUser(profile);
  if (state.currentRoomId) {
    await syncCurrentPlayerProfile();
    await loadRoomPlayers();
  } else {
    resetCurrentPlayer();
  }
  renderAccountLabel();
  renderHome();
  showMessage("Pseudo mis a jour.");
}

document.addEventListener("input", (event) => {
  const blackjackBetInput = event.target.closest?.("[data-bj-bet-input]");
  if (!blackjackBetInput) return;
  const cleaned = blackjackBetInput.value.replace(/[^\d]/g, "");
  if (blackjackBetInput.value !== cleaned) blackjackBetInput.value = cleaned;
  if (cleaned) state.blackjack.selectedBet = normalizeBlackjackBet(cleaned, state.blackjack.selectedBet || 50);
});

document.addEventListener("change", (event) => {
  const blackjackBetInput = event.target.closest?.("[data-bj-bet-input]");
  if (!blackjackBetInput) return;
  blackjackBetInput.value = setBlackjackSelectedBet(blackjackBetInput.value);
});

document.addEventListener("click", (event) => {
  if (state.currentRoomId) resetRoomIdleTimer();
  if (event.target?.id === "rules-modal" || event.target.closest(".rules-close")) {
    closeModeRules();
    return;
  }

  if (event.target.closest("[data-close-transient]")) {
    closeTransientModals();
    return;
  }

  const shopButton = event.target.closest("[data-open-shop]");
  if (shopButton) {
    openShop();
    return;
  }

  if (event.target.closest("[data-open-lucky-wheel]")) {
    openLuckyWheel();
    return;
  }


  if (event.target.closest("[data-open-profile]")) {
    openLiarsProfile(state.user?.id);
    return;
  }

  const inGameSeatProfile = event.target.closest(".seat[data-player-id] strong");
  if (inGameSeatProfile && ["liars-game", "blackjack-game"].includes(state.screen)) {
    const seat = inGameSeatProfile.closest("[data-player-id]");
    openLiarsProfile(seat?.dataset.playerId);
    return;
  }

  const blackjackProfile = event.target.closest("[data-blackjack-profile]");
  if (blackjackProfile) {
    openLiarsProfile(blackjackProfile.dataset.blackjackProfile);
    return;
  }

  const blackjackBetStep = event.target.closest("[data-bj-bet-step]");
  if (blackjackBetStep) {
    setBlackjackSelectedBet(Number(state.blackjack.selectedBet || 50) + Number(blackjackBetStep.dataset.bjBetStep || 0));
    renderBlackjack();
    return;
  }

  const blackjackAction = event.target.closest("[data-bj-action]");
  if (blackjackAction) {
    const action = blackjackAction.dataset.bjAction;
    state.blackjack.lastAction = { action, at: Date.now() };
    state.blackjack.actionLockUntil = Date.now() + 650;
    if (action === "bet") {
      const betInput = $("[data-bj-bet-input]");
      const amount = setBlackjackSelectedBet(betInput?.value || state.blackjack.selectedBet);
      if (betInput) betInput.value = amount;
      runBlackjackRpc("blackjack_place_bet_rpc", { p_amount: amount });
    }
    if (action === "hit") runBlackjackRpc("blackjack_hit_rpc");
    if (action === "stand") runBlackjackRpc("blackjack_stand_rpc");
    if (action === "double") {
      state.blackjack.pendingDoubleBet = blackjackPlayerEffectiveBet(getBlackjackState(), state.user?.id);
      state.blackjack.pendingDoubleAt = Date.now();
      runBlackjackRpc("blackjack_double_rpc");
    }
    if (action === "split") runBlackjackRpc("blackjack_split_rpc");
    if (action === "new-round") {
      state.blackjack.pendingDoubleBet = 0;
      state.blackjack.pendingDoubleAt = 0;
      runBlackjackRpc("start_blackjack_room_rpc");
    }
    return;
  }

  const goButton = event.target.closest("[data-go]");
  if (goButton) go(goButton.dataset.go);

  const pick = event.target.closest("[data-pick-game]");
  if (pick) {
    if (!requireSignedIn()) return;
    if (pick.dataset.pickGame === "liars") {
      openLiarsModeModal();
      return;
    }
    createRoomInDatabase(pick.dataset.pickGame)
      .then((room) => enterRoom(room))
      .catch((error) => showMessage("Impossible de creer la partie: " + (error.message || "erreur inconnue")));
  }

  if (event.target.closest("#claim-june-gift")) {
    claimJuneGift();
    return;
  }

  const liarsMode = event.target.closest("[data-create-liars-mode]");
  if (liarsMode) {
    createLiarsRoomWithMode(liarsMode.dataset.createLiarsMode);
  }

  if (event.target.closest("[data-dead21-show-deck]")) {
    showDead21DeckReview();
    return;
  }

  if (event.target.closest("[data-dead21-close-deck]")) {
    closeDead21DeckReview();
    return;
  }

  const joinGame = event.target.closest("[data-join-game]");
  if (joinGame) {
    state.joinGame = joinGame.dataset.joinGame;
    $$(".mode-chip").forEach((button) => {
      button.classList.toggle("active", button.dataset.joinGame === state.joinGame);
    });
  }

  const voteButton = event.target.closest("[data-vote]");
  if (voteButton) vote(voteButton.dataset.vote);

  const whoVoteButton = event.target.closest("[data-who-vote]");
  if (whoVoteButton) voteWho(whoVoteButton.dataset.whoVote);

  const trueOwner = event.target.closest("[data-true-owner]");
  if (trueOwner) {
    $("[data-true-owner].active")?.classList.remove("active");
    trueOwner.classList.add("active");
  }

  const trueTruth = event.target.closest("[data-true-truth]");
  if (trueTruth) {
    $("[data-true-truth].active")?.classList.remove("active");
    trueTruth.classList.add("active");
  }

  if (event.target.id === "true-submit-vote") {
    const owner = $("[data-true-owner].active")?.dataset.trueOwner;
    const truthValue = $("[data-true-truth].active")?.dataset.trueTruth;
    if (!owner || !truthValue) {
      showMessage("Choisis un joueur et Vrai ou Faux.");
      return;
    }
    submitTrueVote(owner, truthValue === "true").then(() => maybeRevealTrueWhenComplete());
  }

  if (event.target.id === "true-next") {
    nextTrueStep();
  }

  const deadCard = event.target.closest("[data-dead21-card]");
  if (deadCard && deadCard.dataset.dead21Card) {
    if (state.liars.deadSelectedCardId === deadCard.dataset.dead21Card) {
      state.liars.deadSelectedCardId = "";
      state.liars.deadSelectedAnnounce = null;
      renderDead21AnnouncePopover();
      refreshDead21SelectionUi();
      return;
    }
    state.liars.deadSelectedCardId = deadCard.dataset.dead21Card;
    const selected = dead21PrivateCards().find((card) => card.id === state.liars.deadSelectedCardId);
    const options = dead21AnnouncementOptions(selected);
    const realValue = Number(selected?.value);
    state.liars.deadSelectedAnnounce = options.includes(realValue) ? realValue : options[0] ?? null;
    renderDead21AnnouncePopover();
    refreshDead21SelectionUi();
    return;
  }

  const deadAnnounce = event.target.closest("[data-dead21-announce]");
  if (deadAnnounce) {
    state.liars.deadSelectedAnnounce = Number(deadAnnounce.dataset.dead21Announce);
    $$(".dead21-announce-popover").forEach((element) => element.remove());
    refreshDead21SelectionUi();
    return;
  }

  const card = event.target.closest("[data-card]");
  if (card) toggleCard(Number(card.dataset.card));

  if (event.target.id === "join-modal") closeJoinModal();
  if (event.target.id === "liars-mode-modal") closeLiarsModeModal();
});

$("#auth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  authWithPassword(state.authMode);
});

$$("[data-auth-mode]").forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
});
$("#toggle-password").addEventListener("click", () => {
  const input = $("#password");
  const visible = input.type === "text";
  input.type = visible ? "password" : "text";
  $("#toggle-password").textContent = visible ? "Voir" : "Cacher";
});
$("#logout").addEventListener("click", () => {
  if (state.roomChannel) db?.removeChannel(state.roomChannel);
  if (state.roomStateChannel) db?.removeChannel(state.roomStateChannel);
  if (state.currentRoomId) db?.rpc("leave_room_rpc", { p_room_id: state.currentRoomId });
  clearRoomSession();
  stopLobbyRefresh();
  stopPresenceHeartbeat();
  db?.auth.signOut();
  state.user = null;
  state.currentRoomId = "";
  state.roomCode = "";
  state.roomHostId = "";
  state.roomStatus = "lobby";
  state.roomChannel = null;
  state.roomStateChannel = null;
  state.roomStateLive = false;
  go("auth");
});
$("#create-room").addEventListener("click", createRoom);
$("#play-join").addEventListener("click", openJoinModal);
$("#close-join-modal").addEventListener("click", closeJoinModal);
$("#close-liars-mode-modal").addEventListener("click", closeLiarsModeModal);
$("#open-shop")?.setAttribute("data-open-shop", "");
$("#open-lucky-wheel")?.setAttribute("data-open-lucky-wheel", "");
$("#open-profile")?.setAttribute("data-open-profile", "");
$("#close-shop")?.addEventListener("click", closeShop);
$("#close-lucky-wheel")?.addEventListener("click", closeLuckyWheel);
$("#hand-privacy-toggle")?.addEventListener("click", () => {
  state.liars.handHidden = !state.liars.handHidden;
  state.liars.selected = [];
  state.liars.deadSelectedCardId = "";
  state.liars.deadSelectedAnnounce = null;
  $$(".dead21-announce-popover").forEach((element) => element.remove());
  renderLiars();
});
$("#shop-modal")?.addEventListener("click", (event) => {
  if (Date.now() < Number(state.shop.blockClicksUntil || 0)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (event.target?.id === "shop-modal") {
    closeShop();
    return;
  }
  const actionButton = event.target.closest("[data-shop-action]");
  if (actionButton) {
    const card = actionButton.closest("[data-shop-kind]");
    if (card) handleShopCard(card, actionButton.dataset.shopAction);
    return;
  }
  const previewButton = event.target.closest("[data-shop-preview]");
  if (previewButton) {
    if (Date.now() - Number(state.shop.previewClosedAt || 0) < 450) return;
    const card = previewButton.closest("[data-shop-kind]");
    if (card) openShopItemPreview(card);
  }
});
$("#lucky-wheel-modal")?.addEventListener("click", (event) => {
  if (event.target?.id === "lucky-wheel-modal") {
    closeLuckyWheel();
    return;
  }
  if (event.target?.id === "lucky-wheel-spin") {
    spinLuckyWheel();
  }
});
document.addEventListener("pointerdown", (event) => {
  if (state.currentRoomId) noteRoomActivity();
  const previewModal = $("#shop-preview-modal");
  const announcePopover = $(".dead21-announce-popover");
  if (announcePopover && !event.target.closest(".dead21-announce-popover") && !event.target.closest("[data-dead21-card]")) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (!previewModal) return;
  if (event.target?.id === "shop-preview-modal" || event.target.closest(".shop-preview-close")) {
    event.preventDefault();
    event.stopPropagation();
    state.shop.blockClicksUntil = Date.now() + 650;
    closeShopWeaponPreview();
  }
}, true);
document.addEventListener("click", (event) => {
  if (Date.now() < Number(state.shop.blockClicksUntil || 0)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const announcePopover = $(".dead21-announce-popover");
  if (announcePopover && !event.target.closest(".dead21-announce-popover") && !event.target.closest("[data-dead21-card]")) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);
["keydown", "touchstart", "mousemove"].forEach((eventName) => {
  document.addEventListener(eventName, () => {
    if (state.currentRoomId) noteRoomActivity();
  }, { passive: true });
});
$("#pseudo-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updatePseudoFromHome();
});
$("#join-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#room-code").value = cleanRoomCode($("#room-code").value);
  const code = $("#room-code").value;
  closeJoinModal();
  joinRoom(code);
});
$("#share-room").addEventListener("click", async () => {
  const code = state.roomCode || "TABLE1";
  await navigator.clipboard?.writeText(code);
  $("#room-label").textContent = code;
});
$("#leave-room").addEventListener("click", () => leaveCurrentRoom());
$("#leave-room-top").addEventListener("click", () => leaveCurrentRoom());
$("#who-skip").addEventListener("click", () => {
  showMessage("Attends que tout le monde vote.");
});
$("#who-next").addEventListener("click", () => nextWhoQuestion());
$("#leave-who-game").addEventListener("click", () => {
  if (window.confirm("Tu veux vraiment quitter la partie ?")) {
    leaveCurrentRoom();
  }
});
$("#leave-true-game").addEventListener("click", () => {
  if (window.confirm("Tu veux vraiment quitter la partie ?")) {
    leaveCurrentRoom();
  }
});
$("#leave-liars-game").addEventListener("click", () => {
  if (window.confirm("Tu veux vraiment quitter la partie ?")) {
    leaveCurrentRoom();
  }
});
$("#leave-blackjack-game")?.addEventListener("click", () => {
  if (window.confirm(blackjackLeaveConfirmText())) {
    leaveCurrentRoom();
  }
});
$("#start-game").addEventListener("click", () => startRoomForEveryone());
$("#shuffle-media")?.addEventListener("click", () => {
  state.photo.files = pickRandomPhotoFiles(state.photo.pool.length ? state.photo.pool : state.photo.files);
  renderPhotoRoulette();
});
$("#next-photo")?.addEventListener("click", () => {
  const photoState = getPhotoState();
  if (photoState?.status === "media_selection") {
    validatePhotoFrame();
    return;
  }
  nextPhoto();
});
$("#play-cards").addEventListener("click", () => {
  if (isLiarsDead21Mode()) {
    playDead21Card();
    return;
  }
  playCards();
});
$("#accuse").addEventListener("click", () => {
  if (isLiarsDead21Mode()) {
    dead21Accuse();
    return;
  }
  accuse();
});
$("#dead21-draw")?.addEventListener("click", dead21Draw);
$("#dead21-stay")?.addEventListener("click", dead21Stay);
$("#replay").addEventListener("click", replayRoomToLobby);
$("#end-quit").addEventListener("click", leaveCurrentRoom);
$("#presence-yes")?.addEventListener("click", confirmPresenceStillHere);
$("#presence-no")?.addEventListener("click", () => {
  closePresencePrompt();
  leaveCurrentRoom();
});
$("#close-profile")?.addEventListener("click", closeLiarsProfile);
$("#profile-modal")?.addEventListener("click", (event) => {
  if (event.target?.id === "profile-modal") closeLiarsProfile();
});
$("#afk-wait")?.addEventListener("click", () => respondAfkPrompt("wait"));
$("#afk-extend")?.addEventListener("click", () => respondAfkPrompt("extend"));
$("#afk-kick")?.addEventListener("click", () => respondAfkPrompt("kick"));

window.addEventListener("focus", () => {
  if (state.currentRoomId && ["lobby", "liars-game", "blackjack-game", "who-game", "true-game", "photo-game", "end"].includes(state.screen)) {
    loadCurrentRoom();
    loadRoomPlayers();
  }
  handlePresenceReturn();
});

window.addEventListener("pageshow", handlePresenceReturn);
window.addEventListener("pagehide", markPresenceAway);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    markPresenceAway();
  } else {
    handlePresenceReturn();
  }
});

if (ensureFreshAppBuild()) setAuthMode("login");

async function initAuth() {
  if (!(await ensureSupabaseClient())) {
    authUnavailable();
    go("auth");
    return;
  }

  const { data, error } = await db.auth.getSession();
  if (error || !data.session?.user) {
    go("auth");
    return;
  }

  const user = data.session.user;
  const profile = await loadProfile(user);
  state.user = {
    ...normalizeProfile(profile || {}),
    id: user.id,
    pseudo: cleanText(profile?.pseudo || user.user_metadata?.pseudo, user.email?.split("@")[0]),
    email: user.email,
  };
  resetCurrentPlayer();
  cleanupOldRoomsIfNeeded();
  if (await restoreRoomSession()) return;
  go("home");
}

if (ensureFreshAppBuild()) initAuth();



