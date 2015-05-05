package controllers;

import java.io.File;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;

import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.ClientTokenRequest;
import com.braintreegateway.Environment;
import com.braintreegateway.Transaction;
//import com.braintreegateway.Result;
import com.braintreegateway.TransactionRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import models.Container;
import models.MachineModel;
import models.ProductModel;
import models.User;
import play.data.Form;
import play.libs.Json;
import play.mvc.*;
import views.html.*;

	public class FileService extends Controller {
	       public static Result getProductImage(String file){
		       	  String path = "/public/dynamicFiles/products/";
	              File myfile = new File (System.getenv("PWD")+path+file);
	              return ok(myfile);
	       }
	}