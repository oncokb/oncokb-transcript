package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.SeqRegion;
import org.mskcc.oncokb.curation.repository.SeqRegionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link SeqRegion}.
 */
@Service
@Transactional
public class SeqRegionService {

    private final Logger log = LoggerFactory.getLogger(SeqRegionService.class);

    private final SeqRegionRepository seqRegionRepository;

    public SeqRegionService(SeqRegionRepository seqRegionRepository) {
        this.seqRegionRepository = seqRegionRepository;
    }

    /**
     * Save a seqRegion.
     *
     * @param seqRegion the entity to save.
     * @return the persisted entity.
     */
    public SeqRegion save(SeqRegion seqRegion) {
        log.debug("Request to save SeqRegion : {}", seqRegion);
        return seqRegionRepository.save(seqRegion);
    }

    /**
     * Partially update a seqRegion.
     *
     * @param seqRegion the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SeqRegion> partialUpdate(SeqRegion seqRegion) {
        log.debug("Request to partially update SeqRegion : {}", seqRegion);

        return seqRegionRepository
            .findById(seqRegion.getId())
            .map(existingSeqRegion -> {
                if (seqRegion.getName() != null) {
                    existingSeqRegion.setName(seqRegion.getName());
                }
                if (seqRegion.getChromosome() != null) {
                    existingSeqRegion.setChromosome(seqRegion.getChromosome());
                }
                if (seqRegion.getDescription() != null) {
                    existingSeqRegion.setDescription(seqRegion.getDescription());
                }

                return existingSeqRegion;
            })
            .map(seqRegionRepository::save);
    }

    /**
     * Get all the seqRegions.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SeqRegion> findAll() {
        log.debug("Request to get all SeqRegions");
        return seqRegionRepository.findAll();
    }

    public Optional<SeqRegion> findByName(String name) {
        return seqRegionRepository.findByName(name);
    }

    public Optional<SeqRegion> findByNameOrCreate(String name) {
        if (StringUtils.isEmpty(name)) {
            return Optional.empty();
        }
        Optional<SeqRegion> seqRegionOptional = seqRegionRepository.findByName(name);
        if (seqRegionOptional.isEmpty()) {
            SeqRegion seqRegion = new SeqRegion();
            seqRegion.setName(name);
            return Optional.ofNullable(seqRegionRepository.save(seqRegion));
        } else {
            return seqRegionOptional;
        }
    }

    /**
     * Get one seqRegion by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SeqRegion> findOne(Long id) {
        log.debug("Request to get SeqRegion : {}", id);
        return seqRegionRepository.findById(id);
    }

    /**
     * Delete the seqRegion by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete SeqRegion : {}", id);
        seqRegionRepository.deleteById(id);
    }
}
