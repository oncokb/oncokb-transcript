package org.mskcc.oncokb.transcript.web.rest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.EnsemblGene;
import org.mskcc.oncokb.transcript.domain.Sequence;
import org.mskcc.oncokb.transcript.domain.Transcript;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.SequenceType;
import org.mskcc.oncokb.transcript.service.EnsemblGeneService;
import org.mskcc.oncokb.transcript.service.SequenceService;
import org.mskcc.oncokb.transcript.service.TranscriptService;
import org.mskcc.oncokb.transcript.service.dto.TranscriptDTO;
import org.mskcc.oncokb.transcript.service.mapper.TranscriptMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing {@link org.mskcc.oncokb.transcript.domain.Sequence}.
 */
@RestController
@RequestMapping("/api")
public class SequenceController {

    private final Logger log = LoggerFactory.getLogger(SequenceController.class);

    private final EnsemblGeneService ensemblGeneService;
    private final TranscriptService transcriptService;
    private final SequenceService sequenceService;

    private final TranscriptMapper transcriptMapper;

    public SequenceController(
        EnsemblGeneService ensemblGeneService,
        TranscriptService transcriptService,
        TranscriptMapper transcriptMapper,
        SequenceService sequenceService
    ) {
        this.ensemblGeneService = ensemblGeneService;
        this.transcriptService = transcriptService;
        this.transcriptMapper = transcriptMapper;
        this.sequenceService = sequenceService;
    }

    @GetMapping("/find-sequences")
    public List<Sequence> findSequences(@RequestParam ReferenceGenome referenceGenome, @RequestParam Integer entrezGeneId) {
        log.debug("REST request to get sequences by Gene: {} {}", referenceGenome, entrezGeneId);
        List<Sequence> sequences = new ArrayList<>();

        Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findCanonicalEnsemblGene(entrezGeneId, referenceGenome);
        if (ensemblGeneOptional.isPresent()) {
            List<TranscriptDTO> transcriptDTOs = transcriptService.findByEnsemblGene(ensemblGeneOptional.get());
            transcriptDTOs.forEach(transcriptDTO -> {
                Transcript transcript = transcriptMapper.toEntity(transcriptDTO);
                Optional<Sequence> sequenceOptional = sequenceService.findOneByTranscriptAndSequenceType(transcript, SequenceType.PROTEIN);
                if (sequenceOptional.isPresent()) {
                    sequences.add(sequenceOptional.get());
                }
            });
        }
        return sequences;
    }
}
