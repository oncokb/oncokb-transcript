package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.util.FileUtils.readDelimitedLinesStream;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.FlagType;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * To backfill the OncoKB canonical transcripts
 */

@Component
@Profile("transcript-flag-importer")
public class CanonicalTranscriptFlagImporter implements CommandLineRunner {

    private final Logger log = LoggerFactory.getLogger(CanonicalTranscriptFlagImporter.class);

    final String ONCOKB_GENE_LIST_FILE_PATH = "data/oncokb_core/cancer_gene_list_v4_24.tsv";

    final GeneService geneService;
    final TranscriptService transcriptService;
    final FlagService flagService;

    public CanonicalTranscriptFlagImporter(
        GeneService geneService,
        GenomeNexusService genomeNexusService,
        EnsemblGeneService ensemblGeneService,
        TranscriptService transcriptService,
        FlagService flagService,
        InfoService infoService,
        MainService mainService
    ) {
        this.geneService = geneService;
        this.transcriptService = transcriptService;
        this.flagService = flagService;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Running canonical transcript flag importer...");
        importCanonicalTranscripts();
        log.info("Finished importer.");
    }

    private void importCanonicalTranscripts() {
        URL geneListUrl = getClass().getClassLoader().getResource(ONCOKB_GENE_LIST_FILE_PATH);
        try {
            InputStream is = geneListUrl.openStream();
            List<List<String>> tsvFile = readDelimitedLinesStream(is, "\t", true);
            for (int i = 0; i < tsvFile.size(); i++) {
                if (i == 0) {
                    continue;
                }
                List<String> line = tsvFile.get(i);
                if (line.size() < 8) {
                    throw new IOException(String.format("Line %i has less than 8 columns", i));
                }
                Integer entrezGeneId;
                if (StringUtils.isNumeric(line.get(1))) {
                    entrezGeneId = Integer.parseInt(line.get(1), 10);
                } else {
                    log.warn(String.format("Entrez Id not found on line %i", i));
                    continue;
                }

                String grch37Isoform = line.get(2);
                String grch37RefSeq = line.get(3);
                if (StringUtils.isBlank(grch37Isoform)) {
                    log.warn(String.format("No GRCh37 isoform found for gene %s, skipping...", line.get(0)));
                } else {
                    findAndSaveTranscriptInfo(entrezGeneId, grch37Isoform, grch37RefSeq, ReferenceGenome.GRCh37);
                }

                String grch38Isoform = line.get(4);
                String grch38RefSeq = line.get(5);
                if (StringUtils.isBlank(grch38Isoform)) {
                    log.warn(String.format("No GRCh38 isoform found for gene %s, skipping...", line.get(0)));
                } else {
                    findAndSaveTranscriptInfo(entrezGeneId, grch38Isoform, grch38RefSeq, ReferenceGenome.GRCh38);
                }
            }
        } catch (IOException e) {
            log.error(e.getMessage());
        }
    }

    private void findAndSaveTranscriptInfo(Integer entrezGeneId, String isoform, String refSeq, ReferenceGenome referenceGenome) {
        List<Transcript> transcripts = transcriptService
            .findByEntrezGeneIdAndReferenceGenome(entrezGeneId, referenceGenome)
            .stream()
            .filter(transcript -> transcript.getEnsemblTranscriptId().startsWith(isoform))
            .collect(Collectors.toList());
        Flag oncokbCanonicalFlag = flagService.findByTypeAndFlag(FlagType.TRANSCRIPT, "ONCOKB").orElseThrow();
        Transcript transcript;
        if (transcripts.size() > 0) {
            if (transcripts.size() > 1) {
                log.warn("Found more than one matching transcripts with different subversions, skipping...");
                return;
            }
            transcript = transcripts.get(0);
            transcript.setCanonical(true);
            transcript.setEnsemblTranscriptId(isoform);
            transcript.setReferenceSequenceId(refSeq);
            transcript.getFlags().add(oncokbCanonicalFlag);
            try {
                transcriptService.save(transcript);
            } catch (Exception e) {
                log.error(e.getMessage());
            }
            log.info(String.format("Successfully saved transcript %s %s %s", isoform, refSeq, referenceGenome.toString()));
        } else {
            log.warn("Transcript does not exist in database, skipping...");
        }
    }
}
