// bb-plugin-runtime-shim:react
var runtime = globalThis.__bbPluginRuntime;
if (runtime == null || runtime.react == null) {
  throw new Error('Cannot load "react": this bundle must be loaded by the BB app, which provides the shared plugin runtime (globalThis.__bbPluginRuntime).');
}
var mod = runtime.react;
var {
  Activity,
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  act,
  cache,
  cacheSignal,
  captureOwnerStack,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  unstable_useCacheRefresh,
  use,
  useActionState,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version
} = mod;

// bb-plugin-runtime-shim:@bb/plugin-sdk/app
var runtime2 = globalThis.__bbPluginRuntime;
if (runtime2 == null || runtime2.pluginSdkApp == null) {
  throw new Error('Cannot load "@bb/plugin-sdk/app": this bundle must be loaded by the BB app, which provides the shared plugin runtime (globalThis.__bbPluginRuntime).');
}
var mod2 = runtime2.pluginSdkApp;
var {
  definePluginApp,
  useBbContext,
  useBbNavigate,
  useComposer,
  useRealtime,
  useRealtimeConnectionState,
  useRpc,
  useSettings
} = mod2;

// bb-plugin-runtime-shim:react/jsx-runtime
var runtime3 = globalThis.__bbPluginRuntime;
if (runtime3 == null || runtime3.jsxRuntime == null) {
  throw new Error('Cannot load "react/jsx-runtime": this bundle must be loaded by the BB app, which provides the shared plugin runtime (globalThis.__bbPluginRuntime).');
}
var mod3 = runtime3.jsxRuntime;
var {
  Fragment: Fragment2,
  jsx,
  jsxs
} = mod3;

