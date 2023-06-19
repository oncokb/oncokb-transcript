# oncokb-curation

This application was generated using JHipster 7.2.0, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v7.2.0](https://www.jhipster.tech/documentation-archive/v7.2.0).

## Build production docker image

```
./mvnw -ntp package -Pprod verify jib:build -DskipTests -Djib.to.image=oncokb/oncokb-curation:0.6.0
```

## Development

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

```
yarn install
```

We use yarn scripts and [Webpack][] as our build system.

If you are using redis as a cache, you will have to launch a cache server.
To start your cache server, run:

```
docker-compose -f src/main/docker/redis.yml up -d
```

The cache can also be turned off by adding to the application yaml:

```
spring:
    cache:
        type: none
```

See [here](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-caching.html#boot-features-caching-provider-none) for details.

**WARNING**: If you using second level hibernate cache and disabling the spring cache, you have to disable the second level hibernate cache as well since they are using
the same CacheManager.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

```
./mvnw
yarn start
```

yarn is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `yarn update` and `yarn install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `yarn help update`.

The `yarn run` command will list all of the scripts available to run for this project.

### PWA Support

JHipster ships with PWA (Progressive Web App) support, and it's turned off by default. One of the main components of a PWA is a service worker.

The service worker initialization code is commented out by default. To enable it, uncomment the following code in `src/main/webapp/index.html`:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function () {
      console.log('Service Worker Registered');
    });
  }
</script>
```

Note: [Workbox](https://developers.google.com/web/tools/workbox/) powers JHipster's service worker. It dynamically generates the `service-worker.js` file.

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

```
yarn install --save --save-exact leaflet
```

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

```
yarn install --save-dev --save-exact @types/leaflet
```

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Note: There are still a few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

## Running application

### 1. Configure Keycloak and Google SSO

To log in to your app, you'll need to have [Keycloak](https://keycloak.org) up and running.

```
docker-compose -f src/main/docker/keycloak.yml up
```

If your keycloak server is not setup with docker (ie. with a keycloak helm chart), then add a new realm with the following [realm settings](src/main/docker/realm-config/oncokb-curation-realm.json) via import.

- Once keycloak server is running, go to `http://localhost:8080/auth` and click `Administration Console`
- Login with the credential `username: admin, password:admin`.
- In Keycloak go to **Realm Settings** > **Themes** > **Login Theme** and change value to `keycloak-oncokb`.
- Follow [instructions](https://support.google.com/cloud/answer/6158849) to obtain Google Oauth2 client id and secret.
- In Keycloak, go to **Identity Providers** > **Edit button on google provider** > **Replace client id and secret**
- Copy the redirect URL for the google identity provider. It should look like `http://localhost:8080/auth/realms/oncokb-curation/broker/google/endpoint`
- Go back to Google APIs & Services `Credentials` tab and click on your application. Add the redirect URL from the last step into the list with the label `Authorized redirect URIs`.

The security settings are in `src/main/resources/config/application.yml`.

- Include realm name in `spring.security.oauth2.client.provider.oidc.issue-uri` property.
- To find the client secret, go to keycloak admin console and look for `web_app` client. Find the `Credentials` tab and copy the client secret. Credentials tab will only show when the client's `Access Type = confidential`.

```yaml
spring:
  ...
  security:
    oauth2:
      client:
        provider:
          oidc:
            issuer-uri: http://localhost:8080/auth/realms/<realm-name>
        registration:
          oidc:
            client-id: web_app
            client-secret: CLIENT_SECRET
            scope: openid,profile,email
```

```

### 2. Run

```

./mvnw

```

## Building for production

### Packaging as jar

To build the final jar and optimize the oncokb-curation application for production, run:

```

./mvnw -Pprod clean verify

```

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

```

java -jar target/\*.jar

```

Then navigate to [http://localhost:9090](http://localhost:9090) in your browser.

### Packaging as war

To package your application as a war in order to deploy it to an application server, run:

```

./mvnw -Pprod,war clean verify

```

## Testing

To launch your application's tests, run:

```

./mvnw verify

```

### Client tests

Unit tests are run by [Jest][]. They're located in [src/test/javascript/](src/test/javascript/) and can be run with:

```

yarn test

```

For more information, refer to the [Running tests page][].

### Code quality

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```

docker-compose -f src/main/docker/sonar.yml up -d

```

Note: we have turned off authentication in [src/main/docker/sonar.yml](src/main/docker/sonar.yml) for out of the box experience while trying out SonarQube, for real use cases turn it back on.

You can run a Sonar analysis with using the [sonar-scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner) or by using the maven plugin.

Then, run a Sonar analysis:

```

./mvnw -Pprod clean verify sonar:sonar

```

If you need to re-run the Sonar phase, please be sure to specify at least the `initialize` phase since Sonar properties are loaded from the sonar-project.properties file.

```

./mvnw initialize sonar:sonar

```

For more information, refer to the [Code quality page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the [src/main/docker](src/main/docker) folder to launch required third party services.

For example, to start a mysql database in a docker container, run:

```

docker-compose -f src/main/docker/mysql.yml up -d

```

To stop it and remove the container, run:

```

docker-compose -f src/main/docker/mysql.yml down

```

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

```

./mvnw -Pprod verify jib:dockerBuild

```

Then run:

```

docker-compose -f src/main/docker/app.yml up -d

```

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`jhipster docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[jhipster homepage and latest documentation]: https://www.jhipster.tech
[jhipster 7.2.0 archive]: https://www.jhipster.tech/documentation-archive/v7.2.0
[using jhipster in development]: https://www.jhipster.tech/documentation-archive/v7.2.0/development/
[using docker and docker-compose]: https://www.jhipster.tech/documentation-archive/v7.2.0/docker-compose
[using jhipster in production]: https://www.jhipster.tech/documentation-archive/v7.2.0/production/
[running tests page]: https://www.jhipster.tech/documentation-archive/v7.2.0/running-tests/
[code quality page]: https://www.jhipster.tech/documentation-archive/v7.2.0/code-quality/
[setting up continuous integration]: https://www.jhipster.tech/documentation-archive/v7.2.0/setting-up-ci/
[node.js]: https://nodejs.org/
[yarn]: https://yarnpkg.org/
[webpack]: https://webpack.github.io/
[browsersync]: https://www.browsersync.io/
[jest]: https://facebook.github.io/jest/
[leaflet]: https://leafletjs.com/
[definitelytyped]: https://definitelytyped.org/
```
