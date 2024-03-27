package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.TreatmentPriority;
import org.mskcc.oncokb.curation.repository.TreatmentPriorityRepository;
import org.mskcc.oncokb.curation.service.TreatmentPriorityService;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.TreatmentPriority}.
 */
@RestController
@RequestMapping("/api")
public class TreatmentPriorityResource {

    private final Logger log = LoggerFactory.getLogger(TreatmentPriorityResource.class);

    private static final String ENTITY_NAME = "treatmentPriority";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TreatmentPriorityService treatmentPriorityService;

    private final TreatmentPriorityRepository treatmentPriorityRepository;

    public TreatmentPriorityResource(
        TreatmentPriorityService treatmentPriorityService,
        TreatmentPriorityRepository treatmentPriorityRepository
    ) {
        this.treatmentPriorityService = treatmentPriorityService;
        this.treatmentPriorityRepository = treatmentPriorityRepository;
    }

    /**
     * {@code POST  /treatment-priorities} : Create a new treatmentPriority.
     *
     * @param treatmentPriority the treatmentPriority to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new treatmentPriority, or with status {@code 400 (Bad Request)} if the treatmentPriority has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/treatment-priorities")
    public ResponseEntity<TreatmentPriority> createTreatmentPriority(@Valid @RequestBody TreatmentPriority treatmentPriority)
        throws URISyntaxException {
        log.debug("REST request to save TreatmentPriority : {}", treatmentPriority);
        if (treatmentPriority.getId() != null) {
            throw new BadRequestAlertException("A new treatmentPriority cannot already have an ID", ENTITY_NAME, "idexists");
        }
        TreatmentPriority result = treatmentPriorityService.save(treatmentPriority);
        return ResponseEntity
            .created(new URI("/api/treatment-priorities/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /treatment-priorities/:id} : Updates an existing treatmentPriority.
     *
     * @param id the id of the treatmentPriority to save.
     * @param treatmentPriority the treatmentPriority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated treatmentPriority,
     * or with status {@code 400 (Bad Request)} if the treatmentPriority is not valid,
     * or with status {@code 500 (Internal Server Error)} if the treatmentPriority couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/treatment-priorities/{id}")
    public ResponseEntity<TreatmentPriority> updateTreatmentPriority(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TreatmentPriority treatmentPriority
    ) throws URISyntaxException {
        log.debug("REST request to update TreatmentPriority : {}, {}", id, treatmentPriority);
        if (treatmentPriority.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, treatmentPriority.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!treatmentPriorityRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        TreatmentPriority result = treatmentPriorityService.save(treatmentPriority);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, treatmentPriority.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /treatment-priorities/:id} : Partial updates given fields of an existing treatmentPriority, field will ignore if it is null
     *
     * @param id the id of the treatmentPriority to save.
     * @param treatmentPriority the treatmentPriority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated treatmentPriority,
     * or with status {@code 400 (Bad Request)} if the treatmentPriority is not valid,
     * or with status {@code 404 (Not Found)} if the treatmentPriority is not found,
     * or with status {@code 500 (Internal Server Error)} if the treatmentPriority couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/treatment-priorities/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TreatmentPriority> partialUpdateTreatmentPriority(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TreatmentPriority treatmentPriority
    ) throws URISyntaxException {
        log.debug("REST request to partial update TreatmentPriority partially : {}, {}", id, treatmentPriority);
        if (treatmentPriority.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, treatmentPriority.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!treatmentPriorityRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TreatmentPriority> result = treatmentPriorityService.partialUpdate(treatmentPriority);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, treatmentPriority.getId().toString())
        );
    }

    /**
     * {@code GET  /treatment-priorities} : get all the treatmentPriorities.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of treatmentPriorities in body.
     */
    @GetMapping("/treatment-priorities")
    public List<TreatmentPriority> getAllTreatmentPriorities() {
        log.debug("REST request to get all TreatmentPriorities");
        return treatmentPriorityService.findAll();
    }

    /**
     * {@code GET  /treatment-priorities/:id} : get the "id" treatmentPriority.
     *
     * @param id the id of the treatmentPriority to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the treatmentPriority, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/treatment-priorities/{id}")
    public ResponseEntity<TreatmentPriority> getTreatmentPriority(@PathVariable Long id) {
        log.debug("REST request to get TreatmentPriority : {}", id);
        Optional<TreatmentPriority> treatmentPriority = treatmentPriorityService.findOne(id);
        return ResponseUtil.wrapOrNotFound(treatmentPriority);
    }

    /**
     * {@code DELETE  /treatment-priorities/:id} : delete the "id" treatmentPriority.
     *
     * @param id the id of the treatmentPriority to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/treatment-priorities/{id}")
    public ResponseEntity<Void> deleteTreatmentPriority(@PathVariable Long id) {
        log.debug("REST request to delete TreatmentPriority : {}", id);
        treatmentPriorityService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /treatment-priorities/search?query=:query} : search for the TreatmentPriority corresponding
     * to the query.
     *
     * @param query    the query of the TreatmentPriority search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/treatment-priorities/search")
    public ResponseEntity<List<TreatmentPriority>> searchTreatmentPriorities(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of TreatmentPriorities for query {}", query);
        // TODO: implement the search
        Page<TreatmentPriority> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
