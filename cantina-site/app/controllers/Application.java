package controllers;

import play.*;
import play.mvc.*;

import views.html.*;

public class Application extends Controller {

    public static Result index() {
        return ok(sites.render("Cantina"));
    }

    // test stefan
    public static Result bla() {
        return ok(bla.render());
    }

    // test stefan end



    public static Result sites() {
        return ok(sites.render("Cantina-Sites"));
    }

    public static Result showSitesThreads(){
        return ok(sitesThreads.render());
    }


}
