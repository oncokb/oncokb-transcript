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
    public static final String FUSION_UNDERSCORE_SEPARATOR = "_";
    // A hugo symbol can contain a hyphen itself, ie NKX2-1, so the gene partners are only bounded by the separator
    // and the surrounding whitespace
    private static final String FUSION_REGEX = "\\s*([^\\s:]+)\\s*" + FUSION_SEPARATOR + "\\s*([^\\s:]+)\\s*(?i)(fusion)?\\s*";
    // A fusion named with a hyphen or an underscore instead of the double colon separator. Neither can be read on
    // its own, a hyphen because a hugo symbol contains one itself and an underscore because a protein change uses
    // one for a position range, so the fusion keyword is required and the gene partners are never split apart.
    private static final Pattern FUSION_MISSING_SEPARATOR_PATTERN = Pattern.compile(
        "\\s*([a-zA-Z0-9]+(?:[" + FUSION_ALTERNATIVE_SEPARATOR + FUSION_UNDERSCORE_SEPARATOR + "][a-zA-Z0-9]+)+)\\s+fusion\\s*",
        CASE_INSENSITIVE
    );
    // The deleted sequence is matched lazily so an insertion, if any, is captured by the ins group instead of being swallowed
    private static final Pattern CDNA_DEL_SEQ = Pattern.compile("(c\\.[0-9+\\-*_]+del)[a-z0-9]*?(ins[a-z0-9]+)?$", CASE_INSENSITIVE);
    private static final Pattern CDNA_DUP_SEQ = Pattern.compile("(c\\.[0-9+\\-*_]+dup)\\w+$", CASE_INSENSITIVE);

    private Alteration parseFusion(String alteration) {
        Alteration alt = new Alteration();

        Consequence consequence = new Consequence();
        consequence.setTerm(SVConsequence.FUSION.name());
        alt.setType(AlterationType.STRUCTURAL_VARIANT);
        alt.setConsequence(consequence);

        List<String> genePartners = getGenesStrs(alteration);
        if (genePartners.size() == 2) {
            // the gene partner order is meaningful, so it is preserved instead of being collected into a HashSet
            alt.setGenes(
                genePartners
                    .stream()
                    .map(hugoSymbol -> {
                        Gene gene = new Gene();
                        gene.setHugoSymbol(hugoSymbol);
                        return gene;
                    })
                    .collect(Collectors.toCollection(LinkedHashSet::new))
            );
            // fusions are always named using the double colon separator and a capitalized Fusion keyword
            alt.setAlteration(String.join(FUSION_SEPARATOR, genePartners) + " Fusion");
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

    private String normalizeCodingDnaChange(String codingDnaChange) {
        Matcher m = CDNA_DEL_SEQ.matcher(codingDnaChange);
        if (m.matches()) {
            String ins = m.group(2);
            return m.group(1) + (ins != null ? ins : "");
        }
        Matcher dupMatcher = CDNA_DUP_SEQ.matcher(codingDnaChange);
        if (dupMatcher.matches()) {
            return dupMatcher.group(1);
        }
        return codingDnaChange;
    }

    private Alteration parseCodingDnaChange(String codingDnaChange) {
        Alteration alt = new Alteration();
        Consequence consequence = new Consequence();
        consequence.setTerm(UNKNOWN.name());
        alt.setType(AlterationType.CDNA_CHANGE);
        alt.setConsequence(consequence);
        String normalized = normalizeCodingDnaChange(codingDnaChange);
        alt.setAlteration(normalized);
        alt.setName(normalized);
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
        if (isFusionMissingDoubleColon(alteration)) {
            Alteration alt = new Alteration();
            alt.setAlteration(alteration);
            alt.setName(alteration);
            Consequence consequence = new Consequence();
            consequence.setTerm(SVConsequence.FUSION.name());
            alt.setConsequence(consequence);
            entityWithStatus.setEntity(alt);
            entityWithStatus.setType(EntityStatusType.ERROR);
            entityWithStatus.setMessage(getFusionSeparatorErrorMessage(alteration));
            return entityWithStatus;
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
            if (!alteration.equals(alt.getAlteration())) {
                entityWithStatus.setType(EntityStatusType.WARNING);
                entityWithStatus.setMessage("Normalized from '" + alteration + "' to '" + alt.getAlteration() + "'");
            } else {
                entityWithStatus.setType(status);
                entityWithStatus.setMessage(message);
            }
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

    /**
     * The two gene partners of a fusion, in the order they were entered, ie BCR::ABL1 Fusion is BCR and ABL1. An
     * alteration that is not a two gene partner fusion has none.
     */
    public List<String> getGenesStrs(String alteration) {
        if (StringUtils.isEmpty(alteration)) {
            return new ArrayList<>();
        }
        Matcher m = Pattern.compile(FUSION_REGEX).matcher(alteration);
        if (m.matches()) {
            return List.of(m.group(1), m.group(2));
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

    /**
     * Whether a fusion names its gene partners with a separator other than {@value #FUSION_SEPARATOR}. Only a fusion
     * that names two gene partners can be spelled with a separator, ie the categorical Fusions has nothing to
     * separate and is not reported.
     */
    public static boolean isFusionMissingDoubleColon(String variant) {
        return !StringUtils.isEmpty(variant) && FUSION_MISSING_SEPARATOR_PATTERN.matcher(variant).matches();
    }

    /**
     * Tells the curator to use {@value #FUSION_SEPARATOR}, spelling the fusion out for them when the gene partners
     * can only be read one way. A partner section with more than one hyphen cannot be split, ie NKX2-1-BRAF Fusion
     * is either NKX2 and 1-BRAF or NKX2-1 and BRAF, so no suggestion is offered there.
     */
    private static String getFusionSeparatorErrorMessage(String variant) {
        String message =
            "A fusion has to be named with \"" +
            FUSION_SEPARATOR +
            "\" between the two gene partners, because a hyphen and an underscore are both ambiguous.";
        Matcher m = FUSION_MISSING_SEPARATOR_PATTERN.matcher(variant);
        if (m.matches()) {
            String[] sections = m.group(1).split("[" + FUSION_ALTERNATIVE_SEPARATOR + FUSION_UNDERSCORE_SEPARATOR + "]");
            if (sections.length == 2) {
                message += " Do you mean " + String.join(FUSION_SEPARATOR, sections) + " Fusion?";
            }
        }
        return message;
    }

    public static Boolean isFusion(String variant) {
        if (StringUtils.isEmpty(variant)) {
            return false;
        }
        if (Pattern.matches(FUSION_REGEX, variant)) {
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
