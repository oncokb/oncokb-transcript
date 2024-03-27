package org.mskcc.oncokb.curation.domain.firebase;

import com.google.firebase.database.Exclude;
import com.google.firebase.database.PropertyName;
import java.util.ArrayList;
import java.util.List;

public class Mutation {

    String name;
    MutationEffect mutationEffect;
    List<Tumor> tumors = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @PropertyName("mutation_effect")
    public MutationEffect getMutationEffect() {
        return mutationEffect;
    }

    @PropertyName("mutation_effect")
    public void setMutationEffect(MutationEffect mutationEffect) {
        this.mutationEffect = mutationEffect;
    }

    public List<Tumor> getTumors() {
        return tumors;
    }

    public void setTumors(List<Tumor> tumors) {
        this.tumors = tumors;
    }
}
