// Create the map object
let myMap = L.map("map", {
    center: [38.116386, -101.299591],
    zoom: 5
});

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Connect to the GeoJSON data
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Define the radius of the markers based on the magnitude
function markerSize(magnitude) {
    return (magnitude) * 3;
}

// Define the color of the markers based on the magnitude
function colorDepth(depth) {
    let maxDepthvalue = 100;
    let scale = d3.scaleLinear()
        .domain([0, maxDepthvalue])
        .range(["#a3f600", "#fdb72a", "#ff5f65"]);
    return scale(depth);
}

function createLegend() {
    let legend = L.control({ position: 'bottomright' });

    // Define color ranges for each depth range
    let colorRanges = [
        { range: "-10-10", color: "#a3f600" },
        { range: "10-30", color: "#dcf400" },
        { range: "30-50", color: "#f7db11" },
        { range: "50-70", color: "#fdb72a" },
        { range: "70-90", color: "#fca35d" },
        { range: "90+", color: "#ff5f65" }
    ];

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'legend');
        div.style.backgroundColor = 'white'; // Set the background color to white

        for (let i = 0; i < colorRanges.length; i++) {
            div.innerHTML +=
                `<div class="legend-item"><span class="legend-color" style="background:${colorRanges[i].color};"></span>${colorRanges[i].range}</div>`;
        }

        return div;
    };

    legend.addTo(myMap);
}

d3.json(link).then(function (data) {
    // Create a GeoJSON layer with the retrieved data

    let features = data.features; // Array of GeoJSON features
    let earthquakes = [];
    let maxDepth = 0;

    // Loop through each GeoJSON feature
    features.forEach(feature => {
        let magnitude = feature.properties.mag;
        let coordinates = feature.geometry.coordinates;
        let location = feature.properties.place;
        let depth = coordinates[2];

        // Create a circle marker for each earthquake
        let circleMarker = L.circleMarker([coordinates[1], coordinates[0]], {
            color: 'black', 
            weight: 1,
            fillColor: colorDepth(depth),
            fillOpacity: 0.5,
            radius: markerSize(magnitude)
        })
            .bindPopup(`Location: ${location}<br>Magnitude: ${magnitude}<br> Depth: ${depth} km`)
            .addTo(myMap);

        earthquakes.push({ magnitude, coordinates, circleMarker });

        if (depth > maxDepth) {
            maxDepth = depth;
        }
    });

    // Create a legend for the map
    createLegend();

});
