package org.mskcc.oncokb.transcript.importer;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.transcript.domain.TranscriptUsage;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.UsageSource;
import org.mskcc.oncokb.transcript.service.*;
import org.mskcc.oncokb.transcript.service.dto.TranscriptDTO;
import org.mskcc.oncokb.transcript.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.transcript.vm.ensembl.EnsemblTranscript;
import org.oncokb.ApiException;
import org.oncokb.client.Gene;
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

    public void generalImport() throws ApiException {
        try {
            geneService.updatePortalGenes();
        } catch (IOException e) {
            e.printStackTrace();
        }
        this.importOncoKbSequences();
        importGeneFragments();
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
            List<EnsemblTranscript> ensemblTranscriptList = transcriptService.getTranscriptInfo(rg, transcriptIds);

            ensemblTranscriptList.forEach(transcript -> {
                Optional<TranscriptDTO> transcriptDTOOptional = transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(
                    rg,
                    transcript.getId()
                );
                if (transcriptDTOOptional.isPresent()) {
                    TranscriptDTO transcriptDTO = transcriptDTOOptional.get();
                    transcriptService.createTranscript(
                        transcriptDTO.getReferenceGenome(),
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
