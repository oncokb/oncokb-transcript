package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.EligibilityCriteria;
import org.mskcc.oncokb.curation.repository.EligibilityCriteriaRepository;
import org.mskcc.oncokb.curation.service.EligibilityCriteriaQueryService;
import org.mskcc.oncokb.curation.service.EligibilityCriteriaService;
import org.mskcc.oncokb.curation.service.criteria.EligibilityCriteriaCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.EligibilityCriteria}.
 */
@RestController
@RequestMapping("/api")
public class EligibilityCriteriaResource {

    private final Logger log = LoggerFactory.getLogger(EligibilityCriteriaResource.class);

    private static final String ENTITY_NAME = "eligibilityCriteria";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EligibilityCriteriaService eligibilityCriteriaService;

    private final EligibilityCriteriaRepository eligibilityCriteriaRepository;

    private final EligibilityCriteriaQueryService eligibilityCriteriaQueryService;

    public EligibilityCriteriaResource(
        EligibilityCriteriaService eligibilityCriteriaService,
        EligibilityCriteriaRepository eligibilityCriteriaRepository,
        EligibilityCriteriaQueryService eligibilityCriteriaQueryService
    ) {
        this.eligibilityCriteriaService = eligibilityCriteriaService;
        this.eligibilityCriteriaRepository = eligibilityCriteriaRepository;
        this.eligibilityCriteriaQueryService = eligibilityCriteriaQueryService;
    }

    /**
     * {@code POST  /eligibility-criteria} : Create a new eligibilityCriteria.
     *
     * @param eligibilityCriteria the eligibilityCriteria to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new eligibilityCriteria, or with status {@code 400 (Bad Request)} if the eligibilityCriteria has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/eligibility-criteria")
    public ResponseEntity<EligibilityCriteria> createEligibilityCriteria(@Valid @RequestBody EligibilityCriteria eligibilityCriteria)
        throws URISyntaxException {
        log.debug("REST request to save EligibilityCriteria : {}", eligibilityCriteria);
        if (eligibilityCriteria.getId() != null) {
            throw new BadRequestAlertException("A new eligibilityCriteria cannot already have an ID", ENTITY_NAME, "idexists");
        }
        EligibilityCriteria result = eligibilityCriteriaService.save(eligibilityCriteria);
        return ResponseEntity
            .created(new URI("/api/eligibility-criteria/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /eligibility-criteria/:id} : Updates an existing eligibilityCriteria.
     *
     * @param id the id of the eligibilityCriteria to save.
     * @param eligibilityCriteria the eligibilityCriteria to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated eligibilityCriteria,
     * or with status {@code 400 (Bad Request)} if the eligibilityCriteria is not valid,
     * or with status {@code 500 (Internal Server Error)} if the eligibilityCriteria couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/eligibility-criteria/{id}")
    public ResponseEntity<EligibilityCriteria> updateEligibilityCriteria(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EligibilityCriteria eligibilityCriteria
    ) throws URISyntaxException {
        log.debug("REST request to update EligibilityCriteria : {}, {}", id, eligibilityCriteria);
        if (eligibilityCriteria.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, eligibilityCriteria.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!eligibilityCriteriaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        EligibilityCriteria result = eligibilityCriteriaService.save(eligibilityCriteria);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, eligibilityCriteria.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /eligibility-criteria/:id} : Partial updates given fields of an existing eligibilityCriteria, field will ignore if it is null
     *
     * @param id the id of the eligibilityCriteria to save.
     * @param eligibilityCriteria the eligibilityCriteria to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated eligibilityCriteria,
     * or with status {@code 400 (Bad Request)} if the eligibilityCriteria is not valid,
     * or with status {@code 404 (Not Found)} if the eligibilityCriteria is not found,
     * or with status {@code 500 (Internal Server Error)} if the eligibilityCriteria couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/eligibility-criteria/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EligibilityCriteria> partialUpdateEligibilityCriteria(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EligibilityCriteria eligibilityCriteria
    ) throws URISyntaxException {
        log.debug("REST request to partial update EligibilityCriteria partially : {}, {}", id, eligibilityCriteria);
        if (eligibilityCriteria.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, eligibilityCriteria.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!eligibilityCriteriaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<EligibilityCriteria> result = eligibilityCriteriaService.partialUpdate(eligibilityCriteria);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, eligibilityCriteria.getId().toString())
        );
    }

    /**
     * {@code GET  /eligibility-criteria} : get all the eligibilityCriteria.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of eligibilityCriteria in body.
     */
    @GetMapping("/eligibility-criteria")
    public ResponseEntity<List<EligibilityCriteria>> getAllEligibilityCriteria(EligibilityCriteriaCriteria criteria, Pageable pageable) {
        log.debug("REST request to get EligibilityCriteria by criteria: {}", criteria);
        Page<EligibilityCriteria> page = eligibilityCriteriaQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /eligibility-criteria/count} : count all the eligibilityCriteria.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/eligibility-criteria/count")
    public ResponseEntity<Long> countEligibilityCriteria(EligibilityCriteriaCriteria criteria) {
        log.debug("REST request to count EligibilityCriteria by criteria: {}", criteria);
        return ResponseEntity.ok().body(eligibilityCriteriaQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /eligibility-criteria/:id} : get the "id" eligibilityCriteria.
     *
     * @param id the id of the eligibilityCriteria to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the eligibilityCriteria, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/eligibility-criteria/{id}")
    public ResponseEntity<EligibilityCriteria> getEligibilityCriteria(@PathVariable Long id) {
        log.debug("REST request to get EligibilityCriteria : {}", id);
        Optional<EligibilityCriteria> eligibilityCriteria = eligibilityCriteriaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(eligibilityCriteria);
    }

    /**
     * {@code DELETE  /eligibility-criteria/:id} : delete the "id" eligibilityCriteria.
     *
     * @param id the id of the eligibilityCriteria to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/eligibility-criteria/{id}")
    public ResponseEntity<Void> deleteEligibilityCriteria(@PathVariable Long id) {
        log.debug("REST request to delete EligibilityCriteria : {}", id);
        eligibilityCriteriaService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /eligibility-criteria/search?query=:query} : search for the EligibilityCriteria corresponding
     * to the query.
     *
     * @param query    the query of the EligibilityCriteria search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/eligibility-criteria/search")
    public ResponseEntity<List<EligibilityCriteria>> searchEligibilityCriteria(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of EligibilityCriteria for query {}", query);
        // TODO: implement the search
        Page<EligibilityCriteria> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
