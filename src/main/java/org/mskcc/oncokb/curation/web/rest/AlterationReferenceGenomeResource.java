package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.AlterationReferenceGenome;
import org.mskcc.oncokb.curation.repository.AlterationReferenceGenomeRepository;
import org.mskcc.oncokb.curation.service.AlterationReferenceGenomeService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.AlterationReferenceGenome}.
 */
@RestController
@RequestMapping("/api")
public class AlterationReferenceGenomeResource {

    private final Logger log = LoggerFactory.getLogger(AlterationReferenceGenomeResource.class);

    private static final String ENTITY_NAME = "alterationReferenceGenome";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AlterationReferenceGenomeService alterationReferenceGenomeService;

    private final AlterationReferenceGenomeRepository alterationReferenceGenomeRepository;

    public AlterationReferenceGenomeResource(
        AlterationReferenceGenomeService alterationReferenceGenomeService,
        AlterationReferenceGenomeRepository alterationReferenceGenomeRepository
    ) {
        this.alterationReferenceGenomeService = alterationReferenceGenomeService;
        this.alterationReferenceGenomeRepository = alterationReferenceGenomeRepository;
    }

    /**
     * {@code POST  /alteration-reference-genomes} : Create a new alterationReferenceGenome.
     *
     * @param alterationReferenceGenome the alterationReferenceGenome to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new alterationReferenceGenome, or with status {@code 400 (Bad Request)} if the alterationReferenceGenome has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/alteration-reference-genomes")
    public ResponseEntity<AlterationReferenceGenome> createAlterationReferenceGenome(
        @RequestBody AlterationReferenceGenome alterationReferenceGenome
    ) throws URISyntaxException {
        log.debug("REST request to save AlterationReferenceGenome : {}", alterationReferenceGenome);
        if (alterationReferenceGenome.getId() != null) {
            throw new BadRequestAlertException("A new alterationReferenceGenome cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AlterationReferenceGenome result = alterationReferenceGenomeService.save(alterationReferenceGenome);
        return ResponseEntity
            .created(new URI("/api/alteration-reference-genomes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /alteration-reference-genomes/:id} : Updates an existing alterationReferenceGenome.
     *
     * @param id the id of the alterationReferenceGenome to save.
     * @param alterationReferenceGenome the alterationReferenceGenome to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated alterationReferenceGenome,
     * or with status {@code 400 (Bad Request)} if the alterationReferenceGenome is not valid,
     * or with status {@code 500 (Internal Server Error)} if the alterationReferenceGenome couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/alteration-reference-genomes/{id}")
    public ResponseEntity<AlterationReferenceGenome> updateAlterationReferenceGenome(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody AlterationReferenceGenome alterationReferenceGenome
    ) throws URISyntaxException {
        log.debug("REST request to update AlterationReferenceGenome : {}, {}", id, alterationReferenceGenome);
        if (alterationReferenceGenome.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, alterationReferenceGenome.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!alterationReferenceGenomeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        AlterationReferenceGenome result = alterationReferenceGenomeService.save(alterationReferenceGenome);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, alterationReferenceGenome.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /alteration-reference-genomes/:id} : Partial updates given fields of an existing alterationReferenceGenome, field will ignore if it is null
     *
     * @param id the id of the alterationReferenceGenome to save.
     * @param alterationReferenceGenome the alterationReferenceGenome to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated alterationReferenceGenome,
     * or with status {@code 400 (Bad Request)} if the alterationReferenceGenome is not valid,
     * or with status {@code 404 (Not Found)} if the alterationReferenceGenome is not found,
     * or with status {@code 500 (Internal Server Error)} if the alterationReferenceGenome couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/alteration-reference-genomes/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AlterationReferenceGenome> partialUpdateAlterationReferenceGenome(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody AlterationReferenceGenome alterationReferenceGenome
    ) throws URISyntaxException {
        log.debug("REST request to partial update AlterationReferenceGenome partially : {}, {}", id, alterationReferenceGenome);
        if (alterationReferenceGenome.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, alterationReferenceGenome.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!alterationReferenceGenomeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AlterationReferenceGenome> result = alterationReferenceGenomeService.partialUpdate(alterationReferenceGenome);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, alterationReferenceGenome.getId().toString())
        );
    }

    /**
     * {@code GET  /alteration-reference-genomes} : get all the alterationReferenceGenomes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of alterationReferenceGenomes in body.
     */
    @GetMapping("/alteration-reference-genomes")
    public List<AlterationReferenceGenome> getAllAlterationReferenceGenomes() {
        log.debug("REST request to get all AlterationReferenceGenomes");
        return alterationReferenceGenomeService.findAll();
    }

    /**
     * {@code GET  /alteration-reference-genomes/:id} : get the "id" alterationReferenceGenome.
     *
     * @param id the id of the alterationReferenceGenome to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the alterationReferenceGenome, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/alteration-reference-genomes/{id}")
    public ResponseEntity<AlterationReferenceGenome> getAlterationReferenceGenome(@PathVariable Long id) {
        log.debug("REST request to get AlterationReferenceGenome : {}", id);
        Optional<AlterationReferenceGenome> alterationReferenceGenome = alterationReferenceGenomeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(alterationReferenceGenome);
    }

    /**
     * {@code DELETE  /alteration-reference-genomes/:id} : delete the "id" alterationReferenceGenome.
     *
     * @param id the id of the alterationReferenceGenome to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/alteration-reference-genomes/{id}")
    public ResponseEntity<Void> deleteAlterationReferenceGenome(@PathVariable Long id) {
        log.debug("REST request to delete AlterationReferenceGenome : {}", id);
        alterationReferenceGenomeService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
