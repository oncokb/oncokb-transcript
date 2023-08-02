package org.mskcc.oncokb.curation.util;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.FdaSubmissionType;
import org.mskcc.oncokb.curation.service.FdaSubmissionTypeService;
import org.mskcc.oncokb.curation.service.GeneService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CdxUtils {

    private final Logger log = LoggerFactory.getLogger(CdxUtils.class);

    private final String CDX_URL =
        "https://www.fda.gov/medical-devices/in-vitro-diagnostics/list-cleared-or-approved-companion-diagnostic-devices-in-vitro-and-imaging-tools";

    private final Set<String> cdxDeviceFieldNames = Set.of("Device Name", "Trade Name", "Device");

    private final Set<String> cdxNumberFieldNames = Set.of("PMA Number", "HDE Number", "510(K) Number", "De Novo Number");

    @Autowired
    private FdaSubmissionTypeService fdaSubmissionTypeService;

    @Autowired
    private GeneService geneService;

    // Extract relevant information from the FDA CDx page
    public List<CompanionDiagnosticDevice> getCdxListFromHTML() throws IOException {
        // Fetch the html from the fda cdx page
        Document document = Jsoup.connect(CDX_URL).get();

        Element table = document.select("table").first();

        // Extract the table rows
        List<CompanionDiagnosticDevice> companionDiagnosticDevices = new ArrayList<>();
        Element tbody = table.select("tbody").first();
        Integer rowSpanCount = 0;
        Integer rowCount = 0;
        for (Element tr : tbody.getElementsByTag("tr")) {
            rowCount++;
            Elements td = tr.getElementsByTag("td");
            if (rowSpanCount > 0) { // Some cells may span across multiple rows
                rowSpanCount--;
                continue;
            }
            try {
                rowSpanCount = Integer.parseInt(td.first().attributes().get("rowspan")) - 1;
            } catch (NumberFormatException e) {}
            ArrayList<String> tableCells = td.stream().limit(3).map(e -> e.text()).collect(Collectors.toCollection(ArrayList::new));

            // Create CompanionDiagnosticDevice entity
            CompanionDiagnosticDevice cdx = new CompanionDiagnosticDevice();
            if (tableCells.size() < 3) {
                log.warn("Row has less than 3 elements: {}", rowCount);
                continue;
            }
            cdx.setName(tableCells.get(0));
            Set<String> submissionCodes = Arrays
                .asList(tableCells.get(1).split("\\s"))
                .stream()
                .map(code -> code.trim().split("/")[0]) // Only get the primary pma
                .filter(code -> code.length() > 0)
                .collect(Collectors.toSet());
            cdx.setFdaSubmissions(getFDASubmissionFromHTML(submissionCodes, false, true));
            cdx.setManufacturer(tableCells.get(2));
            companionDiagnosticDevices.add(cdx);
        }
        return companionDiagnosticDevices;
    }

    /**
     * Extract the relevant information from the PMA / 510(k) / HDE pages
     * @param fdaSubmissionCodes the submission codes to fetch from fda website
     * @param exact if submission is a supplement, then return the supplement
     * @param getAllSupplements parse all supplements when given a primary pma
     */
    public Set<FdaSubmission> getFDASubmissionFromHTML(Set<String> fdaSubmissionCodes, Boolean exact, Boolean getAllSupplements) {
        // Check if the fda submission codes are valid and purify input
        Set<String> purifiedSubmissionCodes = new HashSet<>();
        for (String code : fdaSubmissionCodes) {
            Pattern regex = Pattern.compile("^([A-Z]+[0-9]+)(\\/((S[0-9]+)(-(S[0-9]+))?))?");
            Matcher matcher = regex.matcher(code.toUpperCase());
            if (matcher.find()) {
                String primaryPma = matcher.group(1);
                if (getAllSupplements) {
                    purifiedSubmissionCodes.clear();
                    purifiedSubmissionCodes.add(primaryPma);
                    findAllSupplements(primaryPma).stream().forEach(supplement -> purifiedSubmissionCodes.add(primaryPma + supplement));
                } else {
                    if (!exact || matcher.group(2) == null) {
                        purifiedSubmissionCodes.add(primaryPma);
                    }
                    String supplement = matcher.group(3);
                    if (supplement != null) {
                        // Sometimes the PMAs are given as ranges (ie. P990081/S001-S028).
                        Integer start = Integer.valueOf(matcher.group(4).substring(1));
                        Integer end = matcher.group(6) != null ? Integer.valueOf(matcher.group(6).substring(1)) : start;
                        IntStream
                            .rangeClosed(start, end)
                            .forEach(num -> {
                                String pmaString = String.format("%sS%03d", primaryPma, num);
                                purifiedSubmissionCodes.add(pmaString);
                            });
                    }
                }
            }
        }

        // Fetch the PMA/510(k)/HDE information from webpage
        Set<FdaSubmission> fdaSubmissions = new HashSet<>();
        for (String code : purifiedSubmissionCodes) {
            Document submissionInfoDocument = getJsoupDocument(code);
            if (submissionInfoDocument == null) {
                continue;
            }

            Element targetTable = findFdaSubmissionTable(submissionInfoDocument);
            if (targetTable == null) {
                log.warn("No information found for fda submission : {}", code);
                continue;
            }

            Element tbody = targetTable.select("tbody").first();

            FdaSubmission fdaSubmission = new FdaSubmission();

            for (Element tr : tbody.getElementsByTag("tr")) {
                Element th = tr.getElementsByTag("th").first();
                Element td = tr.getElementsByTag("td").first();

                if (th != null) {
                    String header = th.text().trim();
                    String content = td.text().trim();
                    if (this.cdxDeviceFieldNames.stream().anyMatch(header::equalsIgnoreCase)) {
                        fdaSubmission.setDeviceName(content);
                    } else if (this.cdxNumberFieldNames.stream().anyMatch(header::equalsIgnoreCase)) {
                        fdaSubmission.setNumber(content);
                    } else if (header.equalsIgnoreCase("Generic Name")) {
                        fdaSubmission.setGenericName(content);
                    } else if (header.equalsIgnoreCase("Supplement Number")) {
                        fdaSubmission.setSupplementNumber(content);
                    } else if (header.equalsIgnoreCase("Date Received")) {
                        fdaSubmission.setDateReceived(convertDateToInstant(content));
                    } else if (header.equalsIgnoreCase("Decision Date")) {
                        fdaSubmission.setDecisionDate(convertDateToInstant(content));
                    }
                } else {
                    // The Approval Order Statement column does not have the header stored in <th> element
                    // Instead it is a <span> inside <td> element.
                    th = td.children().first();
                    if (th != null) {
                        String header = th.text().trim();
                        if (header.equalsIgnoreCase("Approval Order Statement")) {
                            String approvalOrderStatement = td.textNodes().get(td.textNodes().size() - 1).text();
                            fdaSubmission.setDescription(approvalOrderStatement);
                            Boolean isGenetic = isGenetic(approvalOrderStatement);
                            fdaSubmission.setGenetic(isGenetic);
                        }
                    }
                }
            }

            // Add FDASubmissionType
            if (fdaSubmission.getNumber() != null) {
                Optional<FdaSubmissionType> type = fdaSubmissionTypeService.findOneBySubmissionNumber(fdaSubmission.getNumber());
                if (type.isPresent()) {
                    fdaSubmission.setType(type.get());
                }
            }
            fdaSubmissions.add(fdaSubmission);
        }
        return fdaSubmissions;
    }

    private Document getJsoupDocument(String code) {
        Document submissionInfoDocument = null;
        String prefix = code.split("[0-9]").length > 0 ? code.split("[0-9]")[0] : null;
        String url = FdaSubmissionUrl.getFullUrl(prefix, code);
        if (url == null) {
            log.warn("Fda submission code is not valid: {}", code);
        } else {
            try {
                submissionInfoDocument = Jsoup.connect(url).get();
            } catch (IOException e) {
                log.warn("Failed to fetch fda submission from fda: {}", code);
            }
        }
        return submissionInfoDocument;
    }

    private Element findFdaSubmissionTable(Document submissionInfoDocument) {
        // The page contains many tables, so we need to find the table containing
        // the relevant information. The PMA/510(K)/HDE tables all have a common 'Date Received'
        // field that we can use to locate the desired table.
        Elements tables = submissionInfoDocument.select("table");
        Element targetTable = null;
        for (Element table : tables) {
            Elements tableHeaders = table.select("> tbody > tr > th");
            if (tableHeaders.isEmpty()) {
                continue;
            }
            Boolean isTargetTable = tableHeaders.stream().anyMatch(header -> header.text().trim().equals("Date Received"));
            if (isTargetTable) {
                targetTable = table;
                break;
            }
        }
        return targetTable;
    }

    /**
     * Find all supplement numbers for the primary fda submission number.
     * @param primaryPma primary number
     * @return list of supplement numbers
     */
    private Set<String> findAllSupplements(String primaryPma) {
        Set<String> supplements = new HashSet<String>();
        Document primaryPmaDocument = getJsoupDocument(primaryPma);
        if (primaryPmaDocument == null) {
            return supplements;
        }

        Element targetTable = findFdaSubmissionTable(primaryPmaDocument);
        if (targetTable == null) {
            log.warn("No information found for fda submission : {}", primaryPma);
            return supplements;
        }

        Element tbody = targetTable.select("tbody").first();
        for (Element tr : tbody.getElementsByTag("tr")) {
            Element th = tr.getElementsByTag("th").first();
            Element td = tr.getElementsByTag("td").first();
            if (th != null) {
                String header = th.text().trim();
                String content = td.text().trim();
                if (header.equalsIgnoreCase("Supplements:")) {
                    supplements.addAll(Arrays.asList(content.split("\\s")));
                }
            }
        }
        return supplements;
    }

    public Instant convertDateToInstant(String date) {
        return LocalDate.parse(date, DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US)).atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    /**
     * Checks whether the description contains any genes
     * @param description the fda submission description
     * @return true if the description mentions a gene
     */
    private Boolean isGenetic(String description) {
        Set<String> searchValues = Arrays
            .asList(description.replaceAll("[^\\w\\s-]", " ").split(" "))
            .stream()
            .map(val -> val.trim().toUpperCase())
            .collect(Collectors.toSet());
        return !geneService.findByHugoSymbolIn(searchValues).isEmpty();
    }
}

enum FdaSubmissionUrl {
    PMA("P", "cfpma/pma.cfm"),
    PMN("K", "cfpmn/pmn.cfm"),
    HDE("H", "cfhde/hde.cfm"),
    DEN("DEN", "cfpmn/denovo.cfm");

    String prefix;
    String urlSuffix;

    FdaSubmissionUrl(String prefix, String urlSuffix) {
        this.prefix = prefix;
        this.urlSuffix = urlSuffix;
    }

    public static String getFullUrl(String prefix, String idParam) {
        for (FdaSubmissionUrl fdaSubmissionUrl : FdaSubmissionUrl.values()) {
            if (fdaSubmissionUrl.prefix.equalsIgnoreCase(prefix)) {
                return "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/" + fdaSubmissionUrl.urlSuffix + "?id=" + idParam;
            }
        }
        return null;
    }
}
