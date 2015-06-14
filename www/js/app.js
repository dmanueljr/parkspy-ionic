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


parkspy.controller('MapCtrl', function($scope, $http) {

    google.maps.event.addDomListener(window, 'load', function() {

        // variable center set to santa monica city hall
        var center = new google.maps.LatLng(34.011769, -118.49162);

        var mapOptions = {
          center: center,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // gets current position
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // map.setCenter(pos);
        });

        var marker = new google.maps.Marker({
            position: center,
            map: map
        });


        $scope.meters = [];
        $http.get("https://parking.api.smgov.net/meters/", { cache: true })
            .then(function(response){
                $scope.meters = response.data;
                console.log($scope.meters.length);

                for (var i = 0; i < ($scope.meters.length); i++) {
                    // checks valid call for lat lon data
                    // console.log("lat: " + $scope.meters[i].latitude );
                    // console.log("lon: " + $scope.meters[i].longitude);
                    var meterMarkers = new google.maps.Marker({
                        position: new google.maps.LatLng($scope.meters[i].latitude, $scope.meters[i].longitude),
                        map:map
                    });
                };


            });  

        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);


        $scope.map = map;

    });


});











