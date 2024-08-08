package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.GenomicIndicator;
import org.mskcc.oncokb.curation.domain.enumeration.GenomicIndicatorType;
import org.mskcc.oncokb.curation.repository.GenomicIndicatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
                if (genomicIndicator.getUuid() != null) {
                    existingGenomicIndicator.setUuid(genomicIndicator.getUuid());
                }
                if (genomicIndicator.getType() != null) {
                    existingGenomicIndicator.setType(genomicIndicator.getType());
                }
                if (genomicIndicator.getName() != null) {
                    existingGenomicIndicator.setName(genomicIndicator.getName());
                }
                if (genomicIndicator.getDescription() != null) {
                    existingGenomicIndicator.setDescription(genomicIndicator.getDescription());
                }
                if (genomicIndicator.getAlleleStates() != null) {
                    existingGenomicIndicator.getAlleleStates().clear();
                    existingGenomicIndicator.getAlleleStates().addAll(genomicIndicator.getAlleleStates());
                }
                if (genomicIndicator.getAssociations() != null) {
                    existingGenomicIndicator.getAssociations().clear();
                    existingGenomicIndicator.getAssociations().addAll(genomicIndicator.getAssociations());
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
     * Get a list of genomicIndicators by ids
     *
     * @param ids the list of id for the entities
     * @return list of entity
     */
    @Transactional(readOnly = true)
    public List<GenomicIndicator> findByIdIn(List<Long> ids) {
        log.debug("Request to get GenomicIndicators : {}", ids);
        return genomicIndicatorRepository.findByIdInWithEagerRelationships(ids);
    }

    /**
     * Get one genomicIndicator by type and name
     *
     * @param type genomic indicator type, GERMLINE
     * @param name the name of the entity
     * @return the entity
     */
    public Optional<GenomicIndicator> findByTypeAndName(GenomicIndicatorType type, String name) {
        if (type == null) {
            return Optional.empty();
        }
        Optional<GenomicIndicator> genomicIndicatorOptional = genomicIndicatorRepository.findByTypeAndName(type.name(), name);
        if (genomicIndicatorOptional.isPresent()) {
            return genomicIndicatorRepository.findOneWithEagerRelationships(genomicIndicatorOptional.orElseThrow().getId());
        }
        return Optional.empty();
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
