package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.FeatureFlag;
import org.mskcc.oncokb.curation.repository.FeatureFlagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link FeatureFlag}.
 */
@Service
@Transactional
public class FeatureFlagService {

    private final Logger log = LoggerFactory.getLogger(FeatureFlagService.class);

    private final FeatureFlagRepository featureFlagRepository;

    public FeatureFlagService(FeatureFlagRepository featureFlagRepository) {
        this.featureFlagRepository = featureFlagRepository;
    }

    /**
     * Save a featureFlag.
     *
     * @param featureFlag the entity to save.
     * @return the persisted entity.
     */
    public FeatureFlag save(FeatureFlag featureFlag) {
        log.debug("Request to save FeatureFlag : {}", featureFlag);
        return featureFlagRepository.save(featureFlag);
    }

    /**
     * Partially update a featureFlag.
     *
     * @param featureFlag the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<FeatureFlag> partialUpdate(FeatureFlag featureFlag) {
        log.debug("Request to partially update FeatureFlag : {}", featureFlag);

        return featureFlagRepository
            .findById(featureFlag.getId())
            .map(existingFeatureFlag -> {
                if (featureFlag.getName() != null) {
                    existingFeatureFlag.setName(featureFlag.getName());
                }
                if (featureFlag.getDescription() != null) {
                    existingFeatureFlag.setDescription(featureFlag.getDescription());
                }
                if (featureFlag.getEnabled() != null) {
                    existingFeatureFlag.setEnabled(featureFlag.getEnabled());
                }

                return existingFeatureFlag;
            })
            .map(featureFlagRepository::save);
    }

    /**
     * Get all the featureFlags.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<FeatureFlag> findAll() {
        log.debug("Request to get all FeatureFlags");
        return featureFlagRepository.findAllWithEagerRelationships();
    }

    /**
     * Get all the featureFlags with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<FeatureFlag> findAllWithEagerRelationships(Pageable pageable) {
        return featureFlagRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one featureFlag by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<FeatureFlag> findOne(Long id) {
        log.debug("Request to get FeatureFlag : {}", id);
        return featureFlagRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the featureFlag by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete FeatureFlag : {}", id);
        featureFlagRepository.deleteById(id);
    }
}
