# 📅 Smart Calendar & AI Assistant

Un calendar personal inteligent, alimentat de inteligență artificială (Google Gemini), care te ajută să îți organizezi timpul prin conversație naturală. Acum cu o interfață "Soft UI" superbă, suport multi-limbă și notificări push în fundal!

### 🚀 **Vezi Aplicația Live Aici: [https://smart-calendar-sigma.vercel.app/](https://smart-calendar-sigma.vercel.app/)**

<img width="1917" height="813" alt="image" src="https://github.com/user-attachments/assets/8cbcd793-bdfd-4a82-af0a-5703d451226e" />

---

## ✨ Ce face acest proiect special?

Aceasta nu este doar o agendă obișnuită. Este un asistent personal complet **personalizabil**, cross-device, care combină productivitatea cu un design elegant și cald.

### 🎨 Design "Soft UI" & Personalizare Avansată
* **Estetică Feminină & Caldă:** Interfață modernă cu umbre moi (soft shadows), gradienți pastelati și iconițe fine tip outline.
* **Micro-interacțiuni:** Checkbox-uri adorabile în formă de inimă pentru task-uri și stări "Empty State" prietenoase.
* **Poză de Profil Personalizată:** Încarcă propria fotografie direct din galeria telefonului pentru o experiență 100% a ta.
* **Control Total al Aspectului:** Alege fontul preferat al aplicației și tema de culori direct din Setări.
  <img width="1913" height="827" alt="image" src="https://github.com/user-attachments/assets/72816556-282c-4606-af66-0ef88de11086" />


### 📱 Experiență PWA & Mobile-First
* **Aplicație Instalabilă:** Adaugă-o pe ecranul principal al telefonului. Include un sistem inteligent de alertare pentru "Versiune Nouă" (Update Notifier) când se lansează o actualizare.
* **Gesturi Touch:** Fă *swipe* stânga-dreapta pentru a naviga natural între lunile anului.
* **Mascotă AI Mobilă:** Asistentul tău vizual poate fi mutat oriunde pe ecran prin atingere (touch drag) și redimensionat rapid.

### ☁️ Cloud, i18n & Notificări Server-Side
* **Notificări Push Reale:** Primesti alerte programate (ex: cu 2 zile și 3 ore înainte) direct pe telefon, chiar și când aplicația este închisă, datorită sistemului Vercel Cron & Serverless.
* **Internaționalizare (i18n):** Schimbă limba întregii aplicații (Română / Engleză) cu un singur click.
* **Sincronizare în Timp Real:** Adaugă un eveniment de pe laptop și va apărea instantaneu pe telefon via Firebase.

<img width="446" height="766" alt="image" src="https://github.com/user-attachments/assets/1e11ade9-a9f7-4f98-9fa7-7212a5f285b0" />

---

## 📊 Structura Aplicației

Aplicația este optimizată pentru productivitate rapidă, împărțită logic în secțiuni principale:

* **Dashboard (Home):** Centrul tău de comandă reimaginat. Navighează prin tab-urile **Ziua**, **Săptămâna** și **Luna** pentru a-ți vedea programul perfect grupat. Ascunde automat evenimentele deja terminate de astăzi.
* **Calendar:** Grila lunară cu vizualizare fixă, maximizată pentru o citire clară a planurilor pe termen lung.
* **Tasks:** Manager dedicat pentru To-Do. Bifează inimioarele, fixează (Pin 📌) sarcinile importante și folosește codurile de culori.
* **Settings:** Gestionează categoriile, schimbă limba, fontul, fotografia de profil și trimite programul tău ("Share Day" sau "Share Week") prietenilor pe WhatsApp!

---

## 💡 Cum se folosește?

Ai libertate totală! Poți folosi vocea/chat-ul sau interfața manuală.

### 1. Prin Chat (Asistentul AI) 💬
Scrie comenzi rapide și lasă Gemini AI să extragă datele:
> "Adaugă ședință mâine la 14:00"
> "Task cumpărături urgent cu roșu"
> "Când am epilare?"

<img width="462" height="582" alt="image" src="https://github.com/user-attachments/assets/c00eb746-e8ad-46e4-97ac-f5d5d0948fc9" />

### 2. Manual (Click & Edit) 🖱️
Meniul este rapid și intuitiv. Setează alerte personalizate la minut (zile/ore), alege culori din categorii predefinite și distribuie cu un singur click programul tău pe ziua de azi.

---

## 💻 Tehnologii Folosite

Acest proiect demonstrează utilizarea tehnologiilor moderne, scalabile, trecând de la o simplă aplicație de frontend la un sistem complet cu rutare de backend:

| Tehnologie | Rol în Aplicație |
| :--- | :--- |
| **React + TypeScript (Vite)** | Baza arhitecturii frontend, oferind performanță și tipare strictă. |
| **Firebase (Auth & Firestore)** | Bază de date NoSQL în timp real și autentificare sigură via Google. |
| **Google Gemini AI** | Procesare limbaj natural (LLM) pentru extragerea entităților din chat. |
| **Tailwind CSS** | Styling modern cu efecte "Soft UI", design complet responsive. |
| **Vercel Serverless & Cron** | Backend funcțional pentru detectarea și trimiterea notificărilor programate. |
| **Web-Push** | API pentru declanșarea notificărilor native pe dispozitive mobile. |
| **React Context i18n** | Sistem global pentru traduceri și adaptarea limbii aplicației. |
