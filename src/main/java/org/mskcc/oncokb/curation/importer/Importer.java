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
    private MetaImporter metaImporter;

    @Autowired
    private GeneImporter geneImporter;

    @Autowired
    private TranscriptImporter transcriptImporter;

    @Autowired
    private EnsemblImporter ensemblImporter;

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

    @Autowired
    private FirebaseService firebaseService;

    private final Logger log = LoggerFactory.getLogger(Importer.class);

    public void generalImport() throws ApiException, IOException {
        //        this.geneImporter.importPortalGenes();
        //        this.transcriptImporter.importCanonicalEnsemblGenes();
        //        checkOncoKbTranscriptSequenceAcrossRG();
        //        importAlteration();
        //                this.transcriptImporter.importTranscripts();
        //        this.ensemblImporter.importSeqRegion();
        //                this.metaImporter.generalImport();
        //        firebaseService.readGene();
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
}
