(function (){

    var categoryController = function($rootScope, $scope, dataService, sharedId, ngProgressLite) {

        $scope.sharedId = sharedId;
        $scope.categories = [];

        init();

        function init() {
            //createWatches();
            getCategories();
        }
        function getCategories(){
            $scope.forums = [];

            dataService.getCategories()
                .then(function (data) {
                    $scope.categories = data.categories;
                    $scope.sharedId.categories = $scope.categories;
                }, function(error) {
                    //alert(error.message);
                });
        }
        $scope.$watch(function(){
            return $scope.sharedId.id;
        }, function() {
            $scope.categoryId = $scope.sharedId.id;
            getCategories()
        });

        $scope.$watch(function() {
            return $scope.sharedId.newCategory;
        }, function() {
            getCategories();
        })
    }

    var sharedFunction = function () {
        this.id = 0;
        this.page = 1;
        this.threadsNumber = 0;
        this.isVisible = true;
        this.keyword = "";
        this.newCategory = 0;
        this.categories = null;
    };

    var threadsController = function($location, $http, $rootScope, $scope, $routeParams, $timeout, $filter, dataService, sharedId) {
        $scope.sharedId = sharedId;
        $scope.categoryId = $routeParams.categoryId;

        if($scope.categoryId == null) {
            $scope.categoryId = 0;
            $scope.sharedId.id = 0;
        }

        $scope.threads = [];

        function getThreads(keyword) {

            $scope.seen = [];
            dataService.getThreads($scope.categoryId, ($scope.sharedId.page - 1) * 10, keyword)
                .then(function (data) {

                    $scope.threads = data.threads;
                    $scope.sharedId.isVisible = true;

                }, function(error) {
                    //alert(error.message);
                });
        }

        $scope.keywords = "";

        $scope.searchPost = function() {

            if($scope.keywords.length >=4 ) {
                getThreads($scope.keywords);
                getThreadsNumber();
                $scope.sharedId.keyword = $scope.keywords;
            }
        }

        function getThreadsNumber() {
            dataService.getThreadsNumber($scope.sharedId.id, $scope.keywords)
                .then(function (data) {
                    $scope.threadsNumber = data.threadsNumber.count;
                    $scope.sharedId.threadsNumber = $scope.threadsNumber;
                }, function(error){

                });
        }

        $scope.$watch(function () {
            return $scope.categoryId;
        }, function () {
            $scope.sharedId.id = $scope.categoryId;
            getThreads("");
            getThreadsNumber();
        });

        $scope.$watch(function () {
            return $scope.sharedId.page;
        }, function () {
            getThreads($scope.keywords);
        });

        $scope.manualRefresh = function(){
            getThreads($scope.keywords);
            getThreadsNumber();
        }

        $scope.platforms = [
            {value: 0, text: 'UNKNOWN'},
            {value: 1, text: 'WORDPRESS'},
            {value: 2, text: 'TUMBLR'},
            {value: 3, text: 'BLOGGER'}
        ];

        $scope.showPlatform = function(thread) {
            var selected = [];
            if(thread.platform) {
                selected = $filter('filter')($scope.platforms, {value: thread.platform});
            }
            return selected.length ? selected[0].text : 'UNKNOWN';
        };

        $scope.updateThread = function(data, id) {
            //$scope.user not updated yet

            rssArray = [];
            categoriesArray = [];

            for(i=0;i<$scope.threads.length;i++)
                if($scope.threads[i].id == id) {
                    countRss = $scope.threads[i].rss.length;
                    for(j = 0; j < countRss; j ++) {
                        rssArray.push({"id": $scope.threads[i].rss[j].id, "url": data["rss" + $scope.threads[i].rss[j].id]});
                    }
                    countCategories = $scope.threads[i].categories.length;
                    for(j = 0; j < countCategories; j ++) {
                        categoriesArray.push({"id": $scope.threads[i].categories[j].id, "id_category": data["category" + $scope.threads[i].categories[j].id_category]});
                    }
                }

            angular.extend(data, {"rss_array": rssArray});
            angular.extend(data, {"categories_array": categoriesArray});
            console.log(data);
            //dataService.updateThread(data, id);

            $http.post("/sites/update/" + id, data).then(function (response) {
                getThreads($scope.keywords);
                getThreadsNumber();
            })

            /*angular.extend(data, {id: id});
            return $http.post('/saveUser', data);*/
        };

        $scope.siteCategory = "";
        $scope.addSiteCategory = function() {
            data = {'category': $scope.siteCategory};
            $http.post("/sites/category/add", data).then(function (response) {
                if (!response.data.success) {
                    // if not successful, bind errors to error variables
                    $scope.errorName = response.data.errors.name;
                    $scope.message = null;
                } else {
                    // if successful, bind success message to message
                    $scope.errorName = null;
                    $scope.message = response.data.message;
                    $scope.sharedId.newCategory++;
                }
            });

        }

        $scope.siteUrl = "";
        $scope.addSite = function() {
            console.log($scope.siteUrl);
            data = {'url': $scope.siteUrl};
            $http.post("/sites/add", data).then(function (response) {
                console.log(response.data);
                if (!response.data.success) {
                    // if not successful, bind errors to error variables
                    $scope.errorUrl = response.data.errors.name;
                    $scope.messageUrl = null;
                } else {
                    // if successful, bind success message to message
                    $scope.errorUrl = null;
                    $scope.messageUrl = response.data.message;
                }
            });
        }

        $scope.showCategory = function(category) {
            var selected = [];
            if(category) {
                selected = $filter('filter')($scope.categories, {id: category.id_category});
            }
            return selected.length ? selected[0].name : 'UNKNOWN';
        };

        $scope.$watch(function() {
            if($scope.sharedId.categories != null)
                return $scope.sharedId.categories.length;
            return true;
        }, function() {
            $scope.categories = $scope.sharedId.categories;
        })

        $scope.getCategoryName = function(categoryId) {
            var selected = [];
            selected = $filter('filter')($scope.categories, {id: categoryId});
            return selected.length ? selected[0].name : 'UNKNOWN';
        }

        $scope.deleteCategory = function(categoryId) {
            console.log(categoryId);
            data = {'id': categoryId};

            $http({
                url: "/sites/category/delete",
                method: "DELETE",
                data: data,
                headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                    console.log("SUCCESS");
                    $location.path("0");
                }).error(function (data, status, headers, config) {
                    //console.log("FAIL");
                });
        }

    }

    var threadController = function($rootScope, $scope, $routeParams, $timeout, dataService, sharedId) {
        $scope.sharedId = sharedId;
        $scope.categoryId = $routeParams.categoryId;
        $scope.threadId = $routeParams.threadId;

        getThread();

        function getThread() {

            dataService.getThread($scope.categoryId, $scope.threadId)
                .then(function (data) {

                    $scope.messages = data.messages;
                    $scope.sharedId.isVisible = false;

                }, function(error) {
                    //alert(error.message);
                });
        }

        $scope.addThreads = [];

        $scope.addThread = function() {

            var data = {"thread": $scope.newThread};
            dataService.addThread(data);

            $scope.addThreads.push($scope.newThread);
            $scope.newThread = '';
        }

    }

    var paginationDemoCtrl = function ($rootScope, $scope, $routeParams, $timeout, dataService, sharedId) {

        $scope.sharedId = sharedId;
        $scope.isVisible = $scope.sharedId.isVisible;
        console.log($scope.isVisible)

        $scope.pageChanged = function() {
            $scope.sharedId.page = $scope.bigCurrentPage;
        };

        $scope.maxSize = 10;
        $scope.bigCurrentPage = 1;
        $scope.itemsPerPage = 10;

        $scope.$watch(function () {
            return $scope.sharedId.isVisible;
        }, function () {
            $scope.isVisible = $scope.sharedId.isVisible;
        });

        $scope.$watch(function () {
            return $scope.sharedId.id;
        }, function () {
            $scope.threadsNumber =  $scope.sharedId.threadsNumber;
            $scope.bigTotalItems = $scope.threadsNumber;
        });

        $scope.$watch(function () {
            return $scope.sharedId.threadsNumber;
        }, function () {
            $scope.threadsNumber =  $scope.sharedId.threadsNumber;
            $scope.bigTotalItems = $scope.threadsNumber;
        });

    };

    sitesManager.sitesApp.controller('CategoryController',
        ['$rootScope', '$scope', 'dataService', 'sharedId', 'ngProgressLite', categoryController]);

    sitesManager.sitesApp.controller('ThreadsController',
        ['$location', '$http', '$rootScope', '$scope', '$routeParams', '$timeout', '$filter', 'dataService', 'sharedId', threadsController]);

    sitesManager.sitesApp.controller('ThreadController',
        ['$rootScope', '$scope', '$routeParams', '$timeout', 'dataService', 'sharedId', threadController]);

    sitesManager.sitesApp.controller('PaginationDemoCtrl', ['$rootScope', '$scope', '$routeParams', '$timeout', 'dataService', 'sharedId', paginationDemoCtrl]);

    sitesManager.sitesApp.service('sharedId', sharedFunction);
}());