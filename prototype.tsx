import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shuffle, Check, RotateCcw, History, Library, Sparkles, Search, X } from "lucide-react";

const STORAGE_KEY = "mood-deck-prototype-v1";

const INITIAL_QUESTS = [
  {
    id: "walk-nowhere",
    title: "Đi bộ không mục tiêu",
    prompt: "Ra ngoài đi một vòng, không cần đích đến. Nhìn đường phố như thể mày là khách du lịch.",
    tags: ["body", "reset", "outside"],
  },
  {
    id: "text-old-friend",
    title: "Nhắn một người lâu rồi chưa nói chuyện",
    prompt: "Không cần deep. Chỉ cần mở lại một cánh cửa nhỏ.",
    tags: ["social", "warm"],
  },
  {
    id: "bad-drawing",
    title: "Vẽ xấu có chủ đích",
    prompt: "Vẽ một thứ bất kỳ và cho phép nó xấu. Mục tiêu là chơi, không phải đẹp.",
    tags: ["creative", "fun"],
  },
  {
    id: "three-good-things",
    title: "Ghi 3 chuyện tốt",
    prompt: "Ghi lại ba điều nhỏ tốt đẹp hôm nay. Nhỏ cỡ ly nước ngon cũng được.",
    tags: ["mind", "gratitude"],
  },
  {
    id: "local-adventure",
    title: "Đi một nơi chưa từng đi",
    prompt: "Chọn một góc thành phố mày ít ghé. Đi như một mini adventure.",
    tags: ["outside", "adventure"],
  },
  {
    id: "tiny-kindness",
    title: "Tử tế bí mật",
    prompt: "Làm một việc tốt nhỏ mà không cần kể với ai.",
    tags: ["social", "kindness"],
  },
  {
    id: "one-page-brain-dump",
    title: "Xả não một trang",
    prompt: "Viết mọi thứ đang chạy trong đầu. Không edit, không cần hay, không cần đúng.",
    tags: ["mind", "reset"],
  },
  {
    id: "photo-theme",
    title: "Chụp 10 tấm theo một chủ đề",
    prompt: "Chọn một chủ đề: màu đỏ, bóng đổ, cửa sổ, đồ cũ. Rồi đi săn ảnh.",
    tags: ["creative", "outside"],
  },
  {
    id: "clean-one-corner",
    title: "Dọn một góc nhỏ",
    prompt: "Chỉ một góc thôi: bàn, desktop, Downloads, tủ đầu giường. Đừng biến nó thành đại tu đời.",
    tags: ["reset", "home"],
  },
  {
    id: "solo-cafe",
    title: "Ngồi một mình ở quán",
    prompt: "Không làm việc. Không cố productive. Chỉ ngồi, nhìn, nghe, và để đầu óc trôi.",
    tags: ["solo", "mind"],
  },
  {
    id: "new-song-walk",
    title: "Đi bộ với một album lạ",
    prompt: "Bật một album chưa nghe bao giờ và đi một vòng. Để nhạc dẫn mood.",
    tags: ["body", "music"],
  },
  {
    id: "ask-better-question",
    title: "Hỏi một câu tốt hơn bình thường",
    prompt: "Thay vì hỏi 'ổn không?', hỏi một câu thật hơn một chút.",
    tags: ["social", "warm"],
  },
  {
    id: "make-a-playlist",
    title: "Tạo playlist cho một mood kỳ quặc",
    prompt: "Ví dụ: 'muốn reset đời nhưng chưa muốn cố quá'. Đặt tên cho vui.",
    tags: ["creative", "music"],
  },
  {
    id: "sunset-mission",
    title: "Đi săn hoàng hôn",
    prompt: "Canh lúc trời đổi màu. Đứng yên một chút và nhìn cho đàng hoàng.",
    tags: ["outside", "calm"],
  },
  {
    id: "write-future-self",
    title: "Viết thư cho mình sau này",
    prompt: "Nói thật với bản thân tương lai. Không cần motivational. Chỉ cần thật.",
    tags: ["mind", "reflection"],
  },
  {
    id: "try-new-food",
    title: "Ăn một món chưa từng thử",
    prompt: "Chọn món làm mày hơi tò mò. Không cần ngon chắc, chỉ cần mới.",
    tags: ["adventure", "food"],
  },
  {
    id: "museum-of-me",
    title: "Museum of me",
    prompt: "Chọn 5 món đồ đại diện cho mày hiện tại. Xếp lại, chụp một tấm.",
    tags: ["creative", "reflection"],
  },
  {
    id: "no-complaint-mini",
    title: "Bắt quả tang một lần than",
    prompt: "Khi chuẩn bị than, đổi nó thành: vấn đề là gì, bước tiếp theo là gì?",
    tags: ["mind", "reset"],
  },
];

