package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.util.FileUtils.readDelimitedLinesStream;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.SpecimenType;
import org.mskcc.oncokb.curation.service.AlterationService;
import org.mskcc.oncokb.curation.service.BiomarkerAssociationService;
import org.mskcc.oncokb.curation.service.CancerTypeService;
import org.mskcc.oncokb.curation.service.CompanionDiagnosticDeviceService;
import org.mskcc.oncokb.curation.service.DrugService;
import org.mskcc.oncokb.curation.service.FdaSubmissionService;
import org.mskcc.oncokb.curation.service.GeneService;
import org.mskcc.oncokb.curation.service.SpecimenTypeService;
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
    private BiomarkerAssociationService biomarkerAssociationService;

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
            try {
                List<String> row = parsedCdxContent.get(i);
                CompanionDiagnosticDevice cdx = null;
                List<FdaSubmission> fdaSubmissions = new ArrayList<>();
                List<List<Drug>> drugs = new ArrayList<>();
                List<Gene> genes = new ArrayList<>();
                Map<Gene, List<Alteration>> geneAlterationMap = new HashMap<>();
                CancerType cancerType = null;

                // Parse row
                for (int colIndex = 0; colIndex < row.size(); colIndex++) {
                    String columnValue = row.get(colIndex).trim();
                    switch (colIndex) {
                        case 0:
                            cdx = parseCdxNameColumn(columnValue);
                            break;
                        case 7:
                            fdaSubmissions = parseFdaSubmissionColumn(columnValue);
                            break;
                        case 8:
                            parseFdaSubmissionDateColumn(fdaSubmissions, columnValue);
                            break;
                        case 9:
                            cancerType = parseCancerTypeColumn(columnValue);
                            break;
                        case 10:
                            drugs = parseDrugColumn(columnValue);
                            break;
                        case 11:
                            genes = parseGeneColumn(columnValue);
                            break;
                        case 12:
                            geneAlterationMap = parseAlterationColumn(columnValue, genes);
                            break;
                        default:
                            break;
                    }
                }
                saveCdxInformation(cdx, fdaSubmissions, cancerType, drugs, geneAlterationMap);
                log.info("Successfully imported row {}", i);
            } catch (IllegalArgumentException e) {
                String message = e.getMessage();
                if (message == null) {
                    message = String.format("Could not parse column in row %s", i);
                }
                log.error(message);
                log.error("Issue processing row {}, skipping...", i);
                continue;
            }
        }
    }

    private void saveCdxInformation(
        CompanionDiagnosticDevice cdx,
        List<FdaSubmission> fdaSubmissions,
        CancerType cancerType,
        List<List<Drug>> drugs,
        Map<Gene, List<Alteration>> geneAlterationMap
    ) {
        fdaSubmissions =
            fdaSubmissions
                .stream()
                .map(pma -> {
                    FdaSubmission savedFdaSubmission = fdaSubmissionService.save(pma);
                    cdx.addFdaSubmission(savedFdaSubmission);
                    companionDiagnosticDeviceService.save(cdx);
                    return savedFdaSubmission;
                })
                .collect(Collectors.toList());

        // Create BiomarkerAssociation entities
        for (Map.Entry<Gene, List<Alteration>> entry : geneAlterationMap.entrySet()) {
            for (List<Drug> drug : drugs) {
                BiomarkerAssociation biomarkerAssociation = new BiomarkerAssociation();
                biomarkerAssociation.setGene(entry.getKey());
                entry.getValue().stream().forEach(mutation -> biomarkerAssociation.addAlteration(mutation));
                drug.stream().forEach(d -> biomarkerAssociation.addDrug(d));
                biomarkerAssociation.setCancerType(cancerType);
                fdaSubmissions.stream().forEach(fdaSub -> biomarkerAssociation.addFdaSubmission(fdaSub));
                biomarkerAssociationService.save(biomarkerAssociation);
            }
        }
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

    private List<FdaSubmission> parseFdaSubmissionColumn(String columnValue) {
        List<FdaSubmission> fdaSubmissions = new ArrayList<>();
        String[] pmas = columnValue.split("and");
        for (String pma : pmas) {
            pma = pma.trim();
            Pattern pattern = Pattern.compile("^([A-Za-z\\d]+)(\\/([A-Za-z\\d]+))?");
            Matcher matcher = pattern.matcher(pma);
            if (matcher.find() && matcher.group(1) != null) {
                String number = matcher.group(1);
                String supplementNumber = Optional.ofNullable(matcher.group(3)).orElse("");
                Optional<FdaSubmission> optionalFdaSubmission = fdaSubmissionService.findOrFetchFdaSubmissionByNumber(
                    number,
                    supplementNumber,
                    false
                );
                if (optionalFdaSubmission.isPresent()) {
                    fdaSubmissions.add(optionalFdaSubmission.get());
                } else {
                    log.error("Could not find FDA Submission {}", pma);
                }
            } else {
                log.error("Cannot find FDA Submission {}", pma);
            }
        }
        return fdaSubmissions;
    }

    private void parseFdaSubmissionDateColumn(List<FdaSubmission> fdaSubmissions, String columnValue) {
        String[] dates = columnValue.split("and");
        for (int i = 0; i < dates.length; i++) {
            String date = dates[i];
            date = date.replace("(", "").replace(")", "").trim();
            Instant fdaSubmissionDate = cdxUtils.convertDateToInstant(date);
            fdaSubmissions.get(i).setDecisionDate(fdaSubmissionDate);
        }
    }

    private CancerType parseCancerTypeColumn(String columnValue) throws IllegalArgumentException {
        columnValue = columnValue.split(",")[0].trim();
        Optional<CancerType> optionalCancerType = cancerTypeService.findOneBySubtypeIgnoreCase(columnValue);
        if (optionalCancerType.isPresent()) {
            return optionalCancerType.get();
        }
        optionalCancerType = cancerTypeService.findOneByMainTypeIgnoreCaseAndLevel(columnValue, Integer.valueOf(0));
        return optionalCancerType.orElseThrow(IllegalArgumentException::new);
    }

    private List<List<Drug>> parseDrugColumn(String columnValue) {
        List<List<Drug>> drugs = new ArrayList<>();
        for (String drugsString : columnValue.split(",\\s+")) {
            List<Drug> combinationDrugs = new ArrayList<>();
            for (String drugString : drugsString.split("\\+")) {
                drugString = drugString.trim();
                Optional<Drug> optionalDrug = drugService.findByName(drugString).stream().findFirst();
                if (optionalDrug.isPresent()) {
                    combinationDrugs.add(optionalDrug.get());
                } else {
                    log.error("Could not find drug {}", drugString);
                    continue;
                }
            }
            drugs.add(combinationDrugs);
        }
        return drugs;
    }

    private List<Gene> parseGeneColumn(String columnValue) throws IllegalArgumentException {
        List<Gene> genes = new ArrayList<>();
        String[] geneStrings = columnValue.split("(and)|,");
        for (String geneString : geneStrings) {
            geneString = geneString.replaceAll("\\(\\S+\\)", "").trim();
            Optional<Gene> optionalGene = geneService.findGeneByHugoSymbol(geneString);
            if (!optionalGene.isPresent()) {
                log.error("Could not find gene " + geneString);
            } else {
                genes.add(optionalGene.get());
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
                Optional<Alteration> optionalAlteration = alterationService.findByNameAndGeneId(alterationString, geneId);
                if (optionalAlteration.isPresent()) {
                    if (geneAlterationMap.get(gene) == null) {
                        geneAlterationMap.put(gene, alterations);
                    }
                    geneAlterationMap.get(gene).add(optionalAlteration.get());
                } else {
                    log.error("Cannot find alteration " + alterationString + " for gene " + gene.getHugoSymbol());
                }
            }
        }
        return geneAlterationMap;
    }

    private void parseSpecimenTypeColumn(String columnValue, CompanionDiagnosticDevice cdx) throws IllegalArgumentException {
        Optional<SpecimenType> optionalSpecimenType = specimenTypeService.findOneByType(columnValue);
        if (optionalSpecimenType.isPresent() && cdx != null) {
            cdx.addSpecimenType(optionalSpecimenType.get());
        } else {
            throw new IllegalArgumentException();
        }
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
