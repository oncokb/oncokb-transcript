package org.mskcc.oncokb.transcript.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.transcript.domain.Transcript;
import org.mskcc.oncokb.transcript.repository.TranscriptRepository;
import org.mskcc.oncokb.transcript.service.TranscriptService;
import org.mskcc.oncokb.transcript.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.cbio.domain.Transcript}.
 */
@RestController
@RequestMapping("/api")
public class TranscriptResource {

    private final Logger log = LoggerFactory.getLogger(TranscriptResource.class);

    private static final String ENTITY_NAME = "transcript";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TranscriptService transcriptService;

    private final TranscriptRepository transcriptRepository;

    public TranscriptResource(TranscriptService transcriptService, TranscriptRepository transcriptRepository) {
        this.transcriptService = transcriptService;
        this.transcriptRepository = transcriptRepository;
    }

    /**
     * {@code POST  /transcripts} : Create a new transcript.
     *
     * @param transcript the transcript to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new transcript, or with status {@code 400 (Bad Request)} if the transcript has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/transcripts")
    public ResponseEntity<Transcript> createTranscript(@Valid @RequestBody Transcript transcript) throws URISyntaxException {
        log.debug("REST request to save Transcript : {}", transcript);
        if (transcript.getId() != null) {
            throw new BadRequestAlertException("A new transcript cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Transcript result = transcriptService.save(transcript);
        return ResponseEntity
            .created(new URI("/api/transcripts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /transcripts/:id} : Updates an existing transcript.
     *
     * @param id the id of the transcript to save.
     * @param transcript the transcript to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated transcript,
     * or with status {@code 400 (Bad Request)} if the transcript is not valid,
     * or with status {@code 500 (Internal Server Error)} if the transcript couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/transcripts/{id}")
    public ResponseEntity<Transcript> updateTranscript(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Transcript transcript
    ) throws URISyntaxException {
        log.debug("REST request to update Transcript : {}, {}", id, transcript);
        if (transcript.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, transcript.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!transcriptRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Transcript result = transcriptService.save(transcript);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, transcript.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /transcripts/:id} : Partial updates given fields of an existing transcript, field will ignore if it is null
     *
     * @param id the id of the transcript to save.
     * @param transcript the transcript to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated transcript,
     * or with status {@code 400 (Bad Request)} if the transcript is not valid,
     * or with status {@code 404 (Not Found)} if the transcript is not found,
     * or with status {@code 500 (Internal Server Error)} if the transcript couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/transcripts/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<Transcript> partialUpdateTranscript(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Transcript transcript
    ) throws URISyntaxException {
        log.debug("REST request to partial update Transcript partially : {}, {}", id, transcript);
        if (transcript.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, transcript.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!transcriptRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Transcript> result = transcriptService.partialUpdate(transcript);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, transcript.getId().toString())
        );
    }

    /**
     * {@code GET  /transcripts} : get all the transcripts.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of transcripts in body.
     */
    @GetMapping("/transcripts")
    public List<Transcript> getAllTranscripts() {
        log.debug("REST request to get all Transcripts");
        return transcriptService.findAll();
    }

    /**
     * {@code GET  /transcripts/:id} : get the "id" transcript.
     *
     * @param id the id of the transcript to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the transcript, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/transcripts/{id}")
    public ResponseEntity<Transcript> getTranscript(@PathVariable Long id) {
        log.debug("REST request to get Transcript : {}", id);
        Optional<Transcript> transcript = transcriptService.findOne(id);
        return ResponseUtil.wrapOrNotFound(transcript);
    }

    /**
     * {@code DELETE  /transcripts/:id} : delete the "id" transcript.
     *
     * @param id the id of the transcript to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/transcripts/{id}")
    public ResponseEntity<Void> deleteTranscript(@PathVariable Long id) {
        log.debug("REST request to delete Transcript : {}", id);
        transcriptService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
