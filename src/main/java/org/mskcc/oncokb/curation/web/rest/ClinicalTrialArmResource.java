package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.ClinicalTrialArm;
import org.mskcc.oncokb.curation.repository.ClinicalTrialArmRepository;
import org.mskcc.oncokb.curation.service.ClinicalTrialArmQueryService;
import org.mskcc.oncokb.curation.service.ClinicalTrialArmService;
import org.mskcc.oncokb.curation.service.criteria.ClinicalTrialArmCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.ClinicalTrialArm}.
 */
@RestController
@RequestMapping("/api")
public class ClinicalTrialArmResource {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialArmResource.class);

    private static final String ENTITY_NAME = "clinicalTrialArm";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ClinicalTrialArmService clinicalTrialArmService;

    private final ClinicalTrialArmRepository clinicalTrialArmRepository;

    private final ClinicalTrialArmQueryService clinicalTrialArmQueryService;

    public ClinicalTrialArmResource(
        ClinicalTrialArmService clinicalTrialArmService,
        ClinicalTrialArmRepository clinicalTrialArmRepository,
        ClinicalTrialArmQueryService clinicalTrialArmQueryService
    ) {
        this.clinicalTrialArmService = clinicalTrialArmService;
        this.clinicalTrialArmRepository = clinicalTrialArmRepository;
        this.clinicalTrialArmQueryService = clinicalTrialArmQueryService;
    }

    /**
     * {@code POST  /clinical-trial-arms} : Create a new clinicalTrialArm.
     *
     * @param clinicalTrialArm the clinicalTrialArm to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new clinicalTrialArm, or with status {@code 400 (Bad Request)} if the clinicalTrialArm has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/clinical-trial-arms")
    public ResponseEntity<ClinicalTrialArm> createClinicalTrialArm(@Valid @RequestBody ClinicalTrialArm clinicalTrialArm)
        throws URISyntaxException {
        log.debug("REST request to save ClinicalTrialArm : {}", clinicalTrialArm);
        if (clinicalTrialArm.getId() != null) {
            throw new BadRequestAlertException("A new clinicalTrialArm cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ClinicalTrialArm result = clinicalTrialArmService.save(clinicalTrialArm);
        return ResponseEntity
            .created(new URI("/api/clinical-trial-arms/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /clinical-trial-arms/:id} : Updates an existing clinicalTrialArm.
     *
     * @param id the id of the clinicalTrialArm to save.
     * @param clinicalTrialArm the clinicalTrialArm to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clinicalTrialArm,
     * or with status {@code 400 (Bad Request)} if the clinicalTrialArm is not valid,
     * or with status {@code 500 (Internal Server Error)} if the clinicalTrialArm couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/clinical-trial-arms/{id}")
    public ResponseEntity<ClinicalTrialArm> updateClinicalTrialArm(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ClinicalTrialArm clinicalTrialArm
    ) throws URISyntaxException {
        log.debug("REST request to update ClinicalTrialArm : {}, {}", id, clinicalTrialArm);
        if (clinicalTrialArm.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clinicalTrialArm.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clinicalTrialArmRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ClinicalTrialArm result = clinicalTrialArmService.save(clinicalTrialArm);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clinicalTrialArm.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /clinical-trial-arms/:id} : Partial updates given fields of an existing clinicalTrialArm, field will ignore if it is null
     *
     * @param id the id of the clinicalTrialArm to save.
     * @param clinicalTrialArm the clinicalTrialArm to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clinicalTrialArm,
     * or with status {@code 400 (Bad Request)} if the clinicalTrialArm is not valid,
     * or with status {@code 404 (Not Found)} if the clinicalTrialArm is not found,
     * or with status {@code 500 (Internal Server Error)} if the clinicalTrialArm couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/clinical-trial-arms/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ClinicalTrialArm> partialUpdateClinicalTrialArm(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ClinicalTrialArm clinicalTrialArm
    ) throws URISyntaxException {
        log.debug("REST request to partial update ClinicalTrialArm partially : {}, {}", id, clinicalTrialArm);
        if (clinicalTrialArm.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clinicalTrialArm.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clinicalTrialArmRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ClinicalTrialArm> result = clinicalTrialArmService.partialUpdate(clinicalTrialArm);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clinicalTrialArm.getId().toString())
        );
    }

    /**
     * {@code GET  /clinical-trial-arms} : get all the clinicalTrialArms.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of clinicalTrialArms in body.
     */
    @GetMapping("/clinical-trial-arms")
    public ResponseEntity<List<ClinicalTrialArm>> getAllClinicalTrialArms(ClinicalTrialArmCriteria criteria, Pageable pageable) {
        log.debug("REST request to get ClinicalTrialArms by criteria: {}", criteria);
        Page<ClinicalTrialArm> page = clinicalTrialArmQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /clinical-trial-arms/count} : count all the clinicalTrialArms.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/clinical-trial-arms/count")
    public ResponseEntity<Long> countClinicalTrialArms(ClinicalTrialArmCriteria criteria) {
        log.debug("REST request to count ClinicalTrialArms by criteria: {}", criteria);
        return ResponseEntity.ok().body(clinicalTrialArmQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /clinical-trial-arms/:id} : get the "id" clinicalTrialArm.
     *
     * @param id the id of the clinicalTrialArm to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the clinicalTrialArm, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/clinical-trial-arms/{id}")
    public ResponseEntity<ClinicalTrialArm> getClinicalTrialArm(@PathVariable Long id) {
        log.debug("REST request to get ClinicalTrialArm : {}", id);
        Optional<ClinicalTrialArm> clinicalTrialArm = clinicalTrialArmService.findOne(id);
        return ResponseUtil.wrapOrNotFound(clinicalTrialArm);
    }

    /**
     * {@code DELETE  /clinical-trial-arms/:id} : delete the "id" clinicalTrialArm.
     *
     * @param id the id of the clinicalTrialArm to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/clinical-trial-arms/{id}")
    public ResponseEntity<Void> deleteClinicalTrialArm(@PathVariable Long id) {
        log.debug("REST request to delete ClinicalTrialArm : {}", id);
        clinicalTrialArmService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /clinical-trial-arms/search?query=:query} : search for the ClinicalTrialArm corresponding
     * to the query.
     *
     * @param query    the query of the ClinicalTrialArm search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/clinical-trial-arms/search")
    public ResponseEntity<List<ClinicalTrialArm>> searchClinicalTrialArms(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of ClinicalTrialArms for query {}", query);
        // TODO: implement the search
        Page<ClinicalTrialArm> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
