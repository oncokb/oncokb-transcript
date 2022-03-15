package org.mskcc.oncokb.curation.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Info;
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;
import org.mskcc.oncokb.curation.repository.InfoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Info}.
 */
@Service
@Transactional
public class InfoService {

    private final Logger log = LoggerFactory.getLogger(InfoService.class);

    private final InfoRepository infoRepository;

    public InfoService(InfoRepository infoRepository) {
        this.infoRepository = infoRepository;
    }

    /**
     * Save a info.
     *
     * @param info the entity to save.
     * @return the persisted entity.
     */
    public Info save(Info info) {
        log.debug("Request to save Info : {}", info);
        return infoRepository.save(info);
    }

    /**
     * Partially update a info.
     *
     * @param info the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Info> partialUpdate(Info info) {
        log.debug("Request to partially update Info : {}", info);

        return infoRepository
            .findById(info.getId())
            .map(existingInfo -> {
                if (info.getType() != null) {
                    existingInfo.setType(info.getType());
                }
                if (info.getValue() != null) {
                    existingInfo.setValue(info.getValue());
                }
                if (info.getLastUpdated() != null) {
                    existingInfo.setLastUpdated(info.getLastUpdated());
                }

                return existingInfo;
            })
            .map(infoRepository::save);
    }

    /**
     * Get all the infos.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Info> findAll() {
        log.debug("Request to get all Infos");
        return infoRepository.findAll();
    }

    /**
     * Get one info by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Info> findOne(Long id) {
        log.debug("Request to get Info : {}", id);
        return infoRepository.findById(id);
    }

    /**
     * Delete the info by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Info : {}", id);
        infoRepository.deleteById(id);
    }

    public void updateInfo(InfoType infoType, String newValue, Instant newLastUpdated) {
        Optional<Info> infoRecord = this.infoRepository.findOneByType(infoType);
        if (infoRecord.isPresent()) {
            infoRecord.get().setValue(newValue);
            infoRecord.get().setLastUpdated(newLastUpdated);
            this.infoRepository.save(infoRecord.get());
        } else {
            Info info = new Info();
            info.setType(infoType);
            info.setValue(newValue);
            info.setLastUpdated(newLastUpdated);
            this.infoRepository.save(info);
        }
    }
}
