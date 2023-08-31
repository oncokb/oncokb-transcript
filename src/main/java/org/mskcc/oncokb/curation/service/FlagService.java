package org.mskcc.oncokb.curation.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.enumeration.FlagType;
import org.mskcc.oncokb.curation.repository.FlagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Flag}.
 */
@Service
@Transactional
public class FlagService {

    private final Logger log = LoggerFactory.getLogger(FlagService.class);

    private final FlagRepository flagRepository;

    public FlagService(FlagRepository flagRepository) {
        this.flagRepository = flagRepository;
    }

    /**
     * Save a flag.
     *
     * @param flag the entity to save.
     * @return the persisted entity.
     */
    public Flag save(Flag flag) {
        log.debug("Request to save Flag : {}", flag);
        return flagRepository.save(flag);
    }

    /**
     * Partially update a flag.
     *
     * @param flag the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Flag> partialUpdate(Flag flag) {
        log.debug("Request to partially update Flag : {}", flag);

        return flagRepository
            .findById(flag.getId())
            .map(existingFlag -> {
                if (flag.getType() != null) {
                    existingFlag.setType(flag.getType());
                }
                if (flag.getFlag() != null) {
                    existingFlag.setFlag(flag.getFlag());
                }
                if (flag.getName() != null) {
                    existingFlag.setName(flag.getName());
                }
                if (flag.getDescription() != null) {
                    existingFlag.setDescription(flag.getDescription());
                }

                return existingFlag;
            })
            .map(flagRepository::save);
    }

    /**
     * Get all the flags.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Flag> findAll(Pageable pageable) {
        log.debug("Request to get all Flags");
        return flagRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<Flag> findAllByFlagIn(List<String> flags) {
        log.debug("Request to get all Flags");
        return flagRepository.findAllByFlagIn(flags);
    }

    @Transactional(readOnly = true)
    public Optional<Flag> findByTypeAndFlag(FlagType type, String flag) {
        log.debug("Request to get all Flags");
        return flagRepository.findByTypeAndFlag(type.name(), flag);
    }

    /**
     * Get one flag by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Flag> findOne(Long id) {
        log.debug("Request to get Flag : {}", id);
        return flagRepository.findById(id);
    }

    /**
     * Delete the flag by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Flag : {}", id);
        flagRepository.deleteById(id);
    }
}
