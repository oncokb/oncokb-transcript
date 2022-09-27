package org.mskcc.oncokb.curation.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProcessUtil {

    private static final Logger log = LoggerFactory.getLogger(ProcessUtil.class);

    public static Set<String> findPubmedInfo(String directory) {
        Set<String> pmc = new HashSet<>();
        try (Stream<Path> paths = Files.walk(Paths.get(directory), 1)) {
            // list all pdf and tar.gz files in path
            List<String> files = paths
                .filter(Files::isRegularFile)
                .filter(path -> path.toString().contains(".pdf") || path.toString().contains(".tar.gz"))
                .map(Path::toString)
                .collect(Collectors.toList());
            for (String s : files) {
                int si = 0;
                if (s.lastIndexOf('/') != -1) si = s.lastIndexOf('/') + 1;
                pmc.add(s.substring(si, s.indexOf(".")));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return pmc;
    }

    public static String runScript(String commandline) throws IOException {
        Process p = Runtime.getRuntime().exec(commandline);
        Scanner output = new Scanner(p.getInputStream());
        Scanner error = new Scanner(p.getErrorStream());
        StringBuilder sb = new StringBuilder(512);
        while (p.isAlive()) {}

        while (output.hasNextLine()) sb.append(output.nextLine()).append("\n");
        while (error.hasNextLine()) sb.append(error.nextLine()).append("\n");
        return sb.toString();
    }
}
