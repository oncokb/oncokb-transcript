package org.mskcc.oncokb.curation.util;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;

public class FileUtils {

    public static Path getResourcePath(String resourceName) {
        try {
            URL url = ClassLoader.getSystemResource(resourceName);
            if (url == null) {
                return null;
            }
            return Path.of(url.toURI()).normalize();
        } catch (URISyntaxException e) {
            return null;
        }
    }

    /**
     * read local files and return content
     *
     * @param pathToFile
     * @return
     * @throws IOException
     */
    public static String readLocal(String pathToFile) throws IOException {
        return readStream(new FileInputStream(pathToFile));
    }

    /**
     * return remote files and return content
     *
     * @param urlToFile
     * @return
     * @throws IOException
     */
    public static String readRemote(String urlToFile) throws IOException {
        URL url = new URL(urlToFile);
        return readStream(url.openStream());
    }

    /**
     * read a stream and return content
     *
     * @param is
     * @return
     * @throws IOException
     */
    public static String readStream(InputStream is) throws IOException {
        List<String> lines = readTrimmedLinesStream(is);
        return StringUtils.join(lines, "\n");
    }

    public static List<String> readTrimmedLinesStream(InputStream is) throws IOException {
        return readLinesStream(is, true);
    }

    /**
     * read a stream and return lines
     *
     * @param is
     * @return
     * @throws IOException
     */
    public static List<String> readLinesStream(InputStream is, boolean trim) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));

        List<String> lines = new ArrayList<String>();
        String line;
        while ((line = in.readLine()) != null) {
            if (trim) {
                line = line.trim();
            }
            if (!line.isEmpty()) lines.add(line);
        }
        in.close();

        return lines;
    }

    public static boolean deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        return directoryToBeDeleted.delete();
    }
}
