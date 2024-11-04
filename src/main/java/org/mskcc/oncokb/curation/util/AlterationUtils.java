package org.mskcc.oncokb.curation.util;

import static org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.*;
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
                splitResults.add(alteration);
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

        StringBuilder formattedName = new StringBuilder();
        for (SVConsequence consequenceKey : new SVConsequence[] {
            SVConsequence.SV_INSERTION,
            SVConsequence.SV_DELETION,
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
                    if (start == end) {
                        result.add("Exon " + start + " " + consequenceTerm);
                    } else {
                        result.add("Exon " + start + "-" + end + " " + consequenceTerm);
                    }
                    start = exonNumber;
                    end = exonNumber;
                }
            }
            if (start != -1) {
                if (start == end) {
                    result.add("Exon " + start + " " + consequenceTerm);
                } else {
                    result.add("Exon " + start + "-" + end + " " + consequenceTerm);
                }
            }
            formattedName.append(result.stream().collect(Collectors.joining(" + ")));
        }
        alt.setName(formattedName.toString());

        return alt;
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

        // the following is to parse the alteration as protein change
        MutationConsequence term = UNKNOWN;
        String ref = null;
        String var = null;
        Integer start = null;
        Integer end = null;

        if (alteration == null) {
            alteration = "";
        }

        if (alteration.startsWith("p.")) {
            alteration = alteration.substring(2);
        }

        if (alteration.indexOf("[") != -1) {
            alteration = alteration.substring(0, alteration.indexOf("["));
        }

        String altStr = alteration;

        // we need to deal with the exclusion format so the protein change can properly be interpreted.
        String excludedStr = "";
        Matcher exclusionMatch = getExclusionCriteriaMatcher(alteration);
        if (exclusionMatch.matches()) {
            alteration = exclusionMatch.group(1);
            excludedStr = exclusionMatch.group(3).trim();
        }

        alteration = alteration.trim();

        Pattern p = Pattern.compile("^([A-Z\\*]+)([0-9]+)([A-Z\\*\\?]*)$");
        Matcher m = p.matcher(alteration);
        if (m.matches()) {
            ref = m.group(1);
            start = Integer.valueOf(m.group(2));
            end = start;
            var = m.group(3);

            Integer refL = ref.length();
            Integer varL = var.length();

            if (ref.equals("*")) {
                term = STOP_LOST;
            } else if (var.equals("*")) {
                term = STOP_GAINED;
            } else if (ref.equals(var)) {
                term = SYNONYMOUS_VARIANT;
            } else if (start == 1) {
                term = START_LOST;
            } else if (var.equals("?")) {
                term = ANY;
            } else {
                end = start + refL - 1;
                if (refL > 1 || varL > 1) {
                    // Handle in-frame insertion/deletion event. Exp: IK744K
                    if (refL > varL) {
                        term = INFRAME_DELETION;
                    } else if (refL < varL) {
                        term = INFRAME_INSERTION;
                    } else {
                        term = MISSENSE_VARIANT;
                    }
                } else if (refL == 1 && varL == 1) {
                    term = MISSENSE_VARIANT;
                } else {
                    status = EntityStatusType.WARNING;
                    message = "Unable to determine consequence";
                    term = NA;
                }
            }
        } else {
            p = Pattern.compile("([A-Z]?)([0-9]+)(_[A-Z]?([0-9]+))?(delins|ins|del)([A-Z0-9]+)");
            m = p.matcher(alteration);
            if (m.matches()) {
                if (m.group(1) != null && m.group(3) == null) {
                    // we only want to specify reference when it's one position ins/del
                    ref = m.group(1);
                }
                start = Integer.valueOf(m.group(2));
                if (m.group(4) != null) {
                    end = Integer.valueOf(m.group(4));
                } else {
                    end = start;
                }
                String type = m.group(5);
                if (type.equals("ins")) {
                    term = INFRAME_INSERTION;
                } else if (type.equals("del")) {
                    term = INFRAME_DELETION;
                } else {
                    Integer deletion = end - start + 1;
                    Integer insertion = m.group(6).length();

                    if (insertion - deletion > 0) {
                        term = INFRAME_INSERTION;
                    } else if (insertion - deletion == 0) {
                        term = MISSENSE_VARIANT;
                    } else {
                        term = INFRAME_DELETION;
                    }
                }
            } else {
                p = Pattern.compile("([A-Z]?)([0-9]+)(_[A-Z]?([0-9]+))?(_)?splice");
                m = p.matcher(alteration);
                if (m.matches()) {
                    if (m.group(1) != null && m.group(3) == null) {
                        // we only want to specify reference when it's one position splice
                        ref = m.group(1);
                    }
                    start = Integer.valueOf(m.group(2));
                    if (m.group(4) != null) {
                        end = Integer.valueOf(m.group(4));
                    } else {
                        end = start;
                    }
                    term = SPLICE_REGION_VARIANT;
                } else {
                    p = Pattern.compile("([A-Z]?)([0-9]+)_([A-Z]?)([0-9]+)(.+)");
                    m = p.matcher(alteration);
                    if (m.matches()) {
                        start = Integer.valueOf(m.group(2));
                        end = Integer.valueOf(m.group(4));
                        String v = m.group(5);

                        HashMap<String, MutationConsequence> termsToCheck = new HashMap<>();
                        termsToCheck.put("mis", MISSENSE_VARIANT);
                        termsToCheck.put("ins", INFRAME_INSERTION);
                        termsToCheck.put("del", INFRAME_DELETION);
                        termsToCheck.put("fs", FEATURE_TRUNCATION);
                        termsToCheck.put("trunc", FEATURE_TRUNCATION);
                        termsToCheck.put("dup", INFRAME_INSERTION);
                        termsToCheck.put("mut", ANY);

                        MutationConsequence consequence = termsToCheck.get(v);
                        if (consequence != null) {
                            term = consequence;
                        } else {
                            Double greatestSimilarity = -1.0;
                            String termWithGreatestSimilarity = "";
                            JaroWinklerSimilarity jw = new JaroWinklerSimilarity();
                            for (Map.Entry<String, MutationConsequence> entry : termsToCheck.entrySet()) {
                                double similarity = jw.apply(v, entry.getKey());
                                if (similarity > greatestSimilarity) {
                                    greatestSimilarity = similarity;
                                    termWithGreatestSimilarity = entry.getKey();
                                }
                            }
                            status = EntityStatusType.ERROR;
                            message = "The alteration name is invalid, do you mean " +
                            m.group(1) +
                            m.group(2) +
                            "_" +
                            m.group(3) +
                            m.group(4) +
                            termWithGreatestSimilarity +
                            "?";
                        }
                    } else {
                        p = Pattern.compile("([A-Z\\*])([0-9]+)[A-Z]?fs.*");
                        m = p.matcher(alteration);
                        if (m.matches()) {
                            ref = m.group(1);
                            start = Integer.valueOf(m.group(2));
                            end = start;

                            term = FRAMESHIFT_VARIANT;
                        } else {
                            p = Pattern.compile("([A-Z]+)?([0-9]+)([A-Za-z]]+)");
                            m = p.matcher(alteration);
                            if (m.matches()) {
                                ref = m.group(1);
                                start = Integer.valueOf(m.group(2));
                                end = start;
                                String v = m.group(3);
                                switch (v) {
                                    case "ins":
                                    case "dup":
                                        term = INFRAME_INSERTION;
                                        break;
                                    case "del":
                                        term = INFRAME_DELETION;
                                        break;
                                }
                            } else {
                                /**
                                 * support extension variant (https://varnomen.hgvs.org/recommendations/protein/variant/extension/)
                                 * the following examples are supported
                                 * *959Qext*14
                                 * *110Gext*17
                                 * *315TextALGT*
                                 * *327Aext*?
                                 */
                                p = Pattern.compile("(\\*)([0-9]+)[A-Z]ext([A-Z]+)?\\*([0-9]+)?(\\?)?");
                                m = p.matcher(alteration);
                                if (m.matches()) {
                                    ref = m.group(1);
                                    start = Integer.valueOf(m.group(2));
                                    end = start;
                                    term = STOP_LOST;
                                } else {
                                    p = Pattern.compile("([A-Z\\*])?([0-9]+)=");
                                    m = p.matcher(alteration);
                                    if (m.matches()) {
                                        var = ref = m.group(1);
                                        start = Integer.valueOf(m.group(2));
                                        end = start;
                                        if (ref.equals("*")) {
                                            term = STOP_RETAINED_VARIANT;
                                        } else {
                                            term = SYNONYMOUS_VARIANT;
                                        }
                                    } else {
                                        p = Pattern.compile("([0-9]+)");
                                        m = p.matcher(alteration);
                                        if (m.matches()) {
                                            start = Integer.valueOf(m.group(1));
                                            end = start;
                                            term = UNKNOWN;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // truncating
        if (alteration.toLowerCase().matches("truncating mutations?")) {
            term = FEATURE_TRUNCATION;
        }

        Alteration alt = new Alteration();
        alt.setType(AlterationType.PROTEIN_CHANGE);
        alt.setRefResidues(ref);
        alt.setVariantResidues(var);
        alt.setStart(start);
        alt.setEnd(end);
        alt.setAlteration(altStr);
        alt.setProteinChange(alteration);

        Consequence consequence = new Consequence();
        consequence.setTerm(Optional.ofNullable(term).orElse(MutationConsequence.UNKNOWN).name());
        alt.setConsequence(consequence);

        // Change the positional name
        if (isPositionedAlteration(alt)) {
            if (StringUtils.isEmpty(excludedStr)) {
                alt.setName(alt.getAlteration() + " Missense Mutations");
            } else {
                alt.setName(alteration + " Missense Mutations, excluding " + excludedStr);
            }
        } else {
            alt.setName(alteration);
        }

        entityWithStatus.setEntity(alt);
        entityWithStatus.setType(status);
        entityWithStatus.setMessage(message);
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
        Pattern exclusionPatter = Pattern.compile("(.*)\\{\\s*(exclude|excluding)(.*)\\}", Pattern.CASE_INSENSITIVE);
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
