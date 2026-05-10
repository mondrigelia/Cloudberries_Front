import { useState, useEffect, useRef } from "react";

// ---------- Types ----------
interface ServiceItem {
  id: string;
  name: string;
  provider: string;
  tags: string[];
  description: string;
  url: string;
  fz152: boolean;
  platform?: string;
  region: string;
}

interface ServiceResult extends ServiceItem {
  rationale: string;
  priceScore: number;
  taskMatchScore: number;
  criteriaMatchScore: number;
}

// ---------- Provider assets ----------
const PROVIDER_STYLE: Record<string, { gradient: string }> = {
  "Т1 Облако":     { gradient: "from-[#1DAFF7]/10 to-[#008ACD]/5" },
  "Cloud.ru":      { gradient: "from-purple-500/10 to-purple-700/5" },
  "Selectel":      { gradient: "from-emerald-500/10 to-emerald-700/5" },
  "VK Cloud":      { gradient: "from-sky-500/10 to-blue-600/5" },
  "Yandex Cloud":  { gradient: "from-amber-400/10 to-orange-500/5" },
};

const PROVIDER_LOGOS: Record<string, string> = {
  "Т1 Облако": "https://t1-cloud.ru/favicon.ico",
  "Cloud.ru": "https://www.google.com/s2/favicons?domain=cloud.ru&sz=64",
  "Selectel": "https://selectel.ru/favicon.ico",
  "VK Cloud": "https://cloud.vk.com/favicon.ico",
  "Yandex Cloud": "https://yandex.cloud/favicon.ico",
};

function ProviderIcon({ provider, size = "md" }: { provider: string; size?: "sm" | "md" }) {
  const logoUrl = PROVIDER_LOGOS[provider];
  const dim = size === "sm" ? "w-6 h-6" : "w-9 h-9";
  if (!logoUrl) return null;
  return (
    <div className={`${dim} rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 shrink-0 overflow-hidden`}>
      <img src={logoUrl} alt={provider} className="w-full h-full object-contain p-1" />
    </div>
  );
}

// ---------- Icons ----------
function IconSend() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
      <circle cx="19" cy="19" r="1.5" opacity="0.4" />
      <circle cx="5" cy="20" r="1" opacity="0.3" />
      <circle cx="21" cy="8" r="1" opacity="0.25" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1DAFF7" />
          <stop offset="1" stopColor="#008ACD" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logoGrad)" />
      <path d="M9 22V10h4.8q2.2 0 3.3 1.05t1.1 2.95q0 1.9-1.1 2.95T13.8 18H12.3v4H9zm3.3-5h1q.8 0 1.15-.35t.35-1.15q0-.8-.35-1.15T13.3 12.5h-1V17z" fill="white" />
    </svg>
  );
}

