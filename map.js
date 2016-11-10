//global variables
var map, heatmap;
var new_york = {lat: 40.7128, lng: -74.0059}
var all_overlays = [];
var locations = [];
var markers;
var markerCluster;

//button for centering map
function CenterControl(controlDiv, map) {
  //CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  //CSS for  control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Center Map';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', function() {
    map.setCenter(new_york);
  });
}

//map 
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new_york,
  });

  // import geojson data through script and callbacks
  var script = document.createElement('script');
  script.src = './data/dataa.geojson';
  document.getElementsByTagName('head')[0].appendChild(script);

  //center map button to new york
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  //initializes drawing manager that allows for drawing arbitrary shapes
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
    polygonOptions: {
       editable: false
    }
  });
  drawingManager.setMap(map);

  //event listeners for selecting and editing drawn polygons
  google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
    all_overlays.push(polygon);
    drawingManager.setDrawingMode(null);
    markerCluster.clearMarkers();

    //selects for points within selection
    var tempLocations = [];
    var heat = [];
    for (var i = 0; i < all_overlays.length; i++) {
      for (var j = 0; j < locations.length; j++) {
        var curPosition = new google.maps.LatLng(locations[j].lat, locations[j].lng);
        if (google.maps.geometry.poly.containsLocation(curPosition, all_overlays[i])) {
          tempLocations.push(locations[j]);
          heat.push(curPosition);
        }
      }
    }

    markers = tempLocations.map(function(location, i) {
      var placeholder = new google.maps.Marker({
        position: location,
      });
      placeholder.setVisible(false);
      return placeholder;
    });

    markerCluster = new MarkerClusterer(map, markers,
      {ignoreHidden: true,
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

    markerCluster.redraw();

    heatmap.setMap(heatmap.getMap() ? null : map);

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: heat
    });

    heatmap.setMap(map);
  });
};


//callback function called from script importing geojson
window.eqfeed_callback = function(results) {
  //generates array of latitudes and longitudes
  for (var i = 0; i < results.features.length; i++) {
    var coords = results.features[i].geometry.coordinates;
    locations.push({lat: coords[1], lng: coords[0]})
  }

  //generates map of markers to render in marker clusterer
  //ignores lone markers that have virtually no nearby markers
  markers = locations.map(function(location, i) {
    var placeholder = new google.maps.Marker({
      position: location,
    });
    placeholder.setVisible(false);
    return placeholder;
  });

  // add a marker clusterer to manage the markers
  markerCluster = new MarkerClusterer(map, markers,
      {ignoreHidden: true,
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

  var heat = [];
  for (var p = 0; p < locations.length; p++) {
    heat.push(new google.maps.LatLng(locations[p].lat, locations[p].lng));
  }
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heat
  });
  heatmap.setMap(map);
}