package org.mskcc.oncokb.curation.service;

import static org.elasticsearch.index.query.QueryBuilders.*;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
import org.mskcc.oncokb.curation.repository.ClinicalTrialsGovConditionRepository;
import org.mskcc.oncokb.curation.repository.search.ClinicalTrialsGovConditionSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link ClinicalTrialsGovCondition}.
 */
@Service
@Transactional
public class ClinicalTrialsGovConditionService {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialsGovConditionService.class);

    private final ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository;

    private final ClinicalTrialsGovConditionSearchRepository clinicalTrialsGovConditionSearchRepository;

    public ClinicalTrialsGovConditionService(
        ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository,
        ClinicalTrialsGovConditionSearchRepository clinicalTrialsGovConditionSearchRepository
    ) {
        this.clinicalTrialsGovConditionRepository = clinicalTrialsGovConditionRepository;
        this.clinicalTrialsGovConditionSearchRepository = clinicalTrialsGovConditionSearchRepository;
    }

    /**
     * Save a clinicalTrialsGovCondition.
     *
     * @param clinicalTrialsGovCondition the entity to save.
     * @return the persisted entity.
     */
    public ClinicalTrialsGovCondition save(ClinicalTrialsGovCondition clinicalTrialsGovCondition) {
        log.debug("Request to save ClinicalTrialsGovCondition : {}", clinicalTrialsGovCondition);
        ClinicalTrialsGovCondition result = clinicalTrialsGovConditionRepository.save(clinicalTrialsGovCondition);
        clinicalTrialsGovConditionSearchRepository.save(result);
        return result;
    }

    /**
     * Partially update a clinicalTrialsGovCondition.
     *
     * @param clinicalTrialsGovCondition the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ClinicalTrialsGovCondition> partialUpdate(ClinicalTrialsGovCondition clinicalTrialsGovCondition) {
        log.debug("Request to partially update ClinicalTrialsGovCondition : {}", clinicalTrialsGovCondition);

        return clinicalTrialsGovConditionRepository
            .findById(clinicalTrialsGovCondition.getId())
            .map(existingClinicalTrialsGovCondition -> {
                if (clinicalTrialsGovCondition.getName() != null) {
                    existingClinicalTrialsGovCondition.setName(clinicalTrialsGovCondition.getName());
                }

                return existingClinicalTrialsGovCondition;
            })
            .map(clinicalTrialsGovConditionRepository::save)
            .map(savedClinicalTrialsGovCondition -> {
                clinicalTrialsGovConditionSearchRepository.save(savedClinicalTrialsGovCondition);

                return savedClinicalTrialsGovCondition;
            });
    }

    /**
     * Get all the clinicalTrialsGovConditions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ClinicalTrialsGovCondition> findAll(Pageable pageable) {
        log.debug("Request to get all ClinicalTrialsGovConditions");
        return clinicalTrialsGovConditionRepository.findAll(pageable);
    }

    /**
     * Get all the clinicalTrialsGovConditions with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ClinicalTrialsGovCondition> findAllWithEagerRelationships(Pageable pageable) {
        return clinicalTrialsGovConditionRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one clinicalTrialsGovCondition by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ClinicalTrialsGovCondition> findOne(Long id) {
        log.debug("Request to get ClinicalTrialsGovCondition : {}", id);
        return clinicalTrialsGovConditionRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the clinicalTrialsGovCondition by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete ClinicalTrialsGovCondition : {}", id);
        clinicalTrialsGovConditionRepository.deleteById(id);
        clinicalTrialsGovConditionSearchRepository.deleteById(id);
    }

    /**
     * Search for the clinicalTrialsGovCondition corresponding to the query.
     *
     * @param query the query of the search.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ClinicalTrialsGovCondition> search(String query, Pageable pageable) {
        log.debug("Request to search for a page of ClinicalTrialsGovConditions for query {}", query);
        return clinicalTrialsGovConditionSearchRepository.search(query, pageable);
    }
}
