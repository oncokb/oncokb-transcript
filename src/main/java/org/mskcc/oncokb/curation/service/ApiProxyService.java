package org.mskcc.oncokb.curation.service;

import java.net.URI;
import java.net.URISyntaxException;
import javax.servlet.http.HttpServletRequest;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 *  * Service for proxying oncokb core requests
 *   * <p>
 *    * We use the {@link Async} annotation to send emails asynchronously.
 *     */
@Service
public class ApiProxyService {

    @Autowired
    private ApplicationProperties applicationProperties;

    public URI prepareURI(HttpServletRequest request) throws URISyntaxException {
        String queryString = request.getQueryString();
        return new URI(
            applicationProperties.getOncokbCore().getUrl() + request.getRequestURI() + (queryString == null ? "" : "?" + queryString)
        );
    }

    public URI prepareURI(String apiRequest) throws URISyntaxException {
        return new URI(applicationProperties.getOncokbCore().getUrl() + apiRequest);
    }

    public HttpHeaders prepareHttpHeaders(String contentType) {
        HttpHeaders httpHeaders = new HttpHeaders();
        if (contentType != null) {
            httpHeaders.setContentType(MediaType.valueOf(contentType));
        }

        return httpHeaders;
    }

    public ResponseEntity<String> exchangeRequest(String body, HttpMethod method, String contentType, String apiRequest)
        throws URISyntaxException {
        URI uri = prepareURI(apiRequest);

        HttpHeaders httpHeaders = prepareHttpHeaders(contentType);
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), String.class);
    }
}
