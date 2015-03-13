angular.module('com.larcity.twitterSvc', [])
.factory('$twitterService', [ '$http', '$rootScope', '$extensionService', '$contextService' , function( $http, $rt , ex, context ) {

    ex.log("[module.service.wiap.twitter]");
    
    // var EP = "https://api.twitter.com/";
    
    return {
        getStatusFeed: function( c ){
            var cfg = {
                params: null, success: null, error: null, complete: null
            };
            if( c ) {
                cfg = angular.extend(cfg,c);
            }
            var rq = {
                url: context.app_link('api/twitter/status_feed/' + cfg.account_name),
                method: 'POST',
                data: cfg.params
            };
            $http(rq)
                    .success(function() {
                        ex.log(arguments, 'Twitter statuses resp');
                        if(angular.isFunction(cfg.sucess)) {
                            cfg.success.apply(null, arguments);
                        }
                        if(angular.isFunction(cfg.complete)) {
                            cfg.complete();
                        }   
                    })
                    .error(function() {
                        ex.log(arguments, 'Twitter statuses ERR resp');
                        if(angular.isFunction(cfg.error)) {
                            cfg.error.apply(null, arguments);
                        }   
                        if(angular.isFunction(cfg.complete)) {
                            cfg.complete();
                        }   
                    });
        },
        // broken - intended to leverage xAuth on the server side
        connect: function( c ) {
            var cfg = {
                params: null, success: null, error: null, complete: null
            };
            if( c ) {
                cfg = angular.extend(cfg,c);
            }
            var rq = {
                url: context.app_link('api/twitter/auth_url'),
                method: 'POST',
                data: cfg.params
            };
            ex.log(rq, 'Twitter Auth request');
            $http(rq)
                    .success(function() {
                        ex.log(arguments, 'Twitter auth resp');
                        if(angular.isFunction(cfg.sucess)) {
                            cfg.success.apply(null, arguments);
                        }
                        if(angular.isFunction(cfg.complete)) {
                            cfg.complete();
                        }   
                    })
                    .error(function() {
                        ex.log(arguments, 'Twitter auth ERR resp');
                        if(angular.isFunction(cfg.error)) {
                            cfg.error.apply(null, arguments);
                        }   
                        if(angular.isFunction(cfg.complete)) {
                            cfg.complete();
                        }   
                    });
        }
    };

} ]);

angular.module('twitterController', [])
.controller('TwitterCtrl', [ '$http', '$scope', '$rootScope', 'extendService', 'twitterService', 
function( $http, $scope, $rt, ex, tws ) {
    
    $scope.params = {};
    
    $scope.errors = {};
        
    $scope.templates = {
        twitterauth: {
            name: 'twitterauth',
            url: context.base_url('assets/ng/templates/twitterauth.html')
        }
    };
    
    $rt.$on('startTwitterConnect', function() {
        tws.connect({
            params: $scope.params,
            success: function() {
                ex.log(arguments, 'tw.connect resp');
            },
            error: function( data ) {
                ex.log(arguments, 'tw.connect ERR resp');
            },
            complete: function() {
                $scope.LOGGING_IN = false;
            }
        });
        /*
        $('#TwitterAuthDialog').modal({
            show: true
        })
        .on('shown.bs.modal', function() {
        })
        .on('hidden.bs.modal', function() {
        });
        */
    });
    
    $scope.authenticate = function() {
        
        var success = true;
        
        if(!$scope.params.x_auth_username) {
            $scope.errors.x_auth_username = {
                message: 'Your twitter username is required'
            };
            success = false;
        } 
        if(!$scope.params.x_auth_password) {
            $scope.errors.x_auth_password = {
                message: 'Your twitter password is required'
            };
            success =false;
        }   
        if(success) {
            // validated
            ex.log('Good to go...');
            $scope.LOGGING_IN = true;
            tws.connect({
                params: $scope.params,
                success: function() {
                    ex.log(arguments, 'tw.connect resp');
                },
                error: function( data ) {
                    ex.log(arguments, 'tw.connect ERR resp');
                },
                complete: function() {
                    $scope.LOGGING_IN = false;
                }
            });
        }
    };
        
} ]);