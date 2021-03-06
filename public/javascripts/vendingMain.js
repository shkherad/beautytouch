function vendingMain($scope,$http) {

  $scope.formData = {};
  $scope.suggestion = "";
  $scope.promoCode = "";
  $scope.selectedName="Item Name";
  $scope.brand = {id: 0};
  $scope.selectedSubtitle = "";
  $scope.seletedImg="";
  $scope.selectedPrice="0.00";
  $scope.selectedDescription="Description";
  $scope.selectedBrandName = "Brand Name";
  $scope.selectedBrandDescription = "Brand Description";
  $scope.selectedBrandLogo = "";
  $scope.cart = { product_info: [], product_list: [], total: 0, slots: [], promo: {code: ""}, discount: 0, adj_total: 0};


  logEvent("vending_main", 0);
  $http.get('/promos').
    success(function(data, status, headers, config) {
      $scope.promos = data;
      console.log($scope.promos);
      //show promo code button
      $('#promo-button').show()
    });

  /*
     $(function () {
     var $els = $('h1[id^=textheader]'),
     i = 0,
     len = $els.length;

     $els.slice(1).hide();
     setInterval(function () {
     $els.eq(i).fadeOut("fast", "linear", function () {
     i = (i + 1) % len
     $els.eq(i).fadeIn("fast", "linear");
     })
     }, 3000)
     });
     */

  /*
     setInterval(toggleSlide = function() {
     var $active = $('#product-grid td.selected');
     if($active.length == 0) {
     $active = $('#product-grid td:first');
     }
     $active.removeClass('selected');
     if($active.next('td.product').length > 0) {
     $scope.productSelected($active.next('td.product').attr('id'), false);
     $scope.$digest();
     } else {
     $scope.productSelected($('#product-grid td:first').attr('id'), false);
     $scope.$digest();
     }
     }, 5000);
     */
  $(document).ready(function(){
    $scope.machine=JSON.parse($("#machineJsonVariable").html());
    var alreadyListedProd = ",";
    console.log(alreadyListedProd);
    var lengthhooks = $scope.machine.hooks.length;
    for(var i=0; i<lengthhooks;i++){
      if ($scope.machine.hooks[i].item_sku != null) {
        var currentSku = $scope.machine.hooks[i].product.item_sku;
        if(!(alreadyListedProd.indexOf(","+currentSku+",")>=0)){
          $scope.availableProducts.push($scope.machine.hooks[i].product);
          alreadyListedProd+=currentSku+",";
        }
      }
    }
    var lengthUniqueSkus = $scope.availableProducts.length;
    console.log(alreadyListedProd);
    console.log($scope.availableProducts);
    $scope.availableProducts.sort(function(a, b) {
      return parseInt(a.brand_id) - parseInt(b.brand_id);
    });
    $scope.productSelected($scope.availableProducts[0].item_sku, false);
    $scope.$digest();
    $('#productList').css('display', 'block');
    $('.cart-total').css('display', 'inline-block');

    $('.cart-list').css('display', 'block');
  });


  $(function() {
    $('#table-wrapper').scroll( function() {
      if ($('#product-grid').width() == ($('#table-wrapper').scrollLeft() + $('#table-wrapper').width())) {
        $('#left-arrow').css('color', '#333');
        $('#right-arrow').css('color', '#ddd');
      } else if ($('#table-wrapper').scrollLeft() == 0) {
        $('#left-arrow').css('color', '#ddd');
        $('#right-arrow').css('color', '#333');
      } else {
        $('#left-arrow').css('color', '#333');
        $('#right-arrow').css('color', '#333');
      }
    });

  });

  var pageTimeout = setTimeout(function() {
    window.location="/vendingMain?machineId="+getParameterByName("machineId");
  }, 1800000);

  $scope.pageReset = function() {
    clearTimeout(pageTimeout);
    pageTimeout = setTimeout(function() {
      window.location="/vendingMain?machineId="+getParameterByName("machineId");
    }, 1800000);
  };

  $scope.availableProducts=[];

  //get list of available products
  var machineID=getParameterByName("machineId");

  $scope.productSelected = function(id, tap) {
    if ($scope.selectedId == id) {
      return;
    }
    $('.add-success').hide(100);
    var inCart = false;
    $.each($scope.cart.product_list, function (index, item) {
      if (item == id) {
        inCart = true;
        return false;
      }
    });
    if (inCart == true)  {
      console.log('in cart');
      $('.add-to-cart-button').addClass('desense');
    } else {
      console.log('not in cart');
      $('.add-to-cart-button').removeClass('desense');
    }

    if ($scope.cart.product_list.length > 2)
      $('.add-to-cart-button').addClass('desense');

    if (tap == true){
      logEvent("tap_product", id);
    }


    $scope.selectedId=id;
    var products = $('.product');
    $.each(products, function(index, value) {
      if (value.id == id) {
        $('td.selected').removeClass('selected');
        $('#'+id).addClass('selected');
      }
    });

    var lengthhooks = $scope.machine.hooks.length;
    for(var i=0; i<lengthhooks;i++){
      if ($scope.machine.hooks[i].item_sku != null){
        var iSku = $scope.machine.hooks[i].product.item_sku;
        if(iSku==id){

          var productCurrent = $scope.machine.hooks[i].product;
          $scope.selectedPrice=productCurrent.price;
          $scope.selectedDescription= productCurrent.item_description.split("//");
          $scope.mainImg = productCurrent.item_img;
          $scope.selectedImg = productCurrent.item_img;
          $scope.selectedDetailImg = productCurrent.detail_img;
          $scope.selectedThumbnail = productCurrent.thumbnail;
          $scope.selectedName= productCurrent.item_name;
          $scope.selectedSubtitle = productCurrent.subtitle;
          $scope.selectedBrandName = productCurrent.brand.name;
          $scope.selectedBrandLogo = productCurrent.brand.logo;
          $scope.selectedBrandDescription = productCurrent.brand.description;
          $scope.selectedBrandId = productCurrent.brand.id;
          break;
        }
      }
    }
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(function() {
      $('.add-to-cart-button').removeClass('desense');
      console.log("%OASYS,screen=list&?");
      $scope.cart.product_list = [];
      $scope.cart.product_info = [];
      $scope.cart.total = 0;
      $scope.cart.adj_total = 0;
      $scope.cart.discount = 0;
      $scope.cart.promo = {};
      $scope.promoCode = "";
      $scope.cart.slots = [];

      $('#code-applied').hide();
      $('#promo-button').show();

      logEvent("timeout_product", id);
      $scope.$digest();
    }, 60000)
  };


  var timeoutHandle;

  $scope.removeItem = function(item_id){
    var item_index = 0;
    $.each($scope.cart.product_info, function (index, item) {
      if (item.id == item_id) {
        $scope.cart.product_list.splice(index, 1);
        $scope.cart.total = +$scope.cart.total - +item.price;
        //recalc discount
        $scope.cart.discount = $scope.calcDiscount();
        //recalc adj_total
        $scope.cart.adj_total = +$scope.cart.total - +$scope.cart.discount;
        $scope.cart.slots.splice(index, 1);
        item_index = index;
        return false;
      }
    });
    $scope.cart.product_info.splice(item_index, 1);
    logEvent("remove_from_cart", item_id);

    if (item_id == $scope.selectedId) {
      $('.add-to-cart-button').removeClass('desense');
      $('.add-success').hide(100);
    }

    if ($scope.cart.product_list.length != 0) {
      if (! $scope.cart.promo.code) {$scope.cart.promo.code = "";}
      console.log("%OASYS,screen=pay&machineId="+machineID+"&productId="+$scope.cart.product_list.toString()+",code"+$scope.cart.promo.code+"&slot="+$scope.cart.slots.toString()+"?");
    } else {
      console.log("%OASYS,screen=list&?");
    }
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(function() {

      $('.add-to-cart-button').removeClass('desense');
      console.log("%OASYS,screen=list&?");
      $scope.cart.product_list = [];
      $scope.cart.product_info = [];
      $scope.cart.total = 0;
      $scope.cart.adj_total = 0;
      $scope.cart.discount = 0;
      $scope.cart.promo = {};
      $scope.promoCode = "";
      $scope.cart.slots = [];

      $('#code-applied').hide();
      $('#promo-button').show();

      logEvent("timeout_remove", 0);
      $scope.$digest();
    }, 60000)

  };
  $scope.addToCart = function(){
    $scope.pageReset();
    $('.add-to-cart-button').addClass('desense');
    var slot = 0;
    var lengthhooks = $scope.machine.hooks.length;
    for(var i=0; i<lengthhooks;i++){
      if ($scope.machine.hooks[i].status == 1) {
        var currentSku = $scope.machine.hooks[i].product.item_sku;
        if(currentSku==$scope.selectedId){
          slot = $scope.machine.hooks[i].id;
          break;
        }
      }
    }
    if(slot != 0){
      //find product details and display checkout window
      //$("#productList").css('opacity','.1');
      //$("#productView").show();


      clearTimeout(timeoutHandle);
      timeoutHandle = setTimeout(function() {
        $('.add-to-cart-button').removeClass('desense');
        console.log("%OASYS,screen=list&?");
        $scope.cart.product_list = [];
        $scope.cart.product_info = [];
        $scope.cart.total = 0;
        $scope.cart.adj_total = 0;
        $scope.cart.discount = 0;
        $scope.cart.promo = {};
        $scope.promoCode = "";
        $scope.cart.slots = [];

        $('#code-applied').hide();
        $('#promo-button').show();


        logEvent("timeout_add", 0);
        $scope.$digest();
      }, 60000)


      var inCart = false;
      $.each($scope.cart.product_list, function (index, item) {
        if (item == $scope.selectedId) {
          console.log('already in cart');
          inCart = true;
          return false;
        }
      });

      if (inCart) return;
      logEvent("add_to_cart", $scope.selectedId);
      $scope.cart.product_list.push($scope.selectedId);
      var product_info = {};
      product_info.name = $scope.selectedName;
      product_info.price = $scope.selectedPrice;
      product_info.id = $scope.selectedId;
      $scope.cart.product_info.push(product_info);
      $scope.cart.total = +$scope.cart.total + +$scope.selectedPrice;
      //recalc discount
      $scope.cart.discount = $scope.calcDiscount();
      //recalc adj_total
      $scope.cart.adj_total = +$scope.cart.total - +$scope.cart.discount;
      $scope.cart.slots.push(slot);
      var slots = "";
      var products = "";

      if (! $scope.cart.promo.code) {$scope.cart.promo.code = "";}
      console.log("%OASYS,screen=pay&machineId="+machineID+"&productId="+$scope.cart.product_list.toString()+",code"+$scope.cart.promo.code+"&slot="+$scope.cart.slots.toString()+"?");

      $('.add-success').show(500);
      setTimeout(function() {
        $('.add-success').hide(500);
      }, 3500);
      //window.location="/pay?machineId="+machineID+"&productId="+id+"&slot="+slot+"&column="+columnWithProduct;
    }
  };
  $scope.changeImage = function(img) {
    if (img == 'selectedImg') {
      $('#main-image').attr('src','/productImage/' + $scope.selectedImg);
    } else if (img == 'selectedDetailImg') {
      $('#main-image').attr('src','/productImage/' + $scope.selectedDetailImg);
    } else if (img == 'thumbnail') {
      $('#main-image').attr('src','/productImage/' + $scope.selectedThumbnail);
    }
    $scope.pageReset();
  };
  $scope.reportProblem = function(issue, screen) {
    $('.problem-dialog').show();
    logEvent("tap_report", 0);
    setTimeout(function() {
      $('.problem-dialog').hide();
    }, 45000);
    clearTimeout(pageTimeout);
  };
  $scope.howItWorks = function() {
    logEvent("tap_about", 0);
    $('.how-it-works').show();
    setTimeout(function() {
      $('.how-it-works').hide();
    }, 180000);
    $scope.pageReset();
  }
  $scope.enterPromo = function() {
    logEvent("tap_promo", 0);
    $('.promo-dialog').show();
    setTimeout(function() {
      $('.promo-dialog').hide();
    }, 180000);
    $scope.pageReset();
  }
  $scope.closePromo = function() {
    $('.promo-dialog').val("");
    $scope.promoCode = "";
    $('.promo-dialog').hide();
  }
  $scope.closeHowItWorks = function() {
    console.log('here');
    $('.suggestion-input').val("");
    $scope.suggestion = "";
    $('.how-it-works').hide();
    $scope.pageReset();
  }
  $scope.submitPromo = function() {
    //verify code
    var codeToApply;
    var noCode = true;
    $.each($scope.promos, function (index, item) {
      if ($scope.promoCode == item.code) {
        codeToApply = item;
        noCode = false;
        return false;
      }
    });
    if (noCode == true){
      //invalid code
      $('#invalid-code').show();
      $('#promo-button').hide();
      $scope.promoCode = "";
      $('.promo-dialog').val("");
      setTimeout(function() {
        $('#invalid-code').hide();
        $('#promo-button').show();
      }, 5000);
    } else {
      //apply code to total
      //calculate discount
      console.log(codeToApply);
      $scope.cart.promo = codeToApply;
      $scope.cart.discount = $scope.calcDiscount();
      $scope.cart.adj_total = +$scope.cart.total - +$scope.cart.discount;
      if ($scope.cart.adj_total < $scope.cart.total) {
        $('#code-applied').show();
        $('#promo-button').hide();
      }

    }
    //if cart isn't empty, new console message
    if ($scope.cart.product_list.length != 0) {
      if (! $scope.cart.promo.code) {$scope.cart.promo.code = "";}
      console.log("%OASYS,screen=pay&machineId="+machineID+"&productId="+$scope.cart.product_list.toString()+",code"+$scope.cart.promo.code+"&slot="+$scope.cart.slots.toString()+"?");
    }
    $('.promo-dialog').hide();
    $scope.pageReset;
  };
  $scope.calcDiscount = function() {
    var threshold = $scope.cart.promo.threshold;
    console.log(threshold);
    if (typeof threshold !== "undefined") {
      if ($scope.cart.total >= threshold) {
        var discount = $scope.cart.promo.flat_discount;
        var percDis = +$scope.cart.total * +$scope.cart.promo.percent_discount;
        percDis = +percDis / 100;
        discount = +discount + +percDis;
        return discount;
      } else {
        $scope.threshold = $scope.cart.promo.threshold;
        $('#invalid-threshold').show();
        $('#promo-button').hide();
        $scope.promoCode = "";
        $('.promo-dialog').val("");
        $scope.cart.promo = {};
        setTimeout(function() {
          $('#invalid-threshold').hide();
          $('#promo-button').show();
        }, 5000);
        return 0;
      }
    } else {
      return 0;
    }
  }
  $scope.reportBack = function() {
    $('.problem-dialog').hide();
    $('#problem-email').val("");
    $scope.pageReset();
  };
  $scope.submitSuggestion = function() {
    if ($scope.suggestion != "") {
      $.ajax({
        type: "POST",
        url: "/sendSuggestion",
        data: JSON.stringify({"machine_id": machineID, "suggestion": $scope.suggestion }),
        dataType: "json",
        headers: {
          "content-type": "application/json"
        },
      });
    }
    $scope.closeHowItWorks();
    $scope.pageReset();
  };
  $scope.addChar = function(char) {
    $scope.suggestion=$scope.suggestion+char;
    $scope.pageReset();
  };
  $scope.deleteChar = function() {
    $scope.suggestion=$scope.suggestion.substring(0, $scope.suggestion.length-1);
    $scope.pageReset();
  };
  $scope.addNum = function(char) {
    $scope.promoCode = $scope.promoCode+char;
    $scope.pageReset();
  };
  $scope.deleteNum = function() {
    $scope.promoCode = $scope.promoCode.substring(0, $scope.promoCode.length-1);
    $scope.pageReset();
  };
  $scope.submitReport = function() {
    $.ajax({
      type: "POST",
      url: "/reportProblem",
      data: JSON.stringify({"machine_id": machineID, "formData": $scope.formData }),
      dataType: "json",
      headers: {
        "content-type": "application/json"
      },
    });
    $('.problem-dialog').hide();
    $('#problem-email').val("");
    $('.report-problem').hide();
    $('.thank-you-report').show();
    //show thank you message
    setTimeout(function() {
      $('.thank-you-report').hide();
      $('.report-problem').show();
    }, 5000);
    $scope.pageReset();
  };

}

function logEvent(eventString, product_id) {
  if (typeof Android != 'undefined') {
	  console.log("android tap");
    Android.logTap(eventString, product_id);
  } else {
    //ajax request
	  console.log("ajax");
    $.ajax({
      type: "POST",
      url: "/logEvent",
      data: JSON.stringify({ "machine_id": getParameterByName("machineId"), "event_type": eventString,  "product_sku": product_id }),
      dataType: "json",
      headers: {
        "content-type": "application/json"
      }
    });
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
