package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.repository.ConsequenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Consequence}.
 */
@Service
@Transactional
public class ConsequenceService {

    private final Logger log = LoggerFactory.getLogger(ConsequenceService.class);

    private final ConsequenceRepository consequenceRepository;

    public ConsequenceService(ConsequenceRepository consequenceRepository) {
        this.consequenceRepository = consequenceRepository;
    }

    /**
     * Save a consequence.
     *
     * @param consequence the entity to save.
     * @return the persisted entity.
     */
    public Consequence save(Consequence consequence) {
        log.debug("Request to save Consequence : {}", consequence);
        return consequenceRepository.save(consequence);
    }

    /**
     * Partially update a consequence.
     *
     * @param consequence the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Consequence> partialUpdate(Consequence consequence) {
        log.debug("Request to partially update Consequence : {}", consequence);

        return consequenceRepository
            .findById(consequence.getId())
            .map(existingConsequence -> {
                if (consequence.getType() != null) {
                    existingConsequence.setType(consequence.getType());
                }
                if (consequence.getTerm() != null) {
                    existingConsequence.setTerm(consequence.getTerm());
                }
                if (consequence.getName() != null) {
                    existingConsequence.setName(consequence.getName());
                }
                if (consequence.getIsGenerallyTruncating() != null) {
                    existingConsequence.setIsGenerallyTruncating(consequence.getIsGenerallyTruncating());
                }
                if (consequence.getDescription() != null) {
                    existingConsequence.setDescription(consequence.getDescription());
                }

                return existingConsequence;
            })
            .map(consequenceRepository::save);
    }

    /**
     * Get all the consequences.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Consequence> findAll() {
        log.debug("Request to get all Consequences");
        return consequenceRepository.findAll();
    }

    /**
     * Get one consequence by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Consequence> findOne(Long id) {
        log.debug("Request to get Consequence : {}", id);
        return consequenceRepository.findById(id);
    }

    public Optional<Consequence> findConsequenceByTypeAndTerm(AlterationType alterationType, String term) {
        log.debug("Request to get Consequence by alteration type and term : {} {}", alterationType, term);
        return consequenceRepository.findConsequenceByTypeAndTerm(alterationType, term);
    }

    /**
     * Delete the consequence by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Consequence : {}", id);
        consequenceRepository.deleteById(id);
    }
}
