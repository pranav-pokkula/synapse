"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  FileCode2,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Menu,
  Minus,
  Moon,
  Network,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { rankConcepts } from "@/lib/ranking";
import { Architecture } from "./architecture";
import { Player } from "./player";
import { emptyProgress, makeLesson, mastery, questions } from "@/lib/learning";
import type {
  Citation,
  Concept,
  Level,
  Progress,
  Snapshot,
  TutorAnswer,
} from "@/lib/types";

type View = "overview" | "map" | "path" | "lesson" | "practice" | "progress";
type Session = {
  storage: string;
  ai: boolean;
  auth: boolean;
  user: { email?: string; anonymous: boolean };
  projects: { id: string; owner: string; repo: string; sha: string }[];
};
type Job = {
  id: string;
  status: string;
  total: number;
  processed: number;
  sha: string;
  error?: string;
  snapshotId?: string;
};
type Feedback = {
  score: number;
  correct?: boolean;
  correctAnswer?: number;
  explanation: string;
  progress?: Progress;
  ungraded?: boolean;
  note?: string;
  checks?: { criterion: string; met: boolean }[];
};
async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(
    url,
    body === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      "The server returned an unreadable response. Please retry.",
    );
  }
  if (!res.ok) throw new Error(data.error ?? "Request failed. Please retry.");
  return data as T;
}
function localKey(id: string) {
  return `synapse-progress-v1:${id}`;
}
function saveBrowser(id: string, progress: Progress) {
  try {
    localStorage.setItem(localKey(id), JSON.stringify(progress));
  } catch {
    /* Cloud/local server remains the primary persistence path. */
  }
}

