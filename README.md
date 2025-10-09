# OncoKB Curation

## Local Development

1. Before you can build this project, you must install the following
   dependencies on your machine:

   1. [Docker](https://www.docker.com/get-started).
   2. [mysql 8](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/).
   3. [Java 17](https://dev.java/download/) SDK.
   4. [Node.js](https://nodejs.org): We use Node to run a development web server
      and build the project. Depending on your system, you can install Node either
      from source or as a pre-packaged bundle. The version of node we are using can
      be found in the [.nvmrc](.nvmrc) file.

      - If you are using [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
        simply run the following commands from the root directory of the project
        to install and use the correct version of node.

      ```sh
      nvm install
      nvm use
      ```

   5. [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)

2. Copy the example dev yaml file

   ```sh
   cp src/main/resources/config/application-dev-example.yml src/main/resources/config/application-dev.yml
   ```

3. Run the brew command for the Mac in the [compiling section](https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling)
   of the node-canvas readme. For other systems, please see
   [compiling section](https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling)
   for instructions.

   ```sh
   brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
   ```

4. After installing Node and yarn, you should be able to run the following command
   to install development tools. You will only need to run this command when
   dependencies change in [package.json](package.json).

   ```sh
   yarn install
   ```

   We use yarn scripts and [Webpack](https://webpack.js.org/) as our build system.

5. If you are using redis as a cache, you will have to launch a cache server (Optional).

   - To start your cache server, run:

     ```sh
     docker-compose -f src/main/docker/redis.yml up
     ```

   - The cache can also be turned off by adding to the [application-dev.yaml](src/main/resources/config/application-dev.yml):

     ```yaml
     spring:
       cache:
         type: none
     ```

   See [here](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-caching.html#boot-features-caching-provider-none)
   for details.

6. Configure Keycloak and Google SSO

   To log in to your app, you'll need to have [Keycloak](https://keycloak.org)
   up and running.

   ```sh
   docker-compose -f src/main/docker/keycloak.yml up
   ```

   1. Once keycloak server is running, go to `http://localhost:8080` and click
      `Administration Console`
   2. Login with the credential `username: admin, password:admin`.

      - Note this will match the credentials in the [keycloak.yml](src/main/docker/keycloak.yml).

   3. [Create a realm](https://www.keycloak.org/docs/latest/server_admin/#proc-creating-a-realm_server_administration_guide)
      and name it `oncokb-curation`
   4. [Create a new openid-connect client](https://www.keycloak.org/docs/latest/server_admin/#assembly-managing-clients_server_administration_guide)
      - Set Access Type to `confidential`
      - Enable Standard Flow
      - Enable implicit flow
      - Disable access grants
      - Disable service accounts
      - Disable OAuth 2.0 Device Authorization Grant
      - Disable Authorization
      - Set valid Redirect URI's to `http://localhost:*` and `https://localhost:*`
      - Set Web Origins to `*`
   5. Follow [instructions](https://support.google.com/cloud/answer/6158849)
      to obtain Google Oauth2 client id and secret.
   6. In Keycloak, go to **Identity Providers** >
      **Edit button on google provider** > **Replace client id and secret**
   7. Copy the redirect URL for the google identity provider.
      It should look like `http://localhost:8080/realms/oncokb-curation/broker/google/endpoint`
   8. Go back to Google APIs & Services `Credentials` tab and click on your
      application. Add the redirect URL from the last step into the list with
      the label `Authorized redirect URIs`.

   9. Update the security settings in [application-dev.yml](src/main/resources/config/application-dev.yml).

      - Include realm name in the `spring.security.oauth2.client.provider.oidc.issue-uri`
        property.
      - To find the client secret, go to keycloak admin console and look for `web_app`
        client. Find the `Credentials` tab and copy the client secret.
        Credentials tab will only show when the client's `Access Type = confidential`.

      ```yaml
      spring:
        ...
        security:
          oauth2:
            client:
              provider:
                oidc:
                   issuer-uri: http://localhost:8080/realms/oncokb-curation
              registration:
                oidc:
                  client-id: web_app
                  client-secret: CLIENT_SECRET
                  scope: openid,profile,email
      ```

7. Configure Firebase

   1. Go to [Firebase Console](https://console.firebase.google.com/) and create
      a new project
      - You can disable Google Analytics
   2. Expand **Build** and click **Realtime Database**
   3. Click **Create Database**
      - You can use the default location
      - Start in locked mode
   4. Import a JSON file with seed data.
      - If you wish to have sample data for firebase then please contact
        [dev@oncokb.org](mailto:dev@oncokb.org)
   5. Click the **Rules** section of the **Realtime Database** page
   6. Create a Firebase Realtime Database and configure the rules as such:

      ```json
      {
        "rules": {
          ".read": "auth !== null && auth.token.firebaseAuthorizedUser === true",
          ".write": "auth !== null && auth.token.firebaseAuthorizedUser === true"
        }
      }
      ```

   7. Click **Publish** to save the changes
   8. Select gear icon next to **Project Overview**
   9. Click **Project settings**
   10. Choose **Service Accounts** on header
   11. Under **Firebase Admin SDK** section, click on **Generate new private key**
   12. Move the service account credentials under `src/main/resources/firebase.json`
       > [!WARNING]
       > Never commit the `firebase.json` file to git!
   13. Update `application.firebase.service-account-credentials-path`
       to the filename
   14. Under **Project Overview** page in the **General** tab under the **Your apps**
       section click the `</>` to add a web application.
   15. Pick whatever name you want to represent the oncokb curation frontend
       - You do not need to setup firebase hosting
   16. The resulting credential and paste them in the corresponding fields
       in `application.firebase`
   17. Copy example front configuration file

       ```sh
       cp local-frontend-config-example.json local-frontend-config.json
       ```

   18. Copy the same credentials you put in `application.firebase` into the `local-frontend-config.json`
       file.
   19. Expand **Build** and click **Authentication**
   20. Click the **Sign-in method** section and add email/password provider

8. Verify that your mysql configuration in [application-dev.yaml](src/main/resources/config/application-dev.yml)
   is correct for you mysql server instance.

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/oncokb_curation?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true
       username: root
       password: root
   ```

9. Run the application (Don't login just yet)

   - Note your a oncokb_curation schema will be created in your mysql database.
     Data will also be seeded for it.

   ```sh
   ./mvnw
   ```

10. Wait until the server is listening to requests and is able to redirect you to
    the login screen. (server url defaults to `http://localhost:9090`)

11. Add a login for yourself into your mysql instance. Replace <your_email>
    with your gmail email address.

    ```sql
    INSERT INTO `oncokb_curation`.`user`
    (
        `login`,
        `email`,
        `created_by`,
        `activated`)
    VALUES
        ('<your_email>',
         '<your_email>',
         'SYSTEM',
         1);

    SET @UserID = (SELECT Id
        FROM `oncokb_curation`.`user`
        WHERE email = '<your_email>');

    INSERT INTO `oncokb_curation`.`user_authority`
        (user_id, authority_name)
        VALUES
        (@UserId, 'ROLE_ADMIN'),
        (@UserId, 'ROLE_DEV'),
        (@UserId, 'ROLE_CURATOR'),
        (@UserId, 'ROLE_USER');

    ```

12. Login to curation!

## Building for production

### Packaging as jar

To build the final jar and optimize the oncokb-curation application for
production, run:

```sh
./mvnw -Pprod clean verify
```

This will concatenate and minify the client CSS and JavaScript files. It will
also modify `index.html` so it references these new files.
To ensure everything worked, run:

```sh
java -jar target/\*.jar
```

Then navigate to [http://localhost:9090](http://localhost:9090) in your browser.

### Packaging as war

To package your application as a war in order to deploy it to an application
server, run:

```sh
./mvnw -Pprod,war clean verify
```

## Testing

To launch your application's tests, run:

```sh
./mvnw verify
```

### Unit tests

#### Set up

To run the tests the first time, you need to follow the steps in below.

1. Run the brew command for the Mac in the [compiling section](https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling) of the node-canvas readme. For other systems, please see [compiling section](https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling) for instructions.

```sh
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

2. Install the new npm packages with yarn.

```sh
yarn install --frozen-lockfile
```

3. Log into the firebase CLI

```sh
npx firebase login
```

4. Create an emulated version of firebase locally.

```sh
npx firebase init
```

- Select `Set up local emulators for Firebase products`
- Name your project, for instance `oncokb-local`
- Enter when prompted for the project name so it defaulted to your project
- Select Authentication Emulator, Database Emulator when asked which emulators to setup

#### Run unit tests

Unit tests are run by [Jest](https://jestjs.io/docs/getting-started). They're
located in [src/test/javascript/](src/test/javascript/) and can be run with:

```sh
yarn test
```

### End-to-end tests

We use the [WebDriverIO](https://webdriver.io/) framework for our end-to-end testing, allowing us to test interactions like a user and take screenshots. We provide two options for running these tests: locally and in docker.

**IMPORTANT**: Expect the screenshot tests to fail if ran locally due to resolution issues. Local development for screenshot tests is only recommended during development for faster iteration. To update screenshots, wait for the [GitHub action](.github/workflows/webdriver-test.yml) after pushing your changes and retrieve the updated screenshots from the `actual` folder.

#### Run tests locally

1. Follow the [Set up](#set-up) instructions

2. Edit `initializeFirebase` function in firbase-app.store.ts

```sh
  initializeFirebase() {
   // Add the code at the begin of the function, you can find parameter value at application-dev.yml
    if (AppConfig.serverConfig.frontend) {
      AppConfig.serverConfig.frontend.firebase = {
        enabled: true,
        apiKey: "api-key",
        authDomain: "auth-domain",
        databaseUrl: "database-url",
        projectId: "project-id",
        storageBucket: "storage-bucket",
        messagingSenderId: "messageing-sender-id",
        appId: "app-id",
        measurementId: "measurement-id",
        connectToFirebaseEmulators: false,
      };
    }
```

3. Start up just the local client

```sh
yarn start
```

4. Start the firebase emulator

```sh
yarn run firebase-emulator
```

5. Run web driver IO

```sh
yarn run wdio
```

#### Run tests in Docker

Run `docker compose up` to build and run the tests. Make sure to update the images after making changes to the project.

## Build production docker image

If you are already logged into docker hub:

```sh
./mvnw -ntp package -Pprod verify jib:build -DskipTests -Djib.to.image=oncokb/oncokb-curation:0.6.0
```

If you want to explicitly pass a username and password:

```sh
./mvnw -ntp package \
    -Pprod verify \
    jib:build \
    -DskipTests \
    -Djib.to.image=oncokb/oncokb-curation:0.6.0 \
    -Djib.to.auth.username=USERNAME \
    -Djib.to.auth.password=PASSWORD
```
