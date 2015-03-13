angular.module('com.larcity.statusCtrl',[])
.controller('StatusCtrl', ['$http','$scope','$rootScope','$filter','$extensionService', function($http,$scope,$rt,$filter,ex) {
    ex.log("[module.controller.StatusCtrl]");
    
    $scope.Status = null;
    
    $rt.$on('app:updateStatus', function(scope, opt ) {
        var status = {
            message: '',
            color: '#999'
        };
        if(angular.isObject(opt)) {
            angular.extend(status, opt);
        } else {
            status.message = opt;
        }
        $scope.Status = status;
    });
    
    $rt.$on('app:clearStatus', function() {
        $scope.Status = null;
    });
    
    if(typeof layout !== "undefined") 
        layout();
}]);