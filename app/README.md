# 📊 Super-Investor
*A modern platform for reading SEC filings with style & convenience.*

## 🚀 About This Project
This project is about making investment research more enjoyable through a better UX than the one provided by SEC.

---

## 🛠 Tech Stack
- **Frontend** → [Next.js 15](https://nextjs.org) (React 19, App Router)
- **UI Components** → [shadcn/ui](https://ui.shadcn.com)
- **Data Source** → SEC EDGAR Filings API, RSS Feeds
- **Database (Planned)** → Supabase / Postgres
- **Hosting** → Vercel

---

## 🎯 Project Goals
✅ **Build a fast & modern SEC filings reader**  
✅ **Allow users to search company filings by ticker**  
✅ **Format filings into an easy-to-read layout**  
🚧 **Expand to international filings (manual first, automated later)**  
🚧 **Develop a mobile app (React Native / Expo)**  
🚧 **Integrate AI-powered summaries for faster insights**

---

## 🏗 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Python 3.13 (for the API)

### Frontend Setup
To run the frontend locally:

```bash
git clone https://github.com/aldo-leka/super-investor.git
cd super-investor/app
npm install --legacy-peer-deps  # Required due to React 19 peer dependency conflicts
npm run dev
```

**Note:** The `--legacy-peer-deps` flag is needed because some dependencies (like cmdk) haven't been updated for React 19 yet.

**Create a `.env.local` file** in the root of the app directory.
Copy the contents of `.env.example` and configure your settings:
- `NEXT_PUBLIC_API_URL` - Your backend API URL (default: http://localhost:8000)
- Other environment variables as needed

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Backend Setup
To run the API server:

```bash
cd super-investor/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at [http://localhost:8000](http://localhost:8000).

---

## 🛣 Roadmap
✔ **Phase 1** → Build SEC Filings Search & Display UI  
🚧 **Phase 2** → Add International Market Filings Support  
🚧 **Phase 3** → AI Summaries & Advanced Features

---

## 📜 License
This project is **open-source** under the [MIT License](LICENSE). Contributions are welcome!

---

...Work in progress...
