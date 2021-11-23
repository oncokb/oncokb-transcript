package org.mskcc.oncokb.transcript.web.rest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.transcript.domain.Sequence;
import org.mskcc.oncokb.transcript.domain.Transcript;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.SequenceType;
import org.mskcc.oncokb.transcript.domain.enumeration.UsageSource;
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

    private final TranscriptService transcriptService;
    private final SequenceService sequenceService;

    private final TranscriptMapper transcriptMapper;

    public SequenceController(TranscriptService transcriptService, TranscriptMapper transcriptMapper, SequenceService sequenceService) {
        this.transcriptService = transcriptService;
        this.transcriptMapper = transcriptMapper;
        this.sequenceService = sequenceService;
    }

    @GetMapping("/sequences-by-usage-source")
    public List<Sequence> findSequencesByUsageSource(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam UsageSource usageSource,
        @RequestParam(required = false) String hugoSymbol
    ) {
        log.debug("REST request to get sequences by usage source Gene : {} {}", usageSource, hugoSymbol);
        List<TranscriptDTO> transcriptDTOS;
        if (StringUtils.isEmpty(hugoSymbol)) {
            transcriptDTOS = transcriptService.findByReferenceGenomeAndSource(referenceGenome, usageSource);
        } else {
            transcriptDTOS = transcriptService.findByReferenceGenomeAndSourceAndHugoSymbol(referenceGenome, usageSource, hugoSymbol);
        }
        List<Sequence> sequences = new ArrayList<>();
        transcriptDTOS.forEach(transcriptDTO -> {
            Transcript transcript = transcriptMapper.toEntity(transcriptDTO);
            Optional<Sequence> sequenceOptional = sequenceService.findOneByTranscriptAndSequenceType(transcript, SequenceType.PROTEIN);
            if (sequenceOptional.isPresent()) {
                sequences.add(sequenceOptional.get());
            }
        });
        return sequences;
    }
}
