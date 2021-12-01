package org.mskcc.oncokb.transcript.importer;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.transcript.domain.EnsemblGene;
import org.mskcc.oncokb.transcript.domain.TranscriptUsage;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.UsageSource;
import org.mskcc.oncokb.transcript.service.*;
import org.mskcc.oncokb.transcript.service.dto.TranscriptDTO;
import org.mskcc.oncokb.transcript.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.transcript.vm.ensembl.EnsemblTranscript;
import org.oncokb.ApiException;
import org.oncokb.client.Gene;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by Hongxin Zhang on 1/27/21.
 */
@Component
public class Importer {

    @Autowired
    private OncoKbUrlService oncoKbUrlService;

    @Autowired
    private GeneService geneService;

    @Autowired
    private TranscriptService transcriptService;

    @Autowired
    private TranscriptUsageService transcriptUsageService;

    @Autowired
    private TranscriptMapper transcriptMapper;

    @Autowired
    private GenomeNexusService genomeNexusService;

    @Autowired
    private EnsemblService ensemblService;

    @Autowired
    private EnsemblGeneService ensemblGeneService;

    private final Logger log = LoggerFactory.getLogger(Importer.class);

    public void generalImport() throws ApiException {
        //        try {
        //            geneService.updatePortalGenes();
        //        } catch (IOException e) {
        //            e.printStackTrace();
        //        }
        //        this.importOncoKbSequences();
        //        importEnsemblGenes();
        checkOncoKbEnsemblGenes();
        //        importGeneFragments();
    }

    private void importOncoKbSequences() throws ApiException {
        List<Gene> genes = oncoKbUrlService.getGenes();
        for (Gene gene : genes) {
            // Add grch37 sequence
            if (
                !transcriptService
                    .findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome.GRCh37, gene.getGrch37Isoform())
                    .isPresent() &&
                StringUtils.isNotEmpty(gene.getGrch37Isoform())
            ) {
                Optional<org.genome_nexus.client.EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                    gene.getGrch37Isoform(),
                    ReferenceGenome.GRCh37
                );
                if (ensemblTranscriptOptional.isPresent()) {
                    org.genome_nexus.client.EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
                    Optional<TranscriptDTO> savedGrch37TranscriptOptional = transcriptService.createTranscript(
                        ReferenceGenome.GRCh37,
                        gene.getEntrezGeneId(),
                        gene.getHugoSymbol(),
                        ensemblTranscript.getTranscriptId(),
                        ensemblTranscript.getProteinId(),
                        ensemblTranscript.getRefseqMrnaId(),
                        null
                    );
                    if (savedGrch37TranscriptOptional.isPresent()) {
                        addTranscriptUsage(savedGrch37TranscriptOptional.get());
                    }
                }
            }

