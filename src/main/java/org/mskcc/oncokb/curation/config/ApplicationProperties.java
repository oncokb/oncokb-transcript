package org.mskcc.oncokb.curation.config;

import org.mskcc.oncokb.curation.config.model.OncoKbConfig;
import org.mskcc.oncokb.meta.model.application.AWSProperties;
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
    private AWSProperties aws;

    public OncoKbConfig getOncokb() {
        return oncokb;
    }

    public void setOncokb(OncoKbConfig oncokb) {
        this.oncokb = oncokb;
    }

    public AWSProperties getAws() {
        return aws;
    }

    public void setAws(AWSProperties aws) {
        this.aws = aws;
    }
}
