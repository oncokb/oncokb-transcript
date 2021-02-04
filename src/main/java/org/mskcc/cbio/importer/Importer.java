package org.mskcc.cbio.importer;

import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.cbio.domain.Sequence;
import org.mskcc.cbio.domain.Transcript;
import org.mskcc.cbio.domain.TranscriptUsage;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.domain.enumeration.SequenceType;
import org.mskcc.cbio.domain.enumeration.UsageSource;
import org.mskcc.cbio.service.OncoKbUrlService;
import org.mskcc.cbio.service.SequenceService;
import org.mskcc.cbio.service.TranscriptService;
import org.mskcc.cbio.service.TranscriptUsageService;
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
                    addTranscriptUsage(grch37Transcript);
                    transcriptService.save(grch37Transcript);
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
                    addTranscriptUsage(grch38Transcript);
                    transcriptService.save(grch38Transcript);
                }
            }
        }
    }

    private void addTranscriptUsage(Transcript transcript) {
        TranscriptUsage transcriptUsage = new TranscriptUsage();
        transcriptUsage.setSource(UsageSource.ONCOKB);
        transcriptUsage.setTranscript(transcript);
        transcript.getTranscriptUsages().add(transcriptUsage);
    }
}