const TABS = [
  { id: "pick", label: "Pick", icon: Sparkles },
  { id: "library", label: "Library", icon: Library },
  { id: "history", label: "History", icon: History },
];

const LIBRARY_FILTERS = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "notYet", label: "Not yet" },
  { id: "done", label: "Done before" },
];

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function pickRandomQuest(quests, currentId, completions) {
  const activeQuests = quests.filter((quest) => !quest.archived);
  if (activeQuests.length === 0) return null;

  // Prototype picker: ưu tiên quest chưa làm, nhưng vẫn cho phép lặp lại.
  const completionCount = new Map();
  completions.forEach((item) => {
    completionCount.set(item.questId, (completionCount.get(item.questId) || 0) + 1);
  });

  const weightedPool = activeQuests.flatMap((quest) => {
    const doneCount = completionCount.get(quest.id) || 0;
    const isCurrent = quest.id === currentId;
    const weight = isCurrent ? 1 : doneCount === 0 ? 5 : quest.isFavorite ? 4 : 2;
    return Array.from({ length: weight }, () => quest);
  });

  return weightedPool[Math.floor(Math.random() * weightedPool.length)] || activeQuests[0];
}

export default function MoodDeckPrototype() {
  const persisted = typeof window !== "undefined" ? loadState() : null;

  const [quests, setQuests] = useState(() => {
    const saved = persisted?.quests;
    if (!saved) return INITIAL_QUESTS.map((quest) => ({ ...quest, isFavorite: false, archived: false }));
    return saved;
  });
  const [completions, setCompletions] = useState(() => persisted?.completions || []);
  const [currentQuestId, setCurrentQuestId] = useState(() => persisted?.currentQuestId || "walk-nowhere");
  const [activeTab, setActiveTab] = useState("pick");
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [showDonePulse, setShowDonePulse] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ quests, completions, currentQuestId })
    );
  }, [quests, completions, currentQuestId]);

  const completionCountByQuest = useMemo(() => {
    const result = new Map();
    completions.forEach((item) => {
      result.set(item.questId, (result.get(item.questId) || 0) + 1);
    });
    return result;
  }, [completions]);

  const allTags = useMemo(() => {
    return Array.from(new Set(quests.flatMap((quest) => quest.tags))).sort();
  }, [quests]);

  const currentQuest = useMemo(() => {
    return quests.find((quest) => quest.id === currentQuestId) || quests[0];
  }, [quests, currentQuestId]);

  const filteredQuests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return quests.filter((quest) => {
      const doneCount = completionCountByQuest.get(quest.id) || 0;
      const matchesFilter =
        libraryFilter === "all" ||
        (libraryFilter === "favorites" && quest.isFavorite) ||
        (libraryFilter === "notYet" && doneCount === 0) ||
        (libraryFilter === "done" && doneCount > 0);

      const matchesTag = !tagFilter || quest.tags.includes(tagFilter);
      const matchesQuery =
        !normalizedQuery ||
        quest.title.toLowerCase().includes(normalizedQuery) ||
        quest.prompt.toLowerCase().includes(normalizedQuery) ||
        quest.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesTag && matchesQuery;
    });
  }, [quests, completionCountByQuest, libraryFilter, tagFilter, query]);

  const currentDoneCount = currentQuest ? completionCountByQuest.get(currentQuest.id) || 0 : 0;

  function shuffleQuest() {
    const next = pickRandomQuest(quests, currentQuestId, completions);
    if (next) setCurrentQuestId(next.id);
  }

  function completeQuest(questId) {
    const completion = {
      id: crypto.randomUUID(),
      questId,
      completedAt: new Date().toISOString(),
    };

    setCompletions((items) => [completion, ...items]);
    setShowDonePulse(true);
    window.setTimeout(() => setShowDonePulse(false), 900);
  }

  function toggleFavorite(questId) {
    setQuests((items) =>
      items.map((quest) =>
        quest.id === questId ? { ...quest, isFavorite: !quest.isFavorite } : quest
      )
    );
  }

  function resetPrototype() {
    setQuests(INITIAL_QUESTS.map((quest) => ({ ...quest, isFavorite: false, archived: false })));
    setCompletions([]);
    setCurrentQuestId("walk-nowhere");
    setActiveTab("pick");
    setTagFilter(null);
    setQuery("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#11100f] text-stone-100">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute left-[-12rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute left-[35%] top-[28%] h-[20rem] w-[20rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-2">
          <button
            onClick={() => setActiveTab("pick")}
            className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl transition hover:bg-white/10"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-rose-300 text-stone-950 shadow-lg shadow-amber-900/30">
              <Sparkles size={18} />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-semibold tracking-wide text-white sm:text-base">Mood Deck</h1>
              <p className="hidden text-xs text-stone-400 sm:block">Tiny quests. No pressure.</p>
            </div>
          </button>

          <nav className="flex rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition sm:px-4 ${
                    selected ? "bg-white text-stone-950" : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === "pick" && currentQuest && (
                <motion.div
                  key="pick"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="max-w-2xl space-y-3">
                    <p className="text-sm uppercase tracking-[0.28em] text-amber-200/80">Pick a tiny side quest</p>
                    <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                      Mở lên, bốc một ý tưởng, rồi đi sống một chút.
                    </h2>
                    <p className="max-w-xl text-base leading-7 text-stone-400">
                      Không deadline. Không streak. Không hỏi mất bao lâu. Chỉ cần một gợi ý đủ hay để mày muốn làm.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={shuffleQuest}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 shadow-xl shadow-black/20 transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Shuffle size={17} />
                      Shuffle
                    </button>
                    <button
                      onClick={() => setActiveTab("library")}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/10"
                    >
                      <Library size={17} />
                      Browse deck
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "library" && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-amber-200/80">Library</p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Toàn bộ deck</h2>
                  </div>

                  <div className="flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                    <Search size={18} className="text-stone-500" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Tìm theo tên, prompt hoặc tag..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500"
                    />
                    {query && (
                      <button onClick={() => setQuery("")} className="text-stone-500 hover:text-white">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {LIBRARY_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setLibraryFilter(filter.id)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          libraryFilter === filter.id
                            ? "bg-white text-stone-950"
                            : "border border-white/10 bg-white/5 text-stone-400 hover:text-white"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex max-w-2xl flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                        className={`rounded-full px-3 py-1.5 text-xs transition ${
                          tagFilter === tag
                            ? "bg-amber-200 text-stone-950"
                            : "border border-white/10 bg-black/20 text-stone-400 hover:text-white"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-amber-200/80">History</p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Những lần đã sống thử</h2>
                  </div>
                  <p className="max-w-xl text-base leading-7 text-stone-400">
                    History chỉ ghi lại việc mày đã làm. Không chấm điểm, không phán xét, không ép streak.
                  </p>
                  <button
                    onClick={resetPrototype}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw size={15} />
                    Reset prototype data
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <aside className="relative">
            <AnimatePresence mode="wait">
              {activeTab === "pick" && currentQuest && (
                <QuestCard
                  key={currentQuest.id}
                  quest={currentQuest}
                  doneCount={currentDoneCount}
                  onDone={() => completeQuest(currentQuest.id)}
                  onShuffle={shuffleQuest}
                  onFavorite={() => toggleFavorite(currentQuest.id)}
                  donePulse={showDonePulse}
                />
              )}

              {activeTab === "library" && (
                <motion.div
                  key="library-list"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[68vh] space-y-3 overflow-auto pr-1"
                >
                  {filteredQuests.length === 0 ? (
                    <EmptyState title="Không có quest nào khớp" description="Thử bỏ filter hoặc đổi từ khóa tìm kiếm." />
                  ) : (
                    filteredQuests.map((quest) => (
                      <MiniQuestRow
                        key={quest.id}
                        quest={quest}
                        doneCount={completionCountByQuest.get(quest.id) || 0}
                        onPick={() => {
                          setCurrentQuestId(quest.id);
                          setActiveTab("pick");
                        }}
                        onDone={() => completeQuest(quest.id)}
                        onFavorite={() => toggleFavorite(quest.id)}
                      />
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history-list"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[68vh] space-y-3 overflow-auto pr-1"
                >
                  {completions.length === 0 ? (
                    <EmptyState title="Chưa có history" description="Pick một quest, làm ngoài đời, rồi quay lại bấm Done." />
                  ) : (
                    completions.map((completion) => {
                      const quest = quests.find((item) => item.id === completion.questId);
                      if (!quest) return null;
                      return (
                        <div
                          key={completion.id}
                          className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3 text-xs text-stone-500">
                            <span>{formatDate(completion.completedAt)}</span>
                            <span>done</span>
                          </div>
                          <h3 className="text-base font-semibold text-white">{quest.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{quest.prompt}</p>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </section>
    </main>
  );
}

function QuestCard({ quest, doneCount, onDone, onShuffle, onFavorite, donePulse }) {
  return (
    <motion.article
      initial={{ opacity: 0, rotate: -1.5, y: 24 }}
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      exit={{ opacity: 0, rotate: 1.5, y: -18 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="relative mx-auto max-w-xl"
    >
      <div className="absolute inset-0 translate-y-4 rounded-[2rem] bg-black/30 blur-xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-stone-100 p-5 text-stone-950 shadow-2xl shadow-black/30 sm:p-7">
        <div className="absolute right-[-5rem] top-[-5rem] h-44 w-44 rounded-full bg-amber-300/60 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[-5rem] h-48 w-48 rounded-full bg-violet-300/50 blur-3xl" />

        <div className="relative flex min-h-[30rem] flex-col justify-between gap-8">
          <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-full bg-stone-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-stone-100">
                Side Quest
              </div>
              <button
                onClick={onFavorite}
                className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                  quest.isFavorite
                    ? "border-rose-300 bg-rose-100 text-rose-600"
                    : "border-stone-300/70 bg-white/40 text-stone-500 hover:text-stone-950"
                }`}
                aria-label="Favorite"
              >
                <Heart size={18} fill={quest.isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div>
              <h2 className="text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl">{quest.title}</h2>
              <p className="mt-6 text-lg leading-8 text-stone-700 sm:text-xl">{quest.prompt}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {quest.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-stone-950/5 px-3 py-1.5 text-xs font-medium text-stone-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="relative space-y-4">
            {doneCount > 0 && (
              <p className="text-sm text-stone-500">
                Đã làm <span className="font-semibold text-stone-950">{doneCount}</span> lần. Vẫn đáng làm lại.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto]">
              <button
                onClick={onDone}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-stone-950/20 transition hover:scale-[1.01] active:scale-[0.98]"
              >
                <Check size={18} />
                {doneCount > 0 ? "Did again" : "Done"}
              </button>
              <button
                onClick={onShuffle}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white/45 px-5 py-4 text-sm font-semibold text-stone-700 transition hover:bg-white/70 hover:text-stone-950"
              >
                <Shuffle size={18} />
                Shuffle
              </button>
            </div>

            <AnimatePresence>
              {donePulse && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute -top-12 left-0 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-lg"
                >
                  Ghi nhận rồi ✨
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MiniQuestRow({ quest, doneCount, onPick, onDone, onFavorite }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl transition hover:bg-white/[0.09]">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onPick} className="min-w-0 text-left">
          <h3 className="text-base font-semibold text-white transition group-hover:text-amber-100">{quest.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{quest.prompt}</p>
        </button>
        <button
          onClick={onFavorite}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
            quest.isFavorite ? "bg-rose-400/20 text-rose-200" : "bg-white/5 text-stone-500 hover:text-white"
          }`}
        >
          <Heart size={16} fill={quest.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {quest.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-stone-400">
              #{tag}
            </span>
          ))}
        </div>
        <button
          onClick={onDone}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-950 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Check size={13} />
          {doneCount > 0 ? `${doneCount}x` : "Done"}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center backdrop-blur-xl">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-stone-300">
        <Sparkles size={20} />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
    </div>
  );
}
