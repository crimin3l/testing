(function () {

    var dataService = function (sitesService) {
        return sitesService;
    };

    sitesManager.sitesApp.factory('dataService',
        ['sitesService', dataService]);

}());

(function () {

    var sitesService = function ($http, $q) {
        var serviceBase = '/sites/categories',
            categories = null,
            sitesFactory = {};

        sitesFactory.getCategories = function () {
            return $http.get(serviceBase).then(function (response) {
                var frm = response.data;
                return {
                    categories: frm
                };
            });
        }

        var threadsBase = '/sites/threads/';

        sitesFactory.getThreads = function (id, offset, keyword) {
            console.log(id);
            return $http.get(threadsBase + id + '?offset=' + offset + '&keyword=' + keyword).then(function (response) {
                var thd = response.data;
                return {
                    threads: thd,
                    threadsNumber: thd.length
                };
            });
        }

        var threadBase = '/sites/threads/';

        sitesFactory.getThread = function (id, threadId) {
            return $http.get(threadsBase + id + "/" + threadId).then(function (response) {
                var thd = response.data;
                return {
                    messages: thd,
                    messagesNumber: thd.length
                };
            });
        }

        sitesFactory.getMoreThreads = function (id, offset, source) {
            return $http.get(threadsBase + id + '?source=' + source + '&offset=' + offset).then(function (response) {
                var thd = response.data;
                return {
                    threads: thd,
                    threadsNumber: thd.length
                };
            });
        }

        countUrl = '/sites/threadsnumber/'
        sitesFactory.getThreadsNumber = function(id, keyword) {

            return $http.get(countUrl + id + "?keyword=" + keyword).then(function (response) {
                var thd = response.data;
                return {
                    threadsNumber: thd
                };
            });
        }

        searchUrl = '/sites/search/'
        sitesFactory.searchThreads = function(id, keyword) {

            return $http.get(searchUrl + id + '/' + keyword).then(function (response) {
                var thd = response.data;
                return {
                    threads: thd
                };
            });
        }

        return sitesFactory;
    };

    sitesManager.sitesApp.factory('sitesService', ['$http', '$q', sitesService]);

}());