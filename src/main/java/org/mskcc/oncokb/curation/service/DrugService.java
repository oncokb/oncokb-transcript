package org.mskcc.oncokb.curation.service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
            .map(existingDrug -> {
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
            })
            .map(drugRepository::save);
    }

    /**
     * Get all the drugs.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Drug> findAll(Pageable pageable) {
        log.debug("Request to get all Drugs");
        return drugRepository.findAll(pageable);
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

    public Optional<Drug> findByCode(String code) {
        return drugRepository.findOneByCode(code);
    }

    public List<Drug> searchDrug(String query) {
        List<Drug> result = drugRepository.searchDrug(query);
        result.sort(new DrugComp(query));
        return result;
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

class DrugComp implements Comparator<Drug> {

    private String keyword;

    public DrugComp(String keyword) {
        this.keyword = keyword.toLowerCase();
    }

    @Override
    public int compare(Drug e1, Drug e2) {
        if (e1.getName().equalsIgnoreCase(keyword)) {
            return -1;
        }
        if (e2.getName().equalsIgnoreCase(keyword)) {
            return 1;
        }
        if (e1.getName().equalsIgnoreCase(keyword)) {
            return -1;
        }
        if (e2.getName().equalsIgnoreCase(keyword)) {
            return 1;
        }
        Integer index1 = e1.getName().indexOf(this.keyword);
        Integer index2 = e2.getName().indexOf(this.keyword);
        if (index1.equals(index2)) {
            index1 = e1.getCode().indexOf(this.keyword);
            index2 = e2.getCode().indexOf(this.keyword);
            if (index1.equals(index2)) {
                // In this moment, these are the matches from the synonyms. The order does not matter, so alphabetically sort base on drug name
                return e1.getName().compareTo(e2.getName());
            } else {
                if (index1.equals(-1)) return 1;
                if (index2.equals(-1)) return -1;
                return index1 - index2;
            }
        } else {
            if (index1.equals(-1)) return 1;
            if (index2.equals(-1)) return -1;
            return index1 - index2;
        }
    }
}
