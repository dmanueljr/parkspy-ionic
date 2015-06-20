// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var parkspy = angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

// adds map controller
parkspy.controller('MapCtrl', function($scope, $http) {

    // runs the following on load
    google.maps.event.addDomListener(window, 'load', function() {

        // variable center set to santa monica city hall
        var center = new google.maps.LatLng(34.011769, -118.49162);

        // defines map style
        var mapStyle = [
              {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                  { "visibility": "on" },
                  { "color": "#808080" },
                  { "weight": 0.1 }
                ]
              }
            ]

        // default map options
        var mapOptions = {
          center: center,
          zoom: 18,
          mapTypeControlOptions: {
              mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'santamonicamap']
          }
        };

        // targets html element where map will be placed
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);

        //applies map style
        var styledMapOptions = {
            name: "Santa Monica Map"
        };
        var SantaMonicaRoadMapType = new google.maps.StyledMapType(mapStyle, styledMapOptions);
        map.mapTypes.set('santamonicamap', SantaMonicaRoadMapType);
        map.setMapTypeId('santamonicamap');

        // adds traffic layer to map
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        // calls map
        $scope.map = map;



        // gets current position
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // map.setCenter(pos);
        });

        // adds test marker to map center => Santa Monica city hall
        var marker = new google.maps.Marker({
            position: center,
            map: map
        });


        // collects and plots parking lots/structures on map
        $scope.lots = [];
        $http.get("https://parking.api.smgov.net/lots/")
            .success(function(data, status, headers, config){
                $scope.lots = data;
                // counts number of lots
                // console.log($scope.lots.length);


                // collects and plots parking lots/structures on map in clusters
                var lotMarkers = [];
                for (var i = 0; i < ($scope.lots.length); i++) {
                    var lotData = $scope.lots[i];
                    var lotImage = 'img/lot-icon.png';
                    var lotPosition = new google.maps.LatLng(lotData.latitude, lotData.longitude);
                    var lotMarker = new google.maps.Marker({
                        position: lotPosition,
                        map: map,
                        icon: lotImage
                    });
                    lotMarkers.push(lotMarker);
                    getLotData(lotData, lotMarker);
                };
                var lotMarkerCluster = new MarkerClusterer(map, lotMarkers);

                //captures lot data and makes them available for display in infowindow when lot marker is clicked
                var lotInfoWindow = new google.maps.InfoWindow();
                function getLotData(lD, lM) {
                    google.maps.event.addListener(lM, 'click', function() {
                        lotInfoWindow.open(map, lM);
                        lotInfoWindow.setContent(
                            "<p>" + "<b>" + lD.name + "</b>" + "<br />" 
                            + "Spaces: " + lD.available_spaces + "</p>"
                        );
                    });
                };
            });


        // collects and plots parking meters on map
        $scope.meters = [];
        $http.get("https://parking.api.smgov.net/meters/")
            .success(function(data, status, headers, config){
                $scope.meters = data;                
                // counts number of meters
                // console.log($scope.meters.length);


                // collects and plots parking meters on map
                var meterMarkers = [];
                for (var i = 0; i < ($scope.meters.length); i++) {
                    var meterData = $scope.meters[i];

                    //checks meter status for correct icon
                    var getIcon = function() {
                        if (meterData.active == true) {
                            return "img/meter-icon.png";
                        } else {
                            return "img/broken-meter-icon.png";
                        };
                    };

                    var meterData = $scope.meters[i];
                    var meterPosition = new google.maps.LatLng(meterData.latitude, meterData.longitude)
                    var meterMarker = new google.maps.Marker({
                        position: meterPosition,
                        map: map,
                    });
                    meterMarker.setIcon(getIcon());
                    meterMarkers.push(meterMarker);
                    getMeterData(meterData, meterMarker);
                    // getMeterSession(meterData);
                };
                var meterMarkerCluster = new MarkerClusterer(map, meterMarkers);

                //captures meter data and makes them available for display in infowindow when meter marker is clicked
                var meterInfoWindow = new google.maps.InfoWindow();
                function getMeterData(mD, mM) {

                    //captures meter status
                    var getMeterStatus = function() {
                        if (mD.active == true ) {
                            return "Status: Working";
                        } else {
                            return "Status: Not available or out of service";
                        };

                    };


                    google.maps.event.addListener(mM, 'click', function() {

                        //captures meter session
                        $scope.meterSession = [];
                        $http.get("https://parking.api.smgov.net/meters/" + mD.meter_id + "/events/since/0")
                            .success(function(data, status, headers, config) {
                                $scope.meterSession = data;
                                // console.log($scope.meterSession)

                                //gets meter session detail
                                var getSessionDetail = function() {
                                    var sessionDetail = $scope.meterSession;
                                    // console.log(sessionDetail);

                                    if ((sessionDetail.length > 0) && (sessionDetail[0].event_type == "SS")) {
                                        return "Availability: Occupied";
                                    } else if ((sessionDetail.length > 0) && (sessionDetail[0].event_type == "SE")) {
                                        return "Availability: Vacant, but not for long!";
                                    } else {
                                        return "Availability: Sorry, no details available."
                                    };
                                };                         

                                //info window pops up on click
                                meterInfoWindow.open(map, mM);
                                meterInfoWindow.setContent(
                                    "<p>" + "ID: " + "<b>" + mD.meter_id + "</b>" + "<br />"
                                    + "<p>" + "Street: " + "<b>" + mD.street_address + "</b>" + "<br />"
                                    + getMeterStatus() + "<br />"
                                    + getSessionDetail()
                                );
                            });
                    });
                };
            }); 



    });


});



// sample meter activity call (replace with valid time - within the last three hours) 
//     => https://parking.api.smgov.net/meters/05S1442/events/since/20150618T193020Z







