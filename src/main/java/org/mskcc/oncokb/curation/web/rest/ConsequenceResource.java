package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.repository.ConsequenceRepository;
import org.mskcc.oncokb.curation.service.ConsequenceService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Consequence}.
 */
@RestController
@RequestMapping("/api")
public class ConsequenceResource {

    private final Logger log = LoggerFactory.getLogger(ConsequenceResource.class);

    private static final String ENTITY_NAME = "consequence";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ConsequenceService consequenceService;

    private final ConsequenceRepository consequenceRepository;

    public ConsequenceResource(ConsequenceService consequenceService, ConsequenceRepository consequenceRepository) {
        this.consequenceService = consequenceService;
        this.consequenceRepository = consequenceRepository;
    }

    /**
     * {@code POST  /consequences} : Create a new consequence.
     *
     * @param consequence the consequence to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new consequence, or with status {@code 400 (Bad Request)} if the consequence has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/consequences")
    public ResponseEntity<Consequence> createConsequence(@Valid @RequestBody Consequence consequence) throws URISyntaxException {
        log.debug("REST request to save Consequence : {}", consequence);
        if (consequence.getId() != null) {
            throw new BadRequestAlertException("A new consequence cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Consequence result = consequenceService.save(consequence);
        return ResponseEntity
            .created(new URI("/api/consequences/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /consequences/:id} : Updates an existing consequence.
     *
     * @param id the id of the consequence to save.
     * @param consequence the consequence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated consequence,
     * or with status {@code 400 (Bad Request)} if the consequence is not valid,
     * or with status {@code 500 (Internal Server Error)} if the consequence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/consequences/{id}")
    public ResponseEntity<Consequence> updateConsequence(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Consequence consequence
    ) throws URISyntaxException {
        log.debug("REST request to update Consequence : {}, {}", id, consequence);
        if (consequence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, consequence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!consequenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Consequence result = consequenceService.save(consequence);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, consequence.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /consequences/:id} : Partial updates given fields of an existing consequence, field will ignore if it is null
     *
     * @param id the id of the consequence to save.
     * @param consequence the consequence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated consequence,
     * or with status {@code 400 (Bad Request)} if the consequence is not valid,
     * or with status {@code 404 (Not Found)} if the consequence is not found,
     * or with status {@code 500 (Internal Server Error)} if the consequence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/consequences/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Consequence> partialUpdateConsequence(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Consequence consequence
    ) throws URISyntaxException {
        log.debug("REST request to partial update Consequence partially : {}, {}", id, consequence);
        if (consequence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, consequence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!consequenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Consequence> result = consequenceService.partialUpdate(consequence);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, consequence.getId().toString())
        );
    }

    /**
     * {@code GET  /consequences} : get all the consequences.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of consequences in body.
     */
    @GetMapping("/consequences")
    public List<Consequence> getAllConsequences() {
        log.debug("REST request to get all Consequences");
        return consequenceService.findAll();
    }

    /**
     * {@code GET  /consequences/:id} : get the "id" consequence.
     *
     * @param id the id of the consequence to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the consequence, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/consequences/{id}")
    public ResponseEntity<Consequence> getConsequence(@PathVariable Long id) {
        log.debug("REST request to get Consequence : {}", id);
        Optional<Consequence> consequence = consequenceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(consequence);
    }

    /**
     * {@code DELETE  /consequences/:id} : delete the "id" consequence.
     *
     * @param id the id of the consequence to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/consequences/{id}")
    public ResponseEntity<Void> deleteConsequence(@PathVariable Long id) {
        log.debug("REST request to delete Consequence : {}", id);
        consequenceService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
