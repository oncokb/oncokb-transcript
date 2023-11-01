package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.History;
import org.mskcc.oncokb.curation.repository.HistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link History}.
 */
@Service
@Transactional
public class HistoryService {

    private final Logger log = LoggerFactory.getLogger(HistoryService.class);

    private final HistoryRepository historyRepository;

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    /**
     * Save a history.
     *
     * @param history the entity to save.
     * @return the persisted entity.
     */
    public History save(History history) {
        log.debug("Request to save History : {}", history);
        return historyRepository.save(history);
    }

    /**
     * Partially update a history.
     *
     * @param history the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<History> partialUpdate(History history) {
        log.debug("Request to partially update History : {}", history);

        return historyRepository
            .findById(history.getId())
            .map(existingHistory -> {
                if (history.getType() != null) {
                    existingHistory.setType(history.getType());
                }
                if (history.getUpdatedTime() != null) {
                    existingHistory.setUpdatedTime(history.getUpdatedTime());
                }
                if (history.getUpdatedBy() != null) {
                    existingHistory.setUpdatedBy(history.getUpdatedBy());
                }
                if (history.getEntityName() != null) {
                    existingHistory.setEntityName(history.getEntityName());
                }
                if (history.getEntityId() != null) {
                    existingHistory.setEntityId(history.getEntityId());
                }

                return existingHistory;
            })
            .map(historyRepository::save);
    }

    /**
     * Get all the histories.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<History> findAll(Pageable pageable) {
        log.debug("Request to get all Histories");
        return historyRepository.findAll(pageable);
    }

    /**
     * Get one history by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<History> findOne(Long id) {
        log.debug("Request to get History : {}", id);
        return historyRepository.findById(id);
    }

    /**
     * Delete the history by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete History : {}", id);
        historyRepository.deleteById(id);
    }
}
