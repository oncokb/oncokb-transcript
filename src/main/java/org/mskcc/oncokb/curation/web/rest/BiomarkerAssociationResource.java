package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.mskcc.oncokb.curation.repository.BiomarkerAssociationRepository;
import org.mskcc.oncokb.curation.service.BiomarkerAssociationService;
import org.mskcc.oncokb.curation.service.dto.BiomarkerAssociationDTO;
import org.mskcc.oncokb.curation.service.mapper.BiomarkerAssociationMapper;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.BiomarkerAssociation}.
 */
@RestController
@RequestMapping("/api")
public class BiomarkerAssociationResource {

    private final Logger log = LoggerFactory.getLogger(BiomarkerAssociationResource.class);

    private static final String ENTITY_NAME = "biomarkerAssociation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final BiomarkerAssociationService biomarkerAssociationService;

    private final BiomarkerAssociationRepository biomarkerAssociationRepository;

    private final BiomarkerAssociationMapper biomarkerAssociationMapper;

    public BiomarkerAssociationResource(
        BiomarkerAssociationService biomarkerAssociationService,
        BiomarkerAssociationRepository biomarkerAssociationRepository,
        BiomarkerAssociationMapper biomarkerAssociationMapper
    ) {
        this.biomarkerAssociationService = biomarkerAssociationService;
        this.biomarkerAssociationRepository = biomarkerAssociationRepository;
        this.biomarkerAssociationMapper = biomarkerAssociationMapper;
    }

    /**
     * {@code POST  /biomarker-associations} : Create a new biomarkerAssociation.
     *
     * @param biomarkerAssociation the biomarkerAssociation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new biomarkerAssociation, or with status {@code 400 (Bad Request)} if the biomarkerAssociation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/biomarker-associations")
    public ResponseEntity<BiomarkerAssociation> createBiomarkerAssociation(@RequestBody BiomarkerAssociationDTO biomarkerAssociationDTO)
        throws URISyntaxException {
        log.debug("REST request to save BiomarkerAssociation : {}", biomarkerAssociationDTO);
        BiomarkerAssociation result = biomarkerAssociationService.save(biomarkerAssociationMapper.toEntity(biomarkerAssociationDTO));
        return ResponseEntity.created(new URI("/api/biomarker-associations/" + result.getId())).body(result);
    }

    /**
     * {@code PUT  /biomarker-associations/:id} : Updates an existing biomarkerAssociation.
     *
     * @param id the id of the biomarkerAssociation to save.
     * @param biomarkerAssociation the biomarkerAssociation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated biomarkerAssociation,
     * or with status {@code 400 (Bad Request)} if the biomarkerAssociation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the biomarkerAssociation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/biomarker-associations/{id}")
    public ResponseEntity<BiomarkerAssociation> updateBiomarkerAssociation(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody BiomarkerAssociation biomarkerAssociation
    ) throws URISyntaxException {
        log.debug("REST request to update BiomarkerAssociation : {}, {}", id, biomarkerAssociation);
        if (biomarkerAssociation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, biomarkerAssociation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!biomarkerAssociationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        BiomarkerAssociation result = biomarkerAssociationService.save(biomarkerAssociation);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, biomarkerAssociation.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /biomarker-associations/:id} : Partial updates given fields of an existing biomarkerAssociation, field will ignore if it is null
     *
     * @param id the id of the biomarkerAssociation to save.
     * @param biomarkerAssociation the biomarkerAssociation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated biomarkerAssociation,
     * or with status {@code 400 (Bad Request)} if the biomarkerAssociation is not valid,
     * or with status {@code 404 (Not Found)} if the biomarkerAssociation is not found,
     * or with status {@code 500 (Internal Server Error)} if the biomarkerAssociation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/biomarker-associations/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<BiomarkerAssociation> partialUpdateBiomarkerAssociation(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody BiomarkerAssociation biomarkerAssociation
    ) throws URISyntaxException {
        log.debug("REST request to partial update BiomarkerAssociation partially : {}, {}", id, biomarkerAssociation);
        if (biomarkerAssociation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, biomarkerAssociation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!biomarkerAssociationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<BiomarkerAssociation> result = biomarkerAssociationService.partialUpdate(biomarkerAssociation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, biomarkerAssociation.getId().toString())
        );
    }

    /**
     * {@code GET  /biomarker-associations} : get all the biomarkerAssociations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of biomarkerAssociations in body.
     */
    @GetMapping("/biomarker-associations")
    public List<BiomarkerAssociation> getAllBiomarkerAssociations() {
        log.debug("REST request to get all BiomarkerAssociations");
        return biomarkerAssociationService.findAll();
    }

    /**
     * {@code GET  /biomarker-associations/:id} : get the "id" biomarkerAssociation.
     *
     * @param id the id of the biomarkerAssociation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the biomarkerAssociation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/biomarker-associations/{id}")
    public ResponseEntity<BiomarkerAssociation> getBiomarkerAssociation(@PathVariable Long id) {
        log.debug("REST request to get BiomarkerAssociation : {}", id);
        Optional<BiomarkerAssociation> biomarkerAssociation = biomarkerAssociationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(biomarkerAssociation);
    }

    @GetMapping("/biomarker-associations/companion-diagnostic-device/{id}")
    public List<BiomarkerAssociation> getBiomarkerAssociationByCompanionDiagnosticDevice(@PathVariable Long id) {
        log.debug("REST request to get BiomarkerAssociation by CompanionDiagnosticDevice id : {}", id);
        return biomarkerAssociationService.findByCompanionDiagnosticDeviceId(id);
    }

    /**
     * {@code DELETE  /biomarker-associations/:id} : delete the "id" biomarkerAssociation.
     *
     * @param id the id of the biomarkerAssociation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/biomarker-associations/{id}")
    public ResponseEntity<Void> deleteBiomarkerAssociation(@PathVariable Long id) {
        log.debug("REST request to delete BiomarkerAssociation : {}", id);
        biomarkerAssociationService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
