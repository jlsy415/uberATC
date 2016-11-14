//global variables
const new_york = {lat: 40.7128, lng: -74.0059};
var map, heatmap, markers, markerCluster;
var all_overlays = []; //list of drawn polygons
var locations = []; //list of locations to be displayed
var selectedPolygon; 
var stateOfHeatMap = true; //whether heat map is toggled on or off
var newShape;

//function to update heat map and clustering
function updateHeatCluster(listOfLocations) {
  //updating markers
  markers = [];
  markers = listOfLocations.map(function(location, i) {
    var placeholder = new google.maps.Marker({
      position: location,
    });
    placeholder.setVisible(false); //markers invisible, only show clusters
    return placeholder;
  });

  //updating clusters
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

  //keep heatmap state same as before
  if (stateOfHeatMap) {
    heatmap.setMap(map);
  } else {
    heatmap.setMap(null);
  }
}

//update map to filtered data within drawn shape
function updateFilter() {
  editableLocations = locations.slice(0); //defensive copying
  var tempLocations = [];
  if (all_overlays.length == 0) { //when there are no drawn polygons
    tempLocations = locations;
  } else { //creates new list of locations to updateHeatCluster
    for (var i = 0; i < all_overlays.length; i++) {
      for (var j = 0; j < editableLocations.length; j++) {
        var curPosition = new google.maps.LatLng(editableLocations[j].lat, editableLocations[j].lng);
        if (google.maps.geometry.poly.containsLocation(curPosition, all_overlays[i]) || google.maps.geometry.poly.isLocationOnEdge(curPosition, all_overlays[i])) {
          tempLocations.push(editableLocations[j]);
          editableLocations.splice(j,1);
        }
      }
    }
  }
  updateHeatCluster(tempLocations);
}

//selects a drawn polygon by clicking on it
function select(polygon) {
  for (var i = 0; i < all_overlays.length;i++) {
    all_overlays[i].setEditable(false);
  }
  polygon.setEditable(true);
  selectedPolygon = polygon;
}

//buttons for control
function CenterControl(controlDiv, map) { //centers map
  //CSS for the control border
  var centerMap = document.createElement('div');
  centerMap.style.backgroundColor = '#fff';
  centerMap.style.border = '2px solid #fff';
  centerMap.style.borderRadius = '3px';
  centerMap.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  centerMap.style.cursor = 'pointer';
  centerMap.style.marginBottom = '22px';
  centerMap.style.textAlign = 'center';
  centerMap.title = 'Click to recenter the map';
  controlDiv.appendChild(centerMap);

  //CSS for  control interior
  var centerText = document.createElement('div');
  centerText.style.color = 'rgb(25,25,25)';
  centerText.style.fontFamily = 'Roboto,Arial,sans-serif';
  centerText.style.fontSize = '16px';
  centerText.style.lineHeight = '38px';
  centerText.style.paddingLeft = '5px';
  centerText.style.paddingRight = '5px';
  centerText.innerHTML = 'Center Map';
  centerMap.appendChild(centerText);

  var toggleHeat = document.createElement('div');
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

  var deleteSelected = document.createElement('div');
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


  //button functions
  centerMap.addEventListener('click', function() {
    map.setCenter(new_york);
  });

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

  //position three buttons in bottom center of map
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(toggleHeat);
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerMap);
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(deleteSelected);
}

//initializes map 
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: new_york,
  });

  // import geojson data through script and callbacks
  var script = document.createElement('script');
  script.src = 'dataa.geojson';
  document.getElementsByTagName('head')[0].appendChild(script);

  //center map button to new york
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map);

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

    oldPolygon = selectedPolygon;

    google.maps.event.addListener(selectedPolygon.getPath(), 'set_at', function() {
      console.log(all_overlays.length);
      all_overlays.splice(all_overlays.indexOf(oldPolygon),1);
      console.log(all_overlays.length);
      all_overlays.push(selectedPolygon);
      console.log(all_overlays.length);
      updateFilter();
    });

    google.maps.event.addListener(selectedPolygon.getPath(), 'insert_at', function() {
      console.log(all_overlays.length);
      all_overlays.splice(all_overlays.indexOf(oldPolygon),1);
      console.log(all_overlays.length);
      all_overlays.push(selectedPolygon);
      console.log(all_overlays.length);
      updateFilter();
    });

    updateFilter();
  });
};

//callback function called from script importing geojson within initMap
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

  //creates heat map
  var heat = [];
  for (var p = 0; p < locations.length; p++) {
    heat.push(new google.maps.LatLng(locations[p].lat, locations[p].lng));
  }
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heat
  });
  heatmap.setMap(map);
}
