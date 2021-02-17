package org.mskcc.oncokb.transcript.importer;

import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.oncokb.transcript.domain.Sequence;
import org.mskcc.oncokb.transcript.domain.Transcript;
import org.mskcc.oncokb.transcript.domain.TranscriptUsage;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.SequenceType;
import org.mskcc.oncokb.transcript.domain.enumeration.UsageSource;
import org.mskcc.oncokb.transcript.service.OncoKbUrlService;
import org.mskcc.oncokb.transcript.service.SequenceService;
import org.mskcc.oncokb.transcript.service.TranscriptService;
import org.mskcc.oncokb.transcript.service.TranscriptUsageService;
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
    private SequenceService sequenceService;

    @Autowired
    private TranscriptService transcriptService;

    @Autowired
    private TranscriptUsageService transcriptUsageService;

    public void generalImport() throws ApiException {
        this.importOncoKbSequences();
    }

    private void importOncoKbSequences() throws ApiException {
        List<Gene> genes = oncoKbUrlService.getGenes();
        for (Gene gene : genes.subList(0, 5)) {
            // Add grch37 sequence
            if (
                transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome.GRCh37, gene.getGrch37Isoform()).isEmpty() &&
                StringUtils.isNotEmpty(gene.getGrch37Isoform())
            ) {
                Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                    gene.getGrch37Isoform(),
                    ReferenceGenome.GRCh37
                );
                if (ensemblTranscriptOptional.isPresent()) {
                    EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
                    Transcript grch37Transcript = new Transcript(
                        ReferenceGenome.GRCh37,
                        ensemblTranscript,
                        gene.getHugoSymbol(),
                        gene.getEntrezGeneId()
                    );
                    transcriptService.save(grch37Transcript);
                    addTranscriptUsage(grch37Transcript);
                }
            }

            // Add grch38 sequence
            if (
                transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome.GRCh38, gene.getGrch38Isoform()).isEmpty() &&
                StringUtils.isNotEmpty(gene.getGrch38Isoform())
            ) {
                Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                    gene.getGrch38Isoform(),
                    ReferenceGenome.GRCh38
                );
                if (ensemblTranscriptOptional.isPresent()) {
                    EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
                    Transcript grch38Transcript = new Transcript(
                        ReferenceGenome.GRCh38,
                        ensemblTranscript,
                        gene.getHugoSymbol(),
                        gene.getEntrezGeneId()
                    );
                    transcriptService.save(grch38Transcript);
                    addTranscriptUsage(grch38Transcript);
                }
            }
        }
    }

    private void addTranscriptUsage(Transcript transcript) {
        TranscriptUsage transcriptUsage = new TranscriptUsage();
        transcriptUsage.setSource(UsageSource.ONCOKB);
        transcriptUsage.setTranscript(transcript);
        transcriptUsageService.save(transcriptUsage);
    }
}
