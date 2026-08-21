# RockShield AI — Early Landslide Warning System (SIH Command Center)

RockShield AI is a full-stack real-time geotechnical monitoring system designed for open-pit mining safety. It ingests live telemetry (ground vibration, wall movement, slope steepness, water pressure, rainfall) and pipes it to an in-process Random Forest Classifier to forecast landslide hazards and trigger automated site sirens.

---

## 🚀 Key Platform Features

### 1. Interactive Mine Wall Grid Map
*   An interactive 9-sector mine coordinates map grid (`SEC_A01` to `SEC_C03`) tracking active sensors.
*   Color-coded boundaries indicate safety levels (Green: Safe, Yellow: Warning, Red: Hazard Alert).
*   Live radar-sweep animations overlay the active monitoring zone.

### 2. AI Landslide Risk Analysis Checklist
*   Swaps paragraph logs for an organized checklist showing the safety status of each sensor indicator:
    *   **Vibration Check:** Ground vibration levels.
    *   **Wall Movement Check:** Wall displacement indicators.
    *   **Slope Steepness Check:** Slope steepness angles.
    *   **Water Pressure Check:** Ground water pressure levels.
*   Triggers automated evacuation advisories and sirens when hazard limits are exceeded.

### 3. Sensor Tuning Overrides & Preset Scenarios
*   Manual override sliders allow mining engineers to simulate geophone vibration, wall movement tilt, steepness angles, and soil water pressure.
*   One-click presets allow instant testing of:
    *   **Safe Preset:** Nominal baseline levels.
    *   **Warning Preset:** Rising strain parameters.
    *   **Critical Preset:** Pre-landslide failure parameters.

### 4. Landslide Simulation Time-Travel Playback
*   A history playback slider rewinds the dashboard to inspect sensor parameters from past landslide recording events (60 mins ago, 40 mins ago, 20 mins ago).

### 5. Safety Alert Limits Configuration
*   Interactive configuration sliders to set warning trigger points for ground vibration speeds and rainfall volume.
*   Crossing these thresholds immediately flashes a system alarm widget.

### 6. Tactile Parameter Inspection Modals
*   Engineers can click any metrics card, sector coordinate, or diagnostic feed to open glassmorphic overlay modals displaying hardware battery health, transmission signal ping latency, and localized telemetry parameters.

### 7. UAV Drone Monitoring
*   Live aerial photo feeds showing active slope monitoring zones.
*   Drone diagnostics panel tracking GPS target coordinates, UAV flight velocity, battery charge, and thermal risk hotspots on the pit wall.

### 8. AI Brain Specifications Card
*   Displays real-time machine learning info:
    *   **Prediction Success Rate:** Live accuracy percentage.
    *   **AI Decision Trees:** Displays active estimator count (500 trees).
    *   **Methodology logs:** Full details about algorithm inputs, training samples size, and checked variables.

### 9. Analytics view & Charts
*   **Sensor Risk Levels:** Normalized area chart tracking multi-sensor curves.
*   **Main Risk Factors (AI Weight):** Bar chart mapping which sensors the AI cares about most.
*   **AI Vote Distribution:** Radar chart mapping class voter percentages.
*   **Stability Trend Over Time:** Historical line chart tracking slide probability levels.

---

## 🛠️ Technology Stack

*   **Backend:** Node.js, Express, Socket.IO (broadcasting live drifts every 4s), and an in-house custom Random Forest Classifier (written in JS, supporting CART, Gini index, bagging, and feature subsampling).
*   **Frontend:** React 18, Vite, Recharts, Socket.IO Client.
*   **Aesthetics:** Light-theme glassmorphism (translucent white panels, `backdrop-filter: blur(20px)`, subtle hover transforms, Inter Tight typography).

---

## 💻 Local Installation & Setup

### Terminal 1 — Backend (Port 4000)
```bash
cd backend
npm install
npm start
```

### Terminal 2 — Frontend (Port 5173 / 5174)
```bash
cd frontend
npm install
npm run dev
```

Open your browser at **http://localhost:5173** (or http://localhost:5174 if port 5173 is bound).

---

## 📂 Project Architecture

*   `backend/src/dataset.js` — Synthetic data generator mirroring open-pit landslide logic.
*   `backend/src/randomForest.js` — Custom, CART-based Random Forest model (no black-box dependencies).
*   `backend/src/server.js` — Express API & Socket.IO server pushing live telemetry.
*   `frontend/src/App.jsx` — Core layout shell, state hooks, and custom click modals.
*   `frontend/src/components/Header.jsx` — Sliding underline navbar, Live status, and notifications dropdown.
*   `frontend/src/components/SensorControls.jsx` — Override sliders, preset scenarios, and custom dropdown menus.
*   `frontend/src/components/SectorMap.jsx` — Wall monitoring map coordinates grid.
*   `frontend/src/components/AlertPanel.jsx` — AI Risk Analysis checklist card.
*   `frontend/src/components/Charts.jsx` — Visualizations (Radar, Area, Bar, Line).
*   `frontend/src/components/ModelInfoPanel.jsx` — AI brain specs card.
