import { publicSample } from "@/lib/deployment-mode";
import Link from "next/link";
import {
  GitBranch,
  Code2,
  Play,
  ShieldCheck,
  BookOpen,
  Workflow,
  AudioLines,
  Check,
  ChevronRight,
} from "lucide-react";
import { Brand } from "@/components/brand";
export default function Home() {
  return (
    <div className="landing">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="landing-nav">
        <Link href="/" aria-label="Synapse home">
          <Brand />
        </Link>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">The experience</a>
          <a href="#grounded">Built on evidence</a>
          <Link className="button small secondary" href="/learn">
            Open learning studio
          </Link>
        </nav>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-orbit" /> A LITTLE LESS MYSTERY. A LOT MORE
              MASTERY.
            </div>
            <h1>
              You built it.
              <br />
              Now <em>understand</em> it.
            </h1>
            <p className="hero-lead">
              Turn your GitHub repository into a learning journey. See the
              architecture, follow the code, and make the knowledge yours.
            </p>
            <div className="hero-actions">
              <Link
                className="button primary large"
                href={publicSample ? "/learn" : "/learn?connect=1"}
              >
                <GitBranch size={18} />
                {publicSample ? "Explore the sample" : "Connect a repository"}
              </Link>
              <Link
                className="button quiet large"
                href={
                  publicSample
                    ? "https://github.com/pranav-pokkula/synapse"
                    : "/learn"
                }
              >
                <Play size={17} />
                {publicSample ? "View on GitHub" : "Explore the sample"}
              </Link>
            </div>
            <p className="hero-note">
              <ShieldCheck size={15} />{" "}
              {publicSample
                ? "Public sample · no account or paid AI. Imports and live AI remain protected."
                : "Public repositories. No GitHub sign-in required."}
            </p>
          </div>
          <div
            className="hero-visual"
            aria-label="Preview of a source-backed visual lesson"
          >
            <div className="window-top">
              <span />
              <span />
              <span />
              <span className="window-label">
                FIELDNOTES / THE LIFE OF A REQUEST
              </span>
            </div>
            <div className="preview-heading">
              <span className="pill mint">
                <Play size={12} />
                Visual lesson
              </span>
              <span className="muted">Step 2 of 4</span>
            </div>
            <div className="preview-flow">
              <div className="flow-node">
                <Code2 />
                <span>Your interface</span>
                <small>note-composer.tsx</small>
              </div>
              <div className="flow-line">
                <i />
              </div>
              <div className="flow-node selected">
                <Workflow />
                <span>Request handler</span>
                <small>api/notes/route.ts</small>
              </div>
              <div className="flow-line lower">
                <i />
              </div>
              <div className="flow-node bottom">
                <ShieldCheck />
                <span>Validate the input</span>
                <small>lib/validation.ts</small>
              </div>
            </div>
            <div className="preview-caption">
              <span className="caption-number">02</span>
              <div>
                <strong>Follow the request. Connect the dots.</strong>
                <p>
                  See how a note moves from a button click to a validated server
                  request.
                </p>
              </div>
            </div>
            <div className="preview-bottom">
              <AudioLines size={18} />
              <div className="fake-wave">
                {Array.from({ length: 24 }, (_, i) => (
                  <i key={i} style={{ height: `${6 + ((i * 17) % 18)}px` }} />
                ))}
              </div>
              <span>Conceptual animation · source-linked</span>
            </div>
          </div>
        </section>
        <div className="landing-divider">
          <span>FROM “IT WORKS” TO “I KNOW WHY.”</span>
          <div />
          <span>YOUR CODE IS THE CURRICULUM</span>
        </div>
        <section id="how-it-works" className="how-section">
          <div>
            <span className="eyebrow">A BETTER WAY TO LEARN</span>
            <h2>
              One project.
              <br />A hundred lightbulb moments.
            </h2>
            <p>
              No disconnected tutorials. Start with the systems you’ve already
              built and learn the ideas that hold them together.
            </p>
          </div>
          <div className="feature-list">
            <article>
              <span className="feature-icon">
                <GitBranch />
              </span>
              <div>
                <h3>Connect the code</h3>
                <p>
                  Import a public TypeScript or JavaScript repository, pinned to
                  an exact commit.
                </p>
              </div>
            </article>
            <article>
              <span className="feature-icon">
                <Workflow />
              </span>
              <div>
                <h3>See the bigger picture</h3>
                <p>
                  Explore real module connections and a learning path that puts
                  foundations first.
                </p>
              </div>
            </article>
            <article>
              <span className="feature-icon">
                <BookOpen />
              </span>
              <div>
                <h3>Make it click</h3>
                <p>
                  Read, watch, listen, and practice. Every source citation takes
                  you back to the evidence.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section id="grounded" className="grounded">
          <div>
            <ShieldCheck size={30} />
            <h2>
              Understanding starts
              <br />
              with something you can verify.
            </h2>
          </div>
          <div>
            <p>
              Repository facts, implementation inferences, and general
              explanations stay clearly labeled. When evidence is missing,
              SYNAPSE says so.
            </p>
            <ul>
              <li>
                <Check size={17} />
                Exact source lines and snapshot references
              </li>
              <li>
                <Check size={17} />
                Imported code is read, never executed
              </li>
              <li>
                <Check size={17} />
                Interactive sample works without paid AI
              </li>
            </ul>
            <Link className="text-link" href="/learn">
              Take a look inside <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <span>Build knowledge from what you build.</span>
        <a href="https://github.com/pranav-pokkula/synapse/blob/main/docs/DEMO_SCRIPT.md">
          Demo & documentation
        </a>
      </footer>
    </div>
  );
}
