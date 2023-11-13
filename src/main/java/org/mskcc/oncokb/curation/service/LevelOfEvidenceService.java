package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.LevelOfEvidence;
import org.mskcc.oncokb.curation.repository.LevelOfEvidenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link LevelOfEvidence}.
 */
@Service
@Transactional
public class LevelOfEvidenceService {

    private final Logger log = LoggerFactory.getLogger(LevelOfEvidenceService.class);

    private final LevelOfEvidenceRepository levelOfEvidenceRepository;

    public LevelOfEvidenceService(LevelOfEvidenceRepository levelOfEvidenceRepository) {
        this.levelOfEvidenceRepository = levelOfEvidenceRepository;
    }

    /**
     * Save a levelOfEvidence.
     *
     * @param levelOfEvidence the entity to save.
     * @return the persisted entity.
     */
    public LevelOfEvidence save(LevelOfEvidence levelOfEvidence) {
        log.debug("Request to save LevelOfEvidence : {}", levelOfEvidence);
        return levelOfEvidenceRepository.save(levelOfEvidence);
    }

    /**
     * Partially update a levelOfEvidence.
     *
     * @param levelOfEvidence the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<LevelOfEvidence> partialUpdate(LevelOfEvidence levelOfEvidence) {
        log.debug("Request to partially update LevelOfEvidence : {}", levelOfEvidence);

        return levelOfEvidenceRepository
            .findById(levelOfEvidence.getId())
            .map(existingLevelOfEvidence -> {
                if (levelOfEvidence.getType() != null) {
                    existingLevelOfEvidence.setType(levelOfEvidence.getType());
                }
                if (levelOfEvidence.getLevel() != null) {
                    existingLevelOfEvidence.setLevel(levelOfEvidence.getLevel());
                }

                return existingLevelOfEvidence;
            })
            .map(levelOfEvidenceRepository::save);
    }

    /**
     * Get all the levelOfEvidences.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<LevelOfEvidence> findAll() {
        log.debug("Request to get all LevelOfEvidences");
        return levelOfEvidenceRepository.findAll();
    }

    /**
     * Get one levelOfEvidence by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<LevelOfEvidence> findOne(Long id) {
        log.debug("Request to get LevelOfEvidence : {}", id);
        return levelOfEvidenceRepository.findById(id);
    }

    /**
     * Delete the levelOfEvidence by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete LevelOfEvidence : {}", id);
        levelOfEvidenceRepository.deleteById(id);
    }
}
