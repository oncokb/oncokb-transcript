package org.mskcc.oncokb.curation.service;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.AssociationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                        fdaSubmissionOptional.ifPresent(submission -> submission.getAssociations().add(savedAssociation));
                    }
                });
        }
        return this.findOne(savedAssociation.getId()).orElseThrow();
    }

    /**
     * Partially update a association.
     *
     * @param association the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Association> partialUpdate(Association association) {
        log.debug("Request to partially update Association : {}", association);

        return associationRepository
            .findById(association.getId())
            .map(existingAssociation -> {
                if (association.getName() != null) {
                    existingAssociation.setName(association.getName());
                }

                return existingAssociation;
            })
            .map(associationRepository::save);
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
        return associationRepository
            .findAll()
            .stream()
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
    public void delete(Long id) throws Exception {
        log.debug("Request to delete Association : {}", id);
        Optional<Association> associationOptional = findOne(id);
        if (associationOptional.isEmpty()) {
            throw new Exception("Association id: " + id + " does not exist");
        }
        Association association = associationOptional.orElseThrow();

        // Detach owning-side many-to-many relationships to ensure join rows are deleted first
        if (association.getAlterations() != null && !association.getAlterations().isEmpty()) {
            for (var alteration : new HashSet<>(association.getAlterations())) {
                association.removeAlteration(alteration);
            }
        }
        if (association.getCancerTypes() != null && !association.getCancerTypes().isEmpty()) {
            for (var cancerType : new HashSet<>(association.getCancerTypes())) {
                association.removeCancerType(cancerType);
            }
        }
        if (association.getArticles() != null && !association.getArticles().isEmpty()) {
            for (var article : new HashSet<>(association.getArticles())) {
                association.removeArticle(article);
            }
        }
        if (association.getDrugs() != null && !association.getDrugs().isEmpty()) {
            for (var drug : new HashSet<>(association.getDrugs())) {
                association.removeDrug(drug);
            }
        }

        // Detach inverse-side many-to-many: update the owning side entities then clear our view
        if (association.getFdaSubmissions() != null && !association.getFdaSubmissions().isEmpty()) {
            Iterator<FdaSubmission> iterator = association.getFdaSubmissions().iterator();
            while (iterator.hasNext()) {
                FdaSubmission fdaSubmission = iterator.next();
                if (fdaSubmission.getId() != null) {
                    Optional<FdaSubmission> fdaSubmissionOptional = fdaSubmissionService.findOne(fdaSubmission.getId());
                    if (fdaSubmissionOptional.isPresent()) {
                        fdaSubmissionOptional.orElseThrow().getAssociations().remove(association);
                        fdaSubmissionService.save(fdaSubmissionOptional.orElseThrow());
                    }
                }
            }
            association.getFdaSubmissions().clear();
        }

        // Persist detachments to delete join rows before parent row
        associationRepository.saveAndFlush(association);

        associationRepository.delete(association);
    }
}
