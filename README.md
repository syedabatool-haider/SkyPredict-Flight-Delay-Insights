# SkyPredict: Flight Delay Insights

SkyPredict is a flight delay prediction and analytics project built using **Python, Flask, Machine Learning, and Power BI**.  
The project combines predictive modeling with an interactive dashboard to help analyze and estimate flight delays based on route and scheduling information. :contentReference[oaicite:0]{index=0}

## Project Overview

This project predicts whether a flight is likely to be delayed and estimates the expected arrival delay. It uses:

- a **delay classification model** to predict the probability of delay
- an **arrival delay regression model** to estimate the delay duration
- historical flight data for route-based insights
- airport data for mapping and route visualization
- a Flask-based web interface for prediction and dashboard views :contentReference[oaicite:1]{index=1}

## Features

- Interactive **dashboard page**
- Separate **prediction page** for user input
- **Model information page** showing model details and features
- Delay probability prediction
- Estimated arrival delay prediction
- Historical comparison for selected routes
- Route coordinate extraction for visualization
- Simple explanation generation for prediction results based on factors like distance, departure hour, weekends, and overall delay probability :contentReference[oaicite:2]{index=2}

## Tech Stack

- **Python**
- **Flask**
- **Pandas**
- **NumPy**
- **Joblib**
- **Machine Learning models (.pkl files)**
- **Power BI** for dashboard/reporting (`FDPS.pbix`)

## Project Structure

```text
SkyPredict-Flight-Delay-Insights/
│
├── app.py                       # Main Flask application
├── proj.ipynb                   # Notebook containing project workflow / model work
├── airports.csv                 # Airport reference dataset
├── model_dep.pkl                # Delay classification model
├── model_arr.pkl                # Arrival delay regression model
├── encoders.pkl                 # Encoders used for categorical features
├── encoder_DEST.pkl             # Destination encoder
├── encoder_ORIGIN.pkl           # Origin encoder
├── encoder_OP_UNIQUE_CARRIER.pkl# Airline encoder
├── feature_list.pkl             # Final feature list used by the model
├── feature_pipeline.pkl         # Feature processing pipeline
├── FDPS.pbix                    # Power BI dashboard/report
├── static/                      # Static assets
├── templates/                   # HTML templates
└── .gitignore                   # Ignored files
