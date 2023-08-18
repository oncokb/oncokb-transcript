package org.mskcc.oncokb.curation.web.rest;

import java.util.List;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.service.GeneService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Gene}.
 */
@RestController
@RequestMapping("/api")
public class GeneResource {

    private final Logger log = LoggerFactory.getLogger(GeneResource.class);

    private final GeneService geneService;

    public GeneResource(GeneService geneService) {
        this.geneService = geneService;
    }

    /**
     * {@code GET  /genes} : get all the genes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of genes in body.
     */
    @GetMapping("/genes")
    public List<Gene> getAllGenes() {
        log.debug("REST request to get all Genes");
        return geneService.findAll();
    }
}
