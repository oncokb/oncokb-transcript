package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.mskcc.oncokb.curation.repository.BiomarkerAssociationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link BiomarkerAssociation}.
 */
@Service
@Transactional
public class BiomarkerAssociationService {

    private final Logger log = LoggerFactory.getLogger(BiomarkerAssociationService.class);

    private final BiomarkerAssociationRepository biomarkerAssociationRepository;

    public BiomarkerAssociationService(BiomarkerAssociationRepository biomarkerAssociationRepository) {
        this.biomarkerAssociationRepository = biomarkerAssociationRepository;
    }

    /**
     * Save a biomarkerAssociation.
     *
     * @param biomarkerAssociation the entity to save.
     * @return the persisted entity.
     */
    public BiomarkerAssociation save(BiomarkerAssociation biomarkerAssociation) {
        log.debug("Request to save BiomarkerAssociation : {}", biomarkerAssociation);
        return biomarkerAssociationRepository.save(biomarkerAssociation);
    }

    /**
     * Partially update a biomarkerAssociation.
     *
     * @param biomarkerAssociation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<BiomarkerAssociation> partialUpdate(BiomarkerAssociation biomarkerAssociation) {
        log.debug("Request to partially update BiomarkerAssociation : {}", biomarkerAssociation);

        return biomarkerAssociationRepository
            .findById(biomarkerAssociation.getId())
            .map(existingBiomarkerAssociation -> {
                return existingBiomarkerAssociation;
            })
            .map(biomarkerAssociationRepository::save);
    }

    /**
     * Get all the biomarkerAssociations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<BiomarkerAssociation> findAll() {
        log.debug("Request to get all BiomarkerAssociations");
        return biomarkerAssociationRepository.findAll();
    }

    /**
     * Get one biomarkerAssociation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<BiomarkerAssociation> findOne(Long id) {
        log.debug("Request to get BiomarkerAssociation : {}", id);
        return biomarkerAssociationRepository.findById(id);
    }

    public List<BiomarkerAssociation> findByCompanionDiagnosticDeviceId(Long id) {
        return biomarkerAssociationRepository.findDistinctIdByFdaSubmissions_CompanionDiagnosticDeviceId(id);
    }

    /**
     * Delete the biomarkerAssociation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete BiomarkerAssociation : {}", id);
        biomarkerAssociationRepository.deleteById(id);
    }
}
