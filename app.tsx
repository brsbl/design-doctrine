import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  definePluginApp,
  useBbNavigate,
  useRealtime,
  useRpc,
} from "@bb/plugin-sdk/app";

import type { DoctrineRule, LibraryPayload, rpcContract } from "./server";
import "./library.css";

type StatusFilter = "active" | "all" | "inactive";

function rulePath(id: string): string {
  return `rule/${encodeURIComponent(id)}`;
}

function ruleIdFromPath(path: string): string | null {
  if (!path.startsWith("rule/")) return null;
  try {
    return decodeURIComponent(path.slice(5)) || null;
  } catch {
    return null;
  }
}

function searchableText(rule: DoctrineRule): string {
  return [
    rule.id,
    rule.title,
    rule.statement,
    rule.why,
    rule.kind,
    rule.strength,
    rule.confidence,
    rule.domain,
    ...rule.products,
    ...rule.activities,
    ...rule.artifacts,
    ...rule.surfaces,
    ...rule.prefer,
    ...rule.avoid,
    ...rule.use_when,
    ...rule.not_when,
    ...rule.exceptions,
    ...rule.evidence,
    ...rule.checks,
  ]
    .join("\n")
    .toLocaleLowerCase();
}

function RuleCard({ rule, onOpen }: { rule: DoctrineRule; onOpen: () => void }) {
  return (
    <article className="dd-card">
      <button type="button" className="dd-card__button" onClick={onOpen}>
        <span className="dd-card__domain">{rule.domain}</span>
        <h2>{rule.title}</h2>
        <p>{rule.statement}</p>
        <span className="dd-card__meta">
          {rule.strength} · {rule.confidence} confidence
          {rule.status === "active" ? "" : ` · ${rule.status}`}
        </span>
      </button>
    </article>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function RuleInspector({
  rule,
  requestedId,
  onClose,
}: {
  rule: DoctrineRule | null;
  requestedId: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!requestedId) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, requestedId]);

  if (!requestedId) return null;

  return (
    <div className="dd-overlay" role="presentation" onMouseDown={onClose}>
      <article
        className="dd-inspector"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dd-inspector-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="dd-icon-button dd-inspector__close"
          aria-label="Close rule"
          title="Close"
          onClick={onClose}
        >
          ×
        </button>
        {rule ? (
          <div className="dd-inspector__scroll">
            <header>
              <span className="dd-card__domain">{rule.domain}</span>
              <h2 id="dd-inspector-title">{rule.title}</h2>
              <p className="dd-statement">{rule.statement}</p>
              {rule.status !== "active" ? (
                <p className="dd-status-note">
                  {rule.status === "conflicted"
                    ? "This rule is paused because explicit preferences conflict."
                    : "This rule is kept for history and no longer guides work."}
                </p>
              ) : null}
            </header>

            <section>
              <h3>Why</h3>
              <p>{rule.why}</p>
            </section>

            <div className="dd-inspector__columns">
              <ListSection title="Prefer" items={rule.prefer} />
              <ListSection title="Avoid" items={rule.avoid} />
            </div>
            <div className="dd-inspector__columns">
              <ListSection title="Use when" items={rule.use_when} />
              <ListSection title="Do not use when" items={rule.not_when} />
            </div>

            <ListSection title="Exceptions" items={rule.exceptions} />
            <ListSection title="Evidence" items={rule.evidence} />
            <ListSection title="Check" items={rule.checks} />

            <dl className="dd-facts">
              <div><dt>ID</dt><dd>{rule.id}</dd></div>
              <div><dt>Kind</dt><dd>{rule.kind}</dd></div>
              <div><dt>Strength</dt><dd>{rule.strength}</dd></div>
              <div><dt>Confidence</dt><dd>{rule.confidence}</dd></div>
              <div><dt>Evidence</dt><dd>{rule.supporting_episodes} supporting · {rule.challenging_episodes} challenging</dd></div>
              <div><dt>Updated</dt><dd>{rule.updated}</dd></div>
              <div><dt>Source</dt><dd><code>{rule.canonical_path}</code></dd></div>
            </dl>
          </div>
        ) : (
          <div className="dd-inspector__missing">
            <h2 id="dd-inspector-title">Rule not found</h2>
            <p>{requestedId} is not in this doctrine.</p>
          </div>
        )}
      </article>
    </div>
  );
}

function DoctrineLibrary({ subPath }: { subPath: string }) {
  const rpc = useRpc<typeof rpcContract>();
  const navigate = useBbNavigate();
  const [library, setLibrary] = useState<LibraryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const openedFromLibrary = useRef(false);
  const requestedId = ruleIdFromPath(subPath);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLibrary(await rpc.call("getLibrary"));
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  }, [rpc]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtime("rules-changed", () => {
    void load();
  });

  const results = useMemo(() => {
    if (!library) return [];
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return library.rules.filter((rule) => {
      if (domain !== "all" && !rule.domain.startsWith(`${domain}.`)) return false;
      if (status === "active" && rule.status !== "active") return false;
      if (status === "inactive" && rule.status === "active") return false;
      if (!terms.length) return true;
      const text = searchableText(rule);
      return terms.every((term) => text.includes(term));
    });
  }, [domain, library, query, status]);

  const closeInspector = useCallback(() => {
    if (openedFromLibrary.current) {
      openedFromLibrary.current = false;
      window.history.back();
      return;
    }
    navigate.toPluginPanel("library", { subPath: "", replace: true });
  }, [navigate]);

  const selectedRule = library?.rules.find((rule) => rule.id === requestedId) ?? null;

  return (
    <main className="dd-library">
      <section className="dd-toolbar" aria-label="Filter design doctrine">
        <input
          type="search"
          aria-label="Search doctrine"
          placeholder="Search rules…"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <select aria-label="Domain" value={domain} onChange={(event) => setDomain(event.currentTarget.value)}>
          <option value="all">All domains</option>
          {library?.domains.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(event) => setStatus(event.currentTarget.value as StatusFilter)}>
          <option value="active">Current</option>
          <option value="all">All</option>
          <option value="inactive">Conflicted or retired</option>
        </select>
        <button
          type="button"
          className="dd-icon-button"
          title="Refresh"
          aria-label="Refresh doctrine"
          disabled={loading}
          onClick={() => void load()}
        >
          ↻
        </button>
        <span className="dd-count" role="status">{results.length} {results.length === 1 ? "rule" : "rules"}</span>
      </section>

      {error ? (
        <div className="dd-empty"><strong>Could not load doctrine</strong><p>{error}</p><button type="button" onClick={() => void load()}>Retry</button></div>
      ) : loading && !library ? (
        <div className="dd-empty">Loading…</div>
      ) : results.length ? (
        <section className="dd-grid" aria-label="Design doctrine rules">
          {results.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onOpen={() => {
                openedFromLibrary.current = true;
                navigate.toPluginPanel("library", { subPath: rulePath(rule.id) });
              }}
            />
          ))}
        </section>
      ) : (
        <div className="dd-empty"><strong>No rules found</strong><p>Try a different search or filter.</p></div>
      )}

      <RuleInspector rule={selectedRule} requestedId={requestedId} onClose={closeInspector} />
    </main>
  );
}

export default definePluginApp((app) => {
  app.slots.navPanel({
    id: "library",
    title: "Design Doctrine",
    icon: "Explore",
    path: "library",
    component: DoctrineLibrary,
  });
});
