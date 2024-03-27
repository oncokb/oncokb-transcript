package org.mskcc.oncokb.curation.importer.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OncotreeCancerType {

    private String code = null;
    private String color = null;
    private String name = null;
    private String mainType = null;
    private Map<String, List<String>> externalReferences = new HashMap<>();
    private String tissue = null;
    private Map<String, OncotreeCancerType> children = new HashMap<>();
    private String parent = null;
    private List<String> history = new ArrayList<>();
    private Integer level = null;
    private List<String> revocations = new ArrayList<>();
    private List<String> precursors = new ArrayList<>();

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMainType() {
        return mainType;
    }

    public void setMainType(String mainType) {
        this.mainType = mainType;
    }

    public Map<String, List<String>> getExternalReferences() {
        return externalReferences;
    }

    public void setExternalReferences(Map<String, List<String>> externalReferences) {
        this.externalReferences = externalReferences;
    }

    public String getTissue() {
        return tissue;
    }

    public void setTissue(String tissue) {
        this.tissue = tissue;
    }

    public Map<String, OncotreeCancerType> getChildren() {
        return children;
    }

    public void setChildren(Map<String, OncotreeCancerType> children) {
        this.children = children;
    }

    public String getParent() {
        return parent;
    }

    public void setParent(String parent) {
        this.parent = parent;
    }

    public List<String> getHistory() {
        return history;
    }

    public void setHistory(List<String> history) {
        this.history = history;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public List<String> getRevocations() {
        return revocations;
    }

    public void setRevocations(List<String> revocations) {
        this.revocations = revocations;
    }

    public List<String> getPrecursors() {
        return precursors;
    }

    public void setPrecursors(List<String> precursors) {
        this.precursors = precursors;
    }
}
