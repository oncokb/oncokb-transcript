package org.mskcc.oncokb.curation.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.DeviceUsageIndication;
import org.mskcc.oncokb.curation.repository.DeviceUsageIndicationRepository;
import org.mskcc.oncokb.curation.service.DeviceUsageIndicationService;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.DeviceUsageIndication}.
 */
@RestController
@RequestMapping("/api")
public class DeviceUsageIndicationResource {

    private final Logger log = LoggerFactory.getLogger(DeviceUsageIndicationResource.class);

    private static final String ENTITY_NAME = "deviceUsageIndication";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DeviceUsageIndicationService deviceUsageIndicationService;

    private final DeviceUsageIndicationRepository deviceUsageIndicationRepository;

    public DeviceUsageIndicationResource(
        DeviceUsageIndicationService deviceUsageIndicationService,
        DeviceUsageIndicationRepository deviceUsageIndicationRepository
    ) {
        this.deviceUsageIndicationService = deviceUsageIndicationService;
        this.deviceUsageIndicationRepository = deviceUsageIndicationRepository;
    }

    /**
     * {@code POST  /device-usage-indications} : Create a new deviceUsageIndication.
     *
     * @param deviceUsageIndication the deviceUsageIndication to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new deviceUsageIndication, or with status {@code 400 (Bad Request)} if the deviceUsageIndication has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/device-usage-indications")
    public ResponseEntity<DeviceUsageIndication> createDeviceUsageIndication(@RequestBody DeviceUsageIndication deviceUsageIndication)
        throws URISyntaxException {
        log.debug("REST request to save DeviceUsageIndication : {}", deviceUsageIndication);
        if (deviceUsageIndication.getId() != null) {
            throw new BadRequestAlertException("A new deviceUsageIndication cannot already have an ID", ENTITY_NAME, "idexists");
        }
        DeviceUsageIndication result = deviceUsageIndicationService.save(deviceUsageIndication);
        return ResponseEntity
            .created(new URI("/api/device-usage-indications/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /device-usage-indications/:id} : Updates an existing deviceUsageIndication.
     *
     * @param id the id of the deviceUsageIndication to save.
     * @param deviceUsageIndication the deviceUsageIndication to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated deviceUsageIndication,
     * or with status {@code 400 (Bad Request)} if the deviceUsageIndication is not valid,
     * or with status {@code 500 (Internal Server Error)} if the deviceUsageIndication couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/device-usage-indications/{id}")
    public ResponseEntity<DeviceUsageIndication> updateDeviceUsageIndication(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DeviceUsageIndication deviceUsageIndication
    ) throws URISyntaxException {
        log.debug("REST request to update DeviceUsageIndication : {}, {}", id, deviceUsageIndication);
        if (deviceUsageIndication.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, deviceUsageIndication.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!deviceUsageIndicationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        DeviceUsageIndication result = deviceUsageIndicationService.save(deviceUsageIndication);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, deviceUsageIndication.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /device-usage-indications/:id} : Partial updates given fields of an existing deviceUsageIndication, field will ignore if it is null
     *
     * @param id the id of the deviceUsageIndication to save.
     * @param deviceUsageIndication the deviceUsageIndication to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated deviceUsageIndication,
     * or with status {@code 400 (Bad Request)} if the deviceUsageIndication is not valid,
     * or with status {@code 404 (Not Found)} if the deviceUsageIndication is not found,
     * or with status {@code 500 (Internal Server Error)} if the deviceUsageIndication couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/device-usage-indications/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DeviceUsageIndication> partialUpdateDeviceUsageIndication(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DeviceUsageIndication deviceUsageIndication
    ) throws URISyntaxException {
        log.debug("REST request to partial update DeviceUsageIndication partially : {}, {}", id, deviceUsageIndication);
        if (deviceUsageIndication.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, deviceUsageIndication.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!deviceUsageIndicationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DeviceUsageIndication> result = deviceUsageIndicationService.partialUpdate(deviceUsageIndication);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, deviceUsageIndication.getId().toString())
        );
    }

    /**
     * {@code GET  /device-usage-indications} : get all the deviceUsageIndications.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of deviceUsageIndications in body.
     */
    @GetMapping("/device-usage-indications")
    public List<DeviceUsageIndication> getAllDeviceUsageIndications() {
        log.debug("REST request to get all DeviceUsageIndications");
        return deviceUsageIndicationService.findAll();
    }

    /**
     * {@code GET  /device-usage-indications/:id} : get the "id" deviceUsageIndication.
     *
     * @param id the id of the deviceUsageIndication to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the deviceUsageIndication, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/device-usage-indications/{id}")
    public ResponseEntity<DeviceUsageIndication> getDeviceUsageIndication(@PathVariable Long id) {
        log.debug("REST request to get DeviceUsageIndication : {}", id);
        Optional<DeviceUsageIndication> deviceUsageIndication = deviceUsageIndicationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(deviceUsageIndication);
    }

    /**
     * {@code DELETE  /device-usage-indications/:id} : delete the "id" deviceUsageIndication.
     *
     * @param id the id of the deviceUsageIndication to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/device-usage-indications/{id}")
    public ResponseEntity<Void> deleteDeviceUsageIndication(@PathVariable Long id) {
        log.debug("REST request to delete DeviceUsageIndication : {}", id);
        deviceUsageIndicationService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
