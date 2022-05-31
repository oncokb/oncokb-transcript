package org.mskcc.oncokb.curation.util;

import static org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.*;
import org.springframework.stereotype.Component;

@Component
public class AlterationUtils {

    public static final String FUSION_SEPARATOR = "::";
    public static final String FUSION_ALTERNATIVE_SEPARATOR = "-";
    private static final String FUSION_REGEX = "\\s*(\\w*)" + FUSION_SEPARATOR + "(\\w*)\\s*(?i)(fusion)?\\s*";
    private static final String FUSION_ALT_REGEX = "\\s*(\\w*)" + FUSION_ALTERNATIVE_SEPARATOR + "(\\w*)\\s+(?i)fusion\\s*";

    private Alteration parseFusionProteinChange(String proteinChange) {
        Alteration alteration = new Alteration();

        Consequence consequence = new Consequence();
        consequence.setTerm(SVConsequence.FUSION.name());
        consequence.setType(AlterationType.STRUCTURAL_VARIANT);
        alteration.setConsequence(consequence);

        if (proteinChange.contains(FUSION_SEPARATOR) || proteinChange.contains(FUSION_ALTERNATIVE_SEPARATOR)) {
            alteration.setGenes(
                getGenesStrs(proteinChange)
                    .stream()
                    .map(hugoSymbol -> {
                        Gene gene = new Gene();
                        gene.setHugoSymbol(hugoSymbol);
                        return gene;
                    })
                    .collect(Collectors.toSet())
            );
        } else {
            alteration.setAlteration(proteinChange.substring(0, 1).toUpperCase() + proteinChange.toLowerCase().substring(1));
        }
        return alteration;
    }

    private Alteration parseCnaProteinChange(String proteinChange) {
        CNAConsequence cnaTerm = CNAConsequence.UNKNOWN;

        Optional<CNAConsequence> cnaConsequenceOptional = getCNAConsequence(proteinChange);
        if (cnaConsequenceOptional.isPresent()) {
            cnaTerm = cnaConsequenceOptional.get();
        }

        Alteration alteration = new Alteration();
        Consequence consequence = new Consequence();
        consequence.setTerm(cnaTerm.name());
        consequence.setType(AlterationType.COPY_NUMBER_ALTERATION);
        alteration.setConsequence(consequence);

        alteration.setAlteration(cnaTerm.name().substring(0, 1) + cnaTerm.name().toLowerCase().substring(1));

        return alteration;
    }

    public Alteration parseProteinChange(String proteinChange) {
        if (isFusion(proteinChange)) {
            return parseFusionProteinChange(proteinChange);
        }

        if (isCopyNumberAlteration(proteinChange)) {
            return parseCnaProteinChange(proteinChange);
        }

        MutationConsequence term = UNKNOWN;
        String ref = null;
        String var = null;
        Integer start = null;
        Integer end = null;

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

        Pattern p = Pattern.compile("^([A-Z\\*]+)([0-9]+)([A-Z\\*\\?]*)$");
        Matcher m = p.matcher(proteinChange);
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
                    term = NA;
                }
            }
        } else {
            p = Pattern.compile("([A-Z]?)([0-9]+)(_[A-Z]?([0-9]+))?(delins|ins|del)([A-Z0-9]+)");
            m = p.matcher(proteinChange);
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
                p = Pattern.compile("[A-Z]?([0-9]+)(_[A-Z]?([0-9]+))?(_)?splice");
                m = p.matcher(proteinChange);
                if (m.matches()) {
                    start = Integer.valueOf(m.group(1));
                    if (m.group(3) != null) {
                        end = Integer.valueOf(m.group(3));
                    } else {
                        end = start;
                    }
                    term = SPLICE_REGION_VARIANT;
                } else {
                    p = Pattern.compile("[A-Z]?([0-9]+)_[A-Z]?([0-9]+)(.+)");
                    m = p.matcher(proteinChange);
                    if (m.matches()) {
                        start = Integer.valueOf(m.group(1));
                        end = Integer.valueOf(m.group(2));
                        String v = m.group(3);
                        switch (v) {
                            case "mis":
                                term = MISSENSE_VARIANT;
                                break;
                            case "ins":
                                term = INFRAME_INSERTION;
                                break;
                            case "del":
                                term = INFRAME_DELETION;
                                break;
                            case "fs":
                                term = FEATURE_TRUNCATION;
                                break;
                            case "trunc":
                                term = FEATURE_TRUNCATION;
                                break;
                            case "dup":
                                term = INFRAME_INSERTION;
                                break;
                            case "mut":
                                term = ANY;
                        }
                    } else {
                        p = Pattern.compile("([A-Z\\*])([0-9]+)[A-Z]?fs.*");
                        m = p.matcher(proteinChange);
                        if (m.matches()) {
                            ref = m.group(1);
                            start = Integer.valueOf(m.group(2));
                            end = start;

                            term = FRAMESHIFT_VARIANT;
                        } else {
                            p = Pattern.compile("([A-Z]+)?([0-9]+)((ins)|(del)|(dup))");
                            m = p.matcher(proteinChange);
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
                                m = p.matcher(proteinChange);
                                if (m.matches()) {
                                    ref = m.group(1);
                                    start = Integer.valueOf(m.group(2));
                                    end = start;
                                    term = STOP_LOST;
                                } else {
                                    p = Pattern.compile("([A-Z\\*])?([0-9]+)=");
                                    m = p.matcher(proteinChange);
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
                                        m = p.matcher(proteinChange);
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
        if (proteinChange.toLowerCase().matches("truncating mutations?")) {
            term = FEATURE_TRUNCATION;
        }

        Alteration alteration = new Alteration();
        alteration.setRefResidues(ref);
        alteration.setVariantResidues(var);
        alteration.setProteinStart(start);
        alteration.setProteinEnd(end);
        alteration.setAlteration(proteinChange);

        Consequence consequence = new Consequence();
        consequence.setTerm(Optional.ofNullable(term).orElse(MutationConsequence.UNKNOWN).name());
        consequence.setType(AlterationType.MUTATION);
        alteration.setConsequence(consequence);

        // Change the positional name
        if (isPositionedAlteration(alteration)) {
            if (StringUtils.isEmpty(excludedStr)) {
                alteration.setName(alteration.getAlteration() + " Missense Mutations");
            } else {
                alteration.setName(proteinChange + " Missense Mutations, excluding " + excludedStr);
            }
        } else {
            alteration.setName(proteinChange);
        }
        return alteration;
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
            alteration.getProteinStart() != null &&
            alteration.getProteinEnd() != null &&
            alteration.getProteinStart().equals(alteration.getProteinEnd()) &&
            alteration.getRefResidues() != null &&
            alteration.getRefResidues().length() == 1 &&
            alteration.getVariantResidues() == null &&
            alteration.getConsequence() != null &&
            (
                alteration.getConsequence().getTerm().equals(NA.name()) ||
                alteration.getConsequence().getTerm().equals(MISSENSE_VARIANT.name())
            )
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
}
