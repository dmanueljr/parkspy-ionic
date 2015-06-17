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
        $http.get("https://parking.api.smgov.net/meters/", { cache: true })
            .then(function(response){
                $scope.meters = response.data;
                // counts number of meters
                // console.log($scope.meters.length);

                for (var i = 0; i < ($scope.meters.length); i++) {
                    // checks valid call for lat lon data
                    // console.log("lat: " + $scope.meters[i].latitude );
                    // console.log("lon: " + $scope.meters[i].longitude);

                    var meterImage = 'img/meter-icon.png';
                    var meterMarker = new google.maps.Marker({
                        position: new google.maps.LatLng($scope.meters[i].latitude, $scope.meters[i].longitude),
                        map: map,
                        icon: meterImage
                    });

                    var meterInfoWindow = new google.maps.InfoWindow();
                    meterInfoWindow.setContent("This is my ID: " + String($scope.meters[i].meter_id))                    
                    google.maps.event.addListener(meterMarker, 'click', function() {
                          meterInfoWindow.open(map, this);
                    });

                };
            }); 

        // collects and plots parking lots/structures on map
        $scope.lots = [];
        $http.get("https://parking.api.smgov.net/lots/", { cache: true })
            .then(function(response){
                $scope.lots = response.data;
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
                function getLotData(lD, lM) {
                    var lotInfoWindow = new google.maps.InfoWindow();
                    // console.log($scope.lots[i].id);                                         
                    google.maps.event.addListener(lM, 'click', function() {
                          lotInfoWindow.open(map, lM);
                          lotInfoWindow.setContent("This is my ID: " + String(lD.id));
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











