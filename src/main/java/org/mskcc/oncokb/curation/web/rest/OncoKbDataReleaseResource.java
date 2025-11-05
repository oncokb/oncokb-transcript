package org.mskcc.oncokb.curation.web.rest;

import java.util.List;
import java.util.Map;
import org.mskcc.oncokb.curation.service.OncoKbDataReleaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    /**
     * Trigger gene data save. If body contains entrezGeneIds, triggers save for those genes.
     * If no body or empty list is provided, triggers save for all genes.
     */
    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> triggerSave(@RequestBody(required = false) Map<String, List<Integer>> body) {
        try {
            List<Integer> ids = body == null ? null : body.get("entrezGeneIds");
            if (ids == null || ids.isEmpty()) {
                oncoKbDataReleaseService.triggerSaveAll();
            } else {
                oncoKbDataReleaseService.triggerSaveByEntrezIds(ids);
            }
            return ResponseEntity.noContent().build();
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(e.getStatusCode(), e.getMessage());
        } catch (Exception e) {
            log.error("Failed to trigger gene data save", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to trigger gene data save");
        }
    }
}
