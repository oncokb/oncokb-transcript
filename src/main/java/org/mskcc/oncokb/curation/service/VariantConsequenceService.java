package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.VariantConsequence;
import org.mskcc.oncokb.curation.repository.VariantConsequenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link VariantConsequence}.
 */
@Service
@Transactional
public class VariantConsequenceService {

    private final Logger log = LoggerFactory.getLogger(VariantConsequenceService.class);

    private final VariantConsequenceRepository variantConsequenceRepository;

    public VariantConsequenceService(VariantConsequenceRepository variantConsequenceRepository) {
        this.variantConsequenceRepository = variantConsequenceRepository;
    }

    /**
     * Save a variantConsequence.
     *
     * @param variantConsequence the entity to save.
     * @return the persisted entity.
     */
    public VariantConsequence save(VariantConsequence variantConsequence) {
        log.debug("Request to save VariantConsequence : {}", variantConsequence);
        return variantConsequenceRepository.save(variantConsequence);
    }

    /**
     * Partially update a variantConsequence.
     *
     * @param variantConsequence the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<VariantConsequence> partialUpdate(VariantConsequence variantConsequence) {
        log.debug("Request to partially update VariantConsequence : {}", variantConsequence);

        return variantConsequenceRepository
            .findById(variantConsequence.getId())
            .map(existingVariantConsequence -> {
                if (variantConsequence.getTerm() != null) {
                    existingVariantConsequence.setTerm(variantConsequence.getTerm());
                }
                if (variantConsequence.getIsGenerallyTruncating() != null) {
                    existingVariantConsequence.setIsGenerallyTruncating(variantConsequence.getIsGenerallyTruncating());
                }
                if (variantConsequence.getDescription() != null) {
                    existingVariantConsequence.setDescription(variantConsequence.getDescription());
                }

                return existingVariantConsequence;
            })
            .map(variantConsequenceRepository::save);
    }

    /**
     * Get all the variantConsequences.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<VariantConsequence> findAll() {
        log.debug("Request to get all VariantConsequences");
        return variantConsequenceRepository.findAll();
    }

    /**
     * Get one variantConsequence by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<VariantConsequence> findOne(Long id) {
        log.debug("Request to get VariantConsequence : {}", id);
        return variantConsequenceRepository.findById(id);
    }

    /**
     * Delete the variantConsequence by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete VariantConsequence : {}", id);
        variantConsequenceRepository.deleteById(id);
    }
}
