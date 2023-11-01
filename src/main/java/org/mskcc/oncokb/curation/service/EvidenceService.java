package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Evidence;
import org.mskcc.oncokb.curation.repository.EvidenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Evidence}.
 */
@Service
@Transactional
public class EvidenceService {

    private final Logger log = LoggerFactory.getLogger(EvidenceService.class);

    private final EvidenceRepository evidenceRepository;

    public EvidenceService(EvidenceRepository evidenceRepository) {
        this.evidenceRepository = evidenceRepository;
    }

    /**
     * Save a evidence.
     *
     * @param evidence the entity to save.
     * @return the persisted entity.
     */
    public Evidence save(Evidence evidence) {
        log.debug("Request to save Evidence : {}", evidence);
        return evidenceRepository.save(evidence);
    }

    /**
     * Partially update a evidence.
     *
     * @param evidence the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Evidence> partialUpdate(Evidence evidence) {
        log.debug("Request to partially update Evidence : {}", evidence);

        return evidenceRepository
            .findById(evidence.getId())
            .map(existingEvidence -> {
                if (evidence.getUuid() != null) {
                    existingEvidence.setUuid(evidence.getUuid());
                }
                if (evidence.getEvidenceType() != null) {
                    existingEvidence.setEvidenceType(evidence.getEvidenceType());
                }
                if (evidence.getKnownEffect() != null) {
                    existingEvidence.setKnownEffect(evidence.getKnownEffect());
                }
                if (evidence.getDescription() != null) {
                    existingEvidence.setDescription(evidence.getDescription());
                }
                if (evidence.getNote() != null) {
                    existingEvidence.setNote(evidence.getNote());
                }

                return existingEvidence;
            })
            .map(evidenceRepository::save);
    }

    /**
     * Get all the evidences.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Evidence> findAll(Pageable pageable) {
        log.debug("Request to get all Evidences");
        return evidenceRepository.findAll(pageable);
    }

    /**
     * Get all the evidences with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Evidence> findAllWithEagerRelationships(Pageable pageable) {
        return evidenceRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one evidence by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Evidence> findOne(Long id) {
        log.debug("Request to get Evidence : {}", id);
        return evidenceRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the evidence by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Evidence : {}", id);
        evidenceRepository.deleteById(id);
    }
}
