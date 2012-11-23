(function (undefined) {

	SAPIHackBuild = {
		key: "58y9pqf9w8zbrh5rjxj5d7k8",
		mapstraction: new mxn.Mapstraction('map_canvas','googlev3'),
		onDeviceReady: function() {
			var _self = SAPIHackBuild;
			$('#search-form').on('submit',_self.searchNearby);
			$('#map_canvas').css("height",$('#map_canvas').parent().height()+"px");
			_self.mapstraction.addControls({
        pan: false,
        zoom: false,
        map_type: false
      });
      window.setTimeout(function(){
				_self.whereAmI(function(lat,lon){
					var point = new mxn.LatLonPoint(lat,lon);
					_self.mapstraction.setCenterAndZoom(point,16);
				});
			},300); // WHY ?!?
		},
		searchNearby: function(e) {
			e.preventDefault();
			var _self = SAPIHackBuild;
			$(e.target).find('input').blur();
			_self.whereAmI(function(lat,lon){
				var query = window.encodeURIComponent($('#search-text').val());
				var sensisEndpoint = "http://api.sensis.com.au/ob-20110511/test/search?radius=1&location="+lat+","+lon;
				var url = sensisEndpoint + "&key=" + SAPIHackBuild.key + "&query=" + query + "&cachebuster=" + new Date().getTime();
				_self.mapstraction.removeAllMarkers();
				$.getJSON(url,function(response){
					if (response.results && response.results.length > 0) {
            $.each(response.results,function(index, result){
							var lat2 = result.primaryAddress.latitude || 0;
							var lon2 = result.primaryAddress.longitude || 0;
							if (lat2 && lon2) {
								var loc = new mxn.LatLonPoint(lat2,lon2);
								var marker = new mxn.Marker(loc);
								_self.mapstraction.addMarkerWithData(marker,loc);
							}
						});
						_self.mapstraction.declutterMarkers();
            _self.mapstraction.autoCenterAndZoom();
            if (_self.mapstraction.getZoom() > 16) _self.mapstraction.setZoom(16);
					}
          else {
            var point = new mxn.LatLonPoint(lat,lon);
            _self.mapstraction.setCenterAndZoom(point,16);
            navigator.notification.alert(
              "No results found",
              null,
              'Search',
              'OK'
            );
          }
				});
			});
		},
		whereAmI: function(next) {
			var positionSuccess = function(position) {
				var lat = position.coords.latitude,
						lon = position.coords.longitude;
				next(lat,lon);
			};
			var positionError = function(error) {
        SAPIHackBuild.geoFailure(error);
      };
      navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
		},
		geoFailure: function(error){
      switch(error.code) {
        case PositionError.PERMISSION_DENIED:
          navigator.notification.alert(
            this.errorStrings.PERMISSION_DENIED,
            null,
            'Location Error',
            'OK'
          );
          break;
      
        case PositionError.POSITION_UNAVAILABLE:
          navigator.notification.alert(
            this.errorStrings.POSITION_UNAVAILABLE,
            null,
            'Location Error',
            'OK'
          );
          break;
      
        case PositionError.TIMEOUT:
          navigator.notification.alert(
            this.errorStrings.TIMEOUT,
            null,
            'Location Error',
            'OK'
          );
          break;
      
        default:
          navigator.notification.alert(
            this.errorStrings.DEFAULT,
            null,
            'Location Error',
            'OK'
          );
      }
    },
    errorStrings: {
      PERMISSION_DENIED:
        "Since this app requires your location, please enable location services" +
        " for this app in your phone's settings.",
      POSITION_UNAVAILABLE:
        "Current position is unavailable." +
        " Since this app requires your location, please ensure location services" +
        " are enabled for your app in the phone's settings.",
      TIMEOUT:
        "Sorry, retrieving your position timed out." +
        " Since this app requires your location, please ensure location services" +
        " are enabled for this app in your phone's settings.",
      DEFAULT:
        "Sorry, not sure what went wrong." +
        " Since this app requires your location, perhaps try again later?"
    }
	};

	document.addEventListener("deviceready", SAPIHackBuild.onDeviceReady, false);

})();
