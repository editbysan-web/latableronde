/* Hear Me Out: isolated UI, existing authentication/room lifecycle injected by app.js. */
(() => {
  'use strict';
  let bridge, room = '', channel, snapshot, busy = false, loading = false, again = false;
  let renderKey = '', gallery = [], generation = 0, memberKey = '', galleryAbort, message = '', galleryMessage = '';
  const images = new Map();
  let clockTimer, deadlineAt = 0, expiryAttempt = 0, sceneKey = '', previewUrl = '';
  const cakeSeen = new Set();
  const $ = (s) => document.querySelector(s);
  const escape = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ctx = () => bridge.context();
  const choiceTitle = (choice) => !choice.title?.trim() || choice.title.trim() === 'Mon choix'
    ? `Voici ce que ${choice.pseudo || 'ce joueur'} a trouvé` : choice.title;
  const posterCaption = (choice) => `<figcaption><span class="hmo-pick-theme">${escape(choice.theme)}</span><span>${escape(choiceTitle(choice))}</span><small>${escape(choice.pseudo)}</small></figcaption>`;
  const button = (action, label, disabled = false, extra = '') => `<button type="button" data-hmo="${action}" ${disabled ? 'disabled' : ''} ${extra}>${label}</button>`;
  const notice = (value) => { message = value; const el = $('#hmo-notice'); if (el) el.textContent = value; else if (value) bridge.message(value); };
  const messages = {selection_locked:'La sélection est verrouillée.',selection_full:'Ta sélection est complète.',selection_incomplete:'Complète ta sélection avant de te déclarer prêt.',everyone_must_be_ready:'Il faut au moins deux joueurs, tous prêts.',not_your_turn:'Ce n’est pas ton tour.',cannot_vote:'Tu ne peux pas voter sur ce choix.',stale_turn:'Ce tour est terminé. La partie a été actualisée.',maximum_8_players:'Hear Me Out accueille de 2 à 8 joueurs.',not_member:'Tu ne fais plus partie de ce salon.'};
  function errorText(error) {
    if (/minimum_two_players/.test(error?.message || '')) return 'Il faut au moins deux joueurs pour lancer la partie.';
    if (/stale_round|selection_locked/.test(error?.message || '') && snapshot?.flowVersion===2) return 'Le temps est écoulé. La sélection de cette manche est fermée.';
    if (/Failed to fetch|AbortError|TimeoutError|aborted/i.test(error?.message || '')) return 'Connexion interrompue. Réessaie ; les choix déjà enregistrés sont conservés.';
    const key = Object.keys(messages).find(k => String(error?.message).includes(k));
    if (key) return messages[key];
    if (error?.code === '23505') return 'Ce choix ou ce vote a déjà été enregistré.';
    if (error?.code === 'PGRST202') return 'Hear Me Out n’est pas encore installé sur ce serveur.';
    return error?.message || 'Action impossible. Réessaie dans un instant.';
  }
  function reset() {
    clearInterval(clockTimer); clockTimer = null; deadlineAt = 0; expiryAttempt = 0; sceneKey = ''; cakeSeen.clear();
    if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = '';
    $('[data-screen="lobby"]')?.classList.remove('hmo-lobby-screen');
    generation++; if (channel) ctx().db?.removeChannel(channel);
    channel = null; room = ''; snapshot = null; renderKey = ''; memberKey = ''; loading = false; again = false; message = '';
    galleryAbort?.abort(); gallery = []; galleryMessage = '';
    for (const item of images.values()) item.then(url => URL.revokeObjectURL(url)).catch(() => {});
    images.clear();
  }
  async function rpc(action = 'get', payload = {}) {
    const target = room, token = generation;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),15000);
    let result;
    try { result = await ctx().db.rpc('hmo_rpc', {p_room_id: target,p_action: action,p_payload: payload}).abortSignal(controller.signal); }
    finally { clearTimeout(timeout); }
    const {data, error} = result;
    if (error) throw error;
    if (room !== target || token !== generation) return;
    if (!snapshot || data.revision >= snapshot.revision) {
      snapshot = data;
      if (data.flowVersion === 2) {
        deadlineAt = performance.now() + Math.max(0, Date.parse(data.deadline) - Date.parse(data.serverNow));
        if (!clockTimer) clockTimer = setInterval(tickClock,250);
      }
    }
    render();
    return data;
  }
  async function refresh() {
    if (!room) return;
    if (loading) { again = true; return; }
    const token = generation; loading = true;
    try { await rpc(); }
    catch (e) { notice(errorText(e)); }
    finally { if (token === generation) { loading = false; if (again) { again = false; refresh(); } } }
  }
  function sync() {
    const s = ctx();
    if (s.game !== 'hear' || !s.roomId || !s.userId) { if (room) reset(); return; }
    if (room !== s.roomId) {
      reset(); room = s.roomId;
      channel = s.db.channel(`hmo:${room}`).on('postgres_changes', {event:'UPDATE',schema:'public',table:'hmo_events',filter:`room_id=eq.${room}`}, refresh)
        .subscribe(status => {
          if (status === 'SUBSCRIBED') { notice(''); refresh(); }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') notice('Connexion interrompue. Reconnexion en cours…');
        });
      refresh();
    }
    const members = s.players.map(p => p.id).sort().join(',');
    if (members !== memberKey) { memberKey = members; refresh(); }
    render();
  }
  async function act(action, payload = {}) {
    if (busy) return;
    busy = true; message = ''; renderKey = ''; render();
    try { await rpc(action,payload); }
    catch (e) { notice(errorText(e)); if (snapshot?.flowVersion===2) refresh(); }
    finally { busy = false; renderKey = ''; render(); }
  }
  function photo(choice, full = false) {
    return `<img data-hmo-path="${escape(full ? choice.path : choice.thumb)}" alt="${escape(choiceTitle(choice))}" loading="lazy" width="240" height="240">`;
  }
  function credit(choice) {
    let url; try { url = new URL(choice.source); } catch { /* personal import */ }
    const link = url?.protocol === 'https:' && url.hostname === 'commons.wikimedia.org';
    return choice.credit ? `<small class="hmo-credit">${escape(choice.credit)}${link ? ` · <a href="${escape(url.href)}" target="_blank" rel="noopener noreferrer">Source</a>` : ''}</small>` : '';
  }
  function mount() {
    const s = ctx();
    if (s.screen === 'lobby') {
      $('#lobby-title').textContent = 'Hear Me Out';
      $('#room-label').textContent = s.code;
      $('#lobby-afk-setting')?.classList.add('hidden');
      $('.lobby-shop-open')?.classList.add('hidden');
      const lobby = $('[data-screen="lobby"]');
      lobby.classList.remove('who-lobby-screen','true-lobby-screen','blackjack-lobby-screen');
      if (!$('#hmo-lobby')) $('#settings-content').innerHTML = '<div id="hmo-lobby" class="hmo"></div>';
      return $('#hmo-lobby');
    }
    return s.screen === 'hear-game' ? $('#hmo-game') : null;
  }
  function render() {
    if (!room) return;
    if (snapshot?.flowVersion === 2) { renderRounds(); return; }
    const s = ctx();
    if (snapshot && !['setup','preparing'].includes(snapshot.phase) && s.screen === 'lobby') { bridge.go('hear-game'); return; }
    const root = mount(); if (!root) return;
    if (!snapshot) { root.innerHTML = '<p role="status" id="hmo-notice">Chargement de Hear Me Out…</p>'; $('#start-game').disabled = true; return; }
    const g = snapshot, key = JSON.stringify([g,s.hostId,s.screen,busy]);
    if (key === renderKey && root.dataset.mounted === 'true') return;
    renderKey = key; root.dataset.mounted = 'true';
    // Realtime updates must not discard a file being picked or text being typed.
    const sourceKey = `${room}:${g.myTheme}:${g.mine.map(c => c.id).join(',')}`;
    const preservedSources = root.dataset.sourceKey === sourceKey ? root.querySelector('.hmo-sources') : null;
    const config = root.querySelector('#hmo-config');
    const configValues = config ? Object.fromEntries(new FormData(config)) : null;
    root.dataset.sourceKey = sourceKey;
    const host = s.hostId === s.userId, mine = g.author === s.userId;
    if (s.screen === 'lobby') {
      $('#players').innerHTML = g.players.map(p => `<div class="player-row"><strong>${escape(p.pseudo)}${p.id === s.hostId ? ' ♛' : ''}</strong><span class="badge">${p.ready ? 'Prêt' : 'En préparation'}</span></div>`).join('');
      $('#start-game').textContent = host ? 'Lancer la partie' : 'En attente du chef';
      $('#start-game').disabled = busy || !host || g.phase !== 'preparing' || g.players.length < 2 || !g.players.every(p => p.ready);
    }
    let html = `<p id="hmo-notice" role="status" class="hmo-notice">${escape(message)}</p>`;
    if (g.phase === 'setup') {
      html += `<p class="hmo-intro">Des choix secrets, une défense à l’oral, puis le verdict de la table.</p>`;
      if (host) html += `<form id="hmo-config"><label>Mode<select name="mode"><option value="common">Thème commun</option><option value="individual">Thèmes individuels</option></select></label><label>Thème commun<select name="theme">${g.themes.map(t => `<option ${t.name === g.commonTheme ? 'selected' : ''}>${escape(t.name)}</option>`).join('')}</select></label><label>Images par joueur<input name="count" type="number" min="1" max="7" value="3" required></label><p>En mode individuel, chacun reçoit un thème différent, gardé secret.</p><button type="submit" ${busy ? 'disabled' : ''}>Préparer les sélections</button></form>`;
      else html += '<p>Le chef choisit le mode, le thème et le nombre d’images.</p>';
    } else if (g.phase === 'preparing') {
      html += `<div class="hmo-heading"><div><small>${g.mode === 'common' ? 'THÈME COMMUN' : 'TON THÈME SECRET'}</small><h3>${escape(g.myTheme)}</h3></div><strong>${g.mine.length} / ${g.count}</strong></div><p>Choisis des images qui correspondent à ce thème. Elles restent privées jusqu’à ton tour.</p><div class="hmo-selection">${g.mine.map(c => `<article class="hmo-photo">${photo(c)}<strong>${escape(choiceTitle(c))}</strong>${credit(c)}${button('remove','Retirer',busy || g.myReady,`data-id="${c.id}"`)}</article>`).join('')}</div>`;
      html += button('ready', g.myReady ? 'Modifier ma sélection' : 'Je suis prêt', busy || (!g.myReady && g.mine.length !== g.count));
      if (!g.myReady && g.mine.length < g.count) html += `<div class="hmo-sources"><h4>Ajouter une image</h4><form id="hmo-import"><label>Nom du personnage<input name="title" maxlength="100" required placeholder="Ex. : ton personnage préféré"></label><label class="hmo-file">Image personnelle<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required></label><small>JPEG, PNG ou WebP · 8 Mo max. Utilise une image que tu as le droit de partager avec la table.</small><button type="submit" ${busy ? 'disabled' : ''}>Ajouter à mes choix</button></form><details><summary>Rechercher dans la galerie Wikimedia Commons</summary><p>Images libres disponibles sur Commons. Tous les personnages n’y sont pas représentés ; tu peux aussi importer une image.</p><form id="hmo-search"><label>Personnage ou nom<input name="query" type="search" maxlength="100" placeholder="Un nom précis donne de meilleurs résultats"></label><button type="submit" ${busy ? 'disabled' : ''}>Rechercher</button></form><div id="hmo-gallery" class="hmo-gallery"></div></details></div>`;
    } else {
      html += `<header class="hmo-heading"><div><small>HEAR ME OUT</small><h2>${g.phase === 'finished' ? 'Hear Me Out Cake 🍰' : `Choix ${Math.min(g.turn,g.total)} / ${g.total}`}</h2></div>${button('leave','Quitter')}</header>`;
      if (g.phase === 'turn') html += `<div class="hmo-turn"><span aria-hidden="true">?</span><h3>${mine ? 'À toi de jouer' : `Au tour de ${escape(g.players.find(p => p.id === g.author)?.pseudo || 'ton ami')}`}</h3><p>${mine ? 'Révèle ton prochain choix à la table.' : 'Son choix reste secret jusqu’à la révélation.'}</p>${mine ? button('reveal','HEAR ME OUT…',busy) : ''}</div>`;
      if (g.current && ['defending','voting','result'].includes(g.phase)) {
        const c = g.current;
        html += `<div class="hmo-reveal"><div class="hmo-feature-photo">${photo(c,true)}</div><div><small>${escape(c.pseudo)} · ${escape(c.theme)}</small><h3>${escape(choiceTitle(c))}</h3>${credit(c)}`;
        if (g.phase === 'defending') html += `<p>Défends ton choix 👀</p>${mine || host ? button('open_vote','Ouvrir le vote',busy) : '<p>Le vote ouvrira après sa défense.</p>'}`;
        if (g.phase === 'voting') html += `<p>${g.voted} vote(s) reçu(s) · ${g.eligible} votant(s) présents</p>${mine ? '<p>La table vote sur ton choix.</p>' : g.myVote ? '<p>Vote enregistré. En attente de la table…</p>' : `<div class="hmo-votes">${[['yes','👍 Oui'],['meh','🤨 Bof'],['no','💀 Non']].map(([vote,label]) => button('vote',label,busy,`data-vote="${vote}" data-id="${c.id}"`)).join('')}</div>`}`;
        if (g.phase === 'result') html += `<div class="hmo-results"><span>Oui <b>${c.result.yes}</b></span><span>Bof <b>${c.result.meh}</b></span><span>Non <b>${c.result.no}</b></span></div>${mine || host ? button('next','Choix suivant',busy) : '<p>En attente du prochain choix…</p>'}`;
        html += '</div></div>';
      }
      html += `<section class="hmo-cake" aria-label="Gâteau de la partie"><div class="hmo-cake-photos">${g.cake.map(c => `<figure class="hmo-pick">${photo(c)}${posterCaption(c)}</figure>`).join('')}</div><div class="hmo-cake-base"><span>Hear Me Out</span></div></section>`;
      if (g.phase === 'finished') {
        html += stats(g.cake) + button('download','Télécharger le gâteau 📥',busy);
        html += '<details class="hmo-credits"><summary>Crédits des images</summary>' + g.cake.map(c => `<p>${escape(choiceTitle(c))}${credit(c)}</p>`).join('') + '</details>';
      }
    }
    root.innerHTML = html;
    if (preservedSources && root.querySelector('.hmo-sources')) root.querySelector('.hmo-sources').replaceWith(preservedSources);
    if (configValues && root.querySelector('#hmo-config')) {
      for (const [name,value] of Object.entries(configValues)) root.querySelector(`#hmo-config [name="${name}"]`).value = value;
    }
    root.querySelectorAll('.hmo-sources button').forEach(el => { el.disabled = busy; });
    hydrate(root); renderGallery();
  }
  function tickClock() {
    if (snapshot?.flowVersion !== 2 || !['collecting','result','round_end'].includes(snapshot.phase)) return;
    const left = Math.max(0, Math.ceil((deadlineAt-performance.now())/1000));
    const advance = $('#hmo-auto-next'); if (advance) advance.textContent = `La suite dans ${left} s…`;
    const timer = $('#hmo-time');
    if (timer) { timer.textContent = `${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`; timer.closest('.hmo-clock').classList.toggle('urgent',left<=15); }
    const bar = $('#hmo-time-bar'); if (bar) bar.style.transform = `scaleX(${left/120})`;
    $('#hmo-import')?.querySelectorAll('button,input').forEach(el => { el.disabled = busy || left===0; });
    if (!left && !loading && performance.now()>expiryAttempt) {
      expiryAttempt = performance.now()+3000; refresh();
    }
  }
  function cakeMarkup(g) {
    const cards = g.cake.map(c => {
      const fresh = !cakeSeen.has(c.id); cakeSeen.add(c.id);
      return `<figure class="hmo-pick ${fresh ? 'hmo-pick-new' : ''}" data-choice="${c.id}">${photo(c)}${posterCaption(c)}</figure>`;
    }).join('');
    return `<section class="hmo-cake hmo-cake-v2" aria-label="Gâteau de la partie"><div class="hmo-cake-label"><span>LA PIÈCE MONTÉE</span><small>${g.cake.length} souvenir${g.cake.length>1?'s':''} de la table</small></div><div class="hmo-cake-photos">${cards}</div><div class="hmo-cake-art"><img src="./Image%20site/hmo-cake.svg" alt="Gâteau à la crème, cerises et glaçage rose sur son présentoir" width="960" height="480"><span>Hear me out.</span></div></section>`;
  }
  function renderRounds() {
    const s=ctx(), g=snapshot, host=s.hostId===s.userId;
    if (g.phase!=='setup' && s.screen==='lobby') { bridge.go('hear-game'); return; }
    const root=mount(); if (!root) return;
    root.classList.add('hmo-v2');
    const key=JSON.stringify([g.revision,g.phase,s.hostId,s.screen,busy]);
    if (key===renderKey && root.dataset.mounted==='true') return;
    renderKey=key; root.dataset.mounted='true';
    const scene=`${room}:${g.round}:${g.phase}:${g.current?.id || ''}`;
    const entered=scene!==sceneKey; sceneKey=scene;
    const sourceKey=`${room}:${g.round}:${g.mine.map(c=>c.id).join(',')}`;
    const sources=root.dataset.sourceKey===sourceKey ? root.querySelector('.hmo-sources') : null;
    const config=root.querySelector('#hmo-config'), values=config && !config.querySelector('fieldset:disabled') ? Object.fromEntries(new FormData(config)) : null;
    root.dataset.sourceKey=sourceKey;
    const oldCards=new Map([...root.querySelectorAll('[data-choice]')].map(el=>[el.dataset.choice,el]));
    let html=`<p id="hmo-notice" role="status" class="hmo-notice">${escape(message)}</p>`;
    if (g.phase==='setup') {
      $('[data-screen="lobby"]').classList.add('hmo-lobby-screen');
      $('#players').innerHTML=g.players.map(p=>`<div class="player-row"><strong>${escape(p.pseudo)}${p.id===s.hostId?' ♛':''}</strong><span class="badge">À table</span></div>`).join('');
      $('#start-game').textContent=host?'Lancer les 2 minutes':'En attente de l’hôte';
      $('#start-game').disabled=busy || !host || g.players.length<2;
      html+=`<div class="hmo-lobby-intro"><span class="hmo-eyebrow">LE GOÛT DU DÉBAT</span><h3>Des choix discutables.<br><em>Un gâteau mémorable.</em></h3><p>Une image chacun. Deux minutes pour la trouver.<br>Après, il faudra l’assumer.</p></div><form id="hmo-config"><fieldset ${!host||busy?'disabled':''}><legend>La règle du jeu</legend><div class="hmo-mode-options"><label><input type="radio" name="mode" value="common" ${g.mode==='common'?'checked':''}><span><b>Thème commun</b><small>Le même défi pour toute la table.</small></span></label><label><input type="radio" name="mode" value="individual" ${g.mode==='individual'?'checked':''}><span><b>Chacun son thème</b><small>Un thème secret différent par joueur.</small></span></label></div><label class="hmo-round-input">Nombre de manches <select name="rounds">${[1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${n===g.rounds?'selected':''}>${n} manche${n>1?'s':''}</option>`).join('')}</select></label></fieldset><p class="hmo-random-note">↝ Les thèmes sont tirés au sort à chaque manche.</p></form><div class="hmo-flow"><span><b>01</b> Trouver</span><span><b>02</b> Révéler</span><span><b>03</b> Voter</span></div>`;
      if (g.players.length<2) html+='<p class="hmo-wait-note">Il manque un convive. Partage le code du salon.</p>';
    } else {
      html+=`<header class="hmo-heading"><div><span class="hmo-eyebrow">HEAR ME OUT / LA TABLE RONDE</span><h2>${g.phase==='finished'?'La crème de vos choix.':`Manche ${g.round}<span class="hmo-round-total"> / ${g.rounds}</span>`}</h2></div>${button('leave','Quitter')}</header>`;
      if (g.phase==='collecting') {
        html+=`<section class="hmo-collect ${entered?'hmo-scene-enter':''}"><div class="hmo-theme-panel"><span class="hmo-eyebrow">${g.mode==='common'?'LE THÈME DE LA TABLE':'TON THÈME SECRET'}</span><h3>${escape(g.myTheme)}</h3><p>Trouve <strong>une image</strong> qui mérite sa place sur le gâteau. Personne ne la voit avant la révélation.</p><div class="hmo-clock" role="timer" aria-label="Temps restant pour importer"><strong id="hmo-time">2:00</strong><span>pour faire ton choix</span></div><div class="hmo-time-track"><i id="hmo-time-bar"></i></div><div class="hmo-player-status">${g.players.map(p=>`<span class="${p.ready?'ready':''}"><i aria-hidden="true">${p.ready?'✓':'·'}</i>${escape(p.pseudo)}<small>${p.ready?'Image déposée':'En recherche'}</small></span>`).join('')}</div></div><div class="hmo-upload-panel">`;
        if (g.mine.length) {
          html+=`<div class="hmo-sealed"><span class="hmo-eyebrow">BIEN GARDÉ, JUSQU’AU VERDICT</span><div class="hmo-sealed-photo">${photo(g.mine[0],true)}</div><h4>${escape(choiceTitle(g.mine[0]))}</h4><p>Ton image est enregistrée.<br>La révélation commence dès que tout le monde a fini, ou à la fin du chrono.</p>${button('remove','Changer mon image',busy,`data-id="${g.mine[0].id}"`)}</div>`;
        } else {
          html+=`<div class="hmo-sources"><form id="hmo-import"><label class="hmo-dropzone"><input type="file" name="image" accept="image/jpeg,image/png,image/webp" required aria-label="Choisir mon image"><span class="hmo-upload-symbol" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="6" y="10" width="29" height="31" rx="4"/><path d="m10 33 8-9 7 7 4-4 5 6M33 17V3m-6 7 6-7 7 7"/><circle cx="15" cy="18" r="2"/></svg></span><strong id="hmo-file-label">Dépose ton meilleur argument.</strong><span>Clique pour choisir une image</span><small>JPEG, PNG, WebP · 8 Mo maximum</small><img id="hmo-upload-preview" alt="Aperçu de ton image" hidden></label><label>Un nom pour ton choix <span class="hmo-optional">facultatif</span><input name="title" maxlength="100" placeholder="Laisse vide pour afficher ton prénom"></label><button class="hmo-submit-image" type="submit" ${busy?'disabled':''}>Garder mon choix secret <span aria-hidden="true">↗</span></button></form><details class="hmo-gallery-details"><summary>Besoin d’inspiration ? Ouvrir la galerie</summary><form id="hmo-search"><label>Rechercher une image libre<input name="query" type="search" maxlength="100" placeholder="Nom du personnage"></label><button type="submit">Rechercher</button></form><div id="hmo-gallery" class="hmo-gallery"></div></details><p class="hmo-upload-note">Le chronomètre ne s’arrête pas pendant l’import. Utilise une image que tu peux partager.</p></div>`;
        }
        html+='</div></section>';
      }
      if (g.current && ['voting','result'].includes(g.phase)) {
        const c=g.current, mine=g.author===s.userId;
        html+=`<section class="hmo-reveal ${entered?'hmo-scene-enter':''}"><div class="hmo-feature-photo"><span class="hmo-photo-stamp">HEAR ME OUT…</span>${photo(c,true)}<span class="hmo-photo-signature">${escape(c.pseudo)}</span></div><div class="hmo-verdict"><div class="hmo-vote-theme"><span>THÈME</span><strong>${escape(c.theme)}</strong></div><h3>${escape(choiceTitle(c))}</h3><p>${mine?'C’est ton choix. À toi de le défendre.':`Découvre son choix, puis donne ton avis.`}</p>${credit(c)}`;
        if (g.phase==='voting') html+=`<div class="hmo-votes">${[['yes','👍','Oui','Je valide'],['meh','🤨','Bof','À débattre'],['no','💀','Non','Vraiment ?']].map(([vote,icon,label,sub])=>button('vote',`<span aria-hidden="true">${icon}</span><b>${label}</b><small>${sub}</small>`,busy||mine||!!g.myVote,`data-vote="${vote}" data-id="${c.id}" class="${g.myVote===vote?'selected':''}"`)).join('')}</div><p class="hmo-vote-progress" role="status">${g.myVote?'Ton vote est enregistré. ':''}${g.voted} / ${g.eligible} vote${g.eligible>1?'s':''}</p>`;
        else html+=`<div class="hmo-results">${[['yes','Oui'],['meh','Bof'],['no','Non']].map(([v,label])=>`<span>${label}<b>${c.result[v]}</b></span>`).join('')}</div><p id="hmo-auto-next" role="status">La suite dans 3 s…</p>`;
        html+='</div></section>';
      }
      if (g.phase==='round_end') html+=`<section class="hmo-intermission ${entered?'hmo-scene-enter':''}"><span class="hmo-eyebrow">ON REMET ÇA ?</span><h3>Manche ${g.round} terminée.</h3><p>Le prochain thème vous attend. Nouvelle manche, nouveau choix.</p><p id="hmo-auto-next" role="status">La suite dans 5 s…</p></section>`;
      if (g.phase==='finished') html+=`<div class="hmo-finale ${entered?'hmo-scene-enter':''}"><p>Des goûts personnels. Un souvenir collectif.</p><span class="hmo-confetti" aria-hidden="true">✦ · ✧ · ✦</span></div>`;
      if (g.phase!=='collecting') html+=cakeMarkup(g);
      if (g.phase==='finished') html+=stats(g.cake)+button('download','Télécharger le gâteau ↓',busy||!g.cake.length,'class="hmo-download"')+`<details class="hmo-credits"><summary>Crédits des images</summary>${g.cake.map(c=>`<p>${escape(choiceTitle(c))}${credit(c)}</p>`).join('')}</details>`;
    }
    root.innerHTML=html;
    if (sources && root.querySelector('.hmo-sources')) root.querySelector('.hmo-sources').replaceWith(sources);
    if (values && root.querySelector('#hmo-config')) {
      const radio=root.querySelector(`#hmo-config input[value="${values.mode==='individual'?'individual':'common'}"]`); if (radio) radio.checked=true;
      root.querySelector('#hmo-config [name="rounds"]').value=values.rounds;
    }
    root.querySelectorAll('[data-choice]').forEach(el=>{const old=oldCards.get(el.dataset.choice);if(old)el.replaceWith(old);});
    hydrate(root); renderGallery(); tickClock();
    if (entered && s.screen==='hear-game') root.scrollIntoView({block:'start',behavior:'instant'});
  }
  function stats(cake) {
    const positive = cake.filter(c => c.result.yes > 0).sort((a,b) => b.result.yes-a.result.yes)[0];
    const negative = cake.filter(c => c.result.no > 0).sort((a,b) => b.result.no-a.result.no)[0];
    const disputed = cake.filter(c => c.result.yes && c.result.no).sort((a,b) => Math.abs(a.result.yes-a.result.no)/(a.result.yes+a.result.no)-Math.abs(b.result.yes-b.result.no)/(b.result.yes+b.result.no))[0];
    return '<div class="hmo-stats">' + [[positive,'Le plus validé'],[negative,'Le plus rejeté'],[disputed,'Le plus partagé']].filter(([c]) => c).map(([c,label]) => `<p><small>${label}</small><strong>${escape(choiceTitle(c))}</strong></p>`).join('') + '</div>';
  }
  async function imageUrl(path) {
    if (!images.has(path)) {
      const task = ctx().db.storage.from('hear-me-out').download(path).then(({data,error}) => { if (error) throw error; return URL.createObjectURL(data); });
      images.set(path,task); task.catch(() => images.delete(path));
    }
    return images.get(path);
  }
  function hydrate(root) {
    root.querySelectorAll('[data-hmo-path]').forEach(async img => {
      try { const url = await imageUrl(img.dataset.hmoPath); if (img.isConnected) img.src = url; }
      catch { if (img.isConnected) { img.alt = 'Image indisponible — réessaie en actualisant'; img.classList.add('hmo-image-error'); } }
    });
  }
  function plain(value) { return new DOMParser().parseFromString(value || '', 'text/html').body.textContent.replace(/\s+/g,' ').trim(); }
  function allowedMedia(url) { try { const u = new URL(url); return u.protocol === 'https:' && ['upload.wikimedia.org','thumb.wikimedia.org'].includes(u.hostname); } catch { return false; } }
  async function search(query) {
    galleryAbort?.abort(); galleryAbort = new AbortController();
    const token = generation, root = $('#hmo-gallery'); if (!root) return;
    galleryMessage = 'Recherche…'; root.textContent = galleryMessage;
    const keyword = snapshot.themes.find(t => t.name === snapshot.myTheme)?.search || '';
    const params = new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrsearch:`${query || keyword} filetype:bitmap`,gsrlimit:'12',prop:'imageinfo',iiprop:'url|extmetadata|mime',iiurlwidth:'480'});
    try {
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {signal:galleryAbort.signal,credentials:'omit'});
      if (!response.ok) throw new Error('La galerie est temporairement indisponible. L’import personnel reste disponible.');
      const data = await response.json();
      if (token !== generation) return;
      if (data.error) throw new Error('La galerie est temporairement indisponible. L’import personnel reste disponible.');
      gallery = Object.values(data.query?.pages || {}).map(p => {
        const i = p.imageinfo?.[0], meta = i?.extmetadata;
        if (!i || !['image/jpeg','image/png','image/webp'].includes(i.mime) || !allowedMedia(i.thumburl || i.url)) return null;
        const license = plain(meta?.LicenseShortName?.value);
        // Only public-domain/CC0 media: exported cakes require no separate license bundle.
        if (!/public domain|CC0/i.test(license)) return null;
        return {title:p.title.replace(/^File:/,'').replace(/\.[^.]+$/,'').slice(0,100),url:i.thumburl || i.url,source:i.descriptionurl,credit:`${plain(meta?.Artist?.value).slice(0,650)} · ${license} · Wikimedia Commons`};
      }).filter(Boolean);
      galleryMessage = gallery.length ? '' : 'Aucune image du domaine public trouvée. Essaie un autre nom ou importe une image.';
      renderGallery();
    } catch (e) { if (e.name !== 'AbortError' && token === generation) { galleryMessage = e.message; renderGallery(); } }
  }
  function renderGallery() {
    const root = $('#hmo-gallery'); if (!root) return;
    if (galleryMessage) { root.textContent = galleryMessage; return; }
    root.innerHTML = gallery.length ? gallery.map((c,i) => `<article class="hmo-photo"><img src="${escape(c.url)}" alt="${escape(choiceTitle(c))}" loading="lazy" width="240" height="240"><strong>${escape(choiceTitle(c))}</strong>${credit(c)}${button('gallery','Choisir',busy,`data-index="${i}"`)}</article>`).join('') : '<p>Recherche parmi les images du domaine public. Si aucun résultat ne correspond à ton thème, utilise l’import personnel.</p>';
  }
  function blobCanvas(canvas) { return new Promise((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Impossible de générer l’image.')), 'image/jpeg', .88)); }
  async function prepareImage(blob) {
    if (!['image/jpeg','image/png','image/webp'].includes(blob.type) || blob.size > 8*1024*1024) throw new Error('Choisis un JPEG, PNG ou WebP de moins de 8 Mo.');
    const bitmap = await createImageBitmap(blob);
    try {
      if (!bitmap.width || !bitmap.height || bitmap.width*bitmap.height > 40000000) throw new Error('Cette image est trop grande (40 mégapixels maximum).');
      const resize = async max => {
        const scale = Math.min(1,max/Math.max(bitmap.width,bitmap.height));
        const canvas = document.createElement('canvas'); canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
        const c = canvas.getContext('2d'); c.fillStyle = '#fff5eb'; c.fillRect(0,0,canvas.width,canvas.height); c.drawImage(bitmap,0,0,canvas.width,canvas.height);
        return blobCanvas(canvas);
      };
      return await Promise.all([resize(1024),resize(240)]);
    } finally { bitmap.close(); }
  }
  async function addImage(blob, title, credit = '', source = '') {
    if (busy) return;
    const s = ctx(), target = room, token = generation, round = snapshot?.round;
    busy = true;
    notice('Préparation et envoi de l’image…');
    let uploaded = [];
    try {
      const [full,thumb] = await prepareImage(blob);
      const prefix = `${s.userId}/${target}/${crypto.randomUUID()}`;
      const paths = [`${prefix}.jpg`,`${prefix}-thumb.jpg`];
      for (const [i,file] of [full,thumb].entries()) {
        const {error} = await s.db.storage.from('hear-me-out').upload(paths[i],file,{contentType:'image/jpeg',upsert:false});
        if (error) throw error; uploaded.push(paths[i]);
      }
      if (token !== generation) throw new Error('Le salon a changé.');
      await rpc('add',{title:(title.trim() || choiceTitle({pseudo:snapshot.players.find(p => p.id === s.userId)?.pseudo})).slice(0,100),path:paths[0],thumb:paths[1],credit:credit.slice(0,1200),source:source.slice(0,1000),round});
      message = '';
      uploaded = [];
    } catch (e) {
      // Only our newly staged, unreferenced files; the server refuses removal of committed choices.
      if (uploaded.length) await s.db.storage.from('hear-me-out').remove(uploaded);
      notice(errorText(e));
    } finally { busy = false; renderKey = ''; render(); }
  }
  async function download() {
    if (busy || !snapshot?.cake.length) return;
    busy = true; notice('Génération du gâteau…');
    try {
      const cake = [...snapshot.cake];
      {
        const cols = Math.min(5,cake.length), rows = Math.ceil(cake.length/cols), w = 1200, rowH = 306;
        const canvas = document.createElement('canvas'); canvas.width=w; canvas.height=170+rows*rowH+440;
        const c = canvas.getContext('2d'); c.fillStyle='#111816'; c.fillRect(0,0,w,canvas.height);
        c.fillStyle='#f9eadd'; c.textAlign='center'; c.font='bold 54px Georgia'; c.fillText('Hear Me Out Cake',w/2,85);
        c.font='20px sans-serif'; c.fillStyle='#cfbca7'; c.fillText('La Table Ronde',w/2,123);
        const cellW = (w-80)/cols, imgSize = Math.min(195,cellW-22);
        // Decode, draw and release one photo at a time: 56 choices must fit on mobile.
        for (const [i,ch] of cake.entries()) {
          const img=new Image(); img.src=await imageUrl(ch.path); await img.decode();
          const x=40+(i%cols)*cellW+cellW/2, y=165+Math.floor(i/cols)*rowH;
          c.fillStyle='#cdb797'; c.fillRect(x-3,y+imgSize,6,72);
          c.fillStyle='#fff4e8'; c.fillRect(x-imgSize/2-7,y-7,imgSize+14,imgSize+87);
          c.fillStyle='#ead7ca'; c.fillRect(x-imgSize/2,y,imgSize,imgSize);
          const scale=Math.min(imgSize/img.width,imgSize/img.height);
          c.drawImage(img,x-img.width*scale/2,y+(imgSize-img.height*scale)/2,img.width*scale,img.height*scale);
          c.fillStyle='#75443e'; c.font='bold 16px sans-serif'; c.fillText(ch.theme || '',x,y+imgSize+23,imgSize);
          c.fillStyle='#2d2522'; c.font='bold 16px sans-serif'; c.fillText(choiceTitle(ch),x,y+imgSize+47,imgSize);
          c.font='14px sans-serif'; c.fillText(ch.pseudo,x,y+imgSize+69,imgSize);
          img.src='';
        }
        const baseY=135+rows*rowH;
        const cakeArt=new Image(); cakeArt.src='./Image%20site/hmo-cake.svg'; await cakeArt.decode();
        c.drawImage(cakeArt,140,baseY,920,460);
        c.fillStyle='#7d4d48'; c.font='italic 32px Georgia'; c.fillText('Hear me out.',600,baseY+182);
        const blob = await new Promise((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Export PNG impossible.')), 'image/png'));
        const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download='hear-me-out-cake.png'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),30000);
        notice('Gâteau prêt : le téléchargement a été lancé.');
      }
    } catch (e) { notice('Export interrompu : une image n’a pas pu être chargée. Réessaie. ' + errorText(e)); }
    finally { busy = false; }
  }
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!['hmo-config','hmo-search','hmo-import'].includes(form.id)) return;
    event.preventDefault(); const data = new FormData(form);
    if (form.id === 'hmo-config') {
      if (snapshot?.flowVersion===2) act('configure',{mode:data.get('mode'),rounds:Number(data.get('rounds'))});
      else act('prepare',{mode:data.get('mode'),theme:data.get('theme'),count:Number(data.get('count'))});
    }
    if (form.id === 'hmo-search') search(String(data.get('query')).trim());
    if (form.id === 'hmo-import') addImage(data.get('image'),String(data.get('title')));
  });
  document.addEventListener('change',event=>{
    const input=event.target;
    if (snapshot?.flowVersion!==2) return;
    if (input.closest('#hmo-config')) {
      const data=new FormData(input.closest('form')); act('configure',{mode:data.get('mode'),rounds:Number(data.get('rounds'))});
    }
    if (input.matches('#hmo-import input[type="file"]')) {
      const file=input.files?.[0], img=$('#hmo-upload-preview');
      if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl='';
      if (file && img) {
        previewUrl=URL.createObjectURL(file); img.src=previewUrl; img.hidden=false;
        $('#hmo-file-label').textContent=file.name;
      }
    }
  });
  document.addEventListener('click', async event => {
    const el=event.target.closest('[data-hmo]'); if (!el || el.disabled || !snapshot) return;
    const action=el.dataset.hmo;
    if (action === 'leave') { bridge.leave(); return; }
    if (action === 'ready') { act('ready',{ready:!snapshot.myReady}); return; }
    if (action === 'remove') { act('remove',{id:el.dataset.id,round:snapshot.round}); return; }
    if (action === 'next' && snapshot.flowVersion===2) { act('next',{id:snapshot.current?.id,round:snapshot.round}); return; }
    if (action === 'vote') { act('vote',{id:el.dataset.id,vote:el.dataset.vote}); return; }
    if (action === 'download') { download(); return; }
    if (action === 'gallery') {
      const item=gallery[Number(el.dataset.index)]; if (!item || busy) return;
      el.disabled=true;
      try {
        const response=await fetch(item.url,{credentials:'omit'});
        if (!response.ok) throw new Error('Image indisponible. Choisis une autre image ou utilise l’import personnel.');
        await addImage(await response.blob(),item.title,item.credit,item.source);
      } catch (e) { notice(errorText(e)); } finally { if (el.isConnected) el.disabled=false; }
      return;
    }
    act(action);
  });
  window.addEventListener('online',refresh);
  window.addEventListener('focus',() => { if (room) refresh(); });
  window.LTR_HMO={init(value){bridge=value;},sync,start(){
    if (snapshot?.flowVersion===2) {
      const form=$('#hmo-config'), data=form?new FormData(form):null;
      return act('start',{mode:data?.get('mode') || snapshot.mode,rounds:Number(data?.get('rounds') || snapshot.rounds)});
    }
    return act('start');
  },reset};
})();
