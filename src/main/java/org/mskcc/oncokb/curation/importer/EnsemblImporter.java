package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.util.FileUtils.readDelimitedLinesStream;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
import org.mskcc.oncokb.curation.domain.SeqRegion;
import org.mskcc.oncokb.curation.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class EnsemblImporter {

    private final String ENSEMBL_VERSION = "v110";

    private final SeqRegionService seqRegionService;

    private final Logger log = LoggerFactory.getLogger(EnsemblImporter.class);

    public EnsemblImporter(SeqRegionService seqRegionService) {
        this.seqRegionService = seqRegionService;
    }

    public void importSeqRegion() throws IOException {
        // Import all chromosomes
        List<String> chromosomes = Arrays.asList(
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
            "24",
            "X",
            "Y",
            "MT"
        );
        for (String chromosome : chromosomes) {
            SeqRegion seqRegion = new SeqRegion();
            seqRegion.setName(chromosome);
            if (chromosome.equals("23")) {
                seqRegion.setChromosome("X");
            } else if (chromosome.equals("24")) {
                seqRegion.setChromosome("Y");
            } else {
                seqRegion.setChromosome(chromosome);
            }
            seqRegionService.save(seqRegion);
        }
        List<List<String>> seqRegions = readFile("seq_region.tsv", true);
        for (List<String> line : seqRegions) {
            SeqRegion seqRegion = new SeqRegion();
            seqRegion.setName(line.get(0));
            if (line.size() >= 2) {
                seqRegion.setChromosome(line.get(1));
            }
            seqRegionService.save(seqRegion);
        }
    }

    private List<List<String>> readFile(String filePath, boolean hasHeader) {
        URL fileUrl = getClass().getClassLoader().getResource("data/transcript/ensembl/" + ENSEMBL_VERSION + "/" + filePath);
        if (fileUrl == null) {
            log.error("Cannot find the file");
            return null;
        }
        InputStream is = null;
        try {
            is = fileUrl.openStream();
            List<List<String>> lines = readDelimitedLinesStream(is, "\\t", true);
            if (hasHeader && lines.size() > 0) {
                lines.remove(0);
            }
            return lines.stream().filter(line -> line.size() > 0 && !line.get(0).startsWith("#")).collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Fail to open file", e.getMessage());
            return new ArrayList<>();
        }
    }
}
