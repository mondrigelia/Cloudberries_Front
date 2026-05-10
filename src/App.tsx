import { useState, useEffect } from "react";

// ---------- Типы данных ----------
interface ServiceItem {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
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
  relevanceScore: number;
}

// ---------- Цвета провайдеров ----------
const PROVIDER_COLORS: Record<string, string> = {
  "Т1 Облако": "bg-blue-600",
  "Cloud.ru": "bg-purple-600",
  "Selectel": "bg-green-600",
  "VK Cloud": "bg-blue-500",
  "Yandex Cloud": "bg-amber-500",
};

function ProviderIcon({ provider }: { provider: string }) {
  const color = PROVIDER_COLORS[provider] || "bg-gray-500";
  const label = provider === "Т1 Облако" ? "Т1" : provider.charAt(0);
  return (
    <div
      className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
    >
      {label}
    </div>
  );
}

// ---------- Моковые данные ----------
const ALL_SERVICES: ServiceItem[] = [
  {
    id: "1",
    name: "Compute (Cloud Engine)",
    provider: "Т1 Облако",
    tags: ["VPS", "OpenStack", "152-ФЗ"],
    description:
      "Облачные ресурсы для создания масштабируемой вычислительной инфраструктуры, администрирования и сопровождения сервисов на платформе OpenStack.",
    url: "https://t1-cloud.ru/services/compute",
    fz152: true,
    platform: "OpenStack",
    region: "Москва",
  },
  {
    id: "2",
    name: "Объектное хранилище S3",
    provider: "Т1 Облако",
    tags: ["S3", "152-ФЗ", "OpenStack"],
    description:
      "S3-совместимое объектное хранилище с мультизональным размещением. Подходит для хранения файлов, статики, бэкапов и архивов.",
    url: "https://t1-cloud.ru/services/s3",
    fz152: true,
    platform: "OpenStack",
    region: "Москва",
  },
  {
    id: "3",
    name: "Managed Kubernetes",
    provider: "Т1 Облако",
    tags: ["K8s", "152-ФЗ", "OpenStack"],
    description:
      "Управляемый кластер Kubernetes с автоматическим масштабированием и интеграцией в экосистему OpenStack.",
    url: "https://t1-cloud.ru/services/kubernetes",
    fz152: true,
    platform: "OpenStack",
    region: "Москва",
  },
  {
    id: "4",
    name: "Managed PostgreSQL",
    provider: "Т1 Облако",
    tags: ["БД", "PostgreSQL", "152-ФЗ"],
    description:
      "DBaaS на базе PostgreSQL. Автоматическое резервное копирование, репликация и мониторинг.",
    url: "https://t1-cloud.ru/services/postgresql",
    fz152: true,
    platform: "OpenStack",
    region: "Москва",
  },
  {
    id: "5",
    name: "Evolution Object Storage",
    provider: "Cloud.ru",
    tags: ["S3", "152-ФЗ", "Multi-AZ"],
    description:
      "Масштабируемое S3-хранилище с автоматическим масштабированием, поддержкой версионирования и совместимостью с AWS S3 API.",
    url: "https://cloud.ru/services/object-storage",
    fz152: true,
    region: "Москва",
  },
  {
    id: "6",
    name: "Cloud Servers",
    provider: "VK Cloud",
    tags: ["VPS", "VMware"],
    description:
      "Виртуальные серверы с быстрой сетью, гибкими тарифами и поддержкой различных конфигураций.",
    url: "https://cloud.vk.com/services/servers",
    fz152: false,
    platform: "VMware",
    region: "Москва, Санкт-Петербург",
  },
  {
    id: "7",
    name: "S3-хранилище",
    provider: "Selectel",
    tags: ["S3", "холодное хранение"],
    description:
      "Объектное хранилище с горячим и холодным классами хранения. Подходит для резервного копирования и архивов.",
    url: "https://selectel.ru/services/storage/s3/",
    fz152: false,
    region: "Москва, Санкт-Петербург",
  },
  {
    id: "8",
    name: "Compute Cloud",
    provider: "Yandex Cloud",
    tags: ["VPS", "посекундная оплата"],
    description:
      "Виртуальные машины с посекундной оплатой, широким выбором конфигураций и интеграцией с сервисами Yandex Cloud.",
    url: "https://yandex.cloud/ru/services/compute",
    fz152: false,
    region: "Москва, Владимирская обл.",
  },
  {
    id: "9",
    name: "Managed Databases",
    provider: "Yandex Cloud",
    tags: ["БД", "PostgreSQL", "MySQL"],
    description:
      "Управляемые базы данных PostgreSQL, MySQL, ClickHouse и другие с автоматическим бэкапом и масштабированием.",
    url: "https://yandex.cloud/ru/services/managed-postgresql",
    fz152: false,
    region: "Москва, Владимирская обл.",
  },
  {
    id: "10",
    name: "Cloud Storage",
    provider: "VK Cloud",
    tags: ["S3", "Hotbox", "Icebox"],
    description:
      "Объектное хранилище с горячим и холодным классами. Идеально для разноплановых нагрузок и экономии бюджета.",
    url: "https://cloud.vk.com/services/storage",
    fz152: false,
    region: "Москва, Санкт-Петербург",
  },
  {
    id: "11",
    name: "VPS (Virtual Private Server)",
    provider: "Selectel",
    tags: ["VPS", "VMware"],
    description:
      "Виртуальные серверы с выделенными ресурсами и возможностью быстрого масштабирования.",
    url: "https://selectel.ru/services/vps/",
    fz152: false,
    platform: "VMware",
    region: "Москва, Санкт-Петербург",
  },
  {
    id: "12",
    name: "Cloud Servers",
    provider: "Cloud.ru",
    tags: ["VPS", "OpenStack", "152-ФЗ"],
    description:
      "Виртуальные машины на базе OpenStack с высокой доступностью и соответствием 152-ФЗ.",
    url: "https://cloud.ru/services/servers",
    fz152: true,
    platform: "OpenStack",
    region: "Москва",
  },
];

