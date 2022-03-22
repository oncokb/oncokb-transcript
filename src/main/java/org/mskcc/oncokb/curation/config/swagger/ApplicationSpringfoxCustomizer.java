package org.mskcc.oncokb.curation.config.swagger;

import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import springfox.documentation.service.AuthorizationScope;
import springfox.documentation.service.HttpAuthenticationScheme;
import springfox.documentation.service.SecurityReference;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import tech.jhipster.config.apidoc.customizer.SpringfoxCustomizer;

/**
 * Created by Hongxin Zhang on 2/17/21.
 */
public class ApplicationSpringfoxCustomizer implements SpringfoxCustomizer {

    private final Logger log = LoggerFactory.getLogger(ApplicationSpringfoxCustomizer.class);

    public ApplicationSpringfoxCustomizer() {}

    private SecurityContext securityContext() {
        return SecurityContext.builder().securityReferences(defaultAuth()).build();
    }

    private List<SecurityReference> defaultAuth() {
        final AuthorizationScope authorizationScope = new AuthorizationScope("global", "accessEverything");
        final AuthorizationScope[] authorizationScopes = new AuthorizationScope[] { authorizationScope };
        return Collections.singletonList(new SecurityReference("Authorization", authorizationScopes));
    }

    @Override
    public void customize(Docket docket) {
        log.debug("Customizing springfox docket...");
        HttpAuthenticationScheme authenticationScheme = HttpAuthenticationScheme.JWT_BEARER_BUILDER.name("Authorization").build();

        docket
            .securitySchemes(Collections.singletonList(authenticationScheme))
            .securityContexts(Collections.singletonList(securityContext()));
    }
}
