var app = angular.module("IndexModule", []);

app.controller("IndexController", ['$scope', '$http', function($scope, $http) {

  $scope.getData = function() {
    $http.get("/getApps").success(function(resp) {
      if(resp.success) {
        $scope.appTopList = resp.data;
      } else {
        alert("something wrong");
      }
    });
  }

  angular.element(document).ready(function() {
    $scope.getData();
  });

  $scope.startCrawler = function() {
    $http.post("/crawler")
      .success(function(resp) {
        if(resp.success) {
          $scope.getData();
        } else {
          alert("something wrong");
        }
      })
      .error(function() {
        alert("error");
      });
  }

}]);