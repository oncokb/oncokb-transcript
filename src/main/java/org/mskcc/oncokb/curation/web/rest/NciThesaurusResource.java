package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.mskcc.oncokb.curation.repository.NciThesaurusRepository;
import org.mskcc.oncokb.curation.service.NciThesaurusQueryService;
import org.mskcc.oncokb.curation.service.NciThesaurusService;
import org.mskcc.oncokb.curation.service.criteria.NciThesaurusCriteria;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.NciThesaurus}.
 */
@RestController
@RequestMapping("/api")
public class NciThesaurusResource {

    private final Logger log = LoggerFactory.getLogger(NciThesaurusResource.class);

    private static final String ENTITY_NAME = "nciThesaurus";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final NciThesaurusService nciThesaurusService;

    private final NciThesaurusRepository nciThesaurusRepository;

    private final NciThesaurusQueryService nciThesaurusQueryService;

    public NciThesaurusResource(
        NciThesaurusService nciThesaurusService,
        NciThesaurusRepository nciThesaurusRepository,
        NciThesaurusQueryService nciThesaurusQueryService
    ) {
        this.nciThesaurusService = nciThesaurusService;
        this.nciThesaurusRepository = nciThesaurusRepository;
        this.nciThesaurusQueryService = nciThesaurusQueryService;
    }

    /**
     * {@code POST  /nci-thesauruses} : Create a new nciThesaurus.
     *
     * @param nciThesaurus the nciThesaurus to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new nciThesaurus, or with status {@code 400 (Bad Request)} if the nciThesaurus has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/nci-thesauruses")
    public ResponseEntity<NciThesaurus> createNciThesaurus(@Valid @RequestBody NciThesaurus nciThesaurus) throws URISyntaxException {
        log.debug("REST request to save NciThesaurus : {}", nciThesaurus);
        if (nciThesaurus.getId() != null) {
            throw new BadRequestAlertException("A new nciThesaurus cannot already have an ID", ENTITY_NAME, "idexists");
        }
        NciThesaurus result = nciThesaurusService.save(nciThesaurus);
        return ResponseEntity
            .created(new URI("/api/nci-thesauruses/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /nci-thesauruses/:id} : Updates an existing nciThesaurus.
     *
     * @param id the id of the nciThesaurus to save.
     * @param nciThesaurus the nciThesaurus to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated nciThesaurus,
     * or with status {@code 400 (Bad Request)} if the nciThesaurus is not valid,
     * or with status {@code 500 (Internal Server Error)} if the nciThesaurus couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/nci-thesauruses/{id}")
    public ResponseEntity<NciThesaurus> updateNciThesaurus(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody NciThesaurus nciThesaurus
    ) throws URISyntaxException {
        log.debug("REST request to update NciThesaurus : {}, {}", id, nciThesaurus);
        if (nciThesaurus.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, nciThesaurus.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!nciThesaurusRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        NciThesaurus result = nciThesaurusService.save(nciThesaurus);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, nciThesaurus.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /nci-thesauruses/:id} : Partial updates given fields of an existing nciThesaurus, field will ignore if it is null
     *
     * @param id the id of the nciThesaurus to save.
     * @param nciThesaurus the nciThesaurus to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated nciThesaurus,
     * or with status {@code 400 (Bad Request)} if the nciThesaurus is not valid,
     * or with status {@code 404 (Not Found)} if the nciThesaurus is not found,
     * or with status {@code 500 (Internal Server Error)} if the nciThesaurus couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/nci-thesauruses/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<NciThesaurus> partialUpdateNciThesaurus(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody NciThesaurus nciThesaurus
    ) throws URISyntaxException {
        log.debug("REST request to partial update NciThesaurus partially : {}, {}", id, nciThesaurus);
        if (nciThesaurus.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, nciThesaurus.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!nciThesaurusRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<NciThesaurus> result = nciThesaurusService.partialUpdate(nciThesaurus);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, nciThesaurus.getId().toString())
        );
    }

    /**
     * {@code GET  /nci-thesauruses} : get all the nciThesauruses.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of nciThesauruses in body.
     */
    @GetMapping("/nci-thesauruses")
    public ResponseEntity<List<NciThesaurus>> getAllNciThesauruses(Pageable pageable) {
        log.debug("REST request to get NciThesauruses");
        Page<NciThesaurus> page = nciThesaurusService.findAllWithEagerRelationships(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /nci-thesauruses/count} : count all the nciThesauruses.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/nci-thesauruses/count")
    public ResponseEntity<Long> countNciThesauruses(NciThesaurusCriteria criteria) {
        log.debug("REST request to count NciThesauruses by criteria: {}", criteria);
        return ResponseEntity.ok().body(nciThesaurusQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /nci-thesauruses/:id} : get the "id" nciThesaurus.
     *
     * @param id the id of the nciThesaurus to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the nciThesaurus, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/nci-thesauruses/{id}")
    public ResponseEntity<NciThesaurus> getNciThesaurus(@PathVariable Long id) {
        log.debug("REST request to get NciThesaurus : {}", id);
        Optional<NciThesaurus> nciThesaurus = nciThesaurusService.findOne(id);
        return ResponseUtil.wrapOrNotFound(nciThesaurus);
    }

    /**
     * {@code DELETE  /nci-thesauruses/:id} : delete the "id" nciThesaurus.
     *
     * @param id the id of the nciThesaurus to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/nci-thesauruses/{id}")
    public ResponseEntity<Void> deleteNciThesaurus(@PathVariable Long id) {
        log.debug("REST request to delete NciThesaurus : {}", id);
        nciThesaurusService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /nci-thesauruses/search?query=:query} : search for the NCI Thesaurus corresponding
     * to the query.
     *
     * @param query the query of the NCI Thesaurus search.
     * @return the result of the search.
     */
    @GetMapping("/nci-thesauruses/search")
    public ResponseEntity<List<NciThesaurus>> searchNciThesaurus(@RequestParam String query) {
        log.debug("REST request to search for a page of Drugs for query {}", query);
        List<NciThesaurus> drugs = nciThesaurusService.searchNciThesaurus(query);
        return ResponseEntity.ok().body(drugs);
    }
}
