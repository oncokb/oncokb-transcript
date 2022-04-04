package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.DrugSynonym;
import org.mskcc.oncokb.curation.repository.DrugSynonymRepository;
import org.mskcc.oncokb.curation.service.DrugSynonymService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.DrugSynonym}.
 */
@RestController
@RequestMapping("/api")
public class DrugSynonymResource {

    private final Logger log = LoggerFactory.getLogger(DrugSynonymResource.class);

    private static final String ENTITY_NAME = "drugSynonym";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DrugSynonymService drugSynonymService;

    private final DrugSynonymRepository drugSynonymRepository;

    public DrugSynonymResource(DrugSynonymService drugSynonymService, DrugSynonymRepository drugSynonymRepository) {
        this.drugSynonymService = drugSynonymService;
        this.drugSynonymRepository = drugSynonymRepository;
    }

    /**
     * {@code POST  /drug-synonyms} : Create a new drugSynonym.
     *
     * @param drugSynonym the drugSynonym to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new drugSynonym, or with status {@code 400 (Bad Request)} if the drugSynonym has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/drug-synonyms")
    public ResponseEntity<DrugSynonym> createDrugSynonym(@RequestBody DrugSynonym drugSynonym) throws URISyntaxException {
        log.debug("REST request to save DrugSynonym : {}", drugSynonym);
        if (drugSynonym.getId() != null) {
            throw new BadRequestAlertException("A new drugSynonym cannot already have an ID", ENTITY_NAME, "idexists");
        }
        DrugSynonym result = drugSynonymService.save(drugSynonym);
        return ResponseEntity
            .created(new URI("/api/drug-synonyms/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /drug-synonyms/:id} : Updates an existing drugSynonym.
     *
     * @param id the id of the drugSynonym to save.
     * @param drugSynonym the drugSynonym to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated drugSynonym,
     * or with status {@code 400 (Bad Request)} if the drugSynonym is not valid,
     * or with status {@code 500 (Internal Server Error)} if the drugSynonym couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/drug-synonyms/{id}")
    public ResponseEntity<DrugSynonym> updateDrugSynonym(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DrugSynonym drugSynonym
    ) throws URISyntaxException {
        log.debug("REST request to update DrugSynonym : {}, {}", id, drugSynonym);
        if (drugSynonym.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, drugSynonym.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!drugSynonymRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        DrugSynonym result = drugSynonymService.save(drugSynonym);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, drugSynonym.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /drug-synonyms/:id} : Partial updates given fields of an existing drugSynonym, field will ignore if it is null
     *
     * @param id the id of the drugSynonym to save.
     * @param drugSynonym the drugSynonym to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated drugSynonym,
     * or with status {@code 400 (Bad Request)} if the drugSynonym is not valid,
     * or with status {@code 404 (Not Found)} if the drugSynonym is not found,
     * or with status {@code 500 (Internal Server Error)} if the drugSynonym couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/drug-synonyms/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DrugSynonym> partialUpdateDrugSynonym(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DrugSynonym drugSynonym
    ) throws URISyntaxException {
        log.debug("REST request to partial update DrugSynonym partially : {}, {}", id, drugSynonym);
        if (drugSynonym.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, drugSynonym.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!drugSynonymRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DrugSynonym> result = drugSynonymService.partialUpdate(drugSynonym);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, drugSynonym.getId().toString())
        );
    }

    /**
     * {@code GET  /drug-synonyms} : get all the drugSynonyms.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of drugSynonyms in body.
     */
    @GetMapping("/drug-synonyms")
    public List<DrugSynonym> getAllDrugSynonyms() {
        log.debug("REST request to get all DrugSynonyms");
        return drugSynonymService.findAll();
    }

    /**
     * {@code GET  /drug-synonyms/:id} : get the "id" drugSynonym.
     *
     * @param id the id of the drugSynonym to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the drugSynonym, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/drug-synonyms/{id}")
    public ResponseEntity<DrugSynonym> getDrugSynonym(@PathVariable Long id) {
        log.debug("REST request to get DrugSynonym : {}", id);
        Optional<DrugSynonym> drugSynonym = drugSynonymService.findOne(id);
        return ResponseUtil.wrapOrNotFound(drugSynonym);
    }

    /**
     * {@code DELETE  /drug-synonyms/:id} : delete the "id" drugSynonym.
     *
     * @param id the id of the drugSynonym to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/drug-synonyms/{id}")
    public ResponseEntity<Void> deleteDrugSynonym(@PathVariable Long id) {
        log.debug("REST request to delete DrugSynonym : {}", id);
        drugSynonymService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
