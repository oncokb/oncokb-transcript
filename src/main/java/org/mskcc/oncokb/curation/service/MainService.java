package org.mskcc.oncokb.curation.service;

import static org.mskcc.oncokb.curation.domain.enumeration.AlterationType.COPY_NUMBER_ALTERATION;
import static org.mskcc.oncokb.curation.domain.enumeration.AlterationType.STRUCTURAL_VARIANT;
import static org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence.MISSENSE_VARIANT;

import java.util.*;
import java.util.stream.Collectors;
import javax.validation.constraints.NotNull;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.mskcc.oncokb.curation.domain.*;
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
    private final EnsemblService ensemblService;
    private final EnsemblGeneService ensemblGeneService;
    private final GeneService geneService;
    private final GenomeNexusService genomeNexusService;
    private final SequenceService sequenceService;
    private final TranscriptMapper transcriptMapper;
    private final AlterationUtils alterationUtils;
    private final ConsequenceService consequenceService;

    public MainService(
        TranscriptService transcriptService,
        EnsemblService ensemblService,
        EnsemblGeneService ensemblGeneService,
        GeneService geneService,
        GenomeNexusService genomeNexusService,
        SequenceService sequenceService,
        TranscriptMapper transcriptMapper,
        AlterationUtils alterationUtils,
        ConsequenceService consequenceService
    ) {
        this.transcriptService = transcriptService;
        this.ensemblService = ensemblService;
        this.ensemblGeneService = ensemblGeneService;
        this.geneService = geneService;
        this.genomeNexusService = genomeNexusService;
        this.sequenceService = sequenceService;
        this.transcriptMapper = transcriptMapper;
        this.alterationUtils = alterationUtils;
        this.consequenceService = consequenceService;
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

    public void annotateAlteration(Alteration alteration) {
        Alteration pcAlteration = alterationUtils.parseProteinChange(alteration.getAlteration());

        if (alteration.getGenes() == null || alteration.getGenes().isEmpty()) {
            alteration.setGenes(pcAlteration.getGenes());
        }
        alteration.setAlteration(pcAlteration.getAlteration());
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
                }
                if (geneOptional.isEmpty()) {
                    geneOptional = Optional.of(gene);
                }
                return geneOptional.get();
            })
            .collect(Collectors.toSet());
        alteration.setGenes(genes);

        if (alteration.getConsequence() == null) {
            if (pcAlteration.getConsequence() != null) {
                Optional<Consequence> consequenceOptional = consequenceService.findConsequenceByTypeAndTerm(
                    pcAlteration.getConsequence().getType(),
                    pcAlteration.getConsequence().getTerm()
                );
                if (consequenceOptional.isEmpty()) {
                    consequenceOptional = consequenceService.findConsequenceByTypeAndTerm(AlterationType.UNKNOWN, "UNKNOWN");
                }
                if (consequenceOptional.isPresent()) {
                    alteration.setConsequence(consequenceOptional.get());
                }
            }
        }

        if (alteration.getProteinStart() == null) {
            alteration.setProteinStart(pcAlteration.getProteinStart());
        }
        if (alteration.getProteinEnd() == null) {
            alteration.setProteinEnd(pcAlteration.getProteinEnd());
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
        if (MISSENSE_VARIANT.equals(alteration.getConsequence().getType())) {
            Gene gene = alteration.getGenes().iterator().next();
            if (alteration.getProteinStart() != null) {
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

                if (grch37Sequence.isPresent()) {
                    String refRe = String.valueOf(grch37Sequence.get().getSequence().charAt(alteration.getProteinStart() - 1));
                    if (StringUtils.isEmpty(alteration.getRefResidues())) {
                        alteration.setRefResidues(refRe);
                    }
                    if (alteration.getRefResidues().equals(refRe)) {
                        AlterationReferenceGenome alterationReferenceGenome = new AlterationReferenceGenome();
                        alterationReferenceGenome.setReferenceGenome(ReferenceGenome.GRCh37);
                        alteration.getReferenceGenomes().add(alterationReferenceGenome);
                    }
                }
                if (grch38Sequence.isPresent()) {
                    String refRe = String.valueOf(grch38Sequence.get().getSequence().charAt(alteration.getProteinStart() - 1));
                    if (StringUtils.isEmpty(alteration.getRefResidues())) {
                        alteration.setRefResidues(refRe);
                    }
                    if (alteration.getRefResidues().equals(refRe)) {
                        AlterationReferenceGenome alterationReferenceGenome = new AlterationReferenceGenome();
                        alterationReferenceGenome.setReferenceGenome(ReferenceGenome.GRCh38);
                        alteration.getReferenceGenomes().add(alterationReferenceGenome);
                    }
                }
            }
        } else if (
            STRUCTURAL_VARIANT.equals(alteration.getConsequence().getType()) ||
            COPY_NUMBER_ALTERATION.equals(alteration.getConsequence().getType())
        ) {
            for (ReferenceGenome rg : ReferenceGenome.values()) {
                AlterationReferenceGenome alterationReferenceGenome = new AlterationReferenceGenome();
                alterationReferenceGenome.setReferenceGenome(rg);
                alteration.getReferenceGenomes().add(alterationReferenceGenome);
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
                }
            } catch (ApiException e) {
                e.printStackTrace();
            }
        }
    }

    public Optional<EnsemblGene> createEnsemblGene(
        @NotNull ReferenceGenome referenceGenome,
        @NotNull String ensemblGeneId,
        @NotNull Integer entrezGeneId,
        @NotNull Boolean isCanonical
    ) {
        Optional<EnsemblGene> previousSavedCanonicalEnsemblGeneOptional = ensemblGeneService.findCanonicalEnsemblGene(
            entrezGeneId,
            referenceGenome
        );

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
                EnsemblGene ensemblGene = new EnsemblGene();
                ensemblGene.setReferenceGenome(referenceGenome);
                ensemblGene.setEnsemblGeneId(remoteEnsemblGene.getId());
                ensemblGene.setChromosome(remoteEnsemblGene.getSeqRegionName());
                ensemblGene.setStart(remoteEnsemblGene.getStart());
                ensemblGene.setEnd(remoteEnsemblGene.getEnd());
                ensemblGene.setStrand(remoteEnsemblGene.getStrand());
                ensemblGene.setGene(geneOptional.get());
                ensemblGene.setCanonical(isCanonical);
                savedEnsemblGeneOptional = Optional.of(ensemblGeneService.save(ensemblGene));
            }
        } else if (savedEnsemblGeneOptional.get().getCanonical() != isCanonical) {
            savedEnsemblGeneOptional.get().setCanonical(isCanonical);
            savedEnsemblGeneOptional = ensemblGeneService.partialUpdate(savedEnsemblGeneOptional.get());
        }
        if (
            savedEnsemblGeneOptional.isPresent() &&
            previousSavedCanonicalEnsemblGeneOptional.isPresent() &&
            !savedEnsemblGeneOptional.get().getEnsemblGeneId().equals(previousSavedCanonicalEnsemblGeneOptional.get().getEnsemblGeneId()) &&
            isCanonical
        ) {
            previousSavedCanonicalEnsemblGeneOptional.get().setCanonical(false);
            ensemblGeneService.partialUpdate(previousSavedCanonicalEnsemblGeneOptional.get());
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
        @NotNull Boolean isCanonical
    ) {
        Optional<EnsemblTranscript> ensemblTranscriptOptional = ensemblService.getTranscript(referenceGenome, ensemblTranscriptId);
        if (ensemblTranscriptOptional.isPresent()) {
            Optional<EnsemblGene> savedEnsemblGeneOptional = createEnsemblGene(
                referenceGenome,
                ensemblTranscriptOptional.get().getParent(),
                entrezGeneId,
                isCanonical
            );
            if (savedEnsemblGeneOptional.isPresent()) {
                return createTranscript(savedEnsemblGeneOptional.get(), ensemblTranscriptOptional.get(), isCanonical);
            }
        }
        return Optional.empty();
    }

    private Optional<TranscriptDTO> createTranscript(
        @NotNull EnsemblGene ensemblGene,
        @NotNull EnsemblTranscript ensemblTranscript,
        @NotNull Boolean isCanonical
    ) {
        if (isCanonical) {
            Optional<TranscriptDTO> canonicalTranscript = transcriptService.findByEnsemblGeneAndCanonicalIsTrue(ensemblGene);
            if (canonicalTranscript.isPresent() && !canonicalTranscript.get().getEnsemblTranscriptId().equals(ensemblTranscript.getId())) {
                canonicalTranscript.get().setCanonical(false);
                transcriptService.partialUpdate(canonicalTranscript.get());
            }
        }

        Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByEnsemblGeneAndEnsemblTranscriptId(
            ensemblGene,
            ensemblTranscript.getId()
        );
        if (transcriptDTOOptional.isPresent()) {
            if (transcriptDTOOptional.get().getCanonical() != isCanonical) {
                transcriptDTOOptional.get().setCanonical(isCanonical);
                transcriptDTOOptional = transcriptService.partialUpdate(transcriptDTOOptional.get());
            }
            return transcriptDTOOptional;
        }

        Optional<org.genome_nexus.client.EnsemblTranscript> gnEnsemblTranscriptOptional = transcriptService.getEnsemblTranscript(
            ensemblTranscript.getId(),
            ensemblGene.getReferenceGenome()
        );
        if (gnEnsemblTranscriptOptional.isPresent()) {
            org.genome_nexus.client.EnsemblTranscript gnEnsemblTranscript = gnEnsemblTranscriptOptional.get();

            TranscriptDTO transcriptDTO = new TranscriptDTO();
            transcriptDTO.setEnsemblGene(ensemblGene);
            transcriptDTO.setEnsemblTranscriptId(gnEnsemblTranscript.getTranscriptId());
            transcriptDTO.setEnsemblProteinId(gnEnsemblTranscript.getProteinId());
            transcriptDTO.setReferenceSequenceId(gnEnsemblTranscript.getRefseqMrnaId());
            transcriptDTO.setCanonical(isCanonical);
            updateGenomeFragments(transcriptDTO, ensemblTranscript);

            Optional<TranscriptDTO> savedTranscriptDTO = Optional.of(transcriptService.save(transcriptDTO));
            return savedTranscriptDTO;
        } else {
            return Optional.empty();
        }
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
                        utrFragment.setChromosome(utr.getSeqRegionName());
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
                    exonFragment.setChromosome(utr.getSeqRegionName());
                    return exonFragment;
                })
                .collect(Collectors.toList())
        );
    }
}
