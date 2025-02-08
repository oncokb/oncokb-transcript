package org.mskcc.oncokb.curation.util;

import static java.util.regex.Pattern.CASE_INSENSITIVE;
import static org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence.*;
import static org.mskcc.oncokb.curation.util.parser.ProteinChangeParser.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.*;
import org.mskcc.oncokb.curation.util.parser.ParsingStatus;
import org.springframework.stereotype.Component;

@Component
public class AlterationUtils {

    public static final String FUSION_SEPARATOR = "::";
    public static final String FUSION_ALTERNATIVE_SEPARATOR = "-";
    private static final String FUSION_REGEX = "\\s*(\\w*)" + FUSION_SEPARATOR + "(\\w*)\\s*(?i)(fusion)?\\s*";
    private static final String FUSION_ALT_REGEX = "\\s*(\\w*)" + FUSION_ALTERNATIVE_SEPARATOR + "(\\w*)\\s+(?i)fusion\\s*";

    private static final String EXON_ALT_REGEX = "(Any\\s+)?Exon\\s+(\\d+)(-(\\d+))?\\s+(Deletion|Insertion|Duplication)";

    private static final String EXON_ALTS_REGEX = "(" + EXON_ALT_REGEX + ")(\\s*\\+\\s*" + EXON_ALT_REGEX + ")*";

    private Alteration parseFusion(String alteration) {
        Alteration alt = new Alteration();

        Consequence consequence = new Consequence();
        consequence.setTerm(SVConsequence.SV_FUSION.name());
        alt.setType(AlterationType.STRUCTURAL_VARIANT);
        alt.setConsequence(consequence);

        if (alteration.contains(FUSION_SEPARATOR) || alteration.contains(FUSION_ALTERNATIVE_SEPARATOR)) {
            alt.setGenes(
                getGenesStrs(alteration)
                    .stream()
                    .map(hugoSymbol -> {
                        Gene gene = new Gene();
                        gene.setHugoSymbol(hugoSymbol);
                        return gene;
                    })
                    .collect(Collectors.toSet())
            );
            alt.setAlteration(alt.getGenes().stream().map(Gene::getHugoSymbol).collect(Collectors.joining("-")) + " Fusion");
        } else {
            alt.setAlteration(alteration.substring(0, 1).toUpperCase() + alteration.toLowerCase().substring(1));
        }
        alt.setName(alt.getAlteration());
        return alt;
    }

    private Alteration parseCopyNumberAlteration(String alteration) {
        CNAConsequence cnaTerm = CNAConsequence.CNA_UNKNOWN;

        Optional<CNAConsequence> cnaConsequenceOptional = getCNAConsequence(alteration);
        if (cnaConsequenceOptional.isPresent()) {
            cnaTerm = cnaConsequenceOptional.orElseThrow();
        }

        Alteration alt = new Alteration();
        Consequence consequence = new Consequence();
        consequence.setTerm(cnaTerm.name());
        alt.setType(AlterationType.COPY_NUMBER_ALTERATION);
        alt.setConsequence(consequence);

        alt.setAlteration(cnaTerm.name().substring(0, 1) + cnaTerm.name().toLowerCase().substring(1));
        alt.setName(alt.getAlteration());

        return alt;
    }

    private Alteration parseCodingDnaChange(String codingDnaChange) {
        Alteration alt = new Alteration();
        Consequence consequence = new Consequence();
        consequence.setTerm(UNKNOWN.name());
        alt.setType(AlterationType.CDNA_CHANGE);
        alt.setConsequence(consequence);
        alt.setAlteration(codingDnaChange);
        alt.setName(codingDnaChange);
        return alt;
    }

    private Alteration parseGenomicChange(String genomicChange) {
        Alteration alt = new Alteration();
        Consequence consequence = new Consequence();
        consequence.setTerm(UNKNOWN.name());
        alt.setType(AlterationType.GENOMIC_CHANGE);
        alt.setConsequence(consequence);
        alt.setAlteration(genomicChange);
        alt.setName(genomicChange);
        return alt;
    }

    private static ParsingStatus<Alteration> parseCategoricalAlterations(String proteinChange) {
        ParsingStatus<Alteration> parsedAlteration = new ParsingStatus<>();

        // truncating
        if (proteinChange.toLowerCase().matches("truncating mutations?")) {
            Alteration alteration = new Alteration();
            Consequence consequence = new Consequence();
            consequence.setTerm(FEATURE_TRUNCATION.name());
            alteration.setConsequence(consequence);
            alteration.setAlteration(proteinChange);
            alteration.setName(proteinChange);
            parsedAlteration.setEntity(alteration);
            parsedAlteration.setStatus(EntityStatusType.OK);
        }
        return parsedAlteration;
    }

