# uberATC
Data Visualization for UberATC data

#Design Decisions

Given that there are a lot of data points, only 5,000 points, randomly selected out of all points within the allowed dataset. 

Google Maps was the web API of choice. Though Leaflet and Google Maps are two of the best map APIs with well-developed environments such as libraries for heat maps and clustering, Google Maps API guarentees that maps will load quickly, given Google's infrastructure. It is also easier to use and has support for many of the features to be implemented. Notably, the Google Maps API has a poly.containsLocation() method that allows for combining drawing with filtering, a feature that is still not very well supported with current Leaflet plug-ins.



#Next Steps
Given more time, a heatmap would have been implemented with Google Maps' visualization library. In addition, the drawn polygons would have been made to be editable (sides and endpoints be made modified, with the filtered marker clusters responding to the changing polygon). A map container not taking up the whole page would be used, and a display panel would be used to display useful statistical information about the points. 

A bigger overhaul of the app would mean to represent pairs of points as an line geometry in geojson, and having lines in geojson can allow for features such as most popular route, filtering routes by drawn shape, etc.
