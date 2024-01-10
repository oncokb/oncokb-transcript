package org.mskcc.oncokb.curation.service;

import com.google.firebase.database.*;
import java.util.*;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.Evidence;
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.mskcc.oncokb.curation.domain.enumeration.EvidenceType;
import org.mskcc.oncokb.curation.domain.firebase.Drug;
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
    private final DrugService drugService;
    private final NciThesaurusService nciThesaurusService;
    private FirebaseDatabase database;

    public FirebaseService(
        GeneService geneService,
        AlterationService alterationService,
        EvidenceService evidenceService,
        AssociationService associationService,
        DrugService drugService,
        NciThesaurusService nciThesaurusService
    ) {
        this.geneService = geneService;
        this.alterationService = alterationService;
        this.evidenceService = evidenceService;
        this.associationService = associationService;
        this.drugService = drugService;
        this.nciThesaurusService = nciThesaurusService;
    }

    public void readGene() {
        String PATH = "Genes/BRAF";
        database = FirebaseDatabase.getInstance();
        DatabaseReference ref = database.getReference(PATH);
        // Attach a listener to read the data
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
            List<Alteration> altList = alterationService.findByNameOrAlterationAndGenesId(mutation.getName(), geneOptional.get().getId());
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

    public void importDrugs() {
        database = FirebaseDatabase.getInstance();
        DatabaseReference ref = database.getReference("Drugs");
        // Attach a listener to read the data
        ref.addValueEventListener(
            new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    GenericTypeIndicator<Map<String, Drug>> genericTypeIndicator = new GenericTypeIndicator<Map<String, Drug>>() {};
                    Map<String, Drug> drugMap = dataSnapshot.getValue(genericTypeIndicator);
                    log.info("Loaded Drugs");
                    for (Map.Entry<String, Drug> drugEntry : drugMap.entrySet()) {
                        Drug drug = drugEntry.getValue();
                        Optional<org.mskcc.oncokb.curation.domain.Drug> drugOptional = Optional.empty();
                        if (StringUtils.isEmpty(drug.getNcitCode())) {
                            drugOptional = drugService.findByName(drug.getDrugName());
                        } else {
                            drugOptional = drugService.findByCode(drug.getNcitCode());
                        }
                        if (drugOptional.isEmpty()) {
                            Optional<NciThesaurus> nciThesaurusOptional = Optional.empty();
                            if (StringUtils.isEmpty(drug.getNcitCode())) {
                                nciThesaurusOptional = nciThesaurusService.findOneByNamePriority(drug.getDrugName());
                            } else {
                                nciThesaurusOptional = nciThesaurusService.findByCode(drug.getNcitCode());
                            }
                            if (nciThesaurusOptional.isEmpty()) {
                                log.error("Cannot find the NCIT code from drug {} {}", drug.getNcitCode(), drug.getDrugName());
                            } else {
                                org.mskcc.oncokb.curation.domain.Drug newDrugEntity = new org.mskcc.oncokb.curation.domain.Drug();
                                newDrugEntity.setNciThesaurus(nciThesaurusOptional.get());
                                newDrugEntity.setName(drug.getDrugName());
                                newDrugEntity.setUuid(drug.getUuid());
                                drugService.save(newDrugEntity);
                                log.info("Add new drug {} {}", drug.getDrugName(), drug.getNcitCode());
                            }
                        } else {
                            drugOptional.get().setUuid(drug.getUuid());
                            drugService.partialUpdate(drugOptional.get());
                        }
                    }
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    log.error("The read failed: {}", databaseError.getCode());
                }
            }
        );
    }
}
