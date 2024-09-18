package org.mskcc.oncokb.curation.test;

import static org.junit.Assert.assertEquals;
import static org.mskcc.oncokb.curation.util.AlterationUtils.parseProteinChange;

import java.util.*;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.AlterationAnnotationStatus;
import org.mskcc.oncokb.curation.domain.EntityStatus;

public class ParseProteinChangeParameterizedTest {

    @ParameterizedTest
    @CsvFileSource(files = "src/test/resources/data/test_parse_protein_change.csv", numLinesToSkip = 1)
    public void test(
        String proteinChange,
        String expectedConsequence,
        String expectedRefAllele,
        String expectedVarAllele,
        String expectedProteinStart,
        String expectedProteinEnd
    ) {
        EntityStatus<Alteration> alterationEntityStatus = new AlterationAnnotationStatus();

        parseProteinChange(alterationEntityStatus, proteinChange);

        testSuite(
            alterationEntityStatus.getEntity(),
            proteinChange,
            Optional.ofNullable(expectedConsequence).orElse("").toUpperCase(),
            Optional.ofNullable(expectedRefAllele).orElse(""),
            Optional.ofNullable(expectedVarAllele).orElse(""),
            Optional.ofNullable(expectedProteinStart).orElse(""),
            Optional.ofNullable(expectedProteinEnd).orElse("")
        );
    }

    private void testSuite(
        Alteration annotatedAlteration,
        String proteinChange,
        String expectedConsequence,
        String expectedRefAllele,
        String expectedVarAllele,
        String expectedProteinStart,
        String expectedProteinEnd
    ) {
        assertEquals(
            "Not expected consequence. Query: " + proteinChange,
            expectedConsequence,
            annotatedAlteration.getConsequence() == null ? "" : annotatedAlteration.getConsequence().getTerm()
        );
        assertEquals(
            "Not expected ref allele. Query: " + proteinChange,
            expectedRefAllele,
            StringUtils.isEmpty(annotatedAlteration.getRefResidues()) ? "" : annotatedAlteration.getRefResidues()
        );
        assertEquals(
            "Not expected var allele. Query: " + proteinChange,
            expectedVarAllele,
            StringUtils.isEmpty(annotatedAlteration.getVariantResidues()) ? "" : annotatedAlteration.getVariantResidues()
        );
        assertEquals(
            "Not expected protein start. Query: " + proteinChange,
            expectedProteinStart,
            annotatedAlteration.getStart() == null ? "" : Integer.toString(annotatedAlteration.getStart())
        );
        assertEquals(
            "Not expected protein end. Query: " + proteinChange,
            expectedProteinEnd,
            annotatedAlteration.getEnd() == null ? "" : Integer.toString(annotatedAlteration.getEnd())
        );
    }
}
