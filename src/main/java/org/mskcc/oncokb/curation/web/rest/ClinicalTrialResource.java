package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.ClinicalTrial;
import org.mskcc.oncokb.curation.repository.ClinicalTrialRepository;
import org.mskcc.oncokb.curation.service.ClinicalTrialQueryService;
import org.mskcc.oncokb.curation.service.ClinicalTrialService;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.ClinicalTrial}.
 */
@RestController
@RequestMapping("/api")
public class ClinicalTrialResource {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialResource.class);

    private static final String ENTITY_NAME = "clinicalTrial";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ClinicalTrialService clinicalTrialService;

    private final ClinicalTrialRepository clinicalTrialRepository;

    private final ClinicalTrialQueryService clinicalTrialQueryService;

    public ClinicalTrialResource(
        ClinicalTrialService clinicalTrialService,
        ClinicalTrialRepository clinicalTrialRepository,
        ClinicalTrialQueryService clinicalTrialQueryService
    ) {
        this.clinicalTrialService = clinicalTrialService;
        this.clinicalTrialRepository = clinicalTrialRepository;
        this.clinicalTrialQueryService = clinicalTrialQueryService;
    }

    /**
     * {@code POST  /clinical-trials} : Create a new clinicalTrial.
     *
     * @param clinicalTrial the clinicalTrial to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new clinicalTrial, or with status {@code 400 (Bad Request)} if the clinicalTrial has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/clinical-trials")
    public ResponseEntity<ClinicalTrial> createClinicalTrial(@Valid @RequestBody ClinicalTrial clinicalTrial) throws URISyntaxException {
        log.debug("REST request to save ClinicalTrial : {}", clinicalTrial);
        if (clinicalTrial.getId() != null) {
            throw new BadRequestAlertException("A new clinicalTrial cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ClinicalTrial result = clinicalTrialService.save(clinicalTrial);
        return ResponseEntity
            .created(new URI("/api/clinical-trials/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /clinical-trials/:id} : Updates an existing clinicalTrial.
     *
     * @param id the id of the clinicalTrial to save.
     * @param clinicalTrial the clinicalTrial to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clinicalTrial,
     * or with status {@code 400 (Bad Request)} if the clinicalTrial is not valid,
     * or with status {@code 500 (Internal Server Error)} if the clinicalTrial couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/clinical-trials/{id}")
    public ResponseEntity<ClinicalTrial> updateClinicalTrial(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ClinicalTrial clinicalTrial
    ) throws URISyntaxException {
        log.debug("REST request to update ClinicalTrial : {}, {}", id, clinicalTrial);
        if (clinicalTrial.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clinicalTrial.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clinicalTrialRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ClinicalTrial result = clinicalTrialService.save(clinicalTrial);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clinicalTrial.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /clinical-trials/:id} : Partial updates given fields of an existing clinicalTrial, field will ignore if it is null
     *
     * @param id the id of the clinicalTrial to save.
     * @param clinicalTrial the clinicalTrial to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clinicalTrial,
     * or with status {@code 400 (Bad Request)} if the clinicalTrial is not valid,
     * or with status {@code 404 (Not Found)} if the clinicalTrial is not found,
     * or with status {@code 500 (Internal Server Error)} if the clinicalTrial couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/clinical-trials/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ClinicalTrial> partialUpdateClinicalTrial(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ClinicalTrial clinicalTrial
    ) throws URISyntaxException {
        log.debug("REST request to partial update ClinicalTrial partially : {}, {}", id, clinicalTrial);
        if (clinicalTrial.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clinicalTrial.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clinicalTrialRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ClinicalTrial> result = clinicalTrialService.partialUpdate(clinicalTrial);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clinicalTrial.getId().toString())
        );
    }

    /**
     * {@code GET  /clinical-trials} : get all the clinicalTrials.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of clinicalTrials in body.
     */
    @GetMapping("/clinical-trials")
    public ResponseEntity<List<ClinicalTrial>> getAllClinicalTrials(ClinicalTrialCriteria criteria, Pageable pageable) {
        log.debug("REST request to get ClinicalTrials by criteria: {}", criteria);
        Page<ClinicalTrial> page = clinicalTrialQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /clinical-trials/count} : count all the clinicalTrials.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/clinical-trials/count")
    public ResponseEntity<Long> countClinicalTrials(ClinicalTrialCriteria criteria) {
        log.debug("REST request to count ClinicalTrials by criteria: {}", criteria);
        return ResponseEntity.ok().body(clinicalTrialQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /clinical-trials/:id} : get the "id" clinicalTrial.
     *
     * @param id the id of the clinicalTrial to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the clinicalTrial, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/clinical-trials/{id}")
    public ResponseEntity<ClinicalTrial> getClinicalTrial(@PathVariable Long id) {
        log.debug("REST request to get ClinicalTrial : {}", id);
        Optional<ClinicalTrial> clinicalTrial = clinicalTrialService.findOne(id);
        return ResponseUtil.wrapOrNotFound(clinicalTrial);
    }

    /**
     * {@code DELETE  /clinical-trials/:id} : delete the "id" clinicalTrial.
     *
     * @param id the id of the clinicalTrial to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/clinical-trials/{id}")
    public ResponseEntity<Void> deleteClinicalTrial(@PathVariable Long id) {
        log.debug("REST request to delete ClinicalTrial : {}", id);
        clinicalTrialService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /clinical-trials/search?query=:query} : search for the ClinicalTrial corresponding
     * to the query.
     *
     * @param query    the query of the ClinicalTrial search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/clinical-trials/search")
    public ResponseEntity<List<ClinicalTrial>> searchClinicalTrials(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of ClinicalTrials for query {}", query);
        // TODO: implement the search
        Page<ClinicalTrial> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
