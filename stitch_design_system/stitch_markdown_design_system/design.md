# SAT-ALFA Loyihasi - Design Document (Texnik Arxitektura va Dizayn)

Ushbu hujjat loyiha qanday tuzilganligi, qanday texnologiyalar ishlatilganligi va fayllar qanday tartibda joylashganligini ko'rsatib beruvchi qo'llanmadir. Ushbu hujjat jamoaga yangi qo'shilgan dasturchilar loyihani tezroq tushunib olishi uchun xizmat qiladi.

## 1. Asosiy Texnologiyalar (Tech Stack)

Loyihada zamonaviy web-texnologiyalar to'plamidan foydalanilmoqda:

- **Framework:** [Next.js 16.3.0](https://nextjs.org/) (App Router bilan birga)
- **UI & Komponentlar:** React 19
- **Dizayn & Stil:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Ma'lumotlar bazasi ORM:** [Prisma](https://www.prisma.io/)
- **Ma'lumotlar bazasi (DB):** PostgreSQL (`@prisma/adapter-pg` orqali ulanadi)
- **Autentifikatsiya & Xavfsizlik:** JSON Web Token (`jose` kutubxonasi yordamida) va kodlarni shifrlash (bcrypt)
- **Sun'iy intellekt (AI) integratsiyasi:** `@google/generative-ai` va `@anthropic-ai/sdk` (Testlarni avtomatik baholash, PDF/Matnlardan savol ajratish uchun)
- **Validatsiya:** Zod
- **Boshqa vositalar:** `katex` (matematik formulalar uchun), `recharts` (diagrammalar va grafiklar), `html2canvas`, `jspdf` (PDF yuklab olish).

## 2. Loyihaning Papkalar Strukturasi

Kodni tashkil qilishda qat'iy standartlar asosida ishlanadi:

```text
/src
 ├── /app              # Next.js App Router marshrutlari (Routes)
 │   ├── /admin        # Admin paneli (O'qituvchilar/Adminlar uchun)
 │   ├── /api          # Backend API endpointlari
 │   ├── /login        # Tizimga kirish sahifasi
 │   ├── /student      # Talabalar uchun shaxsiy kabinet va test ishlash qismi
 │   └── /unauthorized # Ruxsatsiz kirishlarda ko'rsatiladigan sahifa
 ├── /components       # Qayta ishlatiladigan UI komponentlar (Button, Modal, h.k.)
 ├── /lib              # Yordamchi funksiyalar (Utils, Prisma client, Auth sessiyalar)
/prisma
 ├── schema.prisma     # Ma'lumotlar bazasi tuzilishi (Jadvallar)
 ├── seed.ts           # Dastlabki ma'lumotlarni bazaga yozuvchi skript
```

## 3. Ma'lumotlar Bazasi (Database Architecture)

Loyiha (SAT markazi yoki o'quv markazi) ehtiyojlarini qondirish uchun keng qamrovli ma'lumotlar bazasiga ega. Asosiy jadvallar quyidagilar:

### 3.1. Foydalanuvchilar va O'quv markazi qismi
- **User:** Tizimga kirish ma'lumotlari (username, password, role: ADMIN/STUDENT).
- **StudentProfile:** Talabaning shaxsiy ma'lumotlari (ism, telefon, to'lovlar holati).
- **Group:** O'quv guruhlari, kurs narxi va jadvallari.
- **Attendance & Payment:** Davomat va To'lovlar hisobi.
- **ParentGuardian & SmsNotification:** Ota-onalar bilan aloqa va SMS jo'natish tarixi.

### 3.2. Digital SAT & Test tizimi
Asosiy "Core" funksional - haqiqiy Digital SAT'ni simulyatsiya qiladi:
- **SATMockTest:** Testning o'zi (modullar va bo'limlardan iborat).
- **SATQuestion:** Test savollari (matnlar, rasmlar, to'g'ri javoblar va KaTeX formatidagi formulalar).
- **StudentTestAttempt:** Talabaning testni ishlash jarayoni (vaqt, belgilagan javoblari, AI orqali baholanishi).
- **ProctoredSession:** Testni nazorat qilish sessiyasi (O'qituvchi jonli tarzda talabalarni kuzatishi uchun).

### 3.3. AI (Sun'iy intellekt) jarayonlari
- **AIJob:** Fondagi (background) ishlarni kuzatish. Masalan: Admin PDF shakldagi mock-testni yuklaganda, AI uni avtomatik o'qib `SATQuestion` formatiga o'girishi yoki Talabaning yozgan Insho/Javoblarini baholashi uchun ishlatiladi.

## 4. Asosiy Funksional oqimlar (Workflows)

1. **Test yechish oqimi:**
   Talaba `/student/mock-tests` orqali testni boshlaydi -> Vaqt ketishni boshlaydi (`StudentTestAttempt` yaratiladi) -> Test tugagach "Submit" qilinadi -> AI baholash orqali yoki avtomatik tarzda ball hisoblanadi (ScoringStatus: SCORED).

2. **Nazorat qilinadigan test (Proctoring):**
   Admin yangi proctored sessiya yaratadi va kod beradi -> Talabalar shu kod orqali ulanadi -> Admin `ProctoredParticipant` jadvali orqali kim qaysi savolda ekanini, ekrandan chiqib ketgan-ketmaganini jonli ko'rib turadi.

3. **Autentifikatsiya:**
   - JWT (JSON Web Token) ishlatiladi, u server-side cookie'larga saqlanadi.
   - Har bir `page.tsx` va `route.ts` faylida sessiya o'qilib ruxsatlar (Role) tekshiriladi (`/admin` ga talaba kirolmaydi).

## 5. UI va Dizayn Tamoyillari

- **Tailwind CSS:** Barcha stillar Tailwind yordamida yoziladi.
- **Responsive Design:** Tizim ham kompyuter (ayniqsa test yechish qismi), ham mobil qurilmalar uchun moslashgan.
- **Dark/Light Mode:** `next-themes` yordamida ilova dizaynida qorong'u va yorug' rejimlarni qo'llab-quvvatlaydi.

## 6. Kelajakdagi o'zgarishlar (Best Practices)
Barcha yangi qo'shiladigan imkoniyatlar quyidagi tartibda bajarilishi lozim:
1. Yangi ma'lumot turi kerak bo'lsa `schema.prisma` ga qo'shiladi va `npm run db:push` yordamida bazaga kiritiladi.
2. Form ma'lumotlarini qabul qilishda albatta **Zod** ishlatilib, xavfsizlik (validation) tekshirilishi shart.
3. Yangi API endpointlar har doim `Session` bor-yo'qligini tekshirishi kerak.

## 7. Foydalanuvchi Interfeysi (UI/UX) va Dizayn Tizimi

Loyiha dizayni **`src/app/globals.css`** faylida kiritilgan CSS o'zgaruvchilar (variables) va Tailwind qoidalari asosida qurilgan. Ushbu qoidalar yagona (konsistent) UI saqlab qolishga yordam beradi.

### 7.1. Ranglar palitrasi (Color Palette)
- **Primary (Asosiy rang):** Indigo/Deep Blue (masalan, `--color-primary-600: #4f46e5`) ilovadagi asosiy tugmalar va urg'u beriladigan joylar uchun.
- **Secondary (Ikkilamchi rang):** Violet/Cyan (masalan, `--color-secondary-600: #7c3aed`) maxsus effektlar va qo'shimcha tugmalar uchun.
- **Holat ranglari (State Colors):** 
  - **Success:** Yashil (`#16a34a`) - Muvaffaqiyatli harakatlar
  - **Warning:** Sariq/Amber (`#ca8a04`) - Ogohlantirishlar
  - **Danger:** Qizil (`#dc2626`) - Xatolar va o'chirish harakatlari
- **Neutral:** Slate/Gray (matnlar, hoshiyalar va fonlar uchun turli xil oqdan-qoragacha soyalar).

### 7.2. Maxsus CSS Klasslar va Effektlar (Utility Classes)
Dasturchilar qayta-qayta stil yozmasligi uchun tayyor komponent/klasslar yaratilgan:
- `.glass` va `.glass-dark`: Xiralashtirilgan (blur) va shaffof oyna effekti beruvchi fonlar.
- `.text-gradient`: Matnga Indigo va Violet ranglaridan iborat chiroyli gradient beradi.
- `.card-shadow`: Karta komponentlari uchun chiroyli soya (hover qilinganda kattalashadigan).
- `.button-base` va `.input-base`: Tugmalar va kiritish maydonlarining (input) standart o'lchami va ko'rinishi.

### 7.3. Animatsiyalar
Foydalanuvchi tajribasini boyitish uchun bir nechta silliq animatsiyalar oldindan yaratib qo'yilgan:
- `@keyframes fadeIn`, `slideUp`, `slideIn`, `pulse`, `shimmer`.
- Ular mos ravishda `.animate-fade-in`, `.animate-slide-up` va h.k. orqali chaqiriladi.

### 7.4. Tipografiya va Boshqalar
- Barcha sarlavhalar (`h1` dan `h6` gacha) qat'iy o'lchamlar va qalinlikka ega (Tailwind `@apply` yordamida qotirilgan).
- Scrollbar maxsus dizayn qilingan (ingichka, fon rangiga mos).
- `next-themes` yordamida **Dark Mode** (qorong'u rejim) uchun ranglar avtomatik tarzda almashadi (`--dark-background`, `--dark-foreground` h.k).
