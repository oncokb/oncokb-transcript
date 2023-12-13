package org.mskcc.oncokb.curation.service;

import com.google.api.Http;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.AssociationRepository;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

/**
 * Service Implementation for managing {@link Association}.
 */
@Service
@Transactional
public class AssociationService {

    private final Logger log = LoggerFactory.getLogger(AssociationService.class);

    private final AssociationRepository associationRepository;

    private final FdaSubmissionService fdaSubmissionService;

    public AssociationService(AssociationRepository associationRepository, FdaSubmissionService fdaSubmissionService) {
        this.associationRepository = associationRepository;
        this.fdaSubmissionService = fdaSubmissionService;
    }

    /**
     * Save a association.
     *
     * @param association the entity to save.
     * @return the persisted entity.
     */
    public Association save(Association association) {
        log.debug("Request to save Association : {}", association);
        Association savedAssociation = associationRepository.save(association);
        // FDA Submission needs to be updated individually, FDASubmission is the owner of the m2m relationship
        if (!association.getFdaSubmissions().isEmpty()) {
            association
                .getFdaSubmissions()
                .forEach(fdaSubmission -> {
                    if (fdaSubmission.getId() != null) {
                        Optional<FdaSubmission> fdaSubmissionOptional = fdaSubmissionService.findOne(fdaSubmission.getId());
                        if (fdaSubmissionOptional.isPresent()) {
                            fdaSubmissionOptional.get().getAssociations().add(savedAssociation);
                        }
                    }
                });
        }
        return this.findOne(savedAssociation.getId()).get();
    }

    /**
     * Get all the associations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Association> findAll() {
        log.debug("Request to get all Associations");
        return associationRepository.findAllWithEagerRelationships();
    }

    /**
     * Get all the associations with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Association> findAllWithEagerRelationships(Pageable pageable) {
        return associationRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     *  Get all the associations where Evidence is {@code null}.
     *  @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Association> findAllWhereEvidenceIsNull() {
        log.debug("Request to get all associations where Evidence is null");
        return StreamSupport
            .stream(associationRepository.findAll().spliterator(), false)
            .filter(association -> association.getEvidence() == null)
            .collect(Collectors.toList());
    }

    /**
     * Get one association by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Association> findOne(Long id) {
        log.debug("Request to get Association : {}", id);
        return associationRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the association by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Association : {}", id);
        Optional<Association> associationOptional = findOne(id);
        if (associationOptional.isEmpty()) {
            throw new BadRequestException("Association id: " + id + " does not exist");
        }
        if (associationOptional.get().getFdaSubmissions() != null) {
            associationOptional.get().getFdaSubmissions().remove(this);
            Iterator<FdaSubmission> iterator = associationOptional.get().getFdaSubmissions().iterator();
            if (iterator.hasNext()) {
                FdaSubmission fdaSubmission = iterator.next();
                if (fdaSubmission.getId() != null) {
                    Optional<FdaSubmission> fdaSubmissionOptional = fdaSubmissionService.findOne(fdaSubmission.getId());
                    if (fdaSubmissionOptional.isPresent()) {
                        fdaSubmissionOptional.get().getAssociations().remove(associationOptional.get());
                        fdaSubmissionService.save(fdaSubmissionOptional.get());
                    }
                }
            }
        }
        associationRepository.delete(associationOptional.get());
    }
}
