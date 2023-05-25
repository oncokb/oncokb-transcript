package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.SpecimenType;
import org.mskcc.oncokb.curation.repository.SpecimenTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link SpecimenType}.
 */
@Service
@Transactional
public class SpecimenTypeService {

    private final Logger log = LoggerFactory.getLogger(SpecimenTypeService.class);

    private final SpecimenTypeRepository specimenTypeRepository;

    public SpecimenTypeService(SpecimenTypeRepository specimenTypeRepository) {
        this.specimenTypeRepository = specimenTypeRepository;
    }

    /**
     * Save a specimenType.
     *
     * @param specimenType the entity to save.
     * @return the persisted entity.
     */
    public SpecimenType save(SpecimenType specimenType) {
        log.debug("Request to save SpecimenType : {}", specimenType);
        return specimenTypeRepository.save(specimenType);
    }

    /**
     * Partially update a specimenType.
     *
     * @param specimenType the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SpecimenType> partialUpdate(SpecimenType specimenType) {
        log.debug("Request to partially update SpecimenType : {}", specimenType);

        return specimenTypeRepository
            .findById(specimenType.getId())
            .map(existingSpecimenType -> {
                if (specimenType.getType() != null) {
                    existingSpecimenType.setType(specimenType.getType());
                }
                if (specimenType.getName() != null) {
                    existingSpecimenType.setName(specimenType.getName());
                }

                return existingSpecimenType;
            })
            .map(specimenTypeRepository::save);
    }

    /**
     * Get all the specimenTypes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SpecimenType> findAll() {
        log.debug("Request to get all SpecimenTypes");
        return specimenTypeRepository.findAll();
    }

    /**
     * Get one specimenType by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SpecimenType> findOne(Long id) {
        log.debug("Request to get SpecimenType : {}", id);
        return specimenTypeRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<SpecimenType> findOneByType(String type) {
        return specimenTypeRepository.findOneByType(type);
    }

    /**
     * Delete the specimenType by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete SpecimenType : {}", id);
        specimenTypeRepository.deleteById(id);
    }
}
