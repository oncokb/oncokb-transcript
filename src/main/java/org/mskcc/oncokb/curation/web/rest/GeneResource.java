package org.mskcc.oncokb.curation.web.rest;

import static org.elasticsearch.index.query.QueryBuilders.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.repository.GeneRepository;
import org.mskcc.oncokb.curation.service.GeneService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Gene}.
 */
@RestController
@RequestMapping("/api")
public class GeneResource {

    private final Logger log = LoggerFactory.getLogger(GeneResource.class);

    private static final String ENTITY_NAME = "gene";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GeneService geneService;

    private final GeneRepository geneRepository;

    public GeneResource(GeneService geneService, GeneRepository geneRepository) {
        this.geneService = geneService;
        this.geneRepository = geneRepository;
    }

    /**
     * {@code POST  /genes} : Create a new gene.
     *
     * @param gene the gene to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new gene, or with status {@code 400 (Bad Request)} if the gene has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/genes")
    public ResponseEntity<Gene> createGene(@RequestBody Gene gene) throws URISyntaxException {
        log.debug("REST request to save Gene : {}", gene);
        if (gene.getId() != null) {
            throw new BadRequestAlertException("A new gene cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Gene result = geneService.save(gene);
        return ResponseEntity
            .created(new URI("/api/genes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /genes/:id} : Updates an existing gene.
     *
     * @param id the id of the gene to save.
     * @param gene the gene to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated gene,
     * or with status {@code 400 (Bad Request)} if the gene is not valid,
     * or with status {@code 500 (Internal Server Error)} if the gene couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/genes/{id}")
    public ResponseEntity<Gene> updateGene(@PathVariable(value = "id", required = false) final Long id, @RequestBody Gene gene)
        throws URISyntaxException {
        log.debug("REST request to update Gene : {}, {}", id, gene);
        if (gene.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, gene.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!geneRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Gene result = geneService.save(gene);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, gene.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /genes/:id} : Partial updates given fields of an existing gene, field will ignore if it is null
     *
     * @param id the id of the gene to save.
     * @param gene the gene to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated gene,
     * or with status {@code 400 (Bad Request)} if the gene is not valid,
     * or with status {@code 404 (Not Found)} if the gene is not found,
     * or with status {@code 500 (Internal Server Error)} if the gene couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/genes/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Gene> partialUpdateGene(@PathVariable(value = "id", required = false) final Long id, @RequestBody Gene gene)
        throws URISyntaxException {
        log.debug("REST request to partial update Gene partially : {}, {}", id, gene);
        if (gene.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, gene.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!geneRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Gene> result = geneService.partialUpdate(gene);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, gene.getId().toString())
        );
    }

    /**
     * {@code GET  /genes} : get all the genes.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of genes in body.
     */
    @GetMapping("/genes")
    public ResponseEntity<List<Gene>> getAllGenes(
        Pageable pageable,
        @RequestParam(required = false, defaultValue = "false") boolean eagerload
    ) {
        log.debug("REST request to get a page of Genes");
        Page<Gene> page;
        if (eagerload) {
            page = geneService.findAllWithEagerRelationships(pageable);
        } else {
            page = geneService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /genes/:id} : get the "id" gene.
     *
     * @param id the id of the gene to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the gene, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/genes/{id}")
    public ResponseEntity<Gene> getGene(@PathVariable Long id) {
        log.debug("REST request to get Gene : {}", id);
        Optional<Gene> gene = geneService.findOne(id);
        return ResponseUtil.wrapOrNotFound(gene);
    }

    /**
     * {@code DELETE  /genes/:id} : delete the "id" gene.
     *
     * @param id the id of the gene to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/genes/{id}")
    public ResponseEntity<Void> deleteGene(@PathVariable Long id) {
        log.debug("REST request to delete Gene : {}", id);
        geneService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /_search/genes?query=:query} : search for the gene corresponding
     * to the query.
     *
     * @param query the query of the gene search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/_search/genes")
    public ResponseEntity<List<Gene>> searchGenes(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Genes for query {}", query);
        Page<Gene> page = geneService.search(query, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
