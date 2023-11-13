package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.LevelOfEvidence;
import org.mskcc.oncokb.curation.repository.LevelOfEvidenceRepository;
import org.mskcc.oncokb.curation.service.LevelOfEvidenceService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.LevelOfEvidence}.
 */
@RestController
@RequestMapping("/api")
public class LevelOfEvidenceResource {

    private final Logger log = LoggerFactory.getLogger(LevelOfEvidenceResource.class);

    private static final String ENTITY_NAME = "levelOfEvidence";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LevelOfEvidenceService levelOfEvidenceService;

    private final LevelOfEvidenceRepository levelOfEvidenceRepository;

    public LevelOfEvidenceResource(LevelOfEvidenceService levelOfEvidenceService, LevelOfEvidenceRepository levelOfEvidenceRepository) {
        this.levelOfEvidenceService = levelOfEvidenceService;
        this.levelOfEvidenceRepository = levelOfEvidenceRepository;
    }

    /**
     * {@code POST  /level-of-evidences} : Create a new levelOfEvidence.
     *
     * @param levelOfEvidence the levelOfEvidence to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new levelOfEvidence, or with status {@code 400 (Bad Request)} if the levelOfEvidence has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/level-of-evidences")
    public ResponseEntity<LevelOfEvidence> createLevelOfEvidence(@Valid @RequestBody LevelOfEvidence levelOfEvidence)
        throws URISyntaxException {
        log.debug("REST request to save LevelOfEvidence : {}", levelOfEvidence);
        if (levelOfEvidence.getId() != null) {
            throw new BadRequestAlertException("A new levelOfEvidence cannot already have an ID", ENTITY_NAME, "idexists");
        }
        LevelOfEvidence result = levelOfEvidenceService.save(levelOfEvidence);
        return ResponseEntity
            .created(new URI("/api/level-of-evidences/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /level-of-evidences/:id} : Updates an existing levelOfEvidence.
     *
     * @param id the id of the levelOfEvidence to save.
     * @param levelOfEvidence the levelOfEvidence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated levelOfEvidence,
     * or with status {@code 400 (Bad Request)} if the levelOfEvidence is not valid,
     * or with status {@code 500 (Internal Server Error)} if the levelOfEvidence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/level-of-evidences/{id}")
    public ResponseEntity<LevelOfEvidence> updateLevelOfEvidence(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LevelOfEvidence levelOfEvidence
    ) throws URISyntaxException {
        log.debug("REST request to update LevelOfEvidence : {}, {}", id, levelOfEvidence);
        if (levelOfEvidence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, levelOfEvidence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!levelOfEvidenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        LevelOfEvidence result = levelOfEvidenceService.save(levelOfEvidence);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, levelOfEvidence.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /level-of-evidences/:id} : Partial updates given fields of an existing levelOfEvidence, field will ignore if it is null
     *
     * @param id the id of the levelOfEvidence to save.
     * @param levelOfEvidence the levelOfEvidence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated levelOfEvidence,
     * or with status {@code 400 (Bad Request)} if the levelOfEvidence is not valid,
     * or with status {@code 404 (Not Found)} if the levelOfEvidence is not found,
     * or with status {@code 500 (Internal Server Error)} if the levelOfEvidence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/level-of-evidences/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<LevelOfEvidence> partialUpdateLevelOfEvidence(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LevelOfEvidence levelOfEvidence
    ) throws URISyntaxException {
        log.debug("REST request to partial update LevelOfEvidence partially : {}, {}", id, levelOfEvidence);
        if (levelOfEvidence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, levelOfEvidence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!levelOfEvidenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LevelOfEvidence> result = levelOfEvidenceService.partialUpdate(levelOfEvidence);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, levelOfEvidence.getId().toString())
        );
    }

    /**
     * {@code GET  /level-of-evidences} : get all the levelOfEvidences.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of levelOfEvidences in body.
     */
    @GetMapping("/level-of-evidences")
    public List<LevelOfEvidence> getAllLevelOfEvidences() {
        log.debug("REST request to get all LevelOfEvidences");
        return levelOfEvidenceService.findAll();
    }

    /**
     * {@code GET  /level-of-evidences/:id} : get the "id" levelOfEvidence.
     *
     * @param id the id of the levelOfEvidence to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the levelOfEvidence, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/level-of-evidences/{id}")
    public ResponseEntity<LevelOfEvidence> getLevelOfEvidence(@PathVariable Long id) {
        log.debug("REST request to get LevelOfEvidence : {}", id);
        Optional<LevelOfEvidence> levelOfEvidence = levelOfEvidenceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(levelOfEvidence);
    }

    /**
     * {@code DELETE  /level-of-evidences/:id} : delete the "id" levelOfEvidence.
     *
     * @param id the id of the levelOfEvidence to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/level-of-evidences/{id}")
    public ResponseEntity<Void> deleteLevelOfEvidence(@PathVariable Long id) {
        log.debug("REST request to delete LevelOfEvidence : {}", id);
        levelOfEvidenceService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
