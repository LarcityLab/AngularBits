angular.module('com.larcity.helpCtrl', [])
        .controller('HelpCtrl', ['$rootScope', '$scope', '$extensionService', '$contextService',
            function ($rt, $scope, ex, $appContext) {
                ex.log("[module.controller.HelpCtrl]");

                $scope.HelpTemplate = {
                    message: 'Something went wrong...',
                    view: '',
                    lighthouse: {
                        name: 'Home',
                        url: $appContext.app_link('Home')
                    }
                };

                $scope.init = function () {
                    $('#HelpDialog').modal({
                        show: false,
                        backdrop: 'static'
                    })
                            .on('hidden.bs.modal', function () {
                                if ($scope.Help.lighthouse && $scope.Help.lighthouse) {
                                    $rt.$emit('app:showModal', {message: 'Re-directing...', type: 'wait'});
                                    setTimeout(function () {
                                        window.location.href = $scope.Help.lighthouse.url;
                                    }, 500);
                                }
                            });
                };

                $scope.closeThenDo = function (action) {
                    if (action.url) {
                        // show "Navigate away" warning
                        var selection = confirm("You are about to navigate away from this page to the Content Editor. To continue, click 'OK'");
                        if (selection == true) {
                            $('#HelpDialog').modal().off('hidden.bs.modal');
                            $('#HelpDialog').modal('hide')
                                    .on('hidden.bs.modal', function () {
                                        window.location.href = action.url;
                                    });
                        } else {
                            ex.showToast("Content editing canceled", {trivial: true});
                        }
                    } else if (angular.isFunction(action.callback)) {
                        $('#HelpDialog').modal().off('hidden.bs.modal');
                        $('#HelpDialog').modal('hide')
                                .on('hidden.bs.modal', function () {
                                    action.callback();
                                });
                    } else {
                        // just close the dialog
                        ex.showToast("No URL was provided for the action you selected.", {trivial: true});
                        $('#HelpDialog').modal('hide');
                    }
                };

                $rt.$on('app:showHelp', function () {
                    $scope.Help = $scope.HelpTemplate;
                    var help = $appContext.data.get('Help');
                    if (angular.isObject(help)) {
                        angular.extend($scope.Help, $appContext.data.get('Help'));
                    }
                    ex.log($scope.Help, 'help information');
                    $('#HelpDialog').modal('show');
                });

            }]);