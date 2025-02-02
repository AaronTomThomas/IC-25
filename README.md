Sentinel 🚔
A police dashboard leveraging DeckGL for powerful data visualisations and AI-driven resource allocation.

Overview
Sentinel is a hackathon-built tool designed to help law enforcement visualise crime data and allocate resources proactively using AI. By combining DeckGL for stunning geospatial visualisations and an AI-powered backend, Sentinel provides insights that can help prevent crime before it happens.

⚠ Disclaimer: The code is hacky and messy—this was built during a hackathon. Expect questionable design choices, hardcoded variables, and very little error handling. 

Features
🗺 DeckGL-powered visualisations for crime hotspots, patrol routes, and predictive analytics.
🤖 AI-driven crime prediction to optimise resource allocation.
🚓 Dynamic police unit assignment based on real-time data and historical trends.
📊 Interactive dashboard with crime heatmaps, time-series insights, and response metrics.
Setup Instructions
Frontend (React)
Navigate to the frontend/ directory:
bash
Copy
Edit
cd frontend
Install dependencies:
bash
Copy
Edit
npm install
Start the development server:
bash
Copy
Edit
npm start
Access the dashboard at http://localhost:5173/.
Backend (Flask & AI Model)
Navigate to the backend/ directory:
bash
Copy
Edit
cd backend
Activate the Python virtual environment:
bash
Copy
Edit
source ./venv/bin/activate
Install dependencies (if not already installed):
bash
Copy
Edit
pip install -r requirements.txt
Start the AI-driven crime model server:
bash
Copy
Edit
python crime_model_server.py
The backend will run on http://localhost:5000/.
Tech Stack
Frontend: React + Vite + DeckGL
Backend: Flask + AI Model
Data Processing: NumPy, Pandas, Sci-kit Learn
Visualisation: DeckGL, Mapbox
Future Improvements (If We Had More Time 😅)
✅ Improve AI model accuracy by incorporating live crime feeds.
✅ Refactor the horribly messy codebase.
✅ Add authentication & access control for sensitive police data.
✅ Implement a proper API rather than hardcoded endpoints.
✅ Deploy to cloud with Docker + Kubernetes for scalability.
