package org.mskcc.oncokb.curation.config.swagger;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Created by Hongxin Zhang on 2/17/21.
 */
@Configuration
public class CustomSwaggerConfig {

    public CustomSwaggerConfig() {}

    @Bean
    public ApplicationSpringfoxCustomizer applicationSwaggerCustomizer() {
        return new ApplicationSpringfoxCustomizer();
    }
}
