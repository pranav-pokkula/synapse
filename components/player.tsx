"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  FileText,
  Pause,
  Play,
  RotateCcw,
  Server,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Lesson } from "@/lib/types";
const subscribeNarrow = (listener: () => void) => {
  const query = window.matchMedia("(max-width:560px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const readNarrow = () => window.matchMedia("(max-width:560px)").matches;
const serverNarrow = () => false;
export function Player({
  lesson,
  onStep,
}: {
  lesson: Lesson;
  onStep: (index: number) => void;
}) {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1),
    [voice, setVoice] = useState(false),
    [captions, setCaptions] = useState(true),
    [speechStatus, setSpeechStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const scene = lesson.board.steps[step];
  const narrow = useSyncExternalStore(
    subscribeNarrow,
    readNarrow,
    serverNarrow,
  );
  useEffect(() => {
    onStep(step);
  }, [step, onStep]);
  useEffect(() => {
    const token = ++generation.current;
    if (timer.current) clearTimeout(timer.current);
    const speech =
      typeof window !== "undefined" && "speechSynthesis" in window
        ? window.speechSynthesis
        : null;
    speech?.cancel();
    if (!playing) return;
    let advanced = false;
    const next = () => {
      if (advanced || generation.current !== token) return;
      advanced = true;
      if (timer.current) clearTimeout(timer.current);
      if (step < lesson.board.steps.length - 1) setStep((s) => s + 1);
      else setPlaying(false);
    };
    if (voice && speech) {
      const utterance = new SpeechSynthesisUtterance(scene.caption);
      utterance.rate = speed;
      utterance.lang = "en-US";
      utterance.onend = next;
      utterance.onerror = () => {
        if (generation.current === token)
          setSpeechStatus(
            "Voice is unavailable. Captions and playback remain available.",
          );
        next();
      };
      speech.speak(utterance);
      timer.current = setTimeout(
        () => {
          if (generation.current === token)
            setSpeechStatus(
              "Narration did not finish in this browser. Captions and playback remain available.",
            );
          next();
        },
        Math.max(8000, (scene.caption.split(" ").length * 700) / speed),
      );
    } else
      timer.current = setTimeout(
        next,
        Math.max(3300, scene.caption.split(" ").length * 260) / speed,
      );
    return () => {
      generation.current = token + 1;
      if (timer.current) clearTimeout(timer.current);
      speech?.cancel();
    };
  }, [playing, step, speed, voice, scene.caption, lesson.board.steps.length]);
  function move(next: number) {
    setPlaying(false);
    setStep(Math.max(0, Math.min(lesson.board.steps.length - 1, next)));
  }
  const nodeIcon = {
    client: Code2,
    server: Server,
    data: Database,
    output: FileText,
  };
  return (
    <div className="lesson-player">
      <div className="player-top">
        <span className="pill mint">
          <span className="live-dot" />
          VISUAL LESSON
        </span>
        <span>Conceptual model · source-linked</span>
      </div>
      <div
        className={`animation-stage ${playing ? "is-playing" : ""} ${narrow ? "vertical-scene" : ""}`}
        data-testid="animation-stage"
        data-step={step}
        data-state={scene.state}
      >
        <svg
          className="scene-svg"
          viewBox={narrow ? "0 0 360 430" : "0 0 760 220"}
          role="img"
          aria-label={`${scene.title}: ${scene.caption}`}
        >
          <defs>
            <marker
              id="scene-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0L10 5L0 10" fill="var(--scene-line)" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {lesson.board.nodes.slice(1).map((node, i) => (
            <g key={node.id}>
              <path
                d={
                  narrow
                    ? `M180 ${114 + i * 145}V${154 + i * 145}`
                    : `M${182 + i * 250} 106H${278 + i * 250}`
                }
                stroke="var(--scene-line)"
                strokeWidth="2"
                strokeDasharray="4 6"
                markerEnd="url(#scene-arrow)"
              />
              {scene.from === lesson.board.nodes[i].id && (
                <g
                  className="request-packet"
                  style={{ animationDuration: `${1.7 / speed}s` }}
                >
                  <circle
                    cx={narrow ? 180 : 190 + i * 250}
                    cy={narrow ? 118 + i * 145 : 106}
                    r="8"
                    fill="var(--mint)"
                    opacity=".25"
                    filter="url(#glow)"
                  />
                  <circle
                    cx={narrow ? 180 : 190 + i * 250}
                    cy={narrow ? 118 + i * 145 : 106}
                    r="5"
                    fill="var(--mint)"
                  />
                </g>
              )}
            </g>
          ))}
          {lesson.board.nodes.map((node, i) => {
            const active = scene.active.includes(node.id),
              Icon = nodeIcon[node.kind];
            return (
              <g
                key={node.id}
                className={`scene-node ${active ? "scene-active" : ""} ${active && scene.state === "failure" ? "scene-failure" : ""}`}
              >
                <rect
                  x={narrow ? 102 : 27 + i * 250}
                  y={narrow ? 10 + i * 145 : 55}
                  width="156"
                  height="104"
                  rx="15"
                />
                <foreignObject
                  x={narrow ? 166 : 91 + i * 250}
                  y={narrow ? 27 + i * 145 : 72}
                  width="30"
                  height="30"
                >
                  <Icon size={25} />
                </foreignObject>
                <text
                  x={narrow ? 180 : 105 + i * 250}
                  y={narrow ? 87 + i * 145 : 132}
                  textAnchor="middle"
                >
                  {node.label}
                </text>
                <text
                  className="scene-node-tag"
                  x={narrow ? 180 : 105 + i * 250}
                  y={narrow ? 102 + i * 145 : 184}
                  textAnchor="middle"
                >
                  {active
                    ? scene.state === "failure"
                      ? "FAILURE PATH"
                      : scene.state === "success"
                        ? "RESULT READY"
                        : "IN FOCUS"
                    : " "}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="scene-caption" aria-live="polite">
        <span className="caption-number">
          {String(step + 1).padStart(2, "0")}
        </span>
        <div>
          <strong>{scene.title}</strong>
          {captions && <p>{scene.caption}</p>}
        </div>
      </div>
      <div className="player-timeline" aria-label="Lesson steps">
        {lesson.board.steps.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Go to step ${i + 1}: ${s.title}`}
            aria-current={i === step ? "step" : undefined}
            onClick={() => move(i)}
            className={i <= step ? "done" : ""}
          />
        ))}
      </div>
      <div className="player-controls">
        <div>
          <button
            className="play-button"
            aria-label={playing ? "Pause animation" : "Play animation"}
            onClick={() => {
              if (step === lesson.board.steps.length - 1) setStep(0);
              setPlaying((v) => !v);
            }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            className="icon-button"
            aria-label="Previous step"
            onClick={() => move(step - 1)}
            disabled={step === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="step-count">
            {step + 1} / {lesson.board.steps.length}
          </span>
          <button
            className="icon-button"
            aria-label="Next step"
            onClick={() => move(step + 1)}
            disabled={step === lesson.board.steps.length - 1}
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Replay lesson"
            onClick={() => {
              setStep(0);
              setPlaying(true);
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
        <div>
          <label className="speed-label">
            <span className="sr-only">Playback speed</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={0.75}>0.75×</option>
              <option value={1}>1×</option>
              <option value={1.5}>1.5×</option>
              <option value={2}>2×</option>
            </select>
          </label>
          <button
            className={`icon-button ${captions ? "toggled" : ""}`}
            aria-label="Toggle captions"
            aria-pressed={captions}
            onClick={() => setCaptions((v) => !v)}
          >
            <Captions size={19} />
          </button>
          <button
            className={`icon-button ${voice ? "toggled" : ""}`}
            aria-label="Toggle narration"
            aria-pressed={voice}
            onClick={() => {
              if (!("speechSynthesis" in window)) {
                setSpeechStatus(
                  "Speech synthesis is unavailable in this browser. Read the transcript below.",
                );
                return;
              }
              setVoice((v) => !v);
              setSpeechStatus("");
            }}
          >
            {voice ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>
      {speechStatus && (
        <p className="inline-notice" role="status">
          {speechStatus}
        </p>
      )}
      <details className="transcript">
        <summary>Read the accessible transcript</summary>
        <ol>
          {lesson.board.steps.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong>
              <p>{s.caption}</p>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
