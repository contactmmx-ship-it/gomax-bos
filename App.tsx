import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Briefcase, 
  Award, 
  Network, 
  ArrowUpRight, 
  Activity, 
  Layers, 
  FileText,
  HelpCircle,
  TrendingUp,
  Sliders,
  CheckCircle,
  Database,
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertTriangle,
  Gauge,
  Terminal,
  UserCheck,
  Compass,
  DollarSign,
  MapPin,
  Truck,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Cpu,
  MessageSquare,
  Send,
  X,
  User,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MASTER_SOP_DATA } from "./data";
import { SopModule, SopPage } from "./types";

// A beautiful, magical staggered text rendering component for technical records
function MagicalText({ text }: { text: string }) {
  if (!text) return null;
  const words = text.split(" ");
  return (
    <span className="flex flex-wrap gap-x-1 gap-y-0.5">
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)", y: 6 }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.35,
            delay: idx * 0.012,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="inline-block text-slate-300 font-sans leading-relaxed text-sm md:text-base"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// Interfaces for our Boardroom presentation sequence
interface AutopilotSlide {
  tab: "brand" | "crm" | "sop";
  sopIdx?: number;
  pageIdx?: number;
  title: string;
  narrative: string;
}

export default function App() {
  // Landing page state
  const [hasEnteredBoardroom, setHasEnteredBoardroom] = useState<boolean>(false);
  const [landingPhase, setLandingPhase] = useState<"idle" | "entering" | "done">("idle");

  // Main app tab state: "brand" | "crm" | "sop"
  const [activeTab, setActiveTab] = useState<"brand" | "crm" | "sop">("sop");

  // SOP Master Manual state
  const [activeSopIdx, setActiveSopIdx] = useState<number>(0);
  const [activePageIdx, setActivePageIdx] = useState<number>(0);

  // Search & Filtering elements
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  // Voice narration and synthetic state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const briefingTimeoutRef = useRef<any>(null);
  const crmTypingTimersRef = useRef<any[]>([]);

  const clearCrmTypingTimers = () => {
    crmTypingTimersRef.current.forEach(t => {
      clearTimeout(t);
      clearInterval(t);
    });
    crmTypingTimersRef.current = [];
  };

  // CUSTOM VOCAL CONFIGURATORS (to make synthesis feel organic & human, not robotic)
  const [voiceRate, setVoiceRate] = useState<number>(0.90); // Natural, clear cadence
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUnlocked, setVoiceUnlocked] = useState<boolean>(false);
  const voiceUnlockedRef = useRef<boolean>(false);
  const speakingActiveRef = useRef<boolean>(false); // set false to break chunk chain on stop
  // Refs so voice params are never stale inside callbacks
  const voiceRateRef = useRef<number>(0.90);
  const voicePitchRef = useRef<number>(1.0);
  const selectedVoiceRef = useRef<string>("");
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [voiceProfile, setVoiceProfile] = useState<"executive" | "senior" | "chairman" | "mute">("executive");

  // CRM SIMULATION EXHAUSTIVE STATES
  const [crmMode, setCrmMode] = useState<"sim" | "iframe">("iframe");
  const [crmLoginEmail, setCrmLoginEmail] = useState<string>("");
  const [crmLoginPassword, setCrmLoginPassword] = useState<string>("");
  const [crmLoginStatus, setCrmLoginStatus] = useState<"prompting" | "typing" | "loggedIn">("prompting");
  const [crmIsAutoplay, setCrmIsAutoplay] = useState<boolean>(true);
  const [crmActiveSubTab, setCrmActiveSubTab] = useState<number>(0);
  const [crmPromptCountdown, setCrmPromptCountdown] = useState<number>(5);
  const [crmAutoplayTimer, setCrmAutoplayTimer] = useState<any>(null);
  const [crmShowOverrideAlert, setCrmShowOverrideAlert] = useState<boolean>(false);
  const [crmActiveOrderIndex, setCrmActiveOrderIndex] = useState<number | null>(null);
  const [crmNotification, setCrmNotification] = useState<string | null>(null);

  // Mock CRM Mutable Data for Interactive Controls
  const [crmDealers, setCrmDealers] = useState([
    { id: "DL-101", name: "Alpha Distributors", balance: "₹4,85,000", limit: "₹3,00,000", days: 85, status: "Critical Hold", phone: "+91 98765 00101" },
    { id: "DL-102", name: "Ganga Agencies", balance: "₹1,20,000", limit: "₹2,50,000", days: 12, status: "Compliant Approved", phone: "+91 98765 00102" },
    { id: "DL-103", name: "Saraswati Retailers", balance: "₹2,95,000", limit: "₹3,00,000", days: 55, status: "Overdue Attention", phone: "+91 98765 00103" },
    { id: "DL-104", name: "Leopard Tradewings", balance: "₹80,000", limit: "₹1,50,000", days: 8, status: "Compliant Approved", phone: "+91 98765 00104" }
  ]);

  const [crmSpacingRecords, setCrmSpacingRecords] = useState([
    { region: "Western District A", dealerA: "Alpha Dist.", dealerB: "Beta Enterprises", distance: "1.2 km", index: "VIOLATION - Closest Hub Spacing is <2km", code: "SOP-11-ERR" },
    { region: "Southern Sector B", dealerA: "Ganga Agencies", dealerB: "Yamuna Traders", distance: "4.8 km", index: "COMPLIANT - Meets spacing guidelines", code: "SOP-11-OK" },
    { region: "Northern Sector D", dealerA: "Saraswati Store", dealerB: "Krishna Sales", distance: "3.2 km", index: "COMPLIANT", code: "SOP-11-OK" }
  ]);

  const [crmPendingOrders, setCrmPendingOrders] = useState([
    { id: "ORD-9908", dealer: "Alpha Distributors", amount: "₹1,85,000", sopRisk: "SOP 12 Credit Overdue Exceeded", actionable: false },
    { id: "ORD-9909", dealer: "Ganga Agencies", amount: "₹65,000", sopRisk: "None - Credit Approved", actionable: true },
    { id: "ORD-9910", dealer: "Saraswati Retailers", amount: "₹1,20,000", sopRisk: "SOP 12 Exposure Alert", actionable: true }
  ]);

  const [crmTradeSchemes, setCrmTradeSchemes] = useState([
    { code: "SCH-GOMAX-GOLD", desc: "Gold Slab discount - Cases >500", discount: "4%", approval: "Authorized - Sales Head Signed", status: "Active" },
    { code: "SCH-GOMAX-SILVER", desc: "Silver Slab discount - Cases >200", discount: "2%", approval: "Authorized - Audit Signed", status: "Active" },
    { code: "SCH-VERBAL-DEAL", desc: "Verbal Discount promise from SE Varma", discount: "7.5%", approval: "BLOCKED - SOP 05 Violation: No verbal deals permitted", status: "Invalidated" }
  ]);

  const [crmOffboardingLedgers, setCrmOffboardingLedgers] = useState([
    { employee: "S. Varma (Ex-Sales Executive)", exitDate: "2026-05-30", appSoftwareDeactivated: true, samplesReturned: true, accountsSettled: false, status: "Under SOP 10 30-Day Audit" },
    { employee: "M. Kishore (Distributor exit)", exitDate: "2026-06-01", appSoftwareDeactivated: true, samplesReturned: false, accountsSettled: false, status: "Action Needed (Return Sample Kit)" }
  ]);

  // Interactive Simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStage, setSimStage] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [checkedFlowchartSteps, setCheckedFlowchartSteps] = useState<boolean[]>([false, false, false, false, false]);
  const simTimeoutRefs = useRef<any[]>([]);

  // AUTOPILOT PRESENTATION STATE
  const [isAutopilot, setIsAutopilot] = useState<boolean>(false);
  const [autopilotStep, setAutopilotStep] = useState<number>(0);
  const autopilotTimerRef = useRef<any>(null);

  // CHATBOT ASSISTANT STATE
  const [chatbotOpen, setChatbotOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Greetings. I am the GoMax AI Advisor, powered by Gemini and trained on all 22 GoMax Standard Operating Procedures. Ask me anything about our sales rules, credit controls, dealer policies, trade schemes, or brand roadmap."
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // 12 High-fidelity slide definitions for Directors Presentation
  const presentationSlides: AutopilotSlide[] = [
    {
      tab: "brand",
      title: "Welcome & Brand Roadmap",
      narrative: "Welcome to the GoMax Business Operating System. On the screen right now you can see the Brand Roadmap. This is not a marketing slide. This is an honest picture of exactly where GoMax stands today as a company building towards becoming a real brand. We are at Stage One of a five stage journey. The amber marker on the journey bar shows our current position. Everything to the right of it is still ahead of us."
    },
    {
      tab: "brand",
      title: "Brand Status — Stage 1 of 5",
      narrative: "Look at the eight pillar cards on screen. Only the first one, Standard Operating Procedures, is glowing in amber. That is the one thing GoMax has fully completed. The remaining seven cards are greyed out because they are pending. The bottom section shows five priority actions ranked from P one to P five. P one is to deploy this system internally right now. P two is staff training. This is what leadership needs to act on immediately."
    },
    {
      tab: "crm",
      title: "CRM Demo Module Walkthrough",
      narrative: "Now we are on the CRM module. You can see five tabs across the top of this panel. Each tab is a critical control system. The first tab is the collections ledger, tracking every dealer outstanding by age. The second tab enforces dealer spacing rules. The third controls credit and dispatch. The fourth governs trade scheme approvals. And the fifth manages exits. The data on screen is illustrative right now. But this is exactly how every real transaction will be tracked once live data is connected."
    },
    {
      tab: "sop",
      sopIdx: 0, // SOP 01 Sales Operations
      pageIdx: 0,
      title: "Blueprint Directory & SOP 1",
      narrative: "We are now on the SOP Manual. On the left you can see all twenty two SOPs listed. On the right is the selected SOP in full detail. Look at the clause tabs at the top. Objective, Trigger Policy, Workflow, Risks, Ownership, and Role Specs. Every SOP is structured into these six sections. SOP One governs everything that happens in the field. Daily check in timings, route plans, market coverage targets. Not a single Sales Executive is allowed to go to market without a formally approved route plan."
    },
    {
      tab: "sop",
      sopIdx: 0,
      pageIdx: 2, // Workflow
      title: "SOP 1 - Sales Operations Workflow",
      narrative: "Now look at the Workflow clause of SOP One. The Sales Head sets the annual target first. Then it is broken down territory wise, product wise, and month wise. Each Sales Executive prepares a weekly route plan. Every evening by seven PM the Daily Sales Report is submitted. Any deviation from the approved route plan automatically raises a high importance flag. There is no room for verbal reporting inside this system."
    },
    {
      tab: "sop",
      sopIdx: 1, // SOP 02 Collection
      pageIdx: 0,
      title: "SOP 2 - Dealer Collections & Finance",
      narrative: "We move to SOP Two, Collections. This SOP is the heartbeat of GoMax cash flow. The system maintains a dealer wise aging register. Every outstanding amount is tracked by the number of days it has been pending. If any dealer crosses sixty days overdue, the system automatically blocks their dispatch. That is not a manual decision. Capital protection is built into the process, not left to anyone memory or judgment."
    },
    {
      tab: "sop",
      sopIdx: 1,
      pageIdx: 3, // Risks
      title: "SOP 2 - Compliance Risks & Fines",
      narrative: "The Compliance Risks section of SOP Two is critical. Any payment delay that crosses the threshold triggers an automatic dispatch block. There is zero manual override available at the field level. A Sales Manager cannot push a delivery for an overdue dealer. Only a written approval from the Sales Head can unblock the order. This single rule alone protects GoMax from the biggest source of capital leakage in any distribution business."
    },
    {
      tab: "sop",
      sopIdx: 4, // SOP 05 Trade Schemes
      pageIdx: 0,
      title: "SOP 5 - Trade Schemes & Promotions",
      narrative: "SOP Five governs Trade Schemes and Promotions. This is the most violated area in any distribution company. A Sales Executive promises a dealer extra discount verbally to close an order. That promise creates a billing dispute later. SOP Five eliminates this completely. Any discount or promotional slab without written signed approval from the Sales Head is automatically non payable. Zero exceptions. The CRM scheme tab you saw earlier showed exactly this. The verbal promise was flagged and blocked."
    },
    {
      tab: "sop",
      sopIdx: 11, // SOP 12 Credit to Dealers
      pageIdx: 0,
      title: "SOP 12 - Credit Limits Policy",
      narrative: "SOP Twelve is our Credit Policy. Every dealer has a formally assigned credit limit based on sales history, payment record, and territory potential. These limits are pre loaded. The moment a dealer places an order that would push them beyond their approved limit, the system blocks it automatically. Accounts is the only team that can perform a credit review. The Sales team has no override access at all. This is how GoMax keeps bad debt at zero."
    },
    {
      tab: "sop",
      sopIdx: 16, // SOP 17 Rate of Product
      pageIdx: 0,
      title: "SOP 17 - Product Pricing Uniformity",
      narrative: "SOP Seventeen is Pricing Control. In most distribution companies, pricing becomes chaotic over time. Different dealers get billed at different rates. This creates channel conflict and margin erosion. SOP Seventeen prevents this. Every billing transaction must match the approved rate template. Any deviation, any undercutting, any offline discount requires written board approval. If market intelligence reports a pricing anomaly, a formal audit is triggered immediately."
    },
    {
      tab: "sop",
      sopIdx: 18, // SOP 19 Dealer Termination & Exit
      pageIdx: 0,
      title: "SOP 19 - Dealer Stewardships & Exits",
      narrative: "Our final SOP is Nineteen, Dealer Appointment and Exit. Adding a dealer to the GoMax network is not a casual decision. It requires a formal market survey, SM validation, document collection, credit assessment, and Sales Head approval before the agreement is signed. On exit, system access is deactivated within twenty four hours. A thirty day financial audit begins immediately to verify all assets, samples, and outstanding dues. No dealer exits the network with any loose ends."
    },
    {
      tab: "sop",
      sopIdx: 0,
      pageIdx: 0,
      title: "Interactive Q&A Session",
      narrative: "That concludes our GoMax Business Operating System walkthrough. What you have seen is not a concept. It is a working system. The Brand Roadmap shows where we are and what must happen next. The CRM module shows how every dealer transaction will be controlled. And the twenty two SOPs form the complete governance backbone behind all of it. The AI Advisor at the bottom right of your screen is ready to answer any specific question about any SOP, any policy, or the brand roadmap. Thank you."
    }
  ];

  // Unique departments for our filters
  const departments = ["ALL", ...Array.from(new Set(MASTER_SOP_DATA.map(s => s.dept)))];

  // Stop currently spoken text
  const stopBriefing = () => {
    speakingActiveRef.current = false; // kills any active chunk chain immediately
    if (briefingTimeoutRef.current) {
      clearTimeout(briefingTimeoutRef.current);
      briefingTimeoutRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    (window as any)._activeUtterance = null;
    setIsSpeaking(false);
  };

  // Speaks text in sentence chunks — prevents Chromium word-dropping bug on long utterances
  // Unlock Chrome audio policy — must be called from a real user click before any speech
  const startBriefing = (title: string, text: string) => {
    if (voiceProfile === "mute") return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    speakingActiveRef.current = false; // stop any previous chain
    try { window.speechSynthesis.cancel(); } catch (e) {}
    if (briefingTimeoutRef.current) { clearTimeout(briefingTimeoutRef.current); briefingTimeoutRef.current = null; }
    setIsSpeaking(false);

    const clean = (s: string) => s
      .replace(/\u20B9/g, " rupees ").replace(/%/g, " percent ")
      .replace(/>/g, " greater than ").replace(/&/g, " and ")
      .replace(/\n/g, ". ").replace(/  +/g, " ").trim();

    const fullText = clean(`${title}. ${text}`);

    const sentences = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];
    const chunks: string[] = [];
    let buf = "";
    for (const s of sentences) {
      buf = buf ? buf + " " + s.trim() : s.trim();
      if (buf.split(" ").length >= 15) { chunks.push(buf); buf = ""; }
    }
    if (buf.trim()) chunks.push(buf.trim());

    let idx = 0;
    speakingActiveRef.current = true; // mark this chain as active
    const speakChunk = () => {
      if (!speakingActiveRef.current) { // chain was stopped — bail out
        setIsSpeaking(false);
        (window as any)._activeUtterance = null;
        return;
      }
      if (idx >= chunks.length) {
        setIsSpeaking(false);
        speakingActiveRef.current = false;
        (window as any)._activeUtterance = null;
        return;
      }
      const utter = new SpeechSynthesisUtterance(chunks[idx]);
      (window as any)._activeUtterance = utter;
      utteranceRef.current = utter;
      utter.rate = voiceRateRef.current;
      utter.pitch = voicePitchRef.current;
      if (selectedVoiceRef.current) {
        const v = availableVoicesRef.current.find(v => v.name === selectedVoiceRef.current);
        if (v) utter.voice = v;
      }
      if (idx === 0) utter.onstart = () => { console.log("[GoMax Voice] Speaking chunk", idx); setIsSpeaking(true); };
      utter.onend = () => { idx++; setTimeout(speakChunk, 80); };
      utter.onerror = (e: any) => { console.warn("[GoMax Voice] Chunk error:", e.error, "chunk:", idx); idx++; setTimeout(speakChunk, 80); };
      try {
        console.log("[GoMax Voice] speak() chunk", idx, ":", chunks[idx - 1] || chunks[0]);
        window.speechSynthesis.speak(utter);
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      } catch (err) {
        console.error("[GoMax Voice] speak() threw:", err);
        setIsSpeaking(false);
      }
    };

    briefingTimeoutRef.current = setTimeout(speakChunk, 50);
  };

  // Loader for Speech Synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadAllVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        setAvailableVoices(vList);
        availableVoicesRef.current = vList;
        console.log("[GoMax Voice] Available voices:", vList.map(v => v.name + " (" + v.lang + ")"));
        
        // Pick best available voice — use whatever is available, don't fail silently
        let defaultPref = vList.find(v => v.lang.includes("en-IN") && v.name.includes("Google")) ||
                          vList.find(v => v.lang.includes("en-IN")) ||
                          vList.find(v => v.lang.includes("en-US") && v.name.includes("Google")) ||
                          vList.find(v => v.lang.includes("en-US")) ||
                          vList.find(v => v.lang.includes("en")) ||
                          vList[0];
        if (defaultPref) {
          console.log("[GoMax Voice] Selected voice:", defaultPref.name, defaultPref.lang);
          setSelectedVoice(defaultPref.name);
          selectedVoiceRef.current = defaultPref.name;
        } else {
          console.warn("[GoMax Voice] No voices found — will use browser default");
          setSelectedVoice("");
          selectedVoiceRef.current = "";
        }
      };

      loadAllVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadAllVoices;
      }
    }
  }, []);

  // Keep voice param refs in sync with state
  useEffect(() => { voiceRateRef.current = voiceRate; }, [voiceRate]);
  useEffect(() => { voicePitchRef.current = voicePitch; }, [voicePitch]);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);
  useEffect(() => { availableVoicesRef.current = availableVoices; }, [availableVoices]);

  // Unlock speech synthesis on the very first user interaction anywhere on the page
  useEffect(() => {
    const doUnlock = () => {
      if (voiceUnlockedRef.current) return;
      voiceUnlockedRef.current = true;
      setVoiceUnlocked(true);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        u.rate = 1;
        console.log("[GoMax Voice] Audio context unlocked on first interaction");
        try {
          window.speechSynthesis.speak(u);
        } catch (e) { console.warn("[GoMax Voice] Unlock speak failed:", e); }
      }
      // Remove listeners after first unlock
      document.removeEventListener("click", doUnlock);
      document.removeEventListener("keydown", doUnlock);
      document.removeEventListener("touchstart", doUnlock);
    };
    document.addEventListener("click", doUnlock);
    document.addEventListener("keydown", doUnlock);
    document.addEventListener("touchstart", doUnlock);
    return () => {
      document.removeEventListener("click", doUnlock);
      document.removeEventListener("keydown", doUnlock);
      document.removeEventListener("touchstart", doUnlock);
    };
  }, []);

  // Update voice configuration based on gender profile shortcuts
  useEffect(() => {
    if (voiceProfile === "mute") {
      stopBriefing();
      return;
    }

    // Set speed and pitch corresponding to profiles
    if (voiceProfile === "executive") {
      setVoiceRate(0.90);
      setVoicePitch(1.0);
    } else if (voiceProfile === "senior") {
      setVoiceRate(0.87);
      setVoicePitch(0.95);
    } else if (voiceProfile === "chairman") {
      setVoiceRate(0.84);
      setVoicePitch(0.90);
    }

    if (availableVoices.length === 0) return;

    let targetVoice: SpeechSynthesisVoice | undefined;
    if (voiceProfile === "executive") {
      targetVoice = availableVoices.find(v => v.lang.includes("en-IN") && v.name.toLowerCase().includes("female")) ||
                    availableVoices.find(v => v.lang.includes("en-IN") && v.name.toLowerCase().includes("google")) ||
                    availableVoices.find(v => v.lang.includes("en-IN")) ||
                    availableVoices.find(v => v.lang.includes("hi-IN")) ||
                    availableVoices.find(v => v.name.includes("Google") && v.name.includes("Female")) ||
                    availableVoices.find(v => v.name.includes("Zira")) ||
                    availableVoices.find(v => v.lang.includes("en") && v.gender === "female") ||
                    availableVoices.find(v => v.lang.includes("en"));
    } else if (voiceProfile === "senior") {
      targetVoice = availableVoices.find(v => v.lang.includes("en-IN") && v.name.toLowerCase().includes("male")) ||
                    availableVoices.find(v => v.lang.includes("en-IN") && v.name.toLowerCase().includes("heera")) ||
                    availableVoices.find(v => v.lang.includes("hi-IN") && v.name.toLowerCase().includes("google")) ||
                    availableVoices.find(v => v.lang.includes("hi-IN")) ||
                    availableVoices.find(v => v.lang.includes("en-IN")) ||
                    availableVoices.find(v => v.name.includes("David")) ||
                    availableVoices.find(v => v.name.includes("Male") && v.lang.includes("en")) ||
                    availableVoices.find(v => v.lang.includes("en") && v.gender === "male") ||
                    availableVoices.find(v => v.lang.includes("en"));
    } else if (voiceProfile === "chairman") {
      targetVoice = availableVoices.find(v => v.lang.includes("en-IN") && v.name.toLowerCase().includes("male")) ||
                    availableVoices.find(v => v.lang.includes("hi-IN") && v.name.toLowerCase().includes("google")) ||
                    availableVoices.find(v => v.lang.includes("hi-IN")) ||
                    availableVoices.find(v => v.lang.includes("en-IN")) ||
                    availableVoices.find(v => v.name.includes("Google") && v.name.includes("Male")) ||
                    availableVoices.find(v => v.lang.includes("en-GB")) ||
                    availableVoices.find(v => v.lang.includes("en"));
    }

    if (targetVoice) {
      setSelectedVoice(targetVoice.name);
    }
  }, [voiceProfile, availableVoices]);

  // Autopilot presentation state machine
  const executeAutopilotStep = (stepIdx: number) => {
    if (stepIdx < 0 || stepIdx >= presentationSlides.length) {
      setIsAutopilot(false);
      return;
    }

    const slide = presentationSlides[stepIdx];
    setAutopilotStep(stepIdx);

    // Apply UI focus states
    setActiveTab(slide.tab);
    if (slide.tab === "sop") {
      if (slide.sopIdx !== undefined) setActiveSopIdx(slide.sopIdx);
      if (slide.pageIdx !== undefined) setActivePageIdx(slide.pageIdx);
    }
    // Fix 1: Auto-trigger CRM login sequence when autopilot lands on CRM tab
    if (slide.tab === "crm") {
      setCrmIsAutoplay(true);
      setCrmLoginStatus(prev => prev === "prompting" ? "typing" : prev);
    }

    // Trigger voice narration
    startBriefing(slide.title, slide.narrative);

    // Automatically schedule next slide based on length of text (about 65ms per character + 3 seconds boundary buffers)
    const voiceDuration = (slide.narrative.length * 62) + 4000;

    if (autopilotTimerRef.current) clearTimeout(autopilotTimerRef.current);
    
    // Switch to next slide if still operating in autopilot
    autopilotTimerRef.current = setTimeout(() => {
      if (stepIdx + 1 < presentationSlides.length) {
        executeAutopilotStep(stepIdx + 1);
      } else {
        setIsAutopilot(false);
        setChatbotOpen(true); // Open chatbot for directors to ask doubts!
      }
    }, voiceDuration);
  };

  // Start Autopilot Presentation
  const startAutopilot = () => {
    setIsAutopilot(true);
    setAutopilotStep(0);
    setActiveTab("brand");
    
    const welcomeTitle = "Welcome to GoMax";
    const welcomeText = "Welcome to the GoMax Business Operating System. Today we are starting our automated system presentation. In this presentation we will go through our operating governance models, SOP controls, and the current stage of the GoMax brand.";
    
    startBriefing(welcomeTitle, welcomeText);
    
    if (autopilotTimerRef.current) clearTimeout(autopilotTimerRef.current);
    autopilotTimerRef.current = setTimeout(() => {
      executeAutopilotStep(0);
    }, 8000);
  };

  // Pause or Resume Autopilot
  const stopAutopilot = () => {
    setIsAutopilot(false);
    if (autopilotTimerRef.current) {
      clearTimeout(autopilotTimerRef.current);
      autopilotTimerRef.current = null;
    }
    setCrmIsAutoplay(false);
    clearCrmTypingTimers();
    stopBriefing();
  };

  // Clean-ups
  useEffect(() => {
    return () => {
      stopBriefing();
      if (autopilotTimerRef.current) clearTimeout(autopilotTimerRef.current);
    };
  }, []);

  // Sync scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatbotOpen]);

  // ============================================
  // --- GO-MAX COMPREHENSIVE CRM AUTO-PRESENTATION ENGINE ---
  // ============================================

  // Narrations database index for each of the 5 CRM subsections
  const crmTabNarratives = [
    {
      title: "SOP 02 Collections Tracker",
      text: "This screen shows how our collections ledger will work once it is live. Under SOP Two, dealer wise outstanding balances are tracked by aging. In this demo, Alpha Distributors has a critical overdue balance and their shipment is blocked. This is exactly how the system will behave when real dealer data is connected."
    },
    {
      title: "SOP 11 Dealer Spacing Rules",
      text: "This tab shows how GoMax will enforce dealer density limits under SOP Eleven. A minimum two kilometer spacing is mandatory between any two dealer outlets. In this demo, Alpha Distributors and Beta Enterprises are only one point two kilometers apart, which is below the minimum threshold. That is why the violation flag has been raised."
    },
    {
      title: "SOP 12 Credit Lockouts & Dispatches",
      text: "SOP Twelve controls dealer credit limits and dispatch approvals. In this demo, Alpha Distributors has exceeded the sixty day credit period, so their pending order is blocked. This logic will apply automatically to every real order once the CRM is connected to live billing data."
    },
    {
      title: "SOP 05 Trade Schemes Slab Approvals",
      text: "This section shows how GoMax enforces trade scheme discipline under SOP Five. Gold and Silver discount slabs require written signed authorization. In this demo, a verbal discount promise has been flagged as invalid because under SOP Five, no verbal deal is legally binding or payable."
    },
    {
      title: "SOP 10 & 19 Offboarding Controls",
      text: "The final tab covers employee and dealer exit protocols under SOP Ten and Nineteen. In this demo, two exits are in progress, one sales executive and one distributor. Their system access has been deactivated and a thirty day settlement audit has been automatically triggered. GoMax will follow exactly this workflow for every exit."
    }
  ];

  // 1. CRM Prompt Countdown timer (allows user to select manual or autoplay)
  useEffect(() => {
    if (activeTab !== "crm" || crmLoginStatus !== "prompting") return;

    const interval = setInterval(() => {
      setCrmPromptCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto start autoplay if no action taken
          setCrmLoginStatus("typing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [crmLoginStatus, activeTab]);

  // 2. Typewriter animation effect for Super Admin ID / Password credentials
  useEffect(() => {
    if (activeTab !== "crm" || crmLoginStatus !== "typing") {
      clearCrmTypingTimers();
      return;
    }

    let eIdx = 0;
    let pIdx = 0;
    const targetEmail = "superadmin@gomax.com";
    const targetPass = "GoMaxPresidentSecure2026!";

    setCrmLoginEmail("");
    setCrmLoginPassword("");

    // Simulate key typing for email
    const emailTimer = setInterval(() => {
      if (eIdx < targetEmail.length) {
        setCrmLoginEmail(prev => prev + targetEmail[eIdx]);
        eIdx++;
      } else {
        clearInterval(emailTimer);

        // Pause briefly after email is filled, then type password
        const t1 = setTimeout(() => {
          const passTimer = setInterval(() => {
            if (pIdx < targetPass.length) {
              setCrmLoginPassword(prev => prev + targetPass[pIdx]);
              pIdx++;
            } else {
              clearInterval(passTimer);

              // Authenticate successfully after full typing completion
              const t2 = setTimeout(() => {
                setCrmLoginStatus("loggedIn");
                setCrmNotification("🔑 Authorized Super Admin Access Granted!");
                const t3 = setTimeout(() => setCrmNotification(null), 3000);
                crmTypingTimersRef.current.push(t3);

                // Narrate first step automatically if autoplay is true
                if (crmIsAutoplay) {
                  setCrmActiveSubTab(0);
                  startBriefing(crmTabNarratives[0].title, crmTabNarratives[0].text);
                }
              }, 800);
              crmTypingTimersRef.current.push(t2);
            }
          }, 45); // Typing speed password
          crmTypingTimersRef.current.push(passTimer);
        }, 400);
        crmTypingTimersRef.current.push(t1);
      }
    }, 45); // Typing speed email
    crmTypingTimersRef.current.push(emailTimer);

    return () => {
      clearCrmTypingTimers();
    };
  }, [crmLoginStatus, activeTab]);

  // 3. Automated Sub-tab transitions (Autoplay guided slides)
  useEffect(() => {
    if (activeTab !== "crm" || crmLoginStatus !== "loggedIn" || !crmIsAutoplay) {
      if (crmAutoplayTimer) {
        clearInterval(crmAutoplayTimer);
        setCrmAutoplayTimer(null);
      }
      return;
    }

    // Set up repeating interval to transition through tabs
    const interval = setInterval(() => {
      setCrmActiveSubTab(prev => {
        const next = (prev + 1) % 5;
        // Narrate next sub-tab
        startBriefing(crmTabNarratives[next].title, crmTabNarratives[next].text);
        return next;
      });
    }, 14000); // 14 seconds per sub-tab

    setCrmAutoplayTimer(interval);

    return () => {
      clearInterval(interval);
    };
  }, [crmLoginStatus, activeTab, crmIsAutoplay]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (crmAutoplayTimer) clearInterval(crmAutoplayTimer);
    };
  }, [crmAutoplayTimer]);

  // Cancel simulator timers
  const cancelSimulation = () => {
    setIsSimulating(false);
    setSimStage(0);
    simTimeoutRefs.current.forEach(t => clearTimeout(t));
    simTimeoutRefs.current = [];
  };

  useEffect(() => {
    cancelSimulation();
    setCheckedFlowchartSteps([false, false, false, false, false]);
  }, [activeSopIdx]);

  const startWorkflowSimulation = () => {
    cancelSimulation();
    setIsSimulating(true);
    setSimStage(1);
    setSimLogs([
      `[MEMBER CHECK] INITIALIZING BOARD AUDIT CONTROL HANDSHAKE...`,
      `[OPERATOR] BOOTING ${MASTER_SOP_DATA[activeSopIdx]?.id || "SOP"} COMPLIANCE LEDGER...`,
      `[LOGISTICS] EXAMINING RECOVERY REGISTERS STATUS...`
    ]);

    const delay = 1800;

    const t1 = setTimeout(() => {
      setSimStage(2);
      setSimLogs(prev => [
        ...prev,
        `[TRIGGER] CONFIRMED: Action points mapped to respective department coordinators.`,
        `[LEOPARD] CALCULATING ACTIVE DENSITY INDEX METRICS...`
      ]);
    }, delay);

    const t2 = setTimeout(() => {
      setSimStage(3);
      setSimLogs(prev => [
        ...prev,
        `[AUDIT] STAGE 2 CONFIRMED: Ledger locks active. Credit hold checked at 60 days limits.`,
        `[RISK] RISK SHIELD DEPLOYED: Deviation risk index is scored at 0.05% nominal limits.`
      ]);
    }, delay * 2);

    const t3 = setTimeout(() => {
      setSimStage(4);
      setSimLogs(prev => [
        ...prev,
        `[SYSTEM] STAGE 3 COMPLETE: Operating Procedure audited completely successfully.`,
        `[SUCCESS] DELEGATION AUDITED BY ${MASTER_SOP_DATA[activeSopIdx]?.dept} BOARD LEAD. 🛡️`
      ]);
    }, delay * 3);

    simTimeoutRefs.current = [t1, t2, t3];
  };

  // Gemini AI chatbot — powered by @google/genai
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  const handleChatRequest = async (queryStr: string) => {
    if (!queryStr.trim() || isBotThinking) return;

    setChatMessages(prev => [...prev, { sender: "user" as const, text: queryStr }]);
    setChatInput("");
    setIsBotThinking(true);

    // Compact SOP digest injected as grounding context
    const sopDigest = MASTER_SOP_DATA.map(s =>
      `${s.id} — ${s.title} (${s.dept}): ${s.pages.map(p => p.c).join(" ").substring(0, 300)}`
    ).join("\n");

    const systemPrompt = `You are the GoMax Boardroom AI Advisor — an expert on GoMax's 22 Standard Operating Procedures and brand roadmap. GoMax is an FMCG distribution company in North India (Haryana, Punjab, Uttarakhand, Jammu).

Answer questions from internal management clearly and with authority. Always cite the relevant SOP ID when applicable. Keep answers to 3-5 sentences maximum. Write in clean direct prose — no markdown headers or bullet points. If a question is unrelated to GoMax operations, politely redirect to the SOPs.

GOMAX SOP KNOWLEDGE BASE:
${sopDigest}

BRAND STATUS: GoMax is at Stage 1 of 5 in its brand-building journey. Only the 22 SOPs are documented. Still pending: BOS deployment, staff training, territory mapping, dealer onboarding, live CRM, brand identity, and legal structure.`;

    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";

      if (!apiKey) throw new Error("NO_KEY");

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: queryStr,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 300,
          temperature: 0.4,
        },
      });

      const replyText = response.text?.trim() || "I could not generate a response. Please try again.";
      setChatMessages(prev => [...prev, { sender: "bot" as const, text: replyText }]);
      startBriefing("AI Advisor", replyText);

    } catch (err: any) {
      let fallback = "";

      if (err?.message === "NO_KEY") {
        fallback = "The Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file and restart the dev server. All 22 SOPs are loaded and ready — the AI just needs the key to respond.";
      } else {
        const q = queryStr.toLowerCase();
        const match = MASTER_SOP_DATA.find(s =>
          s.title.toLowerCase().split(" ").some(w => w.length > 4 && q.includes(w)) ||
          s.id.toLowerCase().includes(q)
        );
        if (match) {
          fallback = `Under ${match.id} — ${match.title} (${match.dept}): ${match.pages[0].c.substring(0, 280)}. Refer to the SOP Manual tab for the full procedure.`;
        } else {
          fallback = "I am having trouble reaching the AI service right now. You can browse the full SOP Manual in the third tab for any procedure details.";
        }
      }

      setChatMessages(prev => [...prev, { sender: "bot" as const, text: fallback }]);
      startBriefing("AI Advisor", fallback);

    } finally {
      setIsBotThinking(false);
    }
  };

  const activeSop: SopModule | undefined = MASTER_SOP_DATA[activeSopIdx];
  const activePage: SopPage | undefined = activeSop?.pages[activePageIdx];

  const clausePillLabels = [
    { label: "Objective", index: 0 },
    { label: "Trigger Policy", index: 1 },
    { label: "Workflow Logic", index: 2 },
    { label: "Risks & Impact", index: 3 },
    { label: "Ownership", index: 4 },
    { label: "Role Specs", index: 5 },
  ];

  const filteredSops = MASTER_SOP_DATA.filter((sop) => {
    const matchesSearch = 
      sop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sop.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sop.dept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || sop.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleEnterBoardroom = () => {
    // Unlock Chrome audio on this user click — earliest possible gesture
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const unlock = new SpeechSynthesisUtterance(" ");
      unlock.volume = 0;
      try { window.speechSynthesis.speak(unlock); } catch (e) {}
    }
    setLandingPhase("entering");
    setTimeout(() => {
      setHasEnteredBoardroom(true);
      setLandingPhase("done");
    }, 1200);
  };

  // ── LANDING PAGE ──────────────────────────────────────────────
  if (!hasEnteredBoardroom) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center relative overflow-hidden select-none">
        {/* Ambient radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{background: "radial-gradient(circle, rgba(240,180,41,0.07) 0%, transparent 70%)"}} />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{backgroundImage: "linear-gradient(rgba(240,180,41,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(240,180,41,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px"}} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center gap-10 px-6 text-center z-10 max-w-3xl"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30 italic font-black text-4xl text-black">
              G
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black tracking-tight text-white uppercase italic">GoMax</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/20 tracking-widest uppercase font-mono">
                BOS v2.0
              </span>
            </div>
          </motion.div>

          {/* Staggered headline */}
          <div className="flex flex-col items-center gap-3">
            {["Business", "Operating", "System"].map((word, wi) => (
              <motion.div
                key={wi}
                initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 0.4 + wi * 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={`font-black uppercase tracking-tight leading-none ${
                  wi === 1 ? "text-amber-500 text-6xl md:text-8xl" : "text-white/30 text-4xl md:text-5xl"
                }`}
              >
                {word}
              </motion.div>
            ))}
          </div>

          {/* Tagline — character stagger */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-x-1"
          >
            {"Governance · Compliance · Control".split("").map((ch, ci) => (
              <motion.span
                key={ci}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + ci * 0.018, duration: 0.3, ease: "easeOut" }}
                className="text-sm font-mono tracking-widest text-slate-500 uppercase"
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-8"
          >
            {[
              { val: "22", label: "SOPs" },
              { val: "130+", label: "Clauses" },
              { val: "6", label: "Departments" },
              { val: "v2.0", label: "Platform" },
            ].map((s, si) => (
              <div key={si} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-white font-mono">{s.val}</span>
                <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Enter button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.button
              onClick={handleEnterBoardroom}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              disabled={landingPhase === "entering"}
              className="group relative px-12 py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-70 text-black font-black text-sm tracking-[0.2em] uppercase rounded-2xl shadow-2xl shadow-amber-500/20 transition-colors duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {landingPhase === "entering" ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                    />
                    Entering Boardroom...
                  </>
                ) : (
                  <>
                    Enter the Boardroom
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6, duration: 0.6 }}
            className="text-[10px] text-slate-700 font-mono tracking-widest uppercase"
          >
            Restricted Access · Internal Management Only
          </motion.p>
        </motion.div>
      </div>
    );
  }
  // ── END LANDING PAGE ──────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden antialiased">
      
      {/* --- AUTOMATED AUTOPILOT SUBTITLE TELEPROMPTER OVERLAY BAR --- */}
      {isAutopilot && (
        <div id="autopilot-ticker" className="bg-gradient-to-r from-amber-600 to-[#F0B429] text-black font-semibold text-xs md:text-sm py-2 px-6 flex items-center justify-between shadow-2xl relative z-50 animate-pulse border-b border-amber-400">
          <div className="flex items-center gap-3.5 truncate max-w-[85%]">
            <span className="bg-black text-[9px] uppercase tracking-wider text-amber-400 font-extrabold py-0.5 px-2 rounded-full flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} /> 
              AI DIRECTOR PRESENTER
            </span>
            <span className="truncate tracking-wide text-slate-900 border-l border-slate-900/20 pl-3">
              "{presentationSlides[autopilotStep]?.narrative}"
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-black/10 text-slate-950 font-black px-2 py-0.5 rounded-full">
              Slide {autopilotStep + 1} / {presentationSlides.length}
            </span>
            <button 
              onClick={stopAutopilot}
              className="px-2 py-1 bg-black text-[#F0B429] text-[9px] font-black rounded hover:bg-black/80 transition"
              title="Return control to manual mode"
            >
              STOP
            </button>
          </div>
        </div>
      )}

      {/* 1. BRAND PLATFORM TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#05070ad0] backdrop-blur-xl border-b border-white/5 px-6 py-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-amber-500/20 italic">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight uppercase text-white font-sans text-amber-500">
                GoMax
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/20 tracking-wider">
                BOS v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Institutional Operating System
            </p>
          </div>
        </div>

        {/* BOARDROOM AUTOPILOT PRESENTATION MASTER SWITCHES */}
        <div id="boardroom-autopilot-panel" className="bg-[#11141C] border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-4">
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#F0B429] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-bounce" />
              Board Presentation Node
            </span>
            <span className="text-[10px] text-slate-400">Sit back and see the system run</span>
          </div>

          <div className="flex items-center gap-2">
            {isAutopilot ? (
              <button
                id="btn-stop-presentation"
                onClick={stopAutopilot}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition uppercase"
              >
                <Pause className="w-3.5 h-3.5" />
                Stop Presentation
              </button>
            ) : (
              <button
                id="btn-play-presentation"
                onClick={startAutopilot}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition uppercase shadow-md shadow-amber-500/15"
              >
                <Play className="w-3.5 h-3.5" />
                Play Auto-Presentation
              </button>
            )}

            {(isSpeaking || isAutopilot) && (
              <button
                id="btn-global-stop-speech"
                onClick={() => {
                  stopAutopilot();
                  stopBriefing();
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition uppercase animate-pulse shadow-lg shadow-red-600/40 cursor-pointer"
                title="Stop current speech synthesis and presentation immediately"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Stop AI Voice
              </button>
            )}

            <button
              onClick={() => {
                setChatbotOpen(true);
                // Add friendly hint request
                handleChatRequest("Tell me about our credit controls and schemes");
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#F0B429]" />
              Ask Advisor
            </button>
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2 md:gap-3 bg-white/5 p-1 rounded-full border border-white/[0.08]" id="top-nav">
          <button
            id="btn-brand"
            onClick={() => {
              stopAutopilot();
              setActiveTab("brand");
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "brand"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            🏆 Brand Roadmap
          </button>
          <button
            id="btn-crm"
            onClick={() => {
              stopAutopilot();
              setActiveTab("crm");
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "crm"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            📊 Dealer CRM (Live)
          </button>
          <button
            id="btn-sop"
            onClick={() => {
              stopAutopilot();
              setActiveTab("sop");
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "sop"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            📘 Blueprint Directory
          </button>
        </div>
      </header>

      {/* MAIN DYNAMIC CANVAS */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col relative pb-28">
        <AnimatePresence mode="wait">
          {/* A. BRAND ROADMAP PANE */}
          {activeTab === "brand" && (
            <motion.div
              key="pane-brand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-8 w-full"
            >
              {/* ── HEADER: Where We Are Today ── */}
              <div className="p-8 md:p-12 bg-gradient-to-br from-[#11141C] to-[#0A0D14] rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-amber-500/4 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.25em] text-amber-500 uppercase font-bold mb-3">Brand Building Roadmap — Current Status</p>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                      GoMax is at <span className="text-amber-500">Stage 1</span><br />
                      <span className="text-slate-400 font-medium text-2xl md:text-3xl normal-case tracking-normal">of a 5-stage brand journey.</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-4 max-w-2xl leading-relaxed">
                      The foundation has been laid — 22 Standard Operating Procedures are fully documented across all departments. Everything above that is in progress or pending. This roadmap shows exactly where we stand and what must happen next to turn GoMax into a recognised, scalable brand.
                    </p>
                  </div>
                  {/* Overall progress ring */}
                  <div className="shrink-0 flex flex-col items-center justify-center bg-[#0A0D14] border border-white/5 rounded-3xl p-6 min-w-[140px]">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" r="38" fill="none" stroke="#1e2330" strokeWidth="8"/>
                      <circle cx="45" cy="45" r="38" fill="none" stroke="#F0B429" strokeWidth="8"
                        strokeDasharray="238.76"
                        strokeDashoffset="214.88"
                        strokeLinecap="round"
                        transform="rotate(-90 45 45)"
                      />
                      <text x="45" y="49" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="monospace">10%</text>
                    </svg>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-2 text-center">Brand<br/>Complete</p>
                  </div>
                </div>

                {/* 5-stage horizontal journey bar */}
                <div className="mt-10 pt-8 border-t border-white/5">
                  <p className="text-[9px] font-mono tracking-[0.2em] text-slate-500 uppercase mb-5">5-Stage Brand Journey</p>
                  <div className="flex items-start gap-0">
                    {[
                      { num: "01", label: "Governance\nFoundation", sub: "SOPs Written", done: true },
                      { num: "02", label: "System\nDeployment", sub: "BOS Platform Live", done: false },
                      { num: "03", label: "People\n& Training", sub: "Team Onboarded", done: false },
                      { num: "04", label: "Market\nPresence", sub: "Dealers + Territory", done: false },
                      { num: "05", label: "Brand\nScalability", sub: "Franchise Ready", done: false },
                    ].map((stage, i) => (
                      <div key={i} className="flex items-start flex-1 min-w-0">
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black border-2 shrink-0 ${
                            stage.done
                              ? "bg-amber-500 border-amber-500 text-black"
                              : "bg-[#0A0D14] border-white/10 text-slate-500"
                          }`}>
                            {stage.done ? <CheckCircle2 className="w-5 h-5"/> : <span className="font-mono">{stage.num}</span>}
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-wide mt-2 text-center leading-tight whitespace-pre-line ${stage.done ? "text-amber-400" : "text-slate-500"}`}>
                            {stage.label}
                          </p>
                          <p className={`text-[9px] mt-1 text-center leading-tight ${stage.done ? "text-amber-300/70" : "text-slate-600"}`}>
                            {stage.sub}
                          </p>
                          {stage.done && (
                            <span className="mt-2 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Done</span>
                          )}
                          {!stage.done && (
                            <span className="mt-2 text-[8px] bg-white/3 text-slate-600 border border-white/5 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pending</span>
                          )}
                        </div>
                        {i < 4 && (
                          <div className={`h-[2px] flex-1 mt-5 mx-1 rounded-full ${i === 0 ? "bg-amber-500/40" : "bg-white/5"}`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 8 BRAND PILLARS — DETAILED STATUS ── */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-[10px] font-mono tracking-[0.2em] text-amber-500 uppercase font-bold">8 Brand-Building Pillars — What's Done & What's Pending</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      num: "01",
                      icon: <FileText className="w-5 h-5"/>,
                      title: "Standard Operating Procedures",
                      dept: "GOVERNANCE",
                      status: "done",
                      done: "All 22 SOPs written. 130+ operational clauses documented across Sales, Finance, HR, Logistics, and Dealer Management.",
                      pending: null,
                    },
                    {
                      num: "02",
                      icon: <Cpu className="w-5 h-5"/>,
                      title: "Business Operating System (BOS)",
                      dept: "TECHNOLOGY",
                      status: "inprogress",
                      done: "BOS platform built and structured. SOP viewer, CRM module, and autopilot presentation ready.",
                      pending: "Live deployment pending. Real data not yet connected. Gemini API key must be added to .env.local as VITE_GEMINI_API_KEY to activate the AI advisor.",
                    },
                    {
                      num: "03",
                      icon: <MapPin className="w-5 h-5"/>,
                      title: "Territory Mapping",
                      dept: "ZONAL ALIGNMENT",
                      status: "pending",
                      done: null,
                      pending: "Haryana, Punjab, Uttarakhand, Jammu territories not yet formally assigned. SM-wise allocation pending as per SOP 20.",
                    },
                    {
                      num: "04",
                      icon: <Network className="w-5 h-5"/>,
                      title: "Dealer Network",
                      dept: "CHANNEL DEVELOPMENT",
                      status: "pending",
                      done: null,
                      pending: "No dealers formally onboarded under SOP 15 protocols. Dealer density, spacing rules (SOP 11), and credit limits (SOP 12) not yet active in the field.",
                    },
                    {
                      num: "05",
                      icon: <Database className="w-5 h-5"/>,
                      title: "Live CRM with Real Data",
                      dept: "FINANCE & RISK",
                      status: "pending",
                      done: null,
                      pending: "CRM currently runs on demo data only. Real dealer billing, outstanding tracking, and dispatch logs not yet connected.",
                    },
                    {
                      num: "06",
                      icon: <Users className="w-5 h-5"/>,
                      title: "Staff Training on SOPs",
                      dept: "HUMAN CAPITAL",
                      status: "pending",
                      done: null,
                      pending: "Sales Executives, Sales Managers, and Accounts team not yet trained on the 22 SOPs. SOP 03 onboarding protocols not yet executed.",
                    },
                    {
                      num: "07",
                      icon: <Award className="w-5 h-5"/>,
                      title: "Brand Identity",
                      dept: "CORP STANDARDS",
                      status: "pending",
                      done: null,
                      pending: "Visual identity, dress code standards (SOP 16), official communication templates, and brand guidelines not yet finalised.",
                    },
                    {
                      num: "08",
                      icon: <ShieldCheck className="w-5 h-5"/>,
                      title: "Legal & Compliance Structure",
                      dept: "EXECUTIVE OFFICE",
                      status: "pending",
                      done: null,
                      pending: "Dealer agreements, employment contracts, incentive structures (SOP 04 & 21), and TA/DA frameworks (SOP 09 & 22) not yet legally formalised.",
                    },
                  ].map((pillar) => (
                    <div
                      key={pillar.num}
                      className={`p-6 rounded-[1.75rem] border text-left flex flex-col gap-4 relative overflow-hidden ${
                        pillar.status === "done"
                          ? "bg-amber-500/5 border-amber-500/20"
                          : pillar.status === "inprogress"
                          ? "bg-blue-500/5 border-blue-500/15"
                          : "bg-[#0D1017] border-white/[0.04]"
                      }`}
                    >
                      {/* Status badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          pillar.status === "done" ? "bg-amber-500/15 text-amber-400"
                          : pillar.status === "inprogress" ? "bg-blue-500/15 text-blue-400"
                          : "bg-white/5 text-slate-600"
                        }`}>
                          {pillar.icon}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${
                          pillar.status === "done"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : pillar.status === "inprogress"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-white/3 text-slate-600 border-white/5"
                        }`}>
                          {pillar.status === "done" ? "✓ Complete" : pillar.status === "inprogress" ? "⚡ In Progress" : "○ Pending"}
                        </span>
                      </div>

                      <div>
                        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">{pillar.dept} · PILLAR {pillar.num}</p>
                        <h3 className={`text-base font-black uppercase tracking-tight leading-tight ${
                          pillar.status === "done" ? "text-amber-100"
                          : pillar.status === "inprogress" ? "text-blue-100"
                          : "text-slate-500"
                        }`}>{pillar.title}</h3>
                      </div>

                      {pillar.done && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0"/>
                          <p className="text-xs text-slate-300 leading-relaxed">{pillar.done}</p>
                        </div>
                      )}

                      {pillar.pending && (
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${pillar.status === "inprogress" ? "text-blue-400" : "text-slate-600"}`}/>
                          <p className={`text-xs leading-relaxed ${pillar.status === "inprogress" ? "text-slate-400" : "text-slate-600"}`}>{pillar.pending}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── WHAT NEEDS TO HAPPEN NEXT — PRIORITY ACTION BOARD ── */}
              <div className="p-8 bg-[#0D1017] rounded-[2.5rem] border border-white/[0.04]">
                <p className="text-[10px] font-mono tracking-[0.2em] text-amber-500 uppercase font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5"/>
                  Immediate Priority Actions — What Must Happen Next
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { priority: "P1", action: "Deploy this BOS platform internally", owner: "Management", sop: "—", note: "First internal teams must access and use the system before any field deployment." },
                    { priority: "P2", action: "Conduct SOP training for all sales staff", owner: "Sales Head", sop: "SOP 01, 03", note: "No field execution is valid without staff trained on SOPs. This is the single biggest gap right now." },
                    { priority: "P3", action: "Formally map territories to Sales Managers", owner: "Sales Head", sop: "SOP 20", note: "Haryana, Punjab, Uttarakhand, Jammu zones must be officially assigned with documented boundaries." },
                    { priority: "P4", action: "Onboard first batch of dealers under SOP 15", owner: "SM + Accounts", sop: "SOP 11, 12, 15", note: "Apply dealer spacing rules, credit limits, and formal agreements from day one." },
                    { priority: "P5", action: "Connect live data to CRM", owner: "Tech + Accounts", sop: "SOP 02, 12", note: "Replace demo data with real dealer billing and outstanding registers." },
                  ].map((item) => (
                    <div key={item.priority} className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04] hover:border-amber-500/15 transition-colors">
                      <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 mt-0.5 ${
                        item.priority === "P1" ? "bg-red-500/15 text-red-400 border border-red-500/20"
                        : item.priority === "P2" ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                        : item.priority === "P3" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "bg-white/5 text-slate-500 border border-white/5"
                      }`}>{item.priority}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <p className="text-sm font-bold text-white">{item.action}</p>
                          <span className="text-[9px] font-mono bg-white/5 text-slate-500 px-2 py-0.5 rounded-full border border-white/5">{item.sop}</span>
                          <span className="text-[9px] font-mono bg-white/5 text-slate-500 px-2 py-0.5 rounded-full border border-white/5">Owner: {item.owner}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* B. DEALER CRM PORTAL */}
          {activeTab === "crm" && (
            <motion.div
              key="pane-crm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col gap-6"
            >
              {/* CRM Header — honest demo label */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#11141C] p-4 rounded-3xl border border-amber-500/10 shadow-md">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-extrabold text-white tracking-widest flex items-center gap-2">
                      📋 CRM Demo Module — Illustrative Data
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Showing representative dealer records. Live data integration is a pending action item.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500/70 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/15">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  DEMO MODE
                </div>
              </div>

              {/* MODE A: FULL-FIDELITY BOARDROOM WALKTHROUGH SIMULATION (DEFAULT) */}
              {crmMode === "sim" && (
                <div className="bg-[#0B0F19] rounded-[2.5rem] border-2 border-white/5 shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col gap-8 min-h-[750px] relative">
                  
                  {/* Glowing background meshes */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-amber-500/5 to-transparent pointer-events-none rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-radial from-amber-500/5 to-transparent pointer-events-none rounded-full blur-2xl"></div>

                  {/* 1. INITIAL PROMPTING STAGE WITH TIMER & DEFAULT LOGINS */}
                  {crmLoginStatus === "prompting" && (
                    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-10 relative z-10">
                      <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                        <Sparkles className="w-10 h-10 animate-pulse text-amber-400" />
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-sans font-black uppercase text-white tracking-tight">
                        CRM Automated Walkthrough Setup
                      </h2>
                      <p className="text-slate-300 text-sm md:text-base mt-2 leading-relaxed font-sans">
                        Would you like a guided <span className="text-amber-400 font-extrabold">Demo Walkthrough</span> of the CRM module? 
                        The system will walk through each SOP control area — collections, spacing, credit limits, trade schemes, and offboarding — using illustrative data to show how the system will operate when live.
                      </p>

                      {/* Super Admin default info card */}
                      <div className="bg-[#11141C] border border-white/10 rounded-2xl p-4 w-full mt-6 text-left font-mono text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase text-[#F0B429] font-black font-sans mb-1">DEFAULT SUPER ADMIN EMAIL</p>
                          <p className="bg-black/40 p-2.5 rounded border border-white/5 select-all text-amber-100 font-mono">superadmin@gomax.com</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-[#F0B429] font-black font-sans mb-1">DEFAULT SUPER ADMIN PASSWORD</p>
                          <p className="bg-black/40 p-2.5 rounded border border-white/5 select-all text-amber-100 font-mono">GoMaxPresidentSecure2026!</p>
                        </div>
                      </div>

                      {/* User choice controllers with dynamic autostart countdown */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full max-w-md">
                        <button
                          onClick={() => {
                            setCrmIsAutoplay(true);
                            setCrmLoginStatus("typing");
                          }}
                          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-[#F0B429] hover:from-amber-400 hover:to-[#f0b429e2] text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg transition-transform hover:scale-[1.02] flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>🚀 Start Guided Autoplay</span>
                          <span className="text-[9px] text-amber-950 font-medium normal-case">
                            Beginning automatically in {crmPromptCountdown} seconds...
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setCrmIsAutoplay(false);
                            // Bypass typing and log in immediately
                            setCrmLoginEmail("superadmin@gomax.com");
                            setCrmLoginPassword("••••••••••••••••••••");
                            setCrmLoginStatus("loggedIn");
                            startBriefing("Go Max CRM Manual Mode", "Logged in manually as Super Admin. You are now free to click and discover each feature tab.");
                          }}
                          className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white font-extrabold uppercase text-xs tracking-wider rounded-2xl border border-white/10 transition-transform hover:scale-[1.02] cursor-pointer"
                        >
                          🖐️ Explore Manually
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. AUTO-TYPING SCREEN HANDSHAKE */}
                  {crmLoginStatus === "typing" && (
                    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto py-12 relative z-10">
                      <div className="w-full bg-[#11141C] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative">
                        
                        {/* Interactive Lock Icon */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-black border-4 border-[#0B0F19] shadow-lg shadow-amber-500/10">
                          <Lock className="w-5 h-5 animate-pulse" />
                        </div>

                        <div className="text-center mt-4 mb-6">
                          <h3 className="text-base uppercase font-extrabold text-white tracking-widest leading-none">
                            CRITICAL CORE LOGINHANDSHAKE
                          </h3>
                          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider font-mono mt-1">
                            GoMax OS Auth Security Node
                          </p>
                        </div>

                        {/* Visual Typing Outputs */}
                        <div className="space-y-4 text-left">
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono font-bold uppercase block mb-1">
                              SUPER ADMIN EMAIL INDEX
                            </label>
                            <div className="bg-[#05070A] border border-white/5 rounded-xl px-4 py-3 text-slate-200 font-mono text-xs flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-500 shrink-0" />
                              <span className="flex-1 break-all select-all outline-none">
                                {crmLoginEmail}
                              </span>
                              {crmLoginEmail.length < "superadmin@gomax.com".length && (
                                <motion.span
                                  animate={{ opacity: [1, 0, 1] }}
                                  transition={{ repeat: Infinity, duration: 0.8 }}
                                  className="w-1.5 h-3.5 bg-amber-500 text-amber-500 inline-block font-black"
                                >
                                  ■
                                </motion.span>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-mono font-bold uppercase block mb-1">
                              SUPER ADMIN PASSWORD CODE
                            </label>
                            <div className="bg-[#05070A] border border-white/5 rounded-xl px-4 py-3 text-slate-200 font-mono text-xs flex items-center gap-2">
                              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                              <span className="flex-1 tracking-widest break-all select-all outline-none text-amber-400">
                                {crmLoginPassword}
                              </span>
                              {crmLoginEmail.length === "superadmin@gomax.com".length && crmLoginPassword.length < "GoMaxPresidentSecure2026!".length && (
                                <motion.span
                                  animate={{ opacity: [1, 0, 1] }}
                                  transition={{ repeat: Infinity, duration: 0.8 }}
                                  className="w-1.5 h-3.5 bg-amber-500 text-amber-500 inline-block font-black"
                                >
                                  ■
                                </motion.span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Running Writing / Live Status Alert */}
                        <div className="mt-6 flex items-center gap-2 bg-[#05070A] p-2.5 rounded-xl border border-white/5 font-mono text-[10px] text-left">
                          <Bot className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                          <span className="text-slate-400">
                            {crmLoginEmail.length < "superadmin@gomax.com".length 
                              ? "Typing secured Super Admin email index..."
                              : crmLoginPassword.length < "GoMaxPresidentSecure2026!".length
                              ? "Writing high-clearance authority passcode..."
                              : "Establishing secure session keys. Connecting database..."
                            }
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            // Instant login bypass if they get impatient
                            setCrmLoginEmail("superadmin@gomax.com");
                            setCrmLoginPassword("••••••••••••••••••••");
                            setCrmLoginStatus("loggedIn");
                            startBriefing("Go Max CRM Live Guide Started", crmTabNarratives[0].text);
                          }}
                          className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white rounded-lg transition"
                        >
                          Skip Autotyping & Proceed ➜
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. RETRO-MODERN LOGGED-IN SIMULATED DASHBOARD */}
                  {crmLoginStatus === "loggedIn" && (
                    <div className="flex-1 flex flex-col gap-6 relative z-10" id="crm-simulation-twin">
                      
                      {/* Sub-tab Walkthrough Controller HUD bar */}
                      <div className="bg-[#121622] border border-white/10 p-4 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4">
                        
                        {/* Playback Status banner */}
                        <div className="flex items-center gap-3.5 text-left">
                          {crmIsAutoplay ? (
                            <span className="bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                              <Sparkles className="w-3 h-3 text-black shrink-0 animate-spin" />
                              Autoplay Guided Review Enabled
                            </span>
                          ) : (
                            <span className="bg-slate-700 text-slate-200 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <User className="w-3 h-3 text-amber-400 shrink-0" />
                              Manual Executive Exploration Mode
                            </span>
                          )}

                          <div className="text-left">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                              Review: {crmTabNarratives[crmActiveSubTab].title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-tight normal-case max-w-xs md:max-w-md truncate">
                              "{crmTabNarratives[crmActiveSubTab].text}"
                            </p>
                          </div>
                        </div>

                        {/* Interactive Playback Control buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              stopBriefing();
                              setCrmIsAutoplay(false);
                              const prev = (crmActiveSubTab - 1 + 5) % 5;
                              setCrmActiveSubTab(prev);
                              startBriefing(crmTabNarratives[prev].title, crmTabNarratives[prev].text);
                            }}
                            className="px-3 py-1.5 bg-[#1C2030] hover:bg-[#252A40] text-slate-300 text-[10px] font-bold uppercase rounded-lg transition"
                          >
                            Prev Tab
                          </button>

                          {crmIsAutoplay ? (
                            <button
                              onClick={() => {
                                setCrmIsAutoplay(false);
                                stopBriefing();
                              }}
                              className="px-3.5 py-1.5 bg-[#1C2030] hover:bg-rose-500 text-slate-300 hover:text-white text-[10px] font-black uppercase rounded-lg transition"
                              title="Halt automated slide switches"
                            >
                              Pause Tour
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setCrmIsAutoplay(true);
                                startBriefing(crmTabNarratives[crmActiveSubTab].title, crmTabNarratives[crmActiveSubTab].text);
                              }}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase rounded-lg transition"
                              title="Resume automatic slideshow and narrations"
                            >
                              Autoplay Tour
                            </button>
                          )}

                          <button
                            onClick={() => {
                              stopBriefing();
                              setCrmIsAutoplay(false);
                              const next = (crmActiveSubTab + 1) % 5;
                              setCrmActiveSubTab(next);
                              startBriefing(crmTabNarratives[next].title, crmTabNarratives[next].text);
                            }}
                            className="px-3 py-1.5 bg-[#1C2030] hover:bg-[#252A40] text-slate-300 text-[10px] font-bold uppercase rounded-lg transition"
                          >
                            Next Tab
                          </button>

                          {/* Trigger manual explicit audio playback */}
                          <button
                            onClick={() => {
                              startBriefing(crmTabNarratives[crmActiveSubTab].title, crmTabNarratives[crmActiveSubTab].text);
                            }}
                            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase rounded-lg hover:bg-amber-500/20 transition cursor-pointer"
                            title="Replay current section description aloud"
                          >
                            Speak Tab
                          </button>
                        </div>
                      </div>

                      {/* INDEPENDENT HUMAN VOICE DECK CONTROLS CONTROLLER PANEL */}
                      <div className="bg-[#11141C] p-5 rounded-3xl border border-white/5 flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                          
                          {/* Column 1: Selection Dropdowns */}
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-amber-500 tracking-widest block mb-1">
                                Human Voice Profile
                              </label>
                              <select
                                value={voiceProfile}
                                onChange={(e: any) => setVoiceProfile(e.target.value)}
                                className="w-full bg-[#05070A] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 cursor-pointer"
                              >
                                <option value="executive">👩🏻‍💼 Human Female Executive (Slow/Clear)</option>
                                <option value="senior">👨🏻‍💼 Senior Corporate Advisor (Natural Male)</option>
                                <option value="chairman">🎩 Boardroom Chairman (Formal / Low Pitch)</option>
                                <option value="mute">🔇 Mute Voice Narrations</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                                Specific System Voice
                              </label>
                              <select
                                value={selectedVoice}
                                onChange={(e: any) => setSelectedVoice(e.target.value)}
                                className="w-full bg-[#05070A] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 cursor-pointer"
                              >
                                <option value="">🗣️ Default System Voice (Guaranteed Offline Compat)</option>
                                {availableVoices.map((v, i) => (
                                  <option key={i} value={v.name}>
                                    {v.name} ({v.lang})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Column 2: Speed Controls & Test / Reactivate Button */}
                          <div className="flex flex-col gap-3 h-full justify-between">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                                Narration Speed Cadence: {voiceRate}x
                              </label>
                              <input
                                type="range"
                                min="0.65"
                                max="1.25"
                                step="0.05"
                                value={voiceRate}
                                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                                className="w-full tracking-wide accent-amber-500 h-1 rounded cursor-pointer mt-1"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => {
                                  // Hard reset Speech Synthesis queue which fixes Chromium iframe lock state
                                  stopAutopilot();
                                  if (typeof window !== "undefined" && window.speechSynthesis) {
                                    window.speechSynthesis.cancel();
                                    if (window.speechSynthesis.paused) {
                                      window.speechSynthesis.resume();
                                    }
                                  }
                                  if (voiceProfile === "mute") {
                                    setVoiceProfile("executive");
                                  }
                                  startBriefing("Go Max Voice Diagnostic", "Voice synthesis has been successfully initialized and unlocked. Please verify your browser sound volume and start the autopilot tour.");
                                }}
                                className="w-full text-center text-[10px] font-black tracking-widest text-[#F0B429] bg-[#F0B429]/10 hover:bg-[#F0B429]/20 border border-[#F0B429]/30 rounded-lg py-2 px-2.5 transition flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                                title="Force resets browser's Native Speech Synthesis subsystem to fix any silence or frozen audio locks"
                              >
                                <span>🔊 Test & Unblock Speech Engine</span>
                              </button>
                              <p className="text-[7.5px] leading-tight text-slate-500 italic">
                                🔒 Secure iframe requires a mouse click on this screen before playing sound. Click above to unlock.
                              </p>
                            </div>
                          </div>

                          {/* Column 3: real-time Voice Diagnostics & Equalizer */}
                          <div className="bg-[#05070A] p-3 rounded-2xl border border-white/5 flex flex-col gap-2 relative">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 block pb-1 border-b border-white/5">
                              📟 Diagnosis Console
                            </span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-mono text-slate-400">
                              <span className="text-slate-500">API Support:</span>
                              <span className="text-emerald-400">
                                {typeof window !== "undefined" && window.speechSynthesis ? "Yes (Web Speech API)" : "No (Unsupported browser)"}
                              </span>
                              
                              <span className="text-slate-500">Engine State:</span>
                              <span className={isSpeaking ? "text-amber-400 animate-pulse font-bold" : "text-slate-400"}>
                                {isSpeaking ? "🗣️ SPEAKING" : "💤 STANDBY"}
                              </span>

                              <span className="text-slate-500">Detected Voices:</span>
                              <span className="text-blue-400">{availableVoices.length} voice models</span>

                              <span className="text-slate-500">Selected:</span>
                              <span className="text-amber-500 truncate" title={selectedVoice || "Default System Voice"}>
                                {selectedVoice ? selectedVoice.split(" ")[0] || selectedVoice : "System Default"}
                              </span>
                            </div>

                            {/* Equalizer Wave bar line */}
                            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5">
                              <span className="text-[8px] uppercase tracking-widest font-mono text-slate-500">
                                Audio Wave Status:
                              </span>
                              <div className="flex items-end gap-1 h-4">
                                {[0.2, 0.8, 0.3, 0.9, 0.4, 0.7, 0.1, 0.6].map((dl, i) => (
                                  <motion.div
                                    key={i}
                                    animate={{
                                      height: isSpeaking ? ["3px", "14px", "3px"] : "3px"
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.75,
                                      delay: dl,
                                      ease: "easeInOut"
                                    }}
                                    className="w-1 bg-[#F0B429] rounded-full"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* MAIN DASHBOARD DUAL PANEL */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                        
                        {/* LEFT SIDENAV TAB SWITCHERS COLUMN */}
                        <aside className="lg:col-span-1 bg-[#121622] rounded-3xl p-4 flex flex-col gap-2.5 border border-white/5">
                          <p className="text-[9px] font-bold text-[#F0B429] uppercase tracking-wider mb-2 font-mono text-left pl-3 text-amber-500/80">
                            🛡️ AUDIT OVERLOOK SUBSECTORS
                          </p>

                          {[
                            { name: "📈 Collections Ledger", desc: "SOP-02 Cash flows" },
                            { name: "📍 Territory Gaps", desc: "SOP-11 Spacing check" },
                            { name: "🚚 Order dispatch holds", desc: "SOP-12 Credit limits" },
                            { name: "🎁 Trade promo slabs", desc: "SOP-05 Slab reviews" },
                            { name: "💼 Exit settlements", desc: "SOP-10 Talent sequence" }
                          ].map((tab, tIdx) => {
                            const isFocused = crmActiveSubTab === tIdx;
                            return (
                              <button
                                key={tIdx}
                                onClick={() => {
                                  stopBriefing();
                                  setCrmIsAutoplay(false); // return to manual selection
                                  setCrmActiveSubTab(tIdx);
                                  startBriefing(crmTabNarratives[tIdx].title, crmTabNarratives[tIdx].text);
                                }}
                                className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all duration-300 relative group cursor-pointer ${
                                  isFocused
                                    ? "bg-gradient-to-r from-amber-500 to-[#F0B429] border-amber-500 text-black font-extrabold shadow-md shadow-amber-500/10"
                                    : "bg-white/[0.01] border-white/5 text-slate-300 hover:bg-white/[0.03] hover:border-white/10"
                                }`}
                              >
                                <div>
                                  <span className={`text-[11px] block uppercase leading-snug ${isFocused ? "text-slate-950 font-black" : "text-white font-bold"}`}>
                                    {tab.name}
                                  </span>
                                  <span className={`text-[9px] font-mono leading-none ${isFocused ? "text-slate-900/80" : "text-slate-400"}`}>
                                    {tab.desc}
                                  </span>
                                </div>
                                <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${
                                  isFocused ? "text-black" : "text-slate-500"
                                }`} />

                                {isFocused && crmIsAutoplay && (
                                  <motion.span
                                    layoutId="focusedPulse"
                                    className="absolute inset-0 rounded-2xl border-2 border-amber-400 pointer-events-none"
                                    animate={{ scale: [0.99, 1.02, 0.99] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </aside>

                        {/* RIGHT MAIN DATA BOARD VIEW */}
                        <div className="lg:col-span-3 bg-[#11141C] rounded-3xl border border-white/5 p-6 md:p-8 text-left relative flex flex-col justify-between">
                          
                          {/* DYNAMIC VIEW SELECTOR MATRICES */}
                          <div>
                            
                            {/* TAB 0: COLLECTIONS LEDGER */}
                            {crmActiveSubTab === 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                  <div>
                                    <span className="text-[10px] bg-red-500/10 text-rose-400 font-mono font-bold px-2 py-0.5 rounded uppercase border border-red-500/20">
                                      Compliance Check: SOP 02 Active
                                    </span>
                                    <h3 className="text-lg font-black uppercase text-white mt-1">Live Dealer Outstanding Ledger</h3>
                                  </div>
                                  <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-xl text-xs font-bold uppercase font-mono tracking-wide">
                                    Target Collection: 100% efficiency
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                  {[
                                    { k: "Total Outstanding Due", v: "₹9,80,000", c: "text-white" },
                                    { k: "Overdue Exposure Block", v: "₹4,85,000", c: "text-rose-400", alert: true },
                                    { k: "Aging Limit Threshold", v: "60 Days", c: "text-slate-300" },
                                    { k: "Active Frozen Shipping Nodes", v: "1 Dealer List", c: "text-red-400" }
                                  ].map((metric, mi) => (
                                    <div key={mi} className={`bg-white/[0.02] p-4 border rounded-2xl select-all ${metric.alert ? "border-amber-500/30" : "border-white/5"}`}>
                                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1 leading-none">{metric.k}</p>
                                      <p className={`text-xl font-black font-mono leading-none ${metric.c}`}>{metric.v}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Interactive Data Table */}
                                <div className="overflow-x-auto w-full custom-scroll mt-6">
                                  <table className="w-full text-xs text-left text-slate-300">
                                    <thead>
                                      <tr className="border-b border-white/10 uppercase font-mono tracking-widest text-slate-400 text-[10px]">
                                        <th className="py-2.5 pl-3">Dealer Id</th>
                                        <th className="py-2.5">Distributor Name</th>
                                        <th className="py-2.5 text-right">Balance Due</th>
                                        <th className="py-2.5 text-right">Active Limits</th>
                                        <th className="py-2.5 text-center">Outstanding Days</th>
                                        <th className="py-2.5 pr-3 text-center">SOP Shipping Hold Check</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {crmDealers.map((dl) => {
                                        const isCritical = dl.days > 60;
                                        return (
                                          <tr key={dl.id} className={`hover:bg-white/[0.01] transition ${isCritical ? "bg-red-950/20 border-l-2 border-red-500" : ""}`}>
                                            <td className="py-3 pl-3 font-mono font-bold text-slate-400">{dl.id}</td>
                                            <td className="py-3 font-extrabold text-white">{dl.name}</td>
                                            <td className="py-3 text-right font-mono font-extrabold text-red-200">{dl.balance}</td>
                                            <td className="py-3 text-right font-mono text-slate-400">{dl.limit}</td>
                                            <td className="py-3 text-center font-mono font-bold">
                                              <span className={isCritical ? "text-rose-400 font-extrabold" : "text-green-400"}>
                                                {dl.days} Days
                                              </span>
                                            </td>
                                            <td className="py-3 text-center pr-3">
                                              {isCritical ? (
                                                <span className="bg-rose-500/10 text-rose-400 border border-red-500/20 rounded px-2.5 py-0.5 text-[9px] uppercase font-black tracking-widest block font-sans animate-pulse">
                                                  🚫 SHIPPINGS HOLD BLOCKED
                                                </span>
                                              ) : (
                                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2.5 py-0.5 text-[9px] uppercase font-extrabold tracking-widest block font-sans">
                                                  ✓ Shipments Approved
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            )}

                            {/* TAB 1: GEOSPATIAL SPACING */}
                            {crmActiveSubTab === 1 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                  <div>
                                    <span className="text-[10px] bg-[#F0B429]/10 text-amber-400 font-mono font-bold px-2 py-0.5 rounded uppercase border border-amber-500/20">
                                      Territorial Protection: SOP 11 Density Limits
                                    </span>
                                    <h3 className="text-lg font-black uppercase text-white mt-1">Live Geospatial Distance checks</h3>
                                  </div>
                                  <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl text-xs font-bold uppercase font-mono tracking-wide">
                                    Audited spacing guidelines
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                  To ensure healthy margins for each appointed dealer, GoMax enforces strict regional density bounds. Distances between physical dealers must be monitored and validated before onboarding. Any violations instantly block CRM billing setup!
                                </p>

                                <div className="space-y-4">
                                  {crmSpacingRecords.map((rec, ri) => {
                                    const isError = rec.code === "SOP-11-ERR";
                                    return (
                                      <div
                                        key={ri}
                                        className={`p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                          isError ? "bg-rose-950/15 border-l-4 border-l-rose-500" : "bg-white/[0.01]"
                                        }`}
                                      >
                                        <div className="text-left font-sans">
                                          <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase leading-none">
                                            {rec.region} // REGISTRY ID
                                          </p>
                                          <h4 className="text-sm font-black text-white mt-1 leading-snug">
                                            {rec.dealerA} <span className="text-[#F0B429]">⇆</span> {rec.dealerB}
                                          </h4>
                                          <p className="text-xs text-slate-300 font-mono mt-1">
                                            Distance Measured: <span className="font-bold underline">{rec.distance}</span>
                                          </p>
                                        </div>

                                        <div>
                                          {isError ? (
                                            <span className="bg-rose-500/10 text-rose-400 border border-red-500/20 rounded px-3 py-1 text-[10px] font-black uppercase tracking-wider block">
                                              ⚠ TERRITORY SPACING EXCEEDED
                                            </span>
                                          ) : (
                                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider block">
                                              ✓ Compliant Density Gap
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}

                            {/* TAB 2: DISPATCH & CREDIT HOLD LOCKOUTS */}
                            {crmActiveSubTab === 2 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                  <div>
                                    <span className="text-[10px] bg-red-500/10 text-rose-400 font-mono font-bold px-2 py-0.5 rounded uppercase border border-red-500/20">
                                      Discretionary Exclusions Blocked: SOP 12
                                    </span>
                                    <h3 className="text-lg font-black uppercase text-white mt-1">Pending Orders Clearance pipeline</h3>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                  DSR database locks pending delivery dispatches if the ordering distributor holds overdue balances exceeding standard limits. Try clicking "Approve Dispatch" on Alpha Distributors to review database lock operations.
                                </p>

                                <div className="space-y-3">
                                  {crmPendingOrders.map((ord, oidx) => (
                                    <div
                                      key={ord.id}
                                      className="bg-white/[0.01] p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-white/10 transition"
                                    >
                                      <div>
                                        <p className="text-[10px] text-amber-500 font-bold uppercase font-mono tracking-wider leading-none">
                                          OrderId: {ord.id} | Pending Dispatch
                                        </p>
                                        <h4 className="text-sm font-black text-white mt-1 leading-snug">{ord.dealer}</h4>
                                        <p className="text-xs font-mono font-bold text-slate-300 mt-1">Cargo Amount: {ord.amount}</p>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            if (ord.dealer === "Alpha Distributors") {
                                              setCrmShowOverrideAlert(true);
                                              setCrmActiveOrderIndex(oidx);
                                              startBriefing("System Lockout", "System Lockout! Access Denied. Under the rules of SOP twelve, Alpha Distributors has exceeded their credit period limits, and shipment dispatch is completely locked.");
                                            } else {
                                              setCrmNotification(`✓ Approved ${ord.id} for dispatch allocation!`);
                                              setTimeout(() => setCrmNotification(null), 3500);
                                            }
                                          }}
                                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                                        >
                                          Approve Dispatch
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Glowing dynamic lockout dialog overlay alert */}
                                {crmShowOverrideAlert && (
                                  <AnimatePresence>
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="p-5 bg-red-950/20 border-2 border-red-500 rounded-3xl mt-6 text-left relative"
                                    >
                                      <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shrink-0">
                                          <AlertTriangle className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div>
                                          <h4 className="text-xs uppercase font-extrabold text-rose-400 leading-none">
                                            DATABASE BLOCKOUT SECURITY ALARM
                                          </h4>
                                          <p className="text-xs text-rose-100 font-sans mt-2 leading-relaxed">
                                            SOP 12 Enforced Hold. Shipment block is active for Alpha Distributors. 
                                            The sales manager attempts to override outstanding credit rules are completely blocked.
                                            Reason: Outstanding aging exceeds 60 days limits. Invoice block is hardlocked.
                                          </p>

                                          <div className="flex items-center gap-3 mt-4">
                                            <button
                                              onClick={() => {
                                                setCrmShowOverrideAlert(false);
                                                stopBriefing();
                                              }}
                                              className="px-3.5 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] uppercase rounded-lg transition"
                                            >
                                              Acknowledge and Apply Hold
                                            </button>
                                            <span className="text-[9px] text-slate-500 font-mono">AUTHORIZED LOCK IN PROGRESS</span>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </AnimatePresence>
                                )}
                              </motion.div>
                            )}

                            {/* TAB 3: TRADE SCHEMES AND PROMOS */}
                            {crmActiveSubTab === 3 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                  <div>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded uppercase border border-emerald-500/20">
                                      Audit Policy Checklist: SOP 05 Promotions
                                    </span>
                                    <h3 className="text-lg font-black uppercase text-white mt-1">Authorized Discount Slabs approvals</h3>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                  Under GoMax operational rules, we completely eliminate unrecorded verbal agreements between company field officers and regional merchants. Every promotional slab is fully authenticated by signatures in the centralized system ledger.
                                </p>

                                <div className="space-y-4">
                                  {crmTradeSchemes.map((sch, sIdx) => {
                                    const isBlocked = sch.status === "Invalidated";
                                    return (
                                      <div
                                        key={sch.code}
                                        className={`p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                                          isBlocked ? "bg-red-950/20 border-l-4 border-l-rose-500" : "bg-white/[0.01]"
                                        }`}
                                      >
                                        <div className="text-left">
                                          <span className="text-[9.5px] font-mono font-extrabold text-slate-400 uppercase leading-none">
                                            {sch.code} // AUDITED SCHEME
                                          </span>
                                          <h4 className="text-sm font-black text-white mt-1 leading-snug">{sch.desc}</h4>
                                          <p className="text-xs text-slate-200 mt-1">
                                            Corporate discount payout: <span className="font-extrabold text-green-400 font-mono">{sch.discount}</span>
                                          </p>
                                        </div>

                                        <div className="text-right">
                                          {isBlocked ? (
                                            <span className="bg-rose-500/10 text-rose-400 border border-red-500/20 rounded px-2.5 py-1 text-[9px] uppercase font-black tracking-widest block font-sans">
                                              🚫 INVALID - NO RECORDED SIGNATURES
                                            </span>
                                          ) : (
                                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2.5 py-1 text-[9px] uppercase font-black tracking-widest block font-sans">
                                              ✓ Approved - Ledger Signed
                                            </span>
                                          )}
                                          <span className="text-[9px] text-slate-500 text-right mt-1 block font-mono">
                                            {sch.approval}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}

                            {/* TAB 4: TALENT AND DISTRIBUTOR OFFBOARDING CHECKLISTS */}
                            {crmActiveSubTab === 4 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                              >
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                  <div>
                                    <span className="text-[10px] bg-[#F0B429]/10 text-amber-400 font-mono font-bold px-2 py-0.5 rounded uppercase border border-amber-500/20">
                                      Offboarding Compliance: SOP 10 & 19
                                    </span>
                                    <h3 className="text-lg font-black uppercase text-white mt-1">Stewardship Exits & Terminations</h3>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                  When a regional director, field salesman, or partner distributor terminates their contract, operational controls require immediate software login deactivation within 24 hours. The accounts department conducts an exact 30-day comprehensive audit of final claims.
                                </p>

                                <div className="space-y-4">
                                  {crmOffboardingLedgers.map((ex, exidx) => (
                                    <div
                                      key={exidx}
                                      className="p-5 bg-white/[0.01] rounded-2xl border border-white/5 flex flex-col gap-4 text-left"
                                    >
                                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <div>
                                          <h4 className="text-sm font-black text-white leading-tight">{ex.employee}</h4>
                                          <p className="text-[10px] text-slate-400 font-mono mt-1">Resign Date: {ex.exitDate}</p>
                                        </div>
                                        <span className="bg-amber-400/15 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded text-[9px] uppercase font-black font-mono tracking-widest">
                                          {ex.status}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="flex items-center gap-2.5 bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-slate-200">
                                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] text-center ${
                                            ex.appSoftwareDeactivated ? "bg-green-500 text-black font-black" : "bg-slate-700 text-slate-400"
                                          }`}>
                                            {ex.appSoftwareDeactivated ? "✓" : "!"}
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-white text-[11px] leading-tight">Software Blocked</p>
                                            <p className="text-[9px] text-slate-400">Within 24 Hours</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-slate-200">
                                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] text-center ${
                                            ex.samplesReturned ? "bg-green-500 text-black font-black" : "bg-amber-500 text-black font-black animate-pulse"
                                          }`}>
                                            {ex.samplesReturned ? "✓" : "!"}
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-white text-[11px] leading-tight font-sans">Sample Kit Return</p>
                                            <p className="text-[9px] text-slate-400">{ex.samplesReturned ? "Completed" : "Action Required"}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-slate-200">
                                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] text-center ${
                                            ex.accountsSettled ? "bg-green-500 text-black font-black" : "bg-slate-700 text-slate-400 text-center"
                                          }`}>
                                            {ex.accountsSettled ? "✓" : "!"}
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-white text-[11px] leading-tight">Accounts Audit</p>
                                            <p className="text-[9px] text-slate-400">30-Day Checkpoint</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                          </div>

                          {/* Dynamic Feedback Box & Manual Trigger alert */}
                          <div className="border-t border-white/5 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
                            <span className="text-slate-400 text-left">
                              Currently viewing: <strong className="text-white uppercase">{crmTabNarratives[crmActiveSubTab].title}</strong>. 
                              All metrics map to dynamic real databases.
                            </span>

                            <div className="flex items-center gap-3">
                              {crmIsAutoplay ? (
                                <button
                                  onClick={() => {
                                    setCrmIsAutoplay(false);
                                    stopBriefing();
                                  }}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold uppercase rounded-lg border border-white/10 transition"
                                >
                                  Stop Slide Tour & Explore Manually
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#F0B429] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl block">
                                  ✓ Manual Control Enabled. Press any subsector button to explore!
                                </span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                  {/* System Notifications Deck */}
                  {crmNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      className="fixed bottom-24 right-8 z-[100] bg-gradient-to-r from-amber-500 to-[#F0B429] text-black font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-400 text-xs uppercase"
                    >
                      <Sparkles className="w-5 h-5 text-black shrink-0 animate-spin" />
                      {crmNotification}
                    </motion.div>
                  )}

                </div>
              )}

              {/* MODE B: STANDARD EXTERNAL IFRAME REPOSITORY CONNECTION */}
              {crmMode === "iframe" && (
                <div className="w-full flex flex-col gap-6">
                  <div id="pane-crm-header" className="p-6 bg-slate-900/60 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-3.5 h-3.5 bg-amber-500/60 rounded-full shrink-0"></div>
                      <div>
                        <h3 className="font-bold text-white uppercase text-sm tracking-widest">GoMax Enterprise OS — External App</h3>
                        <p className="text-xs text-slate-400">Loaded from gomax-enterprise-os.vercel.app — separate deployment.</p>
                      </div>
                    </div>
                    <a 
                      href="https://gomax-enterprise-os.vercel.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-[#F0B429] hover:bg-amber-500 text-black font-black border border-amber-500 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Launch Standalone Tab
                    </a>
                  </div>

                  {/* Secure Frame Emulator */}
                  <div className="rounded-[3rem] border border-white/5 bg-white h-[750px] overflow-hidden shadow-2xl relative flex flex-col text-slate-800">
                    <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-400 font-bold"></span>
                        <span className="w-3 h-3 rounded-full bg-amber-400 font-bold"></span>
                        <span className="w-3 h-3 rounded-full bg-emerald-400 font-bold"></span>
                      </div>
                      <div className="bg-slate-200/60 text-slate-600 px-8 py-1.5 rounded-lg text-xs font-mono select-all text-center w-2/3 max-w-md truncate">
                        https://gomax-enterprise-os.vercel.app
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <Database className="w-4 h-4 text-slate-500" />
                        Secure Sandbox
                      </div>
                    </div>
                    <div className="flex-1 w-full h-full relative bg-slate-50">
                      <iframe 
                        id="crm-iframe"
                        src="https://gomax-enterprise-os.vercel.app" 
                        title="Dealer CRM Link"
                        className="w-full h-full border-none shadow-inner"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* C. SOP MASTER MANUAL AND INTERACTIVE SECTION */}
          {activeTab === "sop" && (
            <motion.div
              key="pane-sop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row gap-8 items-stretch w-full min-h-[800px]"
            >
              {/* LEFT INTERACTIVE SIDEBAR */}
              <aside className="w-full lg:w-1/3 bg-[#11141C] rounded-[2.5rem] border border-white/5 p-6 md:p-8 flex flex-col overflow-hidden shadow-2xl shrink-0">
                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-5 text-left">
                    <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-md italic">
                      📖
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-white uppercase leading-none">
                        BOS Directory
                      </h2>
                      <p className="text-[10px] text-amber-500 font-bold uppercase mt-1 tracking-widest font-mono">
                        {MASTER_SOP_DATA.length} Active Modules
                      </p>
                    </div>
                  </div>

                  {/* QUICK SEARCH & FILTER WRAPPER */}
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search manuals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#05070A] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-200 outline-none focus:border-amber-500/50 transition-all font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-[#05070A] border border-white/10 px-3 py-1.5 rounded-xl">
                      <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full bg-transparent outline-none border-none text-[10px] font-bold uppercase tracking-wider text-slate-300 py-1 cursor-pointer font-sans"
                      >
                        {departments.map((deptName) => (
                           <option 
                            key={deptName} 
                            value={deptName} 
                            className="bg-[#11141C] text-slate-200 py-2"
                          >
                            {deptName === "ALL" ? "Filter: All Departments" : `${deptName}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SCROLLABLE INTERACTIVE SIDEBAR LIST */}
                <div className="flex-1 overflow-y-auto max-h-[600px] lg:max-h-[550px] pr-2 custom-scroll space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredSops.length > 0 ? (
                      filteredSops.map((sop) => {
                        const originalIndex = MASTER_SOP_DATA.findIndex(s => s.id === sop.id);
                        const isSelected = activeSopIdx === originalIndex;
                        return (
                          <motion.div
                            key={sop.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => {
                              stopAutopilot();
                              setActiveSopIdx(originalIndex);
                              setActivePageIdx(0);
                            }}
                            className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.01] transition-all duration-300 flex items-center justify-between group ${
                              isSelected
                                ? "bg-gradient-to-r from-amber-500 to-[#F0B429] border-amber-500/50 text-black shadow-lg shadow-amber-500/10 font-bold"
                                : "bg-white/[0.02] border-white/5 text-slate-300 hover:border-amber-500/20 hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex flex-col gap-1 w-11/12 text-left">
                              <p className={`text-[8px] font-bold tracking-widest uppercase truncate ${
                                isSelected ? "text-black/80" : "text-amber-500"
                              }`}>
                                {sop.id} | {sop.dept}
                              </p>
                              <h4 className="text-xs uppercase break-words leading-tight">{sop.title}</h4>
                            </div>
                            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
                              isSelected ? "text-black" : "text-slate-500"
                            }`} />
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-white/5 mt-4">
                        <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 uppercase font-mono tracking-wider font-bold">No matching blueprints found</p>
                        <button 
                          onClick={() => { setSearchTerm(""); setSelectedDept("ALL"); }}
                          className="mt-3 text-[10px] text-amber-500 uppercase tracking-widest font-bold underline"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </aside>

              {/* RIGHT MANUAL VIEWPORT & PAGINATION & Voice synthesizer */}
              <main className="flex-1 flex flex-col relative h-[800px] lg:h-auto min-h-[600px]">
                {activeSop ? (
                  <div
                    id="sopBook"
                    className="flex-1 flex flex-col bg-[#0B0F19] text-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-2 border-white/5 shadow-amber-500/5"
                  >
                    {/* Glowing Tech Grid Decorative Decals */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-radial from-amber-500/5 to-transparent pointer-events-none rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-gradient-radial from-[#F0B429]/5 to-transparent pointer-events-none rounded-full blur-2xl"></div>

                    {/* DYNAMIC SYSTEM HEADER HUD */}
                    <div className="bg-[#121622] border-b border-white/5 px-6 py-4 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 relative z-10">
                      
                      {/* Active Module Brand Specs */}
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-[#F0B429] flex items-center justify-center text-black font-black text-lg shadow-md h-full shrink-0">
                          {activeSop.id === "SOP 01" ? "🎯" : activeSop.id === "SOP 02" ? "💳" : activeSop.id === "SOP 12" ? "🛡️" : "⚙s"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-amber-500/15 text-amber-400 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                              {activeSop.id} // SYS SECURE
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-mono font-bold text-slate-400">STATUS: AUDITED</span>
                          </div>
                          <h3 className="text-sm font-bold uppercase tracking-tight text-white mt-0.5">
                            {activeSop.title}
                          </h3>
                        </div>
                      </div>

                      {/* VOICE BRIEFING & SIMULATOR MASTER CONTROL CONTROLS */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {isSpeaking ? (
                          <div
                            id="vActiveUI"
                            className="flex items-center gap-3 px-4 py-2 bg-amber-500 rounded-xl border border-amber-400 text-black shadow-lg shadow-amber-500/10 transition"
                          >
                            <div className="flex gap-0.5 h-3.5 items-end">
                              {[0.4, 0.9, 0.3, 0.7].map((delay, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ height: ["3px", "14px", "3px"] }}
                                  transition={{ repeat: Infinity, duration: 0.8, delay: delay, ease: "easeInOut" }}
                                  className="w-0.5 bg-black rounded-full"
                                />
                              ))}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Speaker Audio Engine Active</span>
                            <button
                              onClick={stopBriefing}
                              className="px-1.5 py-0.5 bg-black/15 hover:bg-black/35 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Stop
                            </button>
                          </div>
                        ) : (
                          <button
                            id="vStartBtn"
                            onClick={() => {
                              if (activePage && activeSop) {
                                startBriefing(activePage.t, activePage.c);
                              }
                            }}
                            className="px-4 py-2 bg-[#1C2030] hover:bg-[#252A40] text-slate-200 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
                            title="Narrates current section content loud"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                            Speak Page
                          </button>
                        )}

                        {/* WORKFLOW SIMULATOR BUTTON */}
                        <button
                          onClick={startWorkflowSimulation}
                          disabled={isSimulating}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                            isSimulating
                              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold"
                              : "bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md shadow-amber-500/10"
                          }`}
                        >
                          <Cpu className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                          {isSimulating ? "Testing Controls..." : "Audit Module Checks"}
                        </button>
                      </div>
                    </div>

                    {/* INTERACTIVE TIMELINE MATRIX CHECKPOINTS */}
                    <div className="bg-[#111523]/40 border-b border-white/5 py-4 px-6 md:px-10 relative shrink-0 z-20">
                      <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-white/5 -translate-y-1/2 rounded-full hidden md:block"></div>
                      
                      {/* Animated connecting flow dashes */}
                      <div className="absolute top-1/2 left-12 right-12 h-0.5 overflow-hidden -translate-y-1/2 rounded-full pointer-events-none hidden md:block">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative z-10">
                        {clausePillLabels.map((lbl) => {
                          const isCurrent = activePageIdx === lbl.index;
                          return (
                            <button
                              key={lbl.index}
                              onClick={() => {
                                stopAutopilot();
                                setActivePageIdx(lbl.index);
                              }}
                              className={`p-2.5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center cursor-pointer relative group ${
                                isCurrent
                                  ? "bg-[#181D30] border-amber-500 text-amber-400 shadow-lg shadow-amber-500/5 font-extrabold"
                                  : "bg-[#121625]/40 border-white/5 text-slate-400 hover:border-white/10 hover:bg-[#151B2F]/60"
                              }`}
                            >
                              <p className="text-[10px] uppercase font-bold tracking-tight py-1 truncate max-w-full">
                                {lbl.label}
                              </p>
                              
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition duration-200 bg-slate-900 border border-white/10 text-[8px] py-1 px-2 rounded-md font-mono pointer-events-none uppercase tracking-wider text-slate-300 z-50">
                                View Chapter {lbl.index + 1}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECURE TERMINAL & REVELATION PANEL */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scroll relative z-10 flex flex-col gap-6">
                      
                      {/* SIMU LOG MONITOR BOX */}
                      <AnimatePresence>
                        {isSimulating && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-black/60 border border-[#F0B429]/20 rounded-2xl p-4 font-mono text-[9px] text-green-400 text-left relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2.5">
                              <span className="flex items-center gap-1.5 uppercase font-bold tracking-widest text-[#F0B429]">
                                <Terminal className="w-3.5 h-3.5 animate-pulse" />
                                GoMax Active Board Simulation System
                              </span>
                              <span className="text-slate-500 text-[8px] uppercase">
                                STAGE {simStage} / 4 REPORTED
                              </span>
                            </div>
                            <div className="space-y-1">
                              {simLogs.map((log, lidx) => (
                                <motion.div
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={lidx}
                                  className="text-slate-300 leading-relaxed font-bold uppercase tracking-wider text-left"
                                >
                                  {log}
                                </motion.div>
                              ))}
                            </div>
                            <motion.div
                              animate={{ y: ["0%", "100%", "0%"] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                              className="absolute left-0 right-0 h-0.5 bg-green-500/20 top-0 pointer-events-none"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${activeSopIdx}-${activePageIdx}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3 }}
                          className="flex-1 flex flex-col gap-6"
                        >
                          {/* STAGE HEADER STAMP */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 text-left">
                            <div>
                              <p className="text-[9px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                                GOVERNING AUDIT REGISTER INDEX
                              </p>
                              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mt-1 font-sans">
                                {activePage?.t || "Operational Objective Overview"}
                              </h2>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-right hidden xs:block">
                                <p className="text-[8px] font-mono font-bold text-slate-500 uppercase leading-none">TERRITORY DISCIPLINE LEVEL</p>
                                <p className="text-xs font-mono font-extrabold text-amber-400 mt-1">99.4% NOMINAL MATCH</p>
                              </div>
                            </div>
                          </div>

                          {/* SYSTEM REVELATION CONSOLE AND INTERACTIVE PROCEDURAL GRAPHICS */}
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                            
                            {/* SECTION A: THE REVEALING MAGIC TEXT */}
                            <div className="p-6 bg-[#111523]/50 border border-white/5 rounded-3xl gap-4 flex flex-col min-h-[220px] text-left">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
                                <h4 className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                                  Standard Directive Readout
                                </h4>
                              </div>
                              <div className="text-slate-300 leading-relaxed font-sans font-medium text-left">
                                <MagicalText text={activePage?.c || ""} />
                              </div>
                            </div>

                            {/* SECTION B: CUSTOM GRAPHICS BASED ON PAGE */}
                            <div className="flex-1 flex flex-col h-full min-h-[220px]">
                              
                              {/* PAGE 0: STRATEGIC COMPASS GRAPHIC & OPERATIONAL AVATAR */}
                              {activePageIdx === 0 && (
                                <div className="bg-[#121625] border border-white/5 rounded-3xl p-5 flex flex-col h-full relative overflow-hidden shrink-0 text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E2540] to-slate-900 border border-white/10 flex items-center justify-center relative shrink-0">
                                      <span className="text-xl">🤖</span>
                                      <motion.span
                                        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"
                                      />
                                    </div>
                                    <div>
                                      <h5 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">
                                        SYSTEM INTEGRATOR AGENT
                                      </h5>
                                      <h4 className="text-xs uppercase font-extrabold text-[#F0B429]">
                                        GoPlex Auto-Auditor
                                      </h4>
                                    </div>
                                  </div>

                                  <div className="bg-[#1C2030] border border-white/10 rounded-2xl p-4 mt-4 relative text-xs text-slate-300 italic leading-relaxed font-sans font-medium">
                                    "This SOP details critical control metrics to preserve brand standards and protect capital. Selecting trigger timelines helps define our active review routines."
                                    <div className="absolute -top-2.5 left-5 w-4 h-4 bg-[#1C2030] rotate-45 border-l border-t border-white/10 pointer-events-none"></div>
                                  </div>

                                  <div className="mt-5 flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500">
                                      <Sparkles className="w-5 h-5 animate-spin text-amber-400" style={{ animationDuration: "12s" }} />
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">SYSTEM TARGET FIDELITY</p>
                                      <p className="text-[11px] font-black uppercase text-slate-200">MAX DEVIATION LIMITS: &lt;1.0%</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* PAGE 1: TRIGGER TIMING GRAPHIC */}
                              {activePageIdx === 1 && (
                                <div className="bg-[#121625] border border-white/5 rounded-3xl p-5 h-full flex flex-col justify-between shrink-0 relative overflow-hidden text-left">
                                  <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                                    <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                                      REGULAR TIME CHECKS
                                    </span>
                                    <span className="text-[8px] font-mono bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded border border-rose-500/25 uppercase font-bold">
                                      IMPORTANT
                                    </span>
                                  </div>

                                  <div className="space-y-3.5 my-3 relative pl-4">
                                    <div className="absolute left-1 border-l-2 border-dashed border-white/5 top-2 bottom-2"></div>
                                    <div className="flex items-center gap-3.5">
                                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-black text-xs font-black flex items-center justify-center font-mono">
                                        AM
                                      </div>
                                      <div>
                                        <p className="text-[9px] uppercase font-black tracking-tight text-white leading-none">09:00 Routine Checks</p>
                                        <p className="text-[11px] text-slate-400">Lock down daily visit planners and routes.</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3.5">
                                      <div className="w-7 h-7 rounded-lg bg-orange-500 text-black text-xs font-black flex items-center justify-center font-mono">
                                        PM
                                      </div>
                                      <div>
                                        <p className="text-[9px] uppercase font-black tracking-tight text-white leading-none">06:00 Outstanding followups</p>
                                        <p className="text-[11px] text-slate-300 font-medium">Verify check clearings and post balances.</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
                                    Triggers regulate critical milestones. Delaying follow-up holds dispatches immediately.
                                  </div>
                                </div>
                              )}

                              {/* PAGE 2: PROCEDURAL FLOWCHART */}
                              {activePageIdx === 2 && (
                                <div className="bg-[#121625] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shrink-0 relative text-left">
                                  <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                                    <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                      <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                                      PROCEDURAL TRACKER
                                    </span>
                                    <span className="text-[8px] font-mono text-slate-500 uppercase font-black">
                                      TAP STEPS TO AUDIT
                                    </span>
                                  </div>

                                  <div className="space-y-2.5 my-1">
                                    {activePage.c.split(". ").slice(0, 3).filter(t => t.trim() !== "").map((txt, index) => {
                                      const isChecked = checkedFlowchartSteps[index];
                                      return (
                                        <div
                                          key={index}
                                          onClick={() => {
                                            const updated = [...checkedFlowchartSteps];
                                            updated[index] = !updated[index];
                                            setCheckedFlowchartSteps(updated);
                                          }}
                                          className={`flex gap-3 p-3 rounded-xl border cursor-pointer hover:scale-[1.01] transition duration-200 ${
                                            isChecked
                                              ? "bg-[#1C2C24] border-green-500/50 text-green-300"
                                              : "bg-[#10131F] border-white/5 text-slate-400 hover:border-amber-500/20"
                                          }`}
                                        >
                                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-black ${
                                            isChecked ? "bg-green-500 text-black" : "bg-white/5 text-slate-400 border border-white/10"
                                          }`}>
                                            {isChecked ? "✓" : index + 1}
                                          </div>
                                          <p className="text-[11px] leading-relaxed font-black uppercase tracking-wide">
                                            {txt.endsWith(".") ? txt : `${txt}.`}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* PAGE 3: HAZARD RISK PANEL */}
                              {activePageIdx === 3 && (
                                <div className="bg-[#1D1217] border border-rose-500/20 rounded-3xl p-5 flex flex-col justify-between shrink-0 relative overflow-hidden text-left">
                                  <div className="flex items-center gap-3 pb-2 border-b border-[#E64A19]/15 mb-3 text-red-400">
                                    <ShieldAlert className="w-5 h-5 shrink-0" />
                                    <h4 className="text-[10px] font-mono tracking-widest uppercase font-bold text-rose-400">
                                      SYSTEM COMPLIANCE RISKS
                                    </h4>
                                  </div>

                                  <div className="my-2 p-4 bg-black/30 rounded-2xl border border-red-500/10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-red-500/40 flex items-center justify-center font-mono font-black text-rose-500 text-sm shrink-0 animate-pulse">
                                      ⚠
                                    </div>
                                    <div>
                                      <h5 className="text-[10px] font-mono font-bold tracking-widest text-[#94A3B8] uppercase leading-none">Leakage Exposure Penalty</h5>
                                      <p className="text-xs font-semibold text-rose-300 leading-relaxed mt-1.5 uppercase font-mono tracking-wider">
                                        Estimated Capital Disruption Index: ₹15,000 per territorial breach.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* PAGE 4 & 5: CONTRACT SIGNATURE */}
                              {activePageIdx >= 4 && (
                                <div className="bg-[#121625] border border-white/5 rounded-3xl p-5 flex flex-col justify-between h-full relative overflow-hidden shrink-0 text-left">
                                  <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-3">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    <h4 className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                                      OFFICIAL DELEGATION DECREE
                                    </h4>
                                  </div>

                                  <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3 font-mono text-[10px]">
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span className="uppercase">MODULE CONTROLLER:</span>
                                      <span className="text-white font-bold">{activeSop.dept} DIVISION HEAD</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span className="uppercase">VALIDATION INTEGRITY:</span>
                                      <span className="text-amber-500 font-bold">99.4% NOMINAL REGISTER</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span className="uppercase">SYSTEM DISPATCH LOCKS:</span>
                                      <span className="text-green-400 font-bold">ACTIVE FORCE SECURE</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* DYNAMIC STACK FOOTER COUNTER */}
                    <div className="h-14 bg-[#121622] border-t border-white/5 px-6 md:px-10 flex items-center justify-between text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 relative z-10">
                      <span>GOMAX OPERATIONAL AUDIT SYSTEM</span>
                      <span>© REGISTER VERIF FY 2026-27</span>
                    </div>
                  </div>
                ) : (
                  <div
                    id="sopInitial"
                    className="flex-1 bg-[#11141C] rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center p-8 md:p-14 text-center cursor-default min-h-[450px]"
                  >
                    <h2 className="text-3xl font-sans font-black text-white uppercase italic tracking-tighter">
                      Briefing Console Locked
                    </h2>
                    <p className="text-slate-400 text-sm max-w-sm mt-4 font-medium italic leading-relaxed">
                      Deep-dive into our Standard Operating Procedures. Please select one of the 22 active modules within the list to unlock corporate compliance registers.
                    </p>
                  </div>
                )}
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- FLOATING CHATBOT WIDGET: THE BOARDROOM DIRECTING AI COMPANION --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Expanded Chat Window */}
        <AnimatePresence>
          {chatbotOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-[360px] md:w-[420px] h-[520px] bg-[#0E121E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-4"
            >
              
              {/* Chat Header */}
              <div className="bg-[#161B2E] border-b border-white/10 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-black font-extrabold text-sm relative">
                    💼
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#161B2E]"></span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs uppercase font-extrabold text-white tracking-widest leading-none">
                      Boardroom AI Advisor
                    </h4>
                    <p className="text-[9px] font-mono font-bold text-amber-500 mt-1 uppercase">
                      22 SOPs Knowledge Engine
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setChatbotOpen(false); stopBriefing(); }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scroll bg-[#0A0D16]">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0 self-start">
                        🤖
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed text-left ${
                      msg.sender === "user"
                        ? "bg-amber-500 text-black font-bold rounded-tr-none text-[13px]"
                        : "bg-[#151B2E] text-slate-200 border border-white/5 rounded-tl-none font-sans"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Gemini thinking indicator */}
                {isBotThinking && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0 self-start">
                      🤖
                    </div>
                    <div className="bg-[#151B2E] border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* QUICK PROMPT BOARDROOM COMPANION PILLS (Directors can tap to trigger doubts checks) */}
              <div className="px-4 py-2 border-t border-white/5 bg-[#0D101C]/60 shrink-0">
                <p className="text-[8px] font-mono font-bold text-[#F0B429] uppercase tracking-wider text-left mb-1.5 leading-none">
                  ⚡ DIRECTORS DOUBT SHORTCUTS
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full custom-scroll no-scrollbar">
                  {[
                    { label: "Prevent trade scheme misuse?", query: "How do we prevent trade scheme billing misuse?" },
                    { label: "Summary of credit limits?", query: "What is our dealer credit check rule under SOP 12?" },
                    { label: "What happens on dealer exits?", query: "What happens when a dealer exits under SOP 19?" },
                    { label: "Dealer spacing rules?", query: "What are our dealer density limits under SOP 11?" }
                  ].map((pill, pidx) => (
                    <button
                      key={pidx}
                      onClick={() => handleChatRequest(pill.query)}
                      disabled={isBotThinking}
                      className="px-2.5 py-1.5 bg-[#171D33] hover:bg-[#1E2745] disabled:opacity-40 disabled:cursor-not-allowed text-[9px] font-extrabold text-[#F0B429] uppercase tracking-wide border border-amber-500/10 rounded-lg shrink-0 transition"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChatRequest(chatInput);
                }}
                className="bg-[#121626] border-t border-white/10 p-3 flex gap-2 shrink-0 items-center"
              >
                <input
                  type="text"
                  placeholder={isBotThinking ? "Gemini is thinking..." : "Ask anything about GoMax SOPs or brand roadmap..."}
                  value={chatInput}
                  disabled={isBotThinking}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-[#0A0D16] border border-white/5 text-xs text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500/50 transition font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isBotThinking || !chatInput.trim()}
                  className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-black font-bold hover:scale-105 transition cursor-pointer"
                >
                  {isBotThinking ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Chat Floating Toggle Circle */}
        <button
          onClick={() => {
            setChatbotOpen(!chatbotOpen);
            stopBriefing();
          }}
          className={`h-14 px-6 rounded-full flex items-center gap-2 shadow-2xl transition duration-300 hover:scale-105 cursor-pointer border ${
            chatbotOpen
              ? "bg-[#151B2E] border-white/10 text-white"
              : "bg-amber-500 hover:bg-amber-400 text-black border-amber-400 font-black shadow-amber-500/20"
          }`}
        >
          <MessageSquare className="w-5 h-5 shrink-0" />
          <span className="text-xs uppercase tracking-wider font-extrabold">
            {chatbotOpen ? "Close Advisor" : "AI Boardroom Assistant"}
          </span>
        </button>
      </div>

    </div>
  );
}
