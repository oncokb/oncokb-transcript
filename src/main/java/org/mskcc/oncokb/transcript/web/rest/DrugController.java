package org.mskcc.oncokb.transcript.web.rest;

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
@RequestMapping("/api")
public class DrugController {

    NcitService ncitService;

    private final Logger log = LoggerFactory.getLogger(DrugController.class);

    public DrugController(NcitService ncitService) {
        this.ncitService = ncitService;
    }

    @PostMapping("/update-ncit")
    public ResponseEntity<Void> compareTranscript() throws Exception {
        ncitService.updateNcitDrugs();
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
