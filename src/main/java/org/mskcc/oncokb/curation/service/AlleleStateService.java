package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.AlleleState;
import org.mskcc.oncokb.curation.repository.AlleleStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link AlleleState}.
 */
@Service
@Transactional
public class AlleleStateService {

    private final Logger log = LoggerFactory.getLogger(AlleleStateService.class);

    private final AlleleStateRepository alleleStateRepository;

    public AlleleStateService(AlleleStateRepository alleleStateRepository) {
        this.alleleStateRepository = alleleStateRepository;
    }

    /**
     * Save a alleleState.
     *
     * @param alleleState the entity to save.
     * @return the persisted entity.
     */
    public AlleleState save(AlleleState alleleState) {
        log.debug("Request to save AlleleState : {}", alleleState);
        return alleleStateRepository.save(alleleState);
    }

    /**
     * Partially update a alleleState.
     *
     * @param alleleState the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AlleleState> partialUpdate(AlleleState alleleState) {
        log.debug("Request to partially update AlleleState : {}", alleleState);

        return alleleStateRepository
            .findById(alleleState.getId())
            .map(existingAlleleState -> {
                if (alleleState.getName() != null) {
                    existingAlleleState.setName(alleleState.getName());
                }

                return existingAlleleState;
            })
            .map(alleleStateRepository::save);
    }

    /**
     * Get all the alleleStates.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AlleleState> findAll() {
        log.debug("Request to get all AlleleStates");
        return alleleStateRepository.findAll();
    }

    /**
     * Get one alleleState by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AlleleState> findOne(Long id) {
        log.debug("Request to get AlleleState : {}", id);
        return alleleStateRepository.findById(id);
    }

    /**
     * get one alleleState by name
     * @param name the name of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<AlleleState> findByName(String name) {
        return alleleStateRepository.findByName(name);
    }

    /**
     * Delete the alleleState by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete AlleleState : {}", id);
        alleleStateRepository.deleteById(id);
    }
}
