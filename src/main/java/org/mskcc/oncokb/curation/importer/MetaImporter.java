package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.config.Constants.DEFAULT_GENE_SYNONMN_SOURCE;
import static org.mskcc.oncokb.curation.config.DataVersions.NCIT_VERSION;
import static org.mskcc.oncokb.curation.util.FileUtils.parseDelimitedFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.*;
import org.mskcc.oncokb.curation.model.IntegerRange;
import org.mskcc.oncokb.curation.service.*;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.mskcc.oncokb.curation.util.HotspotUtils;
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
    private CancerTypeService cancerTypeService;

    @Autowired
    private DrugService drugService;

    @Autowired
    private AssociationService associationService;

    @Autowired
    private OncoTreeImporter oncoTreeImporter;

    @Autowired
    private NciThesaurusService nciThesaurusService;

    @Autowired
    private CoreImporter coreImporter;

    @Autowired
    private GenomicIndicatorService genomicIndicatorService;

    @Autowired
    private AlleleStateService alleleStateService;

    private final ApplicationProperties applicationProperties;

    private final Logger log = LoggerFactory.getLogger(MetaImporter.class);

    final String DATA_DIRECTORY;
    final String META_DATA_FOLDER_PATH;

    public MetaImporter(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;

        DATA_DIRECTORY = applicationProperties.getOncokbDataRepoDir() + "/curation";
        META_DATA_FOLDER_PATH = DATA_DIRECTORY + "/meta";
    }

    public void generalImport() throws ApiException, IOException {
        log.info("Importing flag...");
        this.importFlag();

        log.info("Importing FDA submission type...");
        this.importFdaSubmissionType();

        log.info("Importing gene...");
        this.importGene();

        log.info("Importing gene panel...");
        this.importGenePanelFlag();

        log.info("Importing seq region...");
        this.importSeqRegion();

        log.info("Importing ensembl gene...");
        this.importEnsemblGene();

        log.info("Importing transcript...");
        this.importTranscript();

        log.info("Importing transcript flag...");
        this.importTranscriptFlag();

        log.info("Importing sequence...");
        this.importSequence();

        log.info("Importing genome fragment...");
        this.importGenomeFragment();

        log.info("Importing genomic indicator...");
        this.importGenomicIndicator();

        log.info("Importing NCIT...");
        this.importNcit();

        log.info("Importing core dataset...");
        coreImporter.generalImport();

        log.info("Importing hotspots...");
        importHotspot();
    }

    private List<Alteration> fetchAndSaveHotspotAlteration(Gene gene, String altName) {
        List<Alteration> existingAlts = alterationService.findByNameOrAlterationAndGenesId(altName, gene.getId());
        if (existingAlts.isEmpty()) {
            Alteration alteration = new Alteration();
            alteration.setName(altName);
            alteration.setAlteration(altName);
            alteration.setProteinChange(altName);
            alteration.setGenes(Collections.singleton(gene));
            mainService.annotateAlteration(ReferenceGenome.GRCh37, alteration);
            return Collections.singletonList(alterationService.save(alteration));
        } else {
            return existingAlts;
        }
    }

    private void importHotspot() throws IOException {
        Flag hotspotFlag = flagService.findByTypeAndFlag(FlagType.HOTSPOT, HotspotFlagEnum.HOTSPOT_V1.name()).get();
        Flag threeDFlag = flagService.findByTypeAndFlag(FlagType.HOTSPOT, HotspotFlagEnum.THREE_D.name()).get();

        List<List<String>> hotspotLines = parseTsvMetaFile("cancer_hotspots_gn.tsv");
        hotspotLines.forEach(line -> {
            String hugoSymbol = line.get(0);
            log.info("Search for gene {}", hugoSymbol);
            List<Gene> geneList = geneService.findGeneByHugoSymbolOrGeneAliasesIn(hugoSymbol);
            if (geneList.isEmpty()) {
                log.error("Gene cannot be found {}", line.get(0));
                return;
            }
            Gene gene = geneList.iterator().next();

            String type = line.get(3);
            String residue = line.get(1);

            List<Alteration> alterations = new ArrayList<>();
            if ("splice residue".equals(type) || "splice site".equals(type)) {
                String proteinChange = residue + "_splice";
                alterations.addAll(fetchAndSaveHotspotAlteration(gene, proteinChange));
            } else if ("in-frame indel".equals(type)) {
                IntegerRange integerRange = HotspotUtils.extractProteinPos(residue);
                String proteinName = integerRange.getStart() + "_" + integerRange.getEnd();
                alterations.addAll(fetchAndSaveHotspotAlteration(gene, proteinName + "ins"));
                alterations.addAll(fetchAndSaveHotspotAlteration(gene, proteinName + "del"));
            } else if ("single residue".equals(type) || "3d".equals(type)) {
                alterations.addAll(fetchAndSaveHotspotAlteration(gene, residue));
            } else {
                log.error("Unhandled type of hotspot {}", type);
            }
            for (Alteration alteration : alterations) {
                if ("3d".equals(type)) {
                    alteration.addFlag(threeDFlag);
                } else {
                    alteration.addFlag(hotspotFlag);
                }
                alterationService.save(alteration);
            }
        });
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

    private void importGene() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("gene_10_2023.tsv");
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);
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
                    Optional<Synonym> synonymOptional = synonymService.findByTypeAndSourceAndName(
                        SynonymType.GENE,
                        DEFAULT_GENE_SYNONMN_SOURCE,
                        trimmedSynonym
                    );
                    if (synonymOptional.isEmpty()) {
                        Synonym geneSynonym = new Synonym();
                        geneSynonym.setName(synonym.trim());
                        geneSynonym.setSource(DEFAULT_GENE_SYNONMN_SOURCE);
                        geneSynonym.setType(SynonymType.GENE.name());
                        savedSynonyms.add(synonymService.save(geneSynonym));
                    } else {
                        savedSynonyms.add(synonymOptional.get());
                    }
                });
            savedGene.setSynonyms(savedSynonyms);
            geneService.partialUpdate(savedGene);
            log.debug("Saved gene {}", gene);
            if ((i + 1) % 1000 == 0) {
                log.info("Imported {}/{} gene", i + 1, lines.size());
            }
        }

        // import special genes
        Gene gene = new Gene();
        gene.setEntrezGeneId(-2);
        gene.setHugoSymbol("Other Biomarkers");
        this.geneService.save(gene);
    }

    private void importGenePanelFlag() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("gene_panel_flag.tsv");
        lines.forEach(line -> {
            if (StringUtils.isNotEmpty(line.get(2))) {
                Integer entrezGeneId = Integer.parseInt(line.get(0));
                String flag = line.get(2);

                Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(entrezGeneId);
                Optional<Flag> flagOptional = flagService.findByTypeAndFlag(FlagType.GENE_PANEL, flag);
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
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);
            EnsemblGene ensemblGene = new EnsemblGene();
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(Integer.parseInt(line.get(0)));
            if (geneOptional.isEmpty()) {
                log.error("Can't find gene {}", line.get(0));
                continue;
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
            if ((i + 1) % 1000 == 0) {
                log.info("Imported {}/{} ensembl gene", i + 1, lines.size());
            }
        }
    }

    private void importGenomeFragment() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("genome_fragment.tsv");
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);
            GenomeFragment genomeFragment = new GenomeFragment();
            Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findByEnsemblGeneIdAndReferenceGenome(
                line.get(3),
                ReferenceGenome.valueOf(line.get(2))
            );
            if (ensemblGeneOptional.isEmpty()) {
                log.error("Cannot find ensembl gene {} {}", line.get(3), ReferenceGenome.valueOf(line.get(2)));
                continue;
            }
            Optional<TranscriptDTO> transcriptOptional = transcriptService.findByEnsemblGeneAndEnsemblTranscriptId(
                ensemblGeneOptional.get(),
                line.get(4)
            );
            if (transcriptOptional.isEmpty()) {
                log.error("Can't find transcript {}", line.get(4));
                continue;
            }
            genomeFragment.setTranscript(transcriptMapper.toEntity(transcriptOptional.get()));
            genomeFragment.setType(GenomeFragmentType.valueOf(line.get(5)));
            Optional<SeqRegion> seqRegionOptional = seqRegionService.findByName(line.get(6));
            genomeFragment.setSeqRegion(seqRegionOptional.get());
            genomeFragment.setStart(Integer.parseInt(line.get(7)));
            genomeFragment.setEnd(Integer.parseInt(line.get(8)));
            genomeFragment.setStrand(Integer.parseInt(line.get(9)));
            genomeFragmentService.save(genomeFragment);
            if ((i + 1) % 1000 == 0) {
                log.info("Imported {}/{} genome fragment", i + 1, lines.size());
            }
        }
    }

    private void importGenomicIndicator() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("genomic_indicator.tsv");
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);

            Optional<GenomicIndicator> existingGI = genomicIndicatorService.findByTypeAndName(GenomicIndicatorType.GERMLINE, line.get(3));
            if (existingGI.isEmpty()) {
                GenomicIndicator genomicIndicator = new GenomicIndicator();
                genomicIndicator.setType(GenomicIndicatorType.GERMLINE.name());
                genomicIndicator.setUuid(line.get(5));
                genomicIndicator.setName(line.get(3));
                genomicIndicator = genomicIndicatorService.save(genomicIndicator);
                if (StringUtils.isNotEmpty(line.get(4))) {
                    Set<AlleleState> alleleStateList = Arrays
                        .stream(line.get(4).split(","))
                        .map(alleleState -> alleleStateService.findByNameIgnoreCase(alleleState.trim()).get())
                        .collect(Collectors.toSet());
                    genomicIndicator.setAlleleStates(alleleStateList);
                    genomicIndicatorService.partialUpdate(genomicIndicator);
                }
                existingGI = Optional.of(genomicIndicatorService.save(genomicIndicator));
            }

            Optional<Gene> geneOptional = geneService.findGeneByHugoSymbol(line.get(0));
            if (geneOptional.isEmpty()) {
                log.error("Cannot find the gene {}", line.get(0));
                continue;
            }
            Alteration alteration;
            List<Alteration> alterationList = alterationService.findByNameOrAlterationAndGenesId(line.get(1), geneOptional.get().getId());
            if (alterationList.isEmpty()) {
                log.warn("Cannot find alteration {} in {}, will create a new one.", line.get(1), line.get(0));
                Alteration newAlt = new Alteration();
                newAlt.setGenes(Collections.singleton(geneOptional.get()));
                newAlt.setAlteration(line.get(1));
                newAlt.setType(AlterationType.ANY);
                newAlt.setProteinChange(line.get(2));
                alteration = alterationService.save(newAlt);
            } else {
                alteration = alterationList.get(0);
                if (alterationList.size() > 1) {
                    log.warn("Multiple alteration matches found, picked the first match");
                }
            }

            if (alteration != null) {
                Association association = new Association();
                association.setAlterations(Collections.singleton(alteration));
                existingGI.get().setAssociations(Collections.singleton(association));
                genomicIndicatorService.partialUpdate(existingGI.get());
            }
        }
    }

    private void importTranscript() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("transcript.tsv");
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);
            Transcript transcript = new Transcript();
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(Integer.parseInt(line.get(0)));
            if (geneOptional.isEmpty()) {
                log.error("Can't find gene {}", line.get(0));
                continue;
            }
            transcript.setGene(geneOptional.get());
            Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findByEnsemblGeneIdAndReferenceGenome(
                line.get(3),
                ReferenceGenome.valueOf(line.get(2))
            );
            if (ensemblGeneOptional.isEmpty()) {
                log.error("Error find ensembl gene {} {}", line.get(2), line.get(3));
                continue;
            }
            transcript.setReferenceGenome(ReferenceGenome.valueOf(line.get(2)));
            transcript.setEnsemblGene(ensemblGeneOptional.get());

            transcript.setEnsemblTranscriptId(line.get(4));
            transcript.setCanonical(Boolean.valueOf(line.get(5)));
            transcript.setEnsemblProteinId(line.get(6));
            transcript.setReferenceSequenceId(line.get(7));
            transcript.setDescription(line.get(8));
            transcriptService.save(transcript);
            if ((i + 1) % 1000 == 0) {
                log.info("Imported {}/{} transcript", i + 1, lines.size());
            }
        }
    }

    private void importTranscriptFlag() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("transcript_flag.tsv");
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);
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
                    continue;
                }
                Optional<Flag> flagOptional = flagService.findByTypeAndFlag(FlagType.TRANSCRIPT, flag);
                transcriptOptional.get().getFlags().add(flagOptional.get());
                if (TranscriptFlagEnum.ONCOKB.name().equals(flag)) {
                    transcriptOptional.get().setCanonical(true);
                }
                transcriptService.partialUpdate(transcriptOptional.get());
            }
            if ((i + 1) % 1000 == 0) {
                log.info("Imported {}/{} transcript flag", i + 1, lines.size());
            }
        }
    }

    private void importSequence() throws IOException {
        List<List<String>> lines = parseTsvMetaFile("sequence.tsv");
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);
            Sequence sequence = new Sequence();
            Optional<EnsemblGene> ensemblGeneOptional = ensemblGeneService.findByEnsemblGeneIdAndReferenceGenome(
                line.get(3),
                ReferenceGenome.valueOf(line.get(2))
            );
            if (ensemblGeneOptional.isEmpty()) {
                log.error("Error find ensembl gene {} {}", line.get(2), line.get(3));
                continue;
            }
            Optional<TranscriptDTO> transcriptOptional = transcriptService.findByEnsemblGeneAndEnsemblTranscriptId(
                ensemblGeneOptional.get(),
                line.get(4)
            );
            if (transcriptOptional.isEmpty()) {
                log.error("Error find transcript {}", line.get(4));
                continue;
            }
            sequence.setTranscript(transcriptMapper.toEntity(transcriptOptional.get()));
            sequence.setSequenceType(SequenceType.valueOf(line.get(5)));
            sequence.setSequence(line.get(6));
            sequenceService.save(sequence);
            if ((i + 1) % 1000 == 0) {
                log.info("Imported {}/{} sequence", i + 1, lines.size());
            }
        }
    }

    public void saveAllNcitData(List<List<String>> lines) {
        String SYNONYMS_SEPARATOR_REGEX = "\\|";
        for (int i = 0; i < lines.size(); i++) {
            List<String> line = lines.get(i);
            Optional<NciThesaurus> nciThesaurusOptional = nciThesaurusService.findByCode(line.get(0));
            if (nciThesaurusOptional.isPresent()) {
                continue;
            }
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
                .map(synonymStr -> synonymStr.trim())
                .distinct()
                .map(synonymStr -> {
                    Synonym synonym = new Synonym();
                    synonym.setType(SynonymType.NCIT.name());
                    synonym.setName(synonymStr);
                    synonym.setSource("NCIT");
                    return synonym;
                })
                .map(synonym -> {
                    Optional<Synonym> synonymOptional = synonymService.findByTypeAndSourceAndName(
                        SynonymType.NCIT,
                        "NCIT",
                        synonym.getName()
                    );
                    if (synonymOptional.isEmpty()) {
                        return synonymService.save(synonym);
                    } else {
                        return synonymOptional.get();
                    }
                })
                .collect(Collectors.toSet());
            nciThesaurus.setSynonyms(synonyms);
            nciThesaurusService.save(nciThesaurus);
            if ((i + 1) % 1000 == 0) {
                log.info("Imported {}/{} NCIT", i + 1, lines.size());
            }
        }
    }

    public void importNcit() throws IOException {
        List<List<String>> lines = parseDelimitedFile(DATA_DIRECTORY + "/ncit/Thesaurus_" + NCIT_VERSION + ".tsv", "\t", true);
        saveAllNcitData(lines);
    }

    private List<List<String>> parseTsvMetaFile(String fileName) throws IOException {
        return parseDelimitedFile(META_DATA_FOLDER_PATH + "/" + fileName, "\t", true);
    }
}
