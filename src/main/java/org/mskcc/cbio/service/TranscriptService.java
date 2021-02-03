package org.mskcc.cbio.service;

import java.util.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblControllerApi;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.cbio.domain.AlignmentResult;
import org.mskcc.cbio.domain.EnrichedAlignmentResult;
import org.mskcc.cbio.domain.Transcript;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.repository.TranscriptRepository;
import org.mskcc.cbio.web.rest.vm.MissMatchPairVM;
import org.mskcc.cbio.web.rest.vm.TranscriptMatchResultVM;
import org.mskcc.cbio.web.rest.vm.TranscriptPairVM;
import org.mskcc.cbio.web.rest.vm.ensembl.Sequence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.configurationprocessor.json.JSONArray;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Service Implementation for managing {@link Transcript}.
 */
@Service
@Transactional
public class TranscriptService {

    private final GenomeNexusUrlService genomeNexusUrlService;
    private final AlignmentService alignmentService;

    private final Logger log = LoggerFactory.getLogger(TranscriptService.class);

    private final TranscriptRepository transcriptRepository;

    public TranscriptService(
        GenomeNexusUrlService genomeNexusUrlService,
        AlignmentService alignmentService,
        TranscriptRepository transcriptRepository
    ) {
        this.genomeNexusUrlService = genomeNexusUrlService;
        this.alignmentService = alignmentService;
        this.transcriptRepository = transcriptRepository;
    }

    /**
     * Save a transcript.
     *
     * @param transcript the entity to save.
     * @return the persisted entity.
     */
    public Transcript save(Transcript transcript) {
        log.debug("Request to save Transcript : {}", transcript);
        return transcriptRepository.save(transcript);
    }

