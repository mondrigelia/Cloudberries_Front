import { useState, useEffect, useRef } from "react";
import { Cloud, Send, Plus, Sun, Moon, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Skeleton } from "./components/ui/skeleton";
import type { ServiceItem, ServiceResult } from "./api";
import { getSessionId, resetSessionId, fetchServices, fetchSession, sendChatMessage, shuffleTake } from "./api";

// ---------- Provider assets ----------
const PROVIDER_LOGOS: Record<string, string> = {
  "Т1 Облако": "https://t1-cloud.ru/favicon.ico",
  "Cloud.ru": "https://www.google.com/s2/favicons?domain=cloud.ru&sz=64",
  "Selectel": "https://selectel.ru/favicon.ico",
  "VK Cloud": "https://cloud.vk.com/favicon.ico",
  "Yandex Cloud": "https://yandex.cloud/favicon.ico",
};

function ProviderIcon({ provider, size = "md" }: { provider: string; size?: "sm" | "md" }) {
  const url = PROVIDER_LOGOS[provider];
  const dim = size === "sm" ? "w-6 h-6" : "w-9 h-9";
  if (!url) return null;
  return (
    <div className={`${dim} rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 shrink-0 overflow-hidden`}>
      <img src={url} alt={provider} className="w-full h-full object-contain p-0.5" />
    </div>
  );
}

// ---------- Helpers ----------
function minPrice(elements: ServiceItem["pricing_elements"]): number | null {
  if (!elements || elements.length === 0) return null;
  return Math.min(...elements.map((e) => e.price));
}

