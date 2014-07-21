/* Controllers */

(function (){

    var mentionsController = function($rootScope, $scope, $location, dataService, sharedId) {

        $scope.sharedId = sharedId;

        $scope.expressionId = $scope.sharedId.id;
        $scope.platformSource = "";
        $scope.mentions = [];

        $scope.totalMentions = 0;

        $scope.startDate =  0;
        $scope.endDate = 0;


        init();

        function init() {
            createWatches();
            //getMentions();
        }

        function createWatches(){
            $scope.$watch(function() {
                return $scope.sharedId.id.length;
            }, function() {
                $scope.expressionId = $scope.sharedId.id;
                getMentions();
            })

            $scope.$watch(function() {
                return $scope.sharedId.sources.length;
            }, function() {
                $scope.platformSource = ($scope.sharedId.sources+",");
                getMentions();
            })

            $scope.$watch(function () {
                return $scope.sharedId.startDate+$scope.sharedId.endDate;
            }, function () {
                $scope.startDate = $scope.sharedId.startDate;
                $scope.endDate = $scope.sharedId.endDate;
                getMentions();
            });
        }

        function getMentions() {
            $scope.totalMentions = 0;
            $scope.mentions = [];
            if($scope.expressionId.length > 0) {
                for(i = 0; i < $scope.expressionId.length; i++) {
                    dataService.getMentions($scope.expressionId[i], $scope.platformSource, $scope.startDate, $scope.endDate)
                        .then(function (data) {
                            $scope.totalMentions += data.totalMentions;
                            $scope.mentions = $scope.mentions.concat(data.mentions);
                        }, function(error) {
                            //alert(error.message);
                        });
                }
            }
        }

        $scope.disabledScroll = false;

        $scope.appendMentions = function () {
            if($scope.expressionId.length > 0) {

                $scope.disabledScroll = true;

                for(i = 0; i < $scope.expressionId.length; i++) {
                    dataService.getMoreMentions($scope.expressionId[i], Math.floor($scope.totalMentions/$scope.expressionId.length), $scope.platformSource, $scope.startDate, $scope.endDate)
                        .then(function (data) {
                            $scope.totalMentions += data.totalMentions;
                            $scope.mentions = $scope.mentions.concat(data.mentions);
                            $scope.disabledScroll = false;
                        }, function(error) {
                            //alert(error.message);
                        });
                }
            }
        }
    };

    var cityTagsInputController = function CityTagsInputController($rootScope, $scope, $http, sharedId) {
        // Init with some cities

        $scope.sharedId = sharedId;

        $scope.queryCities = function(query) {
            return $http.get('/expressions');
        };

        $scope.cities = $scope.queryCities();

        $scope.getTagClass = function(expression) {
            switch ((expression.value%5)) {
                case 0   : return 'label label-info';
                case 1  : return 'label label-danger label-important';
                case 2  : return 'label label-success';
                case 3   : return 'label label-default';
                case 4     : return 'label label-warning';
            }
        };

        $scope.getMentionsFromServer = function(expressionId) {
            $scope.sharedId.id.push(expressionId);
            $rootScope.$digest();
        };

        $scope.removeExpressionMentions = function(expressionId) {
            idx = $scope.sharedId.id.indexOf(expressionId);
            $scope.sharedId.id.splice(idx, 1);
            $rootScope.$digest();
        };
    }

    var sharedFunction = function () {
        this.id = [];
        this.sources = [];
        this.startDate = 0;
        this.endDate = 0;
    };

    var datePickerFunction = function($scope, $filter, sharedId) {

        $scope.sharedId = sharedId;
        $scope.dates = { startDate: moment().subtract('days', 1), endDate: moment() };
        $scope.ranges = {
            'Today': [moment().startOf('day'), moment().endOf('day')],
            'Last 24h' : [moment().subtract('days', 1),moment()],
            'Yesterday': [moment().subtract('days', 1).startOf('day'), moment().subtract('days', 1).endOf('day')],
            'Last 7 days': [moment().subtract('days', 7), moment()],
            'Last 30 days': [moment().subtract('days', 30), moment()],
            'This month': [moment().startOf('month'), moment().endOf('month')]
        };

        $scope.$watch(function () {
            return $scope.dates.startDate+$scope.dates.endDate;
        }, function () {
                $scope.sharedId.startDate = moment($scope.dates.startDate).toDate().getTime();
                $scope.sharedId.endDate = moment($scope.dates.endDate).toDate().getTime();
        });
    }

    var multiselectController = function($scope, sharedId) {

        $scope.sharedId = sharedId;
        $scope.productSelection=[{name: "Bloguri", value: "article"}, {name: "Twitter", value: "tweet"}];
        $scope.Products = [{name: "Bloguri", value: "article"}, {name: "Twitter", value: "tweet"}];

        $scope.$watch(function () {
            return $scope.productSelection.length;
        }, function () {
            $scope.sharedId.sources = [];
            for(i = 0; i < $scope.productSelection.length; i++) {
                $scope.sharedId.sources.push($scope.productSelection[i].value);
            }
        });
    }

    var headerController = function($scope, sharedId, $location){

        $scope.sharedId = sharedId;

        var ids = $scope.sharedId.id;
        var sources = $scope.sharedId.sources;
        var startDate = $scope.sharedId.startDate;
        var endDate = $scope.sharedId.endDate;

        //$scope.downloadUrl = 'http://192.168.40.20:9000/export/' + id + '/mentions' + '?sources=' + sources + '&startDate=' + startDate + '&endDate=' + endDate;

        $scope.$watch(function () {
            return $scope.sharedId.id.length + $scope.sharedId.sources.length + $scope.sharedId.startDate + $scope.sharedId.endDate;
        }, function () {
            ids = $scope.sharedId.id;
            sources = $scope.sharedId.sources;
            startDate = $scope.sharedId.startDate;
            endDate = $scope.sharedId.endDate;

            var id = "";
            for(i = 0; i < ids.length-1; i++) {
                id += ids[i]+",";
            }
            id += ids[i];
            $scope.downloadUrl = 'http://cantina.standout.ro:9000/export/' + id + '/mentions' + '?source=' + sources + '&startDate=' + startDate + '&endDate=' + endDate;
        });
    }

    mentionsManager.cantinaApp.controller('MentionsController',
        ['$rootScope', '$scope', '$location', 'dataService', 'sharedId', mentionsController]);

    mentionsManager.cantinaApp.controller('CityTagsInputController',
        cityTagsInputController);

    mentionsManager.cantinaApp.controller('DatePickerController',
        ['$scope', '$filter', 'sharedId', datePickerFunction]);

    mentionsManager.cantinaApp.controller('MultiselectController',
        multiselectController);

    mentionsManager.cantinaApp.controller('HeaderController',
        headerController);

    mentionsManager.cantinaApp.service('sharedId', sharedFunction);
}());