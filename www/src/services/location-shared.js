// Passive service - not declared as a module at the App level, but 'snuck in' at the code level to prevent having to include it unless necessary
angular.module('com.larcity.locationSvc',[])
.factory('$locationService', [ '$http', '$extensionService', function( $http, ex ) {
     ex.log("[modules.service.location]");
     var tasks = {
         FETCHING_LOCATION: null
     };
     return {
         setCallback: function(cb) {
             if(angular.isFunction(cb)) {
                this.callback = cb;
             }
         },
         setErrorCallback: function(cb) {
             if(angular.isFunction(cb)) {
                 this.abortExec = cb;
             }
         },
        capturePosition: function(position) {
            var me =this;
            ex.log(position);
            me.callback(position);
            me.endExec();
        },
        callback: function(position) {},
        beforeExec: function() {},
        endExec: function() {},
        abortExec: function() {},
        get: function( callback, errorCb ) {
            var me=this;
            if(!angular.isFunction(callback)) {
                callback = me.capturePosition;
            }
            if(angular.isFunction(errorCb)) {
                errorCb = me.handleError;
            }
            tasks.FETCHING_LOCATION = setTimeout(function() {
                if (navigator.geolocation) {
                    me.beforeExec();
                    navigator.geolocation.getCurrentPosition(callback, errorCb);
                } else {
                    ex.log("Geolocation is not supported by this browser.");
                }
            }, 500);
        },
        handleError: function(error) {
            var me=this;
            switch(error.code) 
              {
              case error.PERMISSION_DENIED:
                ex.log("User denied the request for Geolocation.");
                break;
              case error.POSITION_UNAVAILABLE:
                ex.log("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                ex.log("The request to get user location timed out.");
                break;
              case error.UNKNOWN_ERROR:
                ex.log("An unknown error occurred.");
                break;
              }
              me.abortExec();
        },
        setCallback: function(callback) {
            var me = this;
            if(angular.isFunction(callback)) {
                this.callback = callback;
            }
        }
     };
     
}]);
