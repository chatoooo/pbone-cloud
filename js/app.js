var phonecatApp = angular.module('pbone-cloud', []);
var oauth_client_id = "609812060176-k7s3umnv1t5qn8b5q736a2offvd9k5oc.apps.googleusercontent.com"
var storage = window.localStorage;

function params_unserialize(p){
  var ret = {},
      seg = p.replace(/^\?/,'').split('&'),
      len = seg.length, i = 0, s;
  for (;i<len;i++) {
      if (!seg[i]) { continue; }
      s = seg[i].split('=');
      ret[s[0]] = s[1];
  }
  return ret;
}

phonecatApp.controller('cloud-printers', function ($scope,$http,$location) {
  $scope.printers = [];
  $scope.selectedPrinter = null;
  $scope.authorized = false;
  
  $scope.googleLogin = function(){
    req_data = {
        response_type: "token",
        client_id: oauth_client_id,
        redirect_uri: $location.absUrl(),
        scope: "https://www.googleapis.com/auth/cloudprint",
        state: "login",
    }
    params = $.param(req_data)
    window.location = "https://accounts.google.com/o/oauth2/auth?" + params;
  };
  
  $scope.checkAuth = function(){
    path = $location.path();
    if(path != ""){
      params =  params_unserialize(path.substring(1));
      if ("access_token" in params){
        storage.setItem('accessToken',params['access_token']);
        $location.path("");
      }
    } 
    
    $scope.access_token = storage.getItem('accessToken');
    if($scope.access_token == null){
      $scope.authorized = false;
    }else{
      req_data = {
        access_token: $scope.access_token
      }
      params = $.param(req_data);
      $http.get("https://www.googleapis.com/oauth2/v1/tokeninfo?"+params)
      .success(function(data, status, headers, config){
        $scope.authorized = true;
        $scope.loadPrinters();
      })
      .error(function(data, status, headers, config){
        $scope.authorized = false;
      });
    }
  };
  
  $scope.loadPrinters = function(){
    url = "https://www.google.com/cloudprint/search"
    params = $.param({
      url: url,
      headers: "Authorization,X-CloudPrint-Proxy",
    });
    $http({
      method: "GET",
      url: "/proxy?"+params, 
      headers: {
            'Authorization': 'OAuth '+$scope.access_token,
            'X-CloudPrint-Proxy': 'acsc-print'
        }
      })
      .success(function(data, status, headers, config){
        $scope.printers = [];
        data['printers'].forEach(function(printer){
          if(printer['proxy'] == "acsc-fiskal")
            $scope.printers.push(printer);
        });
            
      })
      .error(function(data, status, headers, config){
        alert("pruser");
      });  
  }
  
  $scope.selectPrinter = function(id){
    $scope.printers.forEach(function(printer){
      if(printer['id'] == id)
        $scope.selected_printer = printer;
    })
    
  };
  
  $scope.printTest = function(){
    $scope.printData($scope.selected_printer.id,{signature: 100, data:[{type:"TEXT",data:"ahoj"}]});
  };
  
  $scope.printData = function(printer_id,data){
    url = "https://www.google.com/cloudprint/submit"
    data = {
      printerid: printer_id,
      title: "Test Print",
      ticket: angular.toJson({
        version: "1.0"
      }),
      content: angular.toJson(data),
      contentType: "application/acsc.json"
    };
    params = $.param({
      url: url,
      data: $.param(data),
      headers: "Authorization,X-CloudPrint-Proxy",
    });
    $http({
      method: "POST",
      url: "/proxy",
      data: params, 
      headers: {
            'Authorization': 'OAuth '+$scope.access_token,
            'X-CloudPrint-Proxy': 'acsc-print'
        }
      })
      .success(function(data, status, headers, config){
        alert("tiskne se to");            
      })
      .error(function(data, status, headers, config){
        alert("netiskne to");
      });
  };
});