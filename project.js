function Project(id,name,description,site,author,filesize,creationdate) {
  this.$id = id;
  this.name = name;
  this.description = description;
  this.site = site;
  this.author = author;
  this.filesize = filesize;
  this.creationdate = creationdate;
}

function Projects() {
  projects = [];
  this.projects = projects;
  this.loaded = 0;

  this.add = function(prj) {
    projects.splice(projects.length,0,prj);
  }

  this.get = function(id) {
    for(var i=0;i<projects.length;i++) {
      var prj = projects[i];
      if(prj.$id == id)
        return prj;
    }
  }

  this.remove = function(id) {
    for(var i=0;i<projects.length;i++) {
      if(projects[i].$id == id) {
        projects.splice(i,1);
        return;
      }
    }
  }

  this.update = function(itemOrId) {
    alert(itemOrId);
  }
}

angular.projects = new Projects();

angular.module('project',['ngDragDrop']).
  factory('Projects', function() {
    return angular.projects;
  }).
  config(function($routeProvider) {
    $routeProvider.
    when('/', {controller:ListCtrl, templateUrl:'list.html'}).
    when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
    when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
    otherwise({redirectTo:'/'});
  });
     
function ListCtrl($scope, $http, Projects) {
  if(Projects.loaded == 0) {
    $http.get("projects.json").success(function(data) {
      for(var i = 0;i<data.length;i++) {
        var itm = data[i];
        Projects.add(new Project(itm.$id,itm.name,itm.description,itm.site,itm.author,itm.filesize,itm.creationdate));
      }
    });
    Projects.loaded = 1;
  }
  $scope.projects = Projects;

  // Define the sorting function
    $scope.column_sort = {sort_mode:0,column:"name",reverse:false,sort_by:""};

    $scope.sort_column = function(column_name) {
      if ($scope.column_sort.column != column_name) {
        $scope.column_sort.sort_mode = 0;
      } else {
        $scope.column_sort.sort_mode = ($scope.column_sort.sort_mode + 1)%3;
      }

      $scope.column_sort.column = column_name;
      $scope.column_sort.sort_by = column_name;

      sort_mode = $scope.column_sort.sort_mode;
      if (sort_mode == 1) {
        $scope.column_sort.reverse = true;
      } else if (sort_mode == 0) {
        $scope.column_sort.reverse = false;
      } else {
        $scope.column_sort.reverse = false;
        $scope.column_sort.sort_by = "";
      }
  };

  // Delete
  $scope.remove = function(prid) {
    $scope.projects.remove(prid);
  };

  // Cart creation
  $scope.cart = [];
  $scope.cart_set = {};
  $scope.cart_size = 0;
  $scope.onDrop = function($data,cart) {
      name = $data.name;
      if (name in $scope.cart_set == false) {
        $scope.cart.push($data);
        $scope.cart_set[name] = true;
        $scope.cart_size += $data.filesize;
      }
  };
}
     
function CreateCtrl($scope, $location, $timeout, Projects) {
  $scope.project = new Project();
  $scope.save = function() {
    $scope.project.$id = randomString(5,"abcdefghijklmnopqrstuvwxyz0123456789");
    Projects.add(angular.copy($scope.project));
    $location.path('/');
  }
}

function EditCtrl($scope, $location, $routeParams, Projects) {
   $scope.project = angular.copy(Projects.get($routeParams.projectId));
   $scope.isClean = function() {
      return angular.equals(Projects.get($routeParams.projectId), $scope.project);
   }
   $scope.destroy = function() {
      Projects.remove($routeParams.projectId);
      $location.path('/');
   };
   $scope.save = function() {
      var prj = Projects.get($routeParams.projectId);
      prj.name = $scope.project.name;
      prj.description = $scope.project.description;
      prj.site = $scope.project.site;
      prj.author = $scope.project.author;
      prj.filesize = $scope.project.filesize;
      prj.creationdate = $scope.project.creationdate;

      $location.path('/');
   };
}

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) 
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
