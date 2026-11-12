# RockShield AI

RockShield AI is an intelligent geotechnical monitoring and early warning system engineered for open-pit mining safety. The platform continuously ingests multi-sensor telemetry (ground vibration, wall displacement, slope steepness, pore water pressure, and rainfall) and processes it through an in-process Random Forest Classifier to forecast slope failure hazards and trigger automated site evacuation advisories in real time.

Live Production URL: https://rockshield-ai.onrender.com

---

## Architecture Overview

```
Physical Sensors / Geophones (Vibration, Tilt, Moisture, Rain, Pore Pressure)
                                   |
                                   v
             Node.js / Express Telemetry Server (Port 4000)
                                   |
                 +-----------------+-----------------+
                 |                                   |
                 v                                   v
     Random Forest Classifier               Socket.IO Broadcast
   (100 CART Trees, Gini Impurity)           (4s Interval Telemetry)
                 |                                   |
                 +-----------------+-----------------+
                                   |
                                   v
             React 18 Dashboard (Vite, Recharts, Responsive UI)
     - Interactive 9-Sector Pit Wall Grid (SEC_A01 to SEC_C03)
     - Geotechnical Checklist & Risk Classifications
     - Manual Sensor Tuning Overrides & Preset Scenarios
     - Historical Telemetry Time-Travel Playback
     - UAV Drone Flight Feeds & Thermal Hotspot Diagnostics
```

---

## Core Capabilities

### 1. Interactive Mine Wall Sector Grid
- 9-sector coordinate grid (`SEC_A01` through `SEC_C03`) mapping pit wall stability in real time.
- State-based color classifications: Safe (green), Warning (yellow), and Critical Hazard (red).
- Active sector monitoring with radar-sweep indicators and live localized readings.

### 2. Machine Learning Landslide Risk Classification
- Custom, dependency-free Random Forest Classifier utilizing CART decision trees, Gini impurity splitting, bootstrap bagging, and random feature subsampling.
- Evaluates 7 core geotechnical features: Slope Angle, Wall Displacement, Structural Strain, Pore Water Pressure, Seismic Vibration, Rainfall Volume, and Acoustic Crack Score.
- Outputs four graduated risk tiers: LOW, MEDIUM, HIGH, and CRITICAL.
- Generates probability distributions across classes and feature importance weights based on Gini gain.

### 3. Sensor Overrides and Simulation Presets
- Parametric sliders allowing geotechnical engineers to test hypothetical scenarios for seismic vibration, wall movement tilt, slope steepness, and pore pressure.
- Preconfigured scenario presets for immediate evaluation:
  - Safe Preset: Baseline nominal parameters.
  - Warning Preset: Elevated strain and pore pressure conditions.
  - Critical Preset: Imminent wall failure conditions.

### 4. Telemetry Time-Travel Playback
- Temporal playback slider to rewind the dashboard state to historical logging intervals (60 minutes, 40 minutes, 20 minutes prior, and live feed).
- Facilitates post-incident forensic analysis and shift change safety handovers.

### 5. Automated Safety Rules and Threshold Alarms
- Configurable hazard limits for ground vibration velocity (mm/s) and precipitation accumulation (mm).
- Immediate visual alarm alerts and evacuation action directives when configured limits are breached.

### 6. UAV Aerial Drone Surveillance
- Aerial visual inspection feed tracking highwall stability and bench fractures.
- Telemetry monitor tracking drone flight velocity, battery charge, GPS fix, LiDAR synchronization, and thermal imaging hotspots.

### 7. Geotechnical Analytics and Visualizations
- Normalized Multi-Sensor Area Chart: Tracks relative sensor risk across all inputs.
- Feature Importance Bar Chart: Displays Gini importance weights computed by the decision trees.
- Risk Distribution Radar Chart: Visualizes voter percentage distribution across risk classes.
- Historical Stability Trend Line Chart: Tracks projected failure probability over time.

---

## Technology Stack

### Backend
- Runtime: Node.js (ES Modules)
- Server Framework: Express 4
- Real-Time Communication: Socket.IO
- Machine Learning Engine: In-process Random Forest Classifier (pure JavaScript, zero external ML dependencies)
- Testing Framework: Node.js native test runner (`node:test`, `node:assert/strict`)

### Frontend
- Library: React 18
- Build Tool: Vite 5
- Data Visualization: Recharts
- Styling: Custom glassmorphism design system, responsive CSS grid, Inter Tight and JetBrains Mono typography
- Real-Time Client: Socket.IO Client

---

## Geotechnical Features and Risk Model

The predictive engine processes 7 physical parameters normalized across standard geotechnical operating ranges:

| Feature | Unit | Nominal Range | Description |
| :--- | :--- | :--- | :--- |
| Slope Angle | degrees | 20 - 60 | Pit wall inclination from horizontal |
| Displacement | mm | 1 - 25 | Total wall surface movement measured by extensometers |
| Strain | ratio | 0.05 - 1.00 | Tensile rock mass strain |
| Pore Pressure | kPa | 20 - 100 | Groundwater pore pressure measured by piezometers |
| Vibration | mm/s | 0.05 - 1.00 | Peak particle velocity (PPV) from geophones |
| Rainfall | mm | 0 - 80 | Cumulative surface precipitation |
| Crack Score | index | 0.00 - 1.00 | Acoustic emission and optical fracture severity |

### Scoring Formula

