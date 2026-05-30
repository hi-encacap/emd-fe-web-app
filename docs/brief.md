# Mood Deck — Product & Implementation Brief

## One-liner

**Mood Deck** là một web app tối giản để người dùng “bốc” một ý tưởng nhỏ cho đời sống cá nhân, làm khi thích, rồi ghi nhận lại mỗi lần hoàn thành.

Không phải todo app. Không phải habit tracker. Không phải productivity dashboard.

Nó là một **deck of tiny life quests**.

---

## Product Goal

Người dùng mở app khi họ muốn làm một điều gì đó vui, mới, nhẹ, hoặc có ích cho bản thân nhưng chưa biết làm gì.

App cần giúp họ:

1. Thấy ngay một gợi ý đủ thú vị để muốn làm.
2. Shuffle nhanh nếu không hợp mood.
3. Bấm Done sau khi làm xong.
4. Có thể làm lại task đã từng làm, và mỗi lần làm lại đều được ghi nhận.
5. Nhìn lại lịch sử một cách nhẹ nhàng, không tạo áp lực.

---

## Core Philosophy

### What this app is

Mood Deck là một **idea picker**.

Nó trả lời câu hỏi:

> “Giờ mình có thể làm gì hay hay?”

### What this app is not

Mood Deck **không** phải công cụ ép người dùng hoàn thành kế hoạch.

Không cần:

- daily schedule
- streak
- deadline
- timer
- effort estimate
- difficulty level
- productivity analytics
- gamification phức tạp
- calendar
- notification

---

## Design Principle

Chỉ hiển thị thông tin nếu nó giúp người dùng:

1. chọn task,
2. muốn làm task,
3. ghi nhận rằng mình đã làm,
4. thấy vui vì đã làm.

Nếu một thông tin không phục vụ 4 mục đích trên, không hiển thị.

---

## MVP Scope

MVP chỉ cần 3 màn hình:

1. **Pick**
2. **Library**
3. **History**

MVP chỉ cần 5 action chính:

1. **Shuffle**
2. **Done / Did again**
3. **Favorite**
4. **Browse / Pick from Library**
5. **Reset / Export local data**

Action quan trọng nhất:

```text
Shuffle → Done
```

Mọi thứ khác là phụ.

---

## Main User Flow

```text
Open app
↓
See one quest card immediately
↓
If not interested: Shuffle
↓
If interested: do it outside the app
↓
Come back and click Done
↓
A completion event is recorded
↓
The same quest can appear again later
```

Không hỏi người dùng làm bao lâu.
Không yêu cầu bắt đầu timer.
Không ép note.
Không ép mood check-in.

---

## Quest Card UI

Card chính chỉ nên có:

```text
Title
Prompt
Tags
Done count, only if > 0
Actions
```

Ví dụ:

```text
Đi bộ không mục tiêu

Ra ngoài đi một vòng, không cần đích đến. Nhìn đường phố như thể mày là khách du lịch.

#body #reset #outside

Đã làm 3 lần. Vẫn đáng làm lại.

[Done / Did again] [Shuffle]
```

### Do not show on card

Không hiển thị:

- time estimate
- energy level
- difficulty
- minimum pass
- full version
- bonus version
- why this works
- repeatable flag
- location metadata
- social/solo metadata

Những thông tin này có thể dùng ngầm trong tương lai, nhưng không nên phơi ra UI chính.

---

## Tone & Copy

Tone nên nhẹ, thân mật, không corporate, không productivity-bro.

Một số copy direction:

```text
Pick a tiny side quest.
No pressure. Just a small move.
```

```text
Done before. Worth doing again.
```

```text
Not today? Shuffle another.
```

```text
Mở lên, bốc một ý tưởng, rồi đi sống một chút.
```

Tránh copy kiểu:

```text
You failed your streak.
Complete today’s required task.
Your productivity score is low.
```

---

## Visual Direction

Mood tổng thể:

- cozy
- soft
- night-friendly
- card-based
- một chút playful
- tối giản
- không corporate
- không giống task manager truyền thống

UI direction:

- dark warm background
- soft gradient glow
- large rounded cards
- calm typography
- smooth shuffle animation
- subtle done feedback
- tag chips nhỏ
- ít text
- nhiều whitespace

App nên tạo cảm giác như đang bốc một lá bài nhỏ, không phải đang mở dashboard công việc.

---

## Data Model

Important: quest completion phải là **event**, không phải boolean.

Một quest có thể được làm nhiều lần.

```ts
type Quest = {
  id: string;
  title: string;
  prompt: string;
  tags: string[];
  isFavorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};
```

```ts
type QuestCompletion = {
  id: string;
  questId: string;
  completedAt: string;
  note?: string;
};
```

Optional later:

```ts
type QuestCompletion = {
  id: string;
  questId: string;
  completedAt: string;
  note?: string;
  mood?: "better" | "same" | "worse";
};
```

MVP chưa cần bắt người dùng nhập note hoặc mood.

---

## Picker Logic

MVP picker đơn giản nhưng có chủ ý.

Rule đề xuất:

1. Chỉ pick quest không archived.
2. Ưu tiên quest chưa từng làm.
3. Quest đã làm vẫn có thể xuất hiện lại.
4. Favorite tăng khả năng xuất hiện.
5. Tránh trả lại đúng card hiện tại nếu có lựa chọn khác.

Pseudo logic:

