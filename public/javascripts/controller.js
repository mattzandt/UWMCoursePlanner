var coursePlanner = angular.module("coursePlanner", []);

function mainController($scope, $http){
  $scope.formData = {};

  $http.get('/')
    .success(fuction(data){
      $scope.courses = data + "TEST";
      //console.log(data);
    })
    .error(function(data){
      console.log('Error: ' + data);
    });
}
