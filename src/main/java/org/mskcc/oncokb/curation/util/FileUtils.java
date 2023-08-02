package org.mskcc.oncokb.curation.util;

import java.io.*;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.apache.commons.lang3.StringUtils;

public class FileUtils {

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

    /**
     * read a stream and splits each line by a delimiter
     *
     * @param is
     * @param delimiter
     * @param trim
     * @return
     * @throws IOException
     */
    public static List<List<String>> readDelimitedLinesStream(InputStream is, String delimiter, Boolean trim) throws IOException {
        List<List<String>> rows = new ArrayList<>();

        BufferedReader in = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));

        String line;
        while ((line = in.readLine()) != null) {
            List<String> row = Arrays.asList(line.split(delimiter));
            if (trim) {
                row.stream().map(String::trim);
            }
            rows.add(row);
        }

        return rows;
    }
}
