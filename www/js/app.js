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

        // default map options
        var mapOptions = {
          center: center,
          zoom: 18,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // targets html element where map will be placed
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);

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

        // collects and plots parking meters on map
        $scope.meters = [];
        $http.get("https://parking.api.smgov.net/meters/")
            .success(function(data, status, headers, config){
                $scope.meters = data;

                $scope.meterSession = [];
                $http.get("https://parking.api.smgov.net/meters/events/").success(function(data, status, headers, config) {
                    $scope.meterSession = data;
                    console.log($scope.meterSession.length)
                });


                // counts number of meters
                // console.log($scope.meters.length);

                // collects and plots parking meters on map
                for (var i = 0; i < ($scope.meters.length); i++) {
                    // checks valid call for lat lon data
                    // console.log("lat: " + $scope.meters[i].latitude );
                    // console.log("lon: " + $scope.meters[i].longitude);
                    var meterData = $scope.meters[i];
                    var getValidIcon = function() {
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
                    meterMarker.setIcon(getValidIcon());
                    getMeterData(meterData, meterMarker);
                };


                //captures meter data and makes them available for display in infowindow when meter marker is clicked
                var meterInfoWindow = new google.maps.InfoWindow();
                function getMeterData(mD, mM) {

                    // var convertedDate = function() {
                    //     var date = new Date();
                    //     var newDate = date.toISOString().replace(/[^0-9TZ.]/g, '').replace(/\.\d+/, '');
                    //     return newDate;
                    // }

                    // var getSession = function() {
                    //     if ($scope.meterSession) {
                    //         return
                    //     }
                    // }

                    var getMeterStatus = function () {
                        if (mD.active == true ) {
                            return "Status: Working";
                        } else {
                            return "Status: Out of service";
                        };

                    };


                    google.maps.event.addListener(mM, 'click', function() {
                        meterInfoWindow.open(map, mM);
                        meterInfoWindow.setContent(
                            "<p>" + "ID: " + "<b>" + mD.meter_id + "</b>" + "<br />"
                            + "<p>" + "Street: " + "<b>" + mD.street_address + "</b>" + "<br />"
                            + getMeterStatus()
                        );
                    });
                };
            }); 


        // collects and plots parking lots/structures on map
        $scope.lots = [];
        $http.get("https://parking.api.smgov.net/lots/")
            .success(function(data, status, headers, config){
                $scope.lots = data;
                // counts number of lots
                // console.log($scope.lots.length);


                // collects and plots parking lots/structures on map
                for (var i = 0; i < ($scope.lots.length); i++) {
                    // checks valid call for lat lon data
                    // console.log("lat: " + $scope.meters[i].latitude );
                    // console.log("lon: " + $scope.meters[i].longitude);

                    var lotData = $scope.lots[i];
                    var lotImage = 'img/lot-icon.png';
                    var lotPosition = new google.maps.LatLng(lotData.latitude, lotData.longitude);
                    var lotMarker = new google.maps.Marker({
                        position: lotPosition,
                        map: map,
                        icon: lotImage
                    });
                    getLotData(lotData, lotMarker);
                };

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

        // adds traffic layer to map
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        // calls map
        $scope.map = map;

    });


});



// sample meter activity call (replace with valid time - within the last three hours) 
//     => https://parking.api.smgov.net/meters/05S1442/events/since/20150618T193020Z







