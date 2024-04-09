package org.mskcc.oncokb.curation.service;

import java.util.*;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.enumeration.MutationConsequence;
import org.springframework.stereotype.Service;

@Service
public class AnnotationService {

    private final AlterationService alterationService;

    public AnnotationService(AlterationService alterationService) {
        this.alterationService = alterationService;
    }

    public LinkedHashSet<Alteration> findRelevantAlterations(Alteration alteration) {
        LinkedHashSet<Alteration> alterations = new LinkedHashSet<>();

        if (alteration.getConsequence().getTerm().equals("synonymous_variant")) {
            return alterations;
        }

        // Find exact match
        Alteration matchedAlt = null;
        List<Alteration> matchedAlts = alterationService.findByNameOrAlterationAndGenesId(
            alteration.getAlteration(),
            alteration.getGenes().iterator().next().getId()
        );
        if (!matchedAlts.isEmpty()) {
            matchedAlt = matchedAlts.iterator().next();
        }

        if (matchedAlt != null) {
            alterations.add(matchedAlt);
        }

        if (
            alteration.getRefResidues() != null &&
            alteration.getStart() != null &&
            MutationConsequence.MISSENSE_VARIANT.name().equals(alteration.getConsequence().getTerm())
        ) {
            // add positional variant
            alterations.addAll(
                alterationService.findByNameOrAlterationAndGenesId(
                    alteration.getRefResidues() + alteration.getStart(),
                    alteration.getGenes().iterator().next().getId()
                )
            );
        }

        alterations.addAll(
            alterationService.findByGeneAndConsequenceThatOverlap(
                new ArrayList<>(alteration.getGenes()),
                alteration.getConsequence(),
                alteration.getEnd(),
                alteration.getStart()
            )
        );
        // add overlap variant with the same consequence
        return alterations;
    }
}
