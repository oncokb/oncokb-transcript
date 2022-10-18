package org.mskcc.oncokb.transcript.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Gene;
import org.mskcc.oncokb.transcript.repository.GeneRepository;
import org.mskcc.oncokb.transcript.service.GeneService;
import org.mskcc.oncokb.transcript.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.transcript.domain.Gene}.
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