const MOCK_RESULTS: ServiceResult[] = [
  {
    id: "r1",
    name: "Объектное хранилище S3",
    provider: "Т1 Облако",
    tags: ["S3", "152-ФЗ", "OpenStack"],
    description:
      "Облачное объектное хранилище S3 с мультизональным размещением и интеграцией с платформой OpenStack. Подходит для хранения файлов пользователей, статики, бэкапов.",
    url: "https://t1-cloud.ru/services/s3",
    fz152: true,
    platform: "OpenStack",
    region: "Москва",
    rationale:
      "Наиболее выгодное предложение в заданном бюджете (2000 руб/мес). Полное соответствие 152-ФЗ, наличие мультизонального S3 повышает надёжность.",
    priceScore: 0.92,
    relevanceScore: 0.88,
  },
  {
    id: "r2",
    name: "Evolution Object Storage",
    provider: "Cloud.ru",
    tags: ["S3", "152-ФЗ", "Multi-AZ"],
    description:
      "Масштабируемое S3-хранилище от Cloud.ru с автоматическим масштабированием, поддержкой версионирования и совместимостью с AWS S3 API.",
    url: "https://cloud.ru/services/object-storage",
    fz152: true,
    region: "Москва",
    rationale:
      "Отличная альтернатива с мощным функционалом. Немного дороже Т1, но предоставляет больше гибкости и глобальную сеть CDN.",
    priceScore: 0.78,
    relevanceScore: 0.95,
  },
  {
    id: "r3",
    name: "Cloud Storage",
    provider: "VK Cloud",
    tags: ["S3", "Hotbox", "Icebox"],
    description:
      "Объектное хранилище VK Cloud с горячим и холодным классами. Идеально для разноплановых нагрузок и экономии бюджета.",
    url: "https://cloud.vk.com/services/storage",
    fz152: false,
    region: "Москва, Санкт-Петербург",
    rationale:
      "Самое бюджетное решение при больших объёмах хранения. Однако отсутствует официальный статус 152-ФЗ, что может не подойти для чувствительных данных.",
    priceScore: 0.99,
    relevanceScore: 0.65,
  },
];

