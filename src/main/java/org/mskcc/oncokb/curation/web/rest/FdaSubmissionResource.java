package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.FdaSubmissionRepository;
import org.mskcc.oncokb.curation.service.FdaSubmissionQueryService;
import org.mskcc.oncokb.curation.service.FdaSubmissionService;
import org.mskcc.oncokb.curation.service.criteria.FdaSubmissionCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.FdaSubmission}.
 */
@RestController
@RequestMapping("/api")
public class FdaSubmissionResource {

    private final Logger log = LoggerFactory.getLogger(FdaSubmissionResource.class);

    private static final String ENTITY_NAME = "fdaSubmission";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FdaSubmissionService fdaSubmissionService;

    private final FdaSubmissionRepository fdaSubmissionRepository;

    private final FdaSubmissionQueryService fdaSubmissionQueryService;

    public FdaSubmissionResource(
        FdaSubmissionService fdaSubmissionService,
        FdaSubmissionRepository fdaSubmissionRepository,
        FdaSubmissionQueryService fdaSubmissionQueryService
    ) {
        this.fdaSubmissionService = fdaSubmissionService;
        this.fdaSubmissionRepository = fdaSubmissionRepository;
        this.fdaSubmissionQueryService = fdaSubmissionQueryService;
    }

    /**
     * {@code POST  /fda-submissions} : Create a new fdaSubmission.
     *
     * @param fdaSubmission the fdaSubmission to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new fdaSubmission, or with status {@code 400 (Bad Request)} if the fdaSubmission has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/fda-submissions")
    public ResponseEntity<FdaSubmission> createFdaSubmission(@Valid @RequestBody FdaSubmission fdaSubmission) throws URISyntaxException {
        log.debug("REST request to save FdaSubmission : {}", fdaSubmission);
        if (fdaSubmission.getId() != null) {
            throw new BadRequestAlertException("A new fdaSubmission cannot already have an ID", ENTITY_NAME, "idexists");
        } else if (!fdaSubmissionService.isUnique(fdaSubmission)) {
            throw new BadRequestAlertException("Duplicate fdaSubmission", ENTITY_NAME, "duplicate");
        }

        FdaSubmission result = fdaSubmissionService.save(fdaSubmission);
        return ResponseEntity
            .created(new URI("/api/fda-submissions/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /fda-submissions/:id} : Updates an existing fdaSubmission.
     *
     * @param id the id of the fdaSubmission to save.
     * @param fdaSubmission the fdaSubmission to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated fdaSubmission,
     * or with status {@code 400 (Bad Request)} if the fdaSubmission is not valid,
     * or with status {@code 500 (Internal Server Error)} if the fdaSubmission couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/fda-submissions/{id}")
    public ResponseEntity<FdaSubmission> updateFdaSubmission(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FdaSubmission fdaSubmission
    ) throws URISyntaxException {
        log.debug("REST request to update FdaSubmission : {}, {}", id, fdaSubmission);
        if (fdaSubmission.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, fdaSubmission.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fdaSubmissionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        FdaSubmission result = fdaSubmissionService.save(fdaSubmission);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, fdaSubmission.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /fda-submissions/:id} : Partial updates given fields of an existing fdaSubmission, field will ignore if it is null
     *
     * @param id the id of the fdaSubmission to save.
     * @param fdaSubmission the fdaSubmission to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated fdaSubmission,
     * or with status {@code 400 (Bad Request)} if the fdaSubmission is not valid,
     * or with status {@code 404 (Not Found)} if the fdaSubmission is not found,
     * or with status {@code 500 (Internal Server Error)} if the fdaSubmission couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/fda-submissions/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FdaSubmission> partialUpdateFdaSubmission(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FdaSubmission fdaSubmission
    ) throws URISyntaxException {
        log.debug("REST request to partial update FdaSubmission partially : {}, {}", id, fdaSubmission);
        if (fdaSubmission.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, fdaSubmission.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fdaSubmissionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FdaSubmission> result = fdaSubmissionService.partialUpdate(fdaSubmission);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, fdaSubmission.getId().toString())
        );
    }

    /**
     * {@code GET  /fda-submissions} : get all the fdaSubmissions.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of fdaSubmissions in body.
     */
    @GetMapping("/fda-submissions")
    public ResponseEntity<List<FdaSubmission>> getAllFdaSubmissions(FdaSubmissionCriteria criteria, Pageable pageable) {
        log.debug("REST request to get FdaSubmissions by criteria: {}", criteria);
        Page<FdaSubmission> page = fdaSubmissionQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /fda-submissions/count} : count all the fdaSubmissions.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/fda-submissions/count")
    public ResponseEntity<Long> countFdaSubmissions(FdaSubmissionCriteria criteria) {
        log.debug("REST request to count FdaSubmissions by criteria: {}", criteria);
        return ResponseEntity.ok().body(fdaSubmissionQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /fda-submissions/:id} : get the "id" fdaSubmission.
     *
     * @param id the id of the fdaSubmission to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the fdaSubmission, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/fda-submissions/{id}")
    public ResponseEntity<FdaSubmission> getFdaSubmission(@PathVariable Long id) {
        log.debug("REST request to get FdaSubmission : {}", id);
        Optional<FdaSubmission> fdaSubmission = fdaSubmissionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(fdaSubmission);
    }

    @GetMapping("/fda-submissions/lookup")
    public ResponseEntity<FdaSubmission> getFdaSubmissionByNumber(
        @RequestParam(value = "number", required = true) String number,
        @RequestParam(value = "supplementNumber", required = false) String supplementNumber
    ) {
        return ResponseUtil.wrapOrNotFound(fdaSubmissionService.findOrFetchFdaSubmissionByNumber(number, supplementNumber, false));
    }

    @GetMapping("/fda-submissions/companion-diagnostic-device/{id}")
    public ResponseEntity<List<FdaSubmission>> findFdaSubmissionsByCompanionDiagnosticDevice(@PathVariable Long id) {
        List<FdaSubmission> fdaSubmissions = fdaSubmissionService.findByCompanionDiagnosticDevice(id);
        return ResponseEntity.ok().body(fdaSubmissions);
    }

    /**
     * {@code DELETE  /fda-submissions/:id} : delete the "id" fdaSubmission.
     *
     * @param id the id of the fdaSubmission to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/fda-submissions/{id}")
    public ResponseEntity<Void> deleteFdaSubmission(@PathVariable Long id) {
        log.debug("REST request to delete FdaSubmission : {}", id);
        fdaSubmissionService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /_search/fda-submissions?query=:query} : search for the fdaSubmission corresponding
     * to the query.
     *
     * @param query the query of the fdaSubmission search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/_search/fda-submissions")
    public ResponseEntity<List<FdaSubmission>> searchFdaSubmissions(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of FdaSubmissions for query {}", query);
        Page<FdaSubmission> page = fdaSubmissionQueryService.findBySearchQuery(query, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
