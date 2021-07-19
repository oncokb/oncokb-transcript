package org.mskcc.oncokb.transcript.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.ClinicalTrial;
import org.mskcc.oncokb.transcript.repository.ClinicalTrialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link ClinicalTrial}.
 */
@Service
@Transactional
public class ClinicalTrialService {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialService.class);

    private final ClinicalTrialRepository clinicalTrialRepository;

    public ClinicalTrialService(ClinicalTrialRepository clinicalTrialRepository) {
        this.clinicalTrialRepository = clinicalTrialRepository;
    }

    /**
     * Save a clinicalTrial.
     *
     * @param clinicalTrial the entity to save.
     * @return the persisted entity.
     */
    public ClinicalTrial save(ClinicalTrial clinicalTrial) {
        log.debug("Request to save ClinicalTrial : {}", clinicalTrial);
        return clinicalTrialRepository.save(clinicalTrial);
    }

    /**
     * Partially update a clinicalTrial.
     *
     * @param clinicalTrial the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ClinicalTrial> partialUpdate(ClinicalTrial clinicalTrial) {
        log.debug("Request to partially update ClinicalTrial : {}", clinicalTrial);

        return clinicalTrialRepository
            .findById(clinicalTrial.getId())
            .map(
                existingClinicalTrial -> {
                    if (clinicalTrial.getNctId() != null) {
                        existingClinicalTrial.setNctId(clinicalTrial.getNctId());
                    }
                    if (clinicalTrial.getPhase() != null) {
                        existingClinicalTrial.setPhase(clinicalTrial.getPhase());
                    }
                    if (clinicalTrial.getPrincipalInvestigator() != null) {
                        existingClinicalTrial.setPrincipalInvestigator(clinicalTrial.getPrincipalInvestigator());
                    }
                    if (clinicalTrial.getStatus() != null) {
                        existingClinicalTrial.setStatus(clinicalTrial.getStatus());
                    }
                    if (clinicalTrial.getStatusLastUpdated() != null) {
                        existingClinicalTrial.setStatusLastUpdated(clinicalTrial.getStatusLastUpdated());
                    }
                    if (clinicalTrial.getBriefTitle() != null) {
                        existingClinicalTrial.setBriefTitle(clinicalTrial.getBriefTitle());
                    }

                    return existingClinicalTrial;
                }
            )
            .map(clinicalTrialRepository::save);
    }

    /**
     * Get all the clinicalTrials.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<ClinicalTrial> findAll() {
        log.debug("Request to get all ClinicalTrials");
        return clinicalTrialRepository.findAllWithEagerRelationships();
    }

    /**
     * Get all the clinicalTrials with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ClinicalTrial> findAllWithEagerRelationships(Pageable pageable) {
        return clinicalTrialRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one clinicalTrial by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ClinicalTrial> findOne(Long id) {
        log.debug("Request to get ClinicalTrial : {}", id);
        return clinicalTrialRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the clinicalTrial by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete ClinicalTrial : {}", id);
        clinicalTrialRepository.deleteById(id);
    }
}
