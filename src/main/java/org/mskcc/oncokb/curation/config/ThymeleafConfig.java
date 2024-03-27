package org.mskcc.oncokb.curation.config;

import java.util.HashSet;
import java.util.Set;
import javax.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

@Configuration
public class ThymeleafConfig {

    public static final String STRING_ENCODING = "UTF-8";

    private SpringTemplateEngine templateEngine;

    /* ******************************************************************** */
    /*  THYMELEAF-SPECIFIC ARTIFACTS                                        */
    /*  TemplateResolver(3) <- TemplateEngine                               */
    /* ******************************************************************** */

    public ThymeleafConfig(SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    @PostConstruct
    public void extension() {
        // Adding resolves with resolvable patters
        templateEngine.addTemplateResolver(indexTemplateResolver());
    }

    private ITemplateResolver indexTemplateResolver() {
        final ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setOrder(Integer.valueOf(1));
        templateResolver.setPrefix("/static/");
        Set<String> patterns = new HashSet<>();
        patterns.add("index");
        templateResolver.setResolvablePatterns(patterns);
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCharacterEncoding(STRING_ENCODING);
        templateResolver.setCacheable(false);
        return templateResolver;
    }
}
