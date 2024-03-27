package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.TreatmentPriority;
import org.mskcc.oncokb.curation.repository.TreatmentPriorityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link TreatmentPriority}.
 */
@Service
@Transactional
public class TreatmentPriorityService {

    private final Logger log = LoggerFactory.getLogger(TreatmentPriorityService.class);

    private final TreatmentPriorityRepository treatmentPriorityRepository;

    public TreatmentPriorityService(TreatmentPriorityRepository treatmentPriorityRepository) {
        this.treatmentPriorityRepository = treatmentPriorityRepository;
    }

    /**
     * Save a treatmentPriority.
     *
     * @param treatmentPriority the entity to save.
     * @return the persisted entity.
     */
    public TreatmentPriority save(TreatmentPriority treatmentPriority) {
        log.debug("Request to save TreatmentPriority : {}", treatmentPriority);
        return treatmentPriorityRepository.save(treatmentPriority);
    }

    /**
     * Partially update a treatmentPriority.
     *
     * @param treatmentPriority the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TreatmentPriority> partialUpdate(TreatmentPriority treatmentPriority) {
        log.debug("Request to partially update TreatmentPriority : {}", treatmentPriority);

        return treatmentPriorityRepository
            .findById(treatmentPriority.getId())
            .map(existingTreatmentPriority -> {
                if (treatmentPriority.getPriority() != null) {
                    existingTreatmentPriority.setPriority(treatmentPriority.getPriority());
                }

                return existingTreatmentPriority;
            })
            .map(treatmentPriorityRepository::save);
    }

    /**
     * Get all the treatmentPriorities.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<TreatmentPriority> findAll() {
        log.debug("Request to get all TreatmentPriorities");
        return treatmentPriorityRepository.findAll();
    }

    /**
     * Get one treatmentPriority by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TreatmentPriority> findOne(Long id) {
        log.debug("Request to get TreatmentPriority : {}", id);
        return treatmentPriorityRepository.findById(id);
    }

    /**
     * Delete the treatmentPriority by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete TreatmentPriority : {}", id);
        treatmentPriorityRepository.deleteById(id);
    }
}
