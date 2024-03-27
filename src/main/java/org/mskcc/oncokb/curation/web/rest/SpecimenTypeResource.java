package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.SpecimenType;
import org.mskcc.oncokb.curation.repository.SpecimenTypeRepository;
import org.mskcc.oncokb.curation.service.SpecimenTypeService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.SpecimenType}.
 */
@RestController
@RequestMapping("/api")
public class SpecimenTypeResource {

    private final Logger log = LoggerFactory.getLogger(SpecimenTypeResource.class);

    private static final String ENTITY_NAME = "specimenType";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SpecimenTypeService specimenTypeService;

    private final SpecimenTypeRepository specimenTypeRepository;

    public SpecimenTypeResource(SpecimenTypeService specimenTypeService, SpecimenTypeRepository specimenTypeRepository) {
        this.specimenTypeService = specimenTypeService;
        this.specimenTypeRepository = specimenTypeRepository;
    }

    /**
     * {@code POST  /specimen-types} : Create a new specimenType.
     *
     * @param specimenType the specimenType to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new specimenType, or with status {@code 400 (Bad Request)} if the specimenType has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/specimen-types")
    public ResponseEntity<SpecimenType> createSpecimenType(@Valid @RequestBody SpecimenType specimenType) throws URISyntaxException {
        log.debug("REST request to save SpecimenType : {}", specimenType);
        if (specimenType.getId() != null) {
            throw new BadRequestAlertException("A new specimenType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        SpecimenType result = specimenTypeService.save(specimenType);
        return ResponseEntity
            .created(new URI("/api/specimen-types/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /specimen-types/:id} : Updates an existing specimenType.
     *
     * @param id the id of the specimenType to save.
     * @param specimenType the specimenType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated specimenType,
     * or with status {@code 400 (Bad Request)} if the specimenType is not valid,
     * or with status {@code 500 (Internal Server Error)} if the specimenType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/specimen-types/{id}")
    public ResponseEntity<SpecimenType> updateSpecimenType(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SpecimenType specimenType
    ) throws URISyntaxException {
        log.debug("REST request to update SpecimenType : {}, {}", id, specimenType);
        if (specimenType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, specimenType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!specimenTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        SpecimenType result = specimenTypeService.save(specimenType);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, specimenType.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /specimen-types/:id} : Partial updates given fields of an existing specimenType, field will ignore if it is null
     *
     * @param id the id of the specimenType to save.
     * @param specimenType the specimenType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated specimenType,
     * or with status {@code 400 (Bad Request)} if the specimenType is not valid,
     * or with status {@code 404 (Not Found)} if the specimenType is not found,
     * or with status {@code 500 (Internal Server Error)} if the specimenType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/specimen-types/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SpecimenType> partialUpdateSpecimenType(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SpecimenType specimenType
    ) throws URISyntaxException {
        log.debug("REST request to partial update SpecimenType partially : {}, {}", id, specimenType);
        if (specimenType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, specimenType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!specimenTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SpecimenType> result = specimenTypeService.partialUpdate(specimenType);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, specimenType.getId().toString())
        );
    }

    /**
     * {@code GET  /specimen-types} : get all the specimenTypes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of specimenTypes in body.
     */
    @GetMapping("/specimen-types")
    public List<SpecimenType> getAllSpecimenTypes() {
        log.debug("REST request to get all SpecimenTypes");
        return specimenTypeService.findAll();
    }

    /**
     * {@code GET  /specimen-types/:id} : get the "id" specimenType.
     *
     * @param id the id of the specimenType to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the specimenType, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/specimen-types/{id}")
    public ResponseEntity<SpecimenType> getSpecimenType(@PathVariable Long id) {
        log.debug("REST request to get SpecimenType : {}", id);
        Optional<SpecimenType> specimenType = specimenTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(specimenType);
    }

    /**
     * {@code DELETE  /specimen-types/:id} : delete the "id" specimenType.
     *
     * @param id the id of the specimenType to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/specimen-types/{id}")
    public ResponseEntity<Void> deleteSpecimenType(@PathVariable Long id) {
        log.debug("REST request to delete SpecimenType : {}", id);
        specimenTypeService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
