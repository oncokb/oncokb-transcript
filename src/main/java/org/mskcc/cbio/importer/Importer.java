package org.mskcc.cbio.importer;

import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.cbio.TranscriptApp;
import org.mskcc.cbio.domain.Sequence;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.service.OncoKbUrlService;
import org.mskcc.cbio.service.SequenceService;
import org.mskcc.cbio.service.TranscriptService;
import org.oncokb.ApiException;
import org.oncokb.client.Gene;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
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
        for (Gene gene : genes) {
            // Add grch37 sequence
            if (
                sequenceService.findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome.GRCh37, gene.getGrch37Isoform()).isEmpty() &&
                StringUtils.isNotEmpty(gene.getGrch37Isoform())
            ) {
                Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                    gene.getGrch37Isoform(),
                    ReferenceGenome.GRCh37
                );
                if (ensemblTranscriptOptional.isPresent()) {
                    EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
                    Sequence grch37Sequence = new Sequence();
                    grch37Sequence.setHugoSymbol(gene.getHugoSymbol());
                    grch37Sequence.setEntrezGeneId(gene.getEntrezGeneId());
                    grch37Sequence.setReferenceGenome(ReferenceGenome.GRCh37);

                    grch37Sequence.setEnsemblTranscriptId(ensemblTranscript.getTranscriptId());
                    grch37Sequence.setEnsemblProteinId(ensemblTranscript.getProteinId());
                    grch37Sequence.setReferenceSequenceId(ensemblTranscript.getRefseqMrnaId());

                    Optional<org.mskcc.cbio.web.rest.vm.ensembl.Sequence> sequenceOptional = transcriptService.getProteinSequence(
                        ReferenceGenome.GRCh37,
                        ensemblTranscript.getProteinId()
                    );
                    if (sequenceOptional.isPresent()) {
                        grch37Sequence.setProteinSequence(sequenceOptional.get().getSeq());
                    }
                    sequenceService.save(grch37Sequence);
                }
            }

            // Add grch38 sequence
            if (
                sequenceService.findByReferenceGenomeAndEnsemblTranscriptId(ReferenceGenome.GRCh38, gene.getGrch38Isoform()).isEmpty() &&
                StringUtils.isNotEmpty(gene.getGrch38Isoform())
            ) {
                Optional<EnsemblTranscript> ensemblTranscriptOptional = transcriptService.getEnsemblTranscript(
                    gene.getGrch38Isoform(),
                    ReferenceGenome.GRCh38
                );
                if (ensemblTranscriptOptional.isPresent()) {
                    EnsemblTranscript ensemblTranscript = ensemblTranscriptOptional.get();
                    Sequence grch38Sequence = new Sequence();
                    grch38Sequence.setHugoSymbol(gene.getHugoSymbol());
                    grch38Sequence.setEntrezGeneId(gene.getEntrezGeneId());
                    grch38Sequence.setReferenceGenome(ReferenceGenome.GRCh38);

                    grch38Sequence.setEnsemblTranscriptId(ensemblTranscript.getTranscriptId());
                    grch38Sequence.setEnsemblProteinId(ensemblTranscript.getProteinId());
                    grch38Sequence.setReferenceSequenceId(ensemblTranscript.getRefseqMrnaId());

                    Optional<org.mskcc.cbio.web.rest.vm.ensembl.Sequence> sequenceOptional = transcriptService.getProteinSequence(
                        ReferenceGenome.GRCh38,
                        ensemblTranscript.getProteinId()
                    );
                    if (sequenceOptional.isPresent()) {
                        grch38Sequence.setProteinSequence(sequenceOptional.get().getSeq());
                    }
                    sequenceService.save(grch38Sequence);
                }
            }
        }
    }
}
