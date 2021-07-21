package org.mskcc.oncokb.transcript.util;

import com.google.common.base.Strings;
import com.google.common.collect.ImmutableBiMap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Component;

// from https://gist.github.com/raymyers/4568394
public class PostalTranslationsUtils {

    private static final ImmutableBiMap<String, String> abbrToFullname;
    private static final ImmutableSet<String> canadianCodes;
    private static final ImmutableSet<String> americanCodes;
    private static final ImmutableMap<String, String> canadianNonStandardAbbrToStandard;

    public static Set<String> getCanadianAbbreviations() {
        return Sets.union(canadianCodes, getNonStandardCanadianAbbreviations());
    }

    private static Set<String> getNonStandardCanadianAbbreviations() {
        return canadianNonStandardAbbrToStandard.keySet();
    }

    public static Set<String> getAllAbbreviations() {
        return Sets.union(getAllStandardAbbreviations(), getNonStandardCanadianAbbreviations());
    }

    public static Set<String> getAllStandardAbbreviations() {
        return Sets.union(canadianCodes, americanCodes);
    }

    public static Set<String> getAmericanAbbreviations() {
        return americanCodes;
    }

    public static String getStateNameFromAbbreviation(String abbrev) {
        return Strings.nullToEmpty(abbrToFullname.get(normalizeAbbreviation(abbrev)));
    }

    public static String getStateAbbreviationFromFullName(String fullName) {
        return Strings.nullToEmpty(abbrToFullname.inverse().get(normalizeString(fullName)));
    }

    public static boolean isCanadianAbbreviation(String abbrev) {
        return canadianCodes.contains(abbrev) || canadianNonStandardAbbrToStandard.containsKey(abbrev);
    }

    public static boolean isAmericanAbbreviation(String abbrev) {
        return americanCodes.contains(abbrev);
    }

    public static boolean isValidAbbreviation(String abbrev) {
        return isCanadianAbbreviation(abbrev) || isAmericanAbbreviation(abbrev);
    }

    public static String normalizeAbbreviation(String string) {
        String trimmedUpper = normalizeString(string).toUpperCase();
        return Optional.ofNullable(canadianNonStandardAbbrToStandard.get(trimmedUpper)).orElse(trimmedUpper);
    }

    private static String normalizeString(String string) {
        return Strings.nullToEmpty(string).trim();
    }

    private PostalTranslationsUtils() {}

    static {
        Map<String, String> canadianAbbrToFullTemp = ImmutableMap
            .<String, String>builder()
            .put("AB", "Alberta")
            .put("BC", "British Columbia")
            .put("MB", "Manitoba")
            .put("NB", "New Brunswick")
            .put("NT", "Northwest Territories")
            .put("NS", "Nova Scotia")
            .put("NU", "Nunavut")
            .put("ON", "Ontario")
            .put("PE", "Prince Edward Island")
            .put("QC", "Quebec")
            .put("SK", "Saskatchewan")
            .put("YT", "Yukon Territory")
            .put("NL", "Newfoundland & Labrador")
            .build();
        Map<String, String> americanAbbrToFullTemp = ImmutableMap
            .<String, String>builder()
            .put("AL", "Alabama")
            .put("AK", "Alaska")
            .put("AZ", "Arizona")
            .put("AR", "Arkansas")
            .put("CA", "California")
            .put("CO", "Colorado")
            .put("CT", "Connecticut")
            .put("DE", "Delaware")
            .put("DC", "District of Columbia")
            .put("FL", "Florida")
            .put("GA", "Georgia")
            .put("HI", "Hawaii")
            .put("ID", "Idaho")
            .put("IL", "Illinois")
            .put("IN", "Indiana")
            .put("IA", "Iowa")
            .put("KS", "Kansas")
            .put("KY", "Kentucky")
            .put("LA", "Louisiana")
            .put("ME", "Maine")
            .put("MD", "Maryland")
            .put("MA", "Massachusetts")
            .put("MI", "Michigan")
            .put("MN", "Minnesota")
            .put("MS", "Mississippi")
            .put("MO", "Missouri")
            .put("MT", "Montana")
            .put("NE", "Nebraska")
            .put("NV", "Nevada")
            .put("NH", "New Hampshire")
            .put("NJ", "New Jersey")
            .put("NM", "New Mexico")
            .put("NY", "New York")
            .put("NC", "North Carolina")
            .put("ND", "North Dakota")
            .put("OH", "Ohio")
            .put("OK", "Oklahoma")
            .put("OR", "Oregon")
            .put("PA", "Pennsylvania")
            .put("PR", "Puerto Rico")
            .put("RI", "Rhode Island")
            .put("SC", "South Carolina")
            .put("SD", "South Dakota")
            .put("TN", "Tennessee")
            .put("TX", "Texas")
            .put("VI", "U.S. Virgin Islands")
            .put("UT", "Utah")
            .put("VT", "Vermont")
            .put("VA", "Virginia")
            .put("WA", "Washington")
            .put("WV", "West Virginia")
            .put("WI", "Wisconsin")
            .put("WY", "Wyoming")
            .build();

        canadianCodes = ImmutableSet.copyOf(canadianAbbrToFullTemp.keySet());

        americanCodes = ImmutableSet.copyOf(americanAbbrToFullTemp.keySet());

        abbrToFullname = ImmutableBiMap.<String, String>builder().putAll(americanAbbrToFullTemp).putAll(canadianAbbrToFullTemp).build();

        canadianNonStandardAbbrToStandard =
            ImmutableMap.<String, String>builder().put("QB", "QC").put("PQ", "QC").put("NF", "NL").put("LB", "NL").build();
    }
}
