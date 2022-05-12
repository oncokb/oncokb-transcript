package org.mskcc.oncokb.curation.web.rest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.mskcc.oncokb.curation.service.MainService;
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

    private final MainService mainService;

    public SequenceController(MainService mainService) {
        this.mainService = mainService;
    }

    @GetMapping("/find-canonical-sequences")
    public Sequence findCanonicalSequence(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam Integer entrezGeneId,
        @RequestParam(defaultValue = "PROTEIN") SequenceType sequenceType
    ) {
        log.debug("GET request to get canonical protein sequence by Gene: {} {}", referenceGenome, entrezGeneId);
        return mainService.findSequenceByGene(referenceGenome, entrezGeneId, sequenceType).orElse(null);
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
                .map(entrezGeneId -> mainService.findSequenceByGene(referenceGenome, entrezGeneId, sequenceType))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
        }
    }
}
