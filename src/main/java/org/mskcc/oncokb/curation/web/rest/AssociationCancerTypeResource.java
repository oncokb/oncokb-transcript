package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.AssociationCancerType;
import org.mskcc.oncokb.curation.repository.AssociationCancerTypeRepository;
import org.mskcc.oncokb.curation.service.AssociationCancerTypeService;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.AssociationCancerType}.
 */
@RestController
@RequestMapping("/api")
public class AssociationCancerTypeResource {

    private final Logger log = LoggerFactory.getLogger(AssociationCancerTypeResource.class);

    private static final String ENTITY_NAME = "associationCancerType";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AssociationCancerTypeService associationCancerTypeService;

    private final AssociationCancerTypeRepository associationCancerTypeRepository;

    public AssociationCancerTypeResource(
        AssociationCancerTypeService associationCancerTypeService,
        AssociationCancerTypeRepository associationCancerTypeRepository
    ) {
        this.associationCancerTypeService = associationCancerTypeService;
        this.associationCancerTypeRepository = associationCancerTypeRepository;
    }

    /**
     * {@code POST  /association-cancer-types} : Create a new associationCancerType.
     *
     * @param associationCancerType the associationCancerType to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new associationCancerType, or with status {@code 400 (Bad Request)} if the associationCancerType has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/association-cancer-types")
    public ResponseEntity<AssociationCancerType> createAssociationCancerType(
        @Valid @RequestBody AssociationCancerType associationCancerType
    ) throws URISyntaxException {
        log.debug("REST request to save AssociationCancerType : {}", associationCancerType);
        if (associationCancerType.getId() != null) {
            throw new BadRequestAlertException("A new associationCancerType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AssociationCancerType result = associationCancerTypeService.save(associationCancerType);
        return ResponseEntity
            .created(new URI("/api/association-cancer-types/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /association-cancer-types/:id} : Updates an existing associationCancerType.
     *
     * @param id the id of the associationCancerType to save.
     * @param associationCancerType the associationCancerType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated associationCancerType,
     * or with status {@code 400 (Bad Request)} if the associationCancerType is not valid,
     * or with status {@code 500 (Internal Server Error)} if the associationCancerType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/association-cancer-types/{id}")
    public ResponseEntity<AssociationCancerType> updateAssociationCancerType(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AssociationCancerType associationCancerType
    ) throws URISyntaxException {
        log.debug("REST request to update AssociationCancerType : {}, {}", id, associationCancerType);
        if (associationCancerType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, associationCancerType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!associationCancerTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        AssociationCancerType result = associationCancerTypeService.save(associationCancerType);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, associationCancerType.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /association-cancer-types/:id} : Partial updates given fields of an existing associationCancerType, field will ignore if it is null
     *
     * @param id the id of the associationCancerType to save.
     * @param associationCancerType the associationCancerType to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated associationCancerType,
     * or with status {@code 400 (Bad Request)} if the associationCancerType is not valid,
     * or with status {@code 404 (Not Found)} if the associationCancerType is not found,
     * or with status {@code 500 (Internal Server Error)} if the associationCancerType couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/association-cancer-types/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AssociationCancerType> partialUpdateAssociationCancerType(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AssociationCancerType associationCancerType
    ) throws URISyntaxException {
        log.debug("REST request to partial update AssociationCancerType partially : {}, {}", id, associationCancerType);
        if (associationCancerType.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, associationCancerType.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!associationCancerTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AssociationCancerType> result = associationCancerTypeService.partialUpdate(associationCancerType);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, associationCancerType.getId().toString())
        );
    }

    /**
     * {@code GET  /association-cancer-types} : get all the associationCancerTypes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of associationCancerTypes in body.
     */
    @GetMapping("/association-cancer-types")
    public List<AssociationCancerType> getAllAssociationCancerTypes() {
        log.debug("REST request to get all AssociationCancerTypes");
        return associationCancerTypeService.findAll();
    }

    /**
     * {@code GET  /association-cancer-types/:id} : get the "id" associationCancerType.
     *
     * @param id the id of the associationCancerType to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the associationCancerType, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/association-cancer-types/{id}")
    public ResponseEntity<AssociationCancerType> getAssociationCancerType(@PathVariable Long id) {
        log.debug("REST request to get AssociationCancerType : {}", id);
        Optional<AssociationCancerType> associationCancerType = associationCancerTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(associationCancerType);
    }

    /**
     * {@code DELETE  /association-cancer-types/:id} : delete the "id" associationCancerType.
     *
     * @param id the id of the associationCancerType to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/association-cancer-types/{id}")
    public ResponseEntity<Void> deleteAssociationCancerType(@PathVariable Long id) {
        log.debug("REST request to delete AssociationCancerType : {}", id);
        associationCancerTypeService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /association-cancer-types/search?query=:query} : search for the AssociationCancerType corresponding
     * to the query.
     *
     * @param query    the query of the AssociationCancerType search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/association-cancer-types/search")
    public ResponseEntity<List<AssociationCancerType>> searchAssociationCancerTypes(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Association Cancer Types for query {}", query);
        // TODO: implement the search
        Page<AssociationCancerType> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
