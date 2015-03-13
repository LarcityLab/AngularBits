/** Requires
 * JQuery
 * MomentJS
 */
angular.module('wiap.globaliz',[])
.factory('globalizationService',['$http','$rootScope','extendService','contextService','$filter',
function($http,$rt,ex,context,$filter) {
    
    ex.log("[module.service.wiap.globaliz");
    
    $rt.zeroPreFill = function( num, places ) {
        if(angular.isNumber(num)) {
            var diff = places-num.toString().length;
            for(var i=diff;i>0;i--) {
                num = "0"+num;
            }
        }
        return num;
    };
    
    $rt.formatAsTZTime = function( sec ) {
        sec = parseInt(sec);
        var min = Math.floor(sec/60);
        var sec = sec%60;
        var hr = Math.floor(min/60);
        var min = min%60;
        var sign = sec > 0 ? "+" : "-";
        return sign+$rt.zeroPreFill(hr,2)+":"+$rt.zeroPreFill(min,2);
    };
    // get timezones
    var today = new Date();
    var range = [moment(today).format("Z")];
    var offset = today.getTimezoneOffset()*60;
    Array.prototype.push.apply(range, [$rt.formatAsTZTime(offset+3600),$rt.formatAsTZTime(offset-3600)]);
          
    return {
        getTZ: function() {
            return range[0];
        },
        guessTZ: function() {
            return range;
        },
        lookupTZ: function( query, callback ) {
            var rq = {
                url: context.wiap_link('api/1.1/tz/search?') + $.param({
                    term: (query ? query : range)
                }),
                method: 'GET'
            };
            $http(rq)
                    .success(function(data) {
                        if(angular.isFunction(callback)) {
                            callback.apply(null, arguments);
                        }
                    })
                    .error(function() {
                        ex.log("globalizationService failed to lookup possible timezones");
                        if(angular.isFunction(callback)) {
                            callback.apply(null, arguments);
                        }
                    });
        },
        myTZ: function( cfg ) {
            // get auth user's timezone
            var config = {
                success: false,
                error: false
            };
            angular.extend(config,cfg);
            var rq = {
                //url: context.wiap_link('api/tz'),
                url: context.api_link('user/timezone'),
                method: 'GET',
                headers: {
                    Authorization: "Bearer "+$rt.User.Authorization.access_token
                }
            };
            ex.log(rq, 'GETting user timezone');
            $http(rq)
                    .success(function() {
                        ex.log(arguments, 'globalizationService::TZ RESP');
                        if(angular.isFunction(config.success)) {
                            config.success.apply(null, arguments);
                        }
                    })
                    .error(function() {
                        ex.log(arguments, 'globalizationService::TZ ERR');
                        if(angular.isFunction(config.error)) {
                            config.error.apply(null, arguments);
                        }
                    });
        },
        timeDiffChart: {
            h: 60*60*1000,
            d: 24*60*60*1000,
            w: 7*24*60*60*1000
            // month will use dayofmonth to calculate
            // year will use dayofyear to calculate
        },
        //daysOfWeekFull: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        daysOfWeekFull: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], // ISO week date
        daysOfWeek: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        zones: [
                {
                    key: "-12:00",
                    label: "International Date Line West",
                    code: 1
                },
                {
                    key: "-11:00",
                    label: "Coordinated Universal Time",
                    code: 2
                },
                {
                    key: "-10:00",
                    label: "Hawaii",
                    code: 3
                },
                {
                    key: "00:00",
                    label: "Coordinated Universal Time",
                    code: 35
                },
                {
                    key: "-08:00",
                    label: "Pacific Time (US & Canada)",
                    code: 6
                },
                {
                    key: "-07:00",
                    label: "Mountain Time US & Canada",
                    code: 9
                },
                {
                    key: "-06:00",
                    label: "Central Time US & Canada",
                    code: 10
                },
                {
                    key: "-05:00",
                    label: "Eastern Time US & Canada",
                    code: 15 
                },
                {
                    key: "+01:00",
                    label: "West Central Africa",
                    code: 42
                },
                {
                    key: "-04:00",
                    label: "Atlantic Time (Canada)",
                    code: 19
                }
        ],
        backToLocalTime: function( time, asdate ) {
            var today = new Date();
            var offset_m = today.getTimezoneOffset();
            var offset_ms = offset_m * 60 * 1000 * -1;
            return asdate ? new Date(time + offset_ms) : time + offset_ms;
        },
        getAddToCalZone: function( asObject ) {
            var zones = this.zones;
            /** @TODO get zone from database entered by user as user's timezone **/
            var myZoneKey = moment(new Date()).format("Z");
            //ex.log("Zone Key: ", myZoneKey);
            var matchingZones = $filter('filter')(zones, { key: ""+myZoneKey }, function(exp, actual) {
                //ex.log(angular.equals(actual,exp), exp + " = " + actual + "?");
                return angular.equals(actual,exp);
            });
            if(asObject) {
                if(matchingZones.length>0) {
                    return matchingZones[0];
                } else {
                    // default to universal time
                    var defaultZoneMatch = $filter('filter')(zones, { code: 35 }, function(exp, actual) {
                        return angular.equals(actual,exp);
                    });
                    return defaultZoneMatch[0];
                };
            } else {
                if(matchingZones.length>0) {
                    return matchingZones[0].code;
                } else {
                    // default to universal time
                    return 35;
                };
            }
        }
    };
}]);