package org.mskcc.oncokb.transcript.web.rest;

import java.util.*;
import java.util.stream.Collectors;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.oncokb.transcript.domain.AlignmentResult;
import org.mskcc.oncokb.transcript.domain.EnrichedAlignmentResult;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.service.*;
import org.mskcc.oncokb.transcript.service.dto.TranscriptDTO;
import org.mskcc.oncokb.transcript.vm.*;
import org.mskcc.oncokb.transcript.vm.ensembl.EnsemblSequence;
import org.mskcc.oncokb.transcript.web.rest.model.AddTranscriptBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TranscriptController {

    private final Logger log = LoggerFactory.getLogger(TranscriptController.class);

    private final AlignmentService alignmentService;
    private final TranscriptService transcriptService;
    private final MainService mainService;
    private final EnsemblService ensemblService;

    public TranscriptController(
        AlignmentService alignmentService,
        TranscriptService transcriptService,
        MainService mainService,
        EnsemblService ensemblService
    ) {
        this.alignmentService = alignmentService;
        this.transcriptService = transcriptService;
        this.mainService = mainService;
        this.ensemblService = ensemblService;
    }

    @PostMapping("/compare-transcript/{hugoSymbol}")
    public ResponseEntity<TranscriptComparisonResultVM> compareTranscript(
        @PathVariable String hugoSymbol,
        @RequestBody TranscriptComparisonVM transcriptComparisonVM
    ) throws Exception {
        TranscriptComparisonResultVM result = new TranscriptComparisonResultVM();

        // Find whether both transcript length are the same
        Optional<EnsemblTranscript> ensemblA = transcriptService.getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptA());
        Optional<EnsemblTranscript> ensemblB = transcriptService.getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptB());

        if (ensemblA.isEmpty()) {
            return new ResponseEntity("TranscriptA does not exist.", HttpStatus.BAD_REQUEST);
        }
        if (ensemblB.isEmpty()) {
            return new ResponseEntity("TranscriptB does not exist.", HttpStatus.BAD_REQUEST);
        }
        Optional<EnsemblSequence> sequenceA = Optional.of(new EnsemblSequence());
        if (ensemblA.isPresent()) {
            sequenceA =
                ensemblService.getProteinSequence(
                    transcriptComparisonVM.getTranscriptA().getReferenceGenome(),
                    ensemblA.get().getProteinId()
                );
        }

        Optional<EnsemblSequence> sequenceB = Optional.of(new EnsemblSequence());
        if (ensemblB.isPresent()) {
            sequenceB =
                ensemblService.getProteinSequence(
                    transcriptComparisonVM.getTranscriptB().getReferenceGenome(),
                    ensemblB.get().getProteinId()
                );
        }
        if (transcriptComparisonVM.getAlign()) {
            AlignmentResult alignmentResult = alignmentService.calcOptimalAlignment(
                sequenceA.get().getSeq(),
                sequenceB.get().getSeq(),
                false
            );
            result.setSequenceA(alignmentResult.getRefSeq());
            result.setSequenceB(alignmentResult.getTargetSeq());
        } else {
            result.setSequenceA(sequenceA.get().getSeq());
            result.setSequenceB(sequenceB.get().getSeq());
        }

        if (ensemblA.isPresent() && ensemblB.isPresent() && ensemblA.get().getProteinLength().equals(ensemblB.get().getProteinLength())) {
            // do a quick check whether the protein is the same
            if (sequenceA.isPresent() && sequenceB.isPresent()) {
                if (sequenceA.get().getSeq().equals(sequenceB.get().getSeq())) {
                    result.setMatch(true);
                }
            }
        }

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/match-transcript/{hugoSymbol}")
    public ResponseEntity<TranscriptMatchResultVM> matchTranscript(
        @PathVariable String hugoSymbol,
        @RequestBody MatchTranscriptVM matchTranscriptVM
    ) throws ApiException {
        // Find whether both transcript length are the same
        return new ResponseEntity<>(
            transcriptService.matchTranscript(matchTranscriptVM.getTranscript(), matchTranscriptVM.getTargetReferenceGenome(), hugoSymbol),
            HttpStatus.OK
        );
    }

    @PostMapping("/find-transcripts-by-ensembl-ids")
    public ResponseEntity<List<TranscriptDTO>> findTranscriptsByEnsemblIds(
        @RequestParam ReferenceGenome referenceGenome,
        @RequestBody List<String> ensemblTranscriptIds
    ) {
        return new ResponseEntity<>(
            transcriptService.findByReferenceGenomeAndEnsemblTranscriptIdIsIn(referenceGenome, ensemblTranscriptIds),
            HttpStatus.OK
        );
    }

    private int findMatchedIndex(String sequence, int proteinPosition) {
        int count = 0;
        int matchedIndex = -1;
        for (int i = 0; i < sequence.length(); i++) {
            if (sequence.charAt(i) != "_".charAt(0)) {
                count++;
                if (proteinPosition == count) {
                    matchedIndex = i;
                    break;
                }
            }
        }

        return matchedIndex;
    }

    private int findMatchedProteinPosition(String sequence, int index) {
        int count = 0;
        for (int i = 0; i < sequence.substring(0, index + 1).length(); i++) {
            if (sequence.charAt(i) != "_".charAt(0)) {
                count++;
            }
        }
        return count;
    }

    private final int PENALTY_THRESHOLD = 5;

    @GetMapping("/suggest-variant/{hugoSymbol}")
    public ResponseEntity<AllReferenceTranscriptSuggestionVM> suggestVariant(
        @PathVariable String hugoSymbol,
        @RequestParam Integer proteinPosition,
        @RequestParam String curatedResidue,
        @RequestParam String grch37Transcript,
        @RequestParam String grch38Transcript
    ) {
        AllReferenceTranscriptSuggestionVM allReferenceTranscriptSuggestionVM = new AllReferenceTranscriptSuggestionVM();

        List<EnsemblTranscript> ensembl37Transcripts = transcriptService.getTranscriptsWithMatchedResidue(
            ReferenceGenome.GRCh37,
            transcriptService.getEnsemblTranscriptList(hugoSymbol, ReferenceGenome.GRCh37),
            proteinPosition,
            curatedResidue
        );
        List<EnsemblTranscript> ensembl38Transcripts = transcriptService.getTranscriptsWithMatchedResidue(
            ReferenceGenome.GRCh38,
            transcriptService.getEnsemblTranscriptList(hugoSymbol, ReferenceGenome.GRCh38),
            proteinPosition,
            curatedResidue
        );

        if (ensembl37Transcripts.size() == 0) {
            allReferenceTranscriptSuggestionVM.getGrch37().setNote("No GRCh37 transcript has the curated residue");
        } else {
            Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                grch37Transcript,
                ReferenceGenome.GRCh37
            );
            if (ensemblTranscriptOptional.isPresent()) {
                if (
                    ensembl37Transcripts
                        .stream()
                        .filter(ensemblTranscript ->
                            ensemblTranscript.getTranscriptId().equals(ensemblTranscriptOptional.get().getTranscriptId())
                        )
                        .findAny()
                        .isPresent()
                ) {
                    allReferenceTranscriptSuggestionVM.getGrch37().setNote("Exact match");
                } else {
                    List<EnrichedAlignmentResult> alignmentResults = transcriptService.getAlignmentResult(
                        ReferenceGenome.GRCh37,
                        ensemblTranscriptOptional.get(),
                        ReferenceGenome.GRCh37,
                        ensembl37Transcripts
                    );
                    List<EnrichedAlignmentResult> belowThresholdPenalty = alignmentResults
                        .stream()
                        .filter(enrichedAlignmentResult -> enrichedAlignmentResult.getPenalty() <= PENALTY_THRESHOLD)
                        .collect(Collectors.toList());
                    if (belowThresholdPenalty.size() == 0) {
                        allReferenceTranscriptSuggestionVM.getGrch37().setNote("No easy alignment has been performed.");
                    } else {
                        allReferenceTranscriptSuggestionVM
                            .getGrch37()
                            .setSuggestions(
                                belowThresholdPenalty
                                    .stream()
                                    .map(enrichedAlignmentResult -> {
                                        int matchedIndex = findMatchedIndex(enrichedAlignmentResult.getTargetSeq(), proteinPosition);
                                        int matchedProteinPosition = findMatchedProteinPosition(
                                            enrichedAlignmentResult.getRefSeq(),
                                            matchedIndex
                                        );
                                        return (
                                            enrichedAlignmentResult.getTargetSeq().substring(matchedIndex, matchedIndex + 1) +
                                            matchedProteinPosition
                                        );
                                    })
                                    .collect(Collectors.toList())
                            );
                    }
                }
            } else {
                allReferenceTranscriptSuggestionVM.getGrch37().setNote("Cannot find the GRCh37 transcript");
            }
        }
        if (ensembl38Transcripts.size() == 0) {
            allReferenceTranscriptSuggestionVM.getGrch38().setNote("No GRCh38 transcript has the curated residue");
        } else {
            Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                grch38Transcript,
                ReferenceGenome.GRCh38
            );
            if (ensemblTranscriptOptional.isPresent()) {
                if (
                    ensembl38Transcripts
                        .stream()
                        .filter(ensemblTranscript ->
                            ensemblTranscript.getTranscriptId().equals(ensemblTranscriptOptional.get().getTranscriptId())
                        )
                        .findAny()
                        .isPresent()
                ) {
                    allReferenceTranscriptSuggestionVM.getGrch38().setNote("Exact match");
                } else {
                    List<EnrichedAlignmentResult> alignmentResults = transcriptService.getAlignmentResult(
                        ReferenceGenome.GRCh38,
                        ensemblTranscriptOptional.get(),
                        ReferenceGenome.GRCh38,
                        ensembl38Transcripts
                    );
                    List<EnrichedAlignmentResult> belowThresholdPenalty = alignmentResults
                        .stream()
                        .filter(enrichedAlignmentResult -> enrichedAlignmentResult.getPenalty() <= PENALTY_THRESHOLD)
                        .collect(Collectors.toList());
                    if (belowThresholdPenalty.size() == 0) {
                        allReferenceTranscriptSuggestionVM.getGrch38().setNote("No easy alignment has been performed.");
                    } else {
                        allReferenceTranscriptSuggestionVM
                            .getGrch38()
                            .setSuggestions(
                                belowThresholdPenalty
                                    .stream()
                                    .map(enrichedAlignmentResult -> {
                                        int matchedIndex = findMatchedIndex(enrichedAlignmentResult.getTargetSeq(), proteinPosition);
                                        int matchedProteinPosition = findMatchedProteinPosition(
                                            enrichedAlignmentResult.getRefSeq(),
                                            matchedIndex
                                        );
                                        return (
                                            enrichedAlignmentResult.getTargetSeq().substring(matchedIndex, matchedIndex + 1) +
                                            matchedProteinPosition
                                        );
                                    })
                                    .collect(Collectors.toList())
                            );
                    }
                }
            } else {
                allReferenceTranscriptSuggestionVM.getGrch38().setNote("Cannot find the GRCh38transcript");
            }
        }

        return new ResponseEntity<>(allReferenceTranscriptSuggestionVM, HttpStatus.OK);
    }

    @PostMapping("/add-transcript")
    public ResponseEntity<TranscriptDTO> addTranscript(@RequestBody AddTranscriptBody body) throws ApiException {
        Optional<TranscriptDTO> transcriptDTOOptional = mainService.createTranscript(
            ReferenceGenome.valueOf(body.getReferenceGenome()),
            body.getEnsemblTranscriptId(),
            body.getEntrezGeneId(),
            body.getCanonical()
        );
        return new ResponseEntity<>(
            transcriptDTOOptional.get(),
            transcriptDTOOptional.isPresent() ? HttpStatus.OK : HttpStatus.BAD_REQUEST
        );
    }
}
