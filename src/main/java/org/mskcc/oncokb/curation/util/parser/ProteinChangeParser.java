package org.mskcc.oncokb.curation.util.parser;

import static java.util.regex.Pattern.CASE_INSENSITIVE;
import static org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence.*;
import static org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence.INFRAME_DELETION;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.enumeration.EntityStatusType;
import org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence;

public class ProteinChangeParser {

    /**
     * support extension variant (https://varnomen.hgvs.org/recommendations/protein/variant/extension/)
     * the following examples are supported
     * *959Qext*14
     * *110Gext*17
     * *315TextALGT*
     * *327Aext*?
     */
    public static ParsingStatus<Alteration> parseExtension(String proteinChange) {
        ParsingStatus<Alteration> parsingStatus = new ParsingStatus<>();
        Alteration alteration = new Alteration();

        Pattern p = Pattern.compile("M?1ext(-[0-9]+)?", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(proteinChange);
        if (m.matches()) {
            alteration.setStart(1);
            alteration.setEnd(1);
            Consequence consequence = new Consequence();
            consequence.setTerm(INFRAME_INSERTION.name());
            alteration.setConsequence(consequence);
            parsingStatus.setStatus(EntityStatusType.OK);
        } else {
            p = Pattern.compile("(\\*)?([0-9]+)([A-Z])?ext([A-Z]+)?\\*(([0-9]+)?(\\?)?)", CASE_INSENSITIVE);
            m = p.matcher(proteinChange);
            if (m.matches()) {
                String revisedProteinChange = "";

                alteration.setRefResidues(Optional.ofNullable(m.group(1)).orElse("*"));
                alteration.setStart(Integer.valueOf(m.group(2)));
                alteration.setEnd(alteration.getStart());
                String var = Optional.ofNullable(m.group(3)).orElse("").toUpperCase();
                revisedProteinChange = alteration.getRefResidues() + alteration.getStart() + var + "ext";
                if (m.group(4) != null) {
                    revisedProteinChange += m.group(4).toUpperCase();
                }
                revisedProteinChange += "*";
                if (m.group(5) != null) {
                    revisedProteinChange += m.group(5);
                }
                Consequence consequence = new Consequence();
                consequence.setTerm(STOP_LOST.name());
                alteration.setConsequence(consequence);
                alteration.setProteinChange(StringUtils.isEmpty(revisedProteinChange) ? proteinChange : revisedProteinChange);
                parsingStatus.setStatus(EntityStatusType.OK);
            }
        }
        parsingStatus.setEntity(alteration);
        return parsingStatus;
    }

    public static ParsingStatus<Alteration> parseGeneral(String proteinChange) {
        Pattern p = Pattern.compile("^([A-Z\\*]+)?([0-9]+)([A-Z\\*\\?]*)$", CASE_INSENSITIVE);
        Matcher m = p.matcher(proteinChange);
        ParsingStatus<Alteration> parsingStatus = new ParsingStatus<>();
        if (m.matches()) {
            Alteration alteration = new Alteration();
            String revisedProteinChange = "";
            MutationConsequence term = null;

            String ref = Optional.ofNullable(m.group(1)).orElse("").toUpperCase();
            String var = m.group(3).toUpperCase();
            alteration.setRefResidues(ref);
            alteration.setVariantResidues(var);
            Integer start = Integer.valueOf(m.group(2));
            alteration.setStart(start);
            Integer end = start;
            revisedProteinChange = ref + start + var;

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
                    parsingStatus.setStatus(EntityStatusType.WARNING);
                    parsingStatus.setMessage("Unable to determine consequence");
                    term = NA;
                }
            }
            alteration.setEnd(end);
            if (term != null) {
                Consequence consequence = new Consequence();
                consequence.setTerm(term.name());
                alteration.setConsequence(consequence);
            }
            alteration.setProteinChange(StringUtils.isEmpty(revisedProteinChange) ? proteinChange : revisedProteinChange);
            parsingStatus.setEntity(alteration);
            parsingStatus.setStatus(EntityStatusType.OK);
        }
        return parsingStatus;
    }

    public static ParsingStatus<Alteration> parseInframe(String proteinChange) {
        Pattern p = Pattern.compile("([A-Z]?)([0-9]+)(_[A-Z]?([0-9]+))?(delins|ins|del|dup)(.*)?", CASE_INSENSITIVE);
        Matcher m = p.matcher(proteinChange);
        ParsingStatus<Alteration> parsingStatus = new ParsingStatus<>();
        if (m.matches()) {
            Alteration alteration = new Alteration();
            String revisedProteinChange = "";
            MutationConsequence term = UNKNOWN;
            alteration.setRefResidues(m.group(1).toUpperCase());
            revisedProteinChange += alteration.getRefResidues();
            alteration.setStart(Integer.valueOf(m.group(2)));
            revisedProteinChange += alteration.getStart();
            if (m.group(3) != null) {
                revisedProteinChange += m.group(3).toUpperCase();
            }
            alteration.setEnd(m.group(4) != null ? Integer.valueOf(m.group(4)) : alteration.getStart());
            String type = m.group(5);
            String var = Optional.ofNullable(m.group(6)).orElse("").toUpperCase();
            revisedProteinChange += type + var;
            if (StringUtils.isNotEmpty(var) && !var.matches("[A-Z]+")) {
                var = "";
            }
            if (type.equals("ins")) {
                if (StringUtils.isNotEmpty(var)) {
                    term = INFRAME_INSERTION;
                }
            } else if (type.equals("dup")) {
                term = INFRAME_INSERTION;
            } else if (type.equals("del")) {
                term = INFRAME_DELETION;
            } else if (StringUtils.isNotEmpty(var)) {
                Integer deletion = alteration.getEnd() - alteration.getStart() + 1;
                Integer insertion = m.group(6).length();

                if (insertion - deletion > 0) {
                    term = INFRAME_INSERTION;
                } else if (insertion - deletion == 0) {
                    term = MISSENSE_VARIANT;
                } else {
                    term = INFRAME_DELETION;
                }
            }

            if (term != null) {
                Consequence consequence = new Consequence();
                consequence.setTerm(term.name());
                alteration.setConsequence(consequence);
            }
            alteration.setProteinChange(StringUtils.isEmpty(revisedProteinChange) ? proteinChange : revisedProteinChange);
            parsingStatus.setEntity(alteration);
            parsingStatus.setStatus(EntityStatusType.OK);
        }
        return parsingStatus;
    }

    public static ParsingStatus<Alteration> parseFrameshift(String proteinChange) {
        Pattern p = Pattern.compile("([A-Z])?([0-9]+)([A-Z])?(_[A-Z]?([0-9]+)[A-Z]?)?fs(.*)", CASE_INSENSITIVE);
        Matcher m = p.matcher(proteinChange);

        ParsingStatus<Alteration> parsingStatus = new ParsingStatus<>();
        if (m.matches()) {
            Alteration alteration = new Alteration();
            String ref = Optional.ofNullable(m.group(1)).orElse("").toUpperCase();
            alteration.setStart(Integer.valueOf(m.group(2)));
            if (m.group(5) != null) {
                alteration.setEnd(Integer.valueOf(m.group(5)));
            } else {
                alteration.setRefResidues(ref);
                alteration.setEnd(alteration.getStart());
            }

            String revisedProteinChange = ref + alteration.getStart();
            if (m.group(3) != null) {
                revisedProteinChange += m.group(3).toUpperCase();
            }
            if (m.group(4) != null) {
                revisedProteinChange += m.group(4).toUpperCase();
            }
            revisedProteinChange += "fs";
            if (m.group(6) != null) {
                revisedProteinChange += m.group(6);
            }

            Consequence consequence = new Consequence();
            consequence.setTerm(FRAMESHIFT_VARIANT.name());
            alteration.setConsequence(consequence);

            alteration.setProteinChange(StringUtils.isEmpty(revisedProteinChange) ? proteinChange : revisedProteinChange);
            parsingStatus.setEntity(alteration);
            parsingStatus.setStatus(EntityStatusType.OK);
        }
        return parsingStatus;
    }

    public static ParsingStatus<Alteration> parseRange(String proteinChange) {
        Pattern p = Pattern.compile("([A-Z]?)([0-9]+)_([A-Z]?)([0-9]+)(.+)", CASE_INSENSITIVE);
        Matcher m = p.matcher(proteinChange);
        ParsingStatus<Alteration> parsingStatus = new ParsingStatus<>();
        if (m.matches()) {
            Alteration alteration = new Alteration();
            String revisedProteinChange = "";

            alteration.setStart(Integer.valueOf(m.group(2)));
            alteration.setEnd(Integer.valueOf(m.group(4)));
            String variant = m.group(5);

            HashMap<String, MutationConsequence> termsToCheck = new HashMap<>();
            termsToCheck.put("mis", MISSENSE_VARIANT);
            termsToCheck.put("ins", INFRAME_INSERTION);
            termsToCheck.put("del", INFRAME_DELETION);
            termsToCheck.put("fs", FEATURE_TRUNCATION);
            termsToCheck.put("trunc", FEATURE_TRUNCATION);
            termsToCheck.put("dup", INFRAME_INSERTION);
            termsToCheck.put("mut", ANY);

            MutationConsequence mutationConsequence = termsToCheck.get(variant);
            if (mutationConsequence != null) {
                revisedProteinChange += m.group(1).toUpperCase();
                revisedProteinChange += m.group(2) + "_";
                revisedProteinChange += m.group(3).toUpperCase();
                revisedProteinChange += m.group(4) + variant;

                if (mutationConsequence != null) {
                    Consequence consequence = new Consequence();
                    consequence.setTerm(mutationConsequence.name());
                    alteration.setConsequence(consequence);
                }
                alteration.setProteinChange(StringUtils.isEmpty(revisedProteinChange) ? proteinChange : revisedProteinChange);
                parsingStatus.setEntity(alteration);
                parsingStatus.setStatus(EntityStatusType.OK);
            } else {
                Double greatestSimilarity = -1.0;
                String termWithGreatestSimilarity = "";
                JaroWinklerSimilarity jw = new JaroWinklerSimilarity();
                for (Map.Entry<String, MutationConsequence> entry : termsToCheck.entrySet()) {
                    double similarity = jw.apply(variant, entry.getKey());
                    if (similarity > greatestSimilarity) {
                        greatestSimilarity = similarity;
                        termWithGreatestSimilarity = entry.getKey();
                    }
                }
                parsingStatus.setStatus(EntityStatusType.ERROR);
                parsingStatus.setMessage(
                    "The alteration name is invalid, do you mean " +
                    m.group(1) +
                    m.group(2) +
                    "_" +
                    m.group(3) +
                    m.group(4) +
                    termWithGreatestSimilarity +
                    "?"
                );
            }
        }
        return parsingStatus;
    }

    public static ParsingStatus<Alteration> parseSplice(String proteinChange) {
        Pattern p = Pattern.compile("([A-Z]?)([0-9]+)(_[A-Z]?([0-9]+))?(_)?splice", CASE_INSENSITIVE);
        Matcher m = p.matcher(proteinChange);
        ParsingStatus<Alteration> parsingStatus = new ParsingStatus<>();
        if (m.matches()) {
            String revisedProteinChange = "";
            Alteration alteration = new Alteration();
            if (m.group(1) != null && m.group(3) == null) {
                // we only want to specify reference when it's one position splice
                String var = m.group(1).toUpperCase();
                alteration.setRefResidues("X".equals(var) ? "" : var);
                revisedProteinChange += alteration.getRefResidues().toUpperCase();
            }
            alteration.setStart(Integer.valueOf(m.group(2)));
            revisedProteinChange += alteration.getStart();
            if (m.group(3) != null) {
                revisedProteinChange += m.group(3).toUpperCase() + "splice";
            } else {
                revisedProteinChange += "_splice";
            }
            alteration.setEnd(m.group(4) != null ? Integer.valueOf(m.group(4)) : alteration.getStart());

            Consequence consequence = new Consequence();
            consequence.setTerm(SPLICE_REGION_VARIANT.name());
            alteration.setConsequence(consequence);
            alteration.setProteinChange(StringUtils.isEmpty(revisedProteinChange) ? proteinChange : revisedProteinChange);
            parsingStatus.setEntity(alteration);
            parsingStatus.setStatus(EntityStatusType.OK);
        }
        return parsingStatus;
    }

    public static ParsingStatus<Alteration> parseSynonymous(String proteinChange) {
        Pattern p = Pattern.compile("([A-Z\\*])?([0-9]+)=", CASE_INSENSITIVE);
        Matcher m = p.matcher(proteinChange);
        ParsingStatus<Alteration> parsingStatus = new ParsingStatus<>();
        if (m.matches()) {
            String revisedProteinChange = "";
            Alteration alteration = new Alteration();
            MutationConsequence term;

            if (m.group(1) != null) {
                alteration.setRefResidues(m.group(1).toUpperCase());
                alteration.setVariantResidues(alteration.getRefResidues());
                revisedProteinChange += alteration.getRefResidues();
            }
            alteration.setStart(Integer.valueOf(m.group(2)));
            alteration.setEnd(alteration.getStart());
            revisedProteinChange += alteration.getStart() + "=";
            if ("*".equals(alteration.getRefResidues())) {
                term = STOP_RETAINED_VARIANT;
            } else {
                term = SYNONYMOUS_VARIANT;
            }

            Consequence consequence = new Consequence();
            consequence.setTerm(term.name());
            alteration.setConsequence(consequence);
            alteration.setProteinChange(StringUtils.isEmpty(revisedProteinChange) ? proteinChange : revisedProteinChange);
            parsingStatus.setEntity(alteration);
            parsingStatus.setStatus(EntityStatusType.OK);
        }
        return parsingStatus;
    }
}