// app.tsx
function rulePath(id) {
  return `rule/${encodeURIComponent(id)}`;
}
function ruleIdFromPath(path) {
  if (!path.startsWith("rule/")) return null;
  try {
    return decodeURIComponent(path.slice(5)) || null;
  } catch {
    return null;
  }
}
function searchableText(rule) {
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
    ...rule.checks
  ].join("\n").toLocaleLowerCase();
}
function RuleCard({ rule, onOpen }) {
  return /* @__PURE__ */ jsx("article", { className: "dd-card", children: /* @__PURE__ */ jsxs("button", { type: "button", className: "dd-card__button", onClick: onOpen, children: [
    /* @__PURE__ */ jsx("span", { className: "dd-card__domain", children: rule.domain }),
    /* @__PURE__ */ jsx("h2", { children: rule.title }),
    /* @__PURE__ */ jsx("p", { children: rule.statement }),
    /* @__PURE__ */ jsxs("span", { className: "dd-card__meta", children: [
      rule.strength,
      " \xB7 ",
      rule.confidence,
      " confidence",
      rule.status === "active" ? "" : ` \xB7 ${rule.status}`
    ] })
  ] }) });
}
function ListSection({ title, items }) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("h3", { children: title }),
    /* @__PURE__ */ jsx("ul", { children: items.map((item) => /* @__PURE__ */ jsx("li", { children: item }, item)) })
  ] });
}
function RuleInspector({
  rule,
  requestedId,
  onClose
}) {
  useEffect(() => {
    if (!requestedId) return;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, requestedId]);
  if (!requestedId) return null;
  return /* @__PURE__ */ jsx("div", { className: "dd-overlay", role: "presentation", onMouseDown: onClose, children: /* @__PURE__ */ jsxs(
    "article",
    {
      className: "dd-inspector",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dd-inspector-title",
      onMouseDown: (event) => event.stopPropagation(),
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "dd-icon-button dd-inspector__close",
            "aria-label": "Close rule",
            title: "Close",
            onClick: onClose,
            children: "\xD7"
          }
        ),
        rule ? /* @__PURE__ */ jsxs("div", { className: "dd-inspector__scroll", children: [
          /* @__PURE__ */ jsxs("header", { children: [
            /* @__PURE__ */ jsx("span", { className: "dd-card__domain", children: rule.domain }),
            /* @__PURE__ */ jsx("h2", { id: "dd-inspector-title", children: rule.title }),
            /* @__PURE__ */ jsx("p", { className: "dd-statement", children: rule.statement }),
            rule.status !== "active" ? /* @__PURE__ */ jsx("p", { className: "dd-status-note", children: rule.status === "conflicted" ? "This rule is paused because explicit preferences conflict." : "This rule is kept for history and no longer guides work." }) : null
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h3", { children: "Why" }),
            /* @__PURE__ */ jsx("p", { children: rule.why })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dd-inspector__columns", children: [
            /* @__PURE__ */ jsx(ListSection, { title: "Prefer", items: rule.prefer }),
            /* @__PURE__ */ jsx(ListSection, { title: "Avoid", items: rule.avoid })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dd-inspector__columns", children: [
            /* @__PURE__ */ jsx(ListSection, { title: "Use when", items: rule.use_when }),
            /* @__PURE__ */ jsx(ListSection, { title: "Do not use when", items: rule.not_when })
          ] }),
          /* @__PURE__ */ jsx(ListSection, { title: "Exceptions", items: rule.exceptions }),
          /* @__PURE__ */ jsx(ListSection, { title: "Evidence", items: rule.evidence }),
          /* @__PURE__ */ jsx(ListSection, { title: "Check", items: rule.checks }),
          /* @__PURE__ */ jsxs("dl", { className: "dd-facts", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "ID" }),
              /* @__PURE__ */ jsx("dd", { children: rule.id })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Kind" }),
              /* @__PURE__ */ jsx("dd", { children: rule.kind })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Strength" }),
              /* @__PURE__ */ jsx("dd", { children: rule.strength })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Confidence" }),
              /* @__PURE__ */ jsx("dd", { children: rule.confidence })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Evidence" }),
              /* @__PURE__ */ jsxs("dd", { children: [
                rule.supporting_episodes,
                " supporting \xB7 ",
                rule.challenging_episodes,
                " challenging"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Updated" }),
              /* @__PURE__ */ jsx("dd", { children: rule.updated })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Source" }),
              /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("code", { children: rule.canonical_path }) })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "dd-inspector__missing", children: [
          /* @__PURE__ */ jsx("h2", { id: "dd-inspector-title", children: "Rule not found" }),
          /* @__PURE__ */ jsxs("p", { children: [
            requestedId,
            " is not in this doctrine."
          ] })
        ] })
      ]
    }
  ) });
}
function DoctrineLibrary({ subPath }) {
  const rpc = useRpc();
  const navigate = useBbNavigate();
  const [library, setLibrary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState("active");
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
  return /* @__PURE__ */ jsxs("main", { className: "dd-library", children: [
    /* @__PURE__ */ jsxs("section", { className: "dd-toolbar", "aria-label": "Filter design doctrine", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "search",
          "aria-label": "Search doctrine",
          placeholder: "Search rules\u2026",
          value: query,
          onChange: (event) => setQuery(event.currentTarget.value)
        }
      ),
      /* @__PURE__ */ jsxs("select", { "aria-label": "Domain", value: domain, onChange: (event) => setDomain(event.currentTarget.value), children: [
        /* @__PURE__ */ jsx("option", { value: "all", children: "All domains" }),
        library?.domains.map((item) => /* @__PURE__ */ jsx("option", { value: item, children: item }, item))
      ] }),
      /* @__PURE__ */ jsxs("select", { "aria-label": "Status", value: status, onChange: (event) => setStatus(event.currentTarget.value), children: [
        /* @__PURE__ */ jsx("option", { value: "active", children: "Current" }),
        /* @__PURE__ */ jsx("option", { value: "all", children: "All" }),
        /* @__PURE__ */ jsx("option", { value: "inactive", children: "Conflicted or retired" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "dd-icon-button",
          title: "Refresh",
          "aria-label": "Refresh doctrine",
          disabled: loading,
          onClick: () => void load(),
          children: "\u21BB"
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "dd-count", role: "status", children: [
        results.length,
        " ",
        results.length === 1 ? "rule" : "rules"
      ] })
    ] }),
    error ? /* @__PURE__ */ jsxs("div", { className: "dd-empty", children: [
      /* @__PURE__ */ jsx("strong", { children: "Could not load doctrine" }),
      /* @__PURE__ */ jsx("p", { children: error }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void load(), children: "Retry" })
    ] }) : loading && !library ? /* @__PURE__ */ jsx("div", { className: "dd-empty", children: "Loading\u2026" }) : results.length ? /* @__PURE__ */ jsx("section", { className: "dd-grid", "aria-label": "Design doctrine rules", children: results.map((rule) => /* @__PURE__ */ jsx(
      RuleCard,
      {
        rule,
        onOpen: () => {
          openedFromLibrary.current = true;
          navigate.toPluginPanel("library", { subPath: rulePath(rule.id) });
        }
      },
      rule.id
    )) }) : /* @__PURE__ */ jsxs("div", { className: "dd-empty", children: [
      /* @__PURE__ */ jsx("strong", { children: "No rules found" }),
      /* @__PURE__ */ jsx("p", { children: "Try a different search or filter." })
    ] }),
    /* @__PURE__ */ jsx(RuleInspector, { rule: selectedRule, requestedId, onClose: closeInspector })
  ] });
}
var app_default = definePluginApp((app) => {
  app.slots.navPanel({
    id: "library",
    title: "Design Doctrine",
    icon: "Explore",
    path: "library",
    component: DoctrineLibrary
  });
});
export {
  app_default as default
};
