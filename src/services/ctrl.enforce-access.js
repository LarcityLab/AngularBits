angular.module('com.larcity.controller.access',['http-auth-interceptor'])
.controller('AccessCtrl',['$rootScope','$location','$routeParams','$scope','$extensionService','$contextService', 
function($rt,$location,$params,$scope,ex,context) {
    //ex.log("[module.controller.AccessCtrl]");
    $scope.module="[module.controller.AccessCtrl]";
    $rt.User = $scope.getLoggedInUser();
    
    $scope.say = function(text) {
        ex.log($scope.module+" >> " + text);
    };
    
    $rt.$on('app:abortActions', function() {
        $rt.$emit('app:doneWorking');
    });
    
    var vars = $location.search();
    ex.log(vars, 'variables');
    
    if(!$scope.User) {
        // capture current page
        $.jStorage.set(LOGIN_DESTINATION, window.location.href);
        // redirect to login
        $rt.$emit('app:abortActions');
        window.location.href = context.app_link('Start') + '?' + $.param({
            action: 'login'
        });
    } else {
        $scope.say("User is authenticated");
        $rt.$emit('app:userIsLoggedIn');
        $rt.$emit('app:updateUser', $scope.User);
    }
}]);
