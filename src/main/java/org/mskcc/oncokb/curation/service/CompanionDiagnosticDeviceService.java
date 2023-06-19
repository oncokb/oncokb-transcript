package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.repository.CompanionDiagnosticDeviceRepository;
import org.mskcc.oncokb.curation.repository.FdaSubmissionTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link CompanionDiagnosticDevice}.
 */
@Service
public class CompanionDiagnosticDeviceService {

    private final Logger log = LoggerFactory.getLogger(CompanionDiagnosticDeviceService.class);

    private final CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository;

    private final FdaSubmissionTypeRepository fdaSubmissionTypeRepository;

    public CompanionDiagnosticDeviceService(
        CompanionDiagnosticDeviceRepository companionDiagnosticDeviceRepository,
        FdaSubmissionTypeRepository fdaSubmissionTypeRepository
    ) {
        this.companionDiagnosticDeviceRepository = companionDiagnosticDeviceRepository;
        this.fdaSubmissionTypeRepository = fdaSubmissionTypeRepository;
    }

    /**
     * Save a companionDiagnosticDevice.
     *
     * @param companionDiagnosticDevice the entity to save.
     * @return the persisted entity.
     */
    public CompanionDiagnosticDevice save(CompanionDiagnosticDevice companionDiagnosticDevice) {
        log.debug("Request to save CompanionDiagnosticDevice : {}", companionDiagnosticDevice);
        CompanionDiagnosticDevice result = companionDiagnosticDeviceRepository.save(companionDiagnosticDevice);
        companionDiagnosticDevice.setId(result.getId());
        return result;
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

                return existingCompanionDiagnosticDevice;
            })
            .map(companionDiagnosticDeviceRepository::save)
            .map(savedCompanionDiagnosticDevice -> {
                return savedCompanionDiagnosticDevice;
            });
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
     * Get all the companionDiagnosticDevices with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<CompanionDiagnosticDevice> findAllWithEagerRelationships(Pageable pageable) {
        return companionDiagnosticDeviceRepository.findAllWithEagerRelationships(pageable);
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
