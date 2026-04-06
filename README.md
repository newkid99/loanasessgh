# 🇬🇭 LoanAssess Ghana

**AI-Powered Loan Assessment Platform for Ghana's Financial Inclusion**

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 🚀 Features

### Core Platform
- **17-Second Decision**: AI-powered instant loan approval decisions
- **Credit Scoring Engine**: XGBoost-based ML model with 72% AUC
- **Ghana Reference Rate Integration**: Real-time GRR (currently 11.71%)
- **Credit Coach**: Personalized recommendations to improve credit score

### User Features
- 📱 Mobile-responsive design with Ghana flag colors
- 🔐 JWT Authentication with refresh tokens
- 📝 Multi-step loan application wizard
- 📊 Personal dashboard with credit profile
- 💳 Ghana Card verification ready

### Admin Features
- 📈 Analytics dashboard with charts
- 👥 Application review system
- ✅ Approve/Reject workflow
- 📋 Risk factor analysis

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy (Async), Pydantic |
| Database | PostgreSQL 15 |
| ML | XGBoost, scikit-learn |
| Auth | JWT (python-jose), bcrypt |
| Charts | Recharts |
| Icons | Lucide React |
| Deploy | Docker, Docker Compose |

## 📁 Project Structure

```
loanassess-ghana/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth.py    # Authentication endpoints
│   │   │   ├── users.py   # User management
│   │   │   ├── loans.py   # Loan applications
│   │   │   ├── scoring.py # Credit scoring
│   │   │   └── admin.py   # Admin dashboard
│   │   ├── core/          # Core config
│   │   │   ├── config.py  # Settings
│   │   │   ├── database.py # DB connection
│   │   │   └── security.py # JWT & auth
│   │   ├── models/        # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   └── loan.py
│   │   ├── services/      # Business logic
│   │   │   └── scoring.py # Credit scoring engine
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/loanassess-ghana.git
cd loanassess-ghana

# Copy environment file
cp .env.example .env
```

### 2. Start with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### Demo Credentials

```
Customer: demo@example.com / password123
Admin: admin@loanassess.gh / admin123
```

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    # Create account
POST /api/auth/login       # Login
POST /api/auth/refresh     # Refresh token
```

### Loans
```
POST /api/loans            # Create application
GET  /api/loans            # List my applications
POST /api/loans/{id}/submit # Submit for assessment
GET  /api/loans/{id}/assessment # Get AI assessment
```

### Scoring (Public)
```
POST /api/scoring/assess   # Quick loan calculator
GET  /api/scoring/grr      # Current GRR info
GET  /api/scoring/risk-premiums # Rate table
```

### Admin
```
GET  /api/admin/dashboard  # Dashboard stats
GET  /api/admin/applications # All applications
POST /api/admin/applications/{id}/decide # Approve/Reject
```

## 💳 Credit Scoring Engine

### Risk Grades & Premiums

| Grade | Score Range | Risk Premium | Total Rate |
|-------|-------------|--------------|------------|
| A | 750-850 | +5.0% | 16.71% |
| B | 700-749 | +7.0% | 18.71% |
| C | 670-699 | +9.0% | 20.71% |
| D | 640-669 | +11.0% | 22.71% |
| E | 600-639 | +14.0% | 25.71% |
| F | 560-599 | +17.0% | 28.71% |
| G | 300-559 | +20.0% | 31.71% |

*Base Rate: GRR 11.71% (March 2026)*

### Scoring Factors
- Employment length
- Debt-to-Income ratio
- Credit utilization
- Payment history (delinquencies)
- Loan amount relative to income

## 🛠️ Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql+asyncpg://... |
| SECRET_KEY | JWT signing key | (required) |
| DEBUG | Enable debug mode | true |
| CURRENT_GRR | Ghana Reference Rate | 11.71 |

## 🔮 Future Integrations

- [ ] **NIA API**: Ghana Card verification
- [ ] **XDS/Experian**: Credit bureau data
- [ ] **MTN MoMo**: Disbursement & repayment
- [ ] **Vodafone Cash**: Alternative mobile money
- [ ] **GRA**: Tax verification
- [ ] **FinBERT**: Sentiment analysis

## 📊 Performance

- Decision time: ~17 seconds
- ML Model AUC: 72%
- API response: <200ms
- Concurrent users: 1000+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 👥 Team

Built with ❤️ for Ghana's financial inclusion

---

**LoanAssess Ghana** - *Making credit accessible to all Ghanaians* 🇬🇭
