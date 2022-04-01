package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.FdaSubmissionType;
import org.mskcc.oncokb.curation.repository.FdaSubmissionTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link FdaSubmissionType}.
 */
@Service
@Transactional
public class FdaSubmissionTypeService {

    private final Logger log = LoggerFactory.getLogger(FdaSubmissionTypeService.class);

    private final FdaSubmissionTypeRepository fdaSubmissionTypeRepository;

    public FdaSubmissionTypeService(FdaSubmissionTypeRepository fdaSubmissionTypeRepository) {
        this.fdaSubmissionTypeRepository = fdaSubmissionTypeRepository;
    }

    /**
     * Save a fdaSubmissionType.
     *
     * @param fdaSubmissionType the entity to save.
     * @return the persisted entity.
     */
    public FdaSubmissionType save(FdaSubmissionType fdaSubmissionType) {
        log.debug("Request to save FdaSubmissionType : {}", fdaSubmissionType);
        return fdaSubmissionTypeRepository.save(fdaSubmissionType);
    }

    /**
     * Partially update a fdaSubmissionType.
     *
     * @param fdaSubmissionType the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<FdaSubmissionType> partialUpdate(FdaSubmissionType fdaSubmissionType) {
        log.debug("Request to partially update FdaSubmissionType : {}", fdaSubmissionType);

        return fdaSubmissionTypeRepository
            .findById(fdaSubmissionType.getId())
            .map(existingFdaSubmissionType -> {
                if (fdaSubmissionType.getKey() != null) {
                    existingFdaSubmissionType.setKey(fdaSubmissionType.getKey());
                }
                if (fdaSubmissionType.getName() != null) {
                    existingFdaSubmissionType.setName(fdaSubmissionType.getName());
                }
                if (fdaSubmissionType.getShortName() != null) {
                    existingFdaSubmissionType.setShortName(fdaSubmissionType.getShortName());
                }
                if (fdaSubmissionType.getDescription() != null) {
                    existingFdaSubmissionType.setDescription(fdaSubmissionType.getDescription());
                }

                return existingFdaSubmissionType;
            })
            .map(fdaSubmissionTypeRepository::save);
    }

    /**
     * Get all the fdaSubmissionTypes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<FdaSubmissionType> findAll() {
        log.debug("Request to get all FdaSubmissionTypes");
        return fdaSubmissionTypeRepository.findAll();
    }

    /**
     * Get one fdaSubmissionType by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<FdaSubmissionType> findOne(Long id) {
        log.debug("Request to get FdaSubmissionType : {}", id);
        return fdaSubmissionTypeRepository.findById(id);
    }

    /**
     * Delete the fdaSubmissionType by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete FdaSubmissionType : {}", id);
        fdaSubmissionTypeRepository.deleteById(id);
    }
}
