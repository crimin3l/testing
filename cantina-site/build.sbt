name := "cantina-site"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  javaJdbc,
  javaJpa,
  "org.hibernate" % "hibernate-entitymanager" % "4.2.6.Final",
  "org.hibernate" % "hibernate-validator" % "5.0.1.Final",
  "mysql" % "mysql-connector-java" % "5.1.26",
  "org.codehaus.jackson" % "jackson-core-asl" % "1.9.13",
  "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.13",
  "org.apache.poi" % "poi" % "3.9",
  cache
)     

play.Project.playJavaSettings
