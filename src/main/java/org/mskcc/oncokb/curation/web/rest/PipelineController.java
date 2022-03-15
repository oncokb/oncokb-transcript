package org.mskcc.oncokb.curation.web.rest;

import org.mskcc.oncokb.curation.service.GeneService;
import org.mskcc.oncokb.curation.service.NcitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller to drugs.
 */
@RestController
@RequestMapping("/api/pipeline/")
public class PipelineController {

    NcitService ncitService;
    GeneService geneService;

    private final Logger log = LoggerFactory.getLogger(PipelineController.class);

    public PipelineController(NcitService ncitService, GeneService geneService) {
        this.ncitService = ncitService;
        this.geneService = geneService;
    }

    @PostMapping("/update-ncit")
    public ResponseEntity<Void> updateNcit() throws Exception {
        ncitService.updateNcitDrugs();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/update-gene")
    public ResponseEntity<Void> updatePortalGene() throws Exception {
        geneService.updatePortalGenes();
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
