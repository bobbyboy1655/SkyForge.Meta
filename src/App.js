import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & DATA
// ═══════════════════════════════════════════════════════════════

const SCREENS = { INTRO: "intro", NAME: "name", TRACK: "track", BRIEF: "brief", COCKPIT: "cockpit" };
const PANELS = { MISSIONS: "missions", CAREER: "career", ECONOMY: "economy", SQUAD: "squad", LOG: "log" };

const TRACKS = {
  commercial: {
    id: "commercial", icon: "✈️", label: "Commercial Pilot",
    tagline: "Command the skies. Carry the world.",
    color: "#00D4FF", glow: "rgba(0,212,255,0.3)", dim: "rgba(0,212,255,0.1)",
    gradient: "linear-gradient(135deg, #003D5C 0%, #001A2E 100%)",
    ranks: ["PPL", "CPL", "ATP", "Captain"],
    rankLabels: ["Private Pilot Licence", "Commercial Pilot", "Airline Transport", "Captain"],
    xpPerRank: [0, 1200, 3500, 8000],
    brief: "Master instrument approaches, multi-engine ops, and CRM protocols. From a Cessna 172 to a 777 cockpit — every hour logged counts toward your licence.",
    missions: [
      { id: "c1", title: "VFR Pattern Work", desc: "6 touch-and-go landings at EGLL. Wind 12kt crosswind.", difficulty: "BASIC", xp: 120, sb: 80, duration: "22 MIN", status: "available" },
      { id: "c2", title: "IFR Approach — LHR", desc: "Full ILS Cat II approach in IMC. RVR 400m. No go-arounds.", difficulty: "INTERMEDIATE", xp: 280, sb: 200, duration: "38 MIN", status: "available" },
      { id: "c3", title: "Trans-Atlantic Nav", desc: "File and fly EGLL→KJFK. Manage fuel, ETOPS, oceanic tracks.", difficulty: "ADVANCED", xp: 650, sb: 500, duration: "6 HR SIM", status: "locked" },
      { id: "c4", title: "Emergency Procedures", desc: "Engine failure on takeoff, hydraulic loss, smoke in cockpit — all in sequence.", difficulty: "INTERMEDIATE", xp: 300, sb: 220, duration: "45 MIN", status: "available" },
    ],
  },
  fighter: {
    id: "fighter", icon: "🛩️", label: "Fighter Pilot",
    tagline: "Break the sound barrier. Break the rules.",
    color: "#FF6B00", glow: "rgba(255,107,0,0.3)", dim: "rgba(255,107,0,0.1)",
    gradient: "linear-gradient(135deg, #3D1A00 0%, #1A0A00 100%)",
    ranks: ["Cadet", "Advanced Jets", "Squadron", "Top Gun"],
    rankLabels: ["Flight Cadet", "Advanced Jets", "Squadron Lead", "Top Gun"],
    xpPerRank: [0, 1000, 3000, 7500],
    brief: "BFM, ACM, carrier landings, and night ops under EMCON conditions. Every sortie is scored. Not everyone makes it past Cadet — but you're not everyone.",
    missions: [
      { id: "f1", title: "Basic Fighter Manoeuvres", desc: "1v1 BFM against AI bandit. Achieve gun solution within 60s.", difficulty: "BASIC", xp: 150, sb: 100, duration: "18 MIN", status: "available" },
      { id: "f2", title: "Night Carrier Landing", desc: "Trap aboard CVN-78 at night. 3-wire or bust. Sea state 4.", difficulty: "INTERMEDIATE", xp: 320, sb: 240, duration: "25 MIN", status: "available" },
      { id: "f3", title: "Strike Package Lead", desc: "Lead 4-ship SEAD into denied airspace. EMCON Alpha.", difficulty: "ADVANCED", xp: 720, sb: 560, duration: "55 MIN", status: "locked" },
      { id: "f4", title: "Red Arrows Formation", desc: "Fly Diamond 9 formation at 100ft over Farnborough. Sync or crash.", difficulty: "INTERMEDIATE", xp: 400, sb: 300, duration: "30 MIN", status: "available" },
    ],
  },
};

const SHOP_ITEMS = [
  { id: "s1", name: "F/A-18 Hornet Skin", desc: "Blue Angels livery — limited edition.", price: 450, type: "COSMETIC", icon: "🎨", owned: false },
  { id: "s2", name: "PPL Certificate", desc: "Certified Private Pilot Licence. Recognised by SkyForge Academy.", price: 800, type: "CERTIFIED", icon: "📜", owned: false },
  { id: "s3", name: "Advanced Nav Pack", desc: "Unlocks 12 advanced IFR missions early.", price: 600, type: "MISSION", icon: "🗺️", owned: false },
  { id: "s4", name: "Haptic Suit Profile", desc: "Custom vibration patterns for Quest + bHaptics suit.", price: 350, type: "VR ASSET", icon: "🦺", owned: false },
  { id: "s5", name: "Red Arrows Livery", desc: "Hawk T1 in full RAF Red Arrows display scheme.", price: 500, type: "COSMETIC", icon: "🔴", owned: true },
  { id: "s6", name: "CPL Fast Track", desc: "Compressed Commercial licence path. 30% fewer missions required.", price: 1200, type: "CERTIFIED", icon: "⚡", owned: false },
];

