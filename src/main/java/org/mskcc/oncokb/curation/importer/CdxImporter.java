package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.util.FileUtils.readDelimitedLinesStream;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import jodd.util.StringUtil;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.AssociationCancerTypeRelation;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.domain.enumeration.RuleEntity;
import org.mskcc.oncokb.curation.service.*;
import org.mskcc.oncokb.curation.service.dto.TreatmentDTO;
import org.mskcc.oncokb.curation.util.CdxUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CdxImporter {

    @Autowired
    private CdxUtils cdxUtils;

    @Autowired
    private AssociationService associationService;

    @Autowired
    private CompanionDiagnosticDeviceService companionDiagnosticDeviceService;

    @Autowired
    private FdaSubmissionService fdaSubmissionService;

    @Autowired
    private SpecimenTypeService specimenTypeService;

    @Autowired
    private GeneService geneService;

    @Autowired
    private AlterationService alterationService;

    @Autowired
    private CancerTypeService cancerTypeService;

    @Autowired
    private DrugService drugService;

    @Autowired
    private MainService mainService;

    private final Logger log = LoggerFactory.getLogger(Importer.class);

    public void importCdxMain() throws IOException {
        List<List<String>> parsedCdxContent = readInitialCdxFile();
        if (parsedCdxContent == null) {
            return;
        }

        for (int i = 0; i < parsedCdxContent.size(); i++) {
            if (i == 0) {
                continue; // Skipping header row
            }
            log.info("Processing row " + i);
            List<String> row = parsedCdxContent.get(i);
            try {
                CompanionDiagnosticDevice cdx = null;
                List<FdaSubmission> fdaSubmissions = new ArrayList<>();
                List<TreatmentDTO> treatments = new ArrayList<>();
                List<Gene> genes = new ArrayList<>();
                Map<Gene, List<Alteration>> geneAlterationMap = new HashMap<>();
                List<CancerType> cancerTypes = new ArrayList<>();

                // Parse row
                for (int colIndex = 0; colIndex < row.size(); colIndex++) {
                    String columnValue = row.get(colIndex).trim();
                    switch (colIndex) {
                        case 0:
                            cdx = parseCdxNameColumn(columnValue);
                            break;
                        case 5:
                            genes = parseGeneColumn(columnValue);
                            break;
                        case 6:
                            geneAlterationMap = parseAlterationColumn(columnValue, genes);
                            break;
                        case 7:
                            cancerTypes = parseCancerTypesColumn(columnValue);
                            break;
                        case 8:
                            treatments = parseTreatmentColumn(columnValue);
                            break;
                        case 9:
                            cdx.setPlatformType(columnValue);
                            break;
                        case 10:
                            parseSpecimenTypeColumn(columnValue, cdx);
                            break;
                        case 12:
                            for (String val : columnValue.split("and")) {
                                Optional<FdaSubmission> fdaSubmissionOptional = parseFdaSubmissionColumn(val);
                                if (fdaSubmissionOptional.isPresent()) {
                                    fdaSubmissions.add(fdaSubmissionOptional.orElseThrow());
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
                saveCdxInformation(cdx, fdaSubmissions, cancerTypes, treatments, geneAlterationMap);
                log.info("Successfully imported row {}", i);
            } catch (IllegalArgumentException e) {
                String message = e.getMessage();
                if (message == null) {
                    message = String.format("Could not parse column in row %s", i);
                }
                log.error(message);
                log.error("Issue processing row {} {}, skipping...", i, row);
                continue;
            }
        }
    }

    private void saveCdxInformation(
        CompanionDiagnosticDevice cdx,
        List<FdaSubmission> fdaSubmissions,
        List<CancerType> cancerTypes,
        List<TreatmentDTO> treatments,
        Map<Gene, List<Alteration>> geneAlterationMap
    ) {
        CompanionDiagnosticDevice savedCdx = companionDiagnosticDeviceService.save(cdx);
        fdaSubmissions = fdaSubmissions
            .stream()
            .map(pma -> {
                pma.setCompanionDiagnosticDevice(savedCdx);
                return fdaSubmissionService.save(pma);
            })
            .collect(Collectors.toList());

        Association biomarkerAssociation = new Association();
        if (!treatments.isEmpty()) {
            Set<Drug> drugSet = new HashSet<>();
            treatments.forEach(treatmentDTO -> drugSet.addAll(treatmentDTO.getDrugs()));
            biomarkerAssociation.setDrugs(drugSet);
            Rule rule = new Rule();
            rule.setEntity(RuleEntity.DRUG.name());
            rule.setRule(
                treatments
                    .stream()
                    .map(
                        treatmentDTO ->
                            treatmentDTO.getDrugs().stream().map(drug -> drug.getId().toString()).collect(Collectors.joining("+"))
                    )
                    .collect(Collectors.joining(","))
            );
            biomarkerAssociation.addRule(rule);
        }
        Set<Alteration> allAlts = new HashSet<>();
        for (Map.Entry<Gene, List<Alteration>> entry : geneAlterationMap.entrySet()) {
            allAlts.addAll(entry.getValue());
        }
        if (!cancerTypes.isEmpty()) {
            biomarkerAssociation.setCancerTypes(new HashSet<>(cancerTypes));
            Rule rule = new Rule();
            rule.setEntity(RuleEntity.CANCER_TYPE.name());
            rule.setRule(cancerTypes.stream().map(cancerType -> cancerType.getId().toString()).collect(Collectors.joining(",")));
            biomarkerAssociation.addRule(rule);
        }
        fdaSubmissions.forEach(biomarkerAssociation::addFdaSubmission);
        biomarkerAssociation.setAlterations(allAlts);
        associationService.save(biomarkerAssociation);
    }

    private CompanionDiagnosticDevice parseCdxNameColumn(String columnValue) throws IllegalArgumentException {
        Pattern pattern = Pattern.compile("^(.*)\\((.*?)\\)");
        Matcher matcher = pattern.matcher(columnValue);
        if (matcher.find() && matcher.group(1) != null && matcher.group(2) != null) {
            String cdxName = matcher.group(1);
            String cdxManufacturer = matcher.group(2);
            CompanionDiagnosticDevice cdx = companionDiagnosticDeviceService
                .findByNameAndManufacturer(cdxName, cdxManufacturer)
                .stream()
                .findFirst()
                .orElse(new CompanionDiagnosticDevice());
            cdx.setName(cdxName);
            cdx.setManufacturer(cdxManufacturer);
            return cdx;
        } else {
            throw new IllegalArgumentException();
        }
    }

    private Optional<FdaSubmission> parseFdaSubmissionColumn(String columnValue) {
        columnValue = columnValue.trim();
        Pattern pattern = Pattern.compile("^([A-Za-z\\d]+)(\\/([A-Za-z\\d]+))?\\s*(\\((.*)\\))?");
        Matcher matcher = pattern.matcher(columnValue);
        if (matcher.find() && matcher.group(1) != null) {
            String number = matcher.group(1);
            String supplementNumber = Optional.ofNullable(matcher.group(3)).orElse("");
            Optional<FdaSubmission> optionalFdaSubmission = fdaSubmissionService.findOrFetchFdaSubmissionByNumber(
                number,
                supplementNumber,
                false
            );
            if (optionalFdaSubmission.isPresent()) {
                Instant fdaSubmissionDate = cdxUtils.convertDateToInstant(matcher.group(5));
                if (fdaSubmissionDate != null) {
                    optionalFdaSubmission.orElseThrow().setDecisionDate(fdaSubmissionDate);
                    optionalFdaSubmission.orElseThrow().curated(true);
                }
                return optionalFdaSubmission;
            } else {
                log.error("Could not find FDA Submission {}", columnValue);
            }
        } else {
            log.error("Cannot find FDA Submission {}", columnValue);
        }
        return Optional.empty();
    }

    private List<CancerType> parseCancerTypesColumn(String columnValue) throws IllegalArgumentException {
        List<CancerType> cancerTypes = new ArrayList<>();
        for (String cancerType : columnValue.split("\\|")) {
            cancerType = cancerType.trim();
            Optional<CancerType> optionalCancerType = cancerTypeService.findOneBySubtypeIgnoreCase(cancerType);
            if (optionalCancerType.isPresent()) {
                cancerTypes.add(optionalCancerType.orElseThrow());
            } else {
                optionalCancerType = cancerTypeService.findByMainTypeAndSubtypeIsNull(cancerType);
                if (optionalCancerType.isPresent()) {
                    cancerTypes.add(optionalCancerType.orElseThrow());
                } else {
                    throw new IllegalArgumentException();
                }
            }
        }
        return cancerTypes;
    }

    private List<TreatmentDTO> parseTreatmentColumn(String columnValue) {
        List<TreatmentDTO> treatments = new ArrayList<>();
        for (String drugsString : columnValue.split(",\\s+")) {
            TreatmentDTO treatment = new TreatmentDTO();
            for (String drugString : drugsString.split("\\+")) {
                drugString = drugString.trim();
                Optional<Drug> optionalDrug = drugService.findByName(drugString).stream().findFirst();
                if (optionalDrug.isPresent()) {
                    treatment.addDrug(optionalDrug.orElseThrow());
                } else {
                    log.error("Could not find drug {}", drugString);
                }
            }
            treatments.add(treatment);
        }
        return treatments;
    }

    private List<Gene> parseGeneColumn(String columnValue) throws IllegalArgumentException {
        List<Gene> genes = new ArrayList<>();
        String[] geneStrings = columnValue.split("(and)|,");
        for (String geneString : geneStrings) {
            geneString = geneString.replaceAll("\\(\\S+\\)", "").trim();
            Optional<Gene> optionalGene = geneService.findGeneByHugoSymbol(geneString);
            if (optionalGene.isEmpty()) {
                log.error("Could not find gene " + geneString);
            } else {
                genes.add(optionalGene.orElseThrow());
            }
        }
        return genes;
    }

    private Map<Gene, List<Alteration>> parseAlterationColumn(String columnValue, List<Gene> genes) throws IllegalArgumentException {
        Map<Gene, List<Alteration>> geneAlterationMap = new HashMap<>();
        String[] alterationStrings = { columnValue };
        if (columnValue.contains(",")) {
            alterationStrings = columnValue.split(",");
        }

        for (Gene gene : genes) {
            Long geneId = gene.getId();
            List<Alteration> alterations = new ArrayList<>();
            for (String alterationString : alterationStrings) {
                alterationString = alterationString.trim();
                List<Alteration> alterationList = alterationService.findByNameOrAlterationAndGenesId(alterationString, geneId);
                if (alterationList.isEmpty()) {
                    log.error("Cannot find alteration {} for gene {}, adding...", alterationString, gene.getHugoSymbol());
                    Alteration alteration = new Alteration();
                    alteration.setAlteration(alterationString);
                    alteration.setGenes(Collections.singleton(gene));
                    mainService.annotateAlteration(ReferenceGenome.GRCh37, alteration);
                    alterationList.add(alterationService.save(alteration));
                }
                geneAlterationMap.putIfAbsent(gene, alterations);
                geneAlterationMap.get(gene).addAll(alterationList);
            }
        }
        return geneAlterationMap;
    }

    private void parseSpecimenTypeColumn(String columnValue, CompanionDiagnosticDevice cdx) throws IllegalArgumentException {
        if (StringUtil.isEmpty(columnValue) || StringUtil.isEmpty(columnValue.trim())) {
            return;
        }
        columnValue = columnValue.trim();
        Arrays.stream(columnValue.split(" or ")).forEach(name -> {
            name = name.trim();
            Optional<SpecimenType> optionalSpecimenType = specimenTypeService.findOneByName(name);
            if (optionalSpecimenType.isPresent() && cdx != null) {
                cdx.addSpecimenType(optionalSpecimenType.orElseThrow());
            } else {
                log.error("Cannot find the CDx specimen type {}", name);
                throw new IllegalArgumentException();
            }
        });
    }

    private List<List<String>> readInitialCdxFile() throws IOException {
        URL cdxFileUrl = getClass().getClassLoader().getResource("data/initial_cdx_data.tsv");
        if (cdxFileUrl == null) {
            log.error("Cannot find CDx file");
            return null;
        }
        InputStream is = cdxFileUrl.openStream();
        return readDelimitedLinesStream(is, "\\t", true);
    }
}
