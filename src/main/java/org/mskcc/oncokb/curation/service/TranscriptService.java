package org.mskcc.oncokb.curation.service;

import static org.mskcc.oncokb.curation.config.Constants.ENSEMBL_POST_THRESHOLD;

import java.util.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblControllerApi;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.oncokb.curation.config.cache.CacheCategory;
import org.mskcc.oncokb.curation.config.cache.CacheNameResolver;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.GenomeFragmentType;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.mskcc.oncokb.curation.repository.TranscriptRepository;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.curation.vm.MissMatchPairVM;
import org.mskcc.oncokb.curation.vm.TranscriptMatchResultVM;
import org.mskcc.oncokb.curation.vm.TranscriptPairVM;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblSequence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Transcript}.
 */
@Service
@Transactional
public class TranscriptService {

    private final GenomeNexusService genomeNexusService;
    private final EnsemblService ensemblService;
    private final AlignmentService alignmentService;
    private final SequenceService sequenceService;
    private final TranscriptMapper transcriptMapper;
    private final CacheNameResolver cacheNameResolver;
    private final Optional<CacheManager> optionalCacheManager;

    private final Logger log = LoggerFactory.getLogger(TranscriptService.class);

    private final TranscriptRepository transcriptRepository;
    private final GenomeFragmentService genomeFragmentService;

    public TranscriptService(
        GenomeNexusService genomeNexusService,
        EnsemblService ensemblService,
        AlignmentService alignmentService,
        SequenceService sequenceService,
        TranscriptRepository transcriptRepository,
        TranscriptMapper transcriptMapper,
        GenomeFragmentService genomeFragmentService,
        CacheNameResolver cacheNameResolver,
        Optional<CacheManager> optionalCacheManager
    ) {
        this.genomeNexusService = genomeNexusService;
        this.ensemblService = ensemblService;
        this.alignmentService = alignmentService;
        this.sequenceService = sequenceService;
        this.transcriptRepository = transcriptRepository;
        this.transcriptMapper = transcriptMapper;
        this.genomeFragmentService = genomeFragmentService;
        this.cacheNameResolver = cacheNameResolver;
        this.optionalCacheManager = optionalCacheManager;
    }

    /**
     * Save a transcript.
     *
     * @param transcriptDTO the entity to save.
     * @return the persisted entity.
     */
    public TranscriptDTO save(TranscriptDTO transcriptDTO) {
        log.debug("Request to save Transcript : {}", transcriptDTO);
        Transcript transcript = transcriptMapper.toEntity(transcriptDTO);
        Transcript savedTranscript = transcriptRepository.save(transcript);

        List<GenomeFragment> transcriptGenomeFragments = genomeFragmentService.findAllByTranscriptId(transcriptDTO.getId());
        genomeFragmentService.deleteAll(transcriptGenomeFragments);

        GenomeFragment genomeFragment = new GenomeFragment();
        genomeFragment.setTranscript(savedTranscript);
        genomeFragment.setChromosome(transcriptDTO.getChromosome());
        genomeFragment.setStart(transcriptDTO.getStart());
        genomeFragment.setEnd(transcriptDTO.getEnd());
        genomeFragment.setStrand(transcriptDTO.getStrand());
        genomeFragment.setType(GenomeFragmentType.GENE);
        genomeFragmentService.save(genomeFragment);

        transcriptDTO.getExons().stream().forEach(exon -> exon.setTranscript(savedTranscript));
        genomeFragmentService.saveAll(transcriptDTO.getExons());
        transcriptDTO.getUtrs().stream().forEach(utr -> utr.setTranscript(savedTranscript));
        genomeFragmentService.saveAll(transcriptDTO.getUtrs());

        // save sequence automatically when a new transcript saved
        Optional<Sequence> sequenceOptional = sequenceService.findOneByTranscriptAndSequenceType(savedTranscript, SequenceType.PROTEIN);
        if (sequenceOptional.isEmpty() && StringUtils.isNotEmpty(savedTranscript.getEnsemblProteinId())) {
            Optional<EnsemblSequence> ensemblSequenceOptional = ensemblService.getProteinSequence(
                savedTranscript.getEnsemblGene().getReferenceGenome(),
                savedTranscript.getEnsemblProteinId()
            );
            if (ensemblSequenceOptional.isPresent()) {
                Sequence sequence = new Sequence();
                sequence.setTranscript(savedTranscript);
                sequence.setSequenceType(SequenceType.PROTEIN);
                sequence.setSequence(ensemblSequenceOptional.get().getSeq());
                sequenceService.save(sequence);
            }
        }
        clearTranscriptCaches();
        return transcriptMapper.toDto(savedTranscript);
    }