    /**
     * Partially update a transcript.
     *
     * @param transcript the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Transcript> partialUpdate(Transcript transcript) {
        log.debug("Request to partially update Transcript : {}", transcript);

        return transcriptRepository
            .findById(transcript.getId())
            .map(
                existingTranscript -> {
                    if (transcript.getEntrezGeneId() != null) {
                        existingTranscript.setEntrezGeneId(transcript.getEntrezGeneId());
                    }

                    if (transcript.getHugoSymbol() != null) {
                        existingTranscript.setHugoSymbol(transcript.getHugoSymbol());
                    }

                    if (transcript.getReferenceGenome() != null) {
                        existingTranscript.setReferenceGenome(transcript.getReferenceGenome());
                    }

                    if (transcript.getEnsemblTranscriptId() != null) {
                        existingTranscript.setEnsemblTranscriptId(transcript.getEnsemblTranscriptId());
                    }

                    if (transcript.getEnsemblProteinId() != null) {
                        existingTranscript.setEnsemblProteinId(transcript.getEnsemblProteinId());
                    }

                    if (transcript.getReferenceSequenceId() != null) {
                        existingTranscript.setReferenceSequenceId(transcript.getReferenceSequenceId());
                    }

                    if (transcript.getDescription() != null) {
                        existingTranscript.setDescription(transcript.getDescription());
                    }

                    return existingTranscript;
                }
            )
            .map(transcriptRepository::save);
    }

    /**
     * Get all the transcripts.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Transcript> findAll() {
        log.debug("Request to get all Transcripts");
        return transcriptRepository.findAll();
    }

    /**
     * Get one transcript by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Transcript> findOne(Long id) {
        log.debug("Request to get Transcript : {}", id);
        return transcriptRepository.findById(id);
    }

    /**
     * Delete the transcript by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Transcript : {}", id);
        transcriptRepository.deleteById(id);
    }

    /**
     * Get trancript by reference genome and ensembleTranscriptId
     *
     * @param referenceGenome
     * @param ensembleTranscriptId
     * @return
     */
    @Transactional(readOnly = true)
    public Optional<Transcript> findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome referenceGenome, String ensembleTranscriptId) {
        log.debug("Request to get Sequence : {}", ensembleTranscriptId);
        return transcriptRepository.findByReferenceGenomeAndEnsemblTranscriptId(referenceGenome, ensembleTranscriptId);
    }

    /**
     * Get trancript by reference genome and entrezGeneId
     *
     * @param referenceGenome
     * @param entrezGeneId
     * @return
     */
    @Transactional(readOnly = true)
    public Optional<Transcript> findByReferenceGenomeAndEntrezGeneId(ReferenceGenome referenceGenome, int entrezGeneId) {
        return transcriptRepository.findByReferenceGenomeAndEntrezGeneId(referenceGenome, entrezGeneId);
    }

    public List<EnsemblTranscript> getTranscriptsWithMatchedResidue(
        ReferenceGenome referenceGenome,
        List<EnsemblTranscript> transcripts,
        int proteinPosition,
        String expectedAllele
    ) {
        return transcripts
            .stream()
            .filter(ensemblTranscript -> StringUtils.isNotEmpty(ensemblTranscript.getProteinId()))
            .filter(
                ensemblTranscript -> {
                    Optional<Sequence> sequence = getProteinSequence(referenceGenome, ensemblTranscript.getProteinId());
                    if (sequence.isPresent()) {
                        if (sequence.get().getSeq().length() >= proteinPosition) {
                            return sequence.get().getSeq().substring(proteinPosition - 1, proteinPosition).equals(expectedAllele);
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            )
            .collect(Collectors.toList());
    }

    public TranscriptMatchResultVM matchTranscript(TranscriptPairVM transcript, ReferenceGenome referenceGenome, String hugoSymbol) {
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

    public Optional<EnsemblTranscript> getEnsemblTranscript(String transcriptId, ReferenceGenome referenceGenome) {
        EnsemblControllerApi controllerApi = genomeNexusUrlService.getEnsemblControllerApi(referenceGenome);
        try {
            EnsemblTranscript ensemblTranscript = controllerApi.fetchEnsemblTranscriptByTranscriptIdGET(transcriptId);
            return ensemblTranscript == null ? Optional.empty() : Optional.of(ensemblTranscript);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    public List<EnsemblTranscript> getEnsemblTranscriptList(String hugoSymbol, ReferenceGenome referenceGenome) {
        EnsemblControllerApi controllerApi = genomeNexusUrlService.getEnsemblControllerApi(referenceGenome);
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

    public EnsemblTranscript getCanonicalEnsemblTranscript(String hugoSymbol, ReferenceGenome referenceGenome) throws ApiException {
        EnsemblControllerApi controllerApi = genomeNexusUrlService.getEnsemblControllerApi(referenceGenome);
        return controllerApi.fetchCanonicalEnsemblTranscriptByHugoSymbolGET(hugoSymbol, "msk");
    }

    public Optional<EnsemblTranscript> getEnsemblTranscript(String hugoSymbol, TranscriptPairVM transcriptPairVM) throws ApiException {
        return getEnsemblTranscriptList(hugoSymbol, transcriptPairVM.getReferenceGenome())
            .stream()
            .filter(
                ensemblTranscript ->
                    !StringUtils.isEmpty(ensemblTranscript.getTranscriptId()) &&
                    ensemblTranscript.getTranscriptId().equalsIgnoreCase(transcriptPairVM.getTranscript())
            )
            .findFirst();
    }

    public Optional<Sequence> getProteinSequence(ReferenceGenome referenceGenome, String transcript) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(httpHeaders);

        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Sequence> response = restTemplate.exchange(
                genomeNexusUrlService.getEnsemblSequenceGETUrl(referenceGenome, transcript),
                HttpMethod.GET,
                entity,
                Sequence.class
            );
            return Optional.of(response.getBody());
        } catch (RestClientException exception) {
            exception.printStackTrace();
            return Optional.empty();
        }
    }

    public List<Sequence> getProteinSequences(ReferenceGenome referenceGenome, List<String> transcripts) {
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
            genomeNexusUrlService.getEnsemblSequencePOSTUrl(referenceGenome),
            entity,
            Sequence[].class
        );
        return Arrays.asList(response.getBody());
    }

    private TranscriptMatchResultVM pickEnsemblTranscript(
        TranscriptMatchResultVM transcriptMatchResultVM,
        ReferenceGenome referenceGenome,
        List<EnsemblTranscript> availableTranscripts,
        Sequence sequence
    ) {
        List<EnsemblTranscript> sameLengthList = availableTranscripts
            .stream()
            .filter(
                ensemblTranscript ->
                    ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength().equals(sequence.getSeq().length())
            )
            .collect(Collectors.toList());

        List<Sequence> sequences = getProteinSequences(
            referenceGenome,
            sameLengthList.stream().map(EnsemblTranscript::getProteinId).collect(Collectors.toList())
        )
            .stream()
            .filter(filteredSequence -> filteredSequence.getSeq().length() == sequence.getSeq().length())
            .collect(Collectors.toList());
        Optional<Sequence> sequenceSame = sequences
            .stream()
            .filter(matchedSequence -> matchedSequence.getSeq().equals(sequence.getSeq()))
            .findAny();

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
                missMatchPairVMS.size() +
                ". " +
                missMatchPairVMS
                    .stream()
                    .map(
                        missMatchPairVM ->
                            missMatchPairVM.getPosition() +
                            "(" +
                            missMatchPairVM.getReferenceAllele() +
                            "," +
                            missMatchPairVM.getTargetAlelel() +
                            ")"
                    )
                    .collect(Collectors.joining(", "))
            );
        } else {
            // we want to see whether there is any transcript includes the original sequence
            List<EnsemblTranscript> longerOnes = availableTranscripts
                .stream()
                .filter(
                    ensemblTranscript ->
                        ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength() > sequence.getSeq().length()
                )
                .collect(Collectors.toList());

            List<Sequence> longerSequences = getProteinSequences(
                referenceGenome,
                longerOnes.stream().map(EnsemblTranscript::getProteinId).collect(Collectors.toList())
            );
            List<Sequence> sequencesContains = longerSequences
                .stream()
                .filter(matchedSequence -> matchedSequence.getSeq().contains(sequence.getSeq()))
                .collect(Collectors.toList());
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

    public List<EnrichedAlignmentResult> getAlignmentResult(
        ReferenceGenome refReferenceGenome,
        EnsemblTranscript refEnsemblTranscript,
        ReferenceGenome targetReferenceGenome,
        List<EnsemblTranscript> targetTranscripts
    ) {
        Optional<Sequence> refSequenceOptional = getProteinSequence(refReferenceGenome, refEnsemblTranscript.getProteinId());
        if (refSequenceOptional.isPresent()) {
            return targetTranscripts
                .stream()
                .filter(ensemblTranscript -> StringUtils.isNotEmpty(ensemblTranscript.getProteinId()))
                .map(
                    ensemblTranscript -> {
                        Optional<Sequence> targetSequenceOptional = getProteinSequence(
                            targetReferenceGenome,
                            ensemblTranscript.getProteinId()
                        );
                        if (targetSequenceOptional.isPresent()) {
                            AlignmentResult alignmentResult =
                                this.alignmentService.calcOptimalAlignment(
                                        refSequenceOptional.get().getSeq(),
                                        targetSequenceOptional.get().getSeq(),
                                        true
                                    );
                            EnrichedAlignmentResult enrichedAlignmentResult = new EnrichedAlignmentResult(alignmentResult);
                            enrichedAlignmentResult.setRefEnsemblTranscript(refEnsemblTranscript);
                            enrichedAlignmentResult.setTargetEnsemblTranscript(ensemblTranscript);
                            return Optional.of(enrichedAlignmentResult);
                        } else {
                            Optional<EnrichedAlignmentResult> optional = Optional.empty();
                            return optional;
                        }
                    }
                )
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted(Comparator.comparingInt(EnrichedAlignmentResult::getPenalty))
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    private Optional<EnsemblTranscript> getEnsemblTranscriptBySequence(
        List<EnsemblTranscript> availableEnsemblTranscripts,
        Sequence sequence
    ) {
        return availableEnsemblTranscripts
            .stream()
            .filter(
                ensemblTranscript -> {
                    if (ensemblTranscript.getProteinId() != null && ensemblTranscript.getProteinId().equals(sequence.getId())) {
                        return true;
                    } else {
                        return false;
                    }
                }
            )
            .findAny();
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
