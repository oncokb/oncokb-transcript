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
import org.mskcc.oncokb.transcript.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.transcript.vm.*;
import org.mskcc.oncokb.transcript.vm.ensembl.EnsemblSequence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class TranscriptController {

    private final Logger log = LoggerFactory.getLogger(TranscriptController.class);

    private final GenomeNexusService genomeNexusService;
    private final AlignmentService alignmentService;
    private final TranscriptService transcriptService;
    private final MainService mainService;
    private final EnsemblService ensemblService;
    private final TranscriptMapper transcriptMapper;
    private final EnsemblGeneService ensemblGeneService;

    public TranscriptController(
        GenomeNexusService genomeNexusService,
        AlignmentService alignmentService,
        TranscriptService transcriptService,
        MainService mainService,
        EnsemblService ensemblService,
        EnsemblGeneService ensemblGeneService,
        TranscriptMapper transcriptMapper
    ) {
        this.genomeNexusService = genomeNexusService;
        this.alignmentService = alignmentService;
        this.transcriptService = transcriptService;
        this.mainService = mainService;
        this.ensemblService = ensemblService;
        this.ensemblGeneService = ensemblGeneService;
        this.transcriptMapper = transcriptMapper;
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

    @PostMapping("/compare-ensembl-transcript")
    public ResponseEntity<TranscriptComparisonResultVM> compareEnsemblTranscript(
        @RequestBody TranscriptComparisonVM transcriptComparisonVM
    ) throws ApiException {
        TranscriptComparisonResultVM result = new TranscriptComparisonResultVM();

        Optional<EnsemblSequence> sequenceA = ensemblService.getProteinSequence(
            transcriptComparisonVM.getTranscriptA().getReferenceGenome(),
            transcriptComparisonVM.getTranscriptA().getTranscript()
        );
        result.setSequenceA(sequenceA.orElse(new EnsemblSequence()).getSeq());

        Optional<EnsemblSequence> sequenceB = ensemblService.getProteinSequence(
            transcriptComparisonVM.getTranscriptB().getReferenceGenome(),
            transcriptComparisonVM.getTranscriptB().getTranscript()
        );
        result.setSequenceB(sequenceB.orElse(new EnsemblSequence()).getSeq());

        // do a quick check whether the protein is the same
        if (sequenceA.isPresent() && sequenceB.isPresent()) {
            if (sequenceA.get().getSeq().equals(sequenceB.get().getSeq())) {
                result.setMatch(true);
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

    @PostMapping("/get-alignments/{hugoSymbol}")
    public ResponseEntity<List<EnrichedAlignmentResult>> getAlignments(
        @PathVariable String hugoSymbol,
        @RequestBody MatchTranscriptVM matchTranscriptVM
    ) throws ApiException {
        // Find whether both transcript length are the same

        Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
            hugoSymbol,
            matchTranscriptVM.getTranscript()
        );
        if (ensemblTranscriptOptional.isPresent()) {
            EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
            List<EnsemblTranscript> targetEnsemblTranscripts = transcriptService.getEnsemblTranscriptList(
                hugoSymbol,
                matchTranscriptVM.getTargetReferenceGenome()
            );
            return new ResponseEntity<>(
                transcriptService.getAlignmentResult(
                    matchTranscriptVM.getTranscript().getReferenceGenome(),
                    ensemblTranscript,
                    matchTranscriptVM.getTargetReferenceGenome(),
                    targetEnsemblTranscripts
                ),
                HttpStatus.OK
            );
        } else {
            throw new ApiException("Cannot find  reference transcript.");
        }
    }

    @GetMapping("/get-transcript/{hugoSymbol}")
    public ResponseEntity<TranscriptResultVM> getTranscript(@PathVariable String hugoSymbol) {
        EnsemblTranscript grch37Transcript = null;
        try {
            grch37Transcript = transcriptService.getCanonicalEnsemblTranscript(hugoSymbol, ReferenceGenome.GRCh37);
        } catch (ApiException e) {
            e.printStackTrace();
        }
        TranscriptPairVM transcriptPairVM = new TranscriptPairVM();
        transcriptPairVM.setReferenceGenome(ReferenceGenome.GRCh37);
        transcriptPairVM.setTranscript(grch37Transcript.getTranscriptId());
        TranscriptMatchResultVM transcriptMatchResultVM = transcriptService.matchTranscript(
            transcriptPairVM,
            ReferenceGenome.GRCh38,
            hugoSymbol
        );

        TranscriptResultVM transcriptResultVM = new TranscriptResultVM();
        transcriptResultVM.setGrch37Transcript(transcriptMatchResultVM.getOriginalEnsemblTranscript());
        transcriptResultVM.setGrch38Transcript(transcriptMatchResultVM.getTargetEnsemblTranscript());
        transcriptResultVM.setNote(transcriptMatchResultVM.getNote());

        return new ResponseEntity<>(transcriptResultVM, HttpStatus.OK);
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

    @GetMapping("/get-sequence")
    public ResponseEntity<String> getTranscript(@RequestParam ReferenceGenome referenceGenome, @RequestParam String transcript) {
        Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(transcript, referenceGenome);
        if (ensemblTranscriptOptional.isPresent() && ensemblTranscriptOptional.get().getProteinId() != null) {
            Optional<EnsemblSequence> sequence = ensemblService.getProteinSequence(
                referenceGenome,
                ensemblTranscriptOptional.get().getProteinId()
            );
            if (sequence.isPresent()) {
                return new ResponseEntity<>(sequence.get().getSeq(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
            }
        } else {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
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

    @GetMapping("/find-grch38-variant")
    public ResponseEntity<TranscriptSuggestionVM> findGrch38Variant(
        @RequestParam String referenceAminoAcid,
        @RequestParam Integer proteinPosition,
        @RequestParam String grch37ProteinId,
        @RequestParam String grch38ProteinId
    ) {
        TranscriptSuggestionVM transcriptSuggestionVM = new TranscriptSuggestionVM();
        transcriptSuggestionVM.setReferenceGenome(ReferenceGenome.GRCh38);
        Optional<EnsemblSequence> grch37Sequence = ensemblService.getProteinSequence(ReferenceGenome.GRCh37, grch37ProteinId);
        Optional<EnsemblSequence> grch38Sequence = ensemblService.getProteinSequence(ReferenceGenome.GRCh38, grch38ProteinId);

        if (grch37Sequence.isPresent()) {
            if (grch38Sequence.isPresent()) {
                AlignmentResult alignmentResult =
                    this.alignmentService.calcOptimalAlignment(grch37Sequence.get().getSeq(), grch38Sequence.get().getSeq(), false);
                int matchedIndex = findMatchedIndex(alignmentResult.getRefSeq(), proteinPosition);
                String refAA = String.valueOf(alignmentResult.getRefSeq().charAt(matchedIndex));
                if (refAA.equals(referenceAminoAcid)) {
                    int matchedProteinPosition = findMatchedProteinPosition(alignmentResult.getTargetSeq(), matchedIndex);
                    transcriptSuggestionVM.setSuggestions(
                        Collections.singletonList(
                            alignmentResult.getTargetSeq().substring(matchedIndex, matchedIndex + 1) + matchedProteinPosition
                        )
                    );
                    if (alignmentResult.getPenalty() > PENALTY_THRESHOLD) {
                        transcriptSuggestionVM.setNote(
                            "The suggestions come from an alignment that above penalty threshold 5. The penalty: " +
                            alignmentResult.getPenalty()
                        );
                    }
                } else {
                    transcriptSuggestionVM.setNote(
                        "GRCh37 reference does not match on the position " +
                        proteinPosition +
                        ". Given:" +
                        referenceAminoAcid +
                        " Actual:" +
                        refAA
                    );
                }
            } else {
                transcriptSuggestionVM.setNote("GRCh38 protein id does not have sequence");
            }
        } else {
            transcriptSuggestionVM.setNote("GRCh37 protein id does not have sequence");
        }
        return new ResponseEntity<>(transcriptSuggestionVM, HttpStatus.OK);
    }

    @PostMapping("/add-transcript")
    public ResponseEntity<Void> addTranscript(
        @RequestParam int entrezGeneId,
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam String ensemblTranscriptId
    ) throws ApiException {
        mainService.createTranscript(referenceGenome, ensemblTranscriptId, entrezGeneId);
        return new ResponseEntity<>(null, HttpStatus.OK);
    }
}
