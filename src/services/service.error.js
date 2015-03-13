angular.module('com.larcity.service.error', [])
        .factory('$errorService', [
            '$rootScope', '$extensionService',
            function ($rootScope, $ex) {
                $ex.log("[module.service.Error]");

                var Errors = {
                    message: function (key) {
                        var me=this;
                        if (me.fields[key])
                            return me.fields[key].message;
                    },
                    reset: function(key) {
                        var me=this;
                        if(me.fields[key])
                            me.fields[key] = null;
                    },
                    fields: {}
                };
                $rootScope.Errors = Errors;
                
                return {
                    update: function (errors) {
                        if (angular.isObject(errors)) {
                            angular.extend(Errors.fields, errors);
                            $rootScope.Errors = Errors;
                            $ex.log(errors, 'Errors reported!');
                        }
                    }
                };
            }]);