// ---------- CATALOG CARD ----------
function CatalogCard({ service }: { service: ServiceItem }) {
  const cheapest = minPrice(service.pricing_elements);
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col flex-1">
      <div className="p-5 flex flex-col flex-1 gap-2">
        <h3 className="text-base font-bold leading-tight line-clamp-2">{service.name}</h3>
        <div className="flex items-center gap-2">
          <ProviderIcon provider={service.provider} size="sm" />
          <span className="text-xs font-medium text-muted-foreground">{service.provider}</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">{service.description}</p>
        {service.compliance_tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {service.compliance_tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 text-[#1DAFF7] border-sky-100/50 dark:border-sky-700/30">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 border">
          <span className="text-xs text-muted-foreground">
            Регионы: {service.regions.join(", ")}
          </span>
          {cheapest !== null && (
            <span className="text-xs text-muted-foreground block">
              от {cheapest} ₽
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ---------- RESULT CARD ----------
function ResultCardFull({ result, rank }: { result: ServiceResult; rank: number }) {
  return (
    <Card className="overflow-hidden flex flex-col flex-1">
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight">#{rank}</span>
          <ProviderIcon provider={result.provider} size="sm" />
          <span className="text-xs font-medium text-muted-foreground">{result.provider}</span>
        </div>
        <h3 className="text-sm font-bold leading-tight">{result.name}</h3>
        <p className="text-xs leading-relaxed italic text-muted-foreground">{result.rationale}</p>
        {result.matched_keywords.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium text-muted-foreground">Совпало:</span>
            {result.matched_keywords.map((kw) => (
              <Badge key={kw} variant="outline" className="text-[10px] px-2 py-0.5 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
                {kw}
              </Badge>
            ))}
          </div>
        )}
        {Object.keys(result.scores).length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 border">
            {Object.entries(result.scores).map(([label, value]) => (
              <div key={label} className="flex justify-between items-center text-xs">
                <span className="font-medium text-muted-foreground">{label}</span>
                <span className="font-bold text-[#1DAFF7]">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------- HISTORY OVERLAY ----------
function HistoryOverlay({ messages }: { messages: { role: string; text: string }[] }) {
  const overlayChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayChatRef.current) {
      overlayChatRef.current.scrollTop = overlayChatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-2xl shadow-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">История чата</span>
      </div>
      <div ref={overlayChatRef} className="px-3 pb-2 max-h-72 overflow-y-auto space-y-1.5">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">История пуста</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#1DAFF7] to-[#008ACD] text-white rounded-2xl rounded-br-md"
                  : "bg-muted text-foreground rounded-2xl rounded-bl-md"
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ========== MAIN APP ==========
export default function App() {
  const [phase, setPhase] = useState<"catalog" | "chat" | "results">("catalog");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ServiceResult[] | null>(null);
  const [catalogServices, setCatalogServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const assistantTextRef = useRef("");
  const currentAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function init() {
      const sid = getSessionId();
      setSessionId(sid);

      try {
        const [allServices, session] = await Promise.all([
          fetchServices(),
          fetchSession(sid).catch(() => null),
        ]);

        setCatalogServices(shuffleTake(allServices, 9));

        if (session) {
          setMessages(session.messages);
          if (session.results.length > 0) {
            setResults(session.results);
            setPhase("results");
          } else if (session.messages.length > 0) {
            setPhase("chat");
          }
        }
      } catch {
        // API unavailable — show empty catalog
      }
    }
    init();
  }, []);

  function startSearch(text: string) {
    if (isLoading || !text.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);

    if (phase === "catalog") setPhase("chat");

    if (currentAbort.current) currentAbort.current.abort();
    const controller = new AbortController();
    currentAbort.current = controller;

    const accumulated: ServiceResult[] = [];
    assistantTextRef.current = "";

    sendChatMessage(sessionId, text, {
      onSearchResult: (service) => { accumulated.push(service); },
      onToken: (token) => { assistantTextRef.current = token; },
      onDone: () => {
        setMessages((prev) => [...prev, { role: "assistant", text: assistantTextRef.current }]);
        setResults(accumulated);
        setIsLoading(false);
        setPhase("results");
      },
      onError: (errorText) => {
        setMessages((prev) => [...prev, { role: "assistant", text: errorText }]);
        setIsLoading(false);
      },
    }, controller.signal).catch((err: unknown) => {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => [...prev, { role: "assistant", text: "Ошибка соединения с сервером" }]);
      setIsLoading(false);
    });
  }

  function handleCatalogSearch() {
    startSearch(input);
  }

  function handleSend() {
    startSearch(input);
  }

  function handleNewChat() {
    if (currentAbort.current) currentAbort.current.abort();
    const newId = resetSessionId();
    setSessionId(newId);
    setMessages([]);
    setResults(null);
    setIsLoading(false);
    setPhase("catalog");
  }

  function goToCatalog() {
    if (currentAbort.current) currentAbort.current.abort();
    setPhase("catalog");
    setResults(null);
    setIsLoading(false);
  }

  function ThemeToggle() {
    return (
      <button
        onClick={() => setDark(!dark)}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground bg-secondary hover:bg-accent transition-colors shrink-0"
        title={dark ? "Светлая тема" : "Тёмная тема"}
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  function Logo() {
    return (
      <button onClick={goToCatalog} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
        <Cloud className="w-7 h-7 text-[#1DAFF7]" />
        <span className="text-sm font-bold tracking-tight">Cloudberries</span>
      </button>
    );
  }

  function RightButtons({ showNewChat }: { showNewChat: boolean }) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        {showNewChat && (
          <Button size="sm" onClick={handleNewChat}>
            <Plus className="w-4 h-4" /> Новый чат
          </Button>
        )}
        <ThemeToggle />
      </div>
    );
  }

  // =========================== CATALOG ===========================
  if (phase === "catalog") {
    return (
      <div className="h-screen flex flex-col bg-background transition-colors duration-300">
        <div className="flex-1 overflow-y-auto px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalogServices.map((s, i) => (
              <div key={s.id} className="flex animate-in fade-in duration-300" style={{ animationDelay: `${i * 40}ms` }}>
                <CatalogCard service={s} />
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t bg-card px-5 py-3">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex-1 max-w-2xl mx-8 relative">
              {showSuggestions && (
                <div className="absolute bottom-full left-0 right-12 mb-2 flex gap-2 flex-wrap">
                  {["S3 хранилище до 3000 ₽", "VPS под 152-ФЗ", "Kubernetes"].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => {
                        setInput(hint);
                        setShowSuggestions(false);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-card border hover:border-[#1DAFF7]/30 hover:text-[#1DAFF7] hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all shadow-sm"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 relative">
                <Search className="absolute left-4 top-4 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleCatalogSearch(); } }}
                  placeholder="Подобрать облачный сервис"
                  rows={1}
                  className="flex-1 pl-10 text-foreground"
                />
                <Button onClick={handleCatalogSearch} disabled={!input.trim()} size="icon" className="w-12 h-12 shrink-0">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <RightButtons showNewChat={false} />
          </div>
        </div>

        <style>{`
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.3); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.5); }
        `}</style>
      </div>
    );
  }

  // =========================== CHAT ===========================
  if (phase === "chat") {
    return (
      <div className="h-screen flex flex-col bg-background transition-colors duration-300">
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? null : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}>
                  <div className={`max-w-[85%] lg:max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#1DAFF7] to-[#008ACD] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#1DAFF7]/20"
                      : "bg-muted text-foreground rounded-2xl rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <Skeleton className="h-12 w-3/4 rounded-2xl rounded-bl-md" />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t bg-card px-5 py-3">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex-1 max-w-2xl mx-8 flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Опишите задачу..."
                disabled={isLoading}
                rows={1}
                className="flex-1 text-foreground"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="w-12 h-12 shrink-0">
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <RightButtons showNewChat={true} />
          </div>
        </div>
      </div>
    );
  }

  // =========================== RESULTS ===========================
  return (
    <div className="h-screen flex flex-col bg-background transition-colors duration-300">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 pt-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}>
              <div className={`max-w-[85%] lg:max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#1DAFF7] to-[#008ACD] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#1DAFF7]/20"
                  : "bg-muted text-foreground rounded-2xl rounded-bl-md"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        {results && (
          <div className="max-w-6xl mx-auto p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#1DAFF7] to-[#008ACD]" />
              <h2 className="text-base font-bold tracking-tight">Результаты подбора</h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden flex flex-col">
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((res, idx) => (
                  <div key={res.id} className="flex animate-in fade-in duration-400" style={{ animationDelay: `${idx * 120}ms` }}>
                    <ResultCardFull result={res} rank={idx + 1} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="shrink-0 border-t bg-card px-5 py-3 relative"
        onMouseEnter={() => messages.length > 0 && setShowHistory(true)}
        onMouseLeave={() => setShowHistory(false)}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex-1 max-w-2xl mx-8 relative">
            {showHistory && messages.length > 0 && (
              <HistoryOverlay
                messages={messages}
              />
            )}
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Дополните или уточните запрос..."
                disabled={isLoading}
                rows={1}
                className="flex-1 text-foreground"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="w-12 h-12 shrink-0">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <RightButtons showNewChat={true} />
        </div>
      </div>
    </div>
  );
}
