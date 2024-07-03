package org.mskcc.oncokb.curation.config.application;

import org.mskcc.oncokb.curation.config.model.OncoKbConfig;
import org.mskcc.oncokb.curation.config.model.OncoKbCoreConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to OncoKB Curation.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties extends org.mskcc.oncokb.meta.model.application.ApplicationProperties {

    private OncoKbConfig oncokb;

    private FrontendProperties frontend;

    private FirebaseProperties firebase;

    private String oncokbDataRepoDir;

    private OncoKbCoreConfig oncokbCore;

    private String nihEutilsToken;

    public OncoKbCoreConfig getOncokbCore() {
        return oncokbCore;
    }

    public void setOncokbCore(OncoKbCoreConfig oncokbCore) {
        this.oncokbCore = oncokbCore;
    }

    public OncoKbConfig getOncokb() {
        return oncokb;
    }

    public void setOncokb(OncoKbConfig oncokb) {
        this.oncokb = oncokb;
    }

    public FrontendProperties getFrontend() {
        return this.frontend;
    }

    public void setFrontend(FrontendProperties frontend) {
        this.frontend = frontend;
    }

    public FirebaseProperties getFirebase() {
        return this.firebase;
    }

    public void setFirebase(FirebaseProperties firebase) {
        this.firebase = firebase;
    }

    public String getOncokbDataRepoDir() {
        return oncokbDataRepoDir;
    }

    public void setOncokbDataRepoDir(String oncokbDataRepoDir) {
        this.oncokbDataRepoDir = oncokbDataRepoDir;
    }

    public String getNihEutilsToken() {
        return nihEutilsToken;
    }

    public void setNihEutilsToken(String nihEutilsToken) {
        this.nihEutilsToken = nihEutilsToken;
    }
}
