package org.mskcc.oncokb.transcript.web.rest;

import io.swagger.annotations.ApiParam;
import java.util.Optional;
import javax.validation.constraints.NotNull;
import org.genome_nexus.ApiException;
import org.mskcc.oncokb.transcript.domain.EnsemblGene;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.service.*;
import org.mskcc.oncokb.transcript.web.rest.model.AddEnsemblGeneBody;
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
    public ResponseEntity<EnsemblGene> addEnsemblGene(@RequestBody AddEnsemblGeneBody body) throws ApiException {
        Optional<EnsemblGene> savedEnsemblGeneOptional = mainService.createEnsemblGene(
            ReferenceGenome.valueOf(body.getReferenceGenome()),
            body.getEnsemblGeneId(),
            body.getEntrezGeneId(),
            body.getCanonical()
        );
        return new ResponseEntity<>(savedEnsemblGeneOptional.get(), HttpStatus.OK);
    }
}
