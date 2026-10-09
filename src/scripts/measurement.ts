// One bounded event contract. No email addresses, search terms, or full URLs.
export function track(name: string, params: Record<string, string> = {}) {
  window.dispatchEvent(new CustomEvent("kreativwp:track", { detail: { name, params } }));
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track]") : null;
  if (!target) {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("[data-library-card] a") : null;
    if (anchor) track("profile_open", { resource: new URL(anchor.href).pathname.replace(/^\/+|\/+$/g, "").replaceAll("/", ":") });
    return;
  }
  track(target.dataset.track!, {
    ...(target.dataset.product ? { product: target.dataset.product } : {}),
    ...(target.dataset.resource ? { resource: target.dataset.resource } : {})
  });
});
