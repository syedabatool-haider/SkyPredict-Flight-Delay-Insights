// Initialize map only if present
let mapElement = document.getElementById('map')
let map = mapElement ? L.map('map').setView([30,0],2) : null

if(map){
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
}

let gaugeChart
let compareChart
let lineLayer
let planeMarker

// FORM SUBMIT
document.getElementById("predictForm")?.addEventListener("submit", async function(e){

e.preventDefault()

document.getElementById("statusText").innerText = "Analyzing flight..."

let time = document.getElementById("CRS_DEP_TIME").value.replace(":","")

let data = {
ORIGIN: ORIGIN.value,
DEST: DEST.value,
DISTANCE: Number(DISTANCE.value),
CRS_DEP_TIME: Number(time),
DAY_OF_WEEK: Number(DAY_OF_WEEK.value),
OP_UNIQUE_CARRIER: OP_UNIQUE_CARRIER.value,
TAIL_NUM: TAIL_NUM.value
}

let res = await fetch("/predict",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
})

let result = await res.json()

/* KPI */
probCard.innerText = Math.round(result.delay_probability*100) + "%"
delayCard.innerText = Math.round(result.arrival_delay) + " min"
distanceCard.innerText = data.DISTANCE + " km"

/* FLIGHT INFO */
routeText.innerText = data.ORIGIN + " → " + data.DEST
carrierText.innerText = data.OP_UNIQUE_CARRIER
distanceText.innerText = data.DISTANCE
timeText.innerText = CRS_DEP_TIME.value
delayText.innerText = Math.round(result.arrival_delay)

/* AI EXPLANATION */
let list = document.getElementById("explanationList")
if(list){
list.innerHTML = ""
result.explanation.forEach(r=>{
let li = document.createElement("li")
li.innerText = r
list.appendChild(li)
})
}

/* DRAW VISUALS */
drawGauge(result.delay_probability)
drawRoute(result.origin_coord, result.dest_coord)
showComparison(result)

})


// GAUGE CHART
function drawGauge(prob){

let percent = Math.round(prob*100)
let ctx = document.getElementById("gaugeChart")

if(!ctx) return

if(gaugeChart) gaugeChart.destroy()

let color
if(percent > 60) color = "#ff4d4d"
else if(percent > 30) color = "#f9c802"
else color = "#00c3ff"

gaugeChart = new Chart(ctx,{

type:"doughnut",

data:{
datasets:[{
data:[percent, 100-percent],
backgroundColor:[color,"#e5e5e5"]
}]
},

options:{
rotation:270,
circumference:180,
cutout:"70%",
plugins:{
legend:{display:false},
tooltip:{enabled:false}
}
}

})

let status = document.getElementById("statusText")

if(status){
status.innerText =
percent>60 ?
"⚠ High Delay Risk ("+percent+"%)"
:
"✔ Flight Likely On Time ("+percent+"%)"
}

}


// MAP + ANIMATED PLANE
function drawRoute(originCoord, destCoord){

if(!map || !originCoord || !destCoord) return

let start = [originCoord.lat, originCoord.lon]
let end = [destCoord.lat, destCoord.lon]

if(lineLayer) map.removeLayer(lineLayer)

lineLayer = L.polyline(
[start,end],
{
color:"#00c3ff",
weight:4,
dashArray:"10,10"
}).addTo(map)

if(planeMarker) map.removeLayer(planeMarker)

planeMarker = L.marker(start,{
icon: L.divIcon({
html:"✈️",
className:"plane-icon",
iconSize:[30,30]
})
}).addTo(map)

let latStep = (end[0]-start[0])/100
let lonStep = (end[1]-start[1])/100

let i = 0

let interval = setInterval(()=>{

start[0] += latStep
start[1] += lonStep

planeMarker.setLatLng(start)

i++

if(i > 100) clearInterval(interval)

}, 50)

map.fitBounds(lineLayer.getBounds())

}


// COMPARISON CHART
function showComparison(result){

let text = document.getElementById("comparisonText")

if(result.actual_delay === null){

if(text) text.innerText = "No historical data available"
return

}

let predicted = Math.round(result.arrival_delay)
let actual = Math.round(result.actual_delay)

let ctx = document.getElementById("compareChart")

if(!ctx) return

if(compareChart) compareChart.destroy()

compareChart = new Chart(ctx,{

type:"bar",

data:{
labels:["Predicted Delay","Actual Delay"],
datasets:[{
data:[predicted, actual],
backgroundColor:["#007bff","#ff4d4d"]
}]
},

options:{
plugins:{legend:{display:false}},
scales:{
y:{
title:{
display:true,
text:"Delay Minutes"
}
}
}
}

})

}
