package controllers;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Date;
import java.util.Locale;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.io.File;
import java.io.StringReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.FileWriter;

import com.avaje.ebean.Ebean;
import com.avaje.ebean.text.json.JsonContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import models.ActivityLogModel;
import models.Hook;
import models.Machine;
import models.Product;
import models.Sale;
import models.User;
import models.Event;
import play.Logger;
import play.data.Form;
import play.libs.Json;
import play.mvc.*;
import views.html.*;

public class MachineController extends Controller {

  private static final Logger.ALogger logger = Logger.of(MachineController.class);

	public static boolean loggedIn(){
		if(session("user")==null){
			return false;
		}
		return true;
	}

    public static Result machine(){
    	if(!loggedIn()){
    		return redirect("/");
    	}
    	return ok(machine.render());
    }

    public static Result activityLog(String machineId){
    	if(!loggedIn()){
    		return redirect("/");
    	}
    	return ok(activityLog.render());
    }
    
    public static Result activityLogData(String machineId, String begin, String end){
    	if(!loggedIn()){
    		return redirect("/");
    	}
    	
    	begin = begin + " 04:00:00.000";
    	end = end + " 04:00:00.000";
        DateFormat df = new SimpleDateFormat("MM-dd-yyyy HH:mm:ss");
		Date endDate = null;
		try {
			begin = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(df.parse(begin));
			endDate = df.parse(end);
		} catch (ParseException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}  
        System.out.println(begin); 
        endDate = new Date (endDate.getTime() + 86400000);
        end = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endDate);
        System.out.println(end);
        
    	ArrayList<ActivityLogModel> statusLogEntries = Database.getStatusUpdates(machineId,begin,end);
    	ArrayList<ActivityLogModel> actionLogEntries = Database.getUIEvents(machineId,begin,end);
    	ArrayList<ActivityLogModel> salesLogEntries = Database.getSales(machineId,begin,end);
    	
    	ArrayList<ActivityLogModel> combinedEntries = new ArrayList<ActivityLogModel>();
    	
    	int statusIndex = 0;
    	int actionIndex = 0;
    	int salesIndex = 0;
    	
    	int statusLength = statusLogEntries.size();
    	int actionLength = actionLogEntries.size();
    	int salesLength = salesLogEntries.size();
    	System.out.println(statusLength + ", " + actionLength + ", " +  salesLength);
    	
    	boolean useStatus, useAction, useSales;
    	
    	try{
	    	while(statusIndex<statusLength || actionIndex<actionLength || salesIndex<salesLength){
	    		//find next event chronologically
	    		useStatus=false;
	    		useAction=false;
	    		useSales=false;
	    		
	    		String string ="1900-01-01 00:00:00.000";
	    		
	    		Date statusDate= new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").parse(string);
				Date actionDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").parse(string);
	    		Date salesDate= new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").parse(string);
	    		
	    	
	    		if(statusIndex<statusLength){
	    			statusDate = statusLogEntries.get(statusIndex).date;
	    		}
	    		if(actionIndex<actionLength){
	    			actionDate = actionLogEntries.get(actionIndex).date;
	    		}
	    		if(salesIndex<salesLength){
	    			salesDate = salesLogEntries.get(salesIndex).date;
	    		}
    			if(statusDate.after(actionDate) && statusDate.after(salesDate)){
    				combinedEntries.add(statusLogEntries.get(statusIndex));
    				statusIndex++;
    			}else if(actionDate.after(statusDate) && actionDate.after(salesDate)){
    				combinedEntries.add(actionLogEntries.get(actionIndex));
    				actionIndex++;
    			}else{
    				combinedEntries.add(salesLogEntries.get(salesIndex));
    				salesIndex++;
    			}
	    	}
    	}catch(Exception e){
    		
    	}
    	