            // Add grch38 sequence
            if (
                !transcriptService
                    .findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome.GRCh38, gene.getGrch38Isoform())
                    .isPresent() &&
                StringUtils.isNotEmpty(gene.getGrch38Isoform())
            ) {
                Optional<org.genome_nexus.client.EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                    gene.getGrch38Isoform(),
                    ReferenceGenome.GRCh38
                );
                if (ensemblTranscriptOptional.isPresent()) {
                    org.genome_nexus.client.EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
                    Optional<TranscriptDTO> savedGrch38TranscriptOptional = transcriptService.createTranscript(
                        ReferenceGenome.GRCh38,
                        gene.getEntrezGeneId(),
                        gene.getHugoSymbol(),
                        ensemblTranscript.getTranscriptId(),
                        ensemblTranscript.getProteinId(),
                        ensemblTranscript.getRefseqMrnaId(),
                        null
                    );
                    if (savedGrch38TranscriptOptional.isPresent()) {
                        addTranscriptUsage(savedGrch38TranscriptOptional.get());
                    }
                }
            }
        }
    }

    private void importEnsemblGenes() {
        for (ReferenceGenome rg : ReferenceGenome.values()) {
            List<Integer> ids = geneService
                .findAll()
                .stream()
                .filter(gene -> gene.getEntrezGeneId() > 0)
                .map(gene -> gene.getEntrezGeneId())
                .collect(Collectors.toList());
            try {
                ensemblGeneService.saveByReferenceGenomeAndEntrezGeneIds(rg, ids);
            } catch (org.genome_nexus.ApiException e) {
                e.printStackTrace();
            }
        }
    }

    private void checkOncoKbEnsemblGenes() throws ApiException {
        for (Gene gene : oncoKbUrlService.getGenes()) {
            // check grch37
            Optional<org.mskcc.oncokb.transcript.domain.Gene> geneOptional = geneService.findGeneByEntrezGeneId(gene.getEntrezGeneId());
            if (geneOptional.isEmpty()) {
                log.error("The OncoKB gene does not exist in transcript {}:{}", gene.getEntrezGeneId(), gene.getHugoSymbol());
            } else {
                // grch37
                List<EnsemblGene> ensembl37Genes = ensemblGeneService.findAllByGeneAndReferenceGenome(
                    geneOptional.get(),
                    ReferenceGenome.GRCh37
                );
                if (ensembl37Genes.size() > 0) {
                    ensembl37Genes.forEach(ensemblGene ->
                        log.info("Gene {}:{}, {}", gene.getEntrezGeneId(), gene.getHugoSymbol(), ensemblGene)
                    );
                } else {
                    log.error("No ensembl gene found for gene {}:{}", gene.getEntrezGeneId(), gene.getHugoSymbol());
                }
                // grch38
                List<EnsemblGene> ensembl38Genes = ensemblGeneService.findAllByGeneAndReferenceGenome(
                    geneOptional.get(),
                    ReferenceGenome.GRCh38
                );
                if (ensembl38Genes.size() > 0) {
                    ensembl37Genes.forEach(ensemblGene ->
                        log.info("Gene {}:{}, {}", gene.getEntrezGeneId(), gene.getHugoSymbol(), ensemblGene)
                    );
                } else {
                    log.error("No ensembl gene found for gene {}:{}", gene.getEntrezGeneId(), gene.getHugoSymbol());
                }
            }
        }
    }

    /**
     * Import gene fragments for all transcripts in the database
     */
    private void importGeneFragments() {
        List<TranscriptDTO> transcriptDTOs = transcriptService.findAll();
        for (ReferenceGenome rg : ReferenceGenome.values()) {
            List<String> transcriptIds = transcriptDTOs
                .stream()
                .filter(transcriptDTO -> transcriptDTO.getReferenceGenome().equals(rg))
                .map(TranscriptDTO::getEnsemblTranscriptId)
                .collect(Collectors.toList());
            List<EnsemblTranscript> ensemblTranscriptList = transcriptService.getEnsemblTranscriptIds(rg, transcriptIds, true, true);

            ensemblTranscriptList.forEach(transcript -> {
                Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(
                    rg,
                    transcript.getId()
                );
                if (transcriptDTOOptional.isPresent()) {
                    TranscriptDTO transcriptDTO = transcriptDTOOptional.get();
                    transcriptService.createTranscript(
                        ReferenceGenome.valueOf(transcriptDTO.getReferenceGenome()),
                        transcriptDTO.getEntrezGeneId(),
                        transcriptDTO.getHugoSymbol(),
                        transcriptDTO.getEnsemblTranscriptId(),
                        transcriptDTO.getEnsemblProteinId(),
                        transcriptDTO.getReferenceSequenceId(),
                        transcript
                    );
                }
            });
        }
    }

    private void addTranscriptUsage(TranscriptDTO transcriptDTO) {
        TranscriptUsage transcriptUsage = new TranscriptUsage();
        transcriptUsage.setSource(UsageSource.ONCOKB);
        transcriptUsage.setTranscript(transcriptMapper.toEntity(transcriptDTO));
        transcriptUsageService.save(transcriptUsage);
    }
}
