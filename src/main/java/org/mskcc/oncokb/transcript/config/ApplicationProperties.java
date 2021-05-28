package org.mskcc.oncokb.transcript.config;

import org.mskcc.oncokb.transcript.config.model.OncoKbConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to OncoKB Transcript.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties extends org.mskcc.oncokb.meta.model.application.ApplicationProperties {

    private OncoKbConfig oncokb;

    public OncoKbConfig getOncokb() {
        return oncokb;
    }

    public void setOncokb(OncoKbConfig oncokb) {
        this.oncokb = oncokb;
    }
}
