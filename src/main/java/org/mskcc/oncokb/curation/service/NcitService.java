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
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.mskcc.oncokb.curation.repository.SynonymRepository;
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

    @Autowired
    private InfoService infoService;

    public String updateNcitDrugs() throws IOException, ApiException {
        String ncitVersion = getNcitLatestVersion();
        if (ncitVersion == null) {
            throw new ApiException("The NCIT README file has no content. Link to the README: " + NCIT_README);
        } else {
            // update the NCIT pipeline to use the NCI API
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
}
