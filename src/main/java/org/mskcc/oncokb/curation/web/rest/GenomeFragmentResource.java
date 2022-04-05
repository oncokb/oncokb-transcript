package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.repository.GenomeFragmentRepository;
import org.mskcc.oncokb.curation.service.GenomeFragmentService;
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
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.GenomeFragment}.
 */
@RestController
@RequestMapping("/api")
public class GenomeFragmentResource {

    private final Logger log = LoggerFactory.getLogger(GenomeFragmentResource.class);

    private static final String ENTITY_NAME = "genomeFragment";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GenomeFragmentService genomeFragmentService;

    private final GenomeFragmentRepository genomeFragmentRepository;

    public GenomeFragmentResource(GenomeFragmentService genomeFragmentService, GenomeFragmentRepository genomeFragmentRepository) {
        this.genomeFragmentService = genomeFragmentService;
        this.genomeFragmentRepository = genomeFragmentRepository;
    }

    /**
     * {@code POST  /genome-fragments} : Create a new genomeFragment.
     *
     * @param genomeFragment the genomeFragment to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new genomeFragment, or with status {@code 400 (Bad Request)} if the genomeFragment has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/genome-fragments")
    public ResponseEntity<GenomeFragment> createGenomeFragment(@RequestBody GenomeFragment genomeFragment) throws URISyntaxException {
        log.debug("REST request to save GenomeFragment : {}", genomeFragment);
        if (genomeFragment.getId() != null) {
            throw new BadRequestAlertException("A new genomeFragment cannot already have an ID", ENTITY_NAME, "idexists");
        }
        GenomeFragment result = genomeFragmentService.save(genomeFragment);
        return ResponseEntity
            .created(new URI("/api/genome-fragments/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /genome-fragments/:id} : Updates an existing genomeFragment.
     *
     * @param id the id of the genomeFragment to save.
     * @param genomeFragment the genomeFragment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated genomeFragment,
     * or with status {@code 400 (Bad Request)} if the genomeFragment is not valid,
     * or with status {@code 500 (Internal Server Error)} if the genomeFragment couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/genome-fragments/{id}")
    public ResponseEntity<GenomeFragment> updateGenomeFragment(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody GenomeFragment genomeFragment
    ) throws URISyntaxException {
        log.debug("REST request to update GenomeFragment : {}, {}", id, genomeFragment);
        if (genomeFragment.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, genomeFragment.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!genomeFragmentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        GenomeFragment result = genomeFragmentService.save(genomeFragment);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, genomeFragment.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /genome-fragments/:id} : Partial updates given fields of an existing genomeFragment, field will ignore if it is null
     *
     * @param id the id of the genomeFragment to save.
     * @param genomeFragment the genomeFragment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated genomeFragment,
     * or with status {@code 400 (Bad Request)} if the genomeFragment is not valid,
     * or with status {@code 404 (Not Found)} if the genomeFragment is not found,
     * or with status {@code 500 (Internal Server Error)} if the genomeFragment couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/genome-fragments/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<GenomeFragment> partialUpdateGenomeFragment(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody GenomeFragment genomeFragment
    ) throws URISyntaxException {
        log.debug("REST request to partial update GenomeFragment partially : {}, {}", id, genomeFragment);
        if (genomeFragment.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, genomeFragment.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!genomeFragmentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<GenomeFragment> result = genomeFragmentService.partialUpdate(genomeFragment);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, genomeFragment.getId().toString())
        );
    }

    /**
     * {@code GET  /genome-fragments} : get all the genomeFragments.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of genomeFragments in body.
     */
    @GetMapping("/genome-fragments")
    public ResponseEntity<List<GenomeFragment>> getAllGenomeFragments(Pageable pageable) {
        log.debug("REST request to get a page of GenomeFragments");
        Page<GenomeFragment> page = genomeFragmentService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /genome-fragments/:id} : get the "id" genomeFragment.
     *
     * @param id the id of the genomeFragment to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the genomeFragment, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/genome-fragments/{id}")
    public ResponseEntity<GenomeFragment> getGenomeFragment(@PathVariable Long id) {
        log.debug("REST request to get GenomeFragment : {}", id);
        Optional<GenomeFragment> genomeFragment = genomeFragmentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(genomeFragment);
    }

    /**
     * {@code DELETE  /genome-fragments/:id} : delete the "id" genomeFragment.
     *
     * @param id the id of the genomeFragment to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/genome-fragments/{id}")
    public ResponseEntity<Void> deleteGenomeFragment(@PathVariable Long id) {
        log.debug("REST request to delete GenomeFragment : {}", id);
        genomeFragmentService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
