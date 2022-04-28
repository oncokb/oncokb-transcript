package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.CategoricalAlteration;
import org.mskcc.oncokb.curation.repository.CategoricalAlterationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link CategoricalAlteration}.
 */
@Service
@Transactional
public class CategoricalAlterationService {

    private final Logger log = LoggerFactory.getLogger(CategoricalAlterationService.class);

    private final CategoricalAlterationRepository categoricalAlterationRepository;

    public CategoricalAlterationService(CategoricalAlterationRepository categoricalAlterationRepository) {
        this.categoricalAlterationRepository = categoricalAlterationRepository;
    }

    /**
     * Save a categoricalAlteration.
     *
     * @param categoricalAlteration the entity to save.
     * @return the persisted entity.
     */
    public CategoricalAlteration save(CategoricalAlteration categoricalAlteration) {
        log.debug("Request to save CategoricalAlteration : {}", categoricalAlteration);
        return categoricalAlterationRepository.save(categoricalAlteration);
    }

    /**
     * Partially update a categoricalAlteration.
     *
     * @param categoricalAlteration the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CategoricalAlteration> partialUpdate(CategoricalAlteration categoricalAlteration) {
        log.debug("Request to partially update CategoricalAlteration : {}", categoricalAlteration);

        return categoricalAlterationRepository
            .findById(categoricalAlteration.getId())
            .map(existingCategoricalAlteration -> {
                if (categoricalAlteration.getName() != null) {
                    existingCategoricalAlteration.setName(categoricalAlteration.getName());
                }
                if (categoricalAlteration.getType() != null) {
                    existingCategoricalAlteration.setType(categoricalAlteration.getType());
                }
                if (categoricalAlteration.getAlterationType() != null) {
                    existingCategoricalAlteration.setAlterationType(categoricalAlteration.getAlterationType());
                }

                return existingCategoricalAlteration;
            })
            .map(categoricalAlterationRepository::save);
    }

    /**
     * Get all the categoricalAlterations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<CategoricalAlteration> findAll() {
        log.debug("Request to get all CategoricalAlterations");
        return categoricalAlterationRepository.findAll();
    }

    /**
     * Get one categoricalAlteration by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CategoricalAlteration> findOne(Long id) {
        log.debug("Request to get CategoricalAlteration : {}", id);
        return categoricalAlterationRepository.findById(id);
    }

    /**
     * Delete the categoricalAlteration by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete CategoricalAlteration : {}", id);
        categoricalAlterationRepository.deleteById(id);
    }
}
