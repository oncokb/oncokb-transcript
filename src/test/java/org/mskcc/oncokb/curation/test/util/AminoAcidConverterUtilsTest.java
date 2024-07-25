package org.mskcc.oncokb.curation.test.util;

import org.junit.Assert;
import org.junit.Test;
import org.mskcc.oncokb.curation.util.AminoAcidConverterUtils;

public class AminoAcidConverterUtilsTest {

    // Null input should return null
    @Test
    public void testResolveHgvspShortFromHgvspWithNullInput() {
        Assert.assertNull("Expected null for null input", AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(null));
    }

    @Test
    public void testResolveHgvspShortFromHgvspWithEmptyInput() {
        String input = "";
        String expected = "";
        Assert.assertEquals("Expected empty string for empty input", expected, AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input));
    }

    // Input with no three-letter code should return identical string
    @Test
    public void testResolveHgvspShortFromHgvspWithNoConversion() {
        String input = "p.V600E";
        String expected = "p.V600E";
        Assert.assertEquals(
            "Expected same string for input without three-letter codes",
            expected,
            AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input)
        );
    }

    // Input with three-letter codes should return respective one-letter codes
    @Test
    public void testResolveHgvspShortFromHgvspWithSingleConversion() {
        String input = "p.Val600Glu";
        String expected = "p.V600E";
        Assert.assertEquals(
            "Expected conversion from three-letter to one-letter amino acid codes",
            expected,
            AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input)
        );
    }

    @Test
    public void testResolveHgvspShortFromHgvspWithMultipleConversions() {
        String input = "p.Arg143Gln/Val600Glu";
        String expected = "p.R143Q/V600E";
        Assert.assertEquals(
            "Expected conversion for multiple three-letter codes",
            expected,
            AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input)
        );
    }

    @Test
    public void testResolveHgvspShortFromHgvspWithComplexString() {
        String input = "p.(Gly12Ser/Val600Glu)";
        String expected = "p.(G12S/V600E)";
        Assert.assertEquals(
            "Expected conversion within complex string",
            expected,
            AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input)
        );
    }

    // Inputs with Ter should return * for Ter
    @Test
    public void testResolveHgvspShortFromHgvspWithTer() {
        String input = "p.(Gly12Ter)";
        String expected = "p.(G12*)";
        Assert.assertEquals("Expected conversion for Ter", expected, AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input));
    }

    @Test
    public void testResolveHgvspShortFromHgvspWithTerAndOther() {
        String input = "p.(Gly12Ter/Val600Glu)";
        String expected = "p.(G12*/V600E)";
        Assert.assertEquals("Expected conversion for Ter and other", expected, AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input));
    }

    // Input with no digits should return identical string
    @Test
    public void testResolveHgvspShortWithNoDigits() {
        String input = "p.(GlyTer)";
        String expected = "p.(GlyTer)";
        Assert.assertEquals("Expected no conversion for no digits", expected, AminoAcidConverterUtils.resolveHgvspShortFromHgvsp(input));
    }
}
