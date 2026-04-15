from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import joblib

app = Flask(__name__)

stage1 = joblib.load("model_dep.pkl")
stage2 = joblib.load("model_arr.pkl")
features = joblib.load("feature_list.pkl")
encoders = joblib.load("encoders.pkl")

history = pd.read_csv("cleaned_flights.csv")

origin_map = history.set_index("ORIGIN")["ORIGIN_AIRPORT_ID"].to_dict()
dest_map = history.set_index("DEST")["DEST_AIRPORT_ID"].to_dict()

airports = pd.read_csv("airports.csv", header=None)

airports.columns = [
"id","name","city","country","IATA","ICAO",
"lat","lon","alt","timezone","dst","tz","type","source"
]

airports = airports[airports["IATA"] != "\\N"]
airports = airports.drop_duplicates(subset="IATA")

airport_coords = airports.set_index("IATA")[["lat","lon"]].to_dict("index")


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


@app.route("/predict_page")
def predict_page():
    airport_list = sorted(airport_coords.keys())
    return render_template("predict.html", airports=airport_list)


@app.route("/model_info")
def model_info():
    return render_template(
        "model_info.html",
        model1="Delay Classification Model",
        model2="Arrival Delay Regression Model",
        accuracy="85%",
        precision="80%",
        recall="78%",
        features=features
    )


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json
    df = pd.DataFrame([data])

    df["YEAR"] = 2024
    df["DEP_HOUR"] = df["CRS_DEP_TIME"] // 100

    df["ORIGIN_AIRPORT_ID"] = df["ORIGIN"].map(origin_map)
    df["DEST_AIRPORT_ID"] = df["DEST"].map(dest_map)

    for col, enc in encoders.items():
        if col in df.columns:
            df[col] = enc.transform(df[col].astype(str))

    df = df[features]

    prob = stage1.predict_proba(df)[0][1]
    delay_class = stage1.predict(df)[0]

    arr_delay = 0
    if delay_class == 1:
        arr_delay = float(np.expm1(stage2.predict(df))[0])

    hist = history[
        (history["ORIGIN"] == data["ORIGIN"]) &
        (history["DEST"] == data["DEST"])
    ]

    actual_delay = None
    if len(hist) > 0:
        actual_delay = float(hist["ARR_DELAY"].iloc[0])

    origin_coord = airport_coords.get(data["ORIGIN"])
    dest_coord = airport_coords.get(data["DEST"])
        # Generate explanation
    reasons = []
    
    if prob > 0.6:
        reasons.append("High overall delay probability based on historical patterns")
    
    if data["DISTANCE"] > 1500:
        reasons.append("Long distance flights tend to accumulate delays")
    
    if df["DEP_HOUR"].iloc[0] in [17,18,19,20]:
        reasons.append("Evening peak hours increase congestion and delays")
    
    if data["DAY_OF_WEEK"] in [5,6,7]:
        reasons.append("Weekend traffic can lead to scheduling delays")
    
    if delay_class == 1:
        reasons.append("Model strongly predicts a delay for this route")
    
    if len(reasons) == 0:
        reasons.append("Flight conditions appear normal with low delay risk")
    return jsonify({
        "delay_probability": prob,
        "arrival_delay": arr_delay,
        "actual_delay": actual_delay,
        "origin_coord": origin_coord,
        "dest_coord": dest_coord,
        "explanation": reasons
    })

   
if __name__ == "__main__":
    app.run(debug=True)
