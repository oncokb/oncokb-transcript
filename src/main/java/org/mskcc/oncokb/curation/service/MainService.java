package org.mskcc.oncokb.curation.service;

import static org.mskcc.oncokb.curation.domain.enumeration.AlterationType.*;

import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.TranscriptConsequenceSummary;
import org.genome_nexus.client.VariantAnnotation;
import org.genome_nexus.client.VariantAnnotationSummary;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.dto.AnnotationDTO;
import org.mskcc.oncokb.curation.domain.dto.HotspotDTO;
import org.mskcc.oncokb.curation.domain.dto.HotspotInfoDTO;
import org.mskcc.oncokb.curation.domain.dto.ProteinExonDTO;
import org.mskcc.oncokb.curation.domain.enumeration.*;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.curation.util.AlterationUtils;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MainService {

    private final Logger log = LoggerFactory.getLogger(MainService.class);

    private final TranscriptService transcriptService;
    private final FlagService flagService;
    private final EnsemblService ensemblService;
    private final EnsemblGeneService ensemblGeneService;
    private final GeneService geneService;
    private final GenomeNexusService genomeNexusService;
    private final SequenceService sequenceService;
    private final TranscriptMapper transcriptMapper;
    private final AlterationUtils alterationUtils;
    private final ConsequenceService consequenceService;
    private final SeqRegionService seqRegionService;
    private final AnnotationService annotationService;

    private final CategoricalAlterationService categoricalAlterationService;

    public MainService(
        TranscriptService transcriptService,
        FlagService flagService,
        EnsemblService ensemblService,
        EnsemblGeneService ensemblGeneService,
        GeneService geneService,
        GenomeNexusService genomeNexusService,
        SequenceService sequenceService,
        TranscriptMapper transcriptMapper,
        AlterationUtils alterationUtils,
        ConsequenceService consequenceService,
        SeqRegionService seqRegionService,
        AnnotationService annotationService,
        CategoricalAlterationService categoricalAlterationService
    ) {
        this.transcriptService = transcriptService;
        this.flagService = flagService;
        this.ensemblService = ensemblService;
        this.ensemblGeneService = ensemblGeneService;
        this.geneService = geneService;
        this.genomeNexusService = genomeNexusService;
        this.sequenceService = sequenceService;
        this.transcriptMapper = transcriptMapper;
        this.alterationUtils = alterationUtils;
        this.consequenceService = consequenceService;
        this.seqRegionService = seqRegionService;
        this.annotationService = annotationService;
        this.categoricalAlterationService = categoricalAlterationService;
    }

    public Optional<Sequence> findSequenceByGene(ReferenceGenome referenceGenome, Integer entrezGeneId, SequenceType sequenceType) {
        Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findCanonicalEnsemblGene(entrezGeneId, referenceGenome);
        if (ensemblGeneOptional.isPresent()) {
            Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByEnsemblGeneAndCanonicalIsTrue(
                ensemblGeneOptional.orElseThrow()
            );
            if (transcriptDTOOptional.isPresent()) {
                Optional<Sequence> sequenceOptional = sequenceService.findOneByTranscriptAndSequenceType(
                    transcriptMapper.toEntity(transcriptDTOOptional.orElseThrow()),
                    sequenceType
                );
                if (sequenceOptional.isPresent()) {
                    return sequenceOptional;
                }
            }
        }
        return Optional.empty();
    }

    public AlterationAnnotationStatus annotateAlteration(ReferenceGenome referenceGenome, Alteration alteration) {
        AlterationAnnotationStatus alterationWithStatus = new AlterationAnnotationStatus();
        alterationWithStatus.setEntity(alteration);

        Optional<CategoricalAlteration> categoricalAlterationOptional = categoricalAlterationService.findOneByAlteration(alteration);
        if (categoricalAlterationOptional.isPresent()) {
            CategoricalAlteration categoricalAlteration = categoricalAlterationOptional.orElseThrow();
            alteration.setAlteration(categoricalAlteration.getName());
            alteration.setName(categoricalAlteration.getName());
            alteration.setType(categoricalAlteration.getAlterationType());
            alteration.setConsequence(categoricalAlteration.getConsequence());

            alterationWithStatus.setType(EntityStatusType.OK);
            alterationWithStatus.setMessage("");
            return alterationWithStatus;
        }

        EntityStatus<Alteration> alterationWithEntityStatus = alterationUtils.parseAlteration(alteration.getAlteration());
        if (alterationWithEntityStatus == null) {
            alterationWithStatus.setMessage("No alteration provided");
            alterationWithStatus.setType(EntityStatusType.ERROR);
            return alterationWithStatus;
        }

        // get protein change for genomic change variant
        if (GENOMIC_CHANGE.equals(alterationWithEntityStatus.getEntity().getType())) {
            try {
                VariantAnnotation variantAnnotation = genomeNexusService.annotateGenomicChange(
                    referenceGenome,
                    alterationWithEntityStatus.getEntity().getAlteration()
                );
                Optional<String> proteinChangeOptional = Optional.ofNullable(variantAnnotation)
                    .map(VariantAnnotation::getAnnotationSummary)
                    .map(VariantAnnotationSummary::getTranscriptConsequenceSummary)
                    .map(TranscriptConsequenceSummary::getHgvspShort)
                    .map(hgvsp -> hgvsp.replace("p.", ""));
                if (proteinChangeOptional.isPresent()) {
                    alterationWithEntityStatus.getEntity().setProteinChange(proteinChangeOptional.orElseThrow());
                }
            } catch (ApiException e) {
                alterationWithStatus.setMessage("Failed to be annotated by GenomeNexus.");
                alterationWithStatus.setType(EntityStatusType.WARNING);
            }
        }

        // update alteration type
        Alteration parsedAlteration = alterationWithEntityStatus.getEntity();
        if (parsedAlteration.getType() != null) {
            alteration.setType(parsedAlteration.getType());
        }

        // update associated genes
        Set<Gene> genes = alteration.getGenes();
        if (parsedAlteration.getType().equals(STRUCTURAL_VARIANT) && !parsedAlteration.getGenes().isEmpty()) {
            genes = parsedAlteration.getGenes();
        }
        Set<Gene> annotatedGenes = genes
            .stream()
            .map(gene -> {
                Optional<Gene> geneOptional = Optional.empty();
                if (gene.getId() != null) {
                    geneOptional = geneService.findOne(gene.getId());
                } else if (gene.getEntrezGeneId() != null) {
                    geneOptional = geneService.findGeneByEntrezGeneId(gene.getEntrezGeneId());
                } else if (gene.getHugoSymbol() != null) {
                    geneOptional = geneService.findGeneByHugoSymbol(gene.getHugoSymbol());
                    if (geneOptional.isEmpty()) {
                        geneOptional = geneService.findGeneBySynonym(gene.getHugoSymbol());
                    }
                }
                if (geneOptional.isEmpty()) {
                    geneOptional = Optional.empty();
                    log.error("No match found for gene {}", gene);
                }
                return geneOptional;
            })
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toSet());
        alteration.setGenes(annotatedGenes);
        alteration.setAlteration(parsedAlteration.getAlteration());
        alteration.setName(parsedAlteration.getName());

        if (!alteration.getGenes().isEmpty() && alteration.getGenes().stream().anyMatch(gene -> gene.getEntrezGeneId() < 0)) {
            alteration.setType(NA);
        }

        if (alteration.getConsequence() == null) {
            if (parsedAlteration.getConsequence() != null) {
                Optional<Consequence> consequenceOptional = consequenceService.findByTerm(parsedAlteration.getConsequence().getTerm());
                if (consequenceOptional.isEmpty()) {
                    consequenceOptional = consequenceService.findByTerm("UNKNOWN");
                }
                if (consequenceOptional.isPresent()) {
                    alteration.setConsequence(consequenceOptional.orElseThrow());
                }
            }
        }

        if (StringUtils.isEmpty(alteration.getProteinChange())) {
            alteration.setProteinChange(parsedAlteration.getProteinChange());
        }
        if (alteration.getStart() == null) {
            alteration.setStart(parsedAlteration.getStart());
        }
        if (alteration.getEnd() == null) {
            alteration.setEnd(parsedAlteration.getEnd());
        }
        if (alteration.getRefResidues() == null) {
            alteration.setRefResidues(parsedAlteration.getRefResidues());
        }
        if (alteration.getVariantResidues() == null) {
            alteration.setVariantResidues(parsedAlteration.getVariantResidues());
        }
        if (alteration.getName() == null) {
            alteration.setName(alteration.getAlteration());
        }

        // update reference genome
        if (alteration.getGenes().size() > 0 && PROTEIN_CHANGE.equals(alteration.getType())) {
            Gene gene = alteration.getGenes().iterator().next();
            if (alteration.getStart() != null) {
                Optional<Sequence> canonicalSequenceOptional = findSequenceByGene(
                    referenceGenome,
                    gene.getEntrezGeneId(),
                    SequenceType.PROTEIN
                );

                if (
                    canonicalSequenceOptional.isPresent() &&
                    alteration.getStart() < canonicalSequenceOptional.orElseThrow().getSequence().length()
                ) {
                    String refRe = String.valueOf(canonicalSequenceOptional.orElseThrow().getSequence().charAt(alteration.getStart() - 1));
                    if (!StringUtils.isEmpty(refRe)) {
                        if (StringUtils.isEmpty(alteration.getRefResidues())) {
                            alteration.setRefResidues(refRe);
                        } else {
                            // If The AA in alteration is differed from the canonical transcript, and it's not X, we give warning
                            // X indicates "any AA"
                            if (!refRe.equals(alteration.getRefResidues()) && !"X".equals(alteration.getRefResidues())) {
                                alterationWithStatus.setMessage(
                                    "The reference allele does not match with the transcript. It's supposed to be " + refRe
                                );
                                alterationWithStatus.setType(EntityStatusType.WARNING);
                                return alterationWithStatus;
                            }
                        }
                    }
                }
            }
        }

        alterationWithStatus.setMessage(alterationWithEntityStatus.getMessage());
        alterationWithStatus.setType(alterationWithEntityStatus.getType());

        // Provide annotation for the alteration
        // 1. check whether alteration is hotspot
        AnnotationDTO annotationDTO = new AnnotationDTO();
        Set<Alteration> relevantAlts = annotationService.findRelevantAlterations(alteration);
        List<String> hotspotFlags = Arrays.asList(HotspotFlagEnum.HOTSPOT_V1.name(), HotspotFlagEnum.THREE_D.name());
        List<Alteration> hotspots = relevantAlts
            .stream()
            .filter(alt -> !Collections.disjoint(hotspotFlags, alt.getFlags().stream().map(Flag::getFlag).collect(Collectors.toList())))
            .collect(Collectors.toList());
        HotspotInfoDTO hotspotInfoDTO = new HotspotInfoDTO();
        if (!hotspots.isEmpty()) {
            hotspotInfoDTO.setHotspot(true);
            List<HotspotDTO> associatedHotspots = new ArrayList<>();
            hotspots.forEach(hotspot -> {
                hotspot
                    .getFlags()
                    .forEach(flag -> {
                        if (hotspotFlags.contains(flag.getFlag())) {
                            HotspotDTO hotspotDTO = new HotspotDTO();
                            hotspotDTO.setType(flag.getFlag());
                            hotspotDTO.setAlteration(hotspot.getName());
                            associatedHotspots.add(hotspotDTO);
                        }
                    });
            });
            hotspotInfoDTO.setAssociatedHotspots(associatedHotspots);
        }
        annotationDTO.setHotspot(hotspotInfoDTO);

        if (annotatedGenes.size() == 1) {
            List<ProteinExonDTO> proteinExons = transcriptService.getExons(annotatedGenes.stream().iterator().next(), referenceGenome);
            if (PROTEIN_CHANGE.equals(alteration.getType()) && alteration.getStart() != null && alteration.getEnd() != null) {
                // Filter exons based on alteration range
                List<ProteinExonDTO> overlap = proteinExons
                    .stream()
                    .filter(exon -> alteration.getStart() <= exon.getRange().getEnd() && alteration.getEnd() >= exon.getRange().getStart())
                    .collect(Collectors.toList());
                annotationDTO.setExons(overlap);
            } else if (AlterationUtils.isExon(alteration.getAlteration())) {
                List<ProteinExonDTO> overlap = new ArrayList<>();
                List<String> problematicExonAlts = new ArrayList<>();
                for (String exonAlterationString : Arrays.asList(alteration.getAlteration().split("\\s*\\+\\s*"))) {
                    if (AlterationUtils.isAnyExon(exonAlterationString)) {
                        continue;
                    }
                    Integer exonNumber = Integer.parseInt(exonAlterationString.replaceAll("\\D*", ""));

                    Integer minExon = proteinExons
                        .stream()
                        .min(Comparator.comparing(ProteinExonDTO::getExon))
                        .map(ProteinExonDTO::getExon)
                        .orElse(0);

                    if (exonNumber >= minExon && exonNumber < minExon + proteinExons.size() + 1) {
                        overlap.add(proteinExons.get(exonNumber - minExon));
                    } else {
                        problematicExonAlts.add(exonAlterationString);
                    }
                }
                if (problematicExonAlts.isEmpty()) {
                    overlap.sort(Comparator.comparingInt(ProteinExonDTO::getExon));
                    Boolean isConsecutiveExonRange =
                        overlap
                            .stream()
                            .map(ProteinExonDTO::getExon)
                            .reduce((prev, curr) -> (curr - prev == 1) ? curr : Integer.MIN_VALUE)
                            .orElse(Integer.MIN_VALUE) !=
                        Integer.MIN_VALUE;
                    if (isConsecutiveExonRange && overlap.size() > 0) {
                        alteration.setStart(overlap.get(0).getRange().getStart());
                        alteration.setEnd(overlap.get(overlap.size() - 1).getRange().getEnd());
                    }

                    annotationDTO.setExons(overlap);
                } else {
                    StringBuilder sb = new StringBuilder();
                    sb.append("The following exon(s) do not exist: ");
                    sb.append(problematicExonAlts.stream().collect(Collectors.joining(", ")));
                    alterationWithStatus.setMessage(sb.toString());
                    alterationWithStatus.setType(EntityStatusType.ERROR);
                }
            }
        }

        alterationWithStatus.setAnnotation(annotationDTO);
        return alterationWithStatus;
    }

    public void createCanonicalEnsemblGene(@NotNull ReferenceGenome referenceGenome, @NotNull Integer entrezGeneId) {
        Optional<EnsemblGene> savedCanonicalEnsemblGeneOptional = ensemblGeneService.findCanonicalEnsemblGene(
            entrezGeneId,
            referenceGenome
        );
        if (savedCanonicalEnsemblGeneOptional.isEmpty()) {
            List<org.genome_nexus.client.EnsemblGene> ensemblGeneFromGN = new ArrayList<>();
            try {
                ensemblGeneFromGN = genomeNexusService.findCanonicalEnsemblGeneTranscript(
                    referenceGenome,
                    Collections.singletonList(entrezGeneId)
                );
                if (!ensemblGeneFromGN.isEmpty()) {
                    org.genome_nexus.client.EnsemblGene ensemblGene = ensemblGeneFromGN.get(0);
                    if (StringUtils.isNotEmpty(ensemblGene.getGeneId())) {
                        Optional<EnsemblGene> ensemblGeneOptional = createEnsemblGene(
                            referenceGenome,
                            ensemblGene.getGeneId(),
                            entrezGeneId,
                            true
                        );
                        if (ensemblGeneOptional.isEmpty()) {
                            log.error("Failed to save the ensembl {} {} {}", referenceGenome, ensemblGene.getGeneId(), entrezGeneId);
                        }
                    } else {
                        log.warn("No ensembl gene id available {} {} {}", referenceGenome, entrezGeneId, ensemblGene);
                    }
                } else {
                    log.error("No canonical ensembl gene for {} {}", referenceGenome, entrezGeneId);
                }
            } catch (ApiException e) {
                log.error("Failed to fetch the canonical transcript from GN {} {}", referenceGenome, entrezGeneId);
                log.error(e.getMessage());
            }
        }
    }

    public Optional<EnsemblGene> createEnsemblGene(
        @NotNull ReferenceGenome referenceGenome,
        @NotNull String ensemblGeneId,
        @NotNull Integer entrezGeneId,
        Boolean isCanonical
    ) {
        Optional<EnsemblGene> savedEnsemblGeneOptional = ensemblGeneService.findByEnsemblGeneIdAndReferenceGenome(
            ensemblGeneId,
            referenceGenome
        );
        if (savedEnsemblGeneOptional.isEmpty()) {
            Optional<org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript> ensemblGeneOptional = ensemblService.getId(
                referenceGenome,
                ensemblGeneId,
                true,
                true
            );
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(entrezGeneId);
            if (ensemblGeneOptional.isPresent() && geneOptional.isPresent()) {
                org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript remoteEnsemblGene = ensemblGeneOptional.orElseThrow();
                Optional<SeqRegion> seqRegionOptional = seqRegionService.findByNameOrCreate(remoteEnsemblGene.getSeqRegionName());
                EnsemblGene ensemblGene = new EnsemblGene();
                ensemblGene.setReferenceGenome(referenceGenome);
                ensemblGene.setEnsemblGeneId(remoteEnsemblGene.getId());
                if (seqRegionOptional.isPresent()) {
                    ensemblGene.setSeqRegion(seqRegionOptional.orElseThrow());
                }
                ensemblGene.setStart(remoteEnsemblGene.getStart());
                ensemblGene.setEnd(remoteEnsemblGene.getEnd());
                ensemblGene.setStrand(remoteEnsemblGene.getStrand());
                ensemblGene.setGene(geneOptional.orElseThrow());
                if (isCanonical != null) {
                    ensemblGene.setCanonical(isCanonical);
                }
                savedEnsemblGeneOptional = Optional.of(ensemblGeneService.save(ensemblGene));

                // when creating canonical ensembl gene, we should add the canonical transcript from Ensembl
                if (isCanonical != null && isCanonical && StringUtils.isNotEmpty(remoteEnsemblGene.getCanonicalTranscript())) {
                    createTranscript(
                        referenceGenome,
                        remoteEnsemblGene.getCanonicalTranscript(),
                        geneOptional.orElseThrow().getEntrezGeneId(),
                        null,
                        null,
                        false,
                        Collections.singletonList(TranscriptFlagEnum.ENSEMBL_CANONICAL)
                    );
                }
            }
        } else if (isCanonical != null && savedEnsemblGeneOptional.orElseThrow().getCanonical() != isCanonical) {
            savedEnsemblGeneOptional.orElseThrow().setCanonical(isCanonical);
            savedEnsemblGeneOptional = ensemblGeneService.partialUpdate(savedEnsemblGeneOptional.orElseThrow());
        }
        return savedEnsemblGeneOptional;
    }

    /**
     * Create/Update transcript using the info. The method will include genome fragments if the ensemblTranscript is specified
     *
     * @param referenceGenome
     * @param ensemblTranscriptId
     * @return an optional with the saved transcript
     */
    public Optional<TranscriptDTO> createTranscript(
        @NotNull ReferenceGenome referenceGenome,
        @NotNull String ensemblTranscriptId,
        @NotNull Integer entrezGeneId,
        String ensemblProteinId,
        String refSeqId,
        Boolean isCanonical,
        @NotNull List<TranscriptFlagEnum> transcriptFlags
    ) {
        Optional<EnsemblTranscript> ensemblTranscriptOptional = ensemblService.getTranscript(referenceGenome, ensemblTranscriptId);
        if (ensemblTranscriptOptional.isPresent()) {
            Optional<EnsemblGene> savedEnsemblGeneOptional = createEnsemblGene(
                referenceGenome,
                ensemblTranscriptOptional.orElseThrow().getParent(),
                entrezGeneId,
                null
            );
            if (savedEnsemblGeneOptional.isPresent()) {
                return createTranscript(
                    savedEnsemblGeneOptional.orElseThrow(),
                    ensemblTranscriptOptional.orElseThrow(),
                    ensemblProteinId,
                    refSeqId,
                    isCanonical,
                    transcriptFlags
                );
            } else {
                log.error(
                    "Failed to create ensembl gene {} {} {} {}",
                    referenceGenome,
                    ensemblTranscriptOptional.orElseThrow().getParent(),
                    entrezGeneId,
                    isCanonical
                );
            }
        } else {
            log.error("Failed to find ensembl transcript through Ensembl {} {} {}", referenceGenome, entrezGeneId, ensemblTranscriptId);
        }
        return Optional.empty();
    }

    private Optional<TranscriptDTO> createTranscript(
        @NotNull EnsemblGene ensemblGene,
        @NotNull EnsemblTranscript ensemblTranscript,
        String ensemblProteinId,
        String refSeqId,
        Boolean isCanonical,
        @NotNull List<TranscriptFlagEnum> transcriptFlags
    ) {
        String transcriptId = ensemblTranscript.getId();
        if (ensemblTranscript.getVersion() != null) {
            transcriptId += "." + ensemblTranscript.getVersion().toString();
        }
        if (ensemblProteinId == null && ensemblTranscript.getTranscription() != null) {
            Optional<EnsemblTranscript> proteinTranscriptOptional = ensemblService.getId(
                ensemblGene.getReferenceGenome(),
                ensemblTranscript.getTranscription().getId(),
                false,
                false
            );
            if (proteinTranscriptOptional.isPresent()) {
                ensemblProteinId = proteinTranscriptOptional.orElseThrow().getId() +
                "." +
                proteinTranscriptOptional.orElseThrow().getVersion();
            } else {
                log.error(
                    "Failed to find ensembl protein through Ensembl {} {}",
                    ensemblGene.getReferenceGenome(),
                    ensemblTranscript.getTranscription().getId()
                );
            }
        }
        if (isCanonical != null && isCanonical) {
            Optional<TranscriptDTO> canonicalTranscriptOptional = transcriptService.findByEnsemblGeneAndCanonicalIsTrue(ensemblGene);
            if (
                canonicalTranscriptOptional.isPresent() &&
                !canonicalTranscriptOptional.orElseThrow().getEnsemblTranscriptId().equals(transcriptId)
            ) {
                canonicalTranscriptOptional.orElseThrow().setCanonical(false);
                transcriptService.partialUpdate(canonicalTranscriptOptional.orElseThrow());
            }
        }

        Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByEnsemblGeneAndEnsemblTranscriptId(
            ensemblGene,
            transcriptId
        );
        List<Flag> flagList = flagService.findAllByFlagIn(transcriptFlags.stream().map(flag -> flag.name()).collect(Collectors.toList()));
        if (transcriptDTOOptional.isPresent()) {
            if (isCanonical != null && transcriptDTOOptional.orElseThrow().getCanonical() != isCanonical) {
                transcriptDTOOptional.orElseThrow().setCanonical(isCanonical);
            }
            transcriptDTOOptional.orElseThrow().getFlags().addAll(flagList);
            transcriptDTOOptional = transcriptService.partialUpdate(transcriptDTOOptional.orElseThrow());
            return transcriptDTOOptional;
        }

        TranscriptDTO transcriptDTO = new TranscriptDTO();
        transcriptDTO.setEnsemblGene(ensemblGene);
        transcriptDTO.setEnsemblTranscriptId(transcriptId);
        transcriptDTO.setEnsemblProteinId(ensemblProteinId);
        transcriptDTO.setReferenceSequenceId(refSeqId);
        transcriptDTO.setCanonical(isCanonical == null ? false : isCanonical);
        transcriptDTO.setFlags(flagList);
        updateGenomeFragments(transcriptDTO, ensemblTranscript);

        Optional<TranscriptDTO> savedTranscriptDTO = Optional.of(transcriptService.save(transcriptDTO));
        return savedTranscriptDTO;
    }

    private void updateGenomeFragments(
        TranscriptDTO transcriptDTO,
        org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript ensemblTranscript
    ) {
        // save gene fragment
        transcriptDTO.setChromosome(ensemblTranscript.getSeqRegionName());
        transcriptDTO.setStart(ensemblTranscript.getStart());
        transcriptDTO.setEnd(ensemblTranscript.getEnd());
        transcriptDTO.setStrand(ensemblTranscript.getStrand());

        // save UTRs
        transcriptDTO.setUtrs(
            ensemblTranscript
                .getUtrs()
                .stream()
                .map(utr -> {
                    GenomeFragment utrFragment = new GenomeFragment();
                    GenomeFragmentType genomeFragmentType = null;

                    Optional<SeqRegion> seqRegionOptional = seqRegionService.findByNameOrCreate(utr.getSeqRegionName());

                    switch (utr.getType()) {
                        case "five_prime_UTR":
                            genomeFragmentType = GenomeFragmentType.FIVE_PRIME_UTR;
                            break;
                        case "three_prime_UTR":
                            genomeFragmentType = GenomeFragmentType.THREE_PRIME_UTR;
                            break;
                        default:
                            break;
                    }
                    if (genomeFragmentType != null) {
                        utrFragment.setType(genomeFragmentType);
                        utrFragment.setStrand(utr.getStrand());
                        utrFragment.setStart(utr.getStart());
                        utrFragment.setEnd(utr.getEnd());
                        if (seqRegionOptional.isPresent()) {
                            utrFragment.setSeqRegion(seqRegionOptional.orElseThrow());
                        }
                    }
                    return utrFragment;
                })
                .collect(Collectors.toList())
        );

        // save exons
        transcriptDTO.setExons(
            ensemblTranscript
                .getExons()
                .stream()
                .map(utr -> {
                    GenomeFragment exonFragment = new GenomeFragment();
                    exonFragment.setType(GenomeFragmentType.EXON);
                    exonFragment.setStrand(utr.getStrand());
                    exonFragment.setStart(utr.getStart());
                    exonFragment.setEnd(utr.getEnd());

                    Optional<SeqRegion> seqRegionOptional = seqRegionService.findByNameOrCreate(utr.getSeqRegionName());

                    if (seqRegionOptional.isPresent()) {
                        exonFragment.setSeqRegion(seqRegionOptional.orElseThrow());
                    }
                    return exonFragment;
                })
                .collect(Collectors.toList())
        );
    }
}
