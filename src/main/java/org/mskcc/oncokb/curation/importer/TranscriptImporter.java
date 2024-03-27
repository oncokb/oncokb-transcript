package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.util.FileUtils.readDelimitedLinesStream;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.genome_nexus.client.EnsemblTranscript;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.TranscriptFlagEnum;
import org.mskcc.oncokb.curation.importer.model.ManeTranscript;
import org.mskcc.oncokb.curation.importer.model.OncokbTranscript;
import org.mskcc.oncokb.curation.service.*;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

// To import transcript info and sequence form Ensembl for both GRCh37 and 38
@Component
public class TranscriptImporter {

    private final Logger log = LoggerFactory.getLogger(TranscriptImporter.class);
    final String MANE_FILE_PATH = "data/transcript/mane/MANE.GRCh38.v1.2.summary.txt";
    final String MANE_VERSION = "v1.2";
    final String MANE_VERSION_DATE = "2023-01-01";

    final String ONCOKB_FILE_PATH = "data/transcript/oncokb_transcript_v4_8.tsv";
    final String ONCOKB_VERSION = "v4.8";
    final String ONCOKB_VERSION_DATE = "2023-01-01";
    final GeneService geneService;

    final GenomeNexusService genomeNexusService;
    final EnsemblGeneService ensemblGeneService;
    final TranscriptService transcriptService;
    final FlagService flagService;
    final InfoService infoService;
    final MainService mainService;

    public TranscriptImporter(
        GeneService geneService,
        GenomeNexusService genomeNexusService,
        EnsemblGeneService ensemblGeneService,
        TranscriptService transcriptService,
        FlagService flagService,
        InfoService infoService,
        MainService mainService
    ) {
        this.geneService = geneService;
        this.genomeNexusService = genomeNexusService;
        this.ensemblGeneService = ensemblGeneService;
        this.transcriptService = transcriptService;
        this.flagService = flagService;
        this.infoService = infoService;
        this.mainService = mainService;
    }

