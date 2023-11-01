package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.GenomicIndicator;
import org.mskcc.oncokb.curation.repository.GenomicIndicatorRepository;
import org.mskcc.oncokb.curation.service.GenomicIndicatorQueryService;
import org.mskcc.oncokb.curation.service.GenomicIndicatorService;
import org.mskcc.oncokb.curation.service.criteria.GenomicIndicatorCriteria;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.GenomicIndicator}.
 */
@RestController
@RequestMapping("/api")
public class GenomicIndicatorResource {

    private final Logger log = LoggerFactory.getLogger(GenomicIndicatorResource.class);

    private static final String ENTITY_NAME = "genomicIndicator";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GenomicIndicatorService genomicIndicatorService;

    private final GenomicIndicatorRepository genomicIndicatorRepository;

    private final GenomicIndicatorQueryService genomicIndicatorQueryService;

    public GenomicIndicatorResource(
        GenomicIndicatorService genomicIndicatorService,
        GenomicIndicatorRepository genomicIndicatorRepository,
        GenomicIndicatorQueryService genomicIndicatorQueryService
    ) {
        this.genomicIndicatorService = genomicIndicatorService;
        this.genomicIndicatorRepository = genomicIndicatorRepository;
        this.genomicIndicatorQueryService = genomicIndicatorQueryService;
    }

    /**
     * {@code POST  /genomic-indicators} : Create a new genomicIndicator.
     *
     * @param genomicIndicator the genomicIndicator to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new genomicIndicator, or with status {@code 400 (Bad Request)} if the genomicIndicator has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/genomic-indicators")
    public ResponseEntity<GenomicIndicator> createGenomicIndicator(@Valid @RequestBody GenomicIndicator genomicIndicator)
        throws URISyntaxException {
        log.debug("REST request to save GenomicIndicator : {}", genomicIndicator);
        if (genomicIndicator.getId() != null) {
            throw new BadRequestAlertException("A new genomicIndicator cannot already have an ID", ENTITY_NAME, "idexists");
        }
        GenomicIndicator result = genomicIndicatorService.save(genomicIndicator);
        return ResponseEntity
            .created(new URI("/api/genomic-indicators/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /genomic-indicators/:id} : Updates an existing genomicIndicator.
     *
     * @param id the id of the genomicIndicator to save.
     * @param genomicIndicator the genomicIndicator to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated genomicIndicator,
     * or with status {@code 400 (Bad Request)} if the genomicIndicator is not valid,
     * or with status {@code 500 (Internal Server Error)} if the genomicIndicator couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/genomic-indicators/{id}")
    public ResponseEntity<GenomicIndicator> updateGenomicIndicator(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody GenomicIndicator genomicIndicator
    ) throws URISyntaxException {
        log.debug("REST request to update GenomicIndicator : {}, {}", id, genomicIndicator);
        if (genomicIndicator.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, genomicIndicator.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!genomicIndicatorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        GenomicIndicator result = genomicIndicatorService.save(genomicIndicator);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, genomicIndicator.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /genomic-indicators/:id} : Partial updates given fields of an existing genomicIndicator, field will ignore if it is null
     *
     * @param id the id of the genomicIndicator to save.
     * @param genomicIndicator the genomicIndicator to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated genomicIndicator,
     * or with status {@code 400 (Bad Request)} if the genomicIndicator is not valid,
     * or with status {@code 404 (Not Found)} if the genomicIndicator is not found,
     * or with status {@code 500 (Internal Server Error)} if the genomicIndicator couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/genomic-indicators/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<GenomicIndicator> partialUpdateGenomicIndicator(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody GenomicIndicator genomicIndicator
    ) throws URISyntaxException {
        log.debug("REST request to partial update GenomicIndicator partially : {}, {}", id, genomicIndicator);
        if (genomicIndicator.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, genomicIndicator.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!genomicIndicatorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<GenomicIndicator> result = genomicIndicatorService.partialUpdate(genomicIndicator);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, genomicIndicator.getId().toString())
        );
    }

    /**
     * {@code GET  /genomic-indicators} : get all the genomicIndicators.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of genomicIndicators in body.
     */
    @GetMapping("/genomic-indicators")
    public ResponseEntity<List<GenomicIndicator>> getAllGenomicIndicators(GenomicIndicatorCriteria criteria) {
        log.debug("REST request to get GenomicIndicators by criteria: {}", criteria);
        List<GenomicIndicator> entityList = genomicIndicatorQueryService.findByCriteria(criteria);
        return ResponseEntity.ok().body(entityList);
    }

    /**
     * {@code GET  /genomic-indicators/count} : count all the genomicIndicators.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/genomic-indicators/count")
    public ResponseEntity<Long> countGenomicIndicators(GenomicIndicatorCriteria criteria) {
        log.debug("REST request to count GenomicIndicators by criteria: {}", criteria);
        return ResponseEntity.ok().body(genomicIndicatorQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /genomic-indicators/:id} : get the "id" genomicIndicator.
     *
     * @param id the id of the genomicIndicator to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the genomicIndicator, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/genomic-indicators/{id}")
    public ResponseEntity<GenomicIndicator> getGenomicIndicator(@PathVariable Long id) {
        log.debug("REST request to get GenomicIndicator : {}", id);
        Optional<GenomicIndicator> genomicIndicator = genomicIndicatorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(genomicIndicator);
    }

    /**
     * {@code DELETE  /genomic-indicators/:id} : delete the "id" genomicIndicator.
     *
     * @param id the id of the genomicIndicator to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/genomic-indicators/{id}")
    public ResponseEntity<Void> deleteGenomicIndicator(@PathVariable Long id) {
        log.debug("REST request to delete GenomicIndicator : {}", id);
        genomicIndicatorService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /genomic-indicators/search?query=:query} : search for the GenomicIndicator corresponding
     * to the query.
     *
     * @param query    the query of the GenomicIndicator search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/genomic-indicators/search")
    public ResponseEntity<List<GenomicIndicator>> searchGenomicIndicators(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of GenomicIndicators for query {}", query);
        // TODO: implement the search
        Page<GenomicIndicator> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
