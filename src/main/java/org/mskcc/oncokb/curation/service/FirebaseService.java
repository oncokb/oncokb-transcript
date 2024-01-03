package org.mskcc.oncokb.curation.service;

import com.google.firebase.database.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.Evidence;
import org.mskcc.oncokb.curation.domain.enumeration.EvidenceType;
import org.mskcc.oncokb.curation.domain.firebase.Gene;
import org.mskcc.oncokb.curation.domain.firebase.Mutation;
import org.mskcc.oncokb.curation.domain.firebase.MutationEffect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {

    private final Logger log = LoggerFactory.getLogger(FirebaseService.class);
    private final GeneService geneService;
    private final AlterationService alterationService;
    private final EvidenceService evidenceService;
    private final AssociationService associationService;
    private FirebaseDatabase database;

    public FirebaseService(
        GeneService geneService,
        AlterationService alterationService,
        EvidenceService evidenceService,
        AssociationService associationService
    ) {
        this.geneService = geneService;
        this.alterationService = alterationService;
        this.evidenceService = evidenceService;
        this.associationService = associationService;
    }

    public void readGene() {
        String PATH = "Genes/BRAF";
        database = FirebaseDatabase.getInstance();
        DatabaseReference ref = database.getReference(PATH);
        // Attach a listener to read the data at our posts reference
        ref.addValueEventListener(
            new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    Gene gene = dataSnapshot.getValue(Gene.class);
                    log.info("Loaded {}", PATH);
                    importGeneData(gene);
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    log.error("The read failed: {}", databaseError.getCode());
                }
            }
        );
    }

    private void importGeneData(Gene gene) {
        Optional<org.mskcc.oncokb.curation.domain.Gene> geneOptional = geneService.findGeneByHugoSymbol(gene.getName());
        if (geneOptional.isEmpty()) {
            log.error("Cannot find matched gene {}", gene.getName());
        }

        for (Mutation mutation : gene.getMutations()) {
            List<Alteration> altList = alterationService.findByNameAndGeneId(mutation.getName(), geneOptional.get().getId());
            if (altList.isEmpty()) {
                Alteration alteration = new Alteration();
                alteration.setName(mutation.getName());
                alteration.setGenes(Collections.singleton(geneOptional.get()));
                altList.add(alterationService.save(alteration));
            }
            if (mutation.getMutationEffect() != null) {
                MutationEffect me = mutation.getMutationEffect();
                if (StringUtils.isNotEmpty(me.getOncogenic())) {
                    Evidence evidence = new Evidence();
                    evidence.setEvidenceType(EvidenceType.ONCOGENIC.name());
                    evidence.setKnownEffect(me.getOncogenic());
                    Association association = new Association();
                    association.setAlterations(new HashSet<>(altList));
                    //                    association = associationService.save(association);
                    evidence.setAssociation(association);
                    evidenceService.save(evidence);
                }
            }
        }
    }
}
