package controllers;

import models.User;
import play.Play;
import play.api.libs.Codecs;
import play.data.Form;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import play.libs.Json;
import play.mvc.*;
import play.mvc.Http.MultipartFormData;
import play.mvc.Http.MultipartFormData.FilePart;
import views.html.*;

public class Brand extends Controller {

  public static boolean loggedIn() {
    if (session("user") == null) {
      return false;
    }
    return true;
  }

  public static Result brand() {
    if (!loggedIn()) {
      return redirect("/");
    }
    return ok(brand.render());
  }

  public static Result brandJson(String id){
    ObjectNode brand = Database.getBrand(id);
    return ok(brand);
  }

  public static Result postBrand() {
    if (!loggedIn()) {
      return redirect("/");
    }
    JsonNode jn = request().body().asJson();

    String name = jn.get("name").asText();
    String logo = jn.get("logo").asText();
    String description = jn.get("description").asText();
    String id = jn.get("id").asText();

    //validation
    boolean errorsFlag = false;
    ObjectNode response = Json.newObject();
    if (name.length() == 0) {
      response.put ("nameError", "name required");
      errorsFlag = true;
    }

    if (!errorsFlag) {
      if (id.length() > 0) {
        try {
          Database.editBrand(id, name, logo, description);
        } catch (SQLException e) {
          System.out.println(e.toString());
          errorsFlag = true;
          response.put("mainError", "Database error");
        }
      } else {
        try {
          Database.addBrand(name, logo, description);
        } catch (SQLException e) {
          System.out.println(e.toString());
          errorsFlag = true;
          response.put("mainError", "Database error");
        }
      }
    }

    if (errorsFlag) {
      response.put("success", "false");
    } else {
      response.put("success", "true");
    }

    return ok(response);
  }

  public static Result postBrandLogo() {

    if (!loggedIn()) {
      return redirect("/");
    }
    MultipartFormData body = request().body().asMultipartFormData();
    FilePart picture = body.getFile("files[]");

    if (picture != null) {
      String fileName = picture.getFilename();
      String extension = fileName.substring(fileName.length() - 4);
      File file = picture.getFile();

      UUID uid = UUID.fromString("38400000-8cf0-11bd-b23e-10b96e4ef00d");

      String uidString = uid.randomUUID().toString();

      if (!file.renameTo(new File("public/dynamicFiles/brands/"+uidString+extension))){
        ObjectNode resultFailed = Json.newObject();
        resultFailed.put("success", "false");
        return ok(resultFailed);
      }

      System.out.println("successful upload: " + uidString);
      ObjectNode result = Json.newObject();
      result.put("success", "true");
      result.put("filename", uidString + extension);
      return ok(result);
    } else {
      //error
      ObjectNode resultFailed = Json.newObject();
      resultFailed.put("success", "false");
      return ok(resultFailed);
    }
  }
}
