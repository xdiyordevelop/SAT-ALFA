---
name: Sat-Alfa
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
  success: '#16a34a'
  warning: '#ca8a04'
  danger: '#dc2626'
  slate-50: '#f8fafc'
  slate-900: '#0f172a'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

# SAT-ALFA Loyihasi - Design Document (Texnik Arxitektura va Dizayn)

Ushbu hujjat loyiha qanday tuzilganligi, qanday texnologiyalar ishlatilganligi va fayllar qanday tartibda joylashganligini ko'rsatib beruvchi qo'llanmadir. Ushbu hujjat jamoaga yangi qo'shilgan dasturchilar loyihani tezroq tushunib olishi uchun xizmat quiladi.

## 1. Asosiy Texnologiyalar (Tech Stack)

Loyihada zamonaviy web-texnologiyalar to'plamidan foydalanilmoqda:

- **Framework:** [Next.js 16.3.0](https://nextjs.org/) (App Router bilan birga)
- **UI & Komponentlar:** React 19
- **Dizayn & Stil:** [Tailwind CSS 4](https://tailwindcss.com/)

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
- Boshqar sarlavhalar (`h1` dan `h6` gacha) qat'iy o'lchamlar va qalinlikka ega (Tailwind `@apply` yordamida qotirilgan).
- Scrollbar maxsus dizayn qilingan (ingichka, fon rangiga mos).
- `next-themes` yordamida **Dark Mode** (qorong'u rejim) uchun ranglar avtomatik tarzda almashadi (`--dark-background`, `--dark-foreground` h.k).
