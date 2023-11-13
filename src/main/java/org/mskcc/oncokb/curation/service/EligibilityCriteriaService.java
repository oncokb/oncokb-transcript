package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.EligibilityCriteria;
import org.mskcc.oncokb.curation.repository.EligibilityCriteriaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link EligibilityCriteria}.
 */
@Service
@Transactional
public class EligibilityCriteriaService {

    private final Logger log = LoggerFactory.getLogger(EligibilityCriteriaService.class);

    private final EligibilityCriteriaRepository eligibilityCriteriaRepository;

    public EligibilityCriteriaService(EligibilityCriteriaRepository eligibilityCriteriaRepository) {
        this.eligibilityCriteriaRepository = eligibilityCriteriaRepository;
    }

    /**
     * Save a eligibilityCriteria.
     *
     * @param eligibilityCriteria the entity to save.
     * @return the persisted entity.
     */
    public EligibilityCriteria save(EligibilityCriteria eligibilityCriteria) {
        log.debug("Request to save EligibilityCriteria : {}", eligibilityCriteria);
        return eligibilityCriteriaRepository.save(eligibilityCriteria);
    }

    /**
     * Partially update a eligibilityCriteria.
     *
     * @param eligibilityCriteria the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<EligibilityCriteria> partialUpdate(EligibilityCriteria eligibilityCriteria) {
        log.debug("Request to partially update EligibilityCriteria : {}", eligibilityCriteria);

        return eligibilityCriteriaRepository
            .findById(eligibilityCriteria.getId())
            .map(existingEligibilityCriteria -> {
                if (eligibilityCriteria.getType() != null) {
                    existingEligibilityCriteria.setType(eligibilityCriteria.getType());
                }
                if (eligibilityCriteria.getPriority() != null) {
                    existingEligibilityCriteria.setPriority(eligibilityCriteria.getPriority());
                }
                if (eligibilityCriteria.getCriteria() != null) {
                    existingEligibilityCriteria.setCriteria(eligibilityCriteria.getCriteria());
                }

                return existingEligibilityCriteria;
            })
            .map(eligibilityCriteriaRepository::save);
    }

    /**
     * Get all the eligibilityCriteria.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<EligibilityCriteria> findAll(Pageable pageable) {
        log.debug("Request to get all EligibilityCriteria");
        return eligibilityCriteriaRepository.findAll(pageable);
    }

    /**
     * Get all the eligibilityCriteria with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<EligibilityCriteria> findAllWithEagerRelationships(Pageable pageable) {
        return eligibilityCriteriaRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one eligibilityCriteria by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<EligibilityCriteria> findOne(Long id) {
        log.debug("Request to get EligibilityCriteria : {}", id);
        return eligibilityCriteriaRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the eligibilityCriteria by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete EligibilityCriteria : {}", id);
        eligibilityCriteriaRepository.deleteById(id);
    }
}
