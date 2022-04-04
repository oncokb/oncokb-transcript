package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.repository.CompanionDiagnosticDeviceRepository;
import org.mskcc.oncokb.curation.service.CompanionDiagnosticDeviceService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice}.
 */
@RestController
@RequestMapping("/api")
public class CompanionDiagnosticDeviceResource {

    private final Logger log = LoggerFactory.getLogger(CompanionDiagnosticDeviceResource.class);

    private static final String ENTITY_NAME = "companionDiagnosticDevice";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CompanionDiagnosticDeviceService companionDiagnosticDeviceService;

    private final CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository;

    public CompanionDiagnosticDeviceResource(
        CompanionDiagnosticDeviceService companionDiagnosticDeviceService,
        CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository
    ) {
        this.companionDiagnosticDeviceService = companionDiagnosticDeviceService;
        this.companionDiagnosticDeviceRepository = companionDiagnosticDeviceRepository;
    }

    /**
     * {@code POST  /companion-diagnostic-devices} : Create a new companionDiagnosticDevice.
     *
     * @param companionDiagnosticDevice the companionDiagnosticDevice to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new companionDiagnosticDevice, or with status {@code 400 (Bad Request)} if the companionDiagnosticDevice has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/companion-diagnostic-devices")
    public ResponseEntity<CompanionDiagnosticDevice> createCompanionDiagnosticDevice(
        @Valid @RequestBody CompanionDiagnosticDevice companionDiagnosticDevice
    ) throws URISyntaxException {
        log.debug("REST request to save CompanionDiagnosticDevice : {}", companionDiagnosticDevice);
        if (companionDiagnosticDevice.getId() != null) {
            throw new BadRequestAlertException("A new companionDiagnosticDevice cannot already have an ID", ENTITY_NAME, "idexists");
        }
        CompanionDiagnosticDevice result = companionDiagnosticDeviceService.save(companionDiagnosticDevice);
        return ResponseEntity
            .created(new URI("/api/companion-diagnostic-devices/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /companion-diagnostic-devices/:id} : Updates an existing companionDiagnosticDevice.
     *
     * @param id the id of the companionDiagnosticDevice to save.
     * @param companionDiagnosticDevice the companionDiagnosticDevice to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated companionDiagnosticDevice,
     * or with status {@code 400 (Bad Request)} if the companionDiagnosticDevice is not valid,
     * or with status {@code 500 (Internal Server Error)} if the companionDiagnosticDevice couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/companion-diagnostic-devices/{id}")
    public ResponseEntity<CompanionDiagnosticDevice> updateCompanionDiagnosticDevice(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CompanionDiagnosticDevice companionDiagnosticDevice
    ) throws URISyntaxException {
        log.debug("REST request to update CompanionDiagnosticDevice : {}, {}", id, companionDiagnosticDevice);
        if (companionDiagnosticDevice.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, companionDiagnosticDevice.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!companionDiagnosticDeviceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        CompanionDiagnosticDevice result = companionDiagnosticDeviceService.save(companionDiagnosticDevice);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, companionDiagnosticDevice.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /companion-diagnostic-devices/:id} : Partial updates given fields of an existing companionDiagnosticDevice, field will ignore if it is null
     *
     * @param id the id of the companionDiagnosticDevice to save.
     * @param companionDiagnosticDevice the companionDiagnosticDevice to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated companionDiagnosticDevice,
     * or with status {@code 400 (Bad Request)} if the companionDiagnosticDevice is not valid,
     * or with status {@code 404 (Not Found)} if the companionDiagnosticDevice is not found,
     * or with status {@code 500 (Internal Server Error)} if the companionDiagnosticDevice couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/companion-diagnostic-devices/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CompanionDiagnosticDevice> partialUpdateCompanionDiagnosticDevice(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CompanionDiagnosticDevice companionDiagnosticDevice
    ) throws URISyntaxException {
        log.debug("REST request to partial update CompanionDiagnosticDevice partially : {}, {}", id, companionDiagnosticDevice);
        if (companionDiagnosticDevice.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, companionDiagnosticDevice.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!companionDiagnosticDeviceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CompanionDiagnosticDevice> result = companionDiagnosticDeviceService.partialUpdate(companionDiagnosticDevice);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, companionDiagnosticDevice.getId().toString())
        );
    }

    /**
     * {@code GET  /companion-diagnostic-devices} : get all the companionDiagnosticDevices.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of companionDiagnosticDevices in body.
     */
    @GetMapping("/companion-diagnostic-devices")
    public List<CompanionDiagnosticDevice> getAllCompanionDiagnosticDevices(
        @RequestParam(required = false, defaultValue = "false") boolean eagerload
    ) {
        log.debug("REST request to get all CompanionDiagnosticDevices");
        return companionDiagnosticDeviceService.findAll();
    }

    /**
     * {@code GET  /companion-diagnostic-devices/:id} : get the "id" companionDiagnosticDevice.
     *
     * @param id the id of the companionDiagnosticDevice to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the companionDiagnosticDevice, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/companion-diagnostic-devices/{id}")
    public ResponseEntity<CompanionDiagnosticDevice> getCompanionDiagnosticDevice(@PathVariable Long id) {
        log.debug("REST request to get CompanionDiagnosticDevice : {}", id);
        Optional<CompanionDiagnosticDevice> companionDiagnosticDevice = companionDiagnosticDeviceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(companionDiagnosticDevice);
    }

    /**
     * {@code DELETE  /companion-diagnostic-devices/:id} : delete the "id" companionDiagnosticDevice.
     *
     * @param id the id of the companionDiagnosticDevice to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/companion-diagnostic-devices/{id}")
    public ResponseEntity<Void> deleteCompanionDiagnosticDevice(@PathVariable Long id) {
        log.debug("REST request to delete CompanionDiagnosticDevice : {}", id);
        companionDiagnosticDeviceService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
