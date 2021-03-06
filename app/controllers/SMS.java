package controllers;
import java.text.NumberFormat;
import java.util.Map;
import java.util.HashMap;

import com.fasterxml.jackson.databind.JsonNode;
import com.twilio.sdk.resource.instance.Account;
import com.twilio.sdk.TwilioRestClient;
import com.twilio.sdk.TwilioRestException;
import com.twilio.sdk.resource.factory.MessageFactory;
import com.twilio.sdk.resource.instance.Message;

import java.util.ArrayList;
import java.util.List;

import models.Product;
import models.Receipt;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import play.mvc.*;


public class SMS extends Controller {

  public static final String ACCOUNT_SID = "AC8758e524bc09f7a4fb5da074d4da0f0c";
  public static final String AUTH_TOKEN = "75f2dc2fceca3353d55e883cb473b32e";


  //{
  //		"sales_id": "2",
  //		"phone_number": "amco1027@gmail.com"
  //}

  public static Result sendConfirm() {
	  System.out.println("sendSMS");
	  JsonNode jn  = request().body().asJson();
	  String phoneNumber = jn.get("phone_number").asText();
	  int salesId = jn.get("sales_id").asInt();
	  
	  try {
		  Database.addCustomer(phoneNumber,  "",  salesId);
	  } catch (Exception e) {
		  System.out.println(e.toString());
	  }
	  
	  try {
		  TwilioRestClient client = new TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN);
		  Account account = client.getAccount();
		  
		  MessageFactory messageFactory = account.getMessageFactory();
		  List<NameValuePair> params = new ArrayList<NameValuePair>();
	      params.add(new BasicNameValuePair("To", phoneNumber));
	      params.add(new BasicNameValuePair("From", "+18597590660"));
	      
	      String messageBody = "We're sorry your BeautyTouch experience was less than perfect! Thank you for reporting the problem. A customer service representative will be reaching out shortly or you can email us at info@beautytouch.co.";
	      params.add(new BasicNameValuePair("Body", messageBody));
	      Message sms = messageFactory.create(params);
	    }catch(Exception e){
	      System.out.println(e.toString());
	    }
	  return ok();
  }
  
  public static Result sendReceipt(){

    //get sales id and customer info
    JsonNode jn = request().body().asJson();
    int salesId = jn.get("sales_id").asInt();
    String phoneNumber = jn.get("phone_number").asText();
    String key = jn.get("key").asText();
    if(!Security.validKey(key)){
      return ok();
    }

    //add customer to database
    try{
      Database.addCustomer(phoneNumber,"",salesId);
    }catch(Exception e){
      System.out.println(e.toString());
    }

    //get product details from database
    Receipt receipt = Database.getReceiptDetails(salesId);


    try{
      TwilioRestClient client = new TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN);

      Account account = client.getAccount();

      MessageFactory messageFactory = account.getMessageFactory();
      List<NameValuePair> params = new ArrayList<NameValuePair>();
      params.add(new BasicNameValuePair("To", phoneNumber));
      params.add(new BasicNameValuePair("From", "+18597590660"));


      NumberFormat formatter = NumberFormat.getCurrencyInstance();

      String messageBody = "Thank you for your Oasys purchase!\n"+
        receipt.machineAddress+
        "\nSales #: "+salesId;

      String productRows = "\n";
      for(int i=0;i<receipt.products.size();i++){
        Product pm = receipt.products.get(i);
        productRows+=
          "\n"+pm.item_name+": "+formatter.format(Double.parseDouble(pm.price));
      }

      messageBody+=productRows;
      messageBody+="\n\nTotal: "+formatter.format(Double.parseDouble(receipt.total));


      params.add(new BasicNameValuePair("Body", messageBody));
      Message sms = messageFactory.create(params);
    }catch(Exception e){
      System.out.println(e.toString());
    }
    return ok();
  }

  public static Result reportProblem() {

    JsonNode jn = request().body().asJson();
    String machineId = jn.get("machine_id").asText();
    String email = "";
    String other = "";
    JsonNode fd = jn.get("formData");
    String problem = fd.get("problem").asText();
    if (fd.has("email")) {
    	email = fd.get("email").asText();
    }
    if (fd.has("other")) {
    	other = fd.get("other").asText();
    }
    String[] recipients = {
    		"+15617063230", //jackie
    		"+16095779836", //alina
    		"+18083937977", //shireen
    		"+17814756970", //james
    		"+16177941386"  //mackenzie
            };
    for (String recipient: recipients) {
      try {
        TwilioRestClient client = new TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN);
        Account account = client.getAccount();

        MessageFactory messageFactory = account.getMessageFactory();
        List<NameValuePair> params = new ArrayList<NameValuePair>();
        params.add(new BasicNameValuePair("To", recipient));
        params.add(new BasicNameValuePair("From", "+18597590660"));

        String messageBody = "Problem reported with machine: " + machineId + ". Issue: " + problem + ". ";
        if (other != "") {
    	    messageBody += "\"" + other + "\". ";
        }
        if (email != "") {
    	    messageBody += "Email: " + email;
        }

        params.add(new BasicNameValuePair("Body", messageBody));
        Message sms = messageFactory.create(params);
      }catch (Exception e) {
        System.out.println(e.toString());
      }
    }
    return ok();
  }
}
