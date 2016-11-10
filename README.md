# uberATC
Data Visualization for UberATC data

#Design Decisions

Given that there are a lot of data points, 5,000 points were randomly selected out of all points within the allowed dataset for the sake of cleaner clustering UI. This loses some data, but allows for more workable data and friendly UI from the clustering. 

The data points are first cleaned in R (code included) and then converted to GeoJSON via an online csv-to-geojson converter. They were then displayed on a map.

Google Maps was the web API of choice. Though Leaflet and Google Maps are two of the best map APIs with well-developed libraries for heat maps and clustering, Google Maps API guarentees that maps will load quickly, given Google's infrastructure. It is also easier to use and has support for many of the features to be implemented. Notably, the Google Maps API has a poly.containsLocation() method that allows for combining drawing with filtering, a feature that is still not very well supported with current Leaflet plug-ins. The tradeoff is that Leaflet is a considerably smaller package, which makes it more mobile-friendly compared to Google Maps.

Google Maps drawing manager was used to allow for drawing of multiple polygons on the map. Google Maps Marker Clusterer was used to cluster the 5,000 points. Drawn polygons filter the marker cluster display to just points within the polygon.

#Next Steps
Given more time, a heatmap would have been implemented with Google Maps' visualization library. In addition, the drawn polygons would have been made to be editable (sides and endpoints be made modified, with the filtered marker clusters responding to the changing polygon). A map container not taking up the whole page would be used, and a display panel would be used to display useful statistical information about the points. 

A bigger overhaul of the app would mean to represent pairs of points as an line geometry in geojson, and having lines in geojson can allow for features such as most popular route, filtering routes by drawn shape, etc. To consider for the fact that cars have to abide by roads and that paths are rarely directly heading towards each other, the Google Maps Directions API, specifically the Waypoints, would have to be used to derive the distance and path of the car ride.

With the Google Maps Traffic API, the speed limits of the roads of routes can be implemented in the display of polylines, perhaps coloring them red for passing through slow places and green for fast.
