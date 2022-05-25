package org.mskcc.oncokb.curation.web.rest;

import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.service.MainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AlterationController {

    private final Logger log = LoggerFactory.getLogger(AlterationController.class);

    private final MainService mainService;

    public AlterationController(MainService mainService) {
        this.mainService = mainService;
    }

    @PostMapping("/annotate-alteration")
    public ResponseEntity<Alteration> annotateAlteration(@RequestBody Alteration alteration) {
        log.debug("REST request to annotate alteration : {}", alteration);

        mainService.annotateAlteration(alteration);

        return new ResponseEntity<>(alteration, HttpStatus.OK);
    }
}
