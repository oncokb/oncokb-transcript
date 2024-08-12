package org.mskcc.oncokb.curation.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.SeqRegion;
import org.mskcc.oncokb.curation.repository.SeqRegionRepository;
import org.mskcc.oncokb.curation.service.SeqRegionService;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.SeqRegion}.
 */
@RestController
@RequestMapping("/api")
public class SeqRegionResource {

    private final Logger log = LoggerFactory.getLogger(SeqRegionResource.class);

    private static final String ENTITY_NAME = "seqRegion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SeqRegionService seqRegionService;

    private final SeqRegionRepository seqRegionRepository;

    public SeqRegionResource(SeqRegionService seqRegionService, SeqRegionRepository seqRegionRepository) {
        this.seqRegionService = seqRegionService;
        this.seqRegionRepository = seqRegionRepository;
    }

    /**
     * {@code POST  /seq-regions} : Create a new seqRegion.
     *
     * @param seqRegion the seqRegion to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new seqRegion, or with status {@code 400 (Bad Request)} if the seqRegion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/seq-regions")
    public ResponseEntity<SeqRegion> createSeqRegion(@Valid @RequestBody SeqRegion seqRegion) throws URISyntaxException {
        log.debug("REST request to save SeqRegion : {}", seqRegion);
        if (seqRegion.getId() != null) {
            throw new BadRequestAlertException("A new seqRegion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        SeqRegion result = seqRegionService.save(seqRegion);
        return ResponseEntity.created(new URI("/api/seq-regions/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /seq-regions/:id} : Updates an existing seqRegion.
     *
     * @param id the id of the seqRegion to save.
     * @param seqRegion the seqRegion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated seqRegion,
     * or with status {@code 400 (Bad Request)} if the seqRegion is not valid,
     * or with status {@code 500 (Internal Server Error)} if the seqRegion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/seq-regions/{id}")
    public ResponseEntity<SeqRegion> updateSeqRegion(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SeqRegion seqRegion
    ) throws URISyntaxException {
        log.debug("REST request to update SeqRegion : {}, {}", id, seqRegion);
        if (seqRegion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, seqRegion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!seqRegionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        SeqRegion result = seqRegionService.save(seqRegion);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, seqRegion.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /seq-regions/:id} : Partial updates given fields of an existing seqRegion, field will ignore if it is null
     *
     * @param id the id of the seqRegion to save.
     * @param seqRegion the seqRegion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated seqRegion,
     * or with status {@code 400 (Bad Request)} if the seqRegion is not valid,
     * or with status {@code 404 (Not Found)} if the seqRegion is not found,
     * or with status {@code 500 (Internal Server Error)} if the seqRegion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/seq-regions/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SeqRegion> partialUpdateSeqRegion(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SeqRegion seqRegion
    ) throws URISyntaxException {
        log.debug("REST request to partial update SeqRegion partially : {}, {}", id, seqRegion);
        if (seqRegion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, seqRegion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!seqRegionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SeqRegion> result = seqRegionService.partialUpdate(seqRegion);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, seqRegion.getId().toString())
        );
    }

    /**
     * {@code GET  /seq-regions} : get all the seqRegions.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of seqRegions in body.
     */
    @GetMapping("/seq-regions")
    public List<SeqRegion> getAllSeqRegions() {
        log.debug("REST request to get all SeqRegions");
        return seqRegionService.findAll();
    }

    /**
     * {@code GET  /seq-regions/:id} : get the "id" seqRegion.
     *
     * @param id the id of the seqRegion to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the seqRegion, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/seq-regions/{id}")
    public ResponseEntity<SeqRegion> getSeqRegion(@PathVariable Long id) {
        log.debug("REST request to get SeqRegion : {}", id);
        Optional<SeqRegion> seqRegion = seqRegionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(seqRegion);
    }

    /**
     * {@code DELETE  /seq-regions/:id} : delete the "id" seqRegion.
     *
     * @param id the id of the seqRegion to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/seq-regions/{id}")
    public ResponseEntity<Void> deleteSeqRegion(@PathVariable Long id) {
        log.debug("REST request to delete SeqRegion : {}", id);
        seqRegionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /seq-regions/search?query=:query} : search for the SeqRegion corresponding
     * to the query.
     *
     * @param query    the query of the SeqRegion search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/seq-regions/search")
    public ResponseEntity<List<SeqRegion>> searchSeqRegions(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of SeqRegions for query {}", query);
        // TODO: implement the search
        Page<SeqRegion> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