    private static ParsingStatus<Alteration> parseProteinChangeWithStatus(String proteinChange, String excludedStr) {
        ParsingStatus<Alteration> parsedAlteration = parseProteinChangeThroughAllTypes(proteinChange, excludedStr);

        if (parsedAlteration.getEntity() != null) {
            Alteration alteration = parsedAlteration.getEntity();
            alteration.setType(AlterationType.PROTEIN_CHANGE);
            if (StringUtils.isEmpty(alteration.getAlteration())) {
                alteration.setAlteration(alteration.getProteinChange());
            }
            if (StringUtils.isEmpty(alteration.getName())) {
                alteration.setName(alteration.getProteinChange());
            }
            // Change the positional name
            if (isPositionedAlteration(alteration)) {
                if (StringUtils.isEmpty(excludedStr)) {
                    alteration.setName(alteration.getAlteration() + " Missense Mutations");
                } else {
                    alteration.setName(proteinChange + " Missense Mutations, excluding " + excludedStr);
                }
            }
            if (alteration.getConsequence() == null) {
                Consequence consequence = new Consequence();
                consequence.setTerm(MutationConsequence.UNKNOWN.name());
                alteration.setConsequence(consequence);
            }
        }
        return parsedAlteration;
    }

    private static ParsingStatus<Alteration> parseProteinChangeThroughAllTypes(String proteinChange, String excludedStr) {
        ParsingStatus<Alteration> parsedAlteration = new ParsingStatus<>();

        parsedAlteration = parseInframe(proteinChange);
        if (parsedAlteration.isParsed()) return parsedAlteration;

        parsedAlteration = parseSplice(proteinChange);
        if (parsedAlteration.isParsed()) return parsedAlteration;

        parsedAlteration = parseFrameshift(proteinChange);
        if (parsedAlteration.isParsed()) return parsedAlteration;

        parsedAlteration = parseExtension(proteinChange);
        if (parsedAlteration.isParsed()) return parsedAlteration;

        parsedAlteration = parseRange(proteinChange);
        if (parsedAlteration.isParsed()) return parsedAlteration;

        parsedAlteration = parseSynonymous(proteinChange);
        if (parsedAlteration.isParsed()) return parsedAlteration;

        return parseGeneral(proteinChange);
    }

    public static void parseProteinChange(EntityStatus<Alteration> alterationEntityStatus, String proteinChange) {
        if (proteinChange == null) {
            proteinChange = "";
        }

        if (proteinChange.startsWith("p.")) {
            proteinChange = proteinChange.substring(2);
        }

        if (proteinChange.indexOf("[") != -1) {
            proteinChange = proteinChange.substring(0, proteinChange.indexOf("["));
        }

        // we need to deal with the exclusion format so the protein change can properly be interpreted.
        String excludedStr = "";
        Matcher exclusionMatch = getExclusionCriteriaMatcher(proteinChange);
        if (exclusionMatch.matches()) {
            proteinChange = exclusionMatch.group(1);
            excludedStr = exclusionMatch.group(3).trim();
        }

        proteinChange = proteinChange.trim();

        ParsingStatus<Alteration> parsedAlteration;

        parsedAlteration = parseProteinChangeWithStatus(proteinChange, excludedStr);
        if (!parsedAlteration.isParsed()) parsedAlteration = parseCategoricalAlterations(proteinChange);

        if (!parsedAlteration.isParsed()) {
            Alteration alteration = new Alteration();
            alteration.setAlteration(proteinChange);
            alteration.setName(proteinChange);
            Consequence consequence = new Consequence();
            consequence.setTerm(UNKNOWN.name());
            alteration.setConsequence(consequence);
            parsedAlteration.setEntity(alteration);
            parsedAlteration.setStatus(EntityStatusType.OK);
        }
        alterationEntityStatus.setEntity(parsedAlteration.getEntity());
        alterationEntityStatus.setType(parsedAlteration.getStatus());
        alterationEntityStatus.setMessage(parsedAlteration.getMessage());
    }

