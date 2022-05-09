package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.DeviceUsageIndication;
import org.mskcc.oncokb.curation.repository.DeviceUsageIndicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link DeviceUsageIndication}.
 */
@Service
@Transactional
public class DeviceUsageIndicationService {

    private final Logger log = LoggerFactory.getLogger(DeviceUsageIndicationService.class);

    private final DeviceUsageIndicationRepository deviceUsageIndicationRepository;

    public DeviceUsageIndicationService(DeviceUsageIndicationRepository deviceUsageIndicationRepository) {
        this.deviceUsageIndicationRepository = deviceUsageIndicationRepository;
    }

    /**
     * Save a deviceUsageIndication.
     *
     * @param deviceUsageIndication the entity to save.
     * @return the persisted entity.
     */
    public DeviceUsageIndication save(DeviceUsageIndication deviceUsageIndication) {
        log.debug("Request to save DeviceUsageIndication : {}", deviceUsageIndication);
        return deviceUsageIndicationRepository.save(deviceUsageIndication);
    }

    /**
     * Partially update a deviceUsageIndication.
     *
     * @param deviceUsageIndication the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DeviceUsageIndication> partialUpdate(DeviceUsageIndication deviceUsageIndication) {
        log.debug("Request to partially update DeviceUsageIndication : {}", deviceUsageIndication);

        return deviceUsageIndicationRepository
            .findById(deviceUsageIndication.getId())
            .map(existingDeviceUsageIndication -> {
                return existingDeviceUsageIndication;
            })
            .map(deviceUsageIndicationRepository::save);
    }

    /**
     * Get all the deviceUsageIndications.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<DeviceUsageIndication> findAll() {
        log.debug("Request to get all DeviceUsageIndications");
        return deviceUsageIndicationRepository.findAll();
    }

    /**
     * Get one deviceUsageIndication by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DeviceUsageIndication> findOne(Long id) {
        log.debug("Request to get DeviceUsageIndication : {}", id);
        return deviceUsageIndicationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<DeviceUsageIndication> findByFdaSubmissionId(Long id) {
        log.debug("Request to get DeviceUsageIndication : {}", id);
        return deviceUsageIndicationRepository.findByFdaSubmissionId(id);
    }

    /**
     * Delete the deviceUsageIndication by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete DeviceUsageIndication : {}", id);
        deviceUsageIndicationRepository.deleteById(id);
    }
}
