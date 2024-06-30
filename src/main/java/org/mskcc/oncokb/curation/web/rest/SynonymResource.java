package org.mskcc.oncokb.curation.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.repository.SynonymRepository;
import org.mskcc.oncokb.curation.service.SynonymQueryService;
import org.mskcc.oncokb.curation.service.SynonymService;
import org.mskcc.oncokb.curation.service.criteria.SynonymCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Synonym}.
 */
@RestController
@RequestMapping("/api")
public class SynonymResource {

    private final Logger log = LoggerFactory.getLogger(SynonymResource.class);

    private static final String ENTITY_NAME = "synonym";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SynonymService synonymService;

    private final SynonymRepository synonymRepository;

    private final SynonymQueryService synonymQueryService;

    public SynonymResource(SynonymService synonymService, SynonymRepository synonymRepository, SynonymQueryService synonymQueryService) {
        this.synonymService = synonymService;
        this.synonymRepository = synonymRepository;
        this.synonymQueryService = synonymQueryService;
    }

    /**
     * {@code POST  /synonyms} : Create a new synonym.
     *
     * @param synonym the synonym to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new synonym, or with status {@code 400 (Bad Request)} if the synonym has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/synonyms")
    public ResponseEntity<Synonym> createSynonym(@Valid @RequestBody Synonym synonym) throws URISyntaxException {
        log.debug("REST request to save Synonym : {}", synonym);
        if (synonym.getId() != null) {
            throw new BadRequestAlertException("A new synonym cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Synonym result = synonymService.save(synonym);
        return ResponseEntity.created(new URI("/api/synonyms/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /synonyms/:id} : Updates an existing synonym.
     *
     * @param id the id of the synonym to save.
     * @param synonym the synonym to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated synonym,
     * or with status {@code 400 (Bad Request)} if the synonym is not valid,
     * or with status {@code 500 (Internal Server Error)} if the synonym couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/synonyms/{id}")
    public ResponseEntity<Synonym> updateSynonym(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Synonym synonym
    ) throws URISyntaxException {
        log.debug("REST request to update Synonym : {}, {}", id, synonym);
        if (synonym.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, synonym.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!synonymRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Synonym result = synonymService.save(synonym);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, synonym.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /synonyms/:id} : Partial updates given fields of an existing synonym, field will ignore if it is null
     *
     * @param id the id of the synonym to save.
     * @param synonym the synonym to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated synonym,
     * or with status {@code 400 (Bad Request)} if the synonym is not valid,
     * or with status {@code 404 (Not Found)} if the synonym is not found,
     * or with status {@code 500 (Internal Server Error)} if the synonym couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/synonyms/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Synonym> partialUpdateSynonym(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Synonym synonym
    ) throws URISyntaxException {
        log.debug("REST request to partial update Synonym partially : {}, {}", id, synonym);
        if (synonym.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, synonym.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!synonymRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Synonym> result = synonymService.partialUpdate(synonym);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, synonym.getId().toString())
        );
    }

    /**
     * {@code GET  /synonyms} : get all the synonyms.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of synonyms in body.
     */
    @GetMapping("/synonyms")
    public ResponseEntity<List<Synonym>> getAllSynonyms(SynonymCriteria criteria, Pageable pageable) {
        log.debug("REST request to get Synonyms by criteria: {}", criteria);
        Page<Synonym> page = synonymQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /synonyms/count} : count all the synonyms.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/synonyms/count")
    public ResponseEntity<Long> countSynonyms(SynonymCriteria criteria) {
        log.debug("REST request to count Synonyms by criteria: {}", criteria);
        return ResponseEntity.ok().body(synonymQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /synonyms/:id} : get the "id" synonym.
     *
     * @param id the id of the synonym to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the synonym, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/synonyms/{id}")
    public ResponseEntity<Synonym> getSynonym(@PathVariable Long id) {
        log.debug("REST request to get Synonym : {}", id);
        Optional<Synonym> synonym = synonymService.findOne(id);
        return ResponseUtil.wrapOrNotFound(synonym);
    }

    /**
     * {@code DELETE  /synonyms/:id} : delete the "id" synonym.
     *
     * @param id the id of the synonym to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/synonyms/{id}")
    public ResponseEntity<Void> deleteSynonym(@PathVariable Long id) {
        log.debug("REST request to delete Synonym : {}", id);
        synonymService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /synonyms/search?query=:query} : search for the Synonym corresponding
     * to the query.
     *
     * @param query    the query of the Synonym search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/synonyms/search")
    public ResponseEntity<List<Synonym>> searchSynonymss(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Synonyms for query {}", query);
        // TODO: implement the search
        Page<Synonym> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
