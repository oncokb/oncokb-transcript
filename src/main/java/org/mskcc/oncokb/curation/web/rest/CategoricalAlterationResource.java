package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.CategoricalAlteration;
import org.mskcc.oncokb.curation.repository.CategoricalAlterationRepository;
import org.mskcc.oncokb.curation.service.CategoricalAlterationService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.CategoricalAlteration}.
 */
@RestController
@RequestMapping("/api")
public class CategoricalAlterationResource {

    private final Logger log = LoggerFactory.getLogger(CategoricalAlterationResource.class);

    private static final String ENTITY_NAME = "categoricalAlteration";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CategoricalAlterationService categoricalAlterationService;

    private final CategoricalAlterationRepository categoricalAlterationRepository;

    public CategoricalAlterationResource(
        CategoricalAlterationService categoricalAlterationService,
        CategoricalAlterationRepository categoricalAlterationRepository
    ) {
        this.categoricalAlterationService = categoricalAlterationService;
        this.categoricalAlterationRepository = categoricalAlterationRepository;
    }

    /**
     * {@code POST  /categorical-alterations} : Create a new categoricalAlteration.
     *
     * @param categoricalAlteration the categoricalAlteration to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new categoricalAlteration, or with status {@code 400 (Bad Request)} if the categoricalAlteration has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/categorical-alterations")
    public ResponseEntity<CategoricalAlteration> createCategoricalAlteration(
        @Valid @RequestBody CategoricalAlteration categoricalAlteration
    ) throws URISyntaxException {
        log.debug("REST request to save CategoricalAlteration : {}", categoricalAlteration);
        if (categoricalAlteration.getId() != null) {
            throw new BadRequestAlertException("A new categoricalAlteration cannot already have an ID", ENTITY_NAME, "idexists");
        }
        CategoricalAlteration result = categoricalAlterationService.save(categoricalAlteration);
        return ResponseEntity
            .created(new URI("/api/categorical-alterations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /categorical-alterations/:id} : Updates an existing categoricalAlteration.
     *
     * @param id the id of the categoricalAlteration to save.
     * @param categoricalAlteration the categoricalAlteration to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated categoricalAlteration,
     * or with status {@code 400 (Bad Request)} if the categoricalAlteration is not valid,
     * or with status {@code 500 (Internal Server Error)} if the categoricalAlteration couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/categorical-alterations/{id}")
    public ResponseEntity<CategoricalAlteration> updateCategoricalAlteration(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CategoricalAlteration categoricalAlteration
    ) throws URISyntaxException {
        log.debug("REST request to update CategoricalAlteration : {}, {}", id, categoricalAlteration);
        if (categoricalAlteration.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, categoricalAlteration.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!categoricalAlterationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        CategoricalAlteration result = categoricalAlterationService.save(categoricalAlteration);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, categoricalAlteration.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /categorical-alterations/:id} : Partial updates given fields of an existing categoricalAlteration, field will ignore if it is null
     *
     * @param id the id of the categoricalAlteration to save.
     * @param categoricalAlteration the categoricalAlteration to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated categoricalAlteration,
     * or with status {@code 400 (Bad Request)} if the categoricalAlteration is not valid,
     * or with status {@code 404 (Not Found)} if the categoricalAlteration is not found,
     * or with status {@code 500 (Internal Server Error)} if the categoricalAlteration couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/categorical-alterations/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CategoricalAlteration> partialUpdateCategoricalAlteration(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CategoricalAlteration categoricalAlteration
    ) throws URISyntaxException {
        log.debug("REST request to partial update CategoricalAlteration partially : {}, {}", id, categoricalAlteration);
        if (categoricalAlteration.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, categoricalAlteration.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!categoricalAlterationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CategoricalAlteration> result = categoricalAlterationService.partialUpdate(categoricalAlteration);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, categoricalAlteration.getId().toString())
        );
    }

    /**
     * {@code GET  /categorical-alterations} : get all the categoricalAlterations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of categoricalAlterations in body.
     */
    @GetMapping("/categorical-alterations")
    public List<CategoricalAlteration> getAllCategoricalAlterations() {
        log.debug("REST request to get all CategoricalAlterations");
        return categoricalAlterationService.findAll();
    }

    /**
     * {@code GET  /categorical-alterations/:id} : get the "id" categoricalAlteration.
     *
     * @param id the id of the categoricalAlteration to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the categoricalAlteration, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/categorical-alterations/{id}")
    public ResponseEntity<CategoricalAlteration> getCategoricalAlteration(@PathVariable Long id) {
        log.debug("REST request to get CategoricalAlteration : {}", id);
        Optional<CategoricalAlteration> categoricalAlteration = categoricalAlterationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(categoricalAlteration);
    }

    /**
     * {@code DELETE  /categorical-alterations/:id} : delete the "id" categoricalAlteration.
     *
     * @param id the id of the categoricalAlteration to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/categorical-alterations/{id}")
    public ResponseEntity<Void> deleteCategoricalAlteration(@PathVariable Long id) {
        log.debug("REST request to delete CategoricalAlteration : {}", id);
        categoricalAlterationService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
