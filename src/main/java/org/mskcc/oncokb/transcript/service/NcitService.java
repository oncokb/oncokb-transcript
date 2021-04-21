package org.mskcc.oncokb.transcript.service;

import static org.mskcc.oncokb.transcript.util.FileUtils.readTrimmedLinesStream;
import static org.mskcc.oncokb.transcript.util.GzipUtils.deCompress;
import static org.mskcc.oncokb.transcript.util.GzipUtils.getZipContent;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.mskcc.oncokb.transcript.domain.Drug;
import org.mskcc.oncokb.transcript.domain.DrugSynonym;
import org.mskcc.oncokb.transcript.domain.Info;
import org.mskcc.oncokb.transcript.domain.enumeration.InfoType;
import org.mskcc.oncokb.transcript.repository.DrugRepository;
import org.mskcc.oncokb.transcript.repository.DrugSynonymRepository;
import org.mskcc.oncokb.transcript.repository.InfoRepository;
import org.mskcc.oncokb.transcript.util.COMPRESSED_FILE_FORMAT;
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

    private final String SYNONYMS_SEPARATOR_REGEX = "\\|\\|";

    @Autowired
    private DrugRepository drugRepository;

    @Autowired
    private DrugSynonymRepository drugSynonymRepository;

    @Autowired
    private InfoRepository infoRepository;

    public String updateNcitDrugs() throws IOException, ApiException {
        String ncitVersion = getNcitLatestVersion();
        if (ncitVersion == null) {
            throw new ApiException("The NCIT README file has no content. Link to the README: " + NCIT_README);
        } else {
            saveNcitData();
            this.updateNcitVersion(ncitVersion);
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
        saveNcitDataToDB(Arrays.asList(os.toString("UTF-8").split("\n")));
    }

    public void saveNcitDataToDB(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (line.startsWith("#")) continue;

            // Skip the title
            if (line.startsWith("Code")) continue;

            String[] parts = line.split("\t");
            if (parts.length >= 2) {
                String code = parts[0];
                String name = parts[1];
                String synonyms = parts.length >= 3 ? parts[2] : null;
                String semanticType = parts.length >= 5 ? parts[4] : null;
                Optional<Drug> matchedDrugOptional = drugRepository.findOneByCode(code);
                if (matchedDrugOptional.isPresent()) {
                    continue;
                }
                Drug drug = new Drug();
                drug.setCode(code);
                drug.setName(name);
                drug.setSemanticType(semanticType);
                if (synonyms != null) {
                    Set<DrugSynonym> synonymSet = Arrays
                        .stream(synonyms.split(SYNONYMS_SEPARATOR_REGEX))
                        .distinct()
                        .map(
                            synonym -> {
                                DrugSynonym drugSynonym = new DrugSynonym();
                                drugSynonym.setName(synonym.trim());
                                drugSynonym.setDrug(drug);
                                return drugSynonym;
                            }
                        )
                        .collect(Collectors.toSet());
                    drug.setDrugSynonyms(synonymSet);
                }
                drugRepository.save(drug);
                drugSynonymRepository.saveAll(drug.getDrugSynonyms());
            }
        }
    }

    private void updateNcitVersion(String ncitVersion) {
        Optional<Info> infoRecord = infoRepository.findOneByType(InfoType.NCIT_VERSION);
        if (infoRecord.isPresent()) {
            infoRecord.get().setValue(ncitVersion);
            infoRecord.get().setLastUpdated(Instant.now());
            infoRepository.save(infoRecord.get());
        } else {
            Info info = new Info();
            info.setType(InfoType.NCIT_VERSION);
            info.setValue(ncitVersion);
            info.setLastUpdated(Instant.now());
            infoRepository.save(info);
        }
    }
}
