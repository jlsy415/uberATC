# UberATC
Visit https://andytsai08.github.io/uberATC/ for the app.

![alt tag](https://github.com/andytsai08/uberATC/blob/master/uberATC.gif)

Data Visualization for Uber pickup data for UberATC. Use the drawing manager on the top center of the page to draw arbitrary shapes on the map, and marker clusters and the heatmap will be filtered accordingly. Drawn polygons can be deleted, and the heat map can be toggled, using the control buttons at the top of the page. 

#Design Decisions

Given the size of the datasets, a sample of 5,000 pickup points were randomly selected for data visualization. We have no reason to assume that the sample isn't representative of the rest of the data. Data from April to September 2014 are processed in R to produce a conglomerate dataset of pickup and dropoff points (dataset included as final_dataset.csv). A smaller dataset of 5000 points was generated (dataset included as final_dataset.csv) and converted to GeoJSON (dataa.geojon) via an online csv-to-geojson converter such as Ogre. 

Google Maps was the web API of choice. Though Leaflet.js also has well-developed libraries for heat maps, drawing, and clustering, Google Maps has a poly.containsLocation() method that allows for combining drawing with filtering, a required feature of the assignment. This method would have to be manually written in Leaflet, requiring more time. In addition, the Google's infrastructure guarentees that maps will load quickly.The tradeoff is that Leaflet is a considerably smaller package, which makes it more mobile-friendly compared to Google Maps.

Google Maps drawing manager was used to allow for drawing of multiple polygons on the map. Google Maps Marker Clusterer was used to cluster the 5,000 points. Drawn polygons filter the marker cluster display to just points within the polygon.

#Next Steps
Given more time, a map container not taking up the whole page would be used, and a display panel would be used to display useful statistical information about the points. 

A bigger overhaul of the app would be to represent pairs of points as an line geometry in geojson, and having lines in geojson can allow for features such as most popular route, filtering routes by drawn shape, etc. To consider for the fact that cars have to abide by roads and that paths are rarely directly heading towards each other, the Google Maps Directions API, specifically the Waypoints, would have to be used to derive the distance and path of the car ride.

With the Google Maps Traffic API, the speed limits of the roads of routes can be implemented in the display of polylines, perhaps coloring them red for passing through slow places and green for fast.
