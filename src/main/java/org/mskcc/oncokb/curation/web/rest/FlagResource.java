package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.repository.FlagRepository;
import org.mskcc.oncokb.curation.service.FlagQueryService;
import org.mskcc.oncokb.curation.service.FlagService;
import org.mskcc.oncokb.curation.service.criteria.FlagCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Flag}.
 */
@RestController
@RequestMapping("/api")
public class FlagResource {

    private final Logger log = LoggerFactory.getLogger(FlagResource.class);

    private static final String ENTITY_NAME = "flag";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FlagService flagService;

    private final FlagRepository flagRepository;

    private final FlagQueryService flagQueryService;

    public FlagResource(FlagService flagService, FlagRepository flagRepository, FlagQueryService flagQueryService) {
        this.flagService = flagService;
        this.flagRepository = flagRepository;
        this.flagQueryService = flagQueryService;
    }

    /**
     * {@code POST  /flags} : Create a new flag.
     *
     * @param flag the flag to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new flag, or with status {@code 400 (Bad Request)} if the flag has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/flags")
    public ResponseEntity<Flag> createFlag(@Valid @RequestBody Flag flag) throws URISyntaxException {
        log.debug("REST request to save Flag : {}", flag);
        if (flag.getId() != null) {
            throw new BadRequestAlertException("A new flag cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Flag result = flagService.save(flag);
        return ResponseEntity
            .created(new URI("/api/flags/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /flags/:id} : Updates an existing flag.
     *
     * @param id the id of the flag to save.
     * @param flag the flag to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated flag,
     * or with status {@code 400 (Bad Request)} if the flag is not valid,
     * or with status {@code 500 (Internal Server Error)} if the flag couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/flags/{id}")
    public ResponseEntity<Flag> updateFlag(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Flag flag)
        throws URISyntaxException {
        log.debug("REST request to update Flag : {}, {}", id, flag);
        if (flag.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, flag.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!flagRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Flag result = flagService.save(flag);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, flag.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /flags/:id} : Partial updates given fields of an existing flag, field will ignore if it is null
     *
     * @param id the id of the flag to save.
     * @param flag the flag to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated flag,
     * or with status {@code 400 (Bad Request)} if the flag is not valid,
     * or with status {@code 404 (Not Found)} if the flag is not found,
     * or with status {@code 500 (Internal Server Error)} if the flag couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/flags/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Flag> partialUpdateFlag(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Flag flag
    ) throws URISyntaxException {
        log.debug("REST request to partial update Flag partially : {}, {}", id, flag);
        if (flag.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, flag.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!flagRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Flag> result = flagService.partialUpdate(flag);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, flag.getId().toString())
        );
    }

    /**
     * {@code GET  /flags} : get all the flags.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of flags in body.
     */
    @GetMapping("/flags")
    public ResponseEntity<List<Flag>> getAllFlags(FlagCriteria criteria, Pageable pageable) {
        log.debug("REST request to get Flags by criteria: {}", criteria);
        Page<Flag> page = flagQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /flags/count} : count all the flags.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/flags/count")
    public ResponseEntity<Long> countFlags(FlagCriteria criteria) {
        log.debug("REST request to count Flags by criteria: {}", criteria);
        return ResponseEntity.ok().body(flagQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /flags/:id} : get the "id" flag.
     *
     * @param id the id of the flag to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the flag, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/flags/{id}")
    public ResponseEntity<Flag> getFlag(@PathVariable Long id) {
        log.debug("REST request to get Flag : {}", id);
        Optional<Flag> flag = flagService.findOne(id);
        return ResponseUtil.wrapOrNotFound(flag);
    }

    /**
     * {@code DELETE  /flags/:id} : delete the "id" flag.
     *
     * @param id the id of the flag to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/flags/{id}")
    public ResponseEntity<Void> deleteFlag(@PathVariable Long id) {
        log.debug("REST request to delete Flag : {}", id);
        flagService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
