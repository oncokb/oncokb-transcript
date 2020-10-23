package org.mskcc.cbio.web.rest;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblControllerApi;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.cbio.config.ApplicationProperties;
import org.mskcc.cbio.domain.AlignmentResult;
import org.mskcc.cbio.domain.EnrichedAlignmentResult;
import org.mskcc.cbio.service.AlignmentService;
import org.mskcc.cbio.service.UrlService;
import org.mskcc.cbio.web.rest.errors.BadRequestException;
import org.mskcc.cbio.web.rest.vm.*;
import org.mskcc.cbio.web.rest.vm.ensembl.Sequence;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.*;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.swing.text.html.Option;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class TranscriptController {
    private final UrlService urlService;
    private final AlignmentService alignmentService;

    public TranscriptController(ApplicationProperties applicationProperties, UrlService urlService, AlignmentService alignmentService) {
        this.urlService = urlService;
        this.alignmentService = alignmentService;
    }

    @PostMapping("/compare-transcript/{hugoSymbol}")
    public ResponseEntity<TranscriptComparisonResultVM> compareTranscript(
        @PathVariable String hugoSymbol,
        @RequestBody TranscriptComparisonVM transcriptComparisonVM
    ) throws ApiException {
        TranscriptComparisonResultVM result = new TranscriptComparisonResultVM();

        // Find whether both transcript length are the same
        Optional<EnsemblTranscript> ensemblA = getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptA());
        Optional<EnsemblTranscript> ensemblB = getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptB());

        Optional<Sequence> sequenceA = Optional.empty();
        if (ensemblA.isPresent()) {
            sequenceA = getProteinSequence(transcriptComparisonVM.getTranscriptA().getReferenceGenome(), ensemblA.get().getProteinId());
            result.setSequenceA(sequenceA.orElse(new Sequence()).getSeq());
        }

        Optional<Sequence> sequenceB = Optional.empty();
        if (ensemblB.isPresent()) {
            sequenceB = getProteinSequence(transcriptComparisonVM.getTranscriptB().getReferenceGenome(), ensemblB.get().getProteinId());
            result.setSequenceB(sequenceB.orElse(new Sequence()).getSeq());
        }

        if (ensemblA.isPresent() &&
            ensemblB.isPresent() &&
            ensemblA.get().getProteinLength().equals(ensemblB.get().getProteinLength())) {
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

        Optional<Sequence> sequenceA = getProteinSequence(transcriptComparisonVM.getTranscriptA().getReferenceGenome(), transcriptComparisonVM.getTranscriptA().getTranscript());
        result.setSequenceA(sequenceA.orElse(new Sequence()).getSeq());

        Optional<Sequence> sequenceB = getProteinSequence(transcriptComparisonVM.getTranscriptB().getReferenceGenome(), transcriptComparisonVM.getTranscriptB().getTranscript());
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
        return new ResponseEntity<>(matchTranscript(matchTranscriptVM.getTranscript(), matchTranscriptVM.getTargetReferenceGenome(), hugoSymbol), HttpStatus.OK);
    }

    @PostMapping("/get-alignments/{hugoSymbol}")
    public ResponseEntity<List<EnrichedAlignmentResult>> getAlignments(
        @PathVariable String hugoSymbol,
        @RequestBody MatchTranscriptVM matchTranscriptVM
    ) throws ApiException {
        // Find whether both transcript length are the same

        Optional<EnsemblTranscript> ensemblTranscriptOptional = getEnsemblTranscript(hugoSymbol, matchTranscriptVM.getTranscript());
        if (ensemblTranscriptOptional.isPresent()) {
            EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
            List<EnsemblTranscript> targetEnsemblTranscripts = getEnsemblTranscriptList(hugoSymbol, matchTranscriptVM.getTargetReferenceGenome());
            return new ResponseEntity<>(getAlignmentResult(matchTranscriptVM.getTranscript().getReferenceGenome(), ensemblTranscript, matchTranscriptVM.getTargetReferenceGenome(), targetEnsemblTranscripts), HttpStatus.OK);
        } else {
            throw new ApiException("Cannot find  reference transcript.");
        }
    }

    @GetMapping("/get-transcript/{hugoSymbol}")
    public ResponseEntity<TranscriptResultVM> getTranscript(
        @PathVariable String hugoSymbol
    ) {
        EnsemblTranscript grch37Transcript = null;
        try {
            grch37Transcript = getCanonicalEnsemblTranscript(hugoSymbol, REFERENCE_GENOME.GRCH_37);
        } catch (ApiException e) {
            e.printStackTrace();
        }
        TranscriptPairVM transcriptPairVM = new TranscriptPairVM();
        transcriptPairVM.setReferenceGenome(REFERENCE_GENOME.GRCH_37);
        transcriptPairVM.setTranscript(grch37Transcript.getTranscriptId());
        TranscriptMatchResultVM transcriptMatchResultVM = matchTranscript(transcriptPairVM, REFERENCE_GENOME.GRCH_38, hugoSymbol);

        TranscriptResultVM transcriptResultVM = new TranscriptResultVM();
        transcriptResultVM.setGrch37Transcript(transcriptMatchResultVM.getOriginalEnsemblTranscript());
        transcriptResultVM.setGrch38Transcript(transcriptMatchResultVM.getTargetEnsemblTranscript());
        transcriptResultVM.setNote(transcriptMatchResultVM.getNote());

        return new ResponseEntity<>(transcriptResultVM, HttpStatus.OK);
    }

    private TranscriptMatchResultVM matchTranscript(TranscriptPairVM transcript, REFERENCE_GENOME referenceGenome, String hugoSymbol) {
        // Find whether both transcript length are the same
        Optional<EnsemblTranscript> _ensemblTranscript = Optional.empty();
        try {
            _ensemblTranscript = getEnsemblTranscript(hugoSymbol, transcript);
        } catch (ApiException e) {
            e.printStackTrace();
        }
        TranscriptMatchResultVM transcriptMatchResultVM = new TranscriptMatchResultVM();

        if (_ensemblTranscript.isPresent()) {
            transcriptMatchResultVM.setOriginalEnsemblTranscript(_ensemblTranscript.get());
            Optional<Sequence> _sequence = getProteinSequence(transcript.getReferenceGenome(), _ensemblTranscript.get().getProteinId());
            if (_sequence.isPresent()) {
                List<EnsemblTranscript> targetEnsemblTranscripts = getEnsemblTranscriptList(hugoSymbol, referenceGenome);
                if (targetEnsemblTranscripts.size() == 0) {
                    transcriptMatchResultVM.setNote("The target reference genome does not have any ensembl transcripts.");
                } else {
                    try {
                        pickEnsemblTranscript(transcriptMatchResultVM, referenceGenome, targetEnsemblTranscripts, _sequence.get());
                    } catch (Exception exception) {
                        transcriptMatchResultVM.setNote(exception.getMessage());
                    }
                }
            } else {
                transcriptMatchResultVM.setNote("The transcript is invalid");
            }
        } else {
            transcriptMatchResultVM.setNote("The transcript is invalid");
        }
        return transcriptMatchResultVM;
    }

    private List<EnsemblTranscript> getEnsemblTranscriptList(String hugoSymbol, REFERENCE_GENOME referenceGenome) {
        EnsemblControllerApi controllerApi = urlService.getEnsemblControllerApi(referenceGenome);
        Set<EnsemblTranscript> transcripts = new LinkedHashSet<>();
        try {
            transcripts.add(getCanonicalEnsemblTranscript(hugoSymbol, referenceGenome));
        } catch (ApiException e) {
            e.printStackTrace();
        }
        try {
            transcripts.addAll(controllerApi.fetchEnsemblTranscriptsGET(null, null, hugoSymbol));
        } catch (ApiException e) {
            e.printStackTrace();
        }
        return new ArrayList<>(transcripts);
    }

    private EnsemblTranscript getCanonicalEnsemblTranscript(String hugoSymbol, REFERENCE_GENOME referenceGenome) throws ApiException {
        EnsemblControllerApi controllerApi = urlService.getEnsemblControllerApi(referenceGenome);
        return controllerApi.fetchCanonicalEnsemblTranscriptByHugoSymbolGET(hugoSymbol, "msk");
    }

    private Optional<EnsemblTranscript> getEnsemblTranscript(String hugoSymbol, TranscriptPairVM transcriptPairVM) throws ApiException {
        return getEnsemblTranscriptList(hugoSymbol, transcriptPairVM.getReferenceGenome()).stream().filter(ensemblTranscript -> !StringUtils.isEmpty(ensemblTranscript.getTranscriptId()) && ensemblTranscript.getTranscriptId().equalsIgnoreCase(transcriptPairVM.getTranscript())).findFirst();
    }

    private Optional<Sequence> getProteinSequence(REFERENCE_GENOME referenceGenome, String transcript) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Sequence> response = restTemplate.exchange(
                urlService.getEnsemblSequenceGETUrl(referenceGenome, transcript), HttpMethod.GET, entity, Sequence.class);
            return Optional.of(response.getBody());
        } catch (RestClientException exception) {
            exception.printStackTrace();
            return Optional.empty();
        }
    }

    private List<Sequence> getProteinSequences(REFERENCE_GENOME referenceGenome, List<String> transcripts) {
        if (transcripts.size() == 0) {
            return new ArrayList<>();
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        JSONObject jsonObject = new JSONObject();
        JSONArray jsonArray = new JSONArray();
        transcripts.stream().forEach(transcript -> jsonArray.put(transcript));
        try {
            jsonObject.put("ids", jsonArray);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        HttpEntity<String> entity = new HttpEntity<>(jsonObject.toString(), httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Sequence[]> response = restTemplate.postForEntity(
            urlService.getEnsemblSequencePOSTUrl(referenceGenome), entity, Sequence[].class);
        return Arrays.asList(response.getBody());
    }

    private TranscriptMatchResultVM pickEnsemblTranscript(TranscriptMatchResultVM transcriptMatchResultVM, REFERENCE_GENOME referenceGenome, List<EnsemblTranscript> availableTranscripts, Sequence sequence) {
        List<EnsemblTranscript> sameLengthList = availableTranscripts.stream().filter(ensemblTranscript -> ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength().equals(sequence.getSeq().length())).collect(Collectors.toList());

        List<Sequence> sequences = getProteinSequences(referenceGenome, sameLengthList.stream().map(EnsemblTranscript::getProteinId).collect(Collectors.toList())).stream().filter(filteredSequence -> filteredSequence.getSeq().length() == sequence.getSeq().length()).collect(Collectors.toList());
        Optional<Sequence> sequenceSame = sequences.stream().filter(matchedSequence -> matchedSequence.getSeq().equals(sequence.getSeq())).findAny();


        if (sequenceSame.isPresent()) {
            Optional<EnsemblTranscript> ensemblTranscript = getEnsemblTranscriptBySequence(sameLengthList, sequenceSame.get());
            transcriptMatchResultVM.setTargetEnsemblTranscript(ensemblTranscript.get());
            transcriptMatchResultVM.setNote("Same sequence");
        } else if (sequences.size() > 0) {
            // We should make some comparison with the original sequence for the same length
            sequences.sort(Comparator.comparingInt(s -> getNumOfMismatchSameLengthSequences(sequence.getSeq(), s.getSeq()).size()));
            Sequence pickedSequence = sequences.iterator().next();

            Optional<EnsemblTranscript> ensemblTranscript = getEnsemblTranscriptBySequence(availableTranscripts, pickedSequence);
            transcriptMatchResultVM.setTargetEnsemblTranscript(ensemblTranscript.get());
            List<MissMatchPairVM> missMatchPairVMS = getNumOfMismatchSameLengthSequences(sequence.getSeq(), pickedSequence.getSeq());
            transcriptMatchResultVM.setNote(
                "Same length, but mismatch: " +
                    missMatchPairVMS.size() + ". " +
                    missMatchPairVMS
                        .stream()
                        .map(missMatchPairVM -> missMatchPairVM.getPosition() + "(" + missMatchPairVM.getReferenceAllele() + "," + missMatchPairVM.getTargetAlelel() + ")")
                        .collect(Collectors.joining(", "))
            );
        } else {
            // we want to see whether there is any transcript includes the original sequence
            List<EnsemblTranscript> longerOnes = availableTranscripts.stream().filter(ensemblTranscript -> ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength() > sequence.getSeq().length()).collect(Collectors.toList());

            List<Sequence> longerSequences = getProteinSequences(referenceGenome, longerOnes.stream().map(EnsemblTranscript::getProteinId).collect(Collectors.toList()));
            List<Sequence> sequencesContains = longerSequences.stream().filter(matchedSequence -> matchedSequence.getSeq().contains(sequence.getSeq())).collect(Collectors.toList());
            sequencesContains.sort((s1, s2) -> s2.getSeq().length() - s1.getSeq().length());

            if (sequencesContains.size() > 0) {
                Sequence pickedSequence = sequencesContains.iterator().next();
                Optional<EnsemblTranscript> ensemblTranscript = getEnsemblTranscriptBySequence(longerOnes, pickedSequence);
                transcriptMatchResultVM.setTargetEnsemblTranscript(ensemblTranscript.get());
                transcriptMatchResultVM.setNote("Longer one found, length: " + ensemblTranscript.get().getProteinLength());

            } else {
                transcriptMatchResultVM.setNote("No matched sequence found");
            }
        }
        return transcriptMatchResultVM;
    }

    private List<EnrichedAlignmentResult> getAlignmentResult(REFERENCE_GENOME refReferenceGenome, EnsemblTranscript refEnsemblTranscript, REFERENCE_GENOME targetReferenceGenome, List<EnsemblTranscript> targetTranscripts) {
        Optional<Sequence> refSequenceOptional = getProteinSequence(refReferenceGenome, refEnsemblTranscript.getProteinId());
        if (refSequenceOptional.isPresent()) {
            return targetTranscripts.stream()
                .filter(ensemblTranscript -> StringUtils.isNotEmpty(ensemblTranscript.getProteinId()))
                .map(ensemblTranscript -> {
                    Optional<Sequence> targetSequenceOptional = getProteinSequence(targetReferenceGenome, ensemblTranscript.getProteinId());
                    if (targetSequenceOptional.isPresent()) {
                        AlignmentResult alignmentResult = this.alignmentService.calcOptimalAlignment(refSequenceOptional.get().getSeq(), targetSequenceOptional.get().getSeq(), true);
                        EnrichedAlignmentResult enrichedAlignmentResult = new EnrichedAlignmentResult(alignmentResult);
                        enrichedAlignmentResult.setRefEnsemblTranscript(refEnsemblTranscript);
                        enrichedAlignmentResult.setTargetEnsemblTranscript(ensemblTranscript);
                        return Optional.of(enrichedAlignmentResult);
                    } else {
                        Optional<EnrichedAlignmentResult> optional = Optional.empty();
                        return optional;
                    }
                })
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted(Comparator.comparingInt(EnrichedAlignmentResult::getPenalty))
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    private Optional<EnsemblTranscript> getEnsemblTranscriptBySequence(List<EnsemblTranscript> availableEnsemblTranscripts, Sequence sequence) {
        return availableEnsemblTranscripts.stream().filter(ensemblTranscript -> {
            if (ensemblTranscript.getProteinId() != null && ensemblTranscript.getProteinId().equals(sequence.getId())) {
                return true;
            } else {
                return false;
            }
        }).findAny();
    }

    private List<MissMatchPairVM> getNumOfMismatchSameLengthSequences(String reference, String newSequence) {
        List<MissMatchPairVM> mismatch = new ArrayList<>();
        for (int i = 0; i < reference.length(); i++) {
            char r = reference.charAt(i);
            char n = newSequence.charAt(i);
            if (r != n) {
                MissMatchPairVM missMatchPairVM = new MissMatchPairVM();
                missMatchPairVM.setPosition(i);
                missMatchPairVM.setReferenceAllele(r);
                missMatchPairVM.setTargetAlelel(n);
                mismatch.add(missMatchPairVM);
            }
        }
        return mismatch;
    }
}
