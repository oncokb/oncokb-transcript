package org.mskcc.oncokb.transcript.importer;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.transcript.domain.EnsemblGene;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.service.*;
import org.mskcc.oncokb.transcript.service.mapper.TranscriptMapper;
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
    private MainService mainService;

    @Autowired
    private TranscriptService transcriptService;

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
        importEnsemblGenes();
        //        checkOncoKbEnsemblGenes();
        //        importGeneFragments();
    }

    private void importEnsemblGenes() {
        List<org.mskcc.oncokb.transcript.domain.Gene> genes = geneService.findAll();
        for (ReferenceGenome rg : ReferenceGenome.values()) {
            for (org.mskcc.oncokb.transcript.domain.Gene gene : genes) {
                mainService.createCanonicalEnsemblGene(rg, gene.getEntrezGeneId());
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
}
