package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.config.DataVersions.NCIT_VERSION;
import static org.mskcc.oncokb.curation.util.FileUtils.parseDelimitedFile;
import static org.mskcc.oncokb.curation.util.TimeUtil.parseDbStringInstant;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.swing.text.html.Option;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.*;
import org.mskcc.oncokb.curation.service.*;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.oncokb.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by Hongxin Zhang on 1/27/21.
 */
@Component
public class MetaImporter {

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
    private FlagService flagService;

    @Autowired
    private CompanionDiagnosticDeviceService cdxService;

    @Autowired
    private FdaSubmissionTypeService fdaSubmissionTypeService;

    @Autowired
    private FdaSubmissionService fdaSubmissionService;

    @Autowired
    private SeqRegionService seqRegionService;

    @Autowired
    private GenomeFragmentService genomeFragmentService;

    @Autowired
    private SynonymService synonymService;

    @Autowired
    private OncoTreeImporter oncoTreeImporter;

    @Autowired
    private NciThesaurusService nciThesaurusService;

    @Autowired
    private CoreImporter coreImporter;

    private final Logger log = LoggerFactory.getLogger(MetaImporter.class);

    final String DATA_DIRECTORY = "/Users/zhangh2/origin-repos/oncokb-data/curation";
    final String META_DATA_FOLDER_PATH = DATA_DIRECTORY + "/meta";

    public void generalImport() throws ApiException, IOException {
        //        this.importFlag();
        //        this.importCdx();
        //        this.importFdaSubmissionType();
        //        this.importFdaSubmission();
        //        this.importGene();
        //        above are included in meta-1.sql

        //        this.importGeneFlag();
        //        this.importSeqRegion();
        //        this.importEnsemblGene();
        //        above are included in meta-2.sql

        //        this.importTranscript();
        //        above are included in meta-3.sql

        //        this.importTranscriptFlag();
        //        this.importSequence();
        //        above are included in meta-4.sql

        //        this.importGenomeFragment();
        //        above are included in meta-5.sql Only partial genome fragment was generated

        //          meta-6.sql trims the double quotes.

        //        oncoTreeImporter.generalImport();
        //          meta-7.sql trims the double quotes.

        //          meta-8.sql includes article/alterations
        //        coreImporter.generalImport();
        //        this.importNcit();
        //          meta-9.sql includes above

        coreImporter.importDrug();
    }

    private void importFlag() throws IOException {
        List<List<String>> flagLines = parseTsvMetaFile("flag.tsv");
        flagLines.forEach(flagLine -> {
            Flag flagEntity = new Flag();
            String type = flagLine.get(1);
            String flag = flagLine.get(2);
            String name = flagLine.get(3);
            String description = flagLine.get(4);
            flagEntity.setType(type);
            flagEntity.setFlag(flag);
            flagEntity.setName(name);
            flagEntity.setDescription(description);
            flagService.save(flagEntity);
        });
    }

