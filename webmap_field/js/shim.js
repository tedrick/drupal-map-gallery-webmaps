/*globals require, window, */
function shim(map) {
    "use strict";
    console.log(window.location.href);
    if (document.title.search('raining') >= 0) {
        var dataURL;
        
        //This should be a customized option
        if (window.location.host !== 'localhost') {
            dataURL =  '//' + window.location.host + '/drupal/training-centers.json';
        } else {
            dataURL = '//ec2-54-235-61-117.compute-1.amazonaws.com/drupal/training-centers.json';
        }
        console.log(map);
    
        require(['esri/request',"esri/dijit/Geocoder"], function (esriRequest, Geocoder) {
            var getData, geocoder;
            
            getData = esriRequest({url: dataURL, handleAs: 'json'});
            getData.then(onTrainingData);
            
            geocoder = new Geocoder({map:map, autoComplete:true, minCharacters:5},"esriWebMapGeocoder")
            geocoder.startup();
        });
    }

    function onTrainingData(response) {
        var items;
    
        require(['dojo/_base/array', 'esri/graphic', 'esri/layers/GraphicsLayer', 'esri/symbols/PictureMarkerSymbol', 'esri/InfoTemplate', 'esri/geometry/Point', 'esri/geometry/Extent'], function (array, Graphic, GraphicsLayer, PictureMarkerSymbol, InfoTemplate, Point, Extent) {
            var pointLayer, symbol, infoTemplate, fLayer, layerDef, extent, minX = 180, maxX = -180, minY = 90, maxY = -90;
        
            //How the points will look -> using a PNG graphic
            var iconURL = 'http://dl.dropboxusercontent.com/s/kcn8gkf3m3vm97t/computers.png';
            symbol = new PictureMarkerSymbol(iconURL, 32, 37);
            //Pop-up box format
            infoTemplate = new InfoTemplate('${Title}', '${Body}<br>${Address}');
            
            //Create a GraphicsLayer to hold all the points together
            pointLayer = new GraphicsLayer();
            
            //Make a Point for each item
            array.forEach(response, function (item, index) {
                var thisGraphic, thisPoint;
                //Note that the Body data item has a trailing newline.  
                //Wouldn't affect the pop-up, but I'd still like to clean it up.
                item.Body = item.Body.trim();
                
                //Also note that Latitude & Longitude are coming in as strings.
                //Convert to Number
                item.Longitude = Number(item.Longitude);
                item.Latitude = Number(item.Latitude);
                
                
                //Take the longitude (x) and latitude (y) and make a point
                thisPoint = new Point(item.Longitude, item.Latitude);
                
                
                thisGraphic = new Graphic(thisPoint, symbol, item, infoTemplate);
                pointLayer.add(thisGraphic);
                
                //Calculate the extent
                minX = (item.Longitude < minX) ? item.Longitude : minX;
                maxX = (item.Longitude > maxX) ? item.Longitude : maxX;
                minY = (item.Latitude < minY) ? item.Latitude : minY;
                maxY = (item.Latitude > maxY) ? item.Latitude : maxY;
                
                extent = new Extent(minX,minY,maxX,maxY).expand(1.2);
                map.setExtent(extent);
            });
            //Add the Layer to the map
            map.addLayer(pointLayer);
        });
    }
}
