package org.mskcc.oncokb.transcript.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Arm;
import org.mskcc.oncokb.transcript.repository.ArmRepository;
import org.mskcc.oncokb.transcript.service.ArmService;
import org.mskcc.oncokb.transcript.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.transcript.domain.Arm}.
 */
@RestController
@RequestMapping("/api")
public class ArmResource {

    private final Logger log = LoggerFactory.getLogger(ArmResource.class);

    private static final String ENTITY_NAME = "arm";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ArmService armService;

    private final ArmRepository armRepository;

    public ArmResource(ArmService armService, ArmRepository armRepository) {
        this.armService = armService;
        this.armRepository = armRepository;
    }

    /**
     * {@code POST  /arms} : Create a new arm.
     *
     * @param arm the arm to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new arm, or with status {@code 400 (Bad Request)} if the arm has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/arms")
    public ResponseEntity<Arm> createArm(@RequestBody Arm arm) throws URISyntaxException {
        log.debug("REST request to save Arm : {}", arm);
        if (arm.getId() != null) {
            throw new BadRequestAlertException("A new arm cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Arm result = armService.save(arm);
        return ResponseEntity
            .created(new URI("/api/arms/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /arms/:id} : Updates an existing arm.
     *
     * @param id the id of the arm to save.
     * @param arm the arm to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated arm,
     * or with status {@code 400 (Bad Request)} if the arm is not valid,
     * or with status {@code 500 (Internal Server Error)} if the arm couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/arms/{id}")
    public ResponseEntity<Arm> updateArm(@PathVariable(value = "id", required = false) final Long id, @RequestBody Arm arm)
        throws URISyntaxException {
        log.debug("REST request to update Arm : {}, {}", id, arm);
        if (arm.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, arm.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!armRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Arm result = armService.save(arm);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, arm.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /arms/:id} : Partial updates given fields of an existing arm, field will ignore if it is null
     *
     * @param id the id of the arm to save.
     * @param arm the arm to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated arm,
     * or with status {@code 400 (Bad Request)} if the arm is not valid,
     * or with status {@code 404 (Not Found)} if the arm is not found,
     * or with status {@code 500 (Internal Server Error)} if the arm couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/arms/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<Arm> partialUpdateArm(@PathVariable(value = "id", required = false) final Long id, @RequestBody Arm arm)
        throws URISyntaxException {
        log.debug("REST request to partial update Arm partially : {}, {}", id, arm);
        if (arm.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, arm.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!armRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Arm> result = armService.partialUpdate(arm);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, arm.getId().toString())
        );
    }

    /**
     * {@code GET  /arms} : get all the arms.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of arms in body.
     */
    @GetMapping("/arms")
    public List<Arm> getAllArms() {
        log.debug("REST request to get all Arms");
        return armService.findAll();
    }

    /**
     * {@code GET  /arms/:id} : get the "id" arm.
     *
     * @param id the id of the arm to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the arm, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/arms/{id}")
    public ResponseEntity<Arm> getArm(@PathVariable Long id) {
        log.debug("REST request to get Arm : {}", id);
        Optional<Arm> arm = armService.findOne(id);
        return ResponseUtil.wrapOrNotFound(arm);
    }

    /**
     * {@code DELETE  /arms/:id} : delete the "id" arm.
     *
     * @param id the id of the arm to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/arms/{id}")
    public ResponseEntity<Void> deleteArm(@PathVariable Long id) {
        log.debug("REST request to delete Arm : {}", id);
        armService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
