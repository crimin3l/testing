
var sitesManager = {};
sitesManager.sitesApp = {};

(function () {

    sitesManager.sitesApp = angular.module('sitesApp',
        ['ngRoute', 'ngBootstrap', 'ngProgressLite', 'ng-bootstrap-multiselect', 'ngSanitize', 'ui.bootstrap','sitesFilters', 'xeditable']);


    sitesManager.sitesApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/:categoryId', {
                templateUrl: 'partials/sitesThreads.html',
                controller: 'ThreadsController'
            })
            .when('/:categoryId/:threadId', {
                templateUrl: 'partials/sitesThread.html',
                controller: 'ThreadController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);

    sitesManager.sitesApp.directive('alert', function () {
        return {
            restrict:'EA',
            template:"<div class='alert' ng-class='type && \"alert-\" + type'><button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>    <div ng-transclude></div></div>",
            transclude:true,
            replace:true,
            scope: {
                type: '=',
                close: '&'
            },
            link: function(scope, iElement, iAttrs) {
                scope.closeable = "close" in iAttrs;
            }
        };
    });

    sitesManager.sitesApp.directive('ngConfirmClick', [
        function(){
            return {
                link: function (scope, element, attr) {
                    var msg = attr.ngConfirmClick || "Are you sure?";
                    var clickAction = attr.confirmedClick;
                    element.bind('click',function (event) {
                        if ( window.confirm(msg) ) {
                            scope.$eval(clickAction)
                        }
                    });
                }
            };
    }]);

    angular.module('sitesFilters', [])
        .filter('platform', function() {
            return function(input) {
                if(input == "1")
                    return "WORDPRESS";
                else
                    if(input == "2")
                        return "TUMBLR";
                    else
                        if(input == "3")
                            return "BLOGGER";

                return "UNKNOWN";
            };
        })
        .filter('status', function() {
            return function(input) {
                if(input == "1")
                    return "DOWN";
                else
                if(input == "2")
                    return "UP";
                else
                if(input == "3")
                    return "DISABLED";

                return "UNKNOWN";
            };
        });

    sitesManager.sitesApp.run(function(editableOptions) {
        editableOptions.theme = 'bs3';

    });

}());