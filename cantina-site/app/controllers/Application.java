package controllers;

import play.*;
import play.mvc.*;

import views.html.*;

public class Application extends Controller {

    public static Result index() {
        return ok(frontend.render("Cantina"));
    }

    public static Result trackRoute() {
        return ok(track.render("Track"));
    }

    public static Result expressionRoute() {
        return ok(expression.render("Expression"));
    }

    public static Result aggregatorRoute() {
        return ok(aggregator.render("Wall"));
    }

    public static Result showMentions(){
        return ok(mentions.render());
    }

    public static Result showTrack(){
        return ok(tweets.render());
    }

    public static Result showExpression(){
        return ok(showExpression.render());
    }

    public static Result deleteExpression(){
        return ok(deleteExpression.render());
    }

    public static Result twitter() {
        return ok(twitter.render("Twitter"));
    }

    public static Result facebook() {
        return ok(facebook.render("Cantina-Facebook"));
    }

    public static Result profile() {
        return ok(profile.render("Cantina-Profile"));
    }

    public static Result showAccount(){
        return ok(twitterAccount.render());
    }

    public static Result showAccounts(){
        return ok(twitterAccounts.render());
    }

    public static Result showLinks(){
        return ok(links.render());
    }

    public static Result showFacebookAccounts(){
        return ok(facebookAccounts.render());
    }

    public static Result showFacebookAccount(){
        return ok(facebookAccount.render());
    }

    public static Result showProfileAccounts(){
        return ok(profileAccounts.render());
    }

    public static Result showProfileAccount(){
        return ok(profileAccount.render());
    }

    public static Result showAggregator(){
        return ok(aggregatorPosts.render());
    }

    public static Result forumRoute() {
        return ok(forum.render("Forum"));
    }

    public static Result showThreads(){
        return ok(threads.render());
    }

    public static Result messengerRoute() {
        return ok(messenger.render("Messenger"));
    }
    public static Result showMessengerThreads(){
        return ok(messengerThreads.render());
    }

    public static Result showMessengerThread(){
        return ok(messengerThread.render());
    }

    public static Result sites() {
        return ok(sites.render("Cantina-Sites"));
    }

    public static Result showSitesThreads(){
        return ok(sitesThreads.render());
    }

}