// ---------- Компонент карточки услуги (без нижнего блока) ----------
function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Левая часть (2/3) */}
        <div className="flex-[2]">
          <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            {service.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-[#e6f7fc] text-[#00abe9] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
            <ProviderIcon provider={service.provider} />
            <span className="font-medium">{service.provider}</span>
          </div>
          <p className="mt-2 text-gray-600 text-sm leading-relaxed">
            {service.description}
          </p>
          <a
            href={service.url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 text-[#00abe9] text-sm font-medium hover:underline"
          >
            Подробнее на сайте провайдера ↗
          </a>
        </div>

        {/* Правая часть (1/3) – метрики */}
        <div className="md:w-1/3 bg-gray-50 rounded-lg p-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">152-ФЗ:</span>
              <span
                className={`font-semibold ${
                  service.fz152 ? "text-green-600" : "text-red-500"
                }`}
              >
                {service.fz152 ? "Да" : "Нет"}
              </span>
            </div>
            {service.platform && (
              <div className="flex justify-between">
                <span className="text-gray-500">Платформа:</span>
                <span className="font-semibold text-gray-800">
                  {service.platform}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Регион:</span>
              <span className="font-semibold text-gray-800">
                {service.region}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Компонент карточки результата (с нижним блоком) ----------
function ResultCard({ result }: { result: ServiceResult }) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
      <div className="p-5 pb-0">
        <ServiceCard service={result} />
      </div>

      <hr className="my-4 border-gray-200 mx-5" />

      {/* Нижняя часть */}
      <div className="flex flex-col md:flex-row gap-4 p-5 pt-0">
        <div className="flex-[2]">
          <p className="text-gray-700 text-sm">{result.rationale}</p>
        </div>
        <div className="md:w-1/3 bg-gray-50 rounded-lg p-4 text-sm">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Цена</span>
                <span className="font-semibold">
                  {Math.round(result.priceScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#00abe9] h-1.5 rounded-full"
                  style={{ width: `${result.priceScore * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Релевантность</span>
                <span className="font-semibold">
                  {Math.round(result.relevanceScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#00abe9] h-1.5 rounded-full"
                  style={{ width: `${result.relevanceScore * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Главный компонент ----------
export default function App() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ServiceResult[] | null>(null);
  const [startupServices, setStartupServices] = useState<ServiceItem[]>([]);

  // При загрузке выбираем 3 случайных сервиса
  useEffect(() => {
    const shuffled = [...ALL_SERVICES].sort(() => 0.5 - Math.random());
    setStartupServices(shuffled.slice(0, 3));
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const assistantMsg = {
        role: "assistant" as const,
        text: "Вот что удалось подобрать по вашему запросу:",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setResults(MOCK_RESULTS);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setResults(null);
    const shuffled = [...ALL_SERVICES].sort(() => 0.5 - Math.random());
    setStartupServices(shuffled.slice(0, 3));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Верхняя панель */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00abe9] flex items-center justify-center text-white font-bold">
            CB
          </div>
          <span className="font-semibold text-gray-800">Cloudberries</span>
        </div>
        <button
          onClick={handleNewChat}
          className="px-4 py-2 text-sm font-medium text-[#00abe9] bg-white border border-[#00abe9] rounded-lg hover:bg-[#e6f7fc] transition-colors"
        >
          Новый чат
        </button>
      </header>

      {/* Основная область */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-57px)]">
        {/* Левая панель – чат */}
        <div className="w-full md:w-1/2 border-r border-gray-200 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                Введите запрос, чтобы подобрать облачный сервис
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#00abe9] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Опишите задачу, например: Нужно S3 хранилище..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abe9] focus:border-transparent"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-[#00abe9] text-white flex items-center justify-center hover:bg-[#009bd4] transition-colors"
                title="Отправить"
              >
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Правая панель – витрина / результаты */}
        <div className="w-full md:w-1/2 overflow-y-auto p-4 bg-gray-50">
          {!results ? (
            <div className="space-y-4">
              {startupServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-700">
                Результаты подбора (топ-3)
              </h2>
              {results.map((res) => (
                <ResultCard key={res.id} result={res} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
