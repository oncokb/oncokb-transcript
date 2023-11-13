package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.mskcc.oncokb.curation.domain.Association;
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

    public AssociationService(AssociationRepository associationRepository) {
        this.associationRepository = associationRepository;
    }

    /**
     * Save a association.
     *
     * @param association the entity to save.
     * @return the persisted entity.
     */
    public Association save(Association association) {
        log.debug("Request to save Association : {}", association);
        return associationRepository.save(association);
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
        associationRepository.deleteById(id);
    }
}
