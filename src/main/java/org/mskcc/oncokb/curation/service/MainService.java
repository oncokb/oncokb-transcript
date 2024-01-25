package org.mskcc.oncokb.curation.service;

import static org.mskcc.oncokb.curation.domain.enumeration.AlterationType.*;

import java.util.*;
import java.util.stream.Collectors;
import javax.validation.constraints.NotNull;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.GenomeFragmentType;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.mskcc.oncokb.curation.domain.enumeration.TranscriptFlagEnum;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.curation.util.AlterationUtils;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript;
import org.mskcc.oncokb.curation.web.rest.errors.BadRequestException;
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
        this.categoricalAlterationService = categoricalAlterationService;
    }

    public Optional<Sequence> findSequenceByGene(ReferenceGenome referenceGenome, Integer entrezGeneId, SequenceType sequenceType) {
        Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findCanonicalEnsemblGene(entrezGeneId, referenceGenome);
        if (ensemblGeneOptional.isPresent()) {
            Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByEnsemblGeneAndCanonicalIsTrue(
                ensemblGeneOptional.get()
            );
            if (transcriptDTOOptional.isPresent()) {
                Optional<Sequence> sequenceOptional = sequenceService.findOneByTranscriptAndSequenceType(
                    transcriptMapper.toEntity(transcriptDTOOptional.get()),
                    sequenceType
                );
                if (sequenceOptional.isPresent()) {
                    return sequenceOptional;
                }
            }
        }
        return Optional.empty();
    }

    private void enrichQuery(Alteration alteration) {
        if (alteration.getGenes().size() > 0) {
            alteration.setGenes(
                alteration
                    .getGenes()
                    .stream()
                    .map(gene -> {
                        if (gene.getId() != null) {
                            Optional<Gene> geneOptional = geneService.findOne(gene.getId());
                            if (geneOptional.isEmpty()) {
                                throw new BadRequestException("Cannot find matched gene using provided id.");
                            } else {
                                return geneOptional.get();
                            }
                        }
                        return gene;
                    })
                    .collect(Collectors.toSet())
            );
        }
    }

    public void annotateAlteration(Alteration alteration) {
        enrichQuery(alteration);

        Optional<CategoricalAlteration> categoricalAlterationOptional = categoricalAlterationService.findOneByAlteration(alteration);
        if (categoricalAlterationOptional.isPresent()) {
            CategoricalAlteration categoricalAlteration = categoricalAlterationOptional.get();
            alteration.setAlteration(categoricalAlteration.getName());
            alteration.setName(categoricalAlteration.getName());
            alteration.setType(categoricalAlteration.getAlterationType());
            alteration.setConsequence(categoricalAlteration.getConsequence());
            return;
        }

        Alteration pcAlteration = alterationUtils.parseProteinChange(alteration.getAlteration());
        if (pcAlteration == null) {
            return;
        }
        if (pcAlteration.getType() != null) {
            alteration.setType(pcAlteration.getType());
        }
        if (
            alteration.getGenes().size() > 0 &&
            alteration.getGenes().stream().filter(gene -> gene.getEntrezGeneId() < 0).findAny().isPresent()
        ) {
            alteration.setType(NA);
        }
        if (pcAlteration.getType().equals(STRUCTURAL_VARIANT) && !pcAlteration.getGenes().isEmpty()) {
            alteration.setGenes(pcAlteration.getGenes());
        }
        alteration.setAlteration(pcAlteration.getAlteration());
        alteration.setName(pcAlteration.getName());
        if (PROTEIN_CHANGE.equals(pcAlteration.getType())) {
            alteration.setProteinChange(pcAlteration.getProteinChange());
        }
        Set<Gene> genes = alteration
            .getGenes()
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
        alteration.setGenes(genes);

        if (alteration.getConsequence() == null) {
            if (pcAlteration.getConsequence() != null) {
                Optional<Consequence> consequenceOptional = consequenceService.findByTerm(pcAlteration.getConsequence().getTerm());
                if (consequenceOptional.isEmpty()) {
                    consequenceOptional = consequenceService.findByTerm("UNKNOWN");
                }
                if (consequenceOptional.isPresent()) {
                    alteration.setConsequence(consequenceOptional.get());
                }
            }
        }

        if (alteration.getStart() == null) {
            alteration.setStart(pcAlteration.getStart());
        }
        if (alteration.getEnd() == null) {
            alteration.setEnd(pcAlteration.getEnd());
        }
        if (alteration.getRefResidues() == null) {
            alteration.setRefResidues(pcAlteration.getRefResidues());
        }
        if (alteration.getVariantResidues() == null) {
            alteration.setVariantResidues(pcAlteration.getVariantResidues());
        }
        if (alteration.getName() == null) {
            alteration.setName(alteration.getAlteration());
        }

        // update reference genome
        if (alteration.getGenes().size() > 0 && PROTEIN_CHANGE.equals(alteration.getType())) {
            Gene gene = alteration.getGenes().iterator().next();
            if (alteration.getStart() != null) {
                Optional<Sequence> grch37Sequence = findSequenceByGene(
                    ReferenceGenome.GRCh37,
                    gene.getEntrezGeneId(),
                    SequenceType.PROTEIN
                );
                Optional<Sequence> grch38Sequence = findSequenceByGene(
                    ReferenceGenome.GRCh38,
                    gene.getEntrezGeneId(),
                    SequenceType.PROTEIN
                );

                if (grch37Sequence.isPresent() && alteration.getStart() < grch37Sequence.get().getSequence().length()) {
                    String refRe = String.valueOf(grch37Sequence.get().getSequence().charAt(alteration.getStart() - 1));
                    if (StringUtils.isEmpty(alteration.getRefResidues())) {
                        alteration.setRefResidues(refRe);
                    }
                }
                if (grch38Sequence.isPresent() && alteration.getStart() < grch38Sequence.get().getSequence().length()) {
                    String refRe = String.valueOf(grch38Sequence.get().getSequence().charAt(alteration.getStart() - 1));
                    if (StringUtils.isEmpty(alteration.getRefResidues())) {
                        alteration.setRefResidues(refRe);
                    }
                }
            }
        }
    }

    public void createCanonicalEnsemblGene(@NotNull ReferenceGenome referenceGenome, @NotNull Integer entrezGeneId) {
        Optional<EnsemblGene> savedCanonicalEnsemblGeneOptional = ensemblGeneService.findCanonicalEnsemblGene(
            entrezGeneId,
            referenceGenome
        );
        if (savedCanonicalEnsemblGeneOptional.isEmpty()) {
            List<org.genome_nexus.client.EnsemblGene> ensemblGeneFromGN = new ArrayList<>();
            try {
                ensemblGeneFromGN =
                    genomeNexusService.findCanonicalEnsemblGeneTranscript(referenceGenome, Collections.singletonList(entrezGeneId));
                if (ensemblGeneFromGN.size() > 0) {
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
                org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript remoteEnsemblGene = ensemblGeneOptional.get();
                Optional<SeqRegion> seqRegionOptional = seqRegionService.findByNameOrCreate(remoteEnsemblGene.getSeqRegionName());
                EnsemblGene ensemblGene = new EnsemblGene();
                ensemblGene.setReferenceGenome(referenceGenome);
                ensemblGene.setEnsemblGeneId(remoteEnsemblGene.getId());
                if (seqRegionOptional.isPresent()) {
                    ensemblGene.setSeqRegion(seqRegionOptional.get());
                }
                ensemblGene.setStart(remoteEnsemblGene.getStart());
                ensemblGene.setEnd(remoteEnsemblGene.getEnd());
                ensemblGene.setStrand(remoteEnsemblGene.getStrand());
                ensemblGene.setGene(geneOptional.get());
                if (isCanonical != null) {
                    ensemblGene.setCanonical(isCanonical);
                }
                savedEnsemblGeneOptional = Optional.of(ensemblGeneService.save(ensemblGene));

                // when creating canonical ensembl gene, we should add the canonical transcript from Ensembl
                if (isCanonical != null && isCanonical && StringUtils.isNotEmpty(remoteEnsemblGene.getCanonicalTranscript())) {
                    createTranscript(
                        referenceGenome,
                        remoteEnsemblGene.getCanonicalTranscript(),
                        geneOptional.get().getEntrezGeneId(),
                        null,
                        null,
                        false,
                        Collections.singletonList(TranscriptFlagEnum.ENSEMBL_CANONICAL)
                    );
                }
            }
        } else if (isCanonical != null && savedEnsemblGeneOptional.get().getCanonical() != isCanonical) {
            savedEnsemblGeneOptional.get().setCanonical(isCanonical);
            savedEnsemblGeneOptional = ensemblGeneService.partialUpdate(savedEnsemblGeneOptional.get());
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
                ensemblTranscriptOptional.get().getParent(),
                entrezGeneId,
                null
            );
            if (savedEnsemblGeneOptional.isPresent()) {
                return createTranscript(
                    savedEnsemblGeneOptional.get(),
                    ensemblTranscriptOptional.get(),
                    ensemblProteinId,
                    refSeqId,
                    isCanonical,
                    transcriptFlags
                );
            } else {
                log.error(
                    "Failed to create ensembl gene {} {} {} {}",
                    referenceGenome,
                    ensemblTranscriptOptional.get().getParent(),
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
                ensemblProteinId = proteinTranscriptOptional.get().getId() + "." + proteinTranscriptOptional.get().getVersion();
            } else {
                log.error(
                    "Failed to find ensembl protein through Ensembl {} {}",
                    ensemblGene.getReferenceGenome(),
                    ensemblTranscript.getTranscription().getId()
                );
            }
        }
        if (isCanonical != null && isCanonical) {
            Optional<TranscriptDTO> canonicalTranscript = transcriptService.findByEnsemblGeneAndCanonicalIsTrue(ensemblGene);
            if (canonicalTranscript.isPresent() && !canonicalTranscript.get().getEnsemblTranscriptId().equals(transcriptId)) {
                canonicalTranscript.get().setCanonical(false);
                transcriptService.partialUpdate(canonicalTranscript.get());
            }
        }

        Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByEnsemblGeneAndEnsemblTranscriptId(
            ensemblGene,
            transcriptId
        );
        List<Flag> flagList = flagService.findAllByFlagIn(transcriptFlags.stream().map(flag -> flag.name()).collect(Collectors.toList()));
        if (transcriptDTOOptional.isPresent()) {
            if (isCanonical != null && transcriptDTOOptional.get().getCanonical() != isCanonical) {
                transcriptDTOOptional.get().setCanonical(isCanonical);
            }
            transcriptDTOOptional.get().getFlags().addAll(flagList);
            transcriptDTOOptional = transcriptService.partialUpdate(transcriptDTOOptional.get());
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
                            utrFragment.setSeqRegion(seqRegionOptional.get());
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
                        exonFragment.setSeqRegion(seqRegionOptional.get());
                    }
                    return exonFragment;
                })
                .collect(Collectors.toList())
        );
    }
}
