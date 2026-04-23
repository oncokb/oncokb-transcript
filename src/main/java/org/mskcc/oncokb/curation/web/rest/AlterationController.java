package org.mskcc.oncokb.curation.web.rest;

import java.util.ArrayList;
import java.util.List;
import org.mskcc.oncokb.curation.domain.AlterationAnnotationStatus;
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

    private static final int DEFAULT_PROTEIN_START = -1;
    private static final int DEFAULT_PROTEIN_END = 100_000;

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
            setDefaultProteinPositions(annotationStatus);
            status.add(annotationStatus);
        });

        return new ResponseEntity<>(status, HttpStatus.OK);
    }

    private void setDefaultProteinPositions(AlterationAnnotationStatus annotationStatus) {
        if (annotationStatus.getEntity() == null) {
            return;
        }
        if (annotationStatus.getEntity().getStart() == null) {
            annotationStatus.getEntity().setStart(DEFAULT_PROTEIN_START);
        }
        if (annotationStatus.getEntity().getEnd() == null) {
            annotationStatus.getEntity().setEnd(DEFAULT_PROTEIN_END);
        }
    }
}
