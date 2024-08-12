package org.mskcc.oncokb.curation.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.FdaDrug;
import org.mskcc.oncokb.curation.repository.FdaDrugRepository;
import org.mskcc.oncokb.curation.service.FdaDrugQueryService;
import org.mskcc.oncokb.curation.service.FdaDrugService;
import org.mskcc.oncokb.curation.service.criteria.FdaDrugCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.FdaDrug}.
 */
@RestController
@RequestMapping("/api")
public class FdaDrugResource {

    private final Logger log = LoggerFactory.getLogger(FdaDrugResource.class);

    private static final String ENTITY_NAME = "fdaDrug";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FdaDrugService fdaDrugService;

    private final FdaDrugRepository fdaDrugRepository;

    private final FdaDrugQueryService fdaDrugQueryService;

    public FdaDrugResource(FdaDrugService fdaDrugService, FdaDrugRepository fdaDrugRepository, FdaDrugQueryService fdaDrugQueryService) {
        this.fdaDrugService = fdaDrugService;
        this.fdaDrugRepository = fdaDrugRepository;
        this.fdaDrugQueryService = fdaDrugQueryService;
    }

    /**
     * {@code POST  /fda-drugs} : Create a new fdaDrug.
     *
     * @param fdaDrug the fdaDrug to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new fdaDrug, or with status {@code 400 (Bad Request)} if the fdaDrug has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/fda-drugs")
    public ResponseEntity<FdaDrug> createFdaDrug(@Valid @RequestBody FdaDrug fdaDrug) throws URISyntaxException {
        log.debug("REST request to save FdaDrug : {}", fdaDrug);
        if (fdaDrug.getId() != null) {
            throw new BadRequestAlertException("A new fdaDrug cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FdaDrug result = fdaDrugService.save(fdaDrug);
        return ResponseEntity.created(new URI("/api/fda-drugs/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /fda-drugs/:id} : Updates an existing fdaDrug.
     *
     * @param id the id of the fdaDrug to save.
     * @param fdaDrug the fdaDrug to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated fdaDrug,
     * or with status {@code 400 (Bad Request)} if the fdaDrug is not valid,
     * or with status {@code 500 (Internal Server Error)} if the fdaDrug couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/fda-drugs/{id}")
    public ResponseEntity<FdaDrug> updateFdaDrug(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FdaDrug fdaDrug
    ) throws URISyntaxException {
        log.debug("REST request to update FdaDrug : {}, {}", id, fdaDrug);
        if (fdaDrug.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, fdaDrug.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fdaDrugRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        FdaDrug result = fdaDrugService.save(fdaDrug);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, fdaDrug.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /fda-drugs/:id} : Partial updates given fields of an existing fdaDrug, field will ignore if it is null
     *
     * @param id the id of the fdaDrug to save.
     * @param fdaDrug the fdaDrug to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated fdaDrug,
     * or with status {@code 400 (Bad Request)} if the fdaDrug is not valid,
     * or with status {@code 404 (Not Found)} if the fdaDrug is not found,
     * or with status {@code 500 (Internal Server Error)} if the fdaDrug couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/fda-drugs/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FdaDrug> partialUpdateFdaDrug(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FdaDrug fdaDrug
    ) throws URISyntaxException {
        log.debug("REST request to partial update FdaDrug partially : {}, {}", id, fdaDrug);
        if (fdaDrug.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, fdaDrug.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fdaDrugRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FdaDrug> result = fdaDrugService.partialUpdate(fdaDrug);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, fdaDrug.getId().toString())
        );
    }

    /**
     * {@code GET  /fda-drugs} : get all the fdaDrugs.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of fdaDrugs in body.
     */
    @GetMapping("/fda-drugs")
    public ResponseEntity<List<FdaDrug>> getAllFdaDrugs(FdaDrugCriteria criteria, Pageable pageable) {
        log.debug("REST request to get FdaDrugs by criteria: {}", criteria);
        Page<FdaDrug> page = fdaDrugQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /fda-drugs/count} : count all the fdaDrugs.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/fda-drugs/count")
    public ResponseEntity<Long> countFdaDrugs(FdaDrugCriteria criteria) {
        log.debug("REST request to count FdaDrugs by criteria: {}", criteria);
        return ResponseEntity.ok().body(fdaDrugQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /fda-drugs/:id} : get the "id" fdaDrug.
     *
     * @param id the id of the fdaDrug to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the fdaDrug, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/fda-drugs/{id}")
    public ResponseEntity<FdaDrug> getFdaDrug(@PathVariable Long id) {
        log.debug("REST request to get FdaDrug : {}", id);
        Optional<FdaDrug> fdaDrug = fdaDrugService.findOne(id);
        return ResponseUtil.wrapOrNotFound(fdaDrug);
    }

    /**
     * {@code DELETE  /fda-drugs/:id} : delete the "id" fdaDrug.
     *
     * @param id the id of the fdaDrug to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/fda-drugs/{id}")
    public ResponseEntity<Void> deleteFdaDrug(@PathVariable Long id) {
        log.debug("REST request to delete FdaDrug : {}", id);
        fdaDrugService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /fda-drugs/search?query=:query} : search for the FdaDrug corresponding
     * to the query.
     *
     * @param query    the query of the FdaDrug search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/fda-drugs/search")
    public ResponseEntity<List<FdaDrug>> searchFdaDrugs(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of FdaDrugs for query {}", query);
        // TODO: implement the search
        Page<FdaDrug> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
