$(document).ready(function(){
	$("#message").fadeIn();
	
  setTimeout(function() {
        window.location="/vendingMain?machineId="+getParameterByName("machineId");
  }, 30000);
  console.log(getParameterByName("salesId"));
  
  
});
function thankYouController($scope,$http) {
	$scope.phoneNumber = "";
	$scope.submitPhone = function() {
		console.log("submit: " + $scope.phoneNumber);
		$("#confirm-no").hide();
		$("#phoneInput").hide();
		$("#confirm-phone").show();
		$.ajax({
			type: "POST",
			url: "/sendSMSConfirm",
			data: JSON.stringify({"phone_number": $scope.phoneNumber, "sales_id": getParameterByName("salesId")}),
			dataType: "json",
			headers: {
				"content-type": "application/json"
			},
		});
		$.ajax({
	        type: "POST",
	        url: "/alertFail",
	        data: JSON.stringify({"machine_id": getParameterByName("machineId"), "message": "Contact: " + $scope.phoneNumber + " about issue" }),
	        dataType: "json",
	        headers: {
	          "content-type": "application/json"
	        },
	      });
		  setTimeout(function() {
		        window.location="/vendingMain?machineId="+getParameterByName("machineId");
		  }, 3000);
	}
	$scope.addNum = function(number){
		if($scope.phoneNumber.length<10){
			$scope.phoneNumber = $scope.phoneNumber + number;
			console.log(number + ", " + $scope.phoneNumber);
		}
	}
	$scope.deleteNum = function() {
		$scope.phoneNumber=$scope.phoneNumber.substring(0,$scope.phoneNumber.length-1);
	}
	$scope.productReceived=function(){
		$("#confirm-yes").show();
		$(".yes-no").hide();
		$.ajax({
	        type: "POST",
	        url: "/alertSuccess",
	        data: JSON.stringify({"machine_id": getParameterByName("machineId"), "message": "Product vended" }),
	        dataType: "json",
	        headers: {
	          "content-type": "application/json"
	        },
	      });
		setTimeout(function() {
	        window.location="/vendingMain?machineId="+getParameterByName("machineId");
	    }, 3000);
	}
	$scope.noProduct=function() {
		$("#confirm-no").show();
		$("#phoneInput").show();
		$(".yes-no").hide();
		
		setTimeout(function() {
	        window.location="/vendingMain?machineId="+getParameterByName("machineId");
	    }, 20000);
	    
		$.ajax({
	        type: "POST",
	        url: "/alertFail",
	        data: JSON.stringify({"machine_id": getParameterByName("machineId"), "message": "Vending failed" }),
	        dataType: "json",
	        headers: {
	          "content-type": "application/json"
	        },
	    });
	      
	      
	}
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
