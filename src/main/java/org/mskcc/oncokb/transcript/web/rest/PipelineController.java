package org.mskcc.oncokb.transcript.web.rest;

import org.mskcc.oncokb.transcript.service.AactService;
import org.mskcc.oncokb.transcript.service.GeneService;
import org.mskcc.oncokb.transcript.service.NcitService;
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
    AactService aactService;

    private final Logger log = LoggerFactory.getLogger(PipelineController.class);

    public PipelineController(NcitService ncitService, GeneService geneService, AactService aactService) {
        this.ncitService = ncitService;
        this.geneService = geneService;
        this.aactService = aactService;
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

    @PostMapping("/update-clinical-trials")
    public ResponseEntity<Void> updateClinicalTrials() throws Exception {
        aactService.fetchLatestTrials();
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
