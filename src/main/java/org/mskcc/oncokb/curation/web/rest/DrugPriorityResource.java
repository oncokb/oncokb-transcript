package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.DrugPriority;
import org.mskcc.oncokb.curation.repository.DrugPriorityRepository;
import org.mskcc.oncokb.curation.service.DrugPriorityService;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.DrugPriority}.
 */
@RestController
@RequestMapping("/api")
public class DrugPriorityResource {

    private final Logger log = LoggerFactory.getLogger(DrugPriorityResource.class);

    private static final String ENTITY_NAME = "drugPriority";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DrugPriorityService drugPriorityService;

    private final DrugPriorityRepository drugPriorityRepository;

    public DrugPriorityResource(DrugPriorityService drugPriorityService, DrugPriorityRepository drugPriorityRepository) {
        this.drugPriorityService = drugPriorityService;
        this.drugPriorityRepository = drugPriorityRepository;
    }

    /**
     * {@code POST  /drug-priorities} : Create a new drugPriority.
     *
     * @param drugPriority the drugPriority to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new drugPriority, or with status {@code 400 (Bad Request)} if the drugPriority has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/drug-priorities")
    public ResponseEntity<DrugPriority> createDrugPriority(@Valid @RequestBody DrugPriority drugPriority) throws URISyntaxException {
        log.debug("REST request to save DrugPriority : {}", drugPriority);
        if (drugPriority.getId() != null) {
            throw new BadRequestAlertException("A new drugPriority cannot already have an ID", ENTITY_NAME, "idexists");
        }
        DrugPriority result = drugPriorityService.save(drugPriority);
        return ResponseEntity
            .created(new URI("/api/drug-priorities/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /drug-priorities/:id} : Updates an existing drugPriority.
     *
     * @param id the id of the drugPriority to save.
     * @param drugPriority the drugPriority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated drugPriority,
     * or with status {@code 400 (Bad Request)} if the drugPriority is not valid,
     * or with status {@code 500 (Internal Server Error)} if the drugPriority couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/drug-priorities/{id}")
    public ResponseEntity<DrugPriority> updateDrugPriority(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DrugPriority drugPriority
    ) throws URISyntaxException {
        log.debug("REST request to update DrugPriority : {}, {}", id, drugPriority);
        if (drugPriority.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, drugPriority.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!drugPriorityRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        DrugPriority result = drugPriorityService.save(drugPriority);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, drugPriority.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /drug-priorities/:id} : Partial updates given fields of an existing drugPriority, field will ignore if it is null
     *
     * @param id the id of the drugPriority to save.
     * @param drugPriority the drugPriority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated drugPriority,
     * or with status {@code 400 (Bad Request)} if the drugPriority is not valid,
     * or with status {@code 404 (Not Found)} if the drugPriority is not found,
     * or with status {@code 500 (Internal Server Error)} if the drugPriority couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/drug-priorities/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DrugPriority> partialUpdateDrugPriority(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DrugPriority drugPriority
    ) throws URISyntaxException {
        log.debug("REST request to partial update DrugPriority partially : {}, {}", id, drugPriority);
        if (drugPriority.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, drugPriority.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!drugPriorityRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DrugPriority> result = drugPriorityService.partialUpdate(drugPriority);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, drugPriority.getId().toString())
        );
    }

    /**
     * {@code GET  /drug-priorities} : get all the drugPriorities.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of drugPriorities in body.
     */
    @GetMapping("/drug-priorities")
    public List<DrugPriority> getAllDrugPriorities() {
        log.debug("REST request to get all DrugPriorities");
        return drugPriorityService.findAll();
    }

    /**
     * {@code GET  /drug-priorities/:id} : get the "id" drugPriority.
     *
     * @param id the id of the drugPriority to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the drugPriority, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/drug-priorities/{id}")
    public ResponseEntity<DrugPriority> getDrugPriority(@PathVariable Long id) {
        log.debug("REST request to get DrugPriority : {}", id);
        Optional<DrugPriority> drugPriority = drugPriorityService.findOne(id);
        return ResponseUtil.wrapOrNotFound(drugPriority);
    }

    /**
     * {@code DELETE  /drug-priorities/:id} : delete the "id" drugPriority.
     *
     * @param id the id of the drugPriority to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/drug-priorities/{id}")
    public ResponseEntity<Void> deleteDrugPriority(@PathVariable Long id) {
        log.debug("REST request to delete DrugPriority : {}", id);
        drugPriorityService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /drug-priorities/search?query=:query} : search for the DrugPriority corresponding
     * to the query.
     *
     * @param query    the query of the DrugPriority search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/drug-priorities/search")
    public ResponseEntity<List<DrugPriority>> searchDrugPriorities(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of DrugPriorities for query {}", query);
        // TODO: implement the search
        Page<DrugPriority> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
