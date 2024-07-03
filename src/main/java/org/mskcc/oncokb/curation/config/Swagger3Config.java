package org.mskcc.oncokb.curation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Swagger3Config {

    @Bean
    public OpenAPI apiDocConfig() {
        return new OpenAPI()
            .info(new Info().title("oncokb-curation API").description("oncokb-curation API documentation").version("1.0.0"));
    }
}
