package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.DrugPriority;
import org.mskcc.oncokb.curation.repository.DrugPriorityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link DrugPriority}.
 */
@Service
@Transactional
public class DrugPriorityService {

    private final Logger log = LoggerFactory.getLogger(DrugPriorityService.class);

    private final DrugPriorityRepository drugPriorityRepository;

    public DrugPriorityService(DrugPriorityRepository drugPriorityRepository) {
        this.drugPriorityRepository = drugPriorityRepository;
    }

    /**
     * Save a drugPriority.
     *
     * @param drugPriority the entity to save.
     * @return the persisted entity.
     */
    public DrugPriority save(DrugPriority drugPriority) {
        log.debug("Request to save DrugPriority : {}", drugPriority);
        return drugPriorityRepository.save(drugPriority);
    }

    /**
     * Partially update a drugPriority.
     *
     * @param drugPriority the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DrugPriority> partialUpdate(DrugPriority drugPriority) {
        log.debug("Request to partially update DrugPriority : {}", drugPriority);

        return drugPriorityRepository
            .findById(drugPriority.getId())
            .map(existingDrugPriority -> {
                if (drugPriority.getPriority() != null) {
                    existingDrugPriority.setPriority(drugPriority.getPriority());
                }

                return existingDrugPriority;
            })
            .map(drugPriorityRepository::save);
    }

    /**
     * Get all the drugPriorities.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<DrugPriority> findAll() {
        log.debug("Request to get all DrugPriorities");
        return drugPriorityRepository.findAll();
    }

    /**
     * Get one drugPriority by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DrugPriority> findOne(Long id) {
        log.debug("Request to get DrugPriority : {}", id);
        return drugPriorityRepository.findById(id);
    }

    /**
     * Delete the drugPriority by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete DrugPriority : {}", id);
        drugPriorityRepository.deleteById(id);
    }
}
