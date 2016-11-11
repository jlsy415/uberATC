//global variables
var map, heatmap;
const new_york = {lat: 40.7128, lng: -74.0059}
var all_overlays = [];
var locations = [];
var markers;
var markerCluster;
var toggleHeat;
var deleteSelected;
var selectedPolygon;
var stateOfHeatMap = true;

function updateHeatCluster(listOfLocations) {
  //updating cluster
  markers = [];
  markers = listOfLocations.map(function(location, i) {
    var placeholder = new google.maps.Marker({
      position: location,
    });
    placeholder.setVisible(false);
    return placeholder;
  });
  markerCluster.clearMarkers();
  markerCluster = new MarkerClusterer(map, markers,
    {ignoreHidden: true,
      imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  markerCluster.redraw();

  //updating heatmap
  var heat = [];
  for (var p = 0; p < listOfLocations.length; p++) {
    heat.push(new google.maps.LatLng(listOfLocations[p].lat, listOfLocations[p].lng));
  }

  heatmap.setMap(null);
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heat
  });
  if (stateOfHeatMap) {
    heatmap.setMap(map);
  } else {
    heatmap.setMap(null);
  }
  
}


function updateFilter() {
  var tempLocations = [];
  if (all_overlays.length == 0) {
    tempLocations = locations;
    
  } else {
    for (var i = 0; i < all_overlays.length; i++) {
      for (var j = 0; j < locations.length; j++) {
        var curPosition = new google.maps.LatLng(locations[j].lat, locations[j].lng);
        if (google.maps.geometry.poly.containsLocation(curPosition, all_overlays[i])) {
          tempLocations.push(locations[j]);
        }
      }
    }
  }
  updateHeatCluster(tempLocations);
}

function select(polygon) {
  for (var i = 0; i < all_overlays.length;i++) {
    all_overlays[i].setEditable(false);
  }
  polygon.setEditable(true);
  selectedPolygon = polygon;
}

//buttons for control
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

  toggleHeat = document.createElement('div');
  toggleHeat.style.backgroundColor = '#fff';
  toggleHeat.style.border = '2px solid #fff';
  toggleHeat.style.borderRadius = '3px';
  toggleHeat.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  toggleHeat.style.cursor = 'pointer';
  toggleHeat.style.marginBottom = '22px';
  toggleHeat.style.textAlign = 'center';
  controlDiv.appendChild(toggleHeat);

  var toggleText = document.createElement('div');
  toggleText.style.color = 'rgb(25,25,25)';
  toggleText.style.fontFamily = 'Roboto,Arial,sans-serif';
  toggleText.style.fontSize = '16px';
  toggleText.style.lineHeight = '38px';
  toggleText.style.paddingLeft = '5px';
  toggleText.style.paddingRight = '5px';
  toggleText.innerHTML = 'Toggle heatmap';
  toggleHeat.appendChild(toggleText);

  deleteSelected = document.createElement('div');
  deleteSelected.style.backgroundColor = '#fff';
  deleteSelected.style.border = '2px solid #fff';
  deleteSelected.style.borderRadius = '3px';
  deleteSelected.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  deleteSelected.style.cursor = 'pointer';
  deleteSelected.style.marginBottom = '22px';
  deleteSelected.style.textAlign = 'center';
  controlDiv.appendChild(deleteSelected);

  var delText = document.createElement('div');
  delText.style.color = 'rgb(25,25,25)';
  delText.style.fontFamily = 'Roboto,Arial,sans-serif';
  delText.style.fontSize = '16px';
  delText.style.lineHeight = '38px';
  delText.style.paddingLeft = '5px';
  delText.style.paddingRight = '5px';
  delText.innerHTML = 'Delete Selected Polygon';
  deleteSelected.appendChild(delText);

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
       editable: true
    }
  });
  drawingManager.setMap(map);

  //event listeners for selecting and editing drawn polygons
  google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
    all_overlays.push(polygon);
    drawingManager.setDrawingMode(null);
    select(polygon);

    google.maps.event.addListener(polygon, 'click', function() {
      select(polygon);
    });

    updateFilter();
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
  stateOfHeatMap = true;
  toggleHeat.onclick = function() {
    heatmap.setMap(heatmap.getMap() ? null : map);
    stateOfHeatMap = !stateOfHeatMap;
  }
  deleteSelected.onclick = function() {
    all_overlays.splice(all_overlays.indexOf(selectedPolygon),1);
    selectedPolygon.setMap(null);
    selectedPolygon = null;
    updateFilter();
  }

}
