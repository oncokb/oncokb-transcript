package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.FdaSubmissionType;
import org.mskcc.oncokb.curation.repository.FdaSubmissionTypeRepository;
import org.mskcc.oncokb.curation.service.FdaSubmissionTypeService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.FdaSubmissionType}.
 */
@RestController
@RequestMapping("/api")
public class FdaSubmissionTypeResource {

    private final Logger log = LoggerFactory.getLogger(FdaSubmissionTypeResource.class);

    private static final String ENTITY_NAME = "fdaSubmissionType";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FdaSubmissionTypeService fdaSubmissionTypeService;

    private final FdaSubmissionTypeRepository fdaSubmissionTypeRepository;

    public FdaSubmissionTypeResource(
        FdaSubmissionTypeService fdaSubmissionTypeService,
        FdaSubmissionTypeRepository fdaSubmissionTypeRepository
    ) {
        this.fdaSubmissionTypeService = fdaSubmissionTypeService;
        this.fdaSubmissionTypeRepository = fdaSubmissionTypeRepository;
    }

    /**
     * {@code POST  /fda-submission-types} : Create a new fdaSubmissionType.
     *
     * @param fdaSubmissionType the fdaSubmissionType to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new fdaSubmissionType, or with status {@code 400 (Bad Request)} if the fdaSubmissionType has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/fda-submission-types")
    public ResponseEntity<FdaSubmissionType> createFdaSubmissionType(@Valid @RequestBody FdaSubmissionType fdaSubmissionType)
        throws URISyntaxException {
        log.debug("REST request to save FdaSubmissionType : {}", fdaSubmissionType);
        if (fdaSubmissionType.getId() != null) {
            throw new BadRequestAlertException("A new fdaSubmissionType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FdaSubmissionType result = fdaSubmissionTypeService.save(fdaSubmissionType);
        return ResponseEntity
            .created(new URI("/api/fda-submission-types/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /fda-submission-types/:id} : Updates an existing fdaSubmissionType.
     *
     * @param id the id of the fdaSubmissionType to save.
     * @param fdaSubmissionType the fdaSubmissionType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated fdaSubmissionType,
     * or with status {@code 400 (Bad Request)} if the fdaSubmissionType is not valid,
     * or with status {@code 500 (Internal Server Error)} if the fdaSubmissionType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/fda-submission-types/{id}")
    public ResponseEntity<FdaSubmissionType> updateFdaSubmissionType(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FdaSubmissionType fdaSubmissionType
    ) throws URISyntaxException {
        log.debug("REST request to update FdaSubmissionType : {}, {}", id, fdaSubmissionType);
        if (fdaSubmissionType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, fdaSubmissionType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fdaSubmissionTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        FdaSubmissionType result = fdaSubmissionTypeService.save(fdaSubmissionType);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, fdaSubmissionType.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /fda-submission-types/:id} : Partial updates given fields of an existing fdaSubmissionType, field will ignore if it is null
     *
     * @param id the id of the fdaSubmissionType to save.
     * @param fdaSubmissionType the fdaSubmissionType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated fdaSubmissionType,
     * or with status {@code 400 (Bad Request)} if the fdaSubmissionType is not valid,
     * or with status {@code 404 (Not Found)} if the fdaSubmissionType is not found,
     * or with status {@code 500 (Internal Server Error)} if the fdaSubmissionType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/fda-submission-types/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FdaSubmissionType> partialUpdateFdaSubmissionType(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FdaSubmissionType fdaSubmissionType
    ) throws URISyntaxException {
        log.debug("REST request to partial update FdaSubmissionType partially : {}, {}", id, fdaSubmissionType);
        if (fdaSubmissionType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, fdaSubmissionType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fdaSubmissionTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FdaSubmissionType> result = fdaSubmissionTypeService.partialUpdate(fdaSubmissionType);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, fdaSubmissionType.getId().toString())
        );
    }

    /**
     * {@code GET  /fda-submission-types} : get all the fdaSubmissionTypes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of fdaSubmissionTypes in body.
     */
    @GetMapping("/fda-submission-types")
    public List<FdaSubmissionType> getAllFdaSubmissionTypes() {
        log.debug("REST request to get all FdaSubmissionTypes");
        return fdaSubmissionTypeService.findAll();
    }

    /**
     * {@code GET  /fda-submission-types/:id} : get the "id" fdaSubmissionType.
     *
     * @param id the id of the fdaSubmissionType to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the fdaSubmissionType, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/fda-submission-types/{id}")
    public ResponseEntity<FdaSubmissionType> getFdaSubmissionType(@PathVariable Long id) {
        log.debug("REST request to get FdaSubmissionType : {}", id);
        Optional<FdaSubmissionType> fdaSubmissionType = fdaSubmissionTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(fdaSubmissionType);
    }

    /**
     * {@code DELETE  /fda-submission-types/:id} : delete the "id" fdaSubmissionType.
     *
     * @param id the id of the fdaSubmissionType to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/fda-submission-types/{id}")
    public ResponseEntity<Void> deleteFdaSubmissionType(@PathVariable Long id) {
        log.debug("REST request to delete FdaSubmissionType : {}", id);
        fdaSubmissionTypeService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