// ---------- Mock data ----------
const ALL_SERVICES: ServiceItem[] = [
  { id: "1", name: "Compute (Cloud Engine)", provider: "Т1 Облако", tags: ["VPS", "OpenStack", "152-ФЗ"], description: "Облачные ресурсы для создания масштабируемой вычислительной инфраструктуры, администрирования и сопровождения сервисов на платформе OpenStack.", url: "https://t1-cloud.ru/services/compute", fz152: true, platform: "OpenStack", region: "Москва" },
  { id: "2", name: "Объектное хранилище S3", provider: "Т1 Облако", tags: ["S3", "152-ФЗ", "OpenStack"], description: "S3-совместимое объектное хранилище с мультизональным размещением для файлов, статики, бэкапов и архивов.", url: "https://t1-cloud.ru/services/s3", fz152: true, platform: "OpenStack", region: "Москва" },
  { id: "3", name: "Managed Kubernetes", provider: "Т1 Облако", tags: ["K8s", "152-ФЗ", "OpenStack"], description: "Управляемый кластер Kubernetes с автоскейлингом и интеграцией в OpenStack.", url: "https://t1-cloud.ru/services/kubernetes", fz152: true, platform: "OpenStack", region: "Москва" },
  { id: "4", name: "Managed PostgreSQL", provider: "Т1 Облако", tags: ["БД", "PostgreSQL", "152-ФЗ"], description: "DBaaS на базе PostgreSQL с автоматическим бэкапом, репликацией и мониторингом.", url: "https://t1-cloud.ru/services/postgresql", fz152: true, platform: "OpenStack", region: "Москва" },
  { id: "5", name: "Evolution Object Storage", provider: "Cloud.ru", tags: ["S3", "152-ФЗ", "Multi-AZ"], description: "Масштабируемое S3-хранилище с автоматическим масштабированием, версионированием и AWS S3 API.", url: "https://cloud.ru/services/object-storage", fz152: true, region: "Москва" },
  { id: "6", name: "Cloud Servers", provider: "VK Cloud", tags: ["VPS", "VMware"], description: "Виртуальные серверы с быстрой сетью и гибкими конфигурациями.", url: "https://cloud.vk.com/services/servers", fz152: false, platform: "VMware", region: "Москва, Санкт-Петербург" },
  { id: "7", name: "S3-хранилище", provider: "Selectel", tags: ["S3", "холодное хранение"], description: "Объектное хранилище с горячим и холодным классами для бэкапов и архивов.", url: "https://selectel.ru/services/storage/s3/", fz152: false, region: "Москва, Санкт-Петербург" },
  { id: "8", name: "Compute Cloud", provider: "Yandex Cloud", tags: ["VPS", "посекундная оплата"], description: "Виртуальные машины с посекундной оплатой и интеграцией с сервисами Yandex Cloud.", url: "https://yandex.cloud/ru/services/compute", fz152: false, region: "Москва, Владимирская обл." },
  { id: "9", name: "Managed Databases", provider: "Yandex Cloud", tags: ["БД", "PostgreSQL", "MySQL"], description: "Управляемые БД PostgreSQL, MySQL, ClickHouse с авто-бэкапом и масштабированием.", url: "https://yandex.cloud/ru/services/managed-postgresql", fz152: false, region: "Москва, Владимирская обл." },
  { id: "10", name: "Cloud Storage", provider: "VK Cloud", tags: ["S3", "Hotbox", "Icebox"], description: "Объектное хранилище с горячим и холодным классами.", url: "https://cloud.vk.com/services/storage", fz152: false, region: "Москва, Санкт-Петербург" },
  { id: "11", name: "VPS (Virtual Private Server)", provider: "Selectel", tags: ["VPS", "VMware"], description: "Виртуальные серверы с выделенными ресурсами и быстрым масштабированием.", url: "https://selectel.ru/services/vps/", fz152: false, platform: "VMware", region: "Москва, Санкт-Петербург" },
  { id: "12", name: "Cloud Servers", provider: "Cloud.ru", tags: ["VPS", "OpenStack", "152-ФЗ"], description: "Виртуальные машины на OpenStack с высокой доступностью и 152-ФЗ.", url: "https://cloud.ru/services/servers", fz152: true, platform: "OpenStack", region: "Москва" },
];

const MOCK_RESULTS: ServiceResult[] = [
  { id: "r1", name: "Объектное хранилище S3", provider: "Т1 Облако", tags: ["S3", "152-ФЗ", "OpenStack"], description: "S3-хранилище с мультизональным размещением и интеграцией с OpenStack.", url: "https://t1-cloud.ru/services/s3", fz152: true, platform: "OpenStack", region: "Москва", rationale: "Наиболее выгодное предложение в заданном бюджете (2000 руб/мес). Полное соответствие 152-ФЗ, мультизональный S3 повышает надёжность.", priceScore: 9, taskMatchScore: 9, criteriaMatchScore: 8 },
  { id: "r2", name: "Evolution Object Storage", provider: "Cloud.ru", tags: ["S3", "152-ФЗ", "Multi-AZ"], description: "S3-хранилище от Cloud.ru с версионированием и совместимостью S3 API.", url: "https://cloud.ru/services/object-storage", fz152: true, region: "Москва", rationale: "Отличная альтернатива с мощным функционалом. Дороже Т1, но предоставляет больше гибкости и глобальную CDN.", priceScore: 8, taskMatchScore: 10, criteriaMatchScore: 9 },
  { id: "r3", name: "Cloud Storage", provider: "VK Cloud", tags: ["S3", "Hotbox", "Icebox"], description: "Объектное хранилище VK Cloud с горячим и холодным классами.", url: "https://cloud.vk.com/services/storage", fz152: false, region: "Москва, Санкт-Петербург", rationale: "Самое бюджетное решение при больших объёмах. Без официального статуса 152-ФЗ.", priceScore: 10, taskMatchScore: 7, criteriaMatchScore: 6 },
];

