package org.mskcc.oncokb.curation.importer;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.SequenceType;
import org.mskcc.oncokb.curation.service.*;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.oncokb.ApiException;
import org.oncokb.client.Gene;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    @Autowired
    private SequenceService sequenceService;

    @Autowired
    private AlignmentService alignmentService;

    @Autowired
    private AlterationService alterationService;

    @Autowired
    private ConsequenceService consequenceService;

    private final Logger log = LoggerFactory.getLogger(Importer.class);

    public void generalImport() throws ApiException, IOException {
        //        try {
        //            geneService.updatePortalGenes();
        //        } catch (IOException e) {
        //            e.printStackTrace();
        //        }
        //        this.importOncoKbSequences();
        //        importCanonicalEnsemblGenes();
        //        importCanonicalEnsemblTranscripts();
        //                checkOncoKbEnsemblGenes();
        //        checkOncoKbTranscriptSequenceAcrossRG();
        //        importGeneFragments();
        importAlteration();
    }

    private void importCanonicalEnsemblGenes() {
        int pageSize = 10;
        final PageRequest pageable = PageRequest.of(0, pageSize);
        Page<org.mskcc.oncokb.curation.domain.Gene> firstPageGenes = geneService.findAll(pageable);
        List<org.mskcc.oncokb.curation.domain.Gene> allGenes = new ArrayList<>();
        for (int i = 0; i < firstPageGenes.getTotalPages(); i++) {
            PageRequest genePage = PageRequest.of(i, pageSize);
            allGenes.addAll(geneService.findAll(genePage).toList());
        }
        for (ReferenceGenome rg : ReferenceGenome.values()) {
            for (org.mskcc.oncokb.curation.domain.Gene gene : allGenes) {
                mainService.createCanonicalEnsemblGene(rg, gene.getEntrezGeneId());
            }
        }
    }

    private void importCanonicalEnsemblTranscripts() throws ApiException {
        List<Gene> genes = oncoKbUrlService.getGenes();
        for (int i = 0; i < genes.size(); i++) {
            Gene gene = genes.get(i);
            if (i % 100 == 0) {
                log.info("Processing index {}", i);
            }
            // import canonical GRCh37 transcript
            mainService.createTranscript(ReferenceGenome.GRCh37, gene.getGrch37Isoform(), gene.getEntrezGeneId(), true);
            // import canonical GRCh38 transcript
            mainService.createTranscript(ReferenceGenome.GRCh38, gene.getGrch38Isoform(), gene.getEntrezGeneId(), true);
        }
    }

    private void checkOncoKbEnsemblGenes() throws ApiException {
        for (Gene gene : oncoKbUrlService.getGenes()) {
            // check grch37
            Optional<org.mskcc.oncokb.curation.domain.Gene> geneOptional = geneService.findGeneByEntrezGeneId(gene.getEntrezGeneId());
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
                    log.error(
                        "No ensembl gene found for gene {} {}:{}",
                        ReferenceGenome.GRCh37,
                        gene.getEntrezGeneId(),
                        gene.getHugoSymbol()
                    );
                }
                // grch38
                List<EnsemblGene> ensembl38Genes = ensemblGeneService.findAllByGeneAndReferenceGenome(
                    geneOptional.get(),
                    ReferenceGenome.GRCh38
                );
                if (ensembl38Genes.size() > 0) {
                    ensembl38Genes.forEach(ensemblGene ->
                        log.info("Gene {}:{}, {}", gene.getEntrezGeneId(), gene.getHugoSymbol(), ensemblGene)
                    );
                } else {
                    log.error(
                        "No ensembl gene found for gene {} {}:{}",
                        ReferenceGenome.GRCh38,
                        gene.getEntrezGeneId(),
                        gene.getHugoSymbol()
                    );
                }
            }
        }
    }

    private void checkOncoKbTranscriptSequenceAcrossRG() throws ApiException {
        for (Gene gene : oncoKbUrlService.getGenes()) {
            if (gene.getEntrezGeneId() <= 0) {
                continue;
            }
            // check grch37
            Optional<org.mskcc.oncokb.curation.domain.Gene> geneOptional = geneService.findGeneByEntrezGeneId(gene.getEntrezGeneId());
            if (geneOptional.isEmpty()) {
                log.error("The OncoKB gene does not exist in transcript {}:{}", gene.getEntrezGeneId(), gene.getHugoSymbol());
            } else {
                log.info("Checking gene {}:{}", gene.getEntrezGeneId(), gene.getHugoSymbol());
                Optional<TranscriptDTO> grch37TranscriptDtoOptional = transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(
                    ReferenceGenome.GRCh37,
                    gene.getGrch37Isoform()
                );
                Optional<TranscriptDTO> grch38TranscriptDtoOptional = transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(
                    ReferenceGenome.GRCh38,
                    gene.getGrch38Isoform()
                );

                Optional<Sequence> sequenceGrch37Optional = Optional.empty();
                Optional<Sequence> sequenceGrch38Optional = Optional.empty();
                if (grch37TranscriptDtoOptional.isEmpty()) {
                    log.warn("\tNo GRCh37 transcript available");
                } else {
                    sequenceGrch37Optional =
                        sequenceService.findOneByTranscriptAndSequenceType(
                            transcriptMapper.toEntity(grch37TranscriptDtoOptional.get()),
                            SequenceType.PROTEIN
                        );
                    if (sequenceGrch37Optional.isEmpty()) {
                        log.warn("\t\tNo GRCh37 transcript sequence");
                    }
                }
                if (grch38TranscriptDtoOptional.isEmpty()) {
                    log.warn("\tNo GRCh38 transcript available");
                } else {
                    sequenceGrch38Optional =
                        sequenceService.findOneByTranscriptAndSequenceType(
                            transcriptMapper.toEntity(grch38TranscriptDtoOptional.get()),
                            SequenceType.PROTEIN
                        );
                    if (sequenceGrch38Optional.isEmpty()) {
                        log.warn("\t\tNo GRCh38 transcript sequence");
                    }
                }

                if (sequenceGrch37Optional.isPresent() && sequenceGrch38Optional.isPresent()) {
                    if (sequenceGrch37Optional.get().getSequence().equals(sequenceGrch38Optional.get().getSequence())) {
                        log.info("\t\t Sequences match");
                    } else {
                        log.warn("\t\t Sequences do not match");
                        log.info(
                            "\t\t\t Alignment penalty {}",
                            alignmentService
                                .calcOptimalAlignment(
                                    sequenceGrch37Optional.get().getSequence(),
                                    sequenceGrch38Optional.get().getSequence(),
                                    false
                                )
                                .getPenalty()
                        );
                    }
                }
            }
        }
    }

    private void importAlteration() throws IOException {
        URL alterationFileUrl = this.getClass().getClassLoader().getResource("alteration.tsv");
        if (alterationFileUrl != null) {
            Integer count = 0;
            try (Stream<String> stream = Files.lines(Paths.get(alterationFileUrl.getPath()), StandardCharsets.UTF_8)) {
                stream.forEach(line -> {
                    String parts[] = line.split("\t");
                    if (parts.length < 9) {
                        throw new IllegalArgumentException("Missing elements, parts: " + parts.length + " for line: " + line);
                    }
                    // E255K	E255K	MUTATION	255	255	E	K	missense_variant	25
                    String alteration = parts[0];
                    String entrezGeneId = parts[8];
                    log.info("{} {}", entrezGeneId, alteration);

                    Optional<org.mskcc.oncokb.curation.domain.Gene> geneOptional = geneService.findGeneByEntrezGeneId(
                        Integer.valueOf(entrezGeneId)
                    );
                    if (geneOptional.isPresent()) {
                        Alteration alt = new Alteration();
                        alt.setAlteration(alteration);
                        alt.setGenes(Collections.singleton(geneOptional.get()));
                        mainService.annotateAlteration(alt);
                        alterationService.save(alt);
                    } else {
                        log.error("Gene does not exist {}", entrezGeneId);
                    }
                });
            } catch (Exception e) {
                log.warn("Failed to get string from text file");
                throw e;
            }
        }
    }
}
