package org.mskcc.oncokb.transcript.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.TranscriptUsage;
import org.mskcc.oncokb.transcript.repository.TranscriptUsageRepository;
import org.mskcc.oncokb.transcript.service.TranscriptUsageService;
import org.mskcc.oncokb.transcript.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.transcript.domain.TranscriptUsage}.
 */
//@RestController
//@RequestMapping("/api")
public class TranscriptUsageResource {

    private final Logger log = LoggerFactory.getLogger(TranscriptUsageResource.class);

    private static final String ENTITY_NAME = "transcriptUsage";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TranscriptUsageService transcriptUsageService;

    private final TranscriptUsageRepository transcriptUsageRepository;

    public TranscriptUsageResource(TranscriptUsageService transcriptUsageService, TranscriptUsageRepository transcriptUsageRepository) {
        this.transcriptUsageService = transcriptUsageService;
        this.transcriptUsageRepository = transcriptUsageRepository;
    }

    /**
     * {@code POST  /transcript-usages} : Create a new transcriptUsage.
     *
     * @param transcriptUsage the transcriptUsage to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new transcriptUsage, or with status {@code 400 (Bad Request)} if the transcriptUsage has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    //    @PostMapping("/transcript-usages")
    public ResponseEntity<TranscriptUsage> createTranscriptUsage(@RequestBody TranscriptUsage transcriptUsage) throws URISyntaxException {
        log.debug("REST request to save TranscriptUsage : {}", transcriptUsage);
        if (transcriptUsage.getId() != null) {
            throw new BadRequestAlertException("A new transcriptUsage cannot already have an ID", ENTITY_NAME, "idexists");
        }
        TranscriptUsage result = transcriptUsageService.save(transcriptUsage);
        return ResponseEntity
            .created(new URI("/api/transcript-usages/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /transcript-usages/:id} : Updates an existing transcriptUsage.
     *
     * @param id the id of the transcriptUsage to save.
     * @param transcriptUsage the transcriptUsage to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated transcriptUsage,
     * or with status {@code 400 (Bad Request)} if the transcriptUsage is not valid,
     * or with status {@code 500 (Internal Server Error)} if the transcriptUsage couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    //    @PutMapping("/transcript-usages/{id}")
    public ResponseEntity<TranscriptUsage> updateTranscriptUsage(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody TranscriptUsage transcriptUsage
    ) throws URISyntaxException {
        log.debug("REST request to update TranscriptUsage : {}, {}", id, transcriptUsage);
        if (transcriptUsage.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, transcriptUsage.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!transcriptUsageRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        TranscriptUsage result = transcriptUsageService.save(transcriptUsage);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, transcriptUsage.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /transcript-usages/:id} : Partial updates given fields of an existing transcriptUsage, field will ignore if it is null
     *
     * @param id the id of the transcriptUsage to save.
     * @param transcriptUsage the transcriptUsage to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated transcriptUsage,
     * or with status {@code 400 (Bad Request)} if the transcriptUsage is not valid,
     * or with status {@code 404 (Not Found)} if the transcriptUsage is not found,
     * or with status {@code 500 (Internal Server Error)} if the transcriptUsage couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    //    @PatchMapping(value = "/transcript-usages/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<TranscriptUsage> partialUpdateTranscriptUsage(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody TranscriptUsage transcriptUsage
    ) throws URISyntaxException {
        log.debug("REST request to partial update TranscriptUsage partially : {}, {}", id, transcriptUsage);
        if (transcriptUsage.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, transcriptUsage.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!transcriptUsageRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TranscriptUsage> result = transcriptUsageService.partialUpdate(transcriptUsage);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, transcriptUsage.getId().toString())
        );
    }

    /**
     * {@code GET  /transcript-usages} : get all the transcriptUsages.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of transcriptUsages in body.
     */
    //    @GetMapping("/transcript-usages")
    public List<TranscriptUsage> getAllTranscriptUsages() {
        log.debug("REST request to get all TranscriptUsages");
        return transcriptUsageService.findAll();
    }

    /**
     * {@code GET  /transcript-usages/:id} : get the "id" transcriptUsage.
     *
     * @param id the id of the transcriptUsage to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the transcriptUsage, or with status {@code 404 (Not Found)}.
     */
    //    @GetMapping("/transcript-usages/{id}")
    public ResponseEntity<TranscriptUsage> getTranscriptUsage(@PathVariable Long id) {
        log.debug("REST request to get TranscriptUsage : {}", id);
        Optional<TranscriptUsage> transcriptUsage = transcriptUsageService.findOne(id);
        return ResponseUtil.wrapOrNotFound(transcriptUsage);
    }

    /**
     * {@code DELETE  /transcript-usages/:id} : delete the "id" transcriptUsage.
     *
     * @param id the id of the transcriptUsage to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    //    @DeleteMapping("/transcript-usages/{id}")
    public ResponseEntity<Void> deleteTranscriptUsage(@PathVariable Long id) {
        log.debug("REST request to delete TranscriptUsage : {}", id);
        transcriptUsageService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
