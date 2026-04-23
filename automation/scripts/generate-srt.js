/**
 * generate-srt.js
 * Converts a Whisper transcript (with segments) into properly formatted SRT.
 * Usage: node generate-srt.js '<json_transcript>' > subtitles.srt
 */

/**
 * @param {number} seconds
 * @returns {string} SRT timestamp (HH:MM:SS,mmm)
 */
function toSrtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "00"),
  ].join(":") + "," + String(ms).padStart(3, "0");
}

/**
 * Wraps text into at most 2 lines of max 42 chars each.
 * @param {string} text
 * @returns {string}
 */
function wrapLines(text) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length > 42 && current.length > 0) {
      lines.push(current.trim());
      current = word;
      if (lines.length === 2) break;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current && lines.length < 2) lines.push(current.trim());
  return lines.join("\n");
}

/**
 * @param {object} transcript - Whisper JSON response ({ segments: [{start, end, text}] })
 * @returns {string} SRT file content
 */
function generateSrt(transcript) {
  if (!transcript || !Array.isArray(transcript.segments)) {
    throw new Error("Invalid transcript: missing segments array");
  }

  return transcript.segments
    .map((seg, i) => {
      const index = i + 1;
      const start = toSrtTime(seg.start);
      const end = toSrtTime(seg.end);
      const text = wrapLines(seg.text);
      return `${index}\n${start} --> ${end}\n${text}`;
    })
    .join("\n\n") + "\n";
}

// CLI entry point
if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node generate-srt.js '<whisper_json_string>'");
    process.exit(1);
  }
  try {
    const transcript = JSON.parse(input);
    process.stdout.write(generateSrt(transcript));
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

module.exports = { generateSrt, toSrtTime, wrapLines };
