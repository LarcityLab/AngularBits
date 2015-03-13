angular.module('com.larcity.overlayCtrl',[])
.controller('OverlayCtrl', ['$http','$scope','$rootScope','$filter','$extensionService', '$contextService', 
function($http,$scope,$rt,$filter,ex,context) {
    ex.log("[module.controller.OverlayCtrl]");
    
    // $scope.Templates = {};
    $scope.BusyModal = null;

    // load templates
    /*
    var Tlist = context.getSystemTemplates();
    ex.log(Tlist, 'System templates');
    angular.forEach(Tlist, function(tpl) {
        $scope.Templates[tpl.name] = tpl;
    });
    ex.log($scope.templates,'Templates:');
    */
    
    $rt.$on('$locationChangeStart', function() {
        $scope.PageLoadModal = {
            message: "Loading page...",
            type:'wait'
        };
        ex.log("Changing location...");
    });
    
    $rt.$on('app:loadComplete', function() {
        ex.log("Arrived...");
        $scope.PageLoadModal = null;
    });
    
    $rt.$on('app:showModal', function( scope, opt ) {
        ex.log(opt, "received alert signal...");
        var cfg = {
            message: 'Working...',
            type: 'default'
        };
        if(angular.isObject(opt)) {
            angular.extend(cfg, opt);
        }
        $scope.BusyModal = cfg;
    });
    
    $rt.$on('app:doneWorking', function() {
        ex.log('received alert kill signal');
        $scope.BusyModal = false;
    });
    
    if(typeof layout !== "undefined") 
        layout();
}]);