package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.ClinicalTrialArm;
import org.mskcc.oncokb.curation.repository.ClinicalTrialArmRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link ClinicalTrialArm}.
 */
@Service
@Transactional
public class ClinicalTrialArmService {

    private final Logger log = LoggerFactory.getLogger(ClinicalTrialArmService.class);

    private final ClinicalTrialArmRepository clinicalTrialArmRepository;

    public ClinicalTrialArmService(ClinicalTrialArmRepository clinicalTrialArmRepository) {
        this.clinicalTrialArmRepository = clinicalTrialArmRepository;
    }

    /**
     * Save a clinicalTrialArm.
     *
     * @param clinicalTrialArm the entity to save.
     * @return the persisted entity.
     */
    public ClinicalTrialArm save(ClinicalTrialArm clinicalTrialArm) {
        log.debug("Request to save ClinicalTrialArm : {}", clinicalTrialArm);
        return clinicalTrialArmRepository.save(clinicalTrialArm);
    }

    /**
     * Partially update a clinicalTrialArm.
     *
     * @param clinicalTrialArm the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ClinicalTrialArm> partialUpdate(ClinicalTrialArm clinicalTrialArm) {
        log.debug("Request to partially update ClinicalTrialArm : {}", clinicalTrialArm);

        return clinicalTrialArmRepository
            .findById(clinicalTrialArm.getId())
            .map(existingClinicalTrialArm -> {
                if (clinicalTrialArm.getName() != null) {
                    existingClinicalTrialArm.setName(clinicalTrialArm.getName());
                }

                return existingClinicalTrialArm;
            })
            .map(clinicalTrialArmRepository::save);
    }

    /**
     * Get all the clinicalTrialArms.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ClinicalTrialArm> findAll(Pageable pageable) {
        log.debug("Request to get all ClinicalTrialArms");
        return clinicalTrialArmRepository.findAll(pageable);
    }

    /**
     * Get all the clinicalTrialArms with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ClinicalTrialArm> findAllWithEagerRelationships(Pageable pageable) {
        return clinicalTrialArmRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one clinicalTrialArm by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ClinicalTrialArm> findOne(Long id) {
        log.debug("Request to get ClinicalTrialArm : {}", id);
        return clinicalTrialArmRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the clinicalTrialArm by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete ClinicalTrialArm : {}", id);
        clinicalTrialArmRepository.deleteById(id);
    }
}
