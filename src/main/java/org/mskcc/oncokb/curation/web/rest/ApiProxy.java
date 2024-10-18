package org.mskcc.oncokb.curation.web.rest;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import org.mskcc.oncokb.curation.service.ApiProxyService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.springframework.http.*;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping({ "/legacy-api" })
public class ApiProxy {

    private final ApiProxyService apiProxyService;

    public ApiProxy(ApiProxyService apiProxyService) {
        this.apiProxyService = apiProxyService;
    }

    @RequestMapping(value = "/**", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> formDataProxy(
        @RequestParam MultiValueMap<String, Object> formParams,
        HttpMethod method,
        HttpServletRequest request
    ) throws URISyntaxException {
        URI uri = apiProxyService.prepareURI(request);

        HttpHeaders httpHeaders = apiProxyService.prepareHttpHeaders(request.getContentType());
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new FormHttpMessageConverter());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(formParams, httpHeaders);
        try {
            return restTemplate.exchange(uri, method, requestEntity, String.class);
        } catch (HttpClientErrorException httpClientErrorException) {
            if (
                httpClientErrorException.getStatusCode() != null && httpClientErrorException.getStatusCode().equals(HttpStatus.BAD_REQUEST)
            ) {
                throw new BadRequestAlertException(httpClientErrorException.getMessage(), "", "");
            } else {
                throw new ResponseStatusException(httpClientErrorException.getStatusCode(), httpClientErrorException.getMessage());
            }
        }
    }

    @RequestMapping(value = "/**", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> jsonProxy(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {
        URI uri = apiProxyService.prepareURI(request);

        HttpHeaders httpHeaders = apiProxyService.prepareHttpHeaders(request.getContentType());
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

        try {
            return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), String.class);
        } catch (HttpClientErrorException httpClientErrorException) {
            if (
                httpClientErrorException.getStatusCode() != null && httpClientErrorException.getStatusCode().equals(HttpStatus.BAD_REQUEST)
            ) {
                throw new BadRequestAlertException(httpClientErrorException.getMessage(), "", "");
            } else {
                throw new ResponseStatusException(httpClientErrorException.getStatusCode(), httpClientErrorException.getMessage());
            }
        }
    }
}
