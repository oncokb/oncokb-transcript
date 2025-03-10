package org.mskcc.oncokb.curation.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.dto.ProteinExonDTO;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.repository.TranscriptRepository;
import org.mskcc.oncokb.curation.service.GeneService;
import org.mskcc.oncokb.curation.service.TranscriptQueryService;
import org.mskcc.oncokb.curation.service.TranscriptService;
import org.mskcc.oncokb.curation.service.criteria.TranscriptCriteria;
import org.mskcc.oncokb.curation.service.dto.ClustalOResp;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Transcript}.
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

    private final TranscriptQueryService transcriptQueryService;

    private final GeneService geneService;

    public TranscriptResource(
        TranscriptService transcriptService,
        TranscriptRepository transcriptRepository,
        TranscriptQueryService transcriptQueryService,
        GeneService geneService
    ) {
        this.transcriptService = transcriptService;
        this.transcriptRepository = transcriptRepository;
        this.transcriptQueryService = transcriptQueryService;
        this.geneService = geneService;
    }

    /**
     * {@code POST  /transcripts} : Create a new transcript.
     *
     * @param transcriptDTO the transcriptDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new transcriptDTO, or with status {@code 400 (Bad Request)} if the transcript has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/transcripts")
    public ResponseEntity<TranscriptDTO> createTranscript(@Valid @RequestBody TranscriptDTO transcriptDTO) throws URISyntaxException {
        log.debug("REST request to save Transcript : {}", transcriptDTO);
        if (transcriptDTO.getId() != null) {
            throw new BadRequestAlertException("A new transcript cannot already have an ID", ENTITY_NAME, "idexists");
        }
        TranscriptDTO result = transcriptService.save(transcriptDTO);
        return ResponseEntity.created(new URI("/api/transcripts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /transcripts/:id} : Updates an existing transcript.
     *
     * @param id the id of the transcriptDTO to save.
     * @param transcriptDTO the transcriptDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated transcriptDTO,
     * or with status {@code 400 (Bad Request)} if the transcriptDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the transcriptDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/transcripts/{id}")
    public ResponseEntity<TranscriptDTO> updateTranscript(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TranscriptDTO transcriptDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Transcript : {}, {}", id, transcriptDTO);
        if (transcriptDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, transcriptDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!transcriptRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        TranscriptDTO result = transcriptService.save(transcriptDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, transcriptDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /transcripts/:id} : Partial updates given fields of an existing transcript, field will ignore if it is null
     *
     * @param id the id of the transcriptDTO to save.
     * @param transcriptDTO the transcriptDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated transcriptDTO,
     * or with status {@code 400 (Bad Request)} if the transcriptDTO is not valid,
     * or with status {@code 404 (Not Found)} if the transcriptDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the transcriptDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/transcripts/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TranscriptDTO> partialUpdateTranscript(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TranscriptDTO transcriptDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update Transcript partially : {}, {}", id, transcriptDTO);
        if (transcriptDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, transcriptDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!transcriptRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TranscriptDTO> result = transcriptService.partialUpdate(transcriptDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, transcriptDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /transcripts} : get all the transcripts.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of transcripts in body.
     */
    @GetMapping("/transcripts")
    public ResponseEntity<List<TranscriptDTO>> getAllTranscripts(TranscriptCriteria criteria, Pageable pageable) {
        log.debug("REST request to get Transcripts by criteria: {}", criteria);
        Page<TranscriptDTO> page = transcriptQueryService.findByCriteria(criteria, pageable);
        List<TranscriptDTO> transcriptDTOS = transcriptService.findAllWithEagerRelationshipsByIdIn(
            page.getContent().stream().map(TranscriptDTO::getId).collect(Collectors.toList())
        );
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(transcriptDTOS);
    }

    /**
     * {@code GET  /transcripts/count} : count all the transcripts.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/transcripts/count")
    public ResponseEntity<Long> countTranscripts(TranscriptCriteria criteria) {
        log.debug("REST request to count Transcripts by criteria: {}", criteria);
        return ResponseEntity.ok().body(transcriptQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /transcripts/:id} : get the "id" transcript.
     *
     * @param id the id of the transcriptDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the transcriptDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/transcripts/{id}")
    public ResponseEntity<TranscriptDTO> getTranscript(@PathVariable Long id) {
        log.debug("REST request to get Transcript : {}", id);
        Optional<TranscriptDTO> transcriptDTO = transcriptService.findOne(id);
        return ResponseUtil.wrapOrNotFound(transcriptDTO);
    }

    /**
     * {@code DELETE  /transcripts/:id} : delete the "id" transcript.
     *
     * @param id the id of the transcriptDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/transcripts/{id}")
    public ResponseEntity<Void> deleteTranscript(@PathVariable Long id) {
        log.debug("REST request to delete Transcript : {}", id);
        transcriptService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /transcripts/search?query=:query} : search for the Transcript corresponding
     * to the query.
     *
     * @param query    the query of the Transcript search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/transcripts/search")
    public ResponseEntity<List<TranscriptDTO>> searchTranscripts(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of FdaSubmissions for query {}", query);
        Page<TranscriptDTO> page = transcriptQueryService.findBySearchQuery(query, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @PostMapping("/transcripts/align")
    public ResponseEntity<ClustalOResp> alignTranscripts(@RequestBody List<Long> body) throws InterruptedException {
        log.debug("REST request to align existing transcripts");
        return ResponseEntity.ok().body(transcriptService.alignTranscripts(body));
    }

    @GetMapping("/transcripts/protein-exons")
    public ResponseEntity<List<ProteinExonDTO>> getProteinExons(
        @RequestParam String hugoSymbol,
        @RequestParam ReferenceGenome referenceGenome
    ) {
        log.debug("REST request to get protein exons for gene: {} and reference genome: {}", hugoSymbol, referenceGenome);
        Gene gene = geneService
            .findGeneByHugoSymbol(hugoSymbol)
            .orElseThrow(() -> new BadRequestAlertException("Invalid hugoSymbol", ENTITY_NAME, "genenotfound"));
        return ResponseEntity.ok().body(transcriptService.getExons(gene, referenceGenome));
    }
}
