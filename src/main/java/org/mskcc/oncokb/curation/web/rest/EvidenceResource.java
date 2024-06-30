package org.mskcc.oncokb.curation.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Evidence;
import org.mskcc.oncokb.curation.repository.EvidenceRepository;
import org.mskcc.oncokb.curation.service.EvidenceQueryService;
import org.mskcc.oncokb.curation.service.EvidenceService;
import org.mskcc.oncokb.curation.service.criteria.EvidenceCriteria;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Evidence}.
 */
@RestController
@RequestMapping("/api")
public class EvidenceResource {

    private final Logger log = LoggerFactory.getLogger(EvidenceResource.class);

    private static final String ENTITY_NAME = "evidence";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EvidenceService evidenceService;

    private final EvidenceRepository evidenceRepository;

    private final EvidenceQueryService evidenceQueryService;

    public EvidenceResource(
        EvidenceService evidenceService,
        EvidenceRepository evidenceRepository,
        EvidenceQueryService evidenceQueryService
    ) {
        this.evidenceService = evidenceService;
        this.evidenceRepository = evidenceRepository;
        this.evidenceQueryService = evidenceQueryService;
    }

    /**
     * {@code POST  /evidences} : Create a new evidence.
     *
     * @param evidence the evidence to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new evidence, or with status {@code 400 (Bad Request)} if the evidence has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/evidences")
    public ResponseEntity<Evidence> createEvidence(@Valid @RequestBody Evidence evidence) throws URISyntaxException {
        log.debug("REST request to save Evidence : {}", evidence);
        if (evidence.getId() != null) {
            throw new BadRequestAlertException("A new evidence cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Evidence result = evidenceService.save(evidence);
        return ResponseEntity.created(new URI("/api/evidences/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /evidences/:id} : Updates an existing evidence.
     *
     * @param id the id of the evidence to save.
     * @param evidence the evidence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated evidence,
     * or with status {@code 400 (Bad Request)} if the evidence is not valid,
     * or with status {@code 500 (Internal Server Error)} if the evidence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/evidences/{id}")
    public ResponseEntity<Evidence> updateEvidence(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Evidence evidence
    ) throws URISyntaxException {
        log.debug("REST request to update Evidence : {}, {}", id, evidence);
        if (evidence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, evidence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!evidenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Evidence result = evidenceService.save(evidence);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, evidence.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /evidences/:id} : Partial updates given fields of an existing evidence, field will ignore if it is null
     *
     * @param id the id of the evidence to save.
     * @param evidence the evidence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated evidence,
     * or with status {@code 400 (Bad Request)} if the evidence is not valid,
     * or with status {@code 404 (Not Found)} if the evidence is not found,
     * or with status {@code 500 (Internal Server Error)} if the evidence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/evidences/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Evidence> partialUpdateEvidence(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Evidence evidence
    ) throws URISyntaxException {
        log.debug("REST request to partial update Evidence partially : {}, {}", id, evidence);
        if (evidence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, evidence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!evidenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Evidence> result = evidenceService.partialUpdate(evidence);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, evidence.getId().toString())
        );
    }

    /**
     * {@code GET  /evidences} : get all the evidences.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of evidences in body.
     */
    @GetMapping("/evidences")
    public ResponseEntity<List<Evidence>> getAllEvidences(EvidenceCriteria criteria, Pageable pageable) {
        log.debug("REST request to get Evidences by criteria: {}", criteria);
        Page<Evidence> page = evidenceQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /evidences/count} : count all the evidences.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/evidences/count")
    public ResponseEntity<Long> countEvidences(EvidenceCriteria criteria) {
        log.debug("REST request to count Evidences by criteria: {}", criteria);
        return ResponseEntity.ok().body(evidenceQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /evidences/:id} : get the "id" evidence.
     *
     * @param id the id of the evidence to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the evidence, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/evidences/{id}")
    public ResponseEntity<Evidence> getEvidence(@PathVariable Long id) {
        log.debug("REST request to get Evidence : {}", id);
        Optional<Evidence> evidence = evidenceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(evidence);
    }

    /**
     * {@code DELETE  /evidences/:id} : delete the "id" evidence.
     *
     * @param id the id of the evidence to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/evidences/{id}")
    public ResponseEntity<Void> deleteEvidence(@PathVariable Long id) {
        log.debug("REST request to delete Evidence : {}", id);
        evidenceService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /evidences/search?query=:query} : search for the Evidence corresponding
     * to the query.
     *
     * @param query    the query of the Evidence search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/evidences/search")
    public ResponseEntity<List<Evidence>> searchEvidences(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Evidences for query {}", query);
        // TODO: implement the search
        Page<Evidence> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
