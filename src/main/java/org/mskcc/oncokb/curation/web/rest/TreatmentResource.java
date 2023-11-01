package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Treatment;
import org.mskcc.oncokb.curation.repository.TreatmentRepository;
import org.mskcc.oncokb.curation.service.TreatmentQueryService;
import org.mskcc.oncokb.curation.service.TreatmentService;
import org.mskcc.oncokb.curation.service.criteria.TreatmentCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Treatment}.
 */
@RestController
@RequestMapping("/api")
public class TreatmentResource {

    private final Logger log = LoggerFactory.getLogger(TreatmentResource.class);

    private static final String ENTITY_NAME = "treatment";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TreatmentService treatmentService;

    private final TreatmentRepository treatmentRepository;

    private final TreatmentQueryService treatmentQueryService;

    public TreatmentResource(
        TreatmentService treatmentService,
        TreatmentRepository treatmentRepository,
        TreatmentQueryService treatmentQueryService
    ) {
        this.treatmentService = treatmentService;
        this.treatmentRepository = treatmentRepository;
        this.treatmentQueryService = treatmentQueryService;
    }

    /**
     * {@code POST  /treatments} : Create a new treatment.
     *
     * @param treatment the treatment to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new treatment, or with status {@code 400 (Bad Request)} if the treatment has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/treatments")
    public ResponseEntity<Treatment> createTreatment(@RequestBody Treatment treatment) throws URISyntaxException {
        log.debug("REST request to save Treatment : {}", treatment);
        if (treatment.getId() != null) {
            throw new BadRequestAlertException("A new treatment cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Treatment result = treatmentService.save(treatment);
        return ResponseEntity
            .created(new URI("/api/treatments/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /treatments/:id} : Updates an existing treatment.
     *
     * @param id        the id of the treatment to save.
     * @param treatment the treatment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated treatment,
     * or with status {@code 400 (Bad Request)} if the treatment is not valid,
     * or with status {@code 500 (Internal Server Error)} if the treatment couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/treatments/{id}")
    public ResponseEntity<Treatment> updateTreatment(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Treatment treatment
    ) throws URISyntaxException {
        log.debug("REST request to update Treatment : {}, {}", id, treatment);
        if (treatment.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, treatment.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!treatmentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Treatment result = treatmentService.save(treatment);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, treatment.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /treatments/:id} : Partial updates given fields of an existing treatment, field will ignore if it is null
     *
     * @param id        the id of the treatment to save.
     * @param treatment the treatment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated treatment,
     * or with status {@code 400 (Bad Request)} if the treatment is not valid,
     * or with status {@code 404 (Not Found)} if the treatment is not found,
     * or with status {@code 500 (Internal Server Error)} if the treatment couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/treatments/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Treatment> partialUpdateTreatment(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Treatment treatment
    ) throws URISyntaxException {
        log.debug("REST request to partial update Treatment partially : {}, {}", id, treatment);
        if (treatment.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, treatment.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!treatmentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Treatment> result = treatmentService.partialUpdate(treatment);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, treatment.getId().toString())
        );
    }

    /**
     * {@code GET  /treatments} : get all the treatments.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of treatments in body.
     */
    @GetMapping("/treatments")
    public ResponseEntity<List<Treatment>> getAllTreatments(Pageable pageable) {
        log.debug("REST request to get Treatments");
        Page<Treatment> page = treatmentService.findAllWithEagerRelationships(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /treatments/count} : count all the treatments.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/treatments/count")
    public ResponseEntity<Long> countTreatments(TreatmentCriteria criteria) {
        log.debug("REST request to count Treatments by criteria: {}", criteria);
        return ResponseEntity.ok().body(treatmentQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /treatments/:id} : get the "id" treatment.
     *
     * @param id the id of the treatment to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the treatment, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/treatments/{id}")
    public ResponseEntity<Treatment> getTreatment(@PathVariable Long id) {
        log.debug("REST request to get Treatment : {}", id);
        Optional<Treatment> treatment = treatmentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(treatment);
    }

    /**
     * {@code DELETE  /treatments/:id} : delete the "id" treatment.
     *
     * @param id the id of the treatment to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/treatments/{id}")
    public ResponseEntity<Void> deleteTreatment(@PathVariable Long id) {
        log.debug("REST request to delete Treatment : {}", id);
        treatmentService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /treatments/search?query=:query} : search for the treatment corresponding
     * to the query.
     *
     * @param query the query of the treatment search.
     * @return the result of the search.
     */
    @GetMapping("/treatments/search")
    public ResponseEntity<List<Treatment>> searchTreatments(@RequestParam String query) {
        log.debug("REST request to search for a page of Drugs for query {}", query);
        List<Treatment> treatments = treatmentService.searchTreatment(query);
        return ResponseEntity.ok().body(treatments);
    }
}
