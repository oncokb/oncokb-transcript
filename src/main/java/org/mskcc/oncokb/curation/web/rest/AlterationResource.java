package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.mskcc.oncokb.curation.service.AlterationService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Alteration}.
 */
@RestController
@RequestMapping("/api")
public class AlterationResource {

    private final Logger log = LoggerFactory.getLogger(AlterationResource.class);

    private static final String ENTITY_NAME = "alteration";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AlterationService alterationService;

    private final AlterationRepository alterationRepository;

    public AlterationResource(AlterationService alterationService, AlterationRepository alterationRepository) {
        this.alterationService = alterationService;
        this.alterationRepository = alterationRepository;
    }

    /**
     * {@code POST  /alterations} : Create a new alteration.
     *
     * @param alteration the alteration to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new alteration, or with status {@code 400 (Bad Request)} if the alteration has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/alterations")
    public ResponseEntity<Alteration> createAlteration(@Valid @RequestBody Alteration alteration) throws URISyntaxException {
        log.debug("REST request to save Alteration : {}", alteration);
        if (alteration.getId() != null) {
            throw new BadRequestAlertException("A new alteration cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Alteration result = alterationService.save(alteration);
        return ResponseEntity
            .created(new URI("/api/alterations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /alterations/:id} : Updates an existing alteration.
     *
     * @param id the id of the alteration to save.
     * @param alteration the alteration to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated alteration,
     * or with status {@code 400 (Bad Request)} if the alteration is not valid,
     * or with status {@code 500 (Internal Server Error)} if the alteration couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/alterations/{id}")
    public ResponseEntity<Alteration> updateAlteration(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Alteration alteration
    ) throws URISyntaxException {
        log.debug("REST request to update Alteration : {}, {}", id, alteration);
        if (alteration.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, alteration.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!alterationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Alteration result = alterationService.save(alteration);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, alteration.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /alterations/:id} : Partial updates given fields of an existing alteration, field will ignore if it is null
     *
     * @param id the id of the alteration to save.
     * @param alteration the alteration to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated alteration,
     * or with status {@code 400 (Bad Request)} if the alteration is not valid,
     * or with status {@code 404 (Not Found)} if the alteration is not found,
     * or with status {@code 500 (Internal Server Error)} if the alteration couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/alterations/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Alteration> partialUpdateAlteration(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Alteration alteration
    ) throws URISyntaxException {
        log.debug("REST request to partial update Alteration partially : {}, {}", id, alteration);
        if (alteration.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, alteration.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!alterationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Alteration> result = alterationService.partialUpdate(alteration);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, alteration.getId().toString())
        );
    }

    /**
     * {@code GET  /alterations} : get all the alterations.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of alterations in body.
     */
    @GetMapping("/alterations")
    public ResponseEntity<List<Alteration>> getAllAlterations(
        Pageable pageable,
        @RequestParam(required = false, defaultValue = "false") boolean eagerload
    ) {
        log.debug("REST request to get a page of Alterations");
        Page<Alteration> page;
        if (eagerload) {
            page = alterationService.findAllWithEagerRelationships(pageable);
        } else {
            page = alterationService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /alterations/:id} : get the "id" alteration.
     *
     * @param id the id of the alteration to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the alteration, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/alterations/{id}")
    public ResponseEntity<Alteration> getAlteration(@PathVariable Long id) {
        log.debug("REST request to get Alteration : {}", id);
        Optional<Alteration> alteration = alterationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(alteration);
    }

    /**
     * {@code DELETE  /alterations/:id} : delete the "id" alteration.
     *
     * @param id the id of the alteration to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/alterations/{id}")
    public ResponseEntity<Void> deleteAlteration(@PathVariable Long id) {
        log.debug("REST request to delete Alteration : {}", id);
        alterationService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /_search/alterations?query=:query} : search for the alteration corresponding
     * to the query.
     *
     * @param query the query of the alteration search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/_search/alterations")
    public ResponseEntity<List<Alteration>> searchAlterations(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Alterations for query {}", query);
        Page<Alteration> page = alterationService.search(query, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
