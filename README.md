# Systeemplafond Rekenmachine - Professionele WebApp v2.0

## 📁 Mappenstructuur

```
systeemplafond-rekenmachine/
│
├── backend/                       # 🐍 PYTHON BACKEND
│   ├── app.py                    # Flask API server
│   ├── requirements.txt          # Python dependencies
│   └── __pycache__/              # (Generated)
│
├── frontend/                      # 🌐 WEB FRONTEND
│   ├── index.html                # HTML interface
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css         # CSS styling
│   │   └── js/
│   │       ├── api.js            # API client
│   │       └── app.js            # Main app logic
│   └── (opent op localhost:8000 via Live Server)
│
├── docs/                          # 📚 DOCUMENTATIE
│   └── (komt nog)
│
└── README.md                      # Project info
```

## 🛠️ Technologie Stack

### - Frontend: Github, Backend: Render.com, Ping om server van Render actief te houden: Cron-jobs.org

### Frontend
- **HTML5** - Semantische markup
- **CSS3** - Modern styling, responsive design
- **Vanilla JavaScript** - Geen frameworks, puur JS

### Backend
- **Python 3** - Server-side logic
- **Flask** - REST API framework
- **Flask-CORS** - Cross-Origin Resource Sharing

## 🚀 Quick Start

### Backend Setup (Python)

```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Run Flask server
python app.py

# Server runs on: http://localhost:5000
```

### Frontend Setup (Web)

```bash
# 1. Open frontend folder
cd frontend

# 2. Start local web server (using VS Code Live Server)
# Right-click index.html → Open with Live Server

# Or use Python:
python -m http.server 8000

# Open in browser: http://localhost:8000
```

## 📊 Architecture

```
Frontend (HTML/CSS/JS)
        ↓
   (HTTP POST/GET)
        ↓
Backend API (Flask/Python)
        ↓
  Calculations
        ↓
     JSON Response
        ↓
Frontend Display
```

## 🔌 API Endpoints

### GET /api/health
Check if API is running.

**Response:**
```json
{
    "status": "OK",
    "message": "API is running"
}
```

---

### GET /api/systemen
Get available systems.

**Response:**
```json
{
    "systemen": [
        {"id": "600x600", "naam": "600x600 systeem"},
        {"id": "600x1200", "naam": "600x1200 systeem"}
    ]
}
```

---

### POST /api/bereken
Calculate materials.

**Request:**
```json
{
    "vierkante_meters": 20,
    "strekkende_meters": 10,
    "systeem": "600x600"
}
```

**Response:**
```json
{
    "hoofdprofielen": 6,
    "tussenprofiel_1200": 28,
    "tussenprofiel_600": 28,
    "plafondplaten": 56,
    "hoeklijn": 4,
    "kantlat": 4,
    "input": {...}
}
```

---

### POST /api/bereken-afmetingen
Convert dimensions to m².

**Request:**
```json
{
    "lengte": 5,
    "breedte": 4
}
```

**Response:**
```json
{
    "vierkante_meters": 20,
    "lengte": 5,
    "breedte": 4
}
```

## 💻 File Descriptions

### Backend

**app.py**
- Flask REST API
- Material configurations
- Calculation logic
- Error handling
- CORS enabled

### Frontend

**index.html**
- Semantic HTML structure
- Form inputs
- Results display
- Responsive layout

**style.css**
- Modern CSS design
- Mobile responsive
- Animations
- Color scheme

**api.js**
- API client class
- HTTP requests
- Error handling
- Data serialization

**app.js**
- Application state
- Event listeners
- UI logic
- Input validation
- Results display

## 🔧 Customization

### Change Calculation Factors

Edit `backend/app.py` - SYSTEMEN dict:

```python
SYSTEMEN = {
    "600x600": {
        "hoofdprofiel_factor": 0.28,      # ← Change this
        "tussenprofiel_1200_factor": 1.39, # ← Or this
        # etc...
    }
}
```

### Change Styling

Edit `frontend/assets/css/style.css` - Update colors, fonts, spacing.

### Add New Fields

1. Add input in `index.html`
2. Update state in `app.js`
3. Add API endpoint in `app.py`
4. Update JavaScript to call new endpoint

## 🧪 Testing

### Test Backend API

```bash
# Using curl
curl -X POST http://localhost:5000/api/bereken \
  -H "Content-Type: application/json" \
  -d '{"vierkante_meters": 10, "strekkende_meters": 10, "systeem": "600x600"}'
```

### Test Frontend

1. Start both servers
2. Open http://localhost:8000
3. Select a system
4. Enter values
5. Check results appear

## 📱 Responsive Design

The application is fully responsive:
- Desktop: Full width layout
- Tablet: Optimized spacing
- Mobile: Single column, touch-friendly

## 🔒 Security Notes

- Backend validates all inputs
- CORS enabled (adjust as needed)
- Input sanitization on both sides
- Error messages don't leak system info

## 📈 Performance

- Lightweight: No dependencies on frontend
- Fast calculations: Direct Python math
- Instant feedback: Real-time UI updates
- Minimal API calls: Only when needed

## 🚀 Deployment

### Simple Deployment

1. **Backend**: Deploy to any Python host (Heroku, PythonAnywhere, etc.)
2. **Frontend**: Deploy to any static host (Netlify, Vercel, GitHub Pages, etc.)
3. **Update API_BASE_URL** in `frontend/assets/js/api.js`

### Using Docker

(Dockerfile coming soon)

## 📝 Changelog

**v2.0** (Current)
- ✅ Separated Frontend/Backend
- ✅ HTML/CSS/JS frontend
- ✅ Flask REST API backend
- ✅ Proper architecture
- ✅ New calculation formulas
- ✅ Hoeklijn & Kantlat added

## 📞 Support

- Check browser console for errors
- Check Flask server output for API errors
- Ensure both servers are running
- Check CORS settings if requests fail

---

**Ready to develop?**
```bash
# Terminal 1: Backend
cd backend && python app.py

# Terminal 2: Frontend
cd frontend && python -m http.server 8000
```

**Then open:** http://localhost:8000 🚀
# SysteemplafondCalculator
