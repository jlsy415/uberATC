//global variables
var map;
var all_overlays = [];
var locations = [];
var markers;
var markerCluster;


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(40.7128,-74.0059),
  });

  // import geojson data through script and callbacks
  var script = document.createElement('script');
  script.src = 'dataa.geojson';
  document.getElementsByTagName('head')[0].appendChild(script);

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

    google.maps.event.addListener(polygon, 'click', function() {
      for (var i = 0; i < all_overlays.length; i++) {
        all_overlays[i].setEditable(false);
      }
      polygon.setEditable(true);
    });

    for (var i = 0; i < all_overlays.length; i++) {
      all_overlays[i].setEditable(false);
    }
    polygon.setEditable(true);

    markerCluster.clearMarkers();

    //selects for points within selection
    var tempLocations = [];
    for (var i = 0; i < all_overlays.length; i++) {
      for (var j = 0; j < locations.length; j++) {
        var curPosition = new google.maps.LatLng(locations[j].lat, locations[j].lng);
        if (google.maps.geometry.poly.containsLocation(curPosition, all_overlays[i])) {
          tempLocations.push(locations[j]);
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
}