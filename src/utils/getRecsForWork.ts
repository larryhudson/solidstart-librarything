import EleventyFetch from "@11ty/eleventy-fetch";
import cheerio from "cheerio";

export async function getRecsForWork(workId) {
  const libraryThingUrl = `https://www.librarything.com/work/${workId}/recommendations`;

  const html = await EleventyFetch(libraryThingUrl, {
    type: "text",
    duration: "1d",
  });

  const $ = cheerio.load(html);

  const scriptTag = $(
    'script[data-source="inc_librarything.print_scriptlines_lt1.1"]'
  );

  const trimQuotes = (str) => {
    let workingStr = str;
    let disallowedChars = ["'", ")"];
    if (disallowedChars.includes(workingStr[0])) {
      workingStr = workingStr.slice(1);
    }

    if (disallowedChars.includes(workingStr.slice(-1))) {
      workingStr = workingStr.slice(0, -1);
    }

    return workingStr;
  };

  const scriptTagLines = $(scriptTag)
    .html()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("bsplay.aj"))
    .map((l) => l.slice(10))
    .map((l) => l.split(",").map((w) => trimQuotes(w)));

  const allRecs = await Promise.all(
    scriptTagLines.map(async (line) => {
      const [plantid, divid, type] = line;
      const recsUrl = `https://www.librarything.com/ajax_bsplay.php?plantid=${plantid}&type=${type}&width=908&expanded=0&divid=${divid}`;

      const recsHtml = await EleventyFetch(recsUrl, {
        duration: "1d",
        type: "text",
      });

      const rec$ = cheerio.load(recsHtml);

      let recs = [];

      const typeNames = {
        combo2: "LibraryThing Combined Recommendations",
        ratio: "People with this book also have... (less common)",
        specialsauce: "Special Sauce Recommendations",
        morebythisauthor: "More By This Author",
        tagrecs: "Tag Recommendations",
        simlib: "People with this book also have... (more common)",
      };

      rec$("li").each((index, liElem) => {
        const bookLink = $(liElem).find(".bsplay_t a");
        const authorLink = $(liElem).find(".bsplay_a a");
        const imgTag = $(liElem).find("img");
        recs.push({
          title: bookLink.text(),
          url: bookLink.attr("href"),
          id: bookLink.attr("data-workid"),
          author: {
            name: authorLink.text(),
            url: authorLink.attr("href"),
          },
          img_src: imgTag.attr("lt_src"),
          img_srcset: imgTag.attr("lt_srcset"),
        });
      });

      return { type: typeNames[type], recs };
    })
  );

  return allRecs;
}
