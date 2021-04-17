package org.mskcc.oncokb.transcript.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.Transcript;
import org.mskcc.oncokb.transcript.repository.TranscriptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Transcript}.
 */
@Service
@Transactional
public class TranscriptService {

    private final Logger log = LoggerFactory.getLogger(TranscriptService.class);

    private final TranscriptRepository transcriptRepository;

    public TranscriptService(TranscriptRepository transcriptRepository) {
        this.transcriptRepository = transcriptRepository;
    }

    /**
     * Save a transcript.
     *
     * @param transcript the entity to save.
     * @return the persisted entity.
     */
    public Transcript save(Transcript transcript) {
        log.debug("Request to save Transcript : {}", transcript);
        return transcriptRepository.save(transcript);
    }

    /**
     * Partially update a transcript.
     *
     * @param transcript the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Transcript> partialUpdate(Transcript transcript) {
        log.debug("Request to partially update Transcript : {}", transcript);

        return transcriptRepository
            .findById(transcript.getId())
            .map(
                existingTranscript -> {
                    if (transcript.getEntrezGeneId() != null) {
                        existingTranscript.setEntrezGeneId(transcript.getEntrezGeneId());
                    }

                    if (transcript.getHugoSymbol() != null) {
                        existingTranscript.setHugoSymbol(transcript.getHugoSymbol());
                    }

                    if (transcript.getReferenceGenome() != null) {
                        existingTranscript.setReferenceGenome(transcript.getReferenceGenome());
                    }

                    if (transcript.getEnsemblTranscriptId() != null) {
                        existingTranscript.setEnsemblTranscriptId(transcript.getEnsemblTranscriptId());
                    }

                    if (transcript.getEnsemblProteinId() != null) {
                        existingTranscript.setEnsemblProteinId(transcript.getEnsemblProteinId());
                    }

                    if (transcript.getReferenceSequenceId() != null) {
                        existingTranscript.setReferenceSequenceId(transcript.getReferenceSequenceId());
                    }

                    if (transcript.getDescription() != null) {
                        existingTranscript.setDescription(transcript.getDescription());
                    }

                    return existingTranscript;
                }
            )
            .map(transcriptRepository::save);
    }

    /**
     * Get all the transcripts.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Transcript> findAll() {
        log.debug("Request to get all Transcripts");
        return transcriptRepository.findAll();
    }

    /**
     * Get one transcript by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Transcript> findOne(Long id) {
        log.debug("Request to get Transcript : {}", id);
        return transcriptRepository.findById(id);
    }

    /**
     * Delete the transcript by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Transcript : {}", id);
        transcriptRepository.deleteById(id);
    }
}
