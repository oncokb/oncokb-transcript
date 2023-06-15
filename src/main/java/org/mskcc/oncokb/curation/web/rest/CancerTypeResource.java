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
import org.mskcc.oncokb.curation.service.CancerTypeQueryService;
import org.mskcc.oncokb.curation.service.CancerTypeService;
import org.mskcc.oncokb.curation.service.criteria.CancerTypeCriteria;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
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

    private final CancerTypeQueryService cancerTypeQueryService;

    public CancerTypeResource(
        CancerTypeService cancerTypeService,
        CancerTypeRepository cancerTypeRepository,
        CancerTypeQueryService cancerTypeQueryService
    ) {
        this.cancerTypeService = cancerTypeService;
        this.cancerTypeRepository = cancerTypeRepository;
        this.cancerTypeQueryService = cancerTypeQueryService;
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
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of cancerTypes in body.
     */
    @GetMapping("/cancer-types")
    public ResponseEntity<List<CancerType>> getAllCancerTypes(CancerTypeCriteria criteria, Pageable pageable) {
        log.debug("REST request to get CancerTypes by criteria: {}", criteria);
        Page<CancerType> page = cancerTypeQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /cancer-types/count} : count all the cancerTypes.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/cancer-types/count")
    public ResponseEntity<Long> countCancerTypes(CancerTypeCriteria criteria) {
        log.debug("REST request to count CancerTypes by criteria: {}", criteria);
        return ResponseEntity.ok().body(cancerTypeQueryService.countByCriteria(criteria));
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

    /**
     * {@code SEARCH  /_search/cancer-types?query=:query} : search for the cancerType corresponding
     * to the query.
     *
     * @param query the query of the cancerType search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/_search/cancer-types")
    public ResponseEntity<List<CancerType>> searchCancerTypes(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of CancerTypes for query {}", query);
        Page<CancerType> page = cancerTypeQueryService.findBySearchQuery(query, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
