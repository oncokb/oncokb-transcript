package org.mskcc.oncokb.transcript.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.TranscriptUsage;
import org.mskcc.oncokb.transcript.repository.TranscriptUsageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link TranscriptUsage}.
 */
@Service
@Transactional
public class TranscriptUsageService {

    private final Logger log = LoggerFactory.getLogger(TranscriptUsageService.class);

    private final TranscriptUsageRepository transcriptUsageRepository;

    public TranscriptUsageService(TranscriptUsageRepository transcriptUsageRepository) {
        this.transcriptUsageRepository = transcriptUsageRepository;
    }

    /**
     * Save a transcriptUsage.
     *
     * @param transcriptUsage the entity to save.
     * @return the persisted entity.
     */
    public TranscriptUsage save(TranscriptUsage transcriptUsage) {
        log.debug("Request to save TranscriptUsage : {}", transcriptUsage);
        return transcriptUsageRepository.save(transcriptUsage);
    }

    /**
     * Partially update a transcriptUsage.
     *
     * @param transcriptUsage the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TranscriptUsage> partialUpdate(TranscriptUsage transcriptUsage) {
        log.debug("Request to partially update TranscriptUsage : {}", transcriptUsage);

        return transcriptUsageRepository
            .findById(transcriptUsage.getId())
            .map(
                existingTranscriptUsage -> {
                    if (transcriptUsage.getSource() != null) {
                        existingTranscriptUsage.setSource(transcriptUsage.getSource());
                    }

                    return existingTranscriptUsage;
                }
            )
            .map(transcriptUsageRepository::save);
    }

    /**
     * Get all the transcriptUsages.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<TranscriptUsage> findAll() {
        log.debug("Request to get all TranscriptUsages");
        return transcriptUsageRepository.findAll();
    }

    /**
     * Get one transcriptUsage by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TranscriptUsage> findOne(Long id) {
        log.debug("Request to get TranscriptUsage : {}", id);
        return transcriptUsageRepository.findById(id);
    }

    /**
     * Delete the transcriptUsage by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete TranscriptUsage : {}", id);
        transcriptUsageRepository.deleteById(id);
    }
}
