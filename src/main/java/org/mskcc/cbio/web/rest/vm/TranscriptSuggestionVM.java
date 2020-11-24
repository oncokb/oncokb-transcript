package org.mskcc.cbio.web.rest.vm;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptSuggestionVM {
    String grch37Note = "";
    List<String> grch37 = new ArrayList<>();
    String grch38Note = "";
    List<String> grch38 = new ArrayList<>();

    public String getGrch37Note() {
        return grch37Note;
    }

    public void setGrch37Note(String grch37Note) {
        this.grch37Note = grch37Note;
    }

    public List<String> getGrch37() {
        return grch37;
    }

    public void setGrch37(List<String> grch37) {
        this.grch37 = grch37;
    }

    public String getGrch38Note() {
        return grch38Note;
    }

    public void setGrch38Note(String grch38Note) {
        this.grch38Note = grch38Note;
    }

    public List<String> getGrch38() {
        return grch38;
    }

    public void setGrch38(List<String> grch38) {
        this.grch38 = grch38;
    }
}
