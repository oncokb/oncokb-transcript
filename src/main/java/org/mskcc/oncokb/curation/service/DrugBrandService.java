package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.mskcc.oncokb.curation.repository.DrugBrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link DrugBrand}.
 */
@Service
@Transactional
public class DrugBrandService {

    private final Logger log = LoggerFactory.getLogger(DrugBrandService.class);

    private final DrugBrandRepository drugBrandRepository;

    public DrugBrandService(DrugBrandRepository drugBrandRepository) {
        this.drugBrandRepository = drugBrandRepository;
    }

    /**
     * Save a drugBrand.
     *
     * @param drugBrand the entity to save.
     * @return the persisted entity.
     */
    public DrugBrand save(DrugBrand drugBrand) {
        log.debug("Request to save DrugBrand : {}", drugBrand);
        return drugBrandRepository.save(drugBrand);
    }

    /**
     * Partially update a drugBrand.
     *
     * @param drugBrand the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DrugBrand> partialUpdate(DrugBrand drugBrand) {
        log.debug("Request to partially update DrugBrand : {}", drugBrand);

        return drugBrandRepository
            .findById(drugBrand.getId())
            .map(existingDrugBrand -> {
                if (drugBrand.getName() != null) {
                    existingDrugBrand.setName(drugBrand.getName());
                }
                if (drugBrand.getRegion() != null) {
                    existingDrugBrand.setRegion(drugBrand.getRegion());
                }

                return existingDrugBrand;
            })
            .map(drugBrandRepository::save);
    }

    /**
     * Get all the drugBrands.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<DrugBrand> findAll() {
        log.debug("Request to get all DrugBrands");
        return drugBrandRepository.findAll();
    }

    /**
     * Get one drugBrand by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DrugBrand> findOne(Long id) {
        log.debug("Request to get DrugBrand : {}", id);
        return drugBrandRepository.findById(id);
    }

    /**
     * Delete the drugBrand by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete DrugBrand : {}", id);
        drugBrandRepository.deleteById(id);
    }
}
