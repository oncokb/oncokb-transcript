package org.mskcc.oncokb.curation.domain.firebase;

import java.util.ArrayList;
import java.util.List;

public class Gene {

    String name;
    String summary;
    String background;
    GeneType type;
    List<Mutation> mutations = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getBackground() {
        return background;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public GeneType getType() {
        return type;
    }

    public void setType(GeneType type) {
        this.type = type;
    }

    public List<Mutation> getMutations() {
        return mutations;
    }

    public void setMutations(List<Mutation> mutations) {
        this.mutations = mutations;
    }
}
