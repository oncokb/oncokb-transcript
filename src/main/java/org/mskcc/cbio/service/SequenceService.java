package org.mskcc.cbio.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.cbio.domain.Sequence;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.repository.SequenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
            .map(
                existingSequence -> {
                    if (sequence.getEntrezGeneId() != null) {
                        existingSequence.setEntrezGeneId(sequence.getEntrezGeneId());
                    }

                    if (sequence.getHugoSymbol() != null) {
                        existingSequence.setHugoSymbol(sequence.getHugoSymbol());
                    }

                    if (sequence.getReferenceGenome() != null) {
                        existingSequence.setReferenceGenome(sequence.getReferenceGenome());
                    }

                    if (sequence.getEnsemblTranscriptId() != null) {
                        existingSequence.setEnsemblTranscriptId(sequence.getEnsemblTranscriptId());
                    }

                    if (sequence.getEnsemblProteinId() != null) {
                        existingSequence.setEnsemblProteinId(sequence.getEnsemblProteinId());
                    }

                    if (sequence.getReferenceSequenceId() != null) {
                        existingSequence.setReferenceSequenceId(sequence.getReferenceSequenceId());
                    }

                    if (sequence.getProteinSequence() != null) {
                        existingSequence.setProteinSequence(sequence.getProteinSequence());
                    }

                    if (sequence.getDescription() != null) {
                        existingSequence.setDescription(sequence.getDescription());
                    }

                    return existingSequence;
                }
            )
            .map(sequenceRepository::save);
    }

    /**
     * Get all the sequences.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Sequence> findAll() {
        log.debug("Request to get all Sequences");
        return sequenceRepository.findAll();
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
     * Get one sequence by ensemble transcript id.
     *
     * @param ensembleTranscriptId the ensembleTranscriptId of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Sequence> findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome referenceGenome, String ensembleTranscriptId) {
        log.debug("Request to get Sequence : {}", ensembleTranscriptId);
        return sequenceRepository.findByReferenceGenomeAndEnsemblTranscriptId(referenceGenome, ensembleTranscriptId);
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
}