    private Alteration parseExonAlteration(String alteration) {
        Alteration alt = new Alteration();
        Consequence consequence = new Consequence();
        consequence.setTerm(SVConsequence.SV_UNKNOWN.name());
        alt.setType(AlterationType.STRUCTURAL_VARIANT);
        alt.setConsequence(consequence);

        Pattern pattern = Pattern.compile(EXON_ALT_REGEX, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(alteration);
        List<String> splitResults = new ArrayList<>();
        Map<SVConsequence, Set<String>> exonsByConsequence = new HashMap<>();
        exonsByConsequence.put(SVConsequence.SV_INSERTION, new HashSet<>());
        exonsByConsequence.put(SVConsequence.SV_DELETION, new HashSet<>());
        exonsByConsequence.put(SVConsequence.SV_DUPLICATION, new HashSet<>());

        List<String> anyExonAlterations = new ArrayList<>();
        while (matcher.find()) {
            Boolean isAnyExon = false;
            if (matcher.group(1) != null) {
                // We use "Any" to denote all possible combinations of exons
                isAnyExon = "Any".equals(matcher.group(1).trim());
            }
            String startExonStr = matcher.group(2); // The start exon number
            String endExonStr = matcher.group(4); // The end exon number (if present)
            String consequenceTerm = matcher.group(5); // consequence term
            SVConsequence svConsequence = SVConsequence.SV_UNKNOWN;
            switch (consequenceTerm.toLowerCase()) {
                case "insertion":
                    svConsequence = SVConsequence.SV_INSERTION;
                    consequence.setTerm(SVConsequence.SV_INSERTION.name());
                    break;
                case "duplication":
                    svConsequence = SVConsequence.SV_DUPLICATION;
                    consequence.setTerm(SVConsequence.SV_DUPLICATION.name());
                    break;
                case "deletion":
                    svConsequence = SVConsequence.SV_DELETION;
                    consequence.setTerm(SVConsequence.SV_DELETION.name());
                    break;
                default:
                    break;
            }

            if (isAnyExon) {
                String normalizedAnyExonName = buildExonName(
                    Integer.parseInt(startExonStr),
                    Integer.parseInt(endExonStr),
                    consequenceTerm,
                    true
                );
                splitResults.add(normalizedAnyExonName);
                anyExonAlterations.add(normalizedAnyExonName);
                continue;
            }

            int startExon = Integer.parseInt(startExonStr);
            int endExon = (endExonStr != null) ? Integer.parseInt(endExonStr) : startExon;

            for (int exon = startExon; exon <= endExon; exon++) {
                String exonAlteration = "Exon " + exon + " " + consequenceTerm;
                splitResults.add(exonAlteration);
                exonsByConsequence.get(svConsequence).add(exonAlteration);
            }
        }

        alt.setAlteration(splitResults.stream().collect(Collectors.joining(" + ")));

        List<String> formattedNameByConsequence = new ArrayList<>();
        for (SVConsequence consequenceKey : new SVConsequence[] {
            SVConsequence.SV_DELETION,
            SVConsequence.SV_INSERTION,
            SVConsequence.SV_DUPLICATION,
        }) {
            List<String> sortedExonAlterations = new ArrayList<>(exonsByConsequence.get(consequenceKey));
            sortedExonAlterations.sort(Comparator.comparingInt(exon -> Integer.parseInt(exon.split(" ")[1])));
            String consequenceTerm = consequenceKey.getName();

            List<String> result = new ArrayList<>();
            int start = -1;
            int end = -1;

            for (int i = 0; i < sortedExonAlterations.size(); i++) {
                String exon = sortedExonAlterations.get(i);
                int exonNumber = Integer.parseInt(exon.split(" ")[1]);

                if (start == -1) {
                    start = exonNumber;
                    end = exonNumber;
                } else if (exonNumber == end + 1) {
                    end = exonNumber;
                } else {
                    result.add(buildExonName(start, end, consequenceTerm, false));
                    start = exonNumber;
                    end = exonNumber;
                }
            }
            if (start != -1) {
                result.add(buildExonName(start, end, consequenceTerm, false));
            }
            if (!result.isEmpty()) {
                formattedNameByConsequence.add(result.stream().collect(Collectors.joining(" + ")));
            }
        }
        formattedNameByConsequence.addAll(anyExonAlterations);
        alt.setName(formattedNameByConsequence.stream().collect(Collectors.joining(" + ")));

        return alt;
    }

    private String buildExonName(int start, int end, String consequenceTerm, Boolean isAny) {
        StringBuilder nameBuilder = new StringBuilder();
        if (isAny) {
            nameBuilder.append("Any ");
        }
        nameBuilder.append("Exon ");
        String range = "";
        if (start == end) {
            range = Integer.toString(start);
        } else {
            range = Integer.toString(start) + "-" + Integer.toString(end);
        }
        nameBuilder.append(range);
        nameBuilder.append(" ");
        nameBuilder.append(consequenceTerm);
        return nameBuilder.toString();
    }

    public EntityStatus<Alteration> parseAlteration(String alteration) {
        EntityStatus<Alteration> entityWithStatus = new EntityStatus<>();
        String message = "";
        EntityStatusType status = EntityStatusType.OK;

        if (StringUtils.isEmpty(alteration)) {
            return null;
        }
        if (isFusion(alteration)) {
            Alteration alt = parseFusion(alteration);
            entityWithStatus.setEntity(alt);
            entityWithStatus.setType(status);
            entityWithStatus.setMessage(message);
            return entityWithStatus;
        }

        if (isCopyNumberAlteration(alteration)) {
            Alteration alt = parseCopyNumberAlteration(alteration);
            entityWithStatus.setEntity(alt);
            entityWithStatus.setType(status);
            entityWithStatus.setMessage(message);
            return entityWithStatus;
        }

        if (alteration.startsWith("c.")) {
            Alteration alt = parseCodingDnaChange(alteration);
            entityWithStatus.setEntity(alt);
            entityWithStatus.setType(status);
            entityWithStatus.setMessage(message);
            return entityWithStatus;
        }

        if (isGenomicChange(alteration)) {
            Alteration alt = parseGenomicChange(alteration);
            entityWithStatus.setEntity(alt);
            entityWithStatus.setType(status);
            entityWithStatus.setMessage(message);
            return entityWithStatus;
        }

        if (isExon(alteration)) {
            Alteration alt = parseExonAlteration(alteration);
            entityWithStatus.setEntity(alt);
            entityWithStatus.setType(status);
            entityWithStatus.setMessage(message);
            return entityWithStatus;
        }

        parseProteinChange(entityWithStatus, alteration);

        return entityWithStatus;
    }

    public List<String> getGenesStrs(String alteration) {
        if (StringUtils.isNotEmpty(alteration)) {
            List<String> genes = new ArrayList<>();
            Pattern p = Pattern.compile(FUSION_REGEX);
            Matcher m = p.matcher(alteration);
            if (m.matches()) {
                genes.add(m.group(1));
                genes.add(m.group(2));
            } else {
                p = Pattern.compile(FUSION_ALT_REGEX);
                m = p.matcher(alteration);
                if (m.matches()) {
                    genes.add(m.group(1));
                    genes.add(m.group(2));
                }
            }
            return genes;
        }
        return new ArrayList<>();
    }

    public static boolean isPositionedAlteration(Alteration alteration) {
        boolean isPositionVariant = false;
        if (
            alteration != null &&
            alteration.getStart() != null &&
            alteration.getEnd() != null &&
            alteration.getStart().equals(alteration.getEnd()) &&
            alteration.getRefResidues() != null &&
            alteration.getRefResidues().length() == 1 &&
            alteration.getVariantResidues() == null &&
            alteration.getConsequence() != null &&
            (alteration.getConsequence().getTerm().equals(NA.name()) ||
                alteration.getConsequence().getTerm().equals(MISSENSE_VARIANT.name()))
        ) isPositionVariant = true;
        return isPositionVariant;
    }

    private static Matcher getExclusionCriteriaMatcher(String proteinChange) {
        Pattern exclusionPatter = Pattern.compile("(.*)\\{\\s*(exclude|excluding)(.*)\\}", CASE_INSENSITIVE);
        Matcher exclusionMatch = exclusionPatter.matcher(proteinChange);
        return exclusionMatch;
    }

    public static boolean hasExclusionCriteria(String proteinChange) {
        Matcher exclusionMatch = getExclusionCriteriaMatcher(proteinChange);
        return exclusionMatch.matches();
    }

    public static Boolean isFusion(String variant) {
        if (StringUtils.isEmpty(variant)) {
            return false;
        }
        if (variant != null && (Pattern.matches(FUSION_REGEX, variant) || Pattern.matches(FUSION_ALT_REGEX, variant))) {
            return true;
        }
        if (variant.equalsIgnoreCase("fusions")) {
            return true;
        }
        if (variant.equalsIgnoreCase("fusion")) {
            return true;
        }
        return false;
    }

    public static Optional<CNAConsequence> getCNAConsequence(String alteration) {
        return Arrays.stream(CNAConsequence.values()).filter(cna -> cna.name().equals(alteration.toUpperCase())).findFirst();
    }

    public static Boolean isCopyNumberAlteration(String alteration) {
        String cnaUpperCase = alteration.toUpperCase();
        return getCNAConsequence(cnaUpperCase).isPresent();
    }

    public static Boolean isGenomicChange(String alteration) {
        Pattern p = Pattern.compile("(([0-9]{1,2}|X|Y|MT):)?g\\..*");
        Matcher m = p.matcher(alteration);
        return m.matches();
    }

    public static Boolean isExon(String alteration) {
        Pattern p = Pattern.compile(EXON_ALTS_REGEX, Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(alteration);
        return m.matches();
    }

    public static Boolean isAnyExon(String alteration) {
        Pattern p = Pattern.compile(EXON_ALT_REGEX, Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(alteration);
        if (m.find()) {
            if (m.group(1) == null) {
                return false;
            }
            return "Any".equals(m.group(1).trim());
        }
        return false;
    }

    public static String removeExclusionCriteria(String proteinChange) {
        Matcher exclusionMatch = getExclusionCriteriaMatcher(proteinChange);
        if (exclusionMatch.matches()) {
            proteinChange = exclusionMatch.group(1).trim();
        }
        return proteinChange;
    }
}
