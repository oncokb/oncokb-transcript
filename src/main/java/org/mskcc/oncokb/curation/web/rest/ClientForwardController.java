package org.mskcc.oncokb.curation.web.rest;

import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

@Controller
public class ClientForwardController {

    @Autowired
    ApplicationProperties applicationProperties;

    @Autowired
    SpringTemplateEngine templateEngine;

    /**
     * Forwards any unmapped paths (except those containing a period) to the client {@code index.html}.
     *
     * @return forward to client {@code index.html}.
     */
    @GetMapping(value = "/index.html")
    public ResponseEntity<String> index() {
        Context context = new Context();
        context.setVariable("frontendConfig", applicationProperties.getFrontend());

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.TEXT_HTML);

        ResponseEntity<String> responseEntity = ResponseEntity.ok().headers(httpHeaders).body(templateEngine.process("index", context));
        return responseEntity;
    }

    /**
     * Forwards any unmapped paths (except those containing a period) to the client {@code index.html}.
     * @return forward to client {@code swagger-ui/index.html}.
     */
    @GetMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/";
    }
}
