package org.mskcc.oncokb.curation.web.rest;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.mskcc.oncokb.curation.service.EnsemblGeneService;
import org.mskcc.oncokb.curation.service.SequenceService;
import org.mskcc.oncokb.curation.service.TranscriptService;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing {@link org.mskcc.oncokb.curation.domain.Sequence}.
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

    @GetMapping("/find-canonical-sequences")
    public Sequence findCanonicalSequence(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam Integer entrezGeneId,
        @RequestParam(defaultValue = "PROTEIN") SequenceType sequenceType
    ) {
        log.debug("GET request to get canonical protein sequence by Gene: {} {}", referenceGenome, entrezGeneId);
        return findSequence(referenceGenome, entrezGeneId, sequenceType);
    }

    @PostMapping("/find-canonical-sequences")
    public List<Sequence> findCanonicalSequences(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam(defaultValue = "PROTEIN") SequenceType sequenceType,
        @RequestBody List<Integer> entrezGeneIds
    ) {
        log.debug("POST request to get canonical protein sequences");
        if (entrezGeneIds == null || entrezGeneIds.isEmpty()) {
            return new ArrayList<>();
        } else {
            return entrezGeneIds
                .stream()
                .map(entrezGeneId -> findSequence(referenceGenome, entrezGeneId, sequenceType))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        }
    }

    private Sequence findSequence(ReferenceGenome referenceGenome, Integer entrezGeneId, SequenceType sequenceType) {
        Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findCanonicalEnsemblGene(entrezGeneId, referenceGenome);
        if (ensemblGeneOptional.isPresent()) {
            Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByEnsemblGeneAndCanonicalIsTrue(
                ensemblGeneOptional.get()
            );
            if (transcriptDTOOptional.isPresent()) {
                Optional<Sequence> sequenceOptional = sequenceService.findOneByTranscriptAndSequenceType(
                    transcriptMapper.toEntity(transcriptDTOOptional.get()),
                    sequenceType
                );
                if (sequenceOptional.isPresent()) {
                    return sequenceOptional.get();
                }
            }
        }
        return null;
    }
}
