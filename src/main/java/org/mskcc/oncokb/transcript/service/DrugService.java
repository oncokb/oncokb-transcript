package org.mskcc.oncokb.transcript.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Drug;
import org.mskcc.oncokb.transcript.repository.DrugRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Drug}.
 */
@Service
@Transactional
public class DrugService {

    private final Logger log = LoggerFactory.getLogger(DrugService.class);

    private final DrugRepository drugRepository;

    public DrugService(DrugRepository drugRepository) {
        this.drugRepository = drugRepository;
    }

    /**
     * Save a drug.
     *
     * @param drug the entity to save.
     * @return the persisted entity.
     */
    public Drug save(Drug drug) {
        log.debug("Request to save Drug : {}", drug);
        return drugRepository.save(drug);
    }

    /**
     * Partially update a drug.
     *
     * @param drug the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Drug> partialUpdate(Drug drug) {
        log.debug("Request to partially update Drug : {}", drug);

        return drugRepository
            .findById(drug.getId())
            .map(
                existingDrug -> {
                    if (drug.getName() != null) {
                        existingDrug.setName(drug.getName());
                    }
                    if (drug.getCode() != null) {
                        existingDrug.setCode(drug.getCode());
                    }
                    if (drug.getSemanticType() != null) {
                        existingDrug.setSemanticType(drug.getSemanticType());
                    }

                    return existingDrug;
                }
            )
            .map(drugRepository::save);
    }

    /**
     * Get all the drugs.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Drug> findAll() {
        log.debug("Request to get all Drugs");
        return drugRepository.findAll();
    }

    /**
     * Get one drug by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Drug> findOne(Long id) {
        log.debug("Request to get Drug : {}", id);
        return drugRepository.findById(id);
    }

    /**
     * Delete the drug by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Drug : {}", id);
        drugRepository.deleteById(id);
    }
}
