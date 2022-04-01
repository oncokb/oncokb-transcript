package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.mskcc.oncokb.curation.service.CancerTypeService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.CancerType}.
 */
@RestController
@RequestMapping("/api")
public class CancerTypeResource {

    private final Logger log = LoggerFactory.getLogger(CancerTypeResource.class);

    private static final String ENTITY_NAME = "cancerType";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CancerTypeService cancerTypeService;

    private final CancerTypeRepository cancerTypeRepository;

    public CancerTypeResource(CancerTypeService cancerTypeService, CancerTypeRepository cancerTypeRepository) {
        this.cancerTypeService = cancerTypeService;
        this.cancerTypeRepository = cancerTypeRepository;
    }

    /**
     * {@code POST  /cancer-types} : Create a new cancerType.
     *
     * @param cancerType the cancerType to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new cancerType, or with status {@code 400 (Bad Request)} if the cancerType has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/cancer-types")
    public ResponseEntity<CancerType> createCancerType(@Valid @RequestBody CancerType cancerType) throws URISyntaxException {
        log.debug("REST request to save CancerType : {}", cancerType);
        if (cancerType.getId() != null) {
            throw new BadRequestAlertException("A new cancerType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        CancerType result = cancerTypeService.save(cancerType);
        return ResponseEntity
            .created(new URI("/api/cancer-types/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /cancer-types/:id} : Updates an existing cancerType.
     *
     * @param id the id of the cancerType to save.
     * @param cancerType the cancerType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cancerType,
     * or with status {@code 400 (Bad Request)} if the cancerType is not valid,
     * or with status {@code 500 (Internal Server Error)} if the cancerType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/cancer-types/{id}")
    public ResponseEntity<CancerType> updateCancerType(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CancerType cancerType
    ) throws URISyntaxException {
        log.debug("REST request to update CancerType : {}, {}", id, cancerType);
        if (cancerType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cancerType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cancerTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        CancerType result = cancerTypeService.save(cancerType);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cancerType.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /cancer-types/:id} : Partial updates given fields of an existing cancerType, field will ignore if it is null
     *
     * @param id the id of the cancerType to save.
     * @param cancerType the cancerType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cancerType,
     * or with status {@code 400 (Bad Request)} if the cancerType is not valid,
     * or with status {@code 404 (Not Found)} if the cancerType is not found,
     * or with status {@code 500 (Internal Server Error)} if the cancerType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/cancer-types/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CancerType> partialUpdateCancerType(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CancerType cancerType
    ) throws URISyntaxException {
        log.debug("REST request to partial update CancerType partially : {}, {}", id, cancerType);
        if (cancerType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cancerType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cancerTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CancerType> result = cancerTypeService.partialUpdate(cancerType);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cancerType.getId().toString())
        );
    }

    /**
     * {@code GET  /cancer-types} : get all the cancerTypes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of cancerTypes in body.
     */
    @GetMapping("/cancer-types")
    public List<CancerType> getAllCancerTypes() {
        log.debug("REST request to get all CancerTypes");
        return cancerTypeService.findAll();
    }

    /**
     * {@code GET  /cancer-types/:id} : get the "id" cancerType.
     *
     * @param id the id of the cancerType to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the cancerType, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/cancer-types/{id}")
    public ResponseEntity<CancerType> getCancerType(@PathVariable Long id) {
        log.debug("REST request to get CancerType : {}", id);
        Optional<CancerType> cancerType = cancerTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(cancerType);
    }

    /**
     * {@code DELETE  /cancer-types/:id} : delete the "id" cancerType.
     *
     * @param id the id of the cancerType to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/cancer-types/{id}")
    public ResponseEntity<Void> deleteCancerType(@PathVariable Long id) {
        log.debug("REST request to delete CancerType : {}", id);
        cancerTypeService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
