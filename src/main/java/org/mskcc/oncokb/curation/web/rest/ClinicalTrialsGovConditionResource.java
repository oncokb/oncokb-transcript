package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
import org.mskcc.oncokb.curation.repository.ClinicalTrialsGovConditionRepository;
import org.mskcc.oncokb.curation.service.ClinicalTrialsGovConditionQueryService;
import org.mskcc.oncokb.curation.service.ClinicalTrialsGovConditionService;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialsGovConditionCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition}.
 */
@RestController
@RequestMapping("/api")
public class ClinicalTrialsGovConditionResource {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialsGovConditionResource.class);

    private static final String ENTITY_NAME = "clinicalTrialsGovCondition";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ClinicalTrialsGovConditionService clinicalTrialsGovConditionService;

    private final ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository;

    private final ClinicalTrialsGovConditionQueryService clinicalTrialsGovConditionQueryService;

    public ClinicalTrialsGovConditionResource(
        ClinicalTrialsGovConditionService clinicalTrialsGovConditionService,
        ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository,
        ClinicalTrialsGovConditionQueryService clinicalTrialsGovConditionQueryService
    ) {
        this.clinicalTrialsGovConditionService = clinicalTrialsGovConditionService;
        this.clinicalTrialsGovConditionRepository = clinicalTrialsGovConditionRepository;
        this.clinicalTrialsGovConditionQueryService = clinicalTrialsGovConditionQueryService;
    }

    /**
     * {@code POST  /clinical-trials-gov-conditions} : Create a new clinicalTrialsGovCondition.
     *
     * @param clinicalTrialsGovCondition the clinicalTrialsGovCondition to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new clinicalTrialsGovCondition, or with status {@code 400 (Bad Request)} if the clinicalTrialsGovCondition has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/clinical-trials-gov-conditions")
    public ResponseEntity<ClinicalTrialsGovCondition> createClinicalTrialsGovCondition(
        @Valid @RequestBody ClinicalTrialsGovCondition clinicalTrialsGovCondition
    ) throws URISyntaxException {
        log.debug("REST request to save ClinicalTrialsGovCondition : {}", clinicalTrialsGovCondition);
        if (clinicalTrialsGovCondition.getId() != null) {
            throw new BadRequestAlertException("A new clinicalTrialsGovCondition cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ClinicalTrialsGovCondition result = clinicalTrialsGovConditionService.save(clinicalTrialsGovCondition);
        return ResponseEntity
            .created(new URI("/api/clinical-trials-gov-conditions/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /clinical-trials-gov-conditions/:id} : Updates an existing clinicalTrialsGovCondition.
     *
     * @param id the id of the clinicalTrialsGovCondition to save.
     * @param clinicalTrialsGovCondition the clinicalTrialsGovCondition to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clinicalTrialsGovCondition,
     * or with status {@code 400 (Bad Request)} if the clinicalTrialsGovCondition is not valid,
     * or with status {@code 500 (Internal Server Error)} if the clinicalTrialsGovCondition couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/clinical-trials-gov-conditions/{id}")
    public ResponseEntity<ClinicalTrialsGovCondition> updateClinicalTrialsGovCondition(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ClinicalTrialsGovCondition clinicalTrialsGovCondition
    ) throws URISyntaxException {
        log.debug("REST request to update ClinicalTrialsGovCondition : {}, {}", id, clinicalTrialsGovCondition);
        if (clinicalTrialsGovCondition.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clinicalTrialsGovCondition.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clinicalTrialsGovConditionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ClinicalTrialsGovCondition result = clinicalTrialsGovConditionService.save(clinicalTrialsGovCondition);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clinicalTrialsGovCondition.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /clinical-trials-gov-conditions/:id} : Partial updates given fields of an existing clinicalTrialsGovCondition, field will ignore if it is null
     *
     * @param id the id of the clinicalTrialsGovCondition to save.
     * @param clinicalTrialsGovCondition the clinicalTrialsGovCondition to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clinicalTrialsGovCondition,
     * or with status {@code 400 (Bad Request)} if the clinicalTrialsGovCondition is not valid,
     * or with status {@code 404 (Not Found)} if the clinicalTrialsGovCondition is not found,
     * or with status {@code 500 (Internal Server Error)} if the clinicalTrialsGovCondition couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/clinical-trials-gov-conditions/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ClinicalTrialsGovCondition> partialUpdateClinicalTrialsGovCondition(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ClinicalTrialsGovCondition clinicalTrialsGovCondition
    ) throws URISyntaxException {
        log.debug("REST request to partial update ClinicalTrialsGovCondition partially : {}, {}", id, clinicalTrialsGovCondition);
        if (clinicalTrialsGovCondition.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clinicalTrialsGovCondition.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clinicalTrialsGovConditionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ClinicalTrialsGovCondition> result = clinicalTrialsGovConditionService.partialUpdate(clinicalTrialsGovCondition);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clinicalTrialsGovCondition.getId().toString())
        );
    }

    /**
     * {@code GET  /clinical-trials-gov-conditions} : get all the clinicalTrialsGovConditions.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of clinicalTrialsGovConditions in body.
     */
    @GetMapping("/clinical-trials-gov-conditions")
    public ResponseEntity<List<ClinicalTrialsGovCondition>> getAllClinicalTrialsGovConditions(
        ClinicalTrialsGovConditionCriteria criteria,
        Pageable pageable
    ) {
        log.debug("REST request to get ClinicalTrialsGovConditions by criteria: {}", criteria);
        Page<ClinicalTrialsGovCondition> page = clinicalTrialsGovConditionQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /clinical-trials-gov-conditions/count} : count all the clinicalTrialsGovConditions.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/clinical-trials-gov-conditions/count")
    public ResponseEntity<Long> countClinicalTrialsGovConditions(ClinicalTrialsGovConditionCriteria criteria) {
        log.debug("REST request to count ClinicalTrialsGovConditions by criteria: {}", criteria);
        return ResponseEntity.ok().body(clinicalTrialsGovConditionQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /clinical-trials-gov-conditions/:id} : get the "id" clinicalTrialsGovCondition.
     *
     * @param id the id of the clinicalTrialsGovCondition to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the clinicalTrialsGovCondition, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/clinical-trials-gov-conditions/{id}")
    public ResponseEntity<ClinicalTrialsGovCondition> getClinicalTrialsGovCondition(@PathVariable Long id) {
        log.debug("REST request to get ClinicalTrialsGovCondition : {}", id);
        Optional<ClinicalTrialsGovCondition> clinicalTrialsGovCondition = clinicalTrialsGovConditionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(clinicalTrialsGovCondition);
    }

    /**
     * {@code DELETE  /clinical-trials-gov-conditions/:id} : delete the "id" clinicalTrialsGovCondition.
     *
     * @param id the id of the clinicalTrialsGovCondition to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/clinical-trials-gov-conditions/{id}")
    public ResponseEntity<Void> deleteClinicalTrialsGovCondition(@PathVariable Long id) {
        log.debug("REST request to delete ClinicalTrialsGovCondition : {}", id);
        clinicalTrialsGovConditionService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /_search/clinical-trials-gov-conditions?query=:query} : search for the clinicalTrialsGovCondition corresponding
     * to the query.
     *
     * @param query the query of the clinicalTrialsGovCondition search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/_search/clinical-trials-gov-conditions")
    public ResponseEntity<List<ClinicalTrialsGovCondition>> searchClinicalTrialsGovConditions(
        @RequestParam String query,
        Pageable pageable
    ) {
        log.debug("REST request to search for a page of ClinicalTrialsGovConditions for query {}", query);
        Page<ClinicalTrialsGovCondition> page = clinicalTrialsGovConditionQueryService.findBySearchQuery(query, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
