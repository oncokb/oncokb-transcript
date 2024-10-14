package org.mskcc.oncokb.curation.util;

import static java.util.regex.Pattern.CASE_INSENSITIVE;
import static org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence.*;
import static org.mskcc.oncokb.curation.util.parser.ProteinChangeParser.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
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

    private Alteration parseFusion(String alteration) {
        Alteration alt = new Alteration();

        Consequence consequence = new Consequence();
        consequence.setTerm(SVConsequence.FUSION.name());
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
        CNAConsequence cnaTerm = CNAConsequence.UNKNOWN;

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

    public static String removeExclusionCriteria(String proteinChange) {
        Matcher exclusionMatch = getExclusionCriteriaMatcher(proteinChange);
        if (exclusionMatch.matches()) {
            proteinChange = exclusionMatch.group(1).trim();
        }
        return proteinChange;
    }
}
