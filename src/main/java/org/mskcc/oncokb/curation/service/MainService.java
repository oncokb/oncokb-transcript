package org.mskcc.oncokb.curation.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.validation.constraints.NotNull;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.domain.enumeration.GenomeFragmentType;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
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

    public MainService(
        TranscriptService transcriptService,
        EnsemblService ensemblService,
        GeneService geneService,
        EnsemblGeneService ensemblGeneService,
        GenomeNexusService genomeNexusService
    ) {
        this.transcriptService = transcriptService;
        this.geneService = geneService;
        this.ensemblService = ensemblService;
        this.ensemblGeneService = ensemblGeneService;
        this.genomeNexusService = genomeNexusService;
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
                ensemblGene.setReferenceGenome(referenceGenome.name());
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
            ReferenceGenome.valueOf(ensemblGene.getReferenceGenome())
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
