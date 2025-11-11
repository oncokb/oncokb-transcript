package org.mskcc.oncokb.curation.web.rest;

import java.util.List;
import java.util.Map;
import org.mskcc.oncokb.curation.service.OncoKbDataReleaseService;
import org.mskcc.oncokb.curation.service.dto.datarelease.SaveGeneJobStatus;
import org.mskcc.oncokb.curation.service.dto.datarelease.SaveGeneResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/data-release")
public class OncoKbDataReleaseResource {

    private final Logger log = LoggerFactory.getLogger(OncoKbDataReleaseResource.class);
    private final OncoKbDataReleaseService oncoKbDataReleaseService;

    public OncoKbDataReleaseResource(OncoKbDataReleaseService oncoKbDataReleaseService) {
        this.oncoKbDataReleaseService = oncoKbDataReleaseService;
    }

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SaveGeneResponse> triggerSave(@RequestBody(required = false) Map<String, List<Integer>> body) {
        try {
            List<Integer> ids = body == null ? null : body.get("entrezGeneIds");

            if (ids == null || ids.isEmpty()) {
                return oncoKbDataReleaseService.triggerSaveAll();
            }

            return oncoKbDataReleaseService.triggerSaveByEntrezIds(ids);
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to trigger gene data save", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to trigger gene data save");
        }
    }

    @GetMapping(value = "/status/{geneId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SaveGeneJobStatus> getGeneStatus(@PathVariable Integer geneId) {
        try {
            return oncoKbDataReleaseService.getGeneStatus(geneId);
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to fetch gene save status", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch gene save status");
        }
    }
}
