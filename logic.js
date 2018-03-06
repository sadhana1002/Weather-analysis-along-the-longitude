// Create our initial map object
// Set the longitude, latitude, and the starting zoom level
var map = L.map("map").setView([4, 34.71 ], 2.15);

// Add a tile layer (the background map image) to our map
// Use the addTo method to add objects to our map
var streetmap = L.tileLayer(
  "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?" +
    "access_token=pk.eyJ1Ijoic2FkaGFuYXNhbmthciIsImEiOiJjamRoa2RoMTgwYWdxMnlwcnZwbjZvYzFxIn0.qL41pdFmzlBZThGq__iXbw"
);

streetmap.addTo(map);

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic2FkaGFuYXNhbmthciIsImEiOiJjamRoazZrbnkwYjFrMndwcm1ucTJpbHNwIn0.iVXstJbbH6Ii3KAmbHxbKQ");

var baseMaps = {
    StreetMap: streetmap,
    DarkMap: darkmap
};

var url = 'https://raw.githubusercontent.com/sadhana1002/Weather-analysis-along-the-longitude/master/python_files/City_Weather_data.csv';



d3.csv(url,function(dataset){

 
var temperatureScale = d3.scaleSqrt().range([5000,150000]);

var windScale = d3.scaleSqrt().range([5000,150000]);

var humidityScale = d3.scaleSqrt().range([5000,150000]);

var cloudScale = d3.scaleSqrt().range([5000,150000]);


var colorScale = d3.scaleSqrt().range([1,0]);

function findMinAndMax(dataColumn) {
  var rMin = d3.min(dataset, function(d){return parseFloat(d[dataColumn])});
  var rMax = d3.max(dataset, function(d){return parseFloat(d[dataColumn])});

  console.log("column - ",dataColumn);
  console.log("Min",rMin);
  console.log("Max",rMax);

  return [rMin,rMax];
};

temperatureScale.domain(findMinAndMax('Temperature'));

colorScale.domain(findMinAndMax('Temperature'));

windScale.domain(findMinAndMax('Windspeed'));

humidityScale.domain(findMinAndMax('Humidity'));

cloudScale.domain(findMinAndMax('Cloudiness'));

var temperatureLayer = L.layerGroup().addTo(map);
var windLayer = L.layerGroup();
var humidityLayer = L.layerGroup();
var cloudLayer = L.layerGroup();

for (var i=0;i<dataset.length;i++){

  console.log("Data",dataset[i]);

  console.log(temperatureScale(parseFloat(dataset[i]['Temperature'])));
  
    temp_marker = L.circle(
        [parseFloat(dataset[i]['Latitude']),parseFloat(dataset[i]['Longitude'])],
        {
          radius:temperatureScale(parseFloat(dataset[i]['Temperature'])),
          color:d3.interpolateRdYlBu(colorScale(parseFloat(dataset[i]['Temperature'])))
        }
    ).bindPopup(`<h3>${dataset[i]['Closest City name']} - ${dataset[i]['Closest Country code']}</h3><hr>`+
                `<p> Temperature - ${dataset[i]['Temperature']} (degree Celcius)<br>`+
                `Wind speed - ${dataset[i]['Windspeed']}<br>`+
                `Humidity - ${dataset[i]['Humidity']}<br>`+
                `Cloudiness - ${dataset[i]['Cloudiness']}</p>`

    );

    wind_marker = L.circle(
      [parseFloat(dataset[i]['Latitude']),parseFloat(dataset[i]['Longitude'])],
      {
        radius:windScale(parseFloat(dataset[i]['Windspeed'])),
        color:getColor('Windspeed')
      }
    );

    humid_marker = L.circle(
      [parseFloat(dataset[i]['Latitude']),parseFloat(dataset[i]['Longitude'])],
      {
        radius:humidityScale(parseFloat(dataset[i]['Humidity'])),
        color:getColor('Humidity')
      }
    );

    cloud_marker = L.circle(
      [parseFloat(dataset[i]['Latitude']),parseFloat(dataset[i]['Longitude'])],
      {
        radius:cloudScale(parseFloat(dataset[i]['Cloudiness'])),
        color:getColor('Cloudiness')
      }
    );
    temp_marker.addTo(temperatureLayer);
    wind_marker.addTo(windLayer);
    humid_marker.addTo(humidityLayer);
    cloud_marker.addTo(cloudLayer);
}



function getColor(feature){
  switch(feature){
      case 'Temperature':
          return 'red';
      case 'Wind speed':
          return 'blue';
      case 'Humidity':
          return 'yellow';
      case 'Cloudiness':
          return 'skyblue';
      default:
          return 'black';
  }
}

var overlayMaps = {
    Temperature:temperatureLayer,
    Windspeed:windLayer,
    Humidity:humidityLayer,
    Cloudiness:cloudLayer
}

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

});

