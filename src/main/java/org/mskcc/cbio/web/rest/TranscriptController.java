package org.mskcc.cbio.web.rest;

import java.util.*;
import java.util.stream.Collectors;
import javax.swing.text.html.Option;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblControllerApi;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.cbio.config.ApplicationProperties;
import org.mskcc.cbio.domain.AlignmentResult;
import org.mskcc.cbio.domain.EnrichedAlignmentResult;
import org.mskcc.cbio.domain.Transcript;
import org.mskcc.cbio.domain.TranscriptUsage;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.domain.enumeration.UsageSource;
import org.mskcc.cbio.service.AlignmentService;
import org.mskcc.cbio.service.GenomeNexusUrlService;
import org.mskcc.cbio.service.TranscriptService;
import org.mskcc.cbio.service.TranscriptUsageService;
import org.mskcc.cbio.web.rest.vm.*;
import org.mskcc.cbio.web.rest.vm.ensembl.Sequence;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class TranscriptController {

    private final GenomeNexusUrlService genomeNexusUrlService;
    private final AlignmentService alignmentService;
    private final TranscriptService transcriptService;
    private final TranscriptUsageService transcriptUsageService;

    public TranscriptController(
        GenomeNexusUrlService genomeNexusUrlService,
        AlignmentService alignmentService,
        TranscriptService transcriptService,
        TranscriptUsageService transcriptUsageService
    ) {
        this.genomeNexusUrlService = genomeNexusUrlService;
        this.alignmentService = alignmentService;
        this.transcriptService = transcriptService;
        this.transcriptUsageService = transcriptUsageService;
    }

    @PostMapping("/compare-transcript/{hugoSymbol}")
    public ResponseEntity<TranscriptComparisonResultVM> compareTranscript(
        @PathVariable String hugoSymbol,
        @RequestBody TranscriptComparisonVM transcriptComparisonVM
    ) throws ApiException {
        TranscriptComparisonResultVM result = new TranscriptComparisonResultVM();

        // Find whether both transcript length are the same
        Optional<EnsemblTranscript> ensemblA = transcriptService.getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptA());
        Optional<EnsemblTranscript> ensemblB = transcriptService.getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptB());

        Optional<Sequence> sequenceA = Optional.of(new Sequence());
        if (ensemblA.isPresent()) {
            sequenceA =
                transcriptService.getProteinSequence(
                    transcriptComparisonVM.getTranscriptA().getReferenceGenome(),
                    ensemblA.get().getProteinId()
                );
        }

        Optional<Sequence> sequenceB = Optional.of(new Sequence());
        if (ensemblB.isPresent()) {
            sequenceB =
                transcriptService.getProteinSequence(
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

        Optional<Sequence> sequenceA = transcriptService.getProteinSequence(
            transcriptComparisonVM.getTranscriptA().getReferenceGenome(),
            transcriptComparisonVM.getTranscriptA().getTranscript()
        );
        result.setSequenceA(sequenceA.orElse(new Sequence()).getSeq());

        Optional<Sequence> sequenceB = transcriptService.getProteinSequence(
            transcriptComparisonVM.getTranscriptB().getReferenceGenome(),
            transcriptComparisonVM.getTranscriptB().getTranscript()
        );
        result.setSequenceB(sequenceB.orElse(new Sequence()).getSeq());

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

    @GetMapping("/get-sequence")
    public ResponseEntity<String> getTranscript(@RequestParam ReferenceGenome referenceGenome, @RequestParam String transcript) {
        Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(transcript, referenceGenome);
        if (ensemblTranscriptOptional.isPresent() && ensemblTranscriptOptional.get().getProteinId() != null) {
            Optional<Sequence> sequence = transcriptService.getProteinSequence(
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
                        .filter(
                            ensemblTranscript ->
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
                                    .map(
                                        enrichedAlignmentResult -> {
                                            int matchedIndex = findMatchedIndex(enrichedAlignmentResult.getTargetSeq(), proteinPosition);
                                            int matchedProteinPosition = findMatchedProteinPosition(
                                                enrichedAlignmentResult.getRefSeq(),
                                                matchedIndex
                                            );
                                            return (
                                                enrichedAlignmentResult.getTargetSeq().substring(matchedIndex, matchedIndex + 1) +
                                                matchedProteinPosition
                                            );
                                        }
                                    )
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
                        .filter(
                            ensemblTranscript ->
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
                                    .map(
                                        enrichedAlignmentResult -> {
                                            int matchedIndex = findMatchedIndex(enrichedAlignmentResult.getTargetSeq(), proteinPosition);
                                            int matchedProteinPosition = findMatchedProteinPosition(
                                                enrichedAlignmentResult.getRefSeq(),
                                                matchedIndex
                                            );
                                            return (
                                                enrichedAlignmentResult.getTargetSeq().substring(matchedIndex, matchedIndex + 1) +
                                                matchedProteinPosition
                                            );
                                        }
                                    )
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
        Optional<Sequence> grch37Sequence = transcriptService.getProteinSequence(ReferenceGenome.GRCh37, grch37ProteinId);
        Optional<Sequence> grch38Sequence = transcriptService.getProteinSequence(ReferenceGenome.GRCh38, grch38ProteinId);

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

    @PostMapping("/update-transcript-usage-source")
    public ResponseEntity<Void> updateTranscriptUsage(
        @RequestParam UsageSource usageSource,
        @RequestParam String hugoSymbol,
        @RequestParam int entrezGeneId,
        @RequestParam ReferenceGenome referenceGenome,
        @RequestParam String ensemblTranscriptId
    ) {
        // find whether the transcript has been used
        List<Transcript> matchedTranscript = transcriptService.findByReferenceGenomeAndEnsemblTranscriptAndSource(
            referenceGenome,
            ensemblTranscriptId,
            usageSource
        );

        if (matchedTranscript.size() > 0) {
            return new ResponseEntity<>(HttpStatus.OK);
        }

        // update old transcript usage
        List<TranscriptUsage> usedTranscriptUsages = transcriptUsageService.findByReferenceGenomeAndHugoSymbolAndUsageSource(
            referenceGenome,
            hugoSymbol,
            usageSource
        );
        if (usedTranscriptUsages.size() > 0) {
            // delete all usage
            for (TranscriptUsage transcriptUsage : usedTranscriptUsages) {
                transcriptUsageService.delete(transcriptUsage.getId());
            }
        }

        // add the new transcript if it does not exist
        Optional<Transcript> transcriptOptional = transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(
            referenceGenome,
            ensemblTranscriptId
        );
        if (transcriptOptional.isEmpty()) {
            Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                ensemblTranscriptId,
                referenceGenome
            );
            if (ensemblTranscriptOptional.isPresent()) {
                Transcript transcript = new Transcript(referenceGenome, ensemblTranscriptOptional.get(), hugoSymbol, entrezGeneId);
                transcriptOptional = Optional.of(transcriptService.save(transcript));
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }

        // update new transcript usage
        TranscriptUsage transcriptUsage = new TranscriptUsage();
        transcriptUsage.setSource(usageSource);
        transcriptUsage.setTranscript(transcriptOptional.get());
        transcriptUsageService.save(transcriptUsage);

        return new ResponseEntity<>(null, HttpStatus.OK);
    }
}
