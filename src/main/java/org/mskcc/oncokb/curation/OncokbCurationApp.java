package org.mskcc.oncokb.curation;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.config.application.FrontendProperties;
import org.mskcc.oncokb.curation.importer.CdxImporter;
import org.mskcc.oncokb.curation.importer.Importer;
import org.oncokb.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.env.Environment;
import tech.jhipster.config.DefaultProfileUtil;
import tech.jhipster.config.JHipsterConstants;

@SpringBootApplication
@EnableConfigurationProperties({ LiquibaseProperties.class, ApplicationProperties.class })
public class OncokbCurationApp {

    @Autowired
    private Importer importer;

    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    CdxImporter cdxImporter;

    private static final Logger log = LoggerFactory.getLogger(OncokbCurationApp.class);

    private final Environment env;

    public OncokbCurationApp(Environment env) {
        this.env = env;
    }

    /**
     * Initializes oncokb-curation.
     * <p>
     * Spring profiles can be configured with a program argument --spring.profiles.active=your-active-profile
     * <p>
     * You can find more information on how profiles work with JHipster on <a href="https://www.jhipster.tech/profiles/">https://www.jhipster.tech/profiles/</a>.
     */
    @PostConstruct
    public void initApplication() {
        Collection<String> activeProfiles = Arrays.asList(env.getActiveProfiles());
        if (
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) &&
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_PRODUCTION)
        ) {
            log.error(
                "You have misconfigured your application! It should not run " + "with both the 'dev' and 'prod' profiles at the same time."
            );
        }
        if (
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) &&
            activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_CLOUD)
        ) {
            log.error(
                "You have misconfigured your application! It should not " + "run with both the 'dev' and 'cloud' profiles at the same time."
            );
        }

        // Copy firebase properties to FrontendProperties
        if (applicationProperties.getFirebase() != null) {
            if (applicationProperties.getFrontend() == null) {
                applicationProperties.setFrontend(new FrontendProperties());
            }
            applicationProperties.getFrontend().setFirebase(applicationProperties.getFirebase());
        }
    }

    @PostConstruct
    public void importOncoKbSequence() throws ApiException, IOException {
        Collection<String> activeProfiles = Arrays.asList(
            env.getActiveProfiles().length == 0 ? env.getDefaultProfiles() : env.getActiveProfiles()
        );
        if (activeProfiles.contains("importer")) {
            importer.generalImport();
        }
    }

    @PostConstruct
    public void initFirebase() throws IOException {
        if (applicationProperties.getFirebase().isEnabled()) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(
                    GoogleCredentials.fromStream(
                        getClass()
                            .getClassLoader()
                            .getResource(applicationProperties.getFrontend().getFirebase().getServiceAccountCredentialsPath())
                            .openStream()
                    )
                )
                .setDatabaseUrl(applicationProperties.getFrontend().getFirebase().getDatabaseUrl())
                .build();

            FirebaseApp.initializeApp(options);
        }
    }

    @PostConstruct
    public void importInitialCdxData() throws IOException {
        Collection<String> activeProfiles = Arrays.asList(
            env.getActiveProfiles().length == 0 ? env.getDefaultProfiles() : env.getActiveProfiles()
        );
        if (activeProfiles.contains("cdx-importer")) {
            cdxImporter.importCdxMain();
        }
    }

    /**
     * Main method, used to run the application.
     *
     * @param args the command line arguments.
     */
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(OncokbCurationApp.class);
        DefaultProfileUtil.addDefaultProfile(app);
        Environment env = app.run(args).getEnvironment();
        logApplicationStartup(env);
    }

    private static void logApplicationStartup(Environment env) {
        String protocol = Optional.ofNullable(env.getProperty("server.ssl.key-store")).map(key -> "https").orElse("http");
        String serverPort = env.getProperty("server.port");
        String contextPath = Optional
            .ofNullable(env.getProperty("server.servlet.context-path"))
            .filter(StringUtils::isNotBlank)
            .orElse("/");
        String hostAddress = "localhost";
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.warn("The host name could not be determined, using `localhost` as fallback");
        }
        log.info(
            "\n----------------------------------------------------------\n\t" +
            "Application '{}' is running! Access URLs:\n\t" +
            "Local: \t\t{}://localhost:{}{}\n\t" +
            "External: \t{}://{}:{}{}\n\t" +
            "Profile(s): \t{}\n----------------------------------------------------------",
            env.getProperty("spring.application.name"),
            protocol,
            serverPort,
            contextPath,
            protocol,
            hostAddress,
            serverPort,
            contextPath,
            env.getActiveProfiles().length == 0 ? env.getDefaultProfiles() : env.getActiveProfiles()
        );
    }
}
