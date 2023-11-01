package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.History;
import org.mskcc.oncokb.curation.repository.HistoryRepository;
import org.mskcc.oncokb.curation.service.HistoryQueryService;
import org.mskcc.oncokb.curation.service.HistoryService;
import org.mskcc.oncokb.curation.service.criteria.HistoryCriteria;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.History}.
 */
@RestController
@RequestMapping("/api")
public class HistoryResource {

    private final Logger log = LoggerFactory.getLogger(HistoryResource.class);

    private static final String ENTITY_NAME = "history";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HistoryService historyService;

    private final HistoryRepository historyRepository;

    private final HistoryQueryService historyQueryService;

    public HistoryResource(HistoryService historyService, HistoryRepository historyRepository, HistoryQueryService historyQueryService) {
        this.historyService = historyService;
        this.historyRepository = historyRepository;
        this.historyQueryService = historyQueryService;
    }

    /**
     * {@code POST  /histories} : Create a new history.
     *
     * @param history the history to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new history, or with status {@code 400 (Bad Request)} if the history has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/histories")
    public ResponseEntity<History> createHistory(@Valid @RequestBody History history) throws URISyntaxException {
        log.debug("REST request to save History : {}", history);
        if (history.getId() != null) {
            throw new BadRequestAlertException("A new history cannot already have an ID", ENTITY_NAME, "idexists");
        }
        History result = historyService.save(history);
        return ResponseEntity
            .created(new URI("/api/histories/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /histories/:id} : Updates an existing history.
     *
     * @param id the id of the history to save.
     * @param history the history to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated history,
     * or with status {@code 400 (Bad Request)} if the history is not valid,
     * or with status {@code 500 (Internal Server Error)} if the history couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/histories/{id}")
    public ResponseEntity<History> updateHistory(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody History history
    ) throws URISyntaxException {
        log.debug("REST request to update History : {}, {}", id, history);
        if (history.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, history.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!historyRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        History result = historyService.save(history);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, history.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /histories/:id} : Partial updates given fields of an existing history, field will ignore if it is null
     *
     * @param id the id of the history to save.
     * @param history the history to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated history,
     * or with status {@code 400 (Bad Request)} if the history is not valid,
     * or with status {@code 404 (Not Found)} if the history is not found,
     * or with status {@code 500 (Internal Server Error)} if the history couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/histories/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<History> partialUpdateHistory(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody History history
    ) throws URISyntaxException {
        log.debug("REST request to partial update History partially : {}, {}", id, history);
        if (history.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, history.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!historyRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<History> result = historyService.partialUpdate(history);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, history.getId().toString())
        );
    }

    /**
     * {@code GET  /histories} : get all the histories.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of histories in body.
     */
    @GetMapping("/histories")
    public ResponseEntity<List<History>> getAllHistories(HistoryCriteria criteria, Pageable pageable) {
        log.debug("REST request to get Histories by criteria: {}", criteria);
        Page<History> page = historyQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /histories/count} : count all the histories.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/histories/count")
    public ResponseEntity<Long> countHistories(HistoryCriteria criteria) {
        log.debug("REST request to count Histories by criteria: {}", criteria);
        return ResponseEntity.ok().body(historyQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /histories/:id} : get the "id" history.
     *
     * @param id the id of the history to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the history, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/histories/{id}")
    public ResponseEntity<History> getHistory(@PathVariable Long id) {
        log.debug("REST request to get History : {}", id);
        Optional<History> history = historyService.findOne(id);
        return ResponseUtil.wrapOrNotFound(history);
    }

    /**
     * {@code DELETE  /histories/:id} : delete the "id" history.
     *
     * @param id the id of the history to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/histories/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        log.debug("REST request to delete History : {}", id);
        historyService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /histories/search?query=:query} : search for the History corresponding
     * to the query.
     *
     * @param query    the query of the History search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/histories/search")
    public ResponseEntity<List<History>> searchHistories(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Histories for query {}", query);
        // TODO: implement the search
        Page<History> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