const SQUAD_MEMBERS = [
  { callsign: "VIPER", rank: "CPL", track: "commercial", status: "online", xp: 2800 },
  { callsign: "GHOST", rank: "Advanced Jets", track: "fighter", status: "in-mission", xp: 1900 },
  { callsign: "NOVA", rank: "PPL", track: "commercial", status: "online", xp: 680 },
  { callsign: "BLAZE", rank: "Cadet", track: "fighter", status: "offline", xp: 120 },
  { callsign: "ACE", rank: "Squadron", track: "fighter", status: "online", xp: 4200 },
];

const FLIGHT_LOG = [
  { date: "2026-06-22", title: "VFR Circuit — EGLL", grade: "A-", xp: 120, sb: 80, duration: "22 MIN" },
  { date: "2026-06-21", title: "Pre-flight Procedures", grade: "B+", xp: 60, sb: 40, duration: "15 MIN" },
  { date: "2026-06-20", title: "Sim Orientation", grade: "A", xp: 50, sb: 35, duration: "10 MIN" },
];

const DIFF_COLORS = { BASIC: "#4ADE80", INTERMEDIATE: "#FACC15", ADVANCED: "#F87171" };

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Starfield({ count = 160 }) {
  const stars = useRef(Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 75,
    r: Math.random() * 1.4 + 0.3, opacity: Math.random() * 0.6 + 0.2,
    dur: Math.random() * 3 + 2, delay: Math.random() * 4,
  }))).current;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white">
          <animate attributeName="opacity" values={`${s.opacity};${s.opacity * 0.25};${s.opacity}`}
            dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

function HUDCorners({ color }) {
  const corners = [
    { top: 16, left: 16, borderTop: "1.5px solid", borderLeft: "1.5px solid" },
    { top: 16, right: 16, borderTop: "1.5px solid", borderRight: "1.5px solid" },
    { bottom: 16, left: 16, borderBottom: "1.5px solid", borderLeft: "1.5px solid" },
    { bottom: 16, right: 16, borderBottom: "1.5px solid", borderRight: "1.5px solid" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {corners.map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 28, height: 28, borderColor: color, opacity: 0.4, ...s }} />
      ))}
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: 8, letterSpacing: "0.12em", padding: "2px 7px",
      border: `1px solid ${color}50`, color, fontFamily: "Orbitron, monospace",
    }}>{label}</span>
  );
}

function Toast({ message, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      backgroundColor: color, color: "#020408", fontFamily: "Orbitron, monospace",
      fontSize: 11, letterSpacing: "0.15em", padding: "14px 28px",
      zIndex: 99999, boxShadow: `0 0 40px ${color}90`,
      borderRadius: 2, whiteSpace: "nowrap", pointerEvents: "none",
      WebkitUserSelect: "none", userSelect: "none",
    }}>✓ {message}</div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INSTRUMENTS
// ═══════════════════════════════════════════════════════════════

