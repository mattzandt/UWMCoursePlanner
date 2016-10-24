var coursePlanner = angular.module("coursePlanner", []);

function mainController($scope, $http){
  $scope.formData = {};

  $http.get('/')
    .success(fuction(data){
      $scope.courses = data.courses;
    })
    .error(function(data){
      console.log('Error: ' + data);
    });
}
