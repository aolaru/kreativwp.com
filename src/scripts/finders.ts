import { recommendThemes, recommendPlugins, type Catalog, type FinderOptions, type Recommendation } from "../data/recommendations";
import { track } from "./measurement";

export function mountFinder(kind: "theme" | "plugin" | "stack") {
  const form = document.querySelector<HTMLFormElement>(`#${kind}-finder-form`);
  const result = document.querySelector<HTMLElement>(`#${kind}-finder-result`);
  const catalogElement = document.querySelector(`#${kind}-finder-catalog`);
  if (!form || !result || !catalogElement) return;
  const catalog: Catalog = JSON.parse(catalogElement.textContent || "{}");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const value = (name: string) => String(values.get(name) || "");
    const jobs = kind === "plugin" ? [value("job")] : Array.from(form.querySelectorAll<HTMLInputElement>("[data-need]:checked")).map((input) => input.value);
    if (kind === "stack" && value("site") === "store") jobs.push("ecommerce");
    const options: FinderOptions = { site: value("site"), editor: value("editor"), priority: value("priority"), budget: value("budget"), hosting: value("hosting"), existing: Array.from(form.querySelectorAll<HTMLInputElement>("[data-existing]:checked")).map((input) => input.value), jobs };
    result.replaceChildren(); result.hidden = false;
    const heading = document.createElement("h3"); heading.textContent = "Your research shortlist"; heading.tabIndex = -1;
    result.append(heading);
    const list = (label: string, candidates: Recommendation[]) => {
      const title = document.createElement("h4"); title.textContent = label; result.append(title);
      const ul = document.createElement("ul");
      for (const candidate of candidates) {
        const li = document.createElement("li"); const anchor = document.createElement("a");
        anchor.href = candidate.href; anchor.textContent = candidate.name;
        anchor.dataset.track = "recommendation_open"; anchor.dataset.resource = candidate.id;
        li.append(anchor, document.createTextNode(` — ${candidate.reason}`)); ul.append(li);
      }
      result.append(ul);
      if (!candidates.length) { const empty = document.createElement("p"); empty.textContent = "No additional recommendation fits these constraints."; result.append(empty); }
    };
    if (kind !== "plugin") list("Theme shortlist", recommendThemes(catalog, options));
    if (kind !== "theme") {
      const plugins = recommendPlugins(catalog, options); list("Plugin shortlist", plugins.recommendations);
      for (const note of plugins.notes) { const p = document.createElement("p"); p.textContent = note; result.append(p); }
    }
    const caveat = document.createElement("p"); caveat.className = "stack-finder__caveat";
    caveat.textContent = "These are starting points, not benchmarks or an automatic install list. Verify the free/paid boundaries and test your actual workflow on staging. Use only one full-page cache.";
    result.append(caveat);
    track("tool_completed", { tool_name: `${kind}_finder`, budget: options.budget || "free", hosting: options.hosting || "not_applicable" });
    heading.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  });
}