function ArtificialHorizon({ pitch, roll, color, size = 108 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const pitchOff = pitch * 1.2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs><clipPath id="ahc"><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
      <g clipPath="url(#ahc)" transform={`rotate(${roll},${cx},${cy})`}>
        <rect x={0} y={0} width={size} height={cy + pitchOff} fill="#1A3A5C" />
        <rect x={0} y={cy + pitchOff} width={size} height={size} fill="#5C3A1A" />
        <line x1={0} y1={cy + pitchOff} x2={size} y2={cy + pitchOff} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        {[-10, -5, 5, 10].map(d => (
          <line key={d} x1={cx - 14} y1={cy + pitchOff + d * 1.2} x2={cx + 14} y2={cy + pitchOff + d * 1.2}
            stroke="rgba(255,255,255,0.25)" strokeWidth={0.8} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
      <line x1={cx - 22} y1={cy} x2={cx - 6} y2={cy} stroke={color} strokeWidth={2} />
      <line x1={cx + 6} y1={cy} x2={cx + 22} y2={cy} stroke={color} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2.5} fill={color} />
      <line x1={cx} y1={cy - 6} x2={cx} y2={cy - 2} stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

function Gauge({ label, value, max, unit, color, size = 88 }) {
  const pct = Math.min(value / max, 1);
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  const toRad = d => (d * Math.PI) / 180;
  const startA = -135, endA = startA + pct * 270;
  const sx = cx + r * Math.cos(toRad(startA - 90)), sy = cy + r * Math.sin(toRad(startA - 90));
  const ex = cx + r * Math.cos(toRad(endA - 90)), ey = cy + r * Math.sin(toRad(endA - 90));
  const nx = cx + r * 0.7 * Math.cos(toRad(endA - 90)), ny = cy + r * 0.7 * Math.sin(toRad(endA - 90));
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
        <path d={`M${sx},${sy} A${r},${r} 0 ${pct * 270 > 180 ? 1 : 0} 1 ${ex},${ey}`}
          fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" opacity={0.85} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="white" strokeWidth={1.5} strokeLinecap="round" opacity={0.85} />
        <circle cx={cx} cy={cy} r={3} fill={color} />
        <text x={cx} y={cy + 16} textAnchor="middle" fill="white" fontSize={11} fontFamily="Orbitron,monospace" fontWeight="700">{value}</text>
        <text x={cx} y={cy + 26} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={6.5} fontFamily="Orbitron,monospace">{unit}</text>
      </svg>
      <div style={{ fontFamily: "Orbitron,monospace", fontSize: 7.5, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ONBOARDING SCREENS
// ═══════════════════════════════════════════════════════════════

function IntroScreen({ onNext }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [400, 1200, 2000, 2800].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div style={bgBase}>
      <Starfield />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, background: "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(0,100,180,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
        <div style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 0.9s", marginBottom: 10 }}>
          <svg viewBox="0 0 60 60" width={50} height={50} style={{ display: "inline-block" }}>
            <polygon points="30,3 57,53 30,43 3,53" fill="none" stroke="#00D4FF" strokeWidth="1.5" opacity="0.9" />
            <polygon points="30,13 45,49 30,41 15,49" fill="#00D4FF" opacity="0.12" />
            <line x1="30" y1="3" x2="30" y2="43" stroke="#00D4FF" strokeWidth="0.8" opacity="0.5" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "Orbitron,monospace", fontSize: "clamp(44px,10vw,90px)", fontWeight: 900, letterSpacing: "0.18em", margin: 0, lineHeight: 1, opacity: step >= 1 ? 1 : 0, transition: "opacity 0.9s", background: "linear-gradient(135deg,#F0F8FF,#8BA3C7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SKY</h1>
        <h1 style={{ fontFamily: "Orbitron,monospace", fontSize: "clamp(44px,10vw,90px)", fontWeight: 900, letterSpacing: "0.18em", margin: 0, lineHeight: 1, opacity: step >= 2 ? 1 : 0, transition: "opacity 0.9s", color: "#00D4FF" }}>FORGE</h1>
        <div style={{ opacity: step >= 3 ? 1 : 0, transition: "opacity 0.8s", marginTop: 20 }}>
          <svg viewBox="0 0 600 50" style={{ width: "100%", maxWidth: 500, opacity: 0.55 }}>
            <defs><linearGradient id="cg" x1="0%" x2="100%"><stop offset="0%" stopColor="#00D4FF" stopOpacity="0" /><stop offset="60%" stopColor="#00D4FF" stopOpacity="0.9" /><stop offset="100%" stopColor="white" stopOpacity="0" /></linearGradient></defs>
            <path d="M0,25 Q150,8 300,25 T600,25" stroke="url(#cg)" strokeWidth="2" fill="none" strokeDasharray="600" strokeDashoffset="600">
              <animate attributeName="stroke-dashoffset" from="600" to="0" dur="1.6s" fill="freeze" />
            </path>
          </svg>
          <p style={{ fontSize: 12, letterSpacing: "0.3em", color: "#8BA3C7", textTransform: "uppercase", marginTop: 10 }}>Teen Metaverse Flight Academy</p>
        </div>
        <div style={{ opacity: step >= 4 ? 1 : 0, transition: "opacity 0.7s", marginTop: 44 }}>
          <button onClick={onNext} style={{ ...btnOutline("#00D4FF"), padding: "14px 44px", fontSize: 12, letterSpacing: "0.25em" }}>Begin Training</button>
        </div>
      </div>
    </div>
  );
}

function NameScreen({ onNext }) {
  const [val, setVal] = useState("");
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 300); }, []);
  const submit = () => { const c = val.trim().toUpperCase(); if (c) onNext(c); };
  return (
    <div style={bgBase}>
      <Starfield count={100} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 480, width: "100%", padding: "0 24px" }}>
        <p style={eyebrow("#8BA3C7")}>ACADEMY REGISTRATION</p>
        <h2 style={{ fontFamily: "Orbitron,monospace", fontSize: "clamp(22px,5vw,34px)", fontWeight: 700, margin: "0 0 10px", lineHeight: 1.2 }}>
          What's your callsign,<br /><span style={{ color: "#00D4FF" }}>Pilot?</span>
        </h2>
        <p style={{ color: "#8BA3C7", fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>Your instructors, squadmates, and rivals will know you by this name.</p>
        <input ref={ref} value={val} onChange={e => setVal(e.target.value.slice(0, 16))} onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="e.g. MAVERICK" maxLength={16}
          style={{ width: "100%", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 2, color: "#00D4FF", fontFamily: "Orbitron,monospace", fontSize: 22, letterSpacing: "0.2em", padding: "18px 24px", outline: "none", textAlign: "center", textTransform: "uppercase", caretColor: "#00D4FF", marginBottom: 16 }} />
        <button onClick={submit} disabled={!val.trim()}
          style={{ width: "100%", background: val.trim() ? "#00D4FF" : "rgba(0,212,255,0.1)", border: "none", color: val.trim() ? "#050810" : "#8BA3C7", fontFamily: "Orbitron,monospace", fontSize: 12, letterSpacing: "0.25em", padding: "16px", cursor: val.trim() ? "pointer" : "default", fontWeight: 700, transition: "all 0.3s" }}>
          Confirm Callsign
        </button>
      </div>
    </div>
  );
}

function TrackScreen({ callsign, onNext }) {
  const [hovered, setHovered] = useState(null);
  const h = hovered ? TRACKS[hovered] : null;
  return (
    <div style={bgBase}>
      <Starfield count={130} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: h ? `radial-gradient(ellipse 80% 100% at 50% 100%, ${h.glow} 0%, transparent 70%)` : "none", transition: "background 0.6s", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", width: "100%", padding: "0 20px" }}>
        <p style={eyebrow("#8BA3C7")}>CALLSIGN: <span style={{ color: "#00D4FF" }}>{callsign}</span></p>
        <h2 style={{ fontFamily: "Orbitron,monospace", fontSize: "clamp(20px,4vw,30px)", fontWeight: 700, margin: "0 0 6px" }}>Choose Your Career Track</h2>
        <p style={{ color: "#8BA3C7", fontSize: 13, marginBottom: 44 }}>You can only pick one. Choose wisely.</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", maxWidth: 840, margin: "0 auto" }}>
          {Object.values(TRACKS).map(t => {
            const isH = hovered === t.id;
            return (
              <div key={t.id} onClick={() => onNext(t.id)}
                onMouseEnter={() => setHovered(t.id)} onMouseLeave={() => setHovered(null)}
                style={{ flex: "1 1 300px", maxWidth: 380, background: isH ? t.gradient : "rgba(255,255,255,0.02)", border: `1px solid ${isH ? t.color : "rgba(255,255,255,0.09)"}`, borderRadius: 4, padding: "36px 28px", cursor: "pointer", transition: "all 0.3s", boxShadow: isH ? `0 0 40px ${t.glow}` : "none", transform: isH ? "translateY(-4px)" : "none", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: `0 ${isH ? 38 : 22}px ${isH ? 38 : 22}px 0`, borderColor: `transparent ${t.color} transparent transparent`, opacity: 0.6, transition: "all 0.3s" }} />
                <div style={{ fontSize: 42, marginBottom: 14 }}>{t.icon}</div>
                <h3 style={{ fontFamily: "Orbitron,monospace", fontSize: 17, fontWeight: 700, color: t.color, margin: "0 0 8px", letterSpacing: "0.05em" }}>{t.label}</h3>
                <p style={{ fontSize: 12, color: "#8BA3C7", fontStyle: "italic", margin: "0 0 26px" }}>"{t.tagline}"</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
                  {t.ranks.map((r, i) => (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "Orbitron,monospace", fontSize: 9, padding: "3px 10px", border: `1px solid ${i === 0 ? t.color : "rgba(255,255,255,0.15)"}`, color: i === 0 ? t.color : "rgba(255,255,255,0.35)", background: i === 0 ? `${t.color}15` : "transparent" }}>{r}</span>
                      {i < t.ranks.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>›</span>}
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: 14, borderTop: `1px solid ${isH ? `${t.color}40` : "rgba(255,255,255,0.06)"}`, fontFamily: "Orbitron,monospace", fontSize: 10, letterSpacing: "0.2em", color: isH ? t.color : "rgba(255,255,255,0.25)", transition: "color 0.3s" }}>SELECT TRACK →</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BriefScreen({ callsign, trackId, onNext }) {
  const t = TRACKS[trackId];
  return (
    <div style={{ ...bgBase, background: `linear-gradient(180deg,#050810 0%,#0A1628 40%,${trackId === "commercial" ? "#001A2E" : "#1A0A00"} 100%)` }}>
      <Starfield count={90} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 280, background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${t.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 560, padding: "0 24px", width: "100%" }}>
        <div style={{ display: "inline-block", border: `1px solid ${t.color}40`, padding: "4px 16px", marginBottom: 22, fontFamily: "Orbitron,monospace", fontSize: 9, letterSpacing: "0.3em", color: t.color }}>TRACK CONFIRMED</div>
        <div style={{ fontSize: 50, marginBottom: 10 }}>{t.icon}</div>
        <h2 style={{ fontFamily: "Orbitron,monospace", fontSize: "clamp(22px,5vw,36px)", fontWeight: 700, margin: "0 0 6px", color: t.color }}>{t.label}</h2>
        <p style={{ fontSize: 12, color: "#8BA3C7", fontStyle: "italic", margin: "0 0 32px" }}>"{t.tagline}"</p>
        <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${t.color}20`, borderRadius: 3, padding: "22px 26px", marginBottom: 28, textAlign: "left" }}>
          <p style={eyebrow(t.color)}>MISSION BRIEF</p>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "#C8DCF0", margin: 0 }}>{t.brief}</p>
        </div>
        <p style={{ fontSize: 13, color: "#8BA3C7", marginBottom: 28 }}>
          Welcome aboard, <span style={{ color: t.color, fontFamily: "Orbitron,monospace" }}>{callsign}</span>. Your first simulation begins now.
        </p>
        <button onClick={onNext} style={{ ...btnFill(t.color), width: "100%", maxWidth: 360, padding: "18px", fontSize: 13, letterSpacing: "0.25em" }}>Enter Cockpit →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COCKPIT — MAIN APP SCREEN
// ═══════════════════════════════════════════════════════════════

function CockpitScreen({ callsign, trackId }) {
  const t = TRACKS[trackId];
  const [xp, setXp] = useState(340);
  const [sb, setSb] = useState(620); // SkyBucks
  const [rankIndex] = useState(0);
  const [panel, setPanel] = useState(PANELS.MISSIONS);
  const [activeMission, setActiveMission] = useState(null);
  const [missionRunning, setMissionRunning] = useState(false);
  const [missionPct, setMissionPct] = useState(0);
  const [toast, setToast] = useState(null);
  const [shopItems, setShopItems] = useState(SHOP_ITEMS);
  const [tick, setTick] = useState(0);
  const [squadInvite, setSquadInvite] = useState(null);

  useEffect(() => { const id = setInterval(() => setTick(n => n + 1), 80); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!missionRunning) return;
    if (missionPct >= 100) {
      setMissionRunning(false);
      setXp(x => x + activeMission.xp);
      setSb(s => s + activeMission.sb);
      setToast(`+${activeMission.xp} XP  +${activeMission.sb} SkyBucks — Mission Complete`);
      setActiveMission(null);
      setMissionPct(0);
      return;
    }
    const id = setTimeout(() => setMissionPct(p => Math.min(p + 1.2, 100)), 100);
    return () => clearTimeout(id);
  }, [missionRunning, missionPct, activeMission]);

  const alt = Math.round(2400 + Math.sin(tick * 0.05) * 80);
  const spd = Math.round(142 + Math.sin(tick * 0.03) * 6);
  const hdg = Math.round(tick * 0.4) % 360;
  const pitch = Math.sin(tick * 0.04) * 4;
  const roll = Math.sin(tick * 0.025) * 8;
  const vsi = Math.round(Math.sin(tick * 0.07) * 200);

  const buyItem = (item) => {
    if (item.owned || sb < item.price) return;
    setSb(s => s - item.price);
    setShopItems(items => items.map(i => i.id === item.id ? { ...i, owned: true } : i));
    setToast(`${item.name} — Purchased!`);
  };

  const xpToNext = t.xpPerRank[rankIndex + 1] || 1200;
  const xpBase = t.xpPerRank[rankIndex] || 0;
  const xpPct = Math.min(((xp - xpBase) / (xpToNext - xpBase)) * 100, 100);

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#020408", display: "flex", flexDirection: "column", fontFamily: "'Inter',system-ui,sans-serif", color: "#F0F8FF", overflow: "hidden", position: "relative" }}>

      {toast && <Toast message={toast} color={t.color} onDone={() => setToast(null)} />}
      {squadInvite && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0A1628", border: `1px solid ${t.color}`, padding: "16px 20px", zIndex: 999, maxWidth: 280 }}>
          <p style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: t.color, marginBottom: 8, letterSpacing: "0.15em" }}>SQUAD INVITE</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}><strong>{squadInvite}</strong> wants to fly Red Arrows formation with you.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setToast("Squad mission accepted!"); setSquadInvite(null); }} style={{ ...btnFill(t.color), flex: 1, padding: "8px", fontSize: 10, letterSpacing: "0.15em" }}>ACCEPT</button>
            <button onClick={() => setSquadInvite(null)} style={{ ...btnOutline("rgba(255,255,255,0.2)"), flex: 1, padding: "8px", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>DECLINE</button>
          </div>
        </div>
      )}

      {/* TOP HUD BAR */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg viewBox="0 0 32 32" width={26} height={26}>
            <polygon points="16,2 30,28 16,22 2,28" fill="none" stroke={t.color} strokeWidth="1.5" />
            <polygon points="16,8 24,26 16,21 8,26" fill={t.color} opacity="0.15" />
          </svg>
          <span style={{ fontFamily: "Orbitron,monospace", fontSize: 13, fontWeight: 900, letterSpacing: "0.2em" }}>SKY<span style={{ color: t.color }}>FORGE</span></span>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Orbitron,monospace", fontSize: 11, color: t.color, letterSpacing: "0.2em" }}>{callsign}</div>
          <div style={{ fontFamily: "Orbitron,monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{t.icon} {t.ranks[rankIndex]} · {t.label}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: t.color, border: `1px solid ${t.color}40`, padding: "5px 12px" }}>{xp} XP</div>
          <div style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", padding: "5px 12px" }}>⬡ {sb}</div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* LEFT: COCKPIT */}
        <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

          {/* Viewport */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 160, background: "linear-gradient(180deg,#050D1A 0%,#0D2340 45%,#1A0D05 46%,#0D0702 100%)" }}>
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${pitch * 3}px) rotate(${roll * 0.4}deg)`, transition: "transform 0.1s linear" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: "50%", background: "linear-gradient(180deg,#050D1A,#0A2040)" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg,#1A0D05,#050200)" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.12)" }} />
              {[...Array(35)].map((_, i) => <div key={i} style={{ position: "absolute", top: `${(i * 7.3) % 48}%`, left: `${(i * 13.7) % 100}%`, width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 2 : 1, background: "white", opacity: 0.25 + (i % 4) * 0.12, borderRadius: "50%" }} />)}
            </div>
            {/* Crosshair */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <svg width={120} height={80} viewBox="0 0 120 80" opacity={0.45}>
                <line x1={48} y1={40} x2={72} y2={40} stroke={t.color} strokeWidth={1} />
                <line x1={60} y1={28} x2={60} y2={52} stroke={t.color} strokeWidth={1} />
                <circle cx={60} cy={40} r={14} fill="none" stroke={t.color} strokeWidth={0.8} />
                <line x1={0} y1={40} x2={42} y2={40} stroke={t.color} strokeWidth={0.5} opacity={0.4} />
                <line x1={78} y1={40} x2={120} y2={40} stroke={t.color} strokeWidth={0.5} opacity={0.4} />
              </svg>
            </div>
            {/* Speed tape */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 12, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "Orbitron,monospace", fontSize: 7.5, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>IAS</div>
              <div style={{ border: `1px solid ${t.color}40`, padding: "4px 8px", fontFamily: "Orbitron,monospace", fontSize: 14, color: t.color, background: "rgba(0,0,0,0.5)" }}>{spd}</div>
              <div style={{ fontFamily: "Orbitron,monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>KTS</div>
            </div>
            {/* Alt tape */}
            <div style={{ position: "absolute", top: 0, bottom: 0, right: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "Orbitron,monospace", fontSize: 7.5, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>ALT</div>
              <div style={{ border: `1px solid ${t.color}40`, padding: "4px 8px", fontFamily: "Orbitron,monospace", fontSize: 14, color: t.color, background: "rgba(0,0,0,0.5)" }}>{alt.toString().padStart(5, "0")}</div>
              <div style={{ fontFamily: "Orbitron,monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>FT</div>
            </div>
            {/* Mission progress */}
            {missionRunning && (
              <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", border: `1px solid ${t.color}`, padding: "10px 16px", minWidth: 210, backdropFilter: "blur(6px)" }}>
                <div style={{ fontFamily: "Orbitron,monospace", fontSize: 9, color: t.color, letterSpacing: "0.15em", marginBottom: 8 }}>MISSION IN PROGRESS</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${missionPct}%`, background: t.color, borderRadius: 2, transition: "width 0.1s" }} />
                </div>
                <div style={{ fontFamily: "Orbitron,monospace", fontSize: 8, color: "rgba(255,255,255,0.4)", textAlign: "right", marginTop: 4 }}>{Math.round(missionPct)}%</div>
              </div>
            )}
            <HUDCorners color={t.color} />
          </div>

          {/* Instrument panel */}
          <div style={{ background: "linear-gradient(180deg,#090E18,#060A12)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 10px 10px", flexShrink: 0 }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: "Orbitron,monospace", fontSize: 7.5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 4 }}>HDG</div>
              <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${t.color}30`, padding: "4px 18px", fontFamily: "Orbitron,monospace", fontSize: 18, color: t.color }}>{hdg.toString().padStart(3, "0")}°</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <ArtificialHorizon pitch={pitch} roll={roll} color={t.color} />
              <Gauge label="AIRSPEED" value={spd} max={350} unit="KTS" color={t.color} />
              <Gauge label="ALTITUDE" value={Math.round(alt / 100) * 100} max={40000} unit="FT" color={t.color} />
              <Gauge label="VSI" value={Math.abs(Math.round(vsi / 100) * 100)} max={2000} unit="FPM" color={vsi > 0 ? "#4ADE80" : "#F87171"} />
            </div>
          </div>
        </div>

        {/* RIGHT: DASHBOARD PANEL */}
        <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", background: "#04070E", overflow: "hidden" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, overflowX: "auto" }}>
            {[
              [PANELS.MISSIONS, "MISSIONS"],
              [PANELS.CAREER, "CAREER"],
              [PANELS.ECONOMY, "STORE"],
              [PANELS.SQUAD, "SQUAD"],
              [PANELS.LOG, "LOG"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setPanel(id)} style={{ flex: "0 0 auto", background: "none", border: "none", borderBottom: panel === id ? `2px solid ${t.color}` : "2px solid transparent", color: panel === id ? t.color : "rgba(255,255,255,0.28)", fontFamily: "Orbitron,monospace", fontSize: 7.5, letterSpacing: "0.12em", padding: "11px 10px", cursor: "pointer", transition: "color 0.2s", whiteSpace: "nowrap" }}>{label}</button>
            ))}
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 13px" }}>

            {/* MISSIONS */}
            {panel === PANELS.MISSIONS && (
              <div>
                <p style={eyebrow("rgba(255,255,255,0.28)")}>AVAILABLE MISSIONS</p>
                {t.missions.map(m => {
                  const locked = m.status === "locked";
                  const isActive = activeMission?.id === m.id;
                  return (
                    <div key={m.id} onClick={() => !locked && !missionRunning && setActiveMission(isActive ? null : m)}
                      style={{ background: isActive ? t.dim : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? t.color : "rgba(255,255,255,0.07)"}`, borderRadius: 3, padding: "13px 14px", marginBottom: 9, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.38 : 1, transition: "all 0.2s", position: "relative" }}>
                      {isActive && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${t.color},transparent)` }} />}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                        <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10.5, fontWeight: 700, color: isActive ? t.color : "white", flex: 1, lineHeight: 1.3 }}>{m.title}</span>
                        <div style={{ display: "flex", gap: 5, marginLeft: 6, flexShrink: 0, alignItems: "center" }}>
                          {locked && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", fontFamily: "Orbitron,monospace" }}>🔒</span>}
                          <Tag label={m.difficulty} color={DIFF_COLORS[m.difficulty]} />
                        </div>
                      </div>
                      <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", margin: "0 0 9px", lineHeight: 1.5 }}>{m.desc}</p>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "Orbitron,monospace", fontSize: 8.5, color: "rgba(255,255,255,0.28)" }}>⏱ {m.duration}</span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontFamily: "Orbitron,monospace", fontSize: 8.5, color: t.color }}>+{m.xp} XP</span>
                          <span style={{ fontFamily: "Orbitron,monospace", fontSize: 8.5, color: "#FFD700" }}>+{m.sb} ⬡</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activeMission && !missionRunning && (
                  <div style={{ marginTop: 14, border: `1px solid ${t.color}`, padding: "13px 14px", background: t.dim }}>
                    <div style={{ fontFamily: "Orbitron,monospace", fontSize: 9, color: t.color, marginBottom: 10, letterSpacing: "0.12em" }}>SELECTED: {activeMission.title}</div>
                    <button onClick={() => { setMissionRunning(true); setMissionPct(0); }}
                      style={{ ...btnFill(t.color), width: "100%", padding: "11px", fontSize: 10.5, letterSpacing: "0.2em" }}>LAUNCH MISSION →</button>
                  </div>
                )}
              </div>
            )}

            {/* CAREER */}
            {panel === PANELS.CAREER && (
              <div>
                <p style={eyebrow("rgba(255,255,255,0.28)")}>CAREER PROGRESS</p>
                <div style={{ border: `1px solid ${t.color}35`, borderRadius: 3, padding: "18px", marginBottom: 18, textAlign: "center", background: t.dim }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontFamily: "Orbitron,monospace", fontSize: 17, color: t.color, fontWeight: 700, marginBottom: 4 }}>{t.ranks[rankIndex]}</div>
                  <div style={{ fontFamily: "Orbitron,monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>CURRENT RANK</div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: "Orbitron,monospace", fontSize: 8.5, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>XP TO {t.ranks[rankIndex + 1] || "MAX"}</span>
                    <span style={{ fontFamily: "Orbitron,monospace", fontSize: 8.5, color: t.color }}>{xp} / {xpToNext}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${xpPct}%`, background: `linear-gradient(90deg,${t.color}70,${t.color})`, borderRadius: 2, transition: "width 0.8s ease" }} />
                  </div>
                </div>
                <p style={{ fontFamily: "Orbitron,monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", marginBottom: 18, textAlign: "right" }}>{Math.round(xpPct)}% COMPLETE</p>
                <div style={{ marginBottom: 20 }}>
                  <p style={eyebrow("rgba(255,255,255,0.28)")}>RANK ROADMAP</p>
                  {t.ranks.map((rank, i) => (
                    <div key={rank} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${i <= rankIndex ? t.color : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: i < rankIndex ? t.color : i === rankIndex ? t.dim : "transparent", flexShrink: 0 }}>
                        <span style={{ fontFamily: "Orbitron,monospace", fontSize: 9, color: i === rankIndex ? t.color : i < rankIndex ? "#020408" : "rgba(255,255,255,0.25)" }}>{i < rankIndex ? "✓" : i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "Orbitron,monospace", fontSize: 10.5, color: i === rankIndex ? t.color : i < rankIndex ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)" }}>{rank}</div>
                        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.22)", marginTop: 1 }}>{t.xpPerRank[i].toLocaleString()} XP</div>
                      </div>
                      {i === rankIndex && <span style={{ fontFamily: "Orbitron,monospace", fontSize: 7.5, color: t.color }}>← YOU</span>}
                    </div>
                  ))}
                </div>
                <p style={eyebrow("rgba(255,255,255,0.28)")}>PILOT STATS</p>
                {[["Flight Hours", "14.2 HRS"], ["Missions Completed", "3"], ["Landing Rating", "B+"], ["Academy Standing", "Top 18%"], ["SkyBucks Earned", `⬡ ${sb}`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{l}</span>
                    <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10.5, color: "white" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ECONOMY / STORE */}
            {panel === PANELS.ECONOMY && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ ...eyebrow("rgba(255,255,255,0.28)"), margin: 0 }}>SKYFORGE STORE</p>
                  <div style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", padding: "4px 10px" }}>⬡ {sb}</div>
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16, lineHeight: 1.5 }}>Spend SkyBucks on cosmetics, certified assets, and mission packs. Certified items count toward your real pilot pathway.</p>
                {shopItems.map(item => (
                  <div key={item.id} style={{ border: `1px solid ${item.owned ? `${t.color}40` : "rgba(255,255,255,0.07)"}`, borderRadius: 3, padding: "12px 13px", marginBottom: 9, background: item.owned ? t.dim : "rgba(255,255,255,0.015)", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 6 }}>
                          <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, fontWeight: 700, color: item.owned ? t.color : "white" }}>{item.name}</span>
                          <Tag label={item.type} color={item.type === "CERTIFIED" ? "#4ADE80" : item.type === "VR ASSET" ? "#A78BFA" : t.color} />
                        </div>
                        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.38)", margin: "0 0 10px", lineHeight: 1.4 }}>{item.desc}</p>
                        {item.owned ? (
                          <span style={{ fontFamily: "Orbitron,monospace", fontSize: 9, color: t.color, letterSpacing: "0.1em" }}>✓ OWNED</span>
                        ) : (
                          <button onClick={() => buyItem(item)} disabled={sb < item.price}
                            style={{ ...btnFill(sb >= item.price ? "#FFD700" : "rgba(255,215,0,0.2)"), color: sb >= item.price ? "#020408" : "rgba(255,255,255,0.3)", padding: "7px 16px", fontSize: 10, letterSpacing: "0.15em", cursor: sb >= item.price ? "pointer" : "not-allowed" }}>
                            ⬡ {item.price}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SQUAD */}
            {panel === PANELS.SQUAD && (
              <div>
                <p style={eyebrow("rgba(255,255,255,0.28)")}>YOUR SQUAD</p>
                <div style={{ border: `1px solid ${t.color}30`, borderRadius: 3, padding: "14px", marginBottom: 18, background: t.dim, textAlign: "center" }}>
                  <div style={{ fontFamily: "Orbitron,monospace", fontSize: 11, color: t.color, marginBottom: 6 }}>RED ARROWS FORMATION</div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", lineHeight: 1.5 }}>Fly Diamond 9 with your squad. Available on Quest VR — coming Phase 3.</p>
                  <button onClick={() => setToast("Red Arrows mode launching in Phase 3 — Quest VR!")} style={{ ...btnOutline(t.color), padding: "9px 20px", fontSize: 9.5, letterSpacing: "0.15em", color: t.color }}>JOIN FORMATION QUEUE</button>
                </div>
                <p style={eyebrow("rgba(255,255,255,0.28)")}>ONLINE PILOTS</p>
                {SQUAD_MEMBERS.map(m => {
                  const mt = TRACKS[m.track];
                  const statusColor = m.status === "online" ? "#4ADE80" : m.status === "in-mission" ? "#FACC15" : "rgba(255,255,255,0.2)";
                  return (
                    <div key={m.callsign} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, flexShrink: 0, boxShadow: m.status === "online" ? `0 0 6px ${statusColor}` : "none" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "Orbitron,monospace", fontSize: 10.5, color: "white" }}>{m.callsign}</div>
                        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{mt.icon} {m.rank} · {m.xp} XP</div>
                      </div>
                      <div style={{ fontSize: 9, color: statusColor, fontFamily: "Orbitron,monospace", letterSpacing: "0.08em" }}>{m.status.replace("-", " ").toUpperCase()}</div>
                      {m.status === "online" && (
                        <button onClick={() => setSquadInvite(m.callsign)} style={{ ...btnOutline(mt.color), padding: "4px 8px", fontSize: 8, color: mt.color, letterSpacing: "0.1em" }}>INVITE</button>
                      )}
                    </div>
                  );
                })}
                <div style={{ marginTop: 18 }}>
                  <p style={eyebrow("rgba(255,255,255,0.28)")}>LEADERBOARD</p>
                  {[...SQUAD_MEMBERS].sort((a, b) => b.xp - a.xp).map((m, i) => (
                    <div key={m.callsign} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: i === 0 ? "#FFD700" : "rgba(255,255,255,0.25)", width: 16 }}>#{i + 1}</span>
                      <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: "white", flex: 1 }}>{m.callsign}</span>
                      <span style={{ fontFamily: "Orbitron,monospace", fontSize: 9.5, color: TRACKS[m.track].color }}>{m.xp} XP</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", marginTop: 2, background: t.dim, borderRadius: 2, paddingLeft: 8 }}>
                    <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: t.color, width: 16 }}>#6</span>
                    <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: t.color, flex: 1 }}>{callsign} ← YOU</span>
                    <span style={{ fontFamily: "Orbitron,monospace", fontSize: 9.5, color: t.color }}>{xp} XP</span>
                  </div>
                </div>
              </div>
            )}

            {/* FLIGHT LOG */}
            {panel === PANELS.LOG && (
              <div>
                <p style={eyebrow("rgba(255,255,255,0.28)")}>FLIGHT LOG</p>
                {FLIGHT_LOG.map((e, i) => (
                  <div key={i} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2, padding: "11px 13px", marginBottom: 9, background: "rgba(255,255,255,0.015)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: "white" }}>{e.title}</span>
                      <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: t.color }}>{e.grade}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>{e.date} · {e.duration}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontFamily: "Orbitron,monospace", fontSize: 8.5, color: t.color }}>+{e.xp} XP</span>
                        <span style={{ fontFamily: "Orbitron,monospace", fontSize: 8.5, color: "#FFD700" }}>+{e.sb} ⬡</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: "18px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                  <div style={{ fontFamily: "Orbitron,monospace", fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: "0.15em", marginBottom: 12 }}>TOTAL LOGGED</div>
                  {[["Flight Hours", "14.2 HRS"], ["Total XP", `${xp}`], ["SkyBucks Earned", `⬡ ${sb}`]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)" }}>{l}</span>
                      <span style={{ fontFamily: "Orbitron,monospace", fontSize: 10, color: "white" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE HELPERS
// ═══════════════════════════════════════════════════════════════

const bgBase = {
  minHeight: "100vh", width: "100%",
  background: "linear-gradient(180deg,#050810 0%,#0A1628 55%,#0D1F3C 100%)",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  position: "relative", overflow: "hidden", fontFamily: "'Inter',system-ui,sans-serif", color: "#F0F8FF",
};

const eyebrow = (color) => ({ fontFamily: "Orbitron,monospace", fontSize: 9, letterSpacing: "0.25em", color, marginBottom: 12, textTransform: "uppercase" });

const btnFill = (color) => ({ background: color, border: "none", color: "#020408", fontFamily: "Orbitron,monospace", letterSpacing: "0.2em", cursor: "pointer", fontWeight: 700, transition: "opacity 0.2s", display: "inline-block" });

const btnOutline = (color) => ({ background: "transparent", border: `1px solid ${color}`, fontFamily: "Orbitron,monospace", letterSpacing: "0.2em", cursor: "pointer", transition: "background 0.2s", display: "inline-block" });

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [screen, setScreen] = useState(SCREENS.INTRO);
  const [callsign, setCallsign] = useState("");
  const [trackId, setTrackId] = useState(null);
  const [visible, setVisible] = useState(true);

  const go = useCallback((next, delay = 350) => {
    setVisible(false);
    setTimeout(() => { setScreen(next); setVisible(true); }, delay);
  }, []);

  const style = { opacity: visible ? 1 : 0, transition: "opacity 0.35s ease", minHeight: "100vh" };

  return (
    <div style={style}>
      {screen === SCREENS.INTRO && <IntroScreen onNext={() => go(SCREENS.NAME)} />}
      {screen === SCREENS.NAME && <NameScreen onNext={cs => { setCallsign(cs); go(SCREENS.TRACK); }} />}
      {screen === SCREENS.TRACK && <TrackScreen callsign={callsign} onNext={tid => { setTrackId(tid); go(SCREENS.BRIEF); }} />}
      {screen === SCREENS.BRIEF && <BriefScreen callsign={callsign} trackId={trackId} onNext={() => go(SCREENS.COCKPIT)} />}
      {screen === SCREENS.COCKPIT && <CockpitScreen callsign={callsign} trackId={trackId} />}
    </div>
  );
}
