package controllers;

import cantina.db.entity.site.Site;
import cantina.db.entity.site.SiteCategory;
import cantina.db.entity.messenger.PrvPost;
import cantina.db.entity.messenger.PrvMsg;
import cantina.db.entity.messenger.PrvMsgAuthor;
import cantina.db.entity.site.SiteCategoryMatch;
import cantina.db.entity.site.SiteFeed;
import play.*;
import play.mvc.*;

import views.html.*;

import java.lang.*;
import java.lang.Boolean;
import java.lang.Integer;
import java.lang.Object;
import java.lang.String;
import java.lang.System;
import java.util.List;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;
import java.text.SimpleDateFormat;
import java.util.Map;
import java.util.HashMap;
import java.math.BigInteger;
import java.util.LinkedList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;

import play.mvc.Controller;
import play.libs.*;
import play.db.jpa.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.codehaus.jackson.JsonNode;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import javax.persistence.NoResultException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class SitesTrack extends Controller {

    @Transactional
    public static Result getCategories() {
        String query = "from SiteCategory";
        List<SiteCategory> categories = JPA.em().createQuery(query, SiteCategory.class).getResultList();
        ObjectNode result = Json.newObject();
        ArrayNode an = result.putArray("categories");

        ObjectNode elementAll = Json.newObject();
        elementAll.put("id", 0);
        elementAll.put("name", "All sites");
        an.add(elementAll);

        for(SiteCategory category: categories){
            ObjectNode element = Json.newObject();
            element.put("id", category.getId());
            element.put("name", category.getName());
            an.add(element);
        }

        String resultString = result.toString();

        int poz = resultString.indexOf('[');
        resultString = resultString.substring(poz, resultString.length()-1);
        return ok(resultString);
    }

    @Transactional
    public static Result getThreads(Integer id, Integer count, Integer offset, String keyword) {

        ObjectNode result = Json.newObject();
        //String query = "from Site";
        String query = "SELECT s FROM Site s JOIN s.matches sm WHERE sm.site.id=s.id AND sm.category.id=" + id;
        if(keyword.length() >= 4) {
            query = "SELECT s FROM Site s JOIN s.matches sm WHERE sm.site.id=s.id AND sm.category.id=" + id + " AND s.url LIKE '%" + keyword + "%'";
        }

        if(id == 0) {
            query = "SELECT s FROM Site s";
            if(keyword.length() >= 4) {
                query = "SELECT s FROM Site s WHERE s.url LIKE '%" + keyword + "%'";
            }
        }

        List<Site> threads = JPA.em().createQuery(query, Site.class)
                .setFirstResult(offset)
                .setMaxResults(count)
                .getResultList();

        ArrayNode an = result.putArray("threads");
        for(Site thread: threads) {
            ObjectNode element = Json.newObject();
            element.put("id", thread.getId());
            if(thread.getLastVisit() != null) {
                element.put("last_visit", thread.getLastVisit().getTime());
            }
            else {
                element.put("last_visit", 0);
            }
            element.put("platform", thread.getPlatform());
            element.put("status", thread.getStatus());
            element.put("url", thread.getUrl());

            if (thread.getFeeds() != null) {

                ObjectNode rssResult = Json.newObject();
                ArrayNode rssArray = rssResult.putArray("rss");
                for(SiteFeed siteFeed: thread.getFeeds()) {
                    ObjectNode rssElement = Json.newObject();
                    rssElement.put("id", siteFeed.getId());
                    rssElement.put("url", siteFeed.getUrl());
                    rssArray.add(rssElement);
                }
                element.putAll(rssResult);
            }

            List<SiteCategoryMatch> categoriesMatch = JPA.em().createQuery("SELECT scm FROM SiteCategoryMatch scm WHERE scm.site.id=" + thread.getId(), SiteCategoryMatch.class)
                    .getResultList();

            if (categoriesMatch != null) {

                ObjectNode categoriesResult = Json.newObject();
                ArrayNode categoriesArray = categoriesResult.putArray("categories");
                for(SiteCategoryMatch categoryMatch: categoriesMatch) {
                    ObjectNode categoryElement = Json.newObject();
                    categoryElement.put("id", categoryMatch.getId());
                    categoryElement.put("id_category", categoryMatch.getCategory().getId());
                    categoryElement.put("name", categoryMatch.getCategory().getName());
                    categoriesArray.add(categoryElement);
                }
                element.putAll(categoriesResult);
            }

            if(thread.getPerson() != null) {
                element.put("person", thread.getPerson().getName());
            }
            else {
                element.put("person", "null");
            }
            //element.put("post_number", thread.getTotalPosts());
            an.add(element);
        }
        String resultString = result.toString();

        int poz = resultString.indexOf('[');
        resultString = resultString.substring(poz, resultString.length()-1);
        return ok(resultString);
    }

    @Transactional
    public static Result getThreadsNumber(Integer id, String keyword) {

        String query = "SELECT COUNT(*) FROM site s, site_category_match scm WHERE scm.site_id=s.id AND scm.category_id=" + id;
        if(keyword.length() >= 4)
            query = "SELECT COUNT(*) FROM site s, site_category_match scm WHERE scm.site_id=s.id AND scm.category_id = " + id + " AND s.url LIKE '%" + keyword + "%'";

        if(id == 0) {
            query = "SELECT COUNT(*) FROM site s";
            if(keyword.length() >= 4)
                query = "SELECT COUNT(*) FROM site s WHERE s.url LIKE '%" + keyword + "%'";
        }

        int count = Integer.parseInt(JPA.em().createNativeQuery(query).getSingleResult().toString());

        ObjectNode result = Json.newObject();
        result.put("count", count);
        return ok(result);

    }

    //method for updating site field from the database
    @Transactional
    public static Result updateSite(Integer id) {

        Http.RequestBody body = request().body();

        Integer platform = body.asJson().get("platform").intValue();
        String url = body.asJson().get("url").toString();
        url = url.replaceAll("\"", "");
        String newRss = null;
        if(body.asJson().get("new_rss") != null) {
            newRss = body.asJson().get("new_rss").toString();
            newRss = newRss.replaceAll("\"","");
        }

        //new category selected by client to specific site
        Integer newCategory = null;

        if(body.asJson().get("new_category") != null) {
            newCategory = body.asJson().get("new_category").intValue();
        }


        //extract the site identified by the id parameter from the DB
        String query = "SELECT s FROM Site s WHERE s.id=" + id;
        Site site = JPA.em().createQuery(query, Site.class).getSingleResult();

        //insertDB variable is used to check if any new value sent by the client is different from the old value extracted from the DB
        int insertDB = 0;

        if(platform != site.getPlatform()) {
            site.setPlatform(platform);
            insertDB = 1;
        }

        if(!(url.equals(site.getUrl()))) {
            site.setUrl(url);
            insertDB = 1;
        }

        //if there is any value different, the site entity will be updated
        if(insertDB == 1) {
            JPA.em().persist(site);
        }

        int countRss = body.asJson().get("rss_array").size();

        //for each rss entry sent by the client, check if the url was modified from the initial values stored in the DB
        for(int i = 0; i < countRss; i++) {

            int rssId = body.asJson().get("rss_array").get(i).get("id").intValue();
            String rssUrl = body.asJson().get("rss_array").get(i).get("url").toString();
            rssUrl = rssUrl.replaceAll("\"", "");
            SiteFeed siteFeed = JPA.em().createQuery("SELECT sf FROM SiteFeed sf WHERE sf.id="+rssId, SiteFeed.class).getSingleResult();

            if(!(rssUrl.equals(siteFeed))) {
                siteFeed.setUrl(rssUrl);
                JPA.em().persist(siteFeed);
            }
        }

        //search if there is a new rss added from the client
        if(newRss != null) {
            SiteFeed siteFeed = new SiteFeed();
            siteFeed.setUrl(newRss);
            siteFeed.setSite(site);
            JPA.em().persist(siteFeed);
        }

        //category
        int countCategory = body.asJson().get("categories_array").size();

        //for each category entry sent by the client, check if the id was modified from the initial values stored in the DB
       // TO DO insert  a match in site category match table
       for(int i = 0; i < countCategory; i++) {

           int categoryMatchId = body.asJson().get("categories_array").get(i).get("id").intValue();
           int categoryId = body.asJson().get("categories_array").get(i).get("id_category").intValue();

           SiteCategoryMatch siteCategoryMatch = JPA.em().createQuery("SELECT scm FROM SiteCategoryMatch scm WHERE scm.id=" + categoryMatchId, SiteCategoryMatch.class).getSingleResult();

           if(categoryId == 0) {
               JPA.em().remove(siteCategoryMatch);
           }
           else {
               if (siteCategoryMatch.getCategory().getId() != categoryId) {
                   SiteCategory siteCategory = JPA.em().createQuery("SELECT sc FROM SiteCategory sc WHERE sc.id=" + categoryId, SiteCategory.class).getSingleResult();
                   siteCategoryMatch.setCategory(siteCategory);
                   JPA.em().persist(siteCategoryMatch);
               }
           }
       }

        //search if there is a new category added from the client; create new category match if it isn't
        if(newCategory != null ) {
            SiteCategoryMatch siteCategoryMatch = new SiteCategoryMatch();
            if(newCategory != 0) {
                SiteCategory siteCategory = JPA.em().createQuery("SELECT sc FROM SiteCategory sc WHERE sc.id=" + newCategory, SiteCategory.class).getSingleResult();
                siteCategoryMatch.setCategory(siteCategory);
                siteCategoryMatch.setSite(site);
                JPA.em().persist(siteCategoryMatch);
            }
        }
        //System.out.println(newCategory);
        return created();
    }

    @Transactional
    public static Result addThread() {

        Http.RequestBody body = request().body();

        String thread = body.asJson().get("thread").toString();

        thread = thread.replaceAll("\"", "");

        thread = cleanUrl(thread);
        thread = removeWww(thread);
        thread = getTopDomain(thread);

        String query = "SELECT COUNT(*) from site  WHERE url LIKE '"+ thread +"'";

        int count = Integer.parseInt(JPA.em().createNativeQuery(query).getSingleResult().toString());

        if(count == 0) {

            try {
                Site site = new Site();
                site.setUrl(thread);
                JPA.em().persist(site);
            }
            catch (Exception e) {

            }
        }
        return created();
    }

    public static String cleanUrl (String url) {

        url = url.trim();

        // Eliminates http://
        if (url.length() >= 7 && url.substring(0, 7).equals("http://"))
            url = url.substring(7);

        // Eliminates https://
        if (url.length() >= 8 && url.substring(0, 8).equals("https://"))
            url = url.substring(8);

        // Eliminates '/' from the end
        if (url.substring(url.length()-1).equals("/"))
            url = url.substring(0, url.length()-1);

        return url;
    }

    public static String removeWww (String url) {

        if (url.startsWith("www."))
            return url.substring(4);

        return url;
    }

    public static String getTopDomain (String url) {

        String domain;

        if (url.contains("/")) {

            int index = url.indexOf("/");
            domain = url.substring(0, index);

        } else {
            domain = url;
        }

        return domain;
    }

    @Transactional
    public static Result addCategory() {

        Http.RequestBody body = request().body();
        String category = "";
        if(body.asJson().get("category") != null)
            category = body.asJson().get("category").toString();
        category = category.replaceAll("\"", "");

        ObjectNode result = Json.newObject();
        ObjectNode errorName = Json.newObject();

        if(category == null || category == "" || category.length() == 0) {
            errorName.put("name", "Category name is required!");
            result.put("errors", errorName);
            result.put("success", false);
        }
        else {

            String query = "SELECT COUNT(*) from site_category  WHERE name LIKE '" + category + "'";

            int count = Integer.parseInt(JPA.em().createNativeQuery(query).getSingleResult().toString());

            if(count == 0) {
                SiteCategory siteCategory = new SiteCategory();
                siteCategory.setName(category);
                JPA.em().persist(siteCategory);

                result.put("message", "Success!");
                result.put("success", true);
            }
            else {
                errorName.put("name", "Category duplicate!");
                result.put("errors", errorName);
                result.put("success", false);
            }
        }

        return created(result);
    }

    //TO DO
    @Transactional
    public static Result addSite() {

        Http.RequestBody body = request().body();
        String url= "";
        if(body.asJson().get("url") != null)
            url = body.asJson().get("url").toString();
        url = url.replaceAll("\"", "");

        ObjectNode result = Json.newObject();
        ObjectNode errorName = Json.newObject();

        if(url == null || url == "" || url.length() == 0) {
            errorName.put("name", "Site URL is required!");
            result.put("errors", errorName);
            result.put("success", false);
        }
        else {

            String query = "SELECT COUNT(*) from site  WHERE url LIKE '" + url + "'";

            int count = Integer.parseInt(JPA.em().createNativeQuery(query).getSingleResult().toString());

            if(count == 0) {
                Site site = new Site();
                site.setUrl(url);
                JPA.em().persist(site);

                result.put("message", "Success!");
                result.put("success", true);
            }
            else {
                errorName.put("name", "Site duplicate!");
                result.put("errors", errorName);
                result.put("success", false);
            }
        }

        return created(result);
    }

    @play.db.jpa.Transactional
    public static Result deleteCategory() {

        Http.RequestBody body = request().body();
        String catId = body.asJson().get("id").toString();
        catId = catId.replaceAll("\"", "");
        Integer categoryId = Integer.parseInt(catId);

        //Delete category and remove category match from the database for each site
        List<SiteCategoryMatch> siteCategoryMatches = JPA.em().createQuery("SELECT scm FROM SiteCategoryMatch scm WHERE scm.category.id= :category_id", SiteCategoryMatch.class)
                .setParameter("category_id", categoryId)
                .getResultList();

        if(siteCategoryMatches != null) {
            for(SiteCategoryMatch siteCategoryMatch: siteCategoryMatches) {
                JPA.em().remove(siteCategoryMatch);
            }
        }

        SiteCategory siteCategory = JPA.em().find(SiteCategory.class, categoryId);
        JPA.em().remove(siteCategory);

        return noContent();
    }
}