package org.mskcc.cbio.web.rest;

import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblControllerApi;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.cbio.config.ApplicationProperties;
import org.mskcc.cbio.service.UrlService;
import org.mskcc.cbio.web.rest.errors.BadRequestException;
import org.mskcc.cbio.web.rest.vm.*;
import org.mskcc.cbio.web.rest.vm.ensembl.Sequence;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class TranscriptController {
    private final UrlService urlService;

    public TranscriptController(ApplicationProperties applicationProperties, UrlService urlService) {
        this.urlService = urlService;
    }

    @PostMapping("/compare-transcript/{hugoSymbol}")
    public ResponseEntity<TranscriptComparisonResultVM> authorize(
        @PathVariable String hugoSymbol,
        @RequestBody TranscriptComparisonVM transcriptComparisonVM
    ) throws ApiException {
        TranscriptComparisonResultVM result = new TranscriptComparisonResultVM();

        // Find whether both transcript length are the same
        Optional<EnsemblTranscript> ensemblA = getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptA());
        Optional<EnsemblTranscript> ensemblB = getEnsemblTranscript(hugoSymbol, transcriptComparisonVM.getTranscriptB());

        if (ensemblA.isPresent() && ensemblB.isPresent()) {
            Optional<Sequence> sequenceA = getProteinSequence(transcriptComparisonVM.getTranscriptA().getReferenceGenome(), ensemblA.get().getProteinId());
            Optional<Sequence> sequenceB = getProteinSequence(transcriptComparisonVM.getTranscriptB().getReferenceGenome(), ensemblB.get().getProteinId());
            result.setSequenceA(sequenceA.orElse(new Sequence()).getSeq());
            result.setSequenceB(sequenceB.orElse(new Sequence()).getSeq());

            if (ensemblA.get().getProteinLength().equals(ensemblB.get().getProteinLength())) {
                // do a quick check whether the protein is the same
                if (sequenceA.isPresent() && sequenceB.isPresent()) {
                    if (sequenceA.get().getSeq().equals(sequenceB.get().getSeq())) {
                        result.setMatch(true);
                    }
                }
            }
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/match-transcript/{hugoSymbol}")
    public ResponseEntity<EnsemblTranscript> authorize(
        @PathVariable String hugoSymbol,
        @RequestBody MatchTranscriptVM matchTranscriptVM
    ) throws ApiException {
        // Find whether both transcript length are the same
        Optional<EnsemblTranscript> _ensemblTranscript = getEnsemblTranscript(hugoSymbol, matchTranscriptVM.getTranscript());

        if (_ensemblTranscript.isPresent()) {
            Optional<Sequence> _sequence = getProteinSequence(matchTranscriptVM.getTranscript().getReferenceGenome(), _ensemblTranscript.get().getProteinId());
            if (_sequence.isPresent()) {
                List<EnsemblTranscript> targetEnsemblTranscripts = getEnsemblTranscriptList(hugoSymbol, matchTranscriptVM.getTargetReferenceGenome());
                if (targetEnsemblTranscripts.size() == 0) {
                    throw new BadRequestException("The target reference genome does not have any ensembl transcripts.");
                } else {
                    return new ResponseEntity<>(pickEnsemblTranscript(matchTranscriptVM.getTargetReferenceGenome(), targetEnsemblTranscripts, _sequence.get()).orElse(null), HttpStatus.OK);
                }
            } else {
                throw new BadRequestException("The transcript is invalid");
            }
        } else {
            throw new BadRequestException("The transcript is invalid");
        }
    }

    private List<EnsemblTranscript> getEnsemblTranscriptList(String hugoSymbol, REFERENCE_GENOME referenceGenome) throws ApiException {
        EnsemblControllerApi controllerApi = urlService.getEnsemblControllerApi(referenceGenome);
        return controllerApi.fetchEnsemblTranscriptsGET(null, null, hugoSymbol);
    }

    private Optional<EnsemblTranscript> getEnsemblTranscript(String hugoSymbol, TranscriptPairVM transcriptPairVM) throws ApiException {
        return getEnsemblTranscriptList(hugoSymbol, transcriptPairVM.getReferenceGenome()).stream().filter(ensemblTranscript -> !StringUtils.isEmpty(ensemblTranscript.getTranscriptId()) && ensemblTranscript.getTranscriptId().equalsIgnoreCase(transcriptPairVM.getTranscript())).findFirst();
    }

    private Optional<Sequence> getProteinSequence(REFERENCE_GENOME referenceGenome, String transcript) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Sequence> response = restTemplate.exchange(
            urlService.getEnsemblSequenceUrl(referenceGenome, transcript), HttpMethod.GET, entity, Sequence.class);
        return Optional.of(response.getBody());
    }

    private Optional<EnsemblTranscript> pickEnsemblTranscript(REFERENCE_GENOME _referenceGenome, List<EnsemblTranscript> availableTranscripts, Sequence sequence) {
        Optional<EnsemblTranscript> sameLength = availableTranscripts.stream().filter(ensemblTranscript -> {
            if (ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength().equals(sequence.getSeq().length())) {
                Optional<Sequence> targetSequence = getProteinSequence(_referenceGenome, ensemblTranscript.getProteinId());
                if (targetSequence.isPresent()) {
                    return targetSequence.get().getSeq().equals(sequence.getSeq());
                } else {
                    return false;
                }
            } else {
                return false;
            }

        }).findAny();

        if (sameLength.isPresent()) {
            return sameLength;
        } else {
            // we want to see whether there is any transcript includes the original sequence
            List<EnsemblTranscript> longerOnes = availableTranscripts.stream().filter(ensemblTranscript -> {
                if (ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength() > sequence.getSeq().length()) {
                    Optional<Sequence> targetSequence = getProteinSequence(_referenceGenome, ensemblTranscript.getProteinId());
                    if (targetSequence.isPresent()) {
                        return targetSequence.get().getSeq().contains(sequence.getSeq());
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }).collect(Collectors.toList());
            longerOnes.sort(Comparator.comparingInt(EnsemblTranscript::getProteinLength).reversed());
            return Optional.ofNullable(longerOnes.iterator().next());
        }
    }
}
