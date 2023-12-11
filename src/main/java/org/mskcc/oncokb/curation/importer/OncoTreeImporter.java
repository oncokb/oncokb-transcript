package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.util.CancerTypeUtils.getTumorForm;
import static org.mskcc.oncokb.curation.util.FileUtils.parseDelimitedFile;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;
import javax.swing.text.html.Option;
import liquibase.pro.packaged.T;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;
import org.mskcc.oncokb.curation.importer.model.OncotreeCancerType;
import org.mskcc.oncokb.curation.service.CancerTypeService;
import org.mskcc.oncokb.curation.util.enumeration.SpecialCancerType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OncoTreeImporter {

    private final Logger log = LoggerFactory.getLogger(OncoTreeImporter.class);
    final CancerTypeService cancerTypeService;
    final String FILE_PATH = "/Users/zhangh2/origin-repos/oncokb-data/curation/oncotree/oncotree_2019_12_01.json";
    final String MIXED = "MIXED";

    public OncoTreeImporter(CancerTypeService cancerTypeService) {
        this.cancerTypeService = cancerTypeService;
    }

    public void generalImport() throws FileNotFoundException {
        Gson gson = new GsonBuilder().create();
        File file = new File(FILE_PATH);
        InputStream is = new FileInputStream(file);

        // import special types
        Arrays
            .stream(SpecialCancerType.values())
            .forEach(specialCancerType -> {
                CancerType cancerType = new CancerType();
                cancerType.setLevel(-1);
                cancerType.setCode(specialCancerType.name());
                cancerType.setMainType(specialCancerType.getTumorType());
                cancerType.setTumorForm(getTumorForm(specialCancerType));
                cancerType.setColor(MIXED);
                cancerType.setTissue(MIXED);
                cancerTypeService.save(cancerType);
            });

        // Import subtypes
        OncotreeCancerType[] oncotreeCancerTypes = gson.fromJson(new BufferedReader(new InputStreamReader(is)), OncotreeCancerType[].class);
        List<CancerType> cancerTypes = new ArrayList<>();
        Arrays
            .stream(oncotreeCancerTypes)
            .sorted(Comparator.comparing(OncotreeCancerType::getLevel))
            .forEach(oncotreeCancerType -> {
                CancerType cancerType = new CancerType();
                cancerType.setCode(oncotreeCancerType.getCode());
                cancerType.setColor(oncotreeCancerType.getColor());
                cancerType.setSubtype(oncotreeCancerType.getName());
                cancerType.setMainType(Optional.ofNullable(oncotreeCancerType.getMainType()).orElse(oncotreeCancerType.getName()));
                cancerType.setTissue(oncotreeCancerType.getTissue());
                cancerType.setLevel(oncotreeCancerType.getLevel());
                if (cancerType.getLevel() == null) {
                    log.error("No level associated {}", oncotreeCancerType);
                } else {
                    if (cancerType.getLevel() == 0) {
                        cancerType.setTumorForm(TumorForm.MIXED);
                    } else {
                        cancerType.setTumorForm(getTumorForm(cancerType.getTissue()));
                    }
                    if (StringUtils.isNotEmpty(oncotreeCancerType.getParent())) {
                        Optional<CancerType> parentNodeOptional = cancerTypeService.findOneByCode(oncotreeCancerType.getParent());
                        if (parentNodeOptional.isEmpty()) {
                            log.error("Cannot find the parent node {}", oncotreeCancerType.getParent());
                        } else {
                            cancerType.setParent(parentNodeOptional.get());
                        }
                    }
                    cancerTypes.add(cancerTypeService.save(cancerType));
                }
            });

        // Import main types
        cancerTypes
            .stream()
            .map(CancerType::getMainType)
            .collect(Collectors.toSet())
            .forEach(maintype -> {
                List<CancerType> subtypes = cancerTypeService.findAllByMainTypeIs(maintype);
                Set<String> colors = subtypes.stream().map(CancerType::getColor).collect(Collectors.toSet());
                String color = colors.size() > 1 ? MIXED : Optional.ofNullable(colors.iterator().next()).orElse("");

                Set<String> tissues = subtypes.stream().map(CancerType::getTissue).collect(Collectors.toSet());
                String tissue = tissues.size() > 1 ? MIXED : Optional.ofNullable(tissues.iterator().next()).orElse("");

                CancerType cancerType = new CancerType();
                cancerType.setLevel(0);
                cancerType.setMainType(maintype);
                cancerType.setColor(color);
                cancerType.setTissue(tissue);
                cancerType.setTumorForm(getTumorForm(new HashSet<>(subtypes)));
                cancerTypeService.save(cancerType);
            });
    }
}
