package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.repository.AssociationRepository;
import org.mskcc.oncokb.curation.service.AssociationService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Association}.
 */
@RestController
@RequestMapping("/api")
public class AssociationResource {

    private final Logger log = LoggerFactory.getLogger(AssociationResource.class);

    private static final String ENTITY_NAME = "association";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AssociationService associationService;

    private final AssociationRepository associationRepository;

    public AssociationResource(AssociationService associationService, AssociationRepository associationRepository) {
        this.associationService = associationService;
        this.associationRepository = associationRepository;
    }

    /**
     * {@code POST  /associations} : Create a new association.
     *
     * @param association the association to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new association, or with status {@code 400 (Bad Request)} if the association has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/associations")
    public ResponseEntity<Association> createAssociation(@RequestBody Association association) throws URISyntaxException {
        log.debug("REST request to save Association : {}", association);
        if (association.getId() != null) {
            throw new BadRequestAlertException("A new association cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Association result = associationService.save(association);
        return ResponseEntity
            .created(new URI("/api/associations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /associations} : get all the associations.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @param filter the filter of the request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of associations in body.
     */
    @GetMapping("/associations")
    public List<Association> getAllAssociations(
        @RequestParam(required = false) String filter,
        @RequestParam(required = false, defaultValue = "false") boolean eagerload
    ) {
        if ("evidence-is-null".equals(filter)) {
            log.debug("REST request to get all Associations where evidence is null");
            return associationService.findAllWhereEvidenceIsNull();
        }
        log.debug("REST request to get all Associations");
        return associationService.findAll();
    }

    /**
     * {@code GET  /associations/:id} : get the "id" association.
     *
     * @param id the id of the association to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the association, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/associations/{id}")
    public ResponseEntity<Association> getAssociation(@PathVariable Long id) {
        log.debug("REST request to get Association : {}", id);
        Optional<Association> association = associationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(association);
    }

    /**
     * {@code DELETE  /associations/:id} : delete the "id" association.
     *
     * @param id the id of the association to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/associations/{id}")
    public ResponseEntity<Void> deleteAssociation(@PathVariable Long id) throws Exception {
        log.debug("REST request to delete Association : {}", id);
        associationService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /associations/search?query=:query} : search for the Association corresponding
     * to the query.
     *
     * @param query    the query of the Association search.
     * @param pageable the pagination information.
     * @return the result of the search.
     */
    @GetMapping("/associations/search")
    public ResponseEntity<List<Association>> searchAssociations(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Associations for query {}", query);
        // TODO: implement the search
        Page<Association> page = new PageImpl<>(new ArrayList<>());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
