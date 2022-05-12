package org.mskcc.oncokb.curation.service;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.mskcc.oncokb.curation.repository.SequenceRepository;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Sequence}.
 */
@Service
@Transactional
public class SequenceService {

    private final Logger log = LoggerFactory.getLogger(SequenceService.class);

    private final SequenceRepository sequenceRepository;

    public SequenceService(SequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    /**
     * Save a sequence.
     *
     * @param sequence the entity to save.
     * @return the persisted entity.
     */
    public Sequence save(Sequence sequence) {
        log.debug("Request to save Sequence : {}", sequence);
        return sequenceRepository.save(sequence);
    }

    /**
     * Partially update a sequence.
     *
     * @param sequence the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Sequence> partialUpdate(Sequence sequence) {
        log.debug("Request to partially update Sequence : {}", sequence);

        return sequenceRepository
            .findById(sequence.getId())
            .map(existingSequence -> {
                if (sequence.getSequenceType() != null) {
                    existingSequence.setSequenceType(sequence.getSequenceType());
                }
                if (sequence.getSequence() != null) {
                    existingSequence.setSequence(sequence.getSequence());
                }

                return existingSequence;
            })
            .map(sequenceRepository::save);
    }

    /**
     * Get all the sequences.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Sequence> findAll(Pageable pageable) {
        log.debug("Request to get all Sequences");
        return sequenceRepository.findAll(pageable);
    }

    /**
     * Get one sequence by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Sequence> findOne(Long id) {
        log.debug("Request to get Sequence : {}", id);
        return sequenceRepository.findById(id);
    }

    /**
     * Delete the sequence by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Sequence : {}", id);
        sequenceRepository.deleteById(id);
    }

    public Optional<Sequence> findOneByTranscriptAndSequenceType(Transcript transcript, SequenceType sequenceType) {
        return sequenceRepository.findOneByTranscriptAndSequenceType(transcript, sequenceType);
    }
}
