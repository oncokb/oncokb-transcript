package org.mskcc.oncokb.curation.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.FeatureFlag;
import org.mskcc.oncokb.curation.repository.FeatureFlagRepository;
import org.mskcc.oncokb.curation.service.FeatureFlagQueryService;
import org.mskcc.oncokb.curation.service.FeatureFlagService;
import org.mskcc.oncokb.curation.service.criteria.FeatureFlagCriteria;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.FeatureFlag}.
 */
@RestController
@RequestMapping("/api")
public class FeatureFlagResource {

    private final Logger log = LoggerFactory.getLogger(FeatureFlagResource.class);

    private static final String ENTITY_NAME = "featureFlag";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FeatureFlagService featureFlagService;

    private final FeatureFlagRepository featureFlagRepository;

    private final FeatureFlagQueryService featureFlagQueryService;

    public FeatureFlagResource(
        FeatureFlagService featureFlagService,
        FeatureFlagRepository featureFlagRepository,
        FeatureFlagQueryService featureFlagQueryService
    ) {
        this.featureFlagService = featureFlagService;
        this.featureFlagRepository = featureFlagRepository;
        this.featureFlagQueryService = featureFlagQueryService;
    }

    /**
     * {@code POST  /feature-flags} : Create a new featureFlag.
     *
     * @param featureFlag the featureFlag to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new featureFlag, or with status {@code 400 (Bad Request)} if the featureFlag has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/feature-flags")
    public ResponseEntity<FeatureFlag> createFeatureFlag(@Valid @RequestBody FeatureFlag featureFlag) throws URISyntaxException {
        log.debug("REST request to save FeatureFlag : {}", featureFlag);
        if (featureFlag.getId() != null) {
            throw new BadRequestAlertException("A new featureFlag cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FeatureFlag result = featureFlagService.save(featureFlag);
        return ResponseEntity.created(new URI("/api/feature-flags/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /feature-flags/:id} : Updates an existing featureFlag.
     *
     * @param id the id of the featureFlag to save.
     * @param featureFlag the featureFlag to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated featureFlag,
     * or with status {@code 400 (Bad Request)} if the featureFlag is not valid,
     * or with status {@code 500 (Internal Server Error)} if the featureFlag couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/feature-flags/{id}")
    public ResponseEntity<FeatureFlag> updateFeatureFlag(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FeatureFlag featureFlag
    ) throws URISyntaxException {
        log.debug("REST request to update FeatureFlag : {}, {}", id, featureFlag);
        if (featureFlag.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, featureFlag.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!featureFlagRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        FeatureFlag result = featureFlagService.save(featureFlag);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, featureFlag.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /feature-flags/:id} : Partial updates given fields of an existing featureFlag, field will ignore if it is null
     *
     * @param id the id of the featureFlag to save.
     * @param featureFlag the featureFlag to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated featureFlag,
     * or with status {@code 400 (Bad Request)} if the featureFlag is not valid,
     * or with status {@code 404 (Not Found)} if the featureFlag is not found,
     * or with status {@code 500 (Internal Server Error)} if the featureFlag couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/feature-flags/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FeatureFlag> partialUpdateFeatureFlag(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FeatureFlag featureFlag
    ) throws URISyntaxException {
        log.debug("REST request to partial update FeatureFlag partially : {}, {}", id, featureFlag);
        if (featureFlag.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, featureFlag.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!featureFlagRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FeatureFlag> result = featureFlagService.partialUpdate(featureFlag);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, featureFlag.getId().toString())
        );
    }

    /**
     * {@code GET  /feature-flags} : get all the featureFlags.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of featureFlags in body.
     */
    @GetMapping("/feature-flags")
    public ResponseEntity<List<FeatureFlag>> getAllFeatureFlags(FeatureFlagCriteria criteria) {
        log.debug("REST request to get FeatureFlags by criteria: {}", criteria);
        List<FeatureFlag> entityList = featureFlagQueryService.findByCriteria(criteria);
        return ResponseEntity.ok().body(entityList);
    }

    /**
     * {@code GET  /feature-flags/count} : count all the featureFlags.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/feature-flags/count")
    public ResponseEntity<Long> countFeatureFlags(FeatureFlagCriteria criteria) {
        log.debug("REST request to count FeatureFlags by criteria: {}", criteria);
        return ResponseEntity.ok().body(featureFlagQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /feature-flags/:id} : get the "id" featureFlag.
     *
     * @param id the id of the featureFlag to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the featureFlag, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/feature-flags/{id}")
    public ResponseEntity<FeatureFlag> getFeatureFlag(@PathVariable Long id) {
        log.debug("REST request to get FeatureFlag : {}", id);
        Optional<FeatureFlag> featureFlag = featureFlagService.findOne(id);
        return ResponseUtil.wrapOrNotFound(featureFlag);
    }

    /**
     * {@code DELETE  /feature-flags/:id} : delete the "id" featureFlag.
     *
     * @param id the id of the featureFlag to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/feature-flags/{id}")
    public ResponseEntity<Void> deleteFeatureFlag(@PathVariable Long id) {
        log.debug("REST request to delete FeatureFlag : {}", id);
        featureFlagService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