    /**
     * Partially update a transcript.
     *
     * @param transcriptDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TranscriptDTO> partialUpdate(TranscriptDTO transcriptDTO) {
        log.debug("Request to partially update Transcript : {}", transcriptDTO);

        return transcriptRepository
            .findById(transcriptDTO.getId())
            .map(existingTranscript -> {
                transcriptMapper.partialUpdate(existingTranscript, transcriptDTO);

                return existingTranscript;
            })
            .map(transcriptRepository::save)
            .map(transcriptMapper::toDto);
    }

    /**
     * Get all the transcripts.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TranscriptDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Transcripts");
        return transcriptRepository.findAll(pageable).map(transcriptMapper::toDto);
    }

    /**
     * Get one transcript by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TranscriptDTO> findOne(Long id) {
        log.debug("Request to get Transcript : {}", id);
        return transcriptRepository.findById(id).map(transcriptMapper::toDto);
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

    public Optional<TranscriptDTO> findByEnsemblGeneAndEnsemblTranscriptId(EnsemblGene ensemblGene, String ensembleTranscriptId) {
        log.debug(
            "Request to get transcript by ensembl gene and transcript id : {} {} {}",
            ensemblGene.getReferenceGenome(),
            ensemblGene.getEnsemblGeneId(),
            ensembleTranscriptId
        );
        Optional<Transcript> transcriptOptional = transcriptRepository.findByEnsemblGeneAndEnsemblTranscriptId(
            ensemblGene,
            ensembleTranscriptId
        );
        if (transcriptOptional.isPresent()) {
            return Optional.of(transcriptMapper.toDto(transcriptOptional.get()));
        } else {
            return Optional.empty();
        }
    }

    public Optional<TranscriptDTO> findByEnsemblGeneAndCanonicalIsTrue(EnsemblGene ensemblGene) {
        log.debug(
            "Request to find canonical transcript for given ensembl gene : {} {}",
            ensemblGene.getReferenceGenome(),
            ensemblGene.getEnsemblGeneId()
        );
        Optional<Transcript> transcriptOptional = transcriptRepository.findByEnsemblGeneAndCanonicalIsTrue(ensemblGene);
        if (transcriptOptional.isPresent()) {
            return Optional.of(transcriptMapper.toDto(transcriptOptional.get()));
        } else {
            return Optional.empty();
        }
    }

    /**
     * Get trancript by reference genome and ensembleTranscriptId
     *
     * @param referenceGenome
     * @param ensembleTranscriptId
     * @return
     */
    @Transactional(readOnly = true)
    public Optional<TranscriptDTO> findByReferenceGenomeAndEnsemblTranscriptId(
        ReferenceGenome referenceGenome,
        String ensembleTranscriptId
    ) {
        log.debug("Request to get Sequence : {}", ensembleTranscriptId);
        Optional<Transcript> transcriptOptional = transcriptRepository.findByReferenceGenomeAndEnsemblTranscriptId(
            referenceGenome.name(),
            ensembleTranscriptId
        );
        if (transcriptOptional.isPresent()) {
            return Optional.of(transcriptMapper.toDto(transcriptOptional.get()));
        } else {
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public List<TranscriptDTO> findByReferenceGenomeAndEnsemblTranscriptIdIsIn(
        ReferenceGenome referenceGenome,
        List<String> ensemblTranscriptIds
    ) {
        return transcriptRepository
            .findByReferenceGenomeAndEnsemblTranscriptIdIsIn(referenceGenome.name(), ensemblTranscriptIds)
            .stream()
            .map(transcriptMapper::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TranscriptDTO> findByEnsemblGene(EnsemblGene ensemblGene) {
        return transcriptMapper.toDto(transcriptRepository.findByEnsemblGene(ensemblGene));
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
            .filter(ensemblTranscript -> {
                Optional<EnsemblSequence> sequence = ensemblService.getProteinSequence(referenceGenome, ensemblTranscript.getProteinId());
                if (sequence.isPresent()) {
                    if (sequence.get().getSeq().length() >= proteinPosition) {
                        return sequence.get().getSeq().substring(proteinPosition - 1, proteinPosition).equals(expectedAllele);
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            })
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
            Optional<EnsemblSequence> _sequence = ensemblService.getProteinSequence(
                transcript.getReferenceGenome(),
                _ensemblTranscript.get().getProteinId()
            );
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
        EnsemblControllerApi controllerApi = genomeNexusService.getEnsemblControllerApi(referenceGenome);
        try {
            EnsemblTranscript ensemblTranscript = controllerApi.fetchEnsemblTranscriptByTranscriptIdGET(transcriptId);
            return ensemblTranscript == null ? Optional.empty() : Optional.of(ensemblTranscript);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    public List<EnsemblTranscript> getEnsemblTranscriptList(String hugoSymbol, ReferenceGenome referenceGenome) {
        EnsemblControllerApi controllerApi = genomeNexusService.getEnsemblControllerApi(referenceGenome);
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
        EnsemblControllerApi controllerApi = genomeNexusService.getEnsemblControllerApi(referenceGenome);
        return controllerApi.fetchCanonicalEnsemblTranscriptByHugoSymbolGET(hugoSymbol, "msk");
    }

    public Optional<EnsemblTranscript> getEnsemblTranscript(String hugoSymbol, TranscriptPairVM transcriptPairVM) throws ApiException {
        return getEnsemblTranscriptList(hugoSymbol, transcriptPairVM.getReferenceGenome())
            .stream()
            .filter(ensemblTranscript ->
                !StringUtils.isEmpty(ensemblTranscript.getTranscriptId()) &&
                ensemblTranscript.getTranscriptId().equalsIgnoreCase(transcriptPairVM.getTranscript())
            )
            .findFirst();
    }

    /**
     * Get a list of transcripts from ensembl.org
     *
     * @param referenceGenome Reference Genome
     * @param ids             a list of transcript/gene ids that need to be searched
     * @return a lit of expanded ensembl transcripts with exon/utr info
     */
    public List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> getEnsemblTranscriptIds(
        ReferenceGenome referenceGenome,
        List<String> ids,
        boolean includeUtr,
        boolean expand
    ) {
        List<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> ensemblTranscriptList = new ArrayList<>();
        log.info("Get {} ensembl trancript ids", ids.size());
        for (int i = 0; i < ids.size(); i += ENSEMBL_POST_THRESHOLD) {
            log.info("\tIndex {}", i);
            ensemblTranscriptList.addAll(
                ensemblService.getIds(
                    referenceGenome,
                    ids.subList(i, Math.min(ids.toArray().length, i + ENSEMBL_POST_THRESHOLD)),
                    includeUtr,
                    expand
                )
            );
        }
        return ensemblTranscriptList;
    }

    private TranscriptMatchResultVM pickEnsemblTranscript(
        TranscriptMatchResultVM transcriptMatchResultVM,
        ReferenceGenome referenceGenome,
        List<EnsemblTranscript> availableTranscripts,
        EnsemblSequence sequence
    ) {
        List<EnsemblTranscript> sameLengthList = availableTranscripts
            .stream()
            .filter(ensemblTranscript ->
                ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength().equals(sequence.getSeq().length())
            )
            .collect(Collectors.toList());

        List<EnsemblSequence> sequences = ensemblService
            .getProteinSequences(referenceGenome, sameLengthList.stream().map(EnsemblTranscript::getProteinId).collect(Collectors.toList()))
            .stream()
            .filter(filteredSequence -> filteredSequence.getSeq().length() == sequence.getSeq().length())
            .collect(Collectors.toList());
        Optional<EnsemblSequence> sequenceSame = sequences
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
            EnsemblSequence pickedSequence = sequences.iterator().next();

            Optional<EnsemblTranscript> ensemblTranscript = getEnsemblTranscriptBySequence(availableTranscripts, pickedSequence);
            transcriptMatchResultVM.setTargetEnsemblTranscript(ensemblTranscript.get());
            List<MissMatchPairVM> missMatchPairVMS = getNumOfMismatchSameLengthSequences(sequence.getSeq(), pickedSequence.getSeq());
            transcriptMatchResultVM.setNote(
                "Same length, but mismatch: " +
                missMatchPairVMS.size() +
                ". " +
                missMatchPairVMS
                    .stream()
                    .map(missMatchPairVM ->
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
                .filter(ensemblTranscript ->
                    ensemblTranscript.getProteinLength() != null && ensemblTranscript.getProteinLength() > sequence.getSeq().length()
                )
                .collect(Collectors.toList());

            List<EnsemblSequence> longerSequences = ensemblService.getProteinSequences(
                referenceGenome,
                longerOnes.stream().map(EnsemblTranscript::getProteinId).collect(Collectors.toList())
            );
            List<EnsemblSequence> sequencesContains = longerSequences
                .stream()
                .filter(matchedSequence -> matchedSequence.getSeq().contains(sequence.getSeq()))
                .collect(Collectors.toList());
            sequencesContains.sort((s1, s2) -> s2.getSeq().length() - s1.getSeq().length());

            if (sequencesContains.size() > 0) {
                EnsemblSequence pickedSequence = sequencesContains.iterator().next();
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
        Optional<EnsemblSequence> refSequenceOptional = ensemblService.getProteinSequence(
            refReferenceGenome,
            refEnsemblTranscript.getProteinId()
        );
        if (refSequenceOptional.isPresent()) {
            return targetTranscripts
                .stream()
                .filter(ensemblTranscript -> StringUtils.isNotEmpty(ensemblTranscript.getProteinId()))
                .map(ensemblTranscript -> {
                    Optional<EnsemblSequence> targetSequenceOptional = ensemblService.getProteinSequence(
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
                })
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
        EnsemblSequence sequence
    ) {
        return availableEnsemblTranscripts
            .stream()
            .filter(ensemblTranscript -> {
                if (ensemblTranscript.getProteinId() != null && ensemblTranscript.getProteinId().equals(sequence.getId())) {
                    return true;
                } else {
                    return false;
                }
            })
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

    private void clearTranscriptCaches() {
        if (this.optionalCacheManager.isPresent()) {
            for (String cacheKey : this.optionalCacheManager.get().getCacheNames()) {
                String cacheKeyPrefix = this.cacheNameResolver.getCacheName(CacheCategory.TRANSCRIPT, "");
                if (cacheKey.startsWith(cacheKeyPrefix)) {
                    Objects.requireNonNull(this.optionalCacheManager.get().getCache(cacheKey)).clear();
                }
            }
        }
    }
}
