package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.repository.SequenceRepository;
import org.mskcc.oncokb.curation.service.SequenceService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Sequence}.
 */
@RestController
@RequestMapping("/api")
public class SequenceResource {

    private final Logger log = LoggerFactory.getLogger(SequenceResource.class);

    private static final String ENTITY_NAME = "sequence";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SequenceService sequenceService;

    private final SequenceRepository sequenceRepository;

    public SequenceResource(SequenceService sequenceService, SequenceRepository sequenceRepository) {
        this.sequenceService = sequenceService;
        this.sequenceRepository = sequenceRepository;
    }

    /**
     * {@code POST  /sequences} : Create a new sequence.
     *
     * @param sequence the sequence to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new sequence, or with status {@code 400 (Bad Request)} if the sequence has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/sequences")
    public ResponseEntity<Sequence> createSequence(@RequestBody Sequence sequence) throws URISyntaxException {
        log.debug("REST request to save Sequence : {}", sequence);
        if (sequence.getId() != null) {
            throw new BadRequestAlertException("A new sequence cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Sequence result = sequenceService.save(sequence);
        return ResponseEntity
            .created(new URI("/api/sequences/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /sequences/:id} : Updates an existing sequence.
     *
     * @param id the id of the sequence to save.
     * @param sequence the sequence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated sequence,
     * or with status {@code 400 (Bad Request)} if the sequence is not valid,
     * or with status {@code 500 (Internal Server Error)} if the sequence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/sequences/{id}")
    public ResponseEntity<Sequence> updateSequence(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Sequence sequence
    ) throws URISyntaxException {
        log.debug("REST request to update Sequence : {}, {}", id, sequence);
        if (sequence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, sequence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!sequenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Sequence result = sequenceService.save(sequence);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, sequence.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /sequences/:id} : Partial updates given fields of an existing sequence, field will ignore if it is null
     *
     * @param id the id of the sequence to save.
     * @param sequence the sequence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated sequence,
     * or with status {@code 400 (Bad Request)} if the sequence is not valid,
     * or with status {@code 404 (Not Found)} if the sequence is not found,
     * or with status {@code 500 (Internal Server Error)} if the sequence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/sequences/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Sequence> partialUpdateSequence(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Sequence sequence
    ) throws URISyntaxException {
        log.debug("REST request to partial update Sequence partially : {}, {}", id, sequence);
        if (sequence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, sequence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!sequenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Sequence> result = sequenceService.partialUpdate(sequence);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, sequence.getId().toString())
        );
    }

    /**
     * {@code GET  /sequences} : get all the sequences.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of sequences in body.
     */
    @GetMapping("/sequences")
    public List<Sequence> getAllSequences() {
        log.debug("REST request to get all Sequences");
        return sequenceService.findAll();
    }

    /**
     * {@code GET  /sequences/:id} : get the "id" sequence.
     *
     * @param id the id of the sequence to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the sequence, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/sequences/{id}")
    public ResponseEntity<Sequence> getSequence(@PathVariable Long id) {
        log.debug("REST request to get Sequence : {}", id);
        Optional<Sequence> sequence = sequenceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(sequence);
    }

    /**
     * {@code DELETE  /sequences/:id} : delete the "id" sequence.
     *
     * @param id the id of the sequence to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/sequences/{id}")
    public ResponseEntity<Void> deleteSequence(@PathVariable Long id) {
        log.debug("REST request to delete Sequence : {}", id);
        sequenceService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