    	return ok(Json.toJson(combinedEntries));
    }



    public static Result postMachine(){

    	if(!loggedIn()){
    		return redirect("/");
    	}

    	JsonNode jn = request().body().asJson();

    	String id = jn.get("id").asText();

    	boolean errorsFlag=false;
    	ObjectNode response = Json.newObject();

    	if(id.length()>0){
		  Database.editMachineAndHooks(jn);
    	}else{
		  Database.addMachineAndHooks(jn);
    	}

    	if(errorsFlag){
    		response.put("success", "false");
    	}else{
    		response.put("success", "true");
    	}

     	return ok(response);
    }

    public static Result logStatus(){
    	//System.out.println(request().body().asJson().toString() + new Timestamp(System.currentTimeMillis()));
    	JsonNode jn = request().body().asJson();
        int machine_id = jn.get("machine_id").asInt();
        int traffic = jn.get("traffic").asInt();
    	int jammed = jn.get("jammed").asInt();
    	try {
    		Database.logMachineStatus(machine_id, jammed, traffic);
    	} catch (SQLException e) {
      	  System.out.println(e.toString());
    	}
    	return ok();
    }

    public static Result logEvent() {
    	JsonNode jn = request().body().asJson();
    	String machine_id = jn.get("machine_id").asText();
    	String event_type = jn.get("event_type").asText();
    	String product_sku = jn.get("product_sku").asText();
        Database.logEvent(machine_id, event_type, product_sku);
    	return ok();
    }
    
    public static Result machineJson(String id){

    	Machine machine = new Machine();

    	if(id.equals("-1")){
        	List<Hook> hooks = new ArrayList<Hook>();
        	for(int i=0;i<70;i++){
        		Hook hook = new Hook();
        		hook.id = i+1;
        		hook.status = 0;
        		hooks.add(hook);
        	}
        	machine.hooks = hooks;
    	} else {
        	machine = Database.getMachine(id);
    	}
		return ok(Json.toJson(machine));
    }
    
    public static Result machineSales(String id) {
    	return ok(machineSales.render());
    }
    
    public static Result machineTaps(String id) {
    	return ok(machineTaps.render());
    }

    public static Result getSales(String id) {
  	  Integer machine = Integer.parseInt(id);
  	  List<Sale> sales = Database.getSalesByMachine(machine);
  	  JsonContext json = Ebean.createJsonContext();
  	  String p = json.toJsonString(sales);
  	  return ok(p);
    }

    public static Result getTaps(String id) {
    	Integer machine = Integer.parseInt(id);
    	String events = Database.getTapsByMachine(machine);
    	return ok(events);
    }

    /**
     * Accept a batch of log entries from a machine.
     */
    @BodyParser.Of(value = BodyParser.Text.class, maxLength = 10 * 1024 * 1024)
    public static Result log(String machine) {
        try {
            // Throw an exception if machine ID is invalid.
            Database.getMachine(machine);

            // Log a "log" event.
            Database.logEvent(machine, "log");

            // Get POSTed log text.
            String text = request().body().asText();
            if (text == null) {
              throw new Exception("log: no body text?");
            }

            // Parse log entries, line by line.
            parseLogEntries(text);

            // Write the whole thing to a file.
            saveLog(machine, text);
        }
        catch (Exception e) {
            logger.error("/log/" + machine + " error", e); 
        }
        // Don't let the client know if something went wrong.
        return ok();
    }

    private static void parseLogEntries(String text) throws IOException {
        BufferedReader lineReader = new BufferedReader(new StringReader(text));
        String line;
        while ((line = lineReader.readLine()) != null) {
            // Do something with each line!
        }
    }

    private static void saveLog(String machine, String text) throws IOException {
        // The directory name should be a configuration option...
        File dir = new File("/tmp");
        String fName = "bt-" + machine + "-" + Long.toString(System.currentTimeMillis(), 16) + ".log";
        if (dir.isDirectory()) {
            FileWriter writer = new FileWriter(new File(dir, fName));
            writer.write(text);
            writer.close();
        }
    }
}
