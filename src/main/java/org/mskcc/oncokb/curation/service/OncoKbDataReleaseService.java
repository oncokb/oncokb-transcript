package org.mskcc.oncokb.curation.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OncoKbDataReleaseService {

    private final ApplicationProperties applicationProperties;

    public OncoKbDataReleaseService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public ResponseEntity<String> triggerSaveAll() {
        String baseUrl = applicationProperties.getOncokbDataRelease().getUrl();
        String url = String.format("%s/api/v1/gene-data/save", baseUrl);

        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.exchange(url, HttpMethod.POST, HttpEntity.EMPTY, String.class);
    }

    public ResponseEntity<String> triggerSaveByEntrezIds(List<Integer> entrezGeneIds) {
        String baseUrl = applicationProperties.getOncokbDataRelease().getUrl();
        String url = String.format("%s/api/v1/gene-data/save", baseUrl);

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("entrezGeneIds", entrezGeneIds);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        return restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
    }
}
