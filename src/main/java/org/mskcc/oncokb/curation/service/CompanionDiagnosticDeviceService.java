package org.mskcc.oncokb.curation.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.repository.CompanionDiagnosticDeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link CompanionDiagnosticDevice}.
 */
@Service
@Transactional
public class CompanionDiagnosticDeviceService {

    private final Logger log = LoggerFactory.getLogger(CompanionDiagnosticDeviceService.class);

    private final CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository;

    public CompanionDiagnosticDeviceService(CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository) {
        this.companionDiagnosticDeviceRepository = companionDiagnosticDeviceRepository;
    }

    /**
     * Save a companionDiagnosticDevice.
     *
     * @param companionDiagnosticDevice the entity to save.
     * @return the persisted entity.
     */
    public CompanionDiagnosticDevice save(CompanionDiagnosticDevice companionDiagnosticDevice) {
        log.debug("Request to save CompanionDiagnosticDevice : {}", companionDiagnosticDevice);
        companionDiagnosticDevice.setLastUpdated(Instant.now());
        return companionDiagnosticDeviceRepository.save(companionDiagnosticDevice);
    }

    /**
     * Partially update a companionDiagnosticDevice.
     *
     * @param companionDiagnosticDevice the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CompanionDiagnosticDevice> partialUpdate(CompanionDiagnosticDevice companionDiagnosticDevice) {
        log.debug("Request to partially update CompanionDiagnosticDevice : {}", companionDiagnosticDevice);

        return companionDiagnosticDeviceRepository
            .findById(companionDiagnosticDevice.getId())
            .map(existingCompanionDiagnosticDevice -> {
                if (companionDiagnosticDevice.getName() != null) {
                    existingCompanionDiagnosticDevice.setName(companionDiagnosticDevice.getName());
                }
                if (companionDiagnosticDevice.getManufacturer() != null) {
                    existingCompanionDiagnosticDevice.setManufacturer(companionDiagnosticDevice.getManufacturer());
                }
                if (companionDiagnosticDevice.getIndicationDetails() != null) {
                    existingCompanionDiagnosticDevice.setIndicationDetails(companionDiagnosticDevice.getIndicationDetails());
                }
                if (companionDiagnosticDevice.getPlatformType() != null) {
                    existingCompanionDiagnosticDevice.setPlatformType(companionDiagnosticDevice.getPlatformType());
                }
                if (companionDiagnosticDevice.getLastUpdated() != null) {
                    existingCompanionDiagnosticDevice.setLastUpdated(companionDiagnosticDevice.getLastUpdated());
                } else {
                    existingCompanionDiagnosticDevice.setLastUpdated(Instant.now());
                }

                return existingCompanionDiagnosticDevice;
            })
            .map(companionDiagnosticDeviceRepository::save);
    }

    /**
     * Get all the companionDiagnosticDevices.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<CompanionDiagnosticDevice> findAll() {
        log.debug("Request to get all CompanionDiagnosticDevices");
        return companionDiagnosticDeviceRepository.findAllWithEagerRelationships();
    }

    /**
     * Get one companionDiagnosticDevice by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CompanionDiagnosticDevice> findOne(Long id) {
        log.debug("Request to get CompanionDiagnosticDevice : {}", id);
        return companionDiagnosticDeviceRepository.findOneWithEagerRelationships(id);
    }

    @Transactional(readOnly = true)
    public Optional<CompanionDiagnosticDevice> findByName(String name) {
        return companionDiagnosticDeviceRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public List<CompanionDiagnosticDevice> findByNameAndManufacturer(String name, String manufacturer) {
        return companionDiagnosticDeviceRepository.findByNameIgnoreCaseAndManufacturerIgnoreCase(name, manufacturer);
    }

    /**
     * Delete the companionDiagnosticDevice by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete CompanionDiagnosticDevice : {}", id);
        companionDiagnosticDeviceRepository.deleteById(id);
    }
}
