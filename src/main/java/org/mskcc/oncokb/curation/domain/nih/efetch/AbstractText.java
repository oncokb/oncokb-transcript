package org.mskcc.oncokb.curation.domain.nih.efetch;

import java.util.List;
import javax.xml.bind.annotation.*;
import javax.xml.bind.annotation.adapters.CollapsedStringAdapter;
import javax.xml.bind.annotation.adapters.NormalizedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "value" })
@XmlRootElement(name = "AbstractText")
public class AbstractText {

    @XmlAttribute(name = "Label")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String label;

    @XmlAttribute(name = "NlmCategory")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String nlmCategory;

    @XmlMixed
    @XmlAnyElement
    protected List<java.lang.Object> value;

    /**
     * Gets the value of the label property.
     *
     * @return possible object is
     * {@link String }
     */
    public String getLabel() {
        return label;
    }

    /**
     * Sets the value of the label property.
     *
     * @param value allowed object is
     *              {@link String }
     */
    public void setLabel(String value) {
        this.label = value;
    }

    /**
     * Gets the value of the nlmCategory property.
     *
     * @return possible object is
     * {@link String }
     */
    public String getNlmCategory() {
        return nlmCategory;
    }

    /**
     * Sets the value of the nlmCategory property.
     *
     * @param value allowed object is
     *              {@link String }
     */
    public void setNlmCategory(String value) {
        this.nlmCategory = value;
    }

    public List<java.lang.Object> getValue() {
        return value;
    }

    public void setValue(List<java.lang.Object> value) {
        this.value = value;
    }
}
