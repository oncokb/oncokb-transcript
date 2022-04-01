package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.GeneAlias;
import org.mskcc.oncokb.curation.repository.GeneAliasRepository;
import org.mskcc.oncokb.curation.service.GeneAliasService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.GeneAlias}.
 */
@RestController
@RequestMapping("/api")
public class GeneAliasResource {

    private final Logger log = LoggerFactory.getLogger(GeneAliasResource.class);

    private static final String ENTITY_NAME = "geneAlias";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GeneAliasService geneAliasService;

    private final GeneAliasRepository geneAliasRepository;

    public GeneAliasResource(GeneAliasService geneAliasService, GeneAliasRepository geneAliasRepository) {
        this.geneAliasService = geneAliasService;
        this.geneAliasRepository = geneAliasRepository;
    }

    /**
     * {@code POST  /gene-aliases} : Create a new geneAlias.
     *
     * @param geneAlias the geneAlias to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new geneAlias, or with status {@code 400 (Bad Request)} if the geneAlias has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/gene-aliases")
    public ResponseEntity<GeneAlias> createGeneAlias(@RequestBody GeneAlias geneAlias) throws URISyntaxException {
        log.debug("REST request to save GeneAlias : {}", geneAlias);
        if (geneAlias.getId() != null) {
            throw new BadRequestAlertException("A new geneAlias cannot already have an ID", ENTITY_NAME, "idexists");
        }
        GeneAlias result = geneAliasService.save(geneAlias);
        return ResponseEntity
            .created(new URI("/api/gene-aliases/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /gene-aliases/:id} : Updates an existing geneAlias.
     *
     * @param id the id of the geneAlias to save.
     * @param geneAlias the geneAlias to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated geneAlias,
     * or with status {@code 400 (Bad Request)} if the geneAlias is not valid,
     * or with status {@code 500 (Internal Server Error)} if the geneAlias couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/gene-aliases/{id}")
    public ResponseEntity<GeneAlias> updateGeneAlias(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody GeneAlias geneAlias
    ) throws URISyntaxException {
        log.debug("REST request to update GeneAlias : {}, {}", id, geneAlias);
        if (geneAlias.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, geneAlias.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!geneAliasRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        GeneAlias result = geneAliasService.save(geneAlias);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, geneAlias.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /gene-aliases/:id} : Partial updates given fields of an existing geneAlias, field will ignore if it is null
     *
     * @param id the id of the geneAlias to save.
     * @param geneAlias the geneAlias to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated geneAlias,
     * or with status {@code 400 (Bad Request)} if the geneAlias is not valid,
     * or with status {@code 404 (Not Found)} if the geneAlias is not found,
     * or with status {@code 500 (Internal Server Error)} if the geneAlias couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/gene-aliases/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<GeneAlias> partialUpdateGeneAlias(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody GeneAlias geneAlias
    ) throws URISyntaxException {
        log.debug("REST request to partial update GeneAlias partially : {}, {}", id, geneAlias);
        if (geneAlias.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, geneAlias.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!geneAliasRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<GeneAlias> result = geneAliasService.partialUpdate(geneAlias);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, geneAlias.getId().toString())
        );
    }

    /**
     * {@code GET  /gene-aliases} : get all the geneAliases.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of geneAliases in body.
     */
    @GetMapping("/gene-aliases")
    public List<GeneAlias> getAllGeneAliases() {
        log.debug("REST request to get all GeneAliases");
        return geneAliasService.findAll();
    }

    /**
     * {@code GET  /gene-aliases/:id} : get the "id" geneAlias.
     *
     * @param id the id of the geneAlias to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the geneAlias, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/gene-aliases/{id}")
    public ResponseEntity<GeneAlias> getGeneAlias(@PathVariable Long id) {
        log.debug("REST request to get GeneAlias : {}", id);
        Optional<GeneAlias> geneAlias = geneAliasService.findOne(id);
        return ResponseUtil.wrapOrNotFound(geneAlias);
    }

    /**
     * {@code DELETE  /gene-aliases/:id} : delete the "id" geneAlias.
     *
     * @param id the id of the geneAlias to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/gene-aliases/{id}")
    public ResponseEntity<Void> deleteGeneAlias(@PathVariable Long id) {
        log.debug("REST request to delete GeneAlias : {}", id);
        geneAliasService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
