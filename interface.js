/* UI only: no game state, authentication, storage or database access. */
(() => {
  const notices = document.createElement("div");
  notices.className = "ui-notices";
  notices.setAttribute("aria-label", "Notifications");
  document.body.append(notices);
  const pending = document.createElement("div");
  pending.className = "ui-pending hidden";
  pending.setAttribute("role", "status");
  document.body.append(pending);
  const operations = new Map();

  function notify(message) {
    // Keep messages until dismissed; failures must not disappear while a player is reading.
    const item = document.createElement("div");
    item.className = "ui-notice";
    const text = document.createElement("p");
    text.setAttribute("role", "status");
    text.textContent = String(message);
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Fermer la notification");
    close.addEventListener("click", () => item.remove());
    item.append(text, close);
    notices.append(item);
    while (notices.children.length > 3) notices.firstElementChild.remove();
  }

  async function withBusy(key, selector, label, action) {
    if (operations.has(key)) return;
    const buttons = [...document.querySelectorAll(selector)];
    const previous = buttons.map(button => [button, button.disabled]);
    operations.set(key, label);
    buttons.forEach(button => { button.disabled = true; button.setAttribute("aria-busy", "true"); });
    pending.textContent = label;
    pending.classList.remove("hidden");
    try { return await action(); }
    catch (error) {
      notify("L’action n’a pas abouti. Vérifie ta connexion et réessaie.");
      console.error("UI action failed:", error);
    } finally {
      previous.forEach(([button, disabled]) => { button.disabled = disabled; button.removeAttribute("aria-busy"); });
      operations.delete(key);
      pending.classList.toggle("hidden", operations.size === 0);
      pending.textContent = [...operations.values()].at(-1) || "";
    }
  }

  const modalSelector = ".modal, .rules-modal, .shop-preview-modal, .badge-unlock-modal";
  const focusableSelector = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]';
  const opened = new Map();
  let modalTop = null;
  let sequence = 0;
  const visible = element => element.isConnected && !element.classList.contains("hidden") && element.getAttribute("aria-hidden") !== "true" && getComputedStyle(element).display !== "none";
  const focusable = element => [...element.querySelectorAll(focusableSelector)].filter(node => node.getClientRects().length && !node.closest("[inert]"));

  function syncModals() {
    const all = [...document.querySelectorAll(modalSelector)];
    const active = all.filter(visible);
    for (const modal of active) {
      if (!opened.has(modal)) opened.set(modal, { trigger: document.activeElement, order: ++sequence });
    }
    const next = active.sort((a, b) => Number(getComputedStyle(a).zIndex || 0) - Number(getComputedStyle(b).zIndex || 0) || opened.get(a).order - opened.get(b).order).at(-1) || null;
    document.querySelector("#app").inert = !!next;
    all.forEach(modal => { modal.inert = !!next && modal !== next; });
    if (next !== modalTop) {
      const previous = modalTop;
      modalTop = next;
      if (next) {
        const returnTo = previous && !visible(previous) ? opened.get(previous)?.trigger : null;
        const target = returnTo && next.contains(returnTo) && returnTo.getClientRects().length
          ? returnTo : next.querySelector('input:not([type="hidden"]):not(:disabled)') || focusable(next)[0];
        if (target) target.focus({ preventScroll: true });
        else { next.tabIndex = -1; next.focus({ preventScroll: true }); }
      } else if (previous) {
        const trigger = opened.get(previous)?.trigger;
        if (trigger?.isConnected && trigger.getClientRects().length && !trigger.closest("[inert]")) trigger.focus({ preventScroll: true });
      }
    }
    for (const modal of opened.keys()) if (!active.includes(modal)) opened.delete(modal);
  }

  function applyVisualStyles(root) {
    if (root.nodeType !== 1) return;
    const targets = [...root.querySelectorAll("[data-ui-style]")];
    if (root.matches("[data-ui-style]")) targets.unshift(root);
    for (const element of targets) {
      for (const declaration of element.dataset.uiStyle.split(";")) {
        const separator = declaration.indexOf(":");
        if (separator < 0) continue;
        const property = declaration.slice(0, separator).trim();
        const value = declaration.slice(separator + 1).trim();
        // Only numerical layout values and colour variables emitted by the renderers.
        // Set individual properties: style attributes/cssText are blocked by the site's CSP.
        if ((property === "width" || /^--[a-z][a-z0-9-]*$/.test(property)) && /^[\d\s.a-zA-Z#%(),+\-]+$/.test(value)) {
          element.style.setProperty(property, value);
        }
      }
    }
  }

  new MutationObserver(records => {
    for (const record of records) if (record.type === "childList") record.addedNodes.forEach(applyVisualStyles);
    if (records.some(record => record.type === "attributes" ? record.target.matches(modalSelector) : [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === 1 && (node.matches(modalSelector) || node.querySelector(modalSelector))))) syncModals();
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "aria-hidden"] });

  document.addEventListener("keydown", event => {
    if (!modalTop) return;
    if (event.key === "Escape") {
      // Presence and anti-AFK dialogs require an explicit answer, so have no generic dismissal.
      const close = modalTop.querySelector(".modal-close, .rules-close, .shop-preview-close, [data-close-transient]");
      if (close && !close.disabled) { event.preventDefault(); close.click(); }
    }
    if (event.key === "Tab") {
      const targets = focusable(modalTop);
      const first = targets[0];
      const last = targets.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !modalTop.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !modalTop.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  });

  window.LTR_UI = Object.freeze({ notify, withBusy });
})();
