package org.mskcc.oncokb.curation.service;

import static org.mskcc.oncokb.curation.util.FileUtils.readTrimmedLinesStream;
import static org.mskcc.oncokb.curation.util.GzipUtils.deCompress;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.DrugSynonym;
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.mskcc.oncokb.curation.repository.DrugSynonymRepository;
import org.mskcc.oncokb.curation.util.COMPRESSED_FILE_FORMAT;
import org.oncokb.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by Hongxin Zhang on 4/21/21.
 */
@Service
public class NcitService {

    private final String NCIT_DOWNLOAD_URL = "https://evs.nci.nih.gov/ftp1/NCI_Thesaurus/";
    private final String NCIT_README = NCIT_DOWNLOAD_URL + "ReadMe.txt";
    private final String NCIT_DATA_FILE = NCIT_DOWNLOAD_URL + "Thesaurus.FLAT.zip";

    private final String SYNONYMS_SEPARATOR_REGEX = "\\|";

    @Autowired
    private DrugRepository drugRepository;

    @Autowired
    private DrugSynonymRepository drugSynonymRepository;

    @Autowired
    private InfoService infoService;

    public String updateNcitDrugs() throws IOException, ApiException {
        String ncitVersion = getNcitLatestVersion();
        if (ncitVersion == null) {
            throw new ApiException("The NCIT README file has no content. Link to the README: " + NCIT_README);
        } else {
            saveNcitData();
            this.infoService.updateInfo(InfoType.NCIT_VERSION, ncitVersion, Instant.now());
            return ncitVersion;
        }
    }

    private String getNcitLatestVersion() throws IOException {
        URL url = new URL(NCIT_README);
        InputStream is = url.openStream();
        List<String> readmeFileLines = readTrimmedLinesStream(is);
        if (readmeFileLines.size() > 0) {
            return readmeFileLines.get(0);
        } else {
            return null;
        }
    }

    private void saveNcitData() throws IOException {
        URL url = new URL(NCIT_DATA_FILE);
        InputStream is = url.openStream();
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        deCompress(is, os, COMPRESSED_FILE_FORMAT.ZIP);
        saveNcitDataToDB(Arrays.asList(os.toString(Charset.forName("UTF-8")).split("\n")));
    }

    public void saveNcitDataToDB(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (line.startsWith("#")) continue;

            // Skip the title
            if (line.startsWith("Code")) continue;

            String[] parts = line.split("\t");
            if (parts.length >= 6) {
                String code = parts[0];
                Optional<Drug> matchedDrugOptional = drugRepository.findOneByCode(code);

                List<String> synonyms = Arrays
                    .asList((parts[3] == null ? "" : parts[3]).split(SYNONYMS_SEPARATOR_REGEX))
                    .stream()
                    .map(synonym -> synonym.trim())
                    .distinct()
                    .collect(Collectors.toList());
                String name = parts[5];
                if (StringUtils.isEmpty(name) && synonyms.size() > 0) {
                    name = synonyms.get(0);
                }
                String semanticType = parts.length >= 8 ? parts[7] : null;

                if (matchedDrugOptional.isPresent()) {
                    Drug drug = matchedDrugOptional.get();

                    Set<String> existSynonyms = drug.getSynonyms().stream().map(synonym -> synonym.getName()).collect(Collectors.toSet());
                    existSynonyms.add(drug.getName());
                    synonyms
                        .stream()
                        .forEach(synonym -> {
                            if (!existSynonyms.contains(synonym)) {
                                DrugSynonym drugSynonym = new DrugSynonym();
                                drugSynonym.setDrug(drug);
                                drugSynonym.setName(synonym);
                                drugSynonymRepository.save(drugSynonym);
                            }
                        });

                    if (!Objects.equals(drug.getSemanticType(), semanticType)) {
                        drug.setSemanticType(semanticType);
                        drugRepository.save(drug);
                    }
                } else {
                    Drug drug = new Drug();
                    drug.setCode(code);
                    drug.setName(name);
                    drug.setSemanticType(semanticType);
                    if (synonyms != null) {
                        synonyms.remove(name);
                        Set<DrugSynonym> synonymSet = synonyms
                            .stream()
                            .map(synonym -> {
                                DrugSynonym drugSynonym = new DrugSynonym();
                                drugSynonym.setName(synonym.trim());
                                drugSynonym.setDrug(drug);
                                return drugSynonym;
                            })
                            .collect(Collectors.toSet());
                        drug.setSynonyms(synonymSet);
                    }
                    drugRepository.save(drug);
                    drugSynonymRepository.saveAll(drug.getSynonyms());
                }
            }
        }
    }
}