    private void importCdx() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("companion_diagnostic_device.tsv");
        lines.forEach(line -> {
            CompanionDiagnosticDevice cdx = new CompanionDiagnosticDevice();
            Long id = Long.valueOf(line.get(0));
            String name = line.get(1);
            String manufacturer = line.get(2);
            String platformType = line.get(4);
            cdx.setName(name);
            cdx.setManufacturer(manufacturer);
            cdx.setPlatformType(platformType);
            cdxService.save(cdx);
        });
    }

    private void importFdaSubmissionType() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("fda_submission_type.tsv");
        lines.forEach(line -> {
            FdaSubmissionType fdaSubmissionType = new FdaSubmissionType();
            String type = line.get(1);
            String name = line.get(2);
            String shortName = line.get(3);
            String description = line.get(4);
            fdaSubmissionType.setType(type == null ? null : FdaSubmissionTypeKey.valueOf(type));
            fdaSubmissionType.setName(name);
            fdaSubmissionType.setShortName(shortName);
            fdaSubmissionType.setDescription(description);
            fdaSubmissionTypeService.save(fdaSubmissionType);
        });
    }

    private void importFdaSubmission() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("fda_submission.tsv");
        lines.forEach(line -> {
            FdaSubmission fdaSubmission = new FdaSubmission();
            String number = line.get(0);
            String supplementNumber = line.get(1);
            String deviceName = line.get(2);
            String genericName = line.get(3);
            String dateReceived = line.get(4);
            String decisionDate = line.get(5);
            String description = line.get(6);
            String platform = line.get(7);
            String curated = line.get(8);
            String genetic = line.get(9);
            String note = line.get(10);

            String companionDiagnosticDeviceName = line.get(11);
            Optional<CompanionDiagnosticDevice> companionDiagnosticDeviceOptional = cdxService.findByName(companionDiagnosticDeviceName);
            String type = line.get(12);
            Optional<FdaSubmissionType> fdaSubmissionTypeOptional = fdaSubmissionTypeService.findByType(FdaSubmissionTypeKey.valueOf(type));
            fdaSubmission.setNumber(number);
            fdaSubmission.setSupplementNumber(supplementNumber);
            fdaSubmission.setDeviceName(deviceName);
            fdaSubmission.setGenericName(genericName);
            fdaSubmission.setDateReceived(parseDbStringInstant(dateReceived));
            fdaSubmission.setDecisionDate(parseDbStringInstant(decisionDate));
            fdaSubmission.setDescription(description);
            fdaSubmission.setPlatform(platform);
            fdaSubmission.setCurated(Boolean.valueOf(curated));
            fdaSubmission.setGenetic(Boolean.valueOf(genetic));
            fdaSubmission.setNote(note);
            fdaSubmission.setCompanionDiagnosticDevice(companionDiagnosticDeviceOptional.get());
            fdaSubmission.setType(fdaSubmissionTypeOptional.get());
            fdaSubmissionService.save(fdaSubmission);
        });
    }

    private void importGene() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("gene_10_2023.tsv");
        lines.forEach(line -> {
            Integer entrezGeneId = Integer.parseInt(line.get(0));
            String hugoSymbol = line.get(1);

            Gene gene = new Gene();
            gene.setEntrezGeneId(entrezGeneId);
            gene.setHugoSymbol(hugoSymbol);
            gene.setHgncId(Optional.ofNullable(line.get(6)).orElse("").replace("HGNC:", ""));
            Gene savedGene = this.geneService.save(gene);

            Set<Synonym> savedSynonyms = new HashSet<>();
            Arrays
                .stream(Optional.ofNullable(line.get(5)).orElse("").split("\\|"))
                .filter(synonym -> StringUtils.isNotEmpty(synonym.trim()))
                .forEach(synonym -> {
                    String trimmedSynonym = synonym.trim();
                    Optional<Synonym> synonymOptional = synonymService.findByTypeAndName(SynonymType.GENE, trimmedSynonym);
                    if (synonymOptional.isEmpty()) {
                        Synonym geneSynonym = new Synonym();
                        geneSynonym.setName(synonym.trim());
                        geneSynonym.setSource("cBioPortal");
                        geneSynonym.setType(SynonymType.GENE.name());
                        savedSynonyms.add(synonymService.save(geneSynonym));
                    } else {
                        savedSynonyms.add(synonymOptional.get());
                    }
                });
            savedGene.setSynonyms(savedSynonyms);
            geneService.partialUpdate(savedGene);
            log.debug("Saved gene {}", gene);
        });
    }

    private void importGeneFlag() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("gene_flag.tsv");
        lines.forEach(line -> {
            if (StringUtils.isNotEmpty(line.get(2))) {
                Integer entrezGeneId = Integer.parseInt(line.get(0));
                String flag = line.get(2);

                Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(entrezGeneId);
                Optional<Flag> flagOptional = flagService.findByTypeAndFlag(FlagType.GENE, flag);
                geneOptional.get().getFlags().add(flagOptional.get());
                geneService.partialUpdate(geneOptional.get());
            }
        });
    }

    private void importSeqRegion() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("seq_region.tsv");
        lines.forEach(line -> {
            SeqRegion seqRegion = new SeqRegion();
            seqRegion.setName(line.get(1));
            seqRegion.setChromosome(line.get(2));
            seqRegion.setDescription(line.get(3));
            seqRegionService.save(seqRegion);
        });
    }

    private void importEnsemblGene() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("ensembl_gene.tsv");
        lines.forEach(line -> {
            EnsemblGene ensemblGene = new EnsemblGene();
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(Integer.parseInt(line.get(0)));
            if (geneOptional.isEmpty()) {
                log.error("Can't find gene {}", line.get(0));
                return;
            }
            ensemblGene.setGene(geneOptional.get());
            ensemblGene.setReferenceGenome(ReferenceGenome.valueOf(line.get(2)));
            ensemblGene.setEnsemblGeneId(line.get(3));
            ensemblGene.setCanonical(Boolean.valueOf(line.get(4)));
            Optional<SeqRegion> seqRegionOptional = seqRegionService.findByName(line.get(5));
            ensemblGene.setSeqRegion(seqRegionOptional.get());
            ensemblGene.setStart(Integer.valueOf(line.get(6)));
            ensemblGene.setEnd(Integer.valueOf(line.get(7)));
            ensemblGene.setStrand(Integer.valueOf(line.get(8)));
            ensemblGeneService.save(ensemblGene);
        });
    }

    private void importGenomeFragment() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("genome_fragment.tsv");
        lines.forEach(line -> {
            GenomeFragment genomeFragment = new GenomeFragment();
            Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findByEnsemblGeneIdAndReferenceGenome(
                line.get(3),
                ReferenceGenome.valueOf(line.get(2))
            );
            Optional<TranscriptDTO> transcriptOptional = transcriptService.findByEnsemblGeneAndEnsemblTranscriptId(
                ensemblGeneOptional.get(),
                line.get(4)
            );
            if (transcriptOptional.isEmpty()) {
                log.error("Can't find transcript {}", line.get(4));
                return;
            }
            genomeFragment.setTranscript(transcriptMapper.toEntity(transcriptOptional.get()));
            genomeFragment.setType(GenomeFragmentType.valueOf(line.get(5)));
            Optional<SeqRegion> seqRegionOptional = seqRegionService.findByName(line.get(6));
            genomeFragment.setSeqRegion(seqRegionOptional.get());
            genomeFragment.setStart(Integer.parseInt(line.get(7)));
            genomeFragment.setEnd(Integer.parseInt(line.get(8)));
            genomeFragment.setStrand(Integer.parseInt(line.get(9)));
            genomeFragmentService.save(genomeFragment);
        });
    }

    private void importTranscript() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("transcript.tsv");
        lines.forEach(line -> {
            Transcript transcript = new Transcript();
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(Integer.parseInt(line.get(0)));
            if (geneOptional.isEmpty()) {
                log.error("Can't find gene {}", line.get(0));
                return;
            }
            transcript.setGene(geneOptional.get());
            Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findByEnsemblGeneIdAndReferenceGenome(
                line.get(3),
                ReferenceGenome.valueOf(line.get(2))
            );
            if (ensemblGeneOptional.isEmpty()) {
                log.error("Error find ensembl gene {} {}", line.get(2), line.get(3));
                return;
            }
            transcript.setReferenceGenome(ReferenceGenome.valueOf(line.get(2)));
            transcript.setEnsemblGene(ensemblGeneOptional.get());

            transcript.setEnsemblTranscriptId(line.get(4));
            transcript.setCanonical(Boolean.valueOf(line.get(5)));
            transcript.setEnsemblProteinId(line.get(6));
            transcript.setReferenceSequenceId(line.get(7));
            transcript.setDescription(line.get(8));
            transcriptService.save(transcript);
        });
    }

    private void importTranscriptFlag() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("transcript_flag.tsv");
        lines.forEach(line -> {
            if (StringUtils.isNotEmpty(line.get(5))) {
                String referenceGenome = line.get(2);
                String transcriptId = line.get(4);
                String flag = line.get(5);

                Optional<TranscriptDTO> transcriptOptional = transcriptService.findByReferenceGenomeAndEnsemblTranscriptId(
                    ReferenceGenome.valueOf(referenceGenome),
                    transcriptId
                );
                if (transcriptOptional.isEmpty()) {
                    log.error("Error find transcript {} {}", referenceGenome, transcriptId);
                    return;
                }
                Optional<Flag> flagOptional = flagService.findByTypeAndFlag(FlagType.TRANSCRIPT, flag);
                transcriptOptional.get().getFlags().add(flagOptional.get());
                transcriptService.partialUpdate(transcriptOptional.get());
            }
        });
    }

    private void importSequence() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("sequence.tsv");
        lines.forEach(line -> {
            Sequence sequence = new Sequence();
            Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findByEnsemblGeneIdAndReferenceGenome(
                line.get(3),
                ReferenceGenome.valueOf(line.get(2))
            );
            if (ensemblGeneOptional.isEmpty()) {
                log.error("Error find ensembl gene {} {}", line.get(2), line.get(3));
                return;
            }
            Optional<TranscriptDTO> transcriptOptional = transcriptService.findByEnsemblGeneAndEnsemblTranscriptId(
                ensemblGeneOptional.get(),
                line.get(4)
            );
            if (transcriptOptional.isEmpty()) {
                log.error("Error find transcript {}", line.get(4));
                return;
            }
            sequence.setTranscript(transcriptMapper.toEntity(transcriptOptional.get()));
            sequence.setSequenceType(SequenceType.valueOf(line.get(5)));
            sequence.setSequence(line.get(6));
            sequenceService.save(sequence);
        });
    }

    public void saveAllNcitData(List<List<String>> lines) {
        String SYNONYMS_SEPARATOR_REGEX = "\\|";
        lines.forEach(line -> {
            NciThesaurus nciThesaurus = new NciThesaurus();
            nciThesaurus.setCode(line.get(0));
            nciThesaurus.setDisplayName(line.get(5));
            nciThesaurus.setVersion(NCIT_VERSION);

            List<String> synonymStrs = new ArrayList<>(
                Arrays.asList((Optional.ofNullable(line.get(3)).orElse("")).split(SYNONYMS_SEPARATOR_REGEX))
            );
            if (synonymStrs.size() > 0) {
                nciThesaurus.setPreferredName(synonymStrs.remove(0));
                if (StringUtils.isEmpty(nciThesaurus.getDisplayName())) {
                    nciThesaurus.setDisplayName(nciThesaurus.getPreferredName());
                }
            } else {
                nciThesaurus.setPreferredName(nciThesaurus.getDisplayName());
            }
            Set<Synonym> synonyms = synonymStrs
                .stream()
                .map(synonymStr -> {
                    synonymStr = synonymStr.trim();
                    Synonym synonym = new Synonym();
                    synonym.setType(SynonymType.NCIT.name());
                    synonym.setName(synonymStr);
                    synonym.setSource("NCIT");
                    return synonym;
                })
                .distinct()
                .map(synonym -> synonymService.save(synonym))
                .collect(Collectors.toSet());
            nciThesaurus.setSynonyms(synonyms);
            nciThesaurusService.save(nciThesaurus);
        });
    }

    private void importNcit() throws IOException {
        List<List<String>> lines = parseDelimitedFile(DATA_DIRECTORY + "/ncit/Thesaurus_" + NCIT_VERSION + ".tsv", "\t", true);
        saveAllNcitData(lines);
    }

    private List<List<String>> parseTsvMetaFile(String fileName) throws IOException {
        return parseDelimitedFile(META_DATA_FOLDER_PATH + "/" + fileName, "\t", true);
    }
}
