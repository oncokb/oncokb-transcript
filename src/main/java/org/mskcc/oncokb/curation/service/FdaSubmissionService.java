package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.FdaSubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link FdaSubmission}.
 */
@Service
@Transactional
public class FdaSubmissionService {

    private final Logger log = LoggerFactory.getLogger(FdaSubmissionService.class);

    private final FdaSubmissionRepository fdaSubmissionRepository;

    public FdaSubmissionService(FdaSubmissionRepository fdaSubmissionRepository) {
        this.fdaSubmissionRepository = fdaSubmissionRepository;
    }

    /**
     * Save a fdaSubmission.
     *
     * @param fdaSubmission the entity to save.
     * @return the persisted entity.
     */
    public FdaSubmission save(FdaSubmission fdaSubmission) {
        log.debug("Request to save FdaSubmission : {}", fdaSubmission);
        return fdaSubmissionRepository.save(fdaSubmission);
    }

    /**
     * Partially update a fdaSubmission.
     *
     * @param fdaSubmission the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<FdaSubmission> partialUpdate(FdaSubmission fdaSubmission) {
        log.debug("Request to partially update FdaSubmission : {}", fdaSubmission);

        return fdaSubmissionRepository
            .findById(fdaSubmission.getId())
            .map(existingFdaSubmission -> {
                if (fdaSubmission.getNumber() != null) {
                    existingFdaSubmission.setNumber(fdaSubmission.getNumber());
                }
                if (fdaSubmission.getSupplementNumber() != null) {
                    existingFdaSubmission.setSupplementNumber(fdaSubmission.getSupplementNumber());
                }
                if (fdaSubmission.getDeviceName() != null) {
                    existingFdaSubmission.setDeviceName(fdaSubmission.getDeviceName());
                }
                if (fdaSubmission.getGenericName() != null) {
                    existingFdaSubmission.setGenericName(fdaSubmission.getGenericName());
                }
                if (fdaSubmission.getDateReceived() != null) {
                    existingFdaSubmission.setDateReceived(fdaSubmission.getDateReceived());
                }
                if (fdaSubmission.getDecisionDate() != null) {
                    existingFdaSubmission.setDecisionDate(fdaSubmission.getDecisionDate());
                }
                if (fdaSubmission.getDescription() != null) {
                    existingFdaSubmission.setDescription(fdaSubmission.getDescription());
                }

                return existingFdaSubmission;
            })
            .map(fdaSubmissionRepository::save);
    }

    /**
     * Get all the fdaSubmissions.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<FdaSubmission> findAll() {
        log.debug("Request to get all FdaSubmissions");
        return fdaSubmissionRepository.findAll();
    }

    /**
     * Get one fdaSubmission by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<FdaSubmission> findOne(Long id) {
        log.debug("Request to get FdaSubmission : {}", id);
        return fdaSubmissionRepository.findById(id);
    }

    /**
     * Delete the fdaSubmission by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete FdaSubmission : {}", id);
        fdaSubmissionRepository.deleteById(id);
    }
}
