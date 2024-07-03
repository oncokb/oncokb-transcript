package org.mskcc.oncokb.curation.web.rest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.AlterationAnnotationStatus;
import org.mskcc.oncokb.curation.domain.EntityStatus;
import org.mskcc.oncokb.curation.service.MainService;
import org.mskcc.oncokb.curation.web.rest.model.AnnotateAlterationBody;
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

    @PostMapping("/annotate-alterations")
    public ResponseEntity<List<AlterationAnnotationStatus>> annotateAlterations(
        @RequestBody List<AnnotateAlterationBody> alterationBodyList
    ) {
        log.debug("REST request to annotate alterations");

        List<AlterationAnnotationStatus> status = new ArrayList<>();
        alterationBodyList.forEach(alterationBody -> {
            AlterationAnnotationStatus annotationStatus = mainService.annotateAlteration(
                alterationBody.getReferenceGenome(),
                alterationBody.getAlteration()
            );
            annotationStatus.setQueryId(alterationBody.getQueryId());
            status.add(annotationStatus);
        });

        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}
