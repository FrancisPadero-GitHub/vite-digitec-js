# DigiTEC: A Fund Monitoring System for ECTEC Contributions and Loans 🦅

## 📌 Tech Stack  
*(already available via npm install, no need to install manually)*  
- Node.js v20 or higher  
- Tailwind CSS  
- DaisyUI (Tailwind component library)  
- Material UI (For icons)  
- React Router DOM (For routing)  
- Recharts (For chart visualizations)
- date-fns (For date formatting and calculations)

## 📌 Installation
```bash
git clone https://github.com/cindyclairebooc/digitec.git
cd digitec
npm install
npm run dev
```

## 📌 Folder Structure
/src  
- /assets – all images go here  
- /components – reusable UI components (charts, base table, base modal)  
- /constants – static values and configs (roles, badge colors, etc)  
- /layout – structure across pages (main layout, topbar, sidebar, footer)  
- /mock – mock data; temporary, mostly for frontend use  
- /pages – system’s main pages  
  - /admin  
  - /auth  
  - /board  
  - /members  
  - /shared – shared pages between board and treasurer  
  - /treasurer  
- /types – shared TypeScript types and interfaces  
- /utils – helper functions for formatting and calculations  
- index.css – contains main system font and colors  
- Routes.tsx – main routing structure

## 📌 Project Status

### ✅ Completed-ish (semi-final, will evolve with backend)
- Main routing and layout structure  
- Treasurer, BOD, Members, and Admin pages  
- Table layouts + modals for Share Capital, Club Funds, etc.  
- Mock data setup (TypeScript + JSON)

### 🔜 Up Next
- Auth system  
- Role-based routing + access control  
- Backend integration  
- Update landing + login pages
- Ensure responsiveness across pages
- Oher subfeatures (Settings page, Help page, Notifications)
- Add toasts/modal alerts