export function Studio({ sample }: { sample: Snapshot }) {
  const [snapshot, setSnapshot] = useState(sample),
    [view, setView] = useState<View>("overview"),
    [selected, setSelected] = useState(sample.concepts[0]?.id ?? ""),
    [progress, setProgress] = useState<Progress>(emptyProgress),
    [session, setSession] = useState<Session | null>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [dark, setDark] = useState(false),
    [mobileNav, setMobileNav] = useState(false),
    [connect, setConnect] = useState(false),
    [settings, setSettings] = useState(false),
    [source, setSource] = useState<Citation | null>(null),
    [search, setSearch] = useState(""),
    [url, setUrl] = useState(""),
    [job, setJob] = useState<Job | null>(null),
    [importError, setImportError] = useState(""),
    [importing, setImporting] = useState(false),
    [email, setEmail] = useState(""),
    [authMessage, setAuthMessage] = useState(""),
    [deleteConfirm, setDeleteConfirm] = useState(false);
  const mounted = useRef(false);
  const concept =
    snapshot.concepts.find((c) => c.id === selected) ?? snapshot.concepts[0];
  const level = progress.level;
  const mastered = snapshot.concepts.filter(
    (c) => mastery(progress, c.id) >= 100,
  ).length;
  const overall = Math.round(
    snapshot.concepts.reduce((sum, c) => sum + mastery(progress, c.id), 0) /
      Math.max(1, snapshot.concepts.length),
  );
  const learningPath = rankConcepts(
    snapshot.concepts,
    Object.fromEntries(
      snapshot.concepts.map((c) => [
        c.id,
        progress.attempts.some((a) => a.conceptId === c.id)
          ? 1 - mastery(progress, c.id) / 100
          : 0,
      ]),
    ),
  );
  const nextConcept =
    learningPath.find((c) => mastery(progress, c.id) < 100) ?? concept;
  const refreshSession = useCallback(async () => {
    try {
      setSession(await api<Session>("/api/session"));
    } catch (e) {
      setNotice((e as Error).message);
    }
  }, []);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    // Browser preferences are an external store; apply them after hydration.
    const restore = async () => {
      await Promise.resolve();
      const theme = localStorage.getItem("synapse-theme");
      if (theme === "dark") {
        setDark(true);
        document.documentElement.dataset.theme = "dark";
      }
      const params = new URLSearchParams(location.search);
      if (params.has("connect")) {
        setConnect(true);
        params.delete("connect");
        const query = params.toString();
        window.history.replaceState(
          window.history.state,
          "",
          `${location.pathname}${query ? "?" + query : ""}${location.hash}`,
        );
      }
      if (params.has("authError"))
        setNotice(
          "That sign-in link expired or was already used. Request a new link in settings.",
        );
      await refreshSession();
      const remembered = localStorage.getItem("synapse-project");
      if (remembered && remembered !== "sample") {
        api<Snapshot>(`/api/project/${remembered}`)
          .then((s) => {
            setSnapshot(s);
            setSelected(s.concepts[0]?.id ?? "");
          })
          .catch(() => localStorage.removeItem("synapse-project"));
      }
      const pending = localStorage.getItem("synapse-import");
      if (pending)
        api<Job>(`/api/import/${pending}`)
          .then((j) => {
            if (j.status !== "complete") {
              setJob(j);
              setConnect(true);
            }
          })
          .catch(() => localStorage.removeItem("synapse-import"));
    };
    void restore();
  }, [refreshSession]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    api<Progress>(`/api/progress?projectId=${snapshot.id}`)
      .then((p) => {
        if (active) {
          setProgress(p);
          saveBrowser(snapshot.id, p);
        }
      })
      .catch(() => {
        if (active) {
          try {
            const saved = localStorage.getItem(localKey(snapshot.id));
            setProgress(saved ? JSON.parse(saved) : emptyProgress());
          } catch {
            setProgress(emptyProgress());
          }
        }
      });
    return () => {
      active = false;
    };
  }, [snapshot.id, session]);
  function navigate(next: View) {
    setView(next);
    setMobileNav(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function visit(c: Concept) {
    setSelected(c.id);
    navigate("lesson");
    const next = {
      ...progress,
      visited: [...new Set([...progress.visited, c.id])],
      updatedAt: new Date().toISOString(),
    };
    setProgress(next);
    saveBrowser(snapshot.id, next);
    try {
      await Promise.all([
        api("/api/progress", {
          projectId: snapshot.id,
          visited: [c.id],
          level,
        }),
        api("/api/lesson", { projectId: snapshot.id, conceptId: c.id, level }),
      ]);
    } catch {
      setNotice(
        "Progress is saved in this browser. Server sync is currently unavailable.",
      );
    }
  }
  async function changeLevel(value: Level) {
    const next = { ...progress, level: value };
    setProgress(next);
    saveBrowser(snapshot.id, next);
    try {
      await api("/api/progress", {
        projectId: snapshot.id,
        level: value,
        visited: [],
      });
    } catch {
      setNotice("Your explanation level is saved in this browser.");
    }
  }
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("synapse-theme", next ? "dark" : "light");
  }
  async function loadProject(id: string) {
    setNotice("");
    setBusy(true);
    setError("");
    try {
      const s =
        id === "sample" ? sample : await api<Snapshot>(`/api/project/${id}`);
      setSnapshot(s);
      setSelected(s.concepts[0]?.id ?? "");
      localStorage.setItem("synapse-project", id);
      navigate("overview");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function runImport(resume?: Job) {
    setImporting(true);
    setImportError("");
    try {
      let current = resume ?? (await api<Job>("/api/import", { url }));
      setJob(current);
      localStorage.setItem("synapse-import", current.id);
      while (current.status !== "complete") {
        current = await api<Job>(`/api/import/${current.id}`, {});
        setJob(current);
        if (current.status === "failed")
          throw new Error(current.error ?? "Import paused. Retry to continue.");
      }
      await loadProject(current.snapshotId ?? current.id);
      localStorage.removeItem("synapse-import");
      setConnect(false);
      setJob(null);
      setUrl("");
      void refreshSession();
      setNotice(
        "Repository imported. Your lessons are pinned to this exact commit.",
      );
    } catch (e) {
      setImportError((e as Error).message);
    } finally {
      setImporting(false);
    }
  }
  function showFile(path: string) {
    const file = snapshot.files.find((f) => f.path === path);
    if (file)
      setSource({
        path,
        sha: snapshot.sha,
        start: 1,
        end: Math.min(file.content.split("\n").length, 100),
        quote: file.content.split("\n").slice(0, 100).join("\n"),
      });
  }
  const nav = [
    {
      id: "overview" as View,
      label: "Project overview",
      icon: LayoutDashboard,
    },
    { id: "map" as View, label: "Architecture", icon: Network },
    { id: "path" as View, label: "Learning journey", icon: BookOpen },
    { id: "practice" as View, label: "Practice lab", icon: GraduationCap },
    { id: "progress" as View, label: "Your progress", icon: TrendingUp },
  ];
  return (
    <div className="studio">
      <a className="skip-link" href="#studio-main">
        Skip to learning content
      </a>
      {mobileNav && (
        <button
          className="nav-backdrop"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <Link className="sidebar-brand" href="/">
          <Brand />
        </Link>
        <span className="workspace-label">YOUR LEARNING SPACE</span>
        <div className="project-picker">
          <span className="project-avatar">
            <Code2 size={21} />
          </span>
          <label>
            <span className="sr-only">Current project</span>
            <select
              aria-label="Current project"
              value={snapshot.id}
              onChange={(e) => void loadProject(e.target.value)}
            >
              <option value="sample">Fieldnotes · sample</option>
              {session?.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.owner}/{p.repo}
                </option>
              ))}
              {!snapshot.sample &&
                !session?.projects.some((p) => p.id === snapshot.id) && (
                  <option value={snapshot.id}>{snapshot.repo}</option>
                )}
            </select>
            <small>
              {snapshot.sample ? "Interactive sample" : "Public repository"}
            </small>
          </label>
          <ChevronDown size={14} />
        </div>
        <nav aria-label="Learning navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id || (view === "lesson" && n.id === "path") ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.id === "path" && (
                <span className="nav-count">{snapshot.concepts.length}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="connect-sidebar" onClick={() => setConnect(true)}>
          <Plus size={17} />
          Connect repository
        </button>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip">
          <span>
            <Lightbulb size={17} />A little every day.
          </span>
          <p>Understanding your own code is a skill worth building.</p>
          <div className="mini-progress">
            <i style={{ width: `${overall}%` }} />
          </div>
          <small>
            {mastered} of {snapshot.concepts.length} concepts practiced
          </small>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setSettings(true)}>
            <span className="user-avatar">
              {session?.user.email?.[0]?.toUpperCase() ?? "Y"}
            </span>
            <span>
              <strong>{session?.user.email ?? "Your learning space"}</strong>
              <small>
                {session?.storage === "cloud"
                  ? "Cloud progress"
                  : "Local progress"}
              </small>
            </span>
            <Settings2 size={17} />
          </button>
        </div>
      </aside>
      <div className="studio-body">
        <header className="studio-header">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{snapshot.repo}</strong>
          </div>
          <div className="header-actions">
            <span className="pill neutral">
              <GitBranch size={13} />
              {snapshot.sample ? "SAMPLE" : snapshot.branch}
            </span>
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={dark ? "Use light theme" : "Use dark theme"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-button"
              onClick={() => setSettings(true)}
              aria-label="Account and settings"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </header>
        <main id="studio-main" className="studio-main">
          {notice && (
            <div className="notice" role="status">
              <ShieldCheck size={16} />
              <span>{notice}</span>
              <button
                className="icon-button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notice"
              >
                <X size={15} />
              </button>
            </div>
          )}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          {busy ? (
            <div className="loading-state">
              <Loader2 className="spin" />
              Opening your project…
            </div>
          ) : (
            <>
              {view === "overview" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">YOUR CODE, CONNECTED.</div>
                      <h1>
                        Let’s make it <em>click.</em>
                      </h1>
                      <p>
                        Go beyond what your project does. Understand how it
                        works.
                      </p>
                    </div>
                    <button
                      className="button secondary"
                      onClick={() => setConnect(true)}
                    >
                      <Plus size={17} />
                      Connect repository
                    </button>
                  </div>
                  <div className="project-summary">
                    <div className="summary-main">
                      <span className="repository-icon">
                        <GitBranch size={25} />
                      </span>
                      <div>
                        <div className="repo-title">
                          <h2>
                            {snapshot.owner}
                            <span>/</span>
                            {snapshot.repo}
                          </h2>
                          <span className="pill neutral">
                            {snapshot.sample ? "Teaching fixture" : "Public"}
                          </span>
                        </div>
                        <p>
                          {snapshot.description ||
                            "Explore the implementation behind your project."}
                        </p>
                        <div className="repo-meta">
                          <span>
                            <i className="language-dot" />
                            JavaScript / TypeScript
                          </span>
                          <span>
                            <GitBranch size={13} />
                            {snapshot.sha.slice(0, 7)}
                          </span>
                          <span>
                            <ShieldCheck size={14} />
                            {snapshot.sample
                              ? "Content hash · not a Git commit"
                              : "Commit-pinned source"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="summary-stats">
                      <div>
                        <strong>{snapshot.files.length}</strong>
                        <span>files indexed</span>
                      </div>
                      <div>
                        <strong>{snapshot.concepts.length}</strong>
                        <span>key concepts</span>
                      </div>
                      <div>
                        <strong>{snapshot.edges.length}</strong>
                        <span>connections</span>
                      </div>
                    </div>
                  </div>
                  {snapshot.coverage.partial && (
                    <div className="notice">
                      <ShieldCheck size={17} />
                      <span>
                        Partial coverage: {snapshot.coverage.indexed} of{" "}
                        {snapshot.coverage.eligible} eligible files indexed (
                        {snapshot.coverage.total} files in the tree).
                        Conclusions apply only to this subset.
                      </span>
                    </div>
                  )}
                  <div className="overview-columns">
                    <div className="overview-primary">
                      <section className="section-block">
                        <div className="section-heading">
                          <div>
                            <h2>The bigger picture</h2>
                            <p>Follow the connections. Find your way around.</p>
                          </div>
                          <button
                            className="text-button"
                            onClick={() => navigate("map")}
                          >
                            Explore map
                            <ChevronRight size={15} />
                          </button>
                        </div>
                        <Architecture snapshot={snapshot} onSource={showFile} />
                      </section>
                      <section className="section-block">
                        <div className="section-heading">
                          <div>
                            <h2>Your learning journey</h2>
                            <p>
                              The foundations first. Then the things that matter
                              most.
                            </p>
                          </div>
                          <button
                            className="text-button"
                            onClick={() => navigate("path")}
                          >
                            View all
                            <ChevronRight size={15} />
                          </button>
                        </div>
                        <div className="concept-list">
                          {learningPath.slice(0, 4).map((c, i) => (
                            <ConceptRow
                              key={c.id}
                              concept={c}
                              index={i}
                              score={mastery(progress, c.id)}
                              onClick={() => void visit(c)}
                            />
                          ))}
                        </div>
                      </section>
                    </div>
                    <aside className="overview-rail">
                      <div className="next-lesson">
                        <div className="eyebrow">
                          <Sparkles size={14} />
                          YOUR NEXT LIGHTBULB MOMENT
                        </div>
                        <div className="lesson-orbit" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                          <Lightbulb size={32} />
                        </div>
                        <span className="pill light">START HERE</span>
                        <h2>{nextConcept.title}</h2>
                        <p>{nextConcept.objective}</p>
                        <div className="lesson-meta">
                          <span>
                            <Clock size={14} />
                            {nextConcept.minutes} min
                          </span>
                          <span>
                            {nextConcept.difficulty === 1
                              ? "Foundational"
                              : "Core concept"}
                          </span>
                        </div>
                        <button
                          className="button mint-button"
                          onClick={() => void visit(nextConcept)}
                        >
                          <BookOpen size={17} />
                          Start learning
                        </button>
                      </div>
                      <div className="progress-panel">
                        <div className="section-heading">
                          <h3>Small steps. Real progress.</h3>
                          <Target size={19} />
                        </div>
                        <div className="progress-total">
                          <strong>
                            {overall}
                            <span>%</span>
                          </strong>
                          <span>estimated mastery</span>
                        </div>
                        <div className="progress-track">
                          <i style={{ width: `${overall}%` }} />
                        </div>
                        <p>
                          {progress.attempts.length
                            ? "Keep connecting the ideas. Your latest practice answers shape this estimate."
                            : "Your journey starts with one concept. Take a lesson, then test your understanding."}
                        </p>
                        <button
                          className="text-button"
                          onClick={() => navigate("progress")}
                        >
                          See your progress
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      <div className="evidence-note">
                        <ShieldCheck size={20} />
                        <div>
                          <strong>Grounded in your source</strong>
                          <p>
                            {snapshot.sample
                              ? "This sample is an embedded teaching fixture. No live AI operation is being simulated."
                              : "Every citation is checked against your indexed snapshot. Templates are labeled; live AI requires a configured provider."}
                          </p>
                        </div>
                      </div>
                    </aside>
                  </div>
                </>
              )}
              {view === "map" && (
                <>
                  <PageHeading
                    eyebrow="CONNECT THE DOTS"
                    title="Your project, mapped."
                    subtitle="Click a module to highlight its connections and inspect the actual source."
                  />
                  <Architecture snapshot={snapshot} onSource={showFile} large />
                  <div className="map-bottom">
                    <section>
                      <h2>What the source tells us</h2>
                      <p>
                        These connections come from imports resolved within the
                        indexed files. Unresolved aliases, external packages,
                        and runtime behavior may not appear.
                      </p>
                      <div className="tag-list">
                        {snapshot.frameworks.map((f) => (
                          <span className="pill neutral" key={f}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h2>Knowledge map</h2>
                      <div className="prerequisite-list">
                        {snapshot.concepts.map((c) => (
                          <button key={c.id} onClick={() => void visit(c)}>
                            <strong>{c.title}</strong>
                            <small>
                              {c.prerequisites.length
                                ? "Builds on " +
                                  c.prerequisites
                                    .map(
                                      (p) =>
                                        snapshot.concepts.find(
                                          (x) => x.id === p,
                                        )?.title,
                                    )
                                    .join(", ")
                                : "Foundation · start here"}
                            </small>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}
              {view === "path" && (
                <>
                  <PageHeading
                    eyebrow="LEARN WHAT MATTERS"
                    title="Your learning journey."
                    subtitle="A practical order based on source evidence, prerequisites, and architectural importance."
                  />
                  <div className="path-toolbar">
                    <label className="search-field">
                      <Search size={17} />
                      <input
                        aria-label="Search concepts"
                        placeholder="Find a concept…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <LevelSelect value={level} onChange={changeLevel} />
                  </div>
                  <div className="path-list">
                    {learningPath
                      .filter((c) =>
                        (c.title + " " + c.objective)
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((c, i) => (
                        <div className="path-item" key={c.id}>
                          <ConceptRow
                            concept={c}
                            index={i}
                            score={mastery(progress, c.id)}
                            onClick={() => void visit(c)}
                          />
                          <div className="path-details">
                            <p>{c.why}</p>
                            <span>
                              {c.prerequisites.length
                                ? `Prerequisites: ${c.prerequisites.join(", ")}`
                                : "No prerequisites"}{" "}
                              · {c.evidence.length} source references
                            </span>
                          </div>
                        </div>
                      ))}
                    {!snapshot.concepts.some((c) =>
                      (c.title + " " + c.objective)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    ) && (
                      <div className="empty-state">
                        <Search />
                        <h3>No matching concepts</h3>
                        <p>Try a broader search, or clear the filter.</p>
                        <button
                          className="button secondary"
                          onClick={() => setSearch("")}
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="fine-print">
                    Ranking prioritizes prerequisites, architectural importance,
                    and security relevance. Practice highlights your remaining
                    gaps; it is not an exact mathematical 80/20 distribution.
                  </p>
                </>
              )}
              {view === "lesson" && (
                <LessonWorkspace
                  key={`${snapshot.id}-${concept.id}-${level}`}
                  snapshot={snapshot}
                  concept={concept}
                  level={level}
                  onLevel={changeLevel}
                  onSource={setSource}
                  onPractice={() => navigate("practice")}
                  onBack={() => navigate("path")}
                  ai={session?.ai ?? false}
                />
              )}
              {view === "practice" && (
                <>
                  <PageHeading
                    eyebrow="TURN FAMILIARITY INTO UNDERSTANDING"
                    title="Make the knowledge yours."
                    subtitle="Explain what the code proves, spot its limits, and get immediate feedback."
                  />
                  <div className="path-toolbar">
                    <label className="select-field">
                      Practice concept
                      <select
                        value={concept.id}
                        onChange={(e) => setSelected(e.target.value)}
                      >
                        {snapshot.concepts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="button secondary"
                      onClick={() => void visit(concept)}
                    >
                      <BookOpen size={16} />
                      Review the lesson
                    </button>
                  </div>
                  <Assessment
                    key={`${snapshot.id}-${concept.id}`}
                    snapshot={snapshot}
                    concept={concept}
                    progress={progress}
                    onProgress={(p) => {
                      setProgress(p);
                      saveBrowser(snapshot.id, p);
                    }}
                    onSource={setSource}
                  />
                </>
              )}
              {view === "progress" && (
                <>
                  <PageHeading
                    eyebrow="LOOK HOW FAR YOU’RE GOING"
                    title="Understanding, in progress."
                    subtitle="A transparent picture of your practice. Keep the momentum, one concept at a time."
                  />
                  <div className="progress-metrics">
                    <div>
                      <BookOpen />
                      <strong>{progress.visited.length}</strong>
                      <span>lessons explored</span>
                    </div>
                    <div>
                      <CheckCircle2 />
                      <strong>{progress.attempts.length}</strong>
                      <span>practice attempts</span>
                    </div>
                    <div>
                      <Target />
                      <strong>{overall}%</strong>
                      <span>estimated mastery</span>
                    </div>
                  </div>
                  <section className="section-block">
                    <div className="section-heading">
                      <h2>Your concept confidence</h2>
                      <span className="muted">Based on latest answers</span>
                    </div>
                    {snapshot.concepts.map((c) => (
                      <button
                        className="confidence-row"
                        key={c.id}
                        onClick={() => void visit(c)}
                      >
                        <span>{c.title}</span>
                        <div className="progress-track">
                          <i style={{ width: `${mastery(progress, c.id)}%` }} />
                        </div>
                        <strong>{mastery(progress, c.id)}%</strong>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </section>
                  <div className="progress-explainer">
                    <ShieldCheck />
                    <div>
                      <h3>An estimate, not a label.</h3>
                      <p>
                        Each concept has two scored checks. Your latest answer
                        to each contributes up to 50 percentage points;
                        repeating one question cannot inflate the estimate.
                        Short answers receive practice feedback but do not
                        change mastery. This is a learning aid, not a validated
                        measure of ability.
                      </p>
                      <p>
                        {session?.storage === "cloud"
                          ? "Progress is stored in your Supabase session."
                          : "Progress is stored on this local server and mirrored in this browser. It is not cross-device cloud sync."}
                      </p>
                    </div>
                  </div>
                  {progress.attempts.length > 0 && (
                    <section className="section-block">
                      <h2>Recent practice</h2>
                      <div className="activity-list">
                        {progress.attempts
                          .slice(-6)
                          .reverse()
                          .map((a) => (
                            <div key={a.id}>
                              {a.correct ? (
                                <CheckCircle2 size={17} />
                              ) : (
                                <Lightbulb size={17} />
                              )}
                              <span>
                                {
                                  snapshot.concepts.find(
                                    (c) => c.id === a.conceptId,
                                  )?.title
                                }
                                <small>
                                  {a.correct
                                    ? "Correct · understanding reinforced"
                                    : "Review recommended · another chance to learn"}
                                </small>
                              </span>
                              <time>{new Date(a.at).toLocaleDateString()}</time>
                            </div>
                          ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}
          <footer className="studio-footer">
            <span>
              <Brand compact />
              Build knowledge from what you build.
            </span>
            <span>
              {snapshot.sample
                ? "Interactive sample · source templates"
                : "Source templates"}{" "}
              ·{" "}
              {session?.ai ? "Live tutor available" : "Live AI not configured"}
            </span>
          </footer>
        </main>
      </div>
      <Modal
        open={connect}
        onOpenChange={(v) => {
          if (!importing) setConnect(v);
        }}
        title="Your code is the starting point."
        description="Connect a public GitHub repository to build a learning journey from its actual source."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runImport();
          }}
        >
          <label className="field-label" htmlFor="repo-url">
            Public repository URL
          </label>
          <div className="repo-input">
            <GitBranch size={18} />
            <input
              id="repo-url"
              type="url"
              required
              maxLength={240}
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={importing}
            />
          </div>
          <p className="input-hint">
            JavaScript and TypeScript · up to 48 files / 1 MB indexed ·
            repository under 150 MB. Code is never executed.
          </p>
          {job && (
            <div className="import-progress" role="status">
              <div>
                <strong>
                  {job.status === "failed"
                    ? "Import paused"
                    : job.status === "complete"
                      ? "Analysis complete"
                      : "Reading your source"}
                </strong>
                <span>
                  {job.processed} / {job.total} files
                </span>
              </div>
              <div className="progress-track">
                <i
                  style={{
                    width: `${job.total ? (job.processed / job.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <small>
                Snapshot {job.sha.slice(0, 12)} · progress saved between batches
              </small>
            </div>
          )}
          {importError && (
            <div className="error-message" role="alert">
              {importError}
            </div>
          )}
          <div className="modal-actions">
            {job && !importing && (
              <button
                type="button"
                className="button secondary"
                onClick={() => void runImport(job)}
              >
                Resume import
              </button>
            )}
            <button className="button primary" disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="spin" size={17} />
                  Importing…
                </>
              ) : (
                <>
                  <GitBranch size={17} />
                  Analyze repository
                </>
              )}
            </button>
          </div>
        </form>
        <div className="modal-sample">
          <span>Just looking around?</span>
          <button
            className="text-button"
            disabled={importing}
            onClick={() => {
              void loadProject("sample");
              setConnect(false);
            }}
          >
            Explore Fieldnotes
            <ChevronRight size={15} />
          </button>
        </div>
      </Modal>
      <Modal
        open={settings}
        onOpenChange={setSettings}
        title="Your learning space"
        description="Choose how you learn and where your progress lives."
      >
        <div className="settings-section">
          <h3>Explanation level</h3>
          <LevelSelect value={level} onChange={changeLevel} />
          <p>
            Change this at any time. Lessons adapt their depth, terminology, and
            trade-offs.
          </p>
        </div>
        <div className="settings-section">
          <h3>Account & persistence</h3>
          <p>
            {session?.storage === "cloud"
              ? "Cloud storage is connected. Email sign-in opens a separate account history; guest progress is not automatically migrated."
              : "You are using local learning storage. Cloud accounts require a separate Supabase project, which is not configured."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthMessage("");
              try {
                const r = await api<{ message: string }>("/api/account", {
                  action: "sign-in",
                  email,
                });
                setAuthMessage(r.message);
              } catch (e) {
                setAuthMessage((e as Error).message);
              }
            }}
          >
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <div className="inline-form">
              <input
                id="email"
                type="email"
                value={email}
                required
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="button secondary">Send sign-in link</button>
            </div>
            {authMessage && (
              <p role="status" className="inline-notice">
                {authMessage}
              </p>
            )}
          </form>
          {session && !session.user.anonymous && (
            <button
              className="text-button"
              onClick={async () => {
                await api("/api/account", { action: "sign-out" });
                location.reload();
              }}
            >
              Sign out
            </button>
          )}
        </div>
        <div className="settings-section">
          <h3>Data controls</h3>
          <p>
            Delete imported snapshots, lesson history, tutor history, and
            progress for this session. This cannot be undone.
          </p>
          {deleteConfirm ? (
            <div className="inline-form">
              <button
                className="button danger"
                onClick={async () => {
                  try {
                    await api("/api/account", { action: "delete-data" });
                    Object.keys(localStorage)
                      .filter((k) => k.startsWith("synapse-"))
                      .forEach((k) => localStorage.removeItem(k));
                    setProgress(emptyProgress());
                    setSnapshot(sample);
                    setSelected(sample.concepts[0].id);
                    setDeleteConfirm(false);
                    setSettings(false);
                    navigate("overview");
                    void refreshSession();
                    setNotice("Your learning data has been deleted.");
                  } catch (e) {
                    setAuthMessage((e as Error).message);
                  }
                }}
              >
                Confirm deletion
              </button>
              <button
                className="button secondary"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="button danger-outline"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 size={16} />
              Delete my learning data
            </button>
          )}
        </div>
      </Modal>
      <Modal
        open={Boolean(source)}
        onOpenChange={(v) => {
          if (!v) setSource(null);
        }}
        title={source?.path ?? "Source evidence"}
        description={`${snapshot.sample ? "Teaching fixture content hash" : "Commit"} ${snapshot.sha}`}
        wide
      >
        {source && (
          <>
            <div className="source-meta">
              <span className="pill mint">
                <ShieldCheck size={13} />
                Exact source excerpt
              </span>
              <span>
                Lines {source.start}–{source.end}
              </span>
              {!snapshot.sample && (
                <a
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://github.com/${snapshot.owner}/${snapshot.repo}/blob/${snapshot.sha}/${source.path.split("/").map(encodeURIComponent).join("/")}#L${source.start}-L${source.end}`}
                >
                  View on GitHub
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            <SourceCode citation={source} />
            <p className="fine-print">
              A matching excerpt verifies that the text exists. It does not
              independently prove that a claim about its behavior is correct.
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
function ConceptRow({
  concept,
  index,
  score,
  onClick,
}: {
  concept: Concept;
  index: number;
  score: number;
  onClick: () => void;
}) {
  return (
    <button className="concept-row" onClick={onClick}>
      <span className={`concept-number ${score >= 100 ? "complete" : ""}`}>
        {score >= 100 ? (
          <Check size={18} />
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>
      <span className="concept-info">
        <strong>{concept.title}</strong>
        <small>{concept.objective}</small>
      </span>
      <span className="concept-tags">
        <span className={`difficulty difficulty-${concept.difficulty}`}>
          {concept.difficulty === 1
            ? "Foundation"
            : concept.difficulty === 2
              ? "Core concept"
              : "Deep dive"}
        </span>
        <small>
          <Clock size={12} />
          {concept.minutes} min
        </small>
      </span>
      <ChevronRight size={17} />
    </button>
  );
}
function LevelSelect({
  value,
  onChange,
}: {
  value: Level;
  onChange: (value: Level) => void;
}) {
  return (
    <label className="level-select">
      <span>Explanation depth</span>
      <select value={value} onChange={(e) => onChange(e.target.value as Level)}>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
    </label>
  );
}
function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={`modal ${wide ? "wide" : ""}`}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          <Dialog.Close
            className="modal-close icon-button"
            aria-label="Close dialog"
          >
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function SourceCode({
  citation,
  highlight = false,
}: {
  citation: Citation;
  highlight?: boolean;
}) {
  return (
    <div className={`source-code ${highlight ? "highlighted" : ""}`}>
      <pre>
        {citation.quote.split("\n").map((line, i) => (
          <span className="code-line" key={i}>
            <span className="line-number" aria-hidden="true">
              {citation.start + i}
            </span>
            <code>{line || " "}</code>
          </span>
        ))}
      </pre>
    </div>
  );
}
function LessonWorkspace({
  snapshot,
  concept,
  level,
  onLevel,
  onSource,
  onPractice,
  onBack,
  ai,
}: {
  snapshot: Snapshot;
  concept: Concept;
  level: Level;
  onLevel: (v: Level) => void;
  onSource: (c: Citation) => void;
  onPractice: () => void;
  onBack: () => void;
  ai: boolean;
}) {
  const lesson = makeLesson(snapshot, concept, level);
  const [step, setStep] = useState(0);
  const onStep = useCallback((i: number) => setStep(i), []);
  return (
    <>
      <button className="back-link" onClick={onBack}>
        Learning journey
        <ChevronRight size={14} />
        {concept.title}
      </button>
      <div className="lesson-heading">
        <div>
          <span className="eyebrow">
            {lesson.mode === "reviewed-sample"
              ? "TEACHING FIXTURE"
              : "SOURCE-GROUNDED TEMPLATE"}{" "}
            · {concept.minutes} MIN
          </span>
          <h1>{concept.title}</h1>
          <p>{concept.objective}</p>
        </div>
        <LevelSelect value={level} onChange={onLevel} />
      </div>
      <div className="lesson-grid">
        <div className="lesson-main">
          <Player lesson={lesson} onStep={onStep} />
          <article className="written-lesson">
            <span className="eyebrow">THE IDEA</span>
            <h2>Let’s break it down.</h2>
            <p className="lesson-summary">{lesson.summary}</p>
            <div className="analogy">
              <Lightbulb size={23} />
              <div>
                <h3>Think of it this way</h3>
                <p>{lesson.analogy}</p>
              </div>
            </div>
            <h3>In your project</h3>
            <p>{lesson.details[1]}</p>
            {lesson.citations[0] && (
              <div className="inline-source">
                <button
                  className="source-title"
                  onClick={() => onSource(lesson.citations[0])}
                >
                  <FileCode2 size={15} />
                  <span>{lesson.citations[0].path}</span>
                  <span>
                    L{lesson.citations[0].start}–{lesson.citations[0].end}
                  </span>
                  <ExternalLink size={13} />
                </button>
                <SourceCode
                  citation={lesson.citations[0]}
                  highlight={step === 1}
                />
              </div>
            )}
            <div className="tradeoff">
              <ShieldCheck size={18} />
              <div>
                <h3>What the evidence doesn’t prove</h3>
                {lesson.tradeoffs.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
            <div className="lesson-finish">
              <div>
                <h3>Does it click?</h3>
                <p>
                  Put the idea into your own words, then check your
                  understanding.
                </p>
              </div>
              <button className="button primary" onClick={onPractice}>
                <GraduationCap size={17} />
                Practice this concept
              </button>
            </div>
          </article>
        </div>
        <aside className="lesson-rail">
          <Tutor
            key={`${concept.id}-${level}`}
            snapshot={snapshot}
            concept={concept}
            level={level}
            ai={ai}
            onSource={onSource}
          />
          <section className="source-references">
            <h3>
              <ShieldCheck size={17} />
              Your source trail
            </h3>
            {lesson.citations.map((c, i) => (
              <button key={i} onClick={() => onSource(c)}>
                <FileCode2 size={16} />
                <span>
                  {c.path}
                  <small>
                    Lines {c.start}–{c.end} · {c.sha.slice(0, 7)}
                  </small>
                </span>
                <ExternalLink size={13} />
              </button>
            ))}
            <p>
              {snapshot.sample
                ? "Embedded fixture · content hash"
                : "Pinned GitHub commit"}{" "}
              · cited text validated
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
function Tutor({
  snapshot,
  concept,
  level,
  ai,
  onSource,
}: {
  snapshot: Snapshot;
  concept: Concept;
  level: Level;
  ai: boolean;
  onSource: (c: Citation) => void;
}) {
  const [input, setInput] = useState(""),
    [messages, setMessages] = useState<
      { question: string; answer: TutorAnswer }[]
    >([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  async function ask(question: string) {
    setBusy(true);
    setError("");
    setInput("");
    try {
      const history = messages.slice(-2).flatMap((m) => [
        { role: "user", content: m.question },
        { role: "assistant", content: m.answer.answer },
      ]);
      const answer = await api<TutorAnswer>("/api/tutor", {
        projectId: snapshot.id,
        conceptId: concept.id,
        question,
        level,
        history,
      });
      setMessages((m) => [...m, { question, answer }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  return (
    <section className="tutor">
      <header>
        <span className="tutor-icon">
          <Sparkles size={19} />
        </span>
        <div>
          <h3>{ai ? "Your AI tutor" : "Your source guide"}</h3>
          <small>
            {ai
              ? "Grounded in this project"
              : "Template mode · live AI unavailable"}
          </small>
        </div>
      </header>
      <div className="tutor-messages" aria-live="polite">
        <div className="tutor-welcome">
          <p>A little context goes a long way.</p>
          <span>
            {ai
              ? "Ask about this concept. I’ll connect the explanation to the indexed source."
              : "Explore a source location, an analogy, or a failure consideration. These answers use checked templates."}
          </span>
        </div>
        {messages.map((m, i) => (
          <div className="chat-turn" key={i}>
            <p className="user-message">{m.question}</p>
            <div className="assistant-message">
              <span className="answer-mode">
                {m.answer.mode === "live-model"
                  ? m.answer.model
                  : "Source template"}
                {m.answer.insufficientEvidence
                  ? " · insufficient evidence"
                  : ""}
              </span>
              <p>{m.answer.answer}</p>
              {m.answer.claims
                .filter((c) => c.text !== m.answer.answer)
                .map((c, j) => (
                  <div className="claim" key={j}>
                    <span className={`claim-kind ${c.kind}`}>{c.kind}</span>
                    <p>{c.text}</p>
                  </div>
                ))}
              {m.answer.claims
                .flatMap((c) => c.citations)
                .map((c, j) => (
                  <button
                    className="citation-chip"
                    key={j}
                    onClick={() => onSource(c)}
                  >
                    <FileCode2 size={12} />
                    {c.path}:L{c.start}
                  </button>
                ))}
            </div>
          </div>
        ))}
        {busy && (
          <div className="thinking">
            <Loader2 className="spin" size={15} />
            Checking the source…
          </div>
        )}
        <div ref={bottom} />
      </div>
      {!messages.length && (
        <div className="suggestions">
          {[
            "Show me where this happens in my code",
            "Give me a real-life analogy",
            "What happens if this fails?",
          ].map((q) => (
            <button key={q} disabled={busy} onClick={() => void ask(q)}>
              {q}
              <Plus size={13} />
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <form
        className="tutor-input"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim().length >= 3) void ask(input.trim());
        }}
      >
        <input
          aria-label="Ask about this concept"
          placeholder="Make a connection…"
          value={input}
          maxLength={1500}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          aria-label="Send question"
          disabled={busy || input.trim().length < 3}
        >
          <Send size={17} />
        </button>
      </form>
      <p className="tutor-footnote">
        <ShieldCheck size={12} />
        Source matching does not guarantee claim accuracy.
      </p>
    </section>
  );
}
function Assessment({
  snapshot,
  concept,
  progress,
  onProgress,
  onSource,
}: {
  snapshot: Snapshot;
  concept: Concept;
  progress: Progress;
  onProgress: (p: Progress) => void;
  onSource: (c: Citation) => void;
}) {
  const qs = questions(concept);
  const previous = progress.attempts.filter((a) => a.conceptId === concept.id);
  const first = previous.length
    ? Math.min(
        1,
        qs.findIndex(
          (q) => !previous.some((a) => a.questionId === q.id && a.correct),
        ),
      )
    : 0;
  const [index, setIndex] = useState(Math.max(0, first)),
    [answer, setAnswer] = useState<number | null>(null),
    [short, setShort] = useState(""),
    [feedback, setFeedback] = useState<Feedback | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const q = qs[index];
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const result = await api<Feedback>("/api/assessment", {
        projectId: snapshot.id,
        conceptId: concept.id,
        questionId: q.id,
        answer: q.kind === "choice" ? answer : short,
      });
      setFeedback(result);
      if (result.progress) onProgress(result.progress);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function move(i: number) {
    setIndex(i);
    setAnswer(null);
    setShort("");
    setFeedback(null);
    setError("");
  }
  return (
    <div className="assessment-layout">
      <section className="assessment">
        <div className="assessment-top">
          <span className="pill neutral">
            {index === 0
              ? "Concept check"
              : index === 1
                ? "Code comprehension"
                : "Technical explanation"}
          </span>
          <span>
            {index + 1} / {qs.length}
          </span>
        </div>
        <h2>{q.prompt}</h2>
        {index === 1 && concept.evidence[0] && (
          <SourceCode citation={concept.evidence[0]} />
        )}
        <fieldset disabled={Boolean(feedback) || busy}>
          <legend className="sr-only">Choose your answer</legend>
          {q.kind === "choice" ? (
            q.options?.map((option, i) => (
              <label
                className={`answer-option ${answer === i ? "chosen" : ""} ${feedback && feedback.correctAnswer === i ? "correct" : ""}`}
                key={option}
              >
                <input
                  type="radio"
                  name="answer"
                  value={i}
                  checked={answer === i}
                  onChange={() => setAnswer(i)}
                />
                <span className="answer-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {feedback && feedback.correctAnswer === i && (
                  <Check size={18} />
                )}
              </label>
            ))
          ) : (
            <textarea
              aria-label="Your technical explanation"
              value={short}
              onChange={(e) => setShort(e.target.value)}
              maxLength={2000}
              placeholder="The source shows… This means… One thing it cannot prove is…"
              rows={6}
            />
          )}
        </fieldset>
        {error && (
          <div role="alert" className="error-message">
            {error}
          </div>
        )}
        {feedback && (
          <div
            className={`feedback ${feedback.correct ? "positive" : "review"}`}
            role="status"
          >
            <h3>
              {feedback.ungraded
                ? "Practice feedback"
                : feedback.correct
                  ? "That’s the connection."
                  : "A useful gap to explore."}
            </h3>
            <p>{feedback.explanation}</p>
            {feedback.note && <p>{feedback.note}</p>}
            {feedback.checks?.map((c) => (
              <p key={c.criterion}>
                {c.met ? <Check size={15} /> : <Minus size={15} />}{" "}
                {c.criterion}: {c.met ? "mentioned" : "add a clear explanation"}
              </p>
            ))}
            {!feedback.correct && !feedback.ungraded && (
              <button
                className="text-button"
                onClick={() => onSource(concept.evidence[0])}
              >
                Review supporting source
                <ExternalLink size={14} />
              </button>
            )}
          </div>
        )}
        <div className="assessment-actions">
          {feedback ? (
            <>
              <button className="button secondary" onClick={() => move(index)}>
                Try again
              </button>
              <button
                className="button primary"
                onClick={() => move((index + 1) % qs.length)}
              >
                {index < qs.length - 1 ? "Next question" : "Practice again"}
              </button>
            </>
          ) : (
            <button
              className="button primary"
              onClick={() => void submit()}
              disabled={
                busy ||
                (q.kind === "choice"
                  ? answer === null
                  : short.trim().length < 15)
              }
            >
              {busy ? (
                <Loader2 className="spin" size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Check understanding
            </button>
          )}
        </div>
      </section>
      <aside className="practice-aside">
        <span className="feature-icon">
          <GraduationCap size={24} />
        </span>
        <h3>Practice with purpose.</h3>
        <p>
          Getting it wrong is useful information. Follow the evidence, revisit
          the idea, and try again.
        </p>
        <div className="practice-score">
          <strong>{mastery(progress, concept.id)}%</strong>
          <span>estimated concept mastery</span>
        </div>
        <div className="progress-track">
          <i style={{ width: `${mastery(progress, concept.id)}%` }} />
        </div>
        <p className="fine-print">
          Two scored checks. Your latest answers count; repeated attempts do not
          stack points.
        </p>
        <button className="text-button" onClick={() => move(2)}>
          Try a short explanation
          <ChevronRight size={14} />
        </button>
      </aside>
    </div>
  );
}
