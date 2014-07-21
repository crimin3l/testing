import sbt._
import Keys._

object ApplicationBuild extends Build {

    val appName         = "cantina-site"
    val appVersion      = "1.0"

    val appDependencies = Seq(
        "mysql" % "mysql-connector-java" % "5.1.26",
        "org.facebook4j" % "facebook4j-core" % "2.0.4",
        "org.jsoup" % "jsoup" % "1.7.3"
    )
}


