package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.DrugSynonym;
import org.mskcc.oncokb.curation.repository.DrugSynonymRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link DrugSynonym}.
 */
@Service
@Transactional
public class DrugSynonymService {

    private final Logger log = LoggerFactory.getLogger(DrugSynonymService.class);

    private final DrugSynonymRepository drugSynonymRepository;

    public DrugSynonymService(DrugSynonymRepository drugSynonymRepository) {
        this.drugSynonymRepository = drugSynonymRepository;
    }

    /**
     * Save a drugSynonym.
     *
     * @param drugSynonym the entity to save.
     * @return the persisted entity.
     */
    public DrugSynonym save(DrugSynonym drugSynonym) {
        log.debug("Request to save DrugSynonym : {}", drugSynonym);
        return drugSynonymRepository.save(drugSynonym);
    }

    /**
     * Partially update a drugSynonym.
     *
     * @param drugSynonym the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DrugSynonym> partialUpdate(DrugSynonym drugSynonym) {
        log.debug("Request to partially update DrugSynonym : {}", drugSynonym);

        return drugSynonymRepository
            .findById(drugSynonym.getId())
            .map(existingDrugSynonym -> {
                if (drugSynonym.getName() != null) {
                    existingDrugSynonym.setName(drugSynonym.getName());
                }

                return existingDrugSynonym;
            })
            .map(drugSynonymRepository::save);
    }

    /**
     * Get all the drugSynonyms.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<DrugSynonym> findAll() {
        log.debug("Request to get all DrugSynonyms");
        return drugSynonymRepository.findAll();
    }

    /**
     * Get one drugSynonym by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DrugSynonym> findOne(Long id) {
        log.debug("Request to get DrugSynonym : {}", id);
        return drugSynonymRepository.findById(id);
    }

    /**
     * Delete the drugSynonym by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete DrugSynonym : {}", id);
        drugSynonymRepository.deleteById(id);
    }
}
