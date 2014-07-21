(function () {

    var dataService = function (mentionsService) {
        return mentionsService;
    };

    mentionsManager.cantinaApp.factory('dataService',
        ['mentionsService', dataService]);

}());

(function () {

    var mentionsService = function ($http, $q) {
        var serviceBase = '/expressions',
            mentions = null,
            mentionsFactory = {};

        mentionsFactory.getMentions = function (expressionId, source, startDate, endDate) {
            return $http.get(serviceBase + '/' + expressionId + '/mentions?source=' + source + '&startDate=' + startDate + '&endDate=' + endDate).then(function (response) {
                var mnts = response.data.expressionMatches;
                return {
                    totalMentions: mnts.length,
                    mentions: mnts
                };
            });
        }

        mentionsFactory.getMoreMentions = function (expressionId, offset, source, startDate, endDate) {
            return $http.get(serviceBase + '/' + expressionId + '/mentions?offset='+ offset + '&source=' + source + '&startDate=' + startDate + '&endDate=' + endDate).then(function (response) {
                var mnts = response.data.expressionMatches;
                return {
                    totalMentions: mnts.length,
                    mentions: mnts
                };
            });
        }

        return mentionsFactory;

    };

    mentionsManager.cantinaApp.factory('mentionsService', ['$http', '$q', mentionsService]);

}());