// ---------- Score bar ----------
function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className="font-bold text-gray-800 dark:text-gray-200 tabular-nums">{value}/10</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#1DAFF7] to-[#008ACD] rounded-full transition-all duration-700 ease-out" style={{ width: `${(value / 10) * 100}%` }} />
      </div>
    </div>
  );
}

// ---------- Service Card (upper part, no tags) ----------
function ServiceCard({ service, compact }: { service: ServiceItem; compact?: boolean }) {
  const g = PROVIDER_STYLE[service.provider]?.gradient || "from-gray-100 to-gray-50";
  return (
    <div className="group relative rounded-2xl bg-white dark:bg-[#181B27] shadow-lg shadow-gray-200/50 dark:shadow-black/25 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/35 hover:-translate-y-0.5">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${g} opacity-0 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />
      <div className={`relative ${compact ? "p-5" : "p-6"} flex flex-col lg:flex-row gap-5`}>
        <div className="flex-[2] min-w-0">
          <h3 className={`font-bold text-gray-900 dark:text-gray-100 tracking-tight ${compact ? "text-base" : "text-lg"}`}>
            {service.name}
          </h3>
          <div className="mt-3 flex items-center gap-2.5">
            <ProviderIcon provider={service.provider} size={compact ? "sm" : "md"} />
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{service.provider}</span>
          </div>
          <p className={`mt-3 leading-relaxed text-gray-500 dark:text-gray-400 ${compact ? "text-xs" : "text-sm"}`}>
            {service.description}
          </p>
          <a href={service.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[#1DAFF7] hover:text-[#008ACD] transition-colors">
            <span>Подробнее</span>
            <IconExternal />
          </a>
        </div>
        <div className={`lg:w-1/3 ${compact ? "lg:min-w-[160px]" : ""}`}>
          <div className="h-full bg-gray-50/80 dark:bg-[#1F2335]/80 backdrop-blur-sm rounded-xl p-4 text-sm space-y-2.5 border border-gray-100 dark:border-gray-700/50">
            <MetricRow label="152-ФЗ" value={service.fz152 ? "Да" : "Нет"} valueClass={service.fz152 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"} />
            {service.platform && <MetricRow label="Платформа" value={service.platform} />}
            <MetricRow label="Регионы" value={service.region} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className={`font-semibold text-gray-800 dark:text-gray-200 text-right text-xs leading-tight ${valueClass || ""}`}>{value}</span>
    </div>
  );
}

// ---------- Result Card (with bottom block) ----------
function ResultCard({ result }: { result: ServiceResult }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#181B27] shadow-lg shadow-gray-200/50 dark:shadow-black/25 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/35">
      <div className="relative">
        <ServiceCard service={result} compact />
        <div className="relative mx-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        <div className="relative p-6 pt-5 flex flex-col lg:flex-row gap-6">
          <div className="flex-[2] min-w-0">
            <div className="flex gap-2 mb-3 flex-wrap">
              {result.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 text-[#1DAFF7] border border-sky-100/50 dark:border-sky-700/30 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{result.rationale}</p>
          </div>
          <div className="lg:w-1/3">
            <div className="bg-gray-50/80 dark:bg-[#1F2335]/80 backdrop-blur-sm rounded-xl p-5 space-y-3.5 border border-gray-100 dark:border-gray-700/50">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Скоринг</div>
              <ScoreBar label="Цена" value={result.priceScore} />
              <ScoreBar label="Соответствие задаче" value={result.taskMatchScore} />
              <ScoreBar label="Соответствие критериям" value={result.criteriaMatchScore} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Decorative background ----------
function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#1DAFF7]/10 to-[#008ACD]/5 dark:from-[#1DAFF7]/8 dark:to-[#008ACD]/3 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-sky-400/8 to-blue-500/5 dark:from-sky-400/5 dark:to-blue-500/3 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gradient-to-bl from-purple-400/5 to-sky-300/5 dark:from-purple-400/3 dark:to-sky-300/3 blur-3xl" />
    </div>
  );
}

// ---------- Main ----------
export default function App() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ServiceResult[] | null>(null);
  const [startupServices, setStartupServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => { pickRandomServices(); }, []);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  function pickRandomServices() {
    const shuffled = [...ALL_SERVICES].sort(() => 0.5 - Math.random());
    setStartupServices(shuffled.slice(0, 10));
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: "Вот что удалось подобрать по вашему запросу:" }]);
      setResults(MOCK_RESULTS);
      setIsLoading(false);
    }, 1800);
  };

  const handleNewChat = () => {
    setMessages([]);
    setResults(null);
    setIsLoading(false);
    pickRandomServices();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFB] dark:bg-[#0F1117] overflow-hidden transition-colors duration-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="relative shrink-0 bg-white/80 dark:bg-[#181B27]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/60 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <IconLogo />
          <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent tracking-tight">Cloudberries</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
            title={dark ? "Светлая тема" : "Тёмная тема"}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#1DAFF7] to-[#008ACD] text-white shadow-lg shadow-[#1DAFF7]/25 hover:shadow-xl hover:shadow-[#1DAFF7]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <IconPlus />
            Новый чат
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel — chat */}
        <div className="relative w-full lg:w-1/2 flex flex-col bg-white/60 dark:bg-[#0F1117]/50 backdrop-blur-sm border-r border-gray-200/40 dark:border-gray-800/50 z-10">
          <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-3 scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 animate-[fadeIn_0.6s_ease-out]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 flex items-center justify-center mb-5 shadow-lg shadow-blue-100/50 dark:shadow-black/20 ring-1 ring-blue-100/50 dark:ring-blue-800/30">
                  <IconSparkle />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">Подбор облачных сервисов</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 max-w-sm leading-relaxed">
                  Опишите вашу задачу — система подберёт лучшие решения от российских провайдеров
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {["S3 хранилище до 3000 ₽", "VPS под 152-ФЗ", "Kubernetes"].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => { setInput(hint); }}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:border-[#1DAFF7]/30 hover:text-[#1DAFF7] hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-[fadeIn_0.3s_ease-out_both]`}>
                    <div className={`max-w-[85%] lg:max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-[#1DAFF7] to-[#008ACD] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#1DAFF7]/20"
                        : "bg-white dark:bg-[#1F2335] text-gray-700 dark:text-gray-300 rounded-2xl rounded-bl-md shadow-md shadow-gray-200/60 dark:shadow-black/20 border border-gray-100 dark:border-gray-700/50"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-[#1F2335] rounded-2xl rounded-bl-md shadow-md shadow-gray-200/60 dark:shadow-black/20 border border-gray-100 dark:border-gray-700/50 px-4 py-3 flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 p-4 bg-white/80 dark:bg-[#181B27]/80 backdrop-blur border-t border-gray-100 dark:border-gray-800/50">
            <div className="flex gap-3 max-w-3xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Опишите задачу..."
                disabled={isLoading}
                className="flex-1 bg-gray-100/80 dark:bg-gray-800/80 border-0 rounded-2xl px-5 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1DAFF7]/30 focus:bg-white dark:focus:bg-gray-800 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1DAFF7] to-[#008ACD] text-white flex items-center justify-center shadow-lg shadow-[#1DAFF7]/25 hover:shadow-xl hover:shadow-[#1DAFF7]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 shrink-0"
                title="Отправить"
              >
                <IconSend />
              </button>
            </div>
          </div>
        </div>

        {/* Right panel — showcase */}
        <div className="relative w-full lg:w-1/2 overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 dark:from-[#0F1117] dark:via-[#12141D] dark:to-[#0F1117]">
          <BackgroundBlobs />
          <div className="relative p-6 space-y-5 min-h-full">
            {!results ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Рекомендуемые сервисы</h2>
                  <button onClick={pickRandomServices} className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-[#1DAFF7] transition-colors">
                    Обновить
                  </button>
                </div>
                {startupServices.map((service, idx) => (
                  <div key={service.id} className="animate-[fadeIn_0.4s_ease-out_both]" style={{ animationDelay: `${idx * 120}ms` }}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#1DAFF7] to-[#008ACD]" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Результаты подбора</h2>
                </div>
                {results.map((res, idx) => (
                  <div key={res.id} className="animate-[fadeIn_0.5s_ease-out_both]" style={{ animationDelay: `${idx * 150}ms` }}>
                    <ResultCard result={res} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .scroll-smooth { scroll-behavior: smooth; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .dark ::-webkit-scrollbar-thumb { background: #4B5563; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #6B7280; }
      `}</style>
    </div>
  );
}
