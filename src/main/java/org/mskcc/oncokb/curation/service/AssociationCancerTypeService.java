package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.AssociationCancerType;
import org.mskcc.oncokb.curation.repository.AssociationCancerTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link AssociationCancerType}.
 */
@Service
@Transactional
public class AssociationCancerTypeService {

    private final Logger log = LoggerFactory.getLogger(AssociationCancerTypeService.class);

    private final AssociationCancerTypeRepository associationCancerTypeRepository;

    public AssociationCancerTypeService(AssociationCancerTypeRepository associationCancerTypeRepository) {
        this.associationCancerTypeRepository = associationCancerTypeRepository;
    }

    /**
     * Save a associationCancerType.
     *
     * @param associationCancerType the entity to save.
     * @return the persisted entity.
     */
    public AssociationCancerType save(AssociationCancerType associationCancerType) {
        log.debug("Request to save AssociationCancerType : {}", associationCancerType);
        return associationCancerTypeRepository.save(associationCancerType);
    }

    /**
     * Partially update a associationCancerType.
     *
     * @param associationCancerType the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AssociationCancerType> partialUpdate(AssociationCancerType associationCancerType) {
        log.debug("Request to partially update AssociationCancerType : {}", associationCancerType);

        return associationCancerTypeRepository
            .findById(associationCancerType.getId())
            .map(existingAssociationCancerType -> {
                if (associationCancerType.getRelation() != null) {
                    existingAssociationCancerType.setRelation(associationCancerType.getRelation());
                }

                return existingAssociationCancerType;
            })
            .map(associationCancerTypeRepository::save);
    }

    /**
     * Get all the associationCancerTypes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AssociationCancerType> findAll() {
        log.debug("Request to get all AssociationCancerTypes");
        return associationCancerTypeRepository.findAll();
    }

    /**
     * Get one associationCancerType by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AssociationCancerType> findOne(Long id) {
        log.debug("Request to get AssociationCancerType : {}", id);
        return associationCancerTypeRepository.findById(id);
    }

    /**
     * Delete the associationCancerType by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete AssociationCancerType : {}", id);
        associationCancerTypeRepository.deleteById(id);
    }
}
