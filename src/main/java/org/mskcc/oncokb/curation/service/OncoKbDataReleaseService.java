package org.mskcc.oncokb.curation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.service.dto.datarelease.SaveGeneJobStatus;
import org.mskcc.oncokb.curation.service.dto.datarelease.SaveGeneResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OncoKbDataReleaseService {

    private final ApplicationProperties applicationProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private ObjectMapper objectMapper;

    public OncoKbDataReleaseService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public ResponseEntity<SaveGeneResponse> triggerSaveAll() {
        String url = applicationProperties.getOncokbDataRelease().getUrl() + "/api/v1/gene-data/save";
        return restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(null, jsonHeaders()), SaveGeneResponse.class);
    }

    public ResponseEntity<SaveGeneResponse> triggerSaveByEntrezIds(List<Integer> entrezGeneIds) {
        String url = applicationProperties.getOncokbDataRelease().getUrl() + "/api/v1/gene-data/save";

        Map<String, Object> payload = new HashMap<>();
        payload.put("entrezGeneIds", entrezGeneIds);

        return restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(payload, jsonHeaders()), SaveGeneResponse.class);
    }

    public ResponseEntity<SaveGeneJobStatus> getGeneStatus(Integer geneId) {
        String url = applicationProperties.getOncokbDataRelease().getUrl() + "/api/v1/gene-data/status/" + geneId;

        ResponseEntity<String> raw = restTemplate.getForEntity(url, String.class);

        try {
            SaveGeneJobStatus parsed = objectMapper.readValue(raw.getBody(), SaveGeneJobStatus.class);
            return ResponseEntity.status(raw.getStatusCode()).body(parsed);
        } catch (JsonProcessingException e) {
            SaveGeneJobStatus errorResponse = new SaveGeneJobStatus();
            errorResponse.setStatus("error");
            errorResponse.setError("Failed to process JSON response: " + e.getOriginalMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
