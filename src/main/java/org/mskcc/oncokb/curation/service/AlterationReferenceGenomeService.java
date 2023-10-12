package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.AlterationReferenceGenome;
import org.mskcc.oncokb.curation.repository.AlterationReferenceGenomeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link AlterationReferenceGenome}.
 */
@Service
@Transactional
public class AlterationReferenceGenomeService {

    private final Logger log = LoggerFactory.getLogger(AlterationReferenceGenomeService.class);

    private final AlterationReferenceGenomeRepository alterationReferenceGenomeRepository;

    public AlterationReferenceGenomeService(AlterationReferenceGenomeRepository alterationReferenceGenomeRepository) {
        this.alterationReferenceGenomeRepository = alterationReferenceGenomeRepository;
    }

    /**
     * Save a alterationReferenceGenome.
     *
     * @param alterationReferenceGenome the entity to save.
     * @return the persisted entity.
     */
    public AlterationReferenceGenome save(AlterationReferenceGenome alterationReferenceGenome) {
        log.debug("Request to save AlterationReferenceGenome : {}", alterationReferenceGenome);
        return alterationReferenceGenomeRepository.save(alterationReferenceGenome);
    }

    /**
     * Partially update a alterationReferenceGenome.
     *
     * @param alterationReferenceGenome the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AlterationReferenceGenome> partialUpdate(AlterationReferenceGenome alterationReferenceGenome) {
        log.debug("Request to partially update AlterationReferenceGenome : {}", alterationReferenceGenome);

        return alterationReferenceGenomeRepository
            .findById(alterationReferenceGenome.getId())
            .map(existingAlterationReferenceGenome -> {
                if (alterationReferenceGenome.getReferenceGenome() != null) {
                    existingAlterationReferenceGenome.setReferenceGenome(alterationReferenceGenome.getReferenceGenome());
                }

                return existingAlterationReferenceGenome;
            })
            .map(alterationReferenceGenomeRepository::save);
    }

    /**
     * Get all the alterationReferenceGenomes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AlterationReferenceGenome> findAll() {
        log.debug("Request to get all AlterationReferenceGenomes");
        return alterationReferenceGenomeRepository.findAll();
    }

    /**
     * Get one alterationReferenceGenome by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AlterationReferenceGenome> findOne(Long id) {
        log.debug("Request to get AlterationReferenceGenome : {}", id);
        return alterationReferenceGenomeRepository.findById(id);
    }

    /**
     * Delete the alterationReferenceGenome by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete AlterationReferenceGenome : {}", id);
        alterationReferenceGenomeRepository.deleteById(id);
    }
}
