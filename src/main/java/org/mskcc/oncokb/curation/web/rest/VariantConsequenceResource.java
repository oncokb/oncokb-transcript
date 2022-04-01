package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.VariantConsequence;
import org.mskcc.oncokb.curation.repository.VariantConsequenceRepository;
import org.mskcc.oncokb.curation.service.VariantConsequenceService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.VariantConsequence}.
 */
@RestController
@RequestMapping("/api")
public class VariantConsequenceResource {

    private final Logger log = LoggerFactory.getLogger(VariantConsequenceResource.class);

    private static final String ENTITY_NAME = "variantConsequence";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final VariantConsequenceService variantConsequenceService;

    private final VariantConsequenceRepository variantConsequenceRepository;

    public VariantConsequenceResource(
        VariantConsequenceService variantConsequenceService,
        VariantConsequenceRepository variantConsequenceRepository
    ) {
        this.variantConsequenceService = variantConsequenceService;
        this.variantConsequenceRepository = variantConsequenceRepository;
    }

    /**
     * {@code POST  /variant-consequences} : Create a new variantConsequence.
     *
     * @param variantConsequence the variantConsequence to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new variantConsequence, or with status {@code 400 (Bad Request)} if the variantConsequence has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/variant-consequences")
    public ResponseEntity<VariantConsequence> createVariantConsequence(@Valid @RequestBody VariantConsequence variantConsequence)
        throws URISyntaxException {
        log.debug("REST request to save VariantConsequence : {}", variantConsequence);
        if (variantConsequence.getId() != null) {
            throw new BadRequestAlertException("A new variantConsequence cannot already have an ID", ENTITY_NAME, "idexists");
        }
        VariantConsequence result = variantConsequenceService.save(variantConsequence);
        return ResponseEntity
            .created(new URI("/api/variant-consequences/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /variant-consequences/:id} : Updates an existing variantConsequence.
     *
     * @param id the id of the variantConsequence to save.
     * @param variantConsequence the variantConsequence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated variantConsequence,
     * or with status {@code 400 (Bad Request)} if the variantConsequence is not valid,
     * or with status {@code 500 (Internal Server Error)} if the variantConsequence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/variant-consequences/{id}")
    public ResponseEntity<VariantConsequence> updateVariantConsequence(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody VariantConsequence variantConsequence
    ) throws URISyntaxException {
        log.debug("REST request to update VariantConsequence : {}, {}", id, variantConsequence);
        if (variantConsequence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, variantConsequence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!variantConsequenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        VariantConsequence result = variantConsequenceService.save(variantConsequence);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, variantConsequence.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /variant-consequences/:id} : Partial updates given fields of an existing variantConsequence, field will ignore if it is null
     *
     * @param id the id of the variantConsequence to save.
     * @param variantConsequence the variantConsequence to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated variantConsequence,
     * or with status {@code 400 (Bad Request)} if the variantConsequence is not valid,
     * or with status {@code 404 (Not Found)} if the variantConsequence is not found,
     * or with status {@code 500 (Internal Server Error)} if the variantConsequence couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/variant-consequences/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<VariantConsequence> partialUpdateVariantConsequence(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody VariantConsequence variantConsequence
    ) throws URISyntaxException {
        log.debug("REST request to partial update VariantConsequence partially : {}, {}", id, variantConsequence);
        if (variantConsequence.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, variantConsequence.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!variantConsequenceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<VariantConsequence> result = variantConsequenceService.partialUpdate(variantConsequence);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, variantConsequence.getId().toString())
        );
    }

    /**
     * {@code GET  /variant-consequences} : get all the variantConsequences.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of variantConsequences in body.
     */
    @GetMapping("/variant-consequences")
    public List<VariantConsequence> getAllVariantConsequences() {
        log.debug("REST request to get all VariantConsequences");
        return variantConsequenceService.findAll();
    }

    /**
     * {@code GET  /variant-consequences/:id} : get the "id" variantConsequence.
     *
     * @param id the id of the variantConsequence to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the variantConsequence, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/variant-consequences/{id}")
    public ResponseEntity<VariantConsequence> getVariantConsequence(@PathVariable Long id) {
        log.debug("REST request to get VariantConsequence : {}", id);
        Optional<VariantConsequence> variantConsequence = variantConsequenceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(variantConsequence);
    }

    /**
     * {@code DELETE  /variant-consequences/:id} : delete the "id" variantConsequence.
     *
     * @param id the id of the variantConsequence to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/variant-consequences/{id}")
    public ResponseEntity<Void> deleteVariantConsequence(@PathVariable Long id) {
        log.debug("REST request to delete VariantConsequence : {}", id);
        variantConsequenceService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
