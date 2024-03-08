package org.mskcc.oncokb.curation.domain.nih.efetch;

import javax.xml.bind.annotation.*;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "")
@XmlRootElement
public class Value {

    @XmlAnyElement(lax = true)
    protected Object[] value;

    public Object[] getValue() {
        return value;
    }

    public void setValue(Object[] value) {
        this.value = value;
    }
}
