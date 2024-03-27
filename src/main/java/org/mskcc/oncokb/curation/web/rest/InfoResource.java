package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.Info;
import org.mskcc.oncokb.curation.repository.InfoRepository;
import org.mskcc.oncokb.curation.service.InfoService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Info}.
 */
@RestController
@RequestMapping("/api")
public class InfoResource {

    private final Logger log = LoggerFactory.getLogger(InfoResource.class);

    private static final String ENTITY_NAME = "info";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final InfoService infoService;

    private final InfoRepository infoRepository;

    public InfoResource(InfoService infoService, InfoRepository infoRepository) {
        this.infoService = infoService;
        this.infoRepository = infoRepository;
    }

    /**
     * {@code POST  /infos} : Create a new info.
     *
     * @param info the info to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new info, or with status {@code 400 (Bad Request)} if the info has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/infos")
    public ResponseEntity<Info> createInfo(@Valid @RequestBody Info info) throws URISyntaxException {
        log.debug("REST request to save Info : {}", info);
        if (info.getId() != null) {
            throw new BadRequestAlertException("A new info cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Info result = infoService.save(info);
        return ResponseEntity
            .created(new URI("/api/infos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /infos/:id} : Updates an existing info.
     *
     * @param id the id of the info to save.
     * @param info the info to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated info,
     * or with status {@code 400 (Bad Request)} if the info is not valid,
     * or with status {@code 500 (Internal Server Error)} if the info couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/infos/{id}")
    public ResponseEntity<Info> updateInfo(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Info info)
        throws URISyntaxException {
        log.debug("REST request to update Info : {}, {}", id, info);
        if (info.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, info.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!infoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Info result = infoService.save(info);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, info.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /infos/:id} : Partial updates given fields of an existing info, field will ignore if it is null
     *
     * @param id the id of the info to save.
     * @param info the info to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated info,
     * or with status {@code 400 (Bad Request)} if the info is not valid,
     * or with status {@code 404 (Not Found)} if the info is not found,
     * or with status {@code 500 (Internal Server Error)} if the info couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/infos/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Info> partialUpdateInfo(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Info info
    ) throws URISyntaxException {
        log.debug("REST request to partial update Info partially : {}, {}", id, info);
        if (info.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, info.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!infoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Info> result = infoService.partialUpdate(info);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, info.getId().toString())
        );
    }

    /**
     * {@code GET  /infos} : get all the infos.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of infos in body.
     */
    @GetMapping("/infos")
    public List<Info> getAllInfos() {
        log.debug("REST request to get all Infos");
        return infoService.findAll();
    }

    /**
     * {@code GET  /infos/:id} : get the "id" info.
     *
     * @param id the id of the info to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the info, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/infos/{id}")
    public ResponseEntity<Info> getInfo(@PathVariable Long id) {
        log.debug("REST request to get Info : {}", id);
        Optional<Info> info = infoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(info);
    }

    /**
     * {@code DELETE  /infos/:id} : delete the "id" info.
     *
     * @param id the id of the info to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/infos/{id}")
    public ResponseEntity<Void> deleteInfo(@PathVariable Long id) {
        log.debug("REST request to delete Info : {}", id);
        infoService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