```
Raw Score = 0.20 * ((Slope - 20) / 40)
          + 0.20 * ((Displacement - 1) / 24)
          + 0.15 * Strain
          + 0.15 * ((Pore Pressure - 20) / 80)
          + 0.08 * Vibration
          + 0.07 * (Rainfall / 80)
          + 0.15 * Crack Score
```

Risk classifications:
- Score <= 0.32: LOW
- Score <= 0.52: MEDIUM
- Score <= 0.70: HIGH
- Score > 0.70: CRITICAL

---

## Repository Structure

```
RockShield-AI/
├── package.json               # Root monorepo workspace configuration
├── .gitignore                 # Git ignore rules for node_modules and builds
├── README.md                  # Project documentation
├── backend/
│   ├── package.json           # Backend dependencies and scripts
│   ├── src/
│   │   ├── dataset.js         # Synthetic geotechnical data and scoring logic
│   │   ├── randomForest.js    # CART decision tree and Random Forest implementation
│   │   ├── model.js           # Model training, evaluation, and prediction facade
│   │   └── server.js          # Express REST API and Socket.IO server
│   └── test/
│       ├── dataset.test.js    # Unit tests for scoring and dataset generation
│       ├── model.test.js      # Unit tests for training and inference
│       └── randomForest.test.js # Unit tests for tree fitting and probabilities
└── frontend/
    ├── package.json           # Frontend dependencies and build scripts
    ├── vite.config.js         # Vite configuration with chunk splitting and proxies
    ├── index.html             # Application entry point with optimized font preloads
    ├── public/
    │   ├── favicon.svg        # Brand icon
    │   └── rockfall_open_pit.png # Aerial reference imagery
    └── src/
        ├── main.jsx           # React DOM bootstrapping
        ├── App.jsx            # Core layout, tab switching, and state management
        ├── api.js             # REST API client with error handling
        ├── riskTheme.js       # Color tokens and risk level mappings
        ├── index.css          # CSS reset, typography, and theme variables
        ├── App.css            # Component styles, animations, and responsive layout
        └── components/
            ├── Header.jsx     # Navigation bar, live clock, seismic indicator, alarms
            ├── MetricBar.jsx  # KPI metric cards with inspection modals
            ├── SectorMap.jsx   # 9-sector wall monitoring grid with radar sweep
            ├── SensorControls.jsx # Override sliders, dropdown, and presets
            ├── AlertPanel.jsx # Circular risk score and geotechnical checklist
            ├── Charts.jsx     # Area, Bar, Radar, and Line visualization components
            └── ModelInfoPanel.jsx # Model hyperparameters and accuracy metrics
```

---

## Installation and Setup

### Prerequisites
- Node.js version 18.0.0 or higher (v24 LTS recommended)
- npm version 9.0.0 or higher

### Quick Start (Single Command)

From the project root:

```bash
# Install dependencies across both backend and frontend
npm run install-all

# Build frontend production assets
npm run build

# Start the unified production server
npm start
```

The unified service will be available at `http://localhost:4000`.

### Development Mode (Concurrent Terminals)

If developing the frontend and backend simultaneously:

#### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```
The backend initializes the Random Forest model and starts on `http://localhost:4000`.

#### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
The Vite development server starts on `http://localhost:5173` with automatic API and WebSocket proxying to port 4000.

---

## API Reference

### REST Endpoints

#### GET `/api/health`
Returns service availability status.
```json
{ "ok": true }
```

#### GET `/api/model-info`
Returns current model hyperparameters, training dataset size, test accuracy, and feature importances.
```json
{
  "algorithm": "Random Forest Classifier (100 trees, depth 10, Gini impurity)",
  "nEstimators": 100,
  "maxDepth": 10,
  "minSamplesSplit": 4,
  "trainSize": 2400,
  "testSize": 600,
  "accuracy": 0.745,
  "features": ["Slope Angle", "Displacement", "Strain", "Pore Pressure", "Vibration", "Rainfall", "Crack Score"],
  "featureImportance": [...]
}
```

#### GET `/api/sectors`
Returns current telemetry and risk assessment for all 9 sectors (`A01` through `C03`).

#### POST `/api/predict`
Calculates risk prediction, probability distribution, danger index, and weighted raw score for supplied sensor values.
- Request Body:
```json
{
  "slope": 35.0,
  "displacement": 8.0,
  "strain": 0.30,
  "porePressure": 45.0,
  "vibration": 0.30,
  "rainfall": 15.0,
  "crackScore": 0.20,
  "sector": "B02"
}
```
- Response:
```json
{
  "prediction": "LOW",
  "probabilities": {
    "LOW": 0.82,
    "MEDIUM": 0.14,
    "HIGH": 0.04,
    "CRITICAL": 0.00
  },
  "danger": 18.0,
  "rawScore": 0.235,
  "sectorOverride": true
}
```

### WebSocket Events

- `sectors-init`: Emitted to newly connected clients with full 9-sector state.
- `sector-update`: Emitted when sector telemetry drifts or when an engineer overrides sensor values.

---

## Testing

Backend unit tests validate dataset generation, Random Forest tree induction, Gini impurity calculation, probability normalization, and inference behavior:

```bash
# Run tests from project root
npm test

# Or directly in backend
cd backend && npm test
```

Test results:
- 11 tests executed across 3 suites.
- 0 failures, 100% pass rate.

---

## Production Deployment

The unified application is deployed to Render with static client bundle serving enabled through Express:
Production Endpoint: https://rockshield-ai.onrender.com

---

## License

This project is licensed under the MIT License.
