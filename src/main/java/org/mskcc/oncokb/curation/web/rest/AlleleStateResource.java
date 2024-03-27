package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.AlleleState;
import org.mskcc.oncokb.curation.repository.AlleleStateRepository;
import org.mskcc.oncokb.curation.service.AlleleStateService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.AlleleState}.
 */
@RestController
@RequestMapping("/api")
public class AlleleStateResource {

    private final Logger log = LoggerFactory.getLogger(AlleleStateResource.class);

    private static final String ENTITY_NAME = "alleleState";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AlleleStateService alleleStateService;

    private final AlleleStateRepository alleleStateRepository;

    public AlleleStateResource(AlleleStateService alleleStateService, AlleleStateRepository alleleStateRepository) {
        this.alleleStateService = alleleStateService;
        this.alleleStateRepository = alleleStateRepository;
    }

    /**
     * {@code POST  /allele-states} : Create a new alleleState.
     *
     * @param alleleState the alleleState to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new alleleState, or with status {@code 400 (Bad Request)} if the alleleState has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/allele-states")
    public ResponseEntity<AlleleState> createAlleleState(@Valid @RequestBody AlleleState alleleState) throws URISyntaxException {
        log.debug("REST request to save AlleleState : {}", alleleState);
        if (alleleState.getId() != null) {
            throw new BadRequestAlertException("A new alleleState cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AlleleState result = alleleStateService.save(alleleState);
        return ResponseEntity
            .created(new URI("/api/allele-states/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /allele-states/:id} : Updates an existing alleleState.
     *
     * @param id the id of the alleleState to save.
     * @param alleleState the alleleState to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated alleleState,
     * or with status {@code 400 (Bad Request)} if the alleleState is not valid,
     * or with status {@code 500 (Internal Server Error)} if the alleleState couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/allele-states/{id}")
    public ResponseEntity<AlleleState> updateAlleleState(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AlleleState alleleState
    ) throws URISyntaxException {
        log.debug("REST request to update AlleleState : {}, {}", id, alleleState);
        if (alleleState.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, alleleState.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!alleleStateRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        AlleleState result = alleleStateService.save(alleleState);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, alleleState.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /allele-states/:id} : Partial updates given fields of an existing alleleState, field will ignore if it is null
     *
     * @param id the id of the alleleState to save.
     * @param alleleState the alleleState to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated alleleState,
     * or with status {@code 400 (Bad Request)} if the alleleState is not valid,
     * or with status {@code 404 (Not Found)} if the alleleState is not found,
     * or with status {@code 500 (Internal Server Error)} if the alleleState couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/allele-states/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AlleleState> partialUpdateAlleleState(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AlleleState alleleState
    ) throws URISyntaxException {
        log.debug("REST request to partial update AlleleState partially : {}, {}", id, alleleState);
        if (alleleState.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, alleleState.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!alleleStateRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AlleleState> result = alleleStateService.partialUpdate(alleleState);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, alleleState.getId().toString())
        );
    }

    /**
     * {@code GET  /allele-states} : get all the alleleStates.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of alleleStates in body.
     */
    @GetMapping("/allele-states")
    public List<AlleleState> getAllAlleleStates() {
        log.debug("REST request to get all AlleleStates");
        return alleleStateService.findAll();
    }

    /**
     * {@code GET  /allele-states/:id} : get the "id" alleleState.
     *
     * @param id the id of the alleleState to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the alleleState, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/allele-states/{id}")
    public ResponseEntity<AlleleState> getAlleleState(@PathVariable Long id) {
        log.debug("REST request to get AlleleState : {}", id);
        Optional<AlleleState> alleleState = alleleStateService.findOne(id);
        return ResponseUtil.wrapOrNotFound(alleleState);
    }

    /**
     * {@code DELETE  /allele-states/:id} : delete the "id" alleleState.
     *
     * @param id the id of the alleleState to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/allele-states/{id}")
    public ResponseEntity<Void> deleteAlleleState(@PathVariable Long id) {
        log.debug("REST request to delete AlleleState : {}", id);
        alleleStateService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
