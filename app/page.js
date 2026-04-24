"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const CROWN = (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
    <path d="M3 15 L3 9 L6.5 12.5 L10 7 L13.5 12.5 L17 9 L17 15 Z" />
  </svg>
);

const MIC_ICON = (
  <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" width="16" height="16">
    <rect x="7" y="2" width="6" height="11" rx="3" />
    <path d="M4 9a6 6 0 0012 0M10 15v3M7 18h6" />
  </svg>
);

function speak(text, onStart, onEnd) {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-GB";
  utt.rate = 0.93;
  utt.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const v =
    voices.find((v) => v.lang.startsWith("en") && v.name.includes("Female")) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (v) utt.voice = v;
  utt.onstart = onStart;
  utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

export default function Home() {
  const [chatOpen, setChatOpen]   = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [speaking, setSpeaking]   = useState(false);
  const [listening, setListening] = useState(false);
  const [showDot, setShowDot]     = useState(true);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const recognRef   = useRef(null);
  const videoRef    = useRef(null);

  // Load voices
  useEffect(() => {
    if (typeof window !== "undefined") window.speechSynthesis.getVoices();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens + greet
  useEffect(() => {
    if (!chatOpen) return;
    setTimeout(() => inputRef.current?.focus(), 400);
    if (messages.length === 0) {
      setTimeout(() => sendEmma("Hi! I'm Emma, your KLM guide — where are we flying today? ✈"), 600);
    }
    setShowDot(false);
  }, [chatOpen]);

  function sendEmma(text) {
    setMessages((m) => [...m, { role: "assistant", content: text }]);
    speak(
      text,
      () => setSpeaking(true),
      () => setSpeaking(false)
    );
  }

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const next = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      sendEmma(data.reply);
    } catch {
      sendEmma("I'm having a moment — could you try again?");
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const startListen = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    recognRef.current = rec;
    setListening(true);
    rec.start();
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join("");
      setInput(t);
      if (e.results[e.results.length - 1].isFinal) {
        rec.stop();
        setListening(false);
        sendMessage(t);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
  }, [messages, loading]);

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    stage: {
      position: "relative", zIndex: 1,
      width: 340, display: "flex", flexDirection: "column",
      alignItems: "center", gap: 20,
    },
    brand: {
      display: "flex", alignItems: "center", gap: 10,
      animation: "fadeUp 0.6s 0.3s ease forwards", opacity: 0,
    },
    brandLogo: {
      width: 36, height: 36, borderRadius: "50%", background: "#00A1DE",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    phone: {
      width: 300, height: 548, borderRadius: 42,
      border: "8px solid #1a1a2e", background: "#0a1628",
      position: "relative", overflow: "hidden",
      boxShadow: "0 0 0 1px #2a2a4a,0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.06)",
      animation: "phoneIn 0.7s 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards", opacity: 0,
    },
    sbar: {
      background: "#001F5B", padding: "10px 22px 6px",
      display: "flex", justifyContent: "space-between",
      color: "white", fontSize: 11, fontWeight: 600,
    },
    apphead: {
      background: "#001F5B",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "6px 18px 10px",
    },
    hico: {
      width: 26, height: 26, borderRadius: "50%",
      border: "1.5px solid rgba(255,255,255,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.6)", fontSize: 11,
    },
    klmPill: {
      background: "rgba(0,161,222,0.2)", border: "1px solid rgba(0,161,222,0.4)",
      borderRadius: 6, padding: "3px 12px",
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: 11, color: "#00A1DE", letterSpacing: "0.1em",
    },
    hero: { height: 172, background: "#001F5B", position: "relative", overflow: "hidden" },
    heroPlane: {
      position: "absolute", right: -40, top: 5, width: 260, height: 150,
      background: "radial-gradient(ellipse at 30% 50%,#0072CE,#001F5B)",
      borderRadius: "50% 50% 50% 50%/60% 60% 40% 40%", opacity: 0.7,
    },
    heroGlow: {
      position: "absolute", right: 0, top: 0, bottom: 0, width: "40%",
      background: "radial-gradient(ellipse at right,rgba(0,161,222,0.3),transparent)",
    },
    heroTxt: {
      position: "absolute", bottom: 16, left: 18, color: "white",
      fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, lineHeight: 1.25,
    },
    abody: { background: "#0a1628", padding: "16px 14px 0" },
    dcard: {
      borderRadius: 14, overflow: "hidden", height: 132,
      position: "relative", background: "linear-gradient(135deg,#006994,#004F7C)",
    },
    // Emma button
    emmaWrap: {
      position: "absolute", right: 14, bottom: 66,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
      zIndex: 60,
      animation: "emmaAppear 0.5s 1.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      opacity: 0, cursor: "pointer",
    },
    emmaBtn: {
      width: 54, height: 54, borderRadius: "50%", background: "#00A1DE",
      border: "3px solid white", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 20px rgba(0,161,222,0.5)",
    },
    emmaLabel: {
      background: "#001F5B", color: "white", fontSize: 10, fontWeight: 600,
      padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em",
      whiteSpace: "nowrap", border: "1px solid rgba(0,161,222,0.35)",
    },
    // Tab bar
    tabbar: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      background: "#0a1628", borderTop: "0.5px solid rgba(255,255,255,0.08)",
      display: "flex", justifyContent: "space-around", padding: "8px 0 14px",
    },
    // Chat overlay
    chatOverlay: {
      position: "absolute", inset: 0, zIndex: 80,
      display: "flex", flexDirection: "column",
      borderRadius: 34, overflow: "hidden",
      transform: chatOpen ? "translateY(0)" : "translateY(100%)",
      transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
    },
    chatHeader: {
      background: "#001F5B", padding: "14px 16px 12px",
      display: "flex", alignItems: "center", gap: 10,
      borderBottom: "1px solid rgba(0,161,222,0.15)", flexShrink: 0,
    },
    emmaVideo: {
      background: "#001530", height: 220,
      position: "relative", overflow: "hidden", flexShrink: 0,
    },
    chatBody: {
      background: "#f0f4f8", flex: 1, padding: "12px 12px 8px",
      overflowY: "auto", display: "flex", flexDirection: "column", gap: 8,
    },
    chatInput: {
      background: "white", borderTop: "1px solid rgba(0,0,0,0.06)",
      padding: "10px 12px", display: "flex", alignItems: "center", gap: 8,
      flexShrink: 0,
    },
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={S.stage}>

      {/* Brand header */}
      <div style={S.brand}>
        <div style={S.brandLogo}>{CROWN}</div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"white", letterSpacing:"0.12em" }}>
            KLM EMMA
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:"0.2em", marginTop:1 }}>
            VIRTUAL JOURNEY GUIDE
          </div>
        </div>
      </div>

      {/* Phone shell */}
      <div style={S.phone}>

        {/* Status bar */}
        <div style={S.sbar}>
          <span>11:06</span>
          <span style={{ opacity:.5, fontSize:9 }}>◄ App Store</span>
          <span>5G ▋</span>
        </div>

        {/* App header */}
        <div style={S.apphead}>
          <div style={S.hico}>🔔</div>
          <div style={S.klmPill}>KLM</div>
          <div style={S.hico}>?</div>
        </div>

        {/* Hero */}
        <div style={S.hero}>
          <div style={S.heroPlane}/>
          <div style={S.heroGlow}/>
          <div style={S.heroTxt}>Wat is uw<br/>volgende<br/>bestemming?</div>
        </div>

        {/* Body */}
        <div style={S.abody}>
          <div style={{ color:"white", fontWeight:600, fontSize:15, marginBottom:10 }}>
            Bestemmingen en deals
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <div style={{ border:"1.5px solid #00A1DE", borderRadius:50, padding:"5px 14px", color:"#00A1DE", fontSize:11, background:"rgba(0,161,222,0.08)" }}>Deals</div>
            <div style={{ border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:50, padding:"5px 14px", color:"rgba(255,255,255,0.5)", fontSize:11 }}>KLM Holidays</div>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:10 }}>
            Vertrekken vanaf <b style={{ color:"#00A1DE" }}>Amsterdam ∨</b>
          </div>
          <div style={S.dcard}>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0099CC 0%,#FF7043 45%,#FFA726 70%,#006994 100%)", opacity:.85 }}/>
            <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.65)", borderRadius:20, padding:"3px 10px", color:"white", fontSize:10, fontWeight:600 }}>⊠ Promotarief</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:55, background:"linear-gradient(0deg,rgba(0,0,0,0.65),transparent)" }}/>
            <div style={{ position:"absolute", bottom:12, left:14, color:"white", fontFamily:"'Syne',sans-serif", fontSize:21, fontWeight:800 }}>Bonaire</div>
          </div>
        </div>

        {/* Emma floating button */}
        <div style={S.emmaWrap} onClick={() => setChatOpen(true)}>
          <div style={{ position:"relative", width:54, height:54 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                position:"absolute", inset:-2, borderRadius:"50%",
                border:"2px solid rgba(0,161,222,0.7)",
                animation:`ripple 2.6s ease-out ${i*0.9}s infinite`,
                pointerEvents:"none",
              }}/>
            ))}
            <div style={S.emmaBtn}>
              {/* Emma face */}
              <div style={{ width:40, height:40, borderRadius:"50%", background:"#E8C4A0", overflow:"hidden", position:"relative" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"48%", background:"#C0AE8E", borderRadius:"50% 50% 0 0" }}/>
                <div style={{ position:"absolute", top:2, left:2, right:2, height:"40%", background:"rgba(200,200,200,0.4)", borderRadius:"50% 50% 0 0" }}/>
                <div style={{ position:"absolute", top:"44%", left:"50%", transform:"translateX(-50%)", display:"flex", gap:7 }}>
                  <div style={{ width:5, height:6, borderRadius:"50%", background:"#5C3D1E" }}/>
                  <div style={{ width:5, height:6, borderRadius:"50%", background:"#5C3D1E" }}/>
                </div>
                <div style={{ position:"absolute", bottom:"24%", left:"50%", transform:"translateX(-50%)", width:12, height:5, borderBottom:"2px solid #CC2200", borderRadius:"0 0 6px 6px" }}/>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"32%", background:"#0072CE" }}/>
              </div>
              {showDot && (
                <div style={{
                  position:"absolute", top:-1, right:-1, width:16, height:16,
                  borderRadius:"50%", background:"#EF4444", border:"2.5px solid white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"white", fontSize:8, fontWeight:700,
                  animation:"dotPop 0.4s 2s cubic-bezier(0.34,1.56,0.64,1) both",
                }}>1</div>
              )}
            </div>
          </div>
          <div style={S.emmaLabel}>Ask Emma</div>
        </div>

        {/* Tab bar */}
        <div style={S.tabbar}>
          {[["⌂","Home",true],["✈","Boeken",false],["📅","Mijn reizen",false],["⏱","Vluchtstatus",false],["○","Account",false]].map(([ico,lbl,on])=>(
            <div key={lbl} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, color: on ? "#00A1DE" : "rgba(255,255,255,0.3)", fontSize:9 }}>
              <span style={{ fontSize:16 }}>{ico}</span><span>{lbl}</span>
            </div>
          ))}
        </div>

        {/* ── CHAT OVERLAY ── */}
        <div style={S.chatOverlay}>

          {/* Chat header */}
          <div style={S.chatHeader}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#00A1DE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {CROWN}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:"white", letterSpacing:"0.04em" }}>EMMA · KLM</div>
              <div style={{ fontSize:10, display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: speaking ? "#22c55e" : listening ? "#EF4444" : "#22c55e", animation:"dotPop 0s both" }}/>
                <span style={{ color: speaking ? "#22c55e" : listening ? "#EF4444" : "#22c55e" }}>
                  {speaking ? "Speaking…" : listening ? "Listening…" : "Online"}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setChatOpen(false); window.speechSynthesis.cancel(); setSpeaking(false); }}
              style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"white", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}
            >✕</button>
          </div>

          {/* Emma video / avatar area */}
          <div style={S.emmaVideo}>
            <video
              ref={videoRef}
              src="/emma-video.mp4"
              autoPlay loop muted playsInline
              style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }}
            />
            {/* Speaking wave bars */}
            <div style={{
              position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
              display:"flex", gap:4, alignItems:"flex-end", height:20, zIndex:4,
              opacity: speaking ? 1 : 0.3, transition:"opacity 0.3s",
            }}>
              {[8,14,20,14,8,12].map((h,i)=>(
                <div key={i} style={{
                  width:3, height:h, borderRadius:2, background:"#00A1DE",
                  animation: speaking ? `waveAnim ${0.5+i*0.1}s ease-in-out ${i*0.08}s infinite` : "none",
                  opacity: speaking ? 1 : 0.4,
                }}/>
              ))}
            </div>
            {/* Bottom gradient */}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:48, background:"linear-gradient(0deg,rgba(0,15,40,0.7),transparent)", zIndex:3, pointerEvents:"none" }}/>
          </div>

          {/* Messages */}
          <div style={S.chatBody}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start",
                animation:"msgIn 0.3s ease forwards",
                gap:6, alignItems:"flex-end",
              }}>
                {m.role==="assistant" && (
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"#00A1DE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="10" height="10" viewBox="0 0 20 20" fill="white"><path d="M3 15 L3 9 L6.5 12.5 L10 7 L13.5 12.5 L17 9 L17 15 Z"/></svg>
                  </div>
                )}
                <div style={{
                  maxWidth:"80%", padding:"9px 12px", fontSize:12, lineHeight:1.5,
                  background: m.role==="user" ? "#00A1DE" : "white",
                  color: m.role==="user" ? "white" : "#1e293b",
                  borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  border: m.role==="assistant" ? "1px solid rgba(0,0,0,0.06)" : "none",
                }}>{m.content}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display:"flex", gap:6, alignItems:"flex-end", animation:"msgIn 0.3s ease" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"#00A1DE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="10" height="10" viewBox="0 0 20 20" fill="white"><path d="M3 15 L3 9 L6.5 12.5 L10 7 L13.5 12.5 L17 9 L17 15 Z"/></svg>
                </div>
                <div style={{ background:"white", borderRadius:"16px 16px 16px 4px", border:"1px solid rgba(0,0,0,0.06)", padding:"10px 14px", display:"flex", gap:4, alignItems:"center" }}>
                  {[0,0.2,0.4].map((d,i)=>(
                    <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#94a3b8", animation:`typeDot 1.2s ${d}s ease-in-out infinite` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input bar */}
          <div style={S.chatInput}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={listening ? "Listening…" : "Ask Emma anything…"}
              disabled={loading || listening}
              style={{
                flex:1, background:"#f1f5f9", borderRadius:50,
                padding:"9px 16px", fontSize:12, color:"#1e293b",
                border:"none", fontFamily:"'IBM Plex Sans',sans-serif",
              }}
            />
            {input.trim() && (
              <button
                onClick={() => sendMessage()}
                disabled={loading}
                style={{
                  width:36, height:36, borderRadius:"50%", background:"#00A1DE",
                  border:"none", cursor:"pointer", display:"flex", alignItems:"center",
                  justifyContent:"center", flexShrink:0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 10h14M10 3l7 7-7 7"/>
                </svg>
              </button>
            )}
            <button
              onPointerDown={startListen}
              style={{
                width:36, height:36, borderRadius:"50%",
                background: listening ? "#EF4444" : "#00A1DE",
                border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0,
                animation: listening ? "micPulseAnim 1s ease-in-out infinite" : "none",
              }}
            >
              {MIC_ICON}
            </button>
          </div>

        </div>{/* end chat overlay */}

      </div>{/* end phone */}

      {/* Bottom caption */}
      <div style={{ textAlign:"center", animation:"fadeUp 0.5s 1.8s ease forwards", opacity:0 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:"white", letterSpacing:"0.08em" }}>ALWAYS ONE TAP AWAY</div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:"0.12em", marginTop:3 }}>KLM APP · EMMA VIRTUAL GUIDE</div>
      </div>

    </div>
  );
}
