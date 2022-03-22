package org.mskcc.oncokb.curation.web.rest;

import io.swagger.annotations.ApiParam;
import java.util.Optional;
import org.genome_nexus.ApiException;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class EnsemblGeneController {

    private final Logger log = LoggerFactory.getLogger(EnsemblGeneController.class);

    private final MainService mainService;

    public EnsemblGeneController(MainService mainService) {
        this.mainService = mainService;
    }

    @PostMapping("/add-ensembl-gene")
    public ResponseEntity<EnsemblGene> addEnsemblGene(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam int entrezGeneId,
        @RequestParam String ensemblGeneId,
        @ApiParam(defaultValue = "false") @RequestParam Boolean isCanonical
    ) throws ApiException {
        Optional<EnsemblGene> savedEnsemblGeneOptional = mainService.createEnsemblGene(
            referenceGenome,
            ensemblGeneId,
            entrezGeneId,
            isCanonical
        );
        return new ResponseEntity<>(savedEnsemblGeneOptional.get(), HttpStatus.OK);
    }
}