    private List<ManeTranscript> getManeTranscript() {
        URL geneFileUrl = getClass().getClassLoader().getResource(MANE_FILE_PATH);
        try {
            InputStream is = geneFileUrl.openStream();
            return readDelimitedLinesStream(is, "\t", true)
                .stream()
                .filter(line -> line.size() > 0 && !line.get(0).startsWith("#"))
                .map(line -> {
                    ManeTranscript maneTranscript = new ManeTranscript();
                    if (line.size() < 10) {
                        log.error("Line does not have all required columns {}", line);
                    } else {
                        maneTranscript.setEntrezGeneId(Integer.parseInt(line.get(0).replace("GeneID:", "")));
                        maneTranscript.setEnsemblGeneId(line.get(1));
                        maneTranscript.setHugoSymbol(line.get(4));
                        maneTranscript.setRefSeqTranscriptId(line.get(5));
                        maneTranscript.setRefSeqProteinId(line.get(6));
                        maneTranscript.setEnsemblTranscriptId(line.get(7));
                        maneTranscript.setEnsemblProteinId(line.get(8));
                        maneTranscript.setManeStatus(line.get(9));
                    }
                    return maneTranscript;
                })
                .collect(Collectors.toList());
        } catch (IOException e) {
            log.error(e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<OncokbTranscript> getOncokbTranscript() {
        URL geneFileUrl = getClass().getClassLoader().getResource(ONCOKB_FILE_PATH);
        try {
            InputStream is = geneFileUrl.openStream();
            return readDelimitedLinesStream(is, "\t", true)
                .stream()
                .filter(line -> line.size() > 0 && StringUtils.isNumeric(line.get(0)) && Integer.parseInt(line.get(0)) > 0)
                .map(line -> {
                    OncokbTranscript oncokbTranscript = new OncokbTranscript();
                    oncokbTranscript.setEntrezGeneId(Integer.parseInt(line.get(0)));
                    if (line.size() >= 3) {
                        oncokbTranscript.setGrch37EnsemblTranscript(line.get(2));
                        if (line.size() >= 4) {
                            oncokbTranscript.setGrch37refSeq(line.get(3));
                            if (line.size() >= 5) {
                                oncokbTranscript.setGrch38EnsemblTranscript(line.get(4));
                                if (line.size() >= 6) {
                                    oncokbTranscript.setGrch38refSeq(line.get(5));
                                }
                            }
                        }
                    }
                    return oncokbTranscript;
                })
                .collect(Collectors.toList());
        } catch (IOException e) {
            log.error(e.getMessage());
            return new ArrayList<>();
        }
    }

    public void importCanonicalEnsemblGenes() {
        int pageSize = 10;
        final PageRequest pageable = PageRequest.of(0, pageSize);
        Page<Long> firstPageGeneIds = geneService.findAllGeneIds(pageable);
        List<org.mskcc.oncokb.curation.domain.Gene> allGenes = new ArrayList<>();
        for (int i = 0; i < firstPageGeneIds.getTotalPages(); i++) {
            PageRequest genePage = PageRequest.of(i, pageSize);
            Page<Long> pageGeneIds = geneService.findAllGeneIds(genePage);
            allGenes.addAll(geneService.findAllByIdInWithGeneAliasAndEnsemblGenes(pageGeneIds.getContent()));
        }
        for (ReferenceGenome rg : ReferenceGenome.values()) {
            for (org.mskcc.oncokb.curation.domain.Gene gene : allGenes) {
                mainService.createCanonicalEnsemblGene(rg, gene.getEntrezGeneId());
            }
        }
    }

    public void importTranscripts() {
        // import GN canonical(uniport) transcripts for 37/38
        int pageSize = 10;
        final PageRequest pageable = PageRequest.of(0, pageSize);
        Page<Long> firstPageGeneIds = geneService.findAllGeneIds(pageable);

        for (int i = 0; i < firstPageGeneIds.getTotalPages(); i++) {
            PageRequest genePage = PageRequest.of(i, pageSize);
            Page<Long> geneIdPage = geneService.findAllGeneIds(genePage);
            for (Gene gene : geneService.findAllByIdInWithGeneAliasAndEnsemblGenes(geneIdPage.getContent())) {
                log.info("Saving GN canonical for gene {} {}", gene.getEntrezGeneId(), gene.getHugoSymbol());
                Arrays
                    .asList(new ReferenceGenome[] { ReferenceGenome.GRCh37, ReferenceGenome.GRCh38 })
                    .forEach(referenceGenome -> {
                        try {
                            org.genome_nexus.client.EnsemblGene gnEnsemblGene = genomeNexusService.findCanonicalEnsemblGeneTranscript(
                                referenceGenome,
                                gene.getEntrezGeneId()
                            );
                            if (gnEnsemblGene != null) {
                                EnsemblTranscript gnEnsemblTranscript = genomeNexusService.findCanonicalEnsemblTranscript(
                                    referenceGenome,
                                    gene.getHugoSymbol()
                                );
                                Optional<TranscriptDTO> transcriptDTOOptional = mainService.createTranscript(
                                    referenceGenome,
                                    gnEnsemblTranscript.getTranscriptId(),
                                    gene.getEntrezGeneId(),
                                    // do not pass protein id when on GRCh37. We assume the GRCh37 version has the only one transcript, and we can save the subversion
                                    ReferenceGenome.GRCh37.equals(referenceGenome) ? null : gnEnsemblTranscript.getProteinId(),
                                    gnEnsemblTranscript.getRefseqMrnaId(),
                                    null,
                                    Collections.singletonList(TranscriptFlagEnum.GN_CANONICAL)
                                );
                                if (transcriptDTOOptional.isEmpty()) {
                                    log.error(
                                        "Failed to create transcript {} {} {}",
                                        referenceGenome,
                                        gene.getEntrezGeneId(),
                                        gnEnsemblTranscript.getTranscriptId()
                                    );
                                } else {
                                    log.info("Saved/updated for {}.", referenceGenome);
                                }
                            } else {
                                log.error(
                                    "Failed to find canonical ensemble gene id {} {} {}",
                                    referenceGenome,
                                    gene.getEntrezGeneId(),
                                    gene.getHugoSymbol()
                                );
                            }
                        } catch (ApiException e) {
                            log.error(
                                "Failed to find canonical ensemble gene id {} {} {}",
                                referenceGenome,
                                gene.getEntrezGeneId(),
                                gene.getHugoSymbol()
                            );
                        }
                    });
            }
        }

        // import MANE 38
        for (ManeTranscript maneTranscript : getManeTranscript()) {
            log.info("Saving MANE transcript {} ", maneTranscript);
            ReferenceGenome referenceGenome = ReferenceGenome.GRCh38;
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(maneTranscript.getEntrezGeneId());
            if (geneOptional.isEmpty()) {
                log.warn("Gene {} in MANE list cannot be found in DB", maneTranscript.getEntrezGeneId());
                continue;
            }
            try {
                org.genome_nexus.client.EnsemblGene gnEnsemblGene = genomeNexusService.findCanonicalEnsemblGeneTranscript(
                    referenceGenome,
                    maneTranscript.getEntrezGeneId()
                );
                if (gnEnsemblGene != null) {
                    String maneStatus = maneTranscript.getManeStatus();
                    Optional<TranscriptDTO> transcriptDTOOptional = Optional.empty();
                    if ("MANE Select".equals(maneStatus)) {
                        transcriptDTOOptional =
                            mainService.createTranscript(
                                referenceGenome,
                                maneTranscript.getEnsemblTranscriptId(),
                                maneTranscript.getEntrezGeneId(),
                                maneTranscript.getEnsemblProteinId(),
                                maneTranscript.getRefSeqTranscriptId(),
                                null,
                                Collections.singletonList(TranscriptFlagEnum.MANE_SELECT)
                            );
                    } else if ("MANE Plus Clinical".equals(maneStatus)) {
                        transcriptDTOOptional =
                            mainService.createTranscript(
                                referenceGenome,
                                maneTranscript.getEnsemblTranscriptId(),
                                maneTranscript.getEntrezGeneId(),
                                maneTranscript.getEnsemblProteinId(),
                                maneTranscript.getRefSeqTranscriptId(),
                                null,
                                Collections.singletonList(TranscriptFlagEnum.MANE_PLUS_CLINICAL)
                            );
                    }
                    if (transcriptDTOOptional.isEmpty()) {
                        log.error("Failed to create MANE transcript {}", maneTranscript);
                    } else {
                        log.info("Saved/updated.");
                    }
                }
            } catch (ApiException e) {
                log.error(
                    "Failed to find canonical ensemble gene id {} {} {}",
                    referenceGenome,
                    maneTranscript.getEntrezGeneId(),
                    maneTranscript.getHugoSymbol()
                );
            }
        }
        this.infoService.updateInfo(InfoType.MANE_TRANSCRIPT_VERSION, MANE_VERSION, MANE_VERSION_DATE);

        // import OncoKB canonical 37/38
        for (OncokbTranscript oncokbTranscript : getOncokbTranscript()) {
            log.info("Saving OncoKB transcript {}", oncokbTranscript);
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(oncokbTranscript.getEntrezGeneId());
            if (geneOptional.isEmpty()) {
                log.error("Cannot find gene {} from OncoKB list", oncokbTranscript.getEntrezGeneId());
                continue;
            }
            Optional<TranscriptDTO> transcriptDTOOptional = mainService.createTranscript(
                ReferenceGenome.GRCh37,
                oncokbTranscript.getGrch37EnsemblTranscript(),
                oncokbTranscript.getEntrezGeneId(),
                null,
                oncokbTranscript.getGrch37refSeq(),
                null,
                Collections.singletonList(TranscriptFlagEnum.ONCOKB)
            );
            if (transcriptDTOOptional.isEmpty()) {
                log.error(
                    "Failed to create OncoKB transcript {} {}",
                    oncokbTranscript.getEntrezGeneId(),
                    oncokbTranscript.getGrch37EnsemblTranscript()
                );
            } else {
                log.info("Saved/updated grch37.");
            }
            transcriptDTOOptional =
                mainService.createTranscript(
                    ReferenceGenome.GRCh38,
                    oncokbTranscript.getGrch38EnsemblTranscript(),
                    oncokbTranscript.getEntrezGeneId(),
                    null,
                    oncokbTranscript.getGrch38refSeq(),
                    null,
                    Collections.singletonList(TranscriptFlagEnum.ONCOKB)
                );
            if (transcriptDTOOptional.isEmpty()) {
                log.error(
                    "Failed to create OncoKB transcript {} {}",
                    oncokbTranscript.getEntrezGeneId(),
                    oncokbTranscript.getGrch37EnsemblTranscript()
                );
            } else {
                log.info("Saved/updated grch38.");
            }
        }
        this.infoService.updateInfo(InfoType.ONCOKB_TRANSCRIPT_VERSION, ONCOKB_VERSION, ONCOKB_VERSION_DATE);
    }
}
