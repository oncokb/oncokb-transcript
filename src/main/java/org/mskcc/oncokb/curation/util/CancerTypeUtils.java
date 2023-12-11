package org.mskcc.oncokb.curation.util;

import static org.mskcc.oncokb.curation.util.enumeration.RelevantCancerTypeDirection.*;
import static org.mskcc.oncokb.curation.util.enumeration.SpecialCancerType.*;

import com.google.common.collect.ImmutableList;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;
import org.mskcc.oncokb.curation.util.enumeration.RelevantCancerTypeDirection;
import org.mskcc.oncokb.curation.util.enumeration.SpecialCancerType;

public class CancerTypeUtils {

    private static final ImmutableList<String> LiquidTumorTissues = ImmutableList.of("Lymph", "Blood", "Lymphoid", "Myeloid");

    public static Boolean isSolidTumor(CancerType cancerType) {
        return isDesiredTumorForm(cancerType, TumorForm.SOLID);
    }

    public static Boolean isLiquidTumor(CancerType cancerType) {
        return isDesiredTumorForm(cancerType, TumorForm.LIQUID);
    }

    private static boolean isDesiredTumorForm(CancerType cancerType, TumorForm tumorForm) {
        if (tumorForm == null || cancerType == null) {
            return false;
        }

        // This is mainly for the tissue
        if (cancerType.getTumorForm() != null) {
            return tumorForm.equals(cancerType.getTumorForm());
        }

        // when the code is null, we need to validate the main type
        if (cancerType.getCode() == null) {
            TumorForm mainTypeTumorForm = getTumorForm(cancerType.getMainType());
            if (cancerType.getMainType() != null && mainTypeTumorForm != null) {
                return mainTypeTumorForm.equals(tumorForm);
            }
        } else {
            return cancerType.getTumorForm() != null && cancerType.getTumorForm().equals(tumorForm);
        }
        return false;
    }

    public static Boolean hasSolidTumor(Set<CancerType> cancerTypes) {
        if (cancerTypes == null) return null;
        for (CancerType cancerType : cancerTypes) {
            if (isSolidTumor(cancerType)) {
                return true;
            }
        }
        return false;
    }

    public static Boolean hasLiquidTumor(Set<CancerType> cancerTypes) {
        if (cancerTypes == null) return null;
        for (CancerType cancerType : cancerTypes) {
            if (isLiquidTumor(cancerType)) {
                return true;
            }
        }
        return false;
    }

    public static LinkedHashSet<CancerType> getParentTumorTypes(CancerType cancerType, boolean onlySameMainType) {
        if (cancerType == null || cancerType.getParent() == null) return new LinkedHashSet<>();
        LinkedHashSet parentTumorTypes = new LinkedHashSet();
        // we do not want to include the tissue level which is 1
        if (cancerType.getParent() != null && cancerType.getLevel() > 2) {
            if (!onlySameMainType || cancerType.getParent().getMainType().equals(cancerType.getMainType())) {
                parentTumorTypes.add(cancerType.getParent());
            }
            parentTumorTypes.addAll(getParentTumorTypes(cancerType.getParent(), onlySameMainType));
        }
        return parentTumorTypes;
    }

    public static LinkedHashSet<CancerType> getChildTumorTypes(CancerType cancerType, boolean onlySameMainType) {
        if (cancerType == null || cancerType.getChildren().isEmpty()) return new LinkedHashSet<>();
        LinkedHashSet<CancerType> childTumorTypes = new LinkedHashSet();
        if (onlySameMainType) {
            childTumorTypes.addAll(
                cancerType
                    .getChildren()
                    .stream()
                    .filter(child -> child.getMainType().equals(cancerType.getMainType()))
                    .collect(Collectors.toList())
            );
        } else {
            childTumorTypes.addAll(cancerType.getChildren());
        }
        cancerType.getChildren().forEach(child -> childTumorTypes.addAll(getChildTumorTypes(child, onlySameMainType)));
        return childTumorTypes;
    }

    public static String getCancerTypeName(CancerType cancerType) {
        if (cancerType == null) {
            return "";
        } else {
            if (!StringUtils.isEmpty(cancerType.getSubtype())) {
                return cancerType.getSubtype();
            } else if (!StringUtils.isEmpty(cancerType.getMainType())) {
                return cancerType.getMainType();
            } else {
                return "";
            }
        }
    }

    public static String getCancerTypesName(Collection<CancerType> cancerTypes) {
        return cancerTypes.stream().map(cancerType -> getCancerTypeName(cancerType)).collect(Collectors.joining(", "));
    }

    public static String getTumorTypesNameWithExclusion(Collection<CancerType> cancerTypes, Collection<CancerType> excludedTumorTypes) {
        StringBuilder sb = new StringBuilder(getCancerTypesName(cancerTypes));
        if (excludedTumorTypes != null && excludedTumorTypes.size() > 0) {
            sb.append(" (excluding ");
            sb.append(getCancerTypesName(excludedTumorTypes));
            sb.append(")");
        }
        return sb.toString();
    }

    private static TumorForm getTumorForm(CancerType cancerType) {
        if (cancerType.getTumorForm() != null) {
            return cancerType.getTumorForm();
        }
        return null;
    }

    public static TumorForm getTumorForm(Set<CancerType> cancerTypes) {
        if (cancerTypes == null) return null;
        Set<TumorForm> uniqueTumorForms = cancerTypes
            .stream()
            .filter(cancerType -> {
                TumorForm tumorForm = getTumorForm(cancerType);
                return tumorForm != null;
            })
            .map(cancerType -> getTumorForm(cancerType))
            .collect(Collectors.toSet());
        if (uniqueTumorForms.size() > 1) {
            // There are ambiguous tumor forms
            return TumorForm.MIXED;
        } else if (uniqueTumorForms.size() == 0) {
            return null;
        } else {
            return uniqueTumorForms.iterator().next();
        }
    }

    public static TumorForm getTumorForm(SpecialCancerType specialTumorType) {
        if (specialTumorType == null) return null;

        if (specialTumorType.equals(ALL_LIQUID_TUMORS) || specialTumorType.equals(SpecialCancerType.OTHER_LIQUID_TUMOR_TYPES)) {
            return TumorForm.LIQUID;
        } else if (specialTumorType.equals(ALL_SOLID_TUMORS) || specialTumorType.equals(SpecialCancerType.OTHER_SOLID_TUMOR_TYPES)) {
            return TumorForm.SOLID;
        } else {
            return TumorForm.MIXED;
        }
    }

    public static TumorForm getTumorForm(String tissue) {
        if (StringUtils.isNotEmpty(tissue)) {
            if (LiquidTumorTissues.contains(tissue)) return TumorForm.LIQUID; else return TumorForm.SOLID;
        }
        return null;
    }
}
