package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.mskcc.oncokb.curation.repository.DrugBrandRepository;
import org.mskcc.oncokb.curation.service.DrugBrandService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.DrugBrand}.
 */
@RestController
@RequestMapping("/api")
public class DrugBrandResource {

    private final Logger log = LoggerFactory.getLogger(DrugBrandResource.class);

    private static final String ENTITY_NAME = "drugBrand";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DrugBrandService drugBrandService;

    private final DrugBrandRepository drugBrandRepository;

    public DrugBrandResource(DrugBrandService drugBrandService, DrugBrandRepository drugBrandRepository) {
        this.drugBrandService = drugBrandService;
        this.drugBrandRepository = drugBrandRepository;
    }

    /**
     * {@code POST  /drug-brands} : Create a new drugBrand.
     *
     * @param drugBrand the drugBrand to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new drugBrand, or with status {@code 400 (Bad Request)} if the drugBrand has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/drug-brands")
    public ResponseEntity<DrugBrand> createDrugBrand(@RequestBody DrugBrand drugBrand) throws URISyntaxException {
        log.debug("REST request to save DrugBrand : {}", drugBrand);
        if (drugBrand.getId() != null) {
            throw new BadRequestAlertException("A new drugBrand cannot already have an ID", ENTITY_NAME, "idexists");
        }
        DrugBrand result = drugBrandService.save(drugBrand);
        return ResponseEntity
            .created(new URI("/api/drug-brands/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /drug-brands/:id} : Updates an existing drugBrand.
     *
     * @param id the id of the drugBrand to save.
     * @param drugBrand the drugBrand to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated drugBrand,
     * or with status {@code 400 (Bad Request)} if the drugBrand is not valid,
     * or with status {@code 500 (Internal Server Error)} if the drugBrand couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/drug-brands/{id}")
    public ResponseEntity<DrugBrand> updateDrugBrand(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DrugBrand drugBrand
    ) throws URISyntaxException {
        log.debug("REST request to update DrugBrand : {}, {}", id, drugBrand);
        if (drugBrand.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, drugBrand.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!drugBrandRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        DrugBrand result = drugBrandService.save(drugBrand);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, drugBrand.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /drug-brands/:id} : Partial updates given fields of an existing drugBrand, field will ignore if it is null
     *
     * @param id the id of the drugBrand to save.
     * @param drugBrand the drugBrand to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated drugBrand,
     * or with status {@code 400 (Bad Request)} if the drugBrand is not valid,
     * or with status {@code 404 (Not Found)} if the drugBrand is not found,
     * or with status {@code 500 (Internal Server Error)} if the drugBrand couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/drug-brands/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DrugBrand> partialUpdateDrugBrand(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DrugBrand drugBrand
    ) throws URISyntaxException {
        log.debug("REST request to partial update DrugBrand partially : {}, {}", id, drugBrand);
        if (drugBrand.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, drugBrand.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!drugBrandRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DrugBrand> result = drugBrandService.partialUpdate(drugBrand);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, drugBrand.getId().toString())
        );
    }

    /**
     * {@code GET  /drug-brands} : get all the drugBrands.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of drugBrands in body.
     */
    @GetMapping("/drug-brands")
    public List<DrugBrand> getAllDrugBrands() {
        log.debug("REST request to get all DrugBrands");
        return drugBrandService.findAll();
    }

    /**
     * {@code GET  /drug-brands/:id} : get the "id" drugBrand.
     *
     * @param id the id of the drugBrand to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the drugBrand, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/drug-brands/{id}")
    public ResponseEntity<DrugBrand> getDrugBrand(@PathVariable Long id) {
        log.debug("REST request to get DrugBrand : {}", id);
        Optional<DrugBrand> drugBrand = drugBrandService.findOne(id);
        return ResponseUtil.wrapOrNotFound(drugBrand);
    }

    /**
     * {@code DELETE  /drug-brands/:id} : delete the "id" drugBrand.
     *
     * @param id the id of the drugBrand to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/drug-brands/{id}")
    public ResponseEntity<Void> deleteDrugBrand(@PathVariable Long id) {
        log.debug("REST request to delete DrugBrand : {}", id);
        drugBrandService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
