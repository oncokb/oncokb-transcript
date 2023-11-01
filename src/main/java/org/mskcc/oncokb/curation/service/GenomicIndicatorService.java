package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.GenomicIndicator;
import org.mskcc.oncokb.curation.repository.GenomicIndicatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link GenomicIndicator}.
 */
@Service
@Transactional
public class GenomicIndicatorService {

    private final Logger log = LoggerFactory.getLogger(GenomicIndicatorService.class);

    private final GenomicIndicatorRepository genomicIndicatorRepository;

    public GenomicIndicatorService(GenomicIndicatorRepository genomicIndicatorRepository) {
        this.genomicIndicatorRepository = genomicIndicatorRepository;
    }

    /**
     * Save a genomicIndicator.
     *
     * @param genomicIndicator the entity to save.
     * @return the persisted entity.
     */
    public GenomicIndicator save(GenomicIndicator genomicIndicator) {
        log.debug("Request to save GenomicIndicator : {}", genomicIndicator);
        return genomicIndicatorRepository.save(genomicIndicator);
    }

    /**
     * Partially update a genomicIndicator.
     *
     * @param genomicIndicator the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<GenomicIndicator> partialUpdate(GenomicIndicator genomicIndicator) {
        log.debug("Request to partially update GenomicIndicator : {}", genomicIndicator);

        return genomicIndicatorRepository
            .findById(genomicIndicator.getId())
            .map(existingGenomicIndicator -> {
                if (genomicIndicator.getType() != null) {
                    existingGenomicIndicator.setType(genomicIndicator.getType());
                }
                if (genomicIndicator.getName() != null) {
                    existingGenomicIndicator.setName(genomicIndicator.getName());
                }

                return existingGenomicIndicator;
            })
            .map(genomicIndicatorRepository::save);
    }

    /**
     * Get all the genomicIndicators.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<GenomicIndicator> findAll() {
        log.debug("Request to get all GenomicIndicators");
        return genomicIndicatorRepository.findAllWithEagerRelationships();
    }

    /**
     * Get all the genomicIndicators with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<GenomicIndicator> findAllWithEagerRelationships(Pageable pageable) {
        return genomicIndicatorRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one genomicIndicator by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<GenomicIndicator> findOne(Long id) {
        log.debug("Request to get GenomicIndicator : {}", id);
        return genomicIndicatorRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the genomicIndicator by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete GenomicIndicator : {}", id);
        genomicIndicatorRepository.deleteById(id);
    }
}
