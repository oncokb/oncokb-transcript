package org.mskcc.oncokb.curation.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.mskcc.oncokb.curation.service.criteria.DrugCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
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
    private final DrugQueryService drugQueryService;

    public DrugService(DrugRepository drugRepository, DrugQueryService drugQueryService) {
        this.drugRepository = drugRepository;
        this.drugQueryService = drugQueryService;
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
                if (drug.getUuid() != null) {
                    existingDrug.setUuid(drug.getUuid());
                }
                if (drug.getName() != null) {
                    existingDrug.setName(drug.getName());
                }
                if (drug.getNciThesaurus() != null) {
                    existingDrug.setNciThesaurus(drug.getNciThesaurus());
                }

                return existingDrug;
            })
            .map(drugRepository::save);
    }

    /**
     * Get all the drugs.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    @Cacheable(cacheResolver = "drugCacheResolver")
    public List<Drug> findAll(DrugCriteria criteria) {
        log.debug("Request to get all Drugs");
        Boolean isEmptyCriteria = (new DrugCriteria()).equals(criteria);
        List<Drug> drugs = new ArrayList<>();
        if (!isEmptyCriteria) {
            drugs = drugQueryService.findByCriteria(criteria);
        }
        if (drugs.size() == 0) {
            return drugRepository.findAllWithEagerRelationships();
        } else {
            return drugRepository.findAllWithEagerRelationships(drugs.stream().map(Drug::getId).collect(Collectors.toList()));
        }
    }

    /**
     *  Get all the drugs where FdaDrug is {@code null}.
     *  @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Drug> findAllWhereFdaDrugIsNull() {
        log.debug("Request to get all drugs where FdaDrug is null");
        return drugRepository
            .findAll()
            .stream()
            .filter(drug -> drug.getFdaDrugs() == null || drug.getFdaDrugs().isEmpty())
            .collect(Collectors.toList());
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
        return drugRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Get list of drugs by ids
     *
     * @param ids the id of the entities.
     * @return list of entity.
     */
    @Transactional(readOnly = true)
    public List<Drug> findAllByIds(List<Long> ids) {
        log.debug("Request to get all : {}", ids);
        return drugRepository.findAllWithEagerRelationships(ids);
    }

    public Optional<Drug> findByCode(String code) {
        return drugRepository.findOneByCodeWithEagerRelationships(code);
    }

    public Optional<Drug> findByName(String name) {
        return drugRepository.findByNameIgnoreCaseWithEagerRelationships(name);
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

    private final String keyword;

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
        Integer index1 = e1.getName().indexOf(this.keyword);
        Integer index2 = e2.getName().indexOf(this.keyword);
        if (index1.equals(index2)) {
            index1 = e1.getNciThesaurus() == null ? 0 : e1.getNciThesaurus().getCode().indexOf(this.keyword);
            index2 = e2.getNciThesaurus() == null ? 0 : e2.getNciThesaurus().getCode().indexOf(this.keyword);
            if (index1.equals(index2)) {
                // At this moment, these are the matches from the synonyms. The order does not matter, so alphabetically sort base on drug name
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
