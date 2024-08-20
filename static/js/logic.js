// Use this link to get the GeoJSON data.
let geoJSONlink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Creating the map object and setting the center and zoom level
let myMap = L.map("map", {
  center: [37, -95],
  zoom: 5
});



// Adding a tile layer (the background map image) to our map:
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);




// Function to determine the marker size based on the earthquake magnitude
function earthQuakeMagnitude(magnitude) {
    return Math.max(Math.sqrt(magnitude) * 10000, 10000); // Minimum radius to ensure visibility
}

// Function to determine the marker color based on the earthquake depth
function earthQuakeDepthColor(depth) {
    if (depth > 90) {
      return "#EA2C2C"; // Dark Red
    } else if (depth > 70) {
      return "#EA822C"; // Orange-Red
    } else if (depth > 50) {
      return "#EE9C00"; // Orange
    } else if (depth > 30) {
      return "#EECC00"; // Yellow-Orange
    } else if (depth > 10) {
      return "#D4EE00"; // Yellow-Green
    } else {
      return "#98EE00"; // Light Green
    }
}

// Perform a GET request to the GeoJSON URL
d3.json(geoJSONlink).then(function(data) {
    // Define an array to hold all the earthquake markers
    let earthQuakeMarkers = [];
    
    // Loop through the features array and create markers
    for (let i = 0; i < data.features.length; i++) {
      let feature = data.features[i];
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
      let coordinates = feature.geometry.coordinates;
      let latitude = coordinates[1].toFixed(4);
      let longitude = coordinates[0].toFixed(4);

      // Skip this iteration if magnitude is less than 0
      if (magnitude < 0) {
        continue;
      }

      console.log("Magnitude:", magnitude, "Depth:", depth);
  
      // Create a circle marker and bind a popup to it
      let earthquakeMarker = L.circle([latitude, longitude], {
        stroke: true,
        fillOpacity: 0.75,
        color: "black",
        weight: 0.25,
        fillColor: earthQuakeDepthColor(depth),
        radius: earthQuakeMagnitude(magnitude)
      }).bindPopup(`<h3>Magnitude: ${magnitude}</h3><hr><p>Depth: ${depth} km</p><p>Latitude: ${latitude}</p><p>Longitude: ${longitude}</p>`);

      // Add the marker to the earthQuakeMarkers array
      earthQuakeMarkers.push(earthquakeMarker);
    }
  
    // Add the markers to the map
    L.layerGroup(earthQuakeMarkers).addTo(myMap);
});

// Add a color scale legend to the map
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [-10, 10, 30, 50, 70, 90];
    let labels = [];
    let colors = ["#98EE00", "#D4EE00", "#EECC00", "#EE9C00", "#EA822C", "#EA2C2C"];

    // Loop through depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