```ts
function pickRandomQuest(quests, currentQuestId, completions) {
  const activeQuests = quests.filter((q) => !q.archived);

  const completionCountByQuest = countBy(completions, "questId");

  const weightedPool = activeQuests.flatMap((quest) => {
    const doneCount = completionCountByQuest[quest.id] ?? 0;
    const isCurrent = quest.id === currentQuestId;

    let weight = 2;

    if (doneCount === 0) weight = 5;
    if (quest.isFavorite) weight += 2;
    if (isCurrent) weight = 1;

    return repeat(quest, weight);
  });

  return randomItem(weightedPool);
}
```

Không cần AI recommendation trong MVP.

---

## Screens

## 1. Pick Screen

Mục đích: mở app lên là dùng được ngay.

Content:

- app name
- một câu tagline ngắn
- current quest card
- Shuffle button
- Done / Did again button
- Favorite button
- navigation sang Library / History

Không cần onboarding dài.
Không cần settings panel lớn.

---

## 2. Library Screen

Mục đích: xem toàn bộ deck và chọn thủ công.

Nên có:

- search nhẹ
- filter cơ bản:
  - All
  - Favorites
  - Not yet
  - Done before

- tag chips:
  - body
  - mind
  - social
  - creative
  - outside
  - reset
  - fun

Mỗi item trong library chỉ cần:

- title
- prompt ngắn
- tags
- done count nếu có
- favorite
- done button

Không dùng table.
Không dùng layout quản trị.

---

## 3. History Screen

Mục đích: ghi nhận lại những lần người dùng đã làm.

Không cần dashboard phức tạp.

Hiển thị dạng journal/timeline:

```text
Today
- Đi bộ không mục tiêu
- Nhắn một người lâu rồi chưa nói chuyện

May 29
- Vẽ xấu có chủ đích
```

Nếu sau này có note thì hiển thị note dưới item.

Không có streak.
Không có productivity score.
Không có chart trong MVP.

---

## Local-first Requirement

MVP nên local-first.

Không cần login.
Không cần backend.
Không cần cloud sync.

Use:

- React / Next.js
- Tailwind CSS
- localStorage hoặc IndexedDB
- static deploy trên Vercel / Netlify / Cloudflare Pages

Lý do:

- app cá nhân, dữ liệu nhạy cảm nhẹ
- không cần vận hành server
- privacy tốt hơn
- triển khai nhanh
- ít security surface

---

## Privacy & Security

Dữ liệu có thể chứa thói quen, mood, note cá nhân.

MVP cần:

- lưu local mặc định
- không gửi analytics cá nhân
- không cần account
- có nút reset data
- có export/import JSON nếu làm kịp

Nếu sau này thêm cloud sync:

- thêm auth rõ ràng
- tách dữ liệu theo user
- validate server-side
- rate limit API
- encrypt at rest
- cân nhắc client-side encryption cho note cá nhân

---

## Maintainability Guidelines

Code nên tách rõ:

```text
/components
  QuestCard.tsx
  MiniQuestRow.tsx
  AppShell.tsx
  EmptyState.tsx

/features/quests
  questTypes.ts
  questSeed.ts
  questPicker.ts
  questStorage.ts
  questSelectors.ts

/app
  page.tsx
```

Không hardcode quá nhiều logic trong component UI.

Các rule như picker, completion count, filter library nên tách thành pure functions để dễ test.

---

## Suggested Seed Quest Shape

```ts
const quests: Quest[] = [
  {
    id: "walk-nowhere",
    title: "Đi bộ không mục tiêu",
    prompt:
      "Ra ngoài đi một vòng, không cần đích đến. Nhìn đường phố như thể mày là khách du lịch.",
    tags: ["body", "reset", "outside"],
    isFavorite: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
];
```

Seed list nên có khoảng 60–100 quest.

MVP có thể hardcode seed list trước, sau đó cho phép import/export hoặc edit sau.

---

## Non-goals for MVP

Không làm trong MVP:

- user account
- cloud sync
- AI recommendation
- calendar
- notification
- streak
- achievement system
- timer
- task scheduling
- complex dashboard
- team/social sharing
- public profile
- mobile app riêng

---

## Acceptance Criteria

MVP đạt nếu:

1. Mở app lên thấy ngay một quest card.
2. Bấm Shuffle đổi sang quest khác.
3. Bấm Done tạo một completion event.
4. Quest đã done hiện “Did again” hoặc done count khi gặp lại.
5. Một quest có thể được done nhiều lần.
6. Library xem được toàn bộ quest.
7. Library filter được Favorites / Not yet / Done before.
8. History xem được danh sách completion gần đây.
9. Reload browser không mất data.
10. UI giữ được cảm giác cozy, tối giản, không giống task manager.

---

## Final Product Summary

Mood Deck là một web app tối giản để bốc các “side quests” nhỏ trong đời sống.

Người dùng không cần lập kế hoạch, không cần theo lịch, không cần quan tâm mất bao lâu. Mỗi lần mở app, họ chỉ cần thấy một gợi ý đủ thú vị để muốn làm ngay. Khi làm xong, họ bấm Done. Nếu từng làm rồi, app vẫn cho làm lại và ghi nhận thêm một lần.

Mục tiêu không phải hoàn thành checklist, mà là giảm ma sát để bắt đầu những trải nghiệm nhỏ và giúp người dùng sống vui hơn một chút.
