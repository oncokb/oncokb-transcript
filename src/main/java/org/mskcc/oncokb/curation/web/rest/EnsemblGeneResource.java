package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.repository.EnsemblGeneRepository;
import org.mskcc.oncokb.curation.service.EnsemblGeneService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.EnsemblGene}.
 */
@RestController
@RequestMapping("/api")
public class EnsemblGeneResource {

    private final Logger log = LoggerFactory.getLogger(EnsemblGeneResource.class);

    private static final String ENTITY_NAME = "ensemblGene";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EnsemblGeneService ensemblGeneService;

    private final EnsemblGeneRepository ensemblGeneRepository;

    public EnsemblGeneResource(EnsemblGeneService ensemblGeneService, EnsemblGeneRepository ensemblGeneRepository) {
        this.ensemblGeneService = ensemblGeneService;
        this.ensemblGeneRepository = ensemblGeneRepository;
    }

    /**
     * {@code POST  /ensembl-genes} : Create a new ensemblGene.
     *
     * @param ensemblGene the ensemblGene to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new ensemblGene, or with status {@code 400 (Bad Request)} if the ensemblGene has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/ensembl-genes")
    public ResponseEntity<EnsemblGene> createEnsemblGene(@Valid @RequestBody EnsemblGene ensemblGene) throws URISyntaxException {
        log.debug("REST request to save EnsemblGene : {}", ensemblGene);
        if (ensemblGene.getId() != null) {
            throw new BadRequestAlertException("A new ensemblGene cannot already have an ID", ENTITY_NAME, "idexists");
        }
        EnsemblGene result = ensemblGeneService.save(ensemblGene);
        return ResponseEntity
            .created(new URI("/api/ensembl-genes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /ensembl-genes/:id} : Updates an existing ensemblGene.
     *
     * @param id the id of the ensemblGene to save.
     * @param ensemblGene the ensemblGene to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated ensemblGene,
     * or with status {@code 400 (Bad Request)} if the ensemblGene is not valid,
     * or with status {@code 500 (Internal Server Error)} if the ensemblGene couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/ensembl-genes/{id}")
    public ResponseEntity<EnsemblGene> updateEnsemblGene(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EnsemblGene ensemblGene
    ) throws URISyntaxException {
        log.debug("REST request to update EnsemblGene : {}, {}", id, ensemblGene);
        if (ensemblGene.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, ensemblGene.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ensemblGeneRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        EnsemblGene result = ensemblGeneService.save(ensemblGene);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, ensemblGene.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /ensembl-genes/:id} : Partial updates given fields of an existing ensemblGene, field will ignore if it is null
     *
     * @param id the id of the ensemblGene to save.
     * @param ensemblGene the ensemblGene to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated ensemblGene,
     * or with status {@code 400 (Bad Request)} if the ensemblGene is not valid,
     * or with status {@code 404 (Not Found)} if the ensemblGene is not found,
     * or with status {@code 500 (Internal Server Error)} if the ensemblGene couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/ensembl-genes/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EnsemblGene> partialUpdateEnsemblGene(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EnsemblGene ensemblGene
    ) throws URISyntaxException {
        log.debug("REST request to partial update EnsemblGene partially : {}, {}", id, ensemblGene);
        if (ensemblGene.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, ensemblGene.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ensemblGeneRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<EnsemblGene> result = ensemblGeneService.partialUpdate(ensemblGene);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, ensemblGene.getId().toString())
        );
    }

    /**
     * {@code GET  /ensembl-genes} : get all the ensemblGenes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of ensemblGenes in body.
     */
    @GetMapping("/ensembl-genes")
    public List<EnsemblGene> getAllEnsemblGenes() {
        log.debug("REST request to get all EnsemblGenes");
        return ensemblGeneService.findAll();
    }

    /**
     * {@code GET  /ensembl-genes/:id} : get the "id" ensemblGene.
     *
     * @param id the id of the ensemblGene to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the ensemblGene, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/ensembl-genes/{id}")
    public ResponseEntity<EnsemblGene> getEnsemblGene(@PathVariable Long id) {
        log.debug("REST request to get EnsemblGene : {}", id);
        Optional<EnsemblGene> ensemblGene = ensemblGeneService.findOne(id);
        return ResponseUtil.wrapOrNotFound(ensemblGene);
    }

    /**
     * {@code DELETE  /ensembl-genes/:id} : delete the "id" ensemblGene.
     *
     * @param id the id of the ensemblGene to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/ensembl-genes/{id}")
    public ResponseEntity<Void> deleteEnsemblGene(@PathVariable Long id) {
        log.debug("REST request to delete EnsemblGene : {}", id);
        ensemblGeneService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
