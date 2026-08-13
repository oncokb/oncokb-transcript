package org.mskcc.oncokb.transcript.web.rest;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.transcript.domain.EnsemblGene;
import org.mskcc.oncokb.transcript.domain.Sequence;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.SequenceType;
import org.mskcc.oncokb.transcript.repository.CanonicalSequenceJdbcRepository;
import org.mskcc.oncokb.transcript.service.EnsemblGeneService;
import org.mskcc.oncokb.transcript.service.SequenceService;
import org.mskcc.oncokb.transcript.service.TranscriptService;
import org.mskcc.oncokb.transcript.service.dto.TranscriptDTO;
import org.mskcc.oncokb.transcript.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.transcript.vm.CanonicalProteinSequenceVM;
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
    private final CanonicalSequenceJdbcRepository canonicalSequenceJdbcRepository;

    private final TranscriptMapper transcriptMapper;

    public SequenceController(
        EnsemblGeneService ensemblGeneService,
        TranscriptService transcriptService,
        TranscriptMapper transcriptMapper,
        SequenceService sequenceService,
        CanonicalSequenceJdbcRepository canonicalSequenceJdbcRepository
    ) {
        this.ensemblGeneService = ensemblGeneService;
        this.transcriptService = transcriptService;
        this.transcriptMapper = transcriptMapper;
        this.sequenceService = sequenceService;
        this.canonicalSequenceJdbcRepository = canonicalSequenceJdbcRepository;
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

    /**
     * The canonical protein sequence of a gene, resolved with a single SQL statement instead of
     * walking the entity graph.
     */
    @GetMapping("/find-canonical-protein-sequences")
    public CanonicalProteinSequenceVM findCanonicalProteinSequence(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam Integer entrezGeneId
    ) {
        log.debug("GET request to get canonical protein sequence by Gene: {} {}", referenceGenome, entrezGeneId);
        return canonicalSequenceJdbcRepository.findCanonicalProteinSequence(referenceGenome, entrezGeneId);
    }

    /**
     * The canonical protein sequences of any number of genes, resolved with a single SQL statement
     * instead of one entity graph walk per gene.
     */
    @PostMapping("/find-canonical-protein-sequences")
    public List<CanonicalProteinSequenceVM> findCanonicalProteinSequences(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestBody List<Integer> entrezGeneIds
    ) {
        log.debug("POST request to get canonical protein sequences");
        return canonicalSequenceJdbcRepository.findCanonicalProteinSequences(referenceGenome, entrezGeneIds);
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
