import EleventyFetch from "@11ty/eleventy-fetch";
import cheerio from "cheerio";

export async function getBookData(workId) {
  const libraryThingUrl = `https://www.librarything.com/work/${workId}`;

  if (workId === "favicon.ico") return null;

  console.log({ libraryThingUrl });

  const html = await EleventyFetch(libraryThingUrl, {
    type: "text",
    duration: "1d",
  });

  const $ = cheerio.load(html);

  const bookTitle = $(".headsummary h1").text();
  const authorLink = $(".headsummary h2 a");
  const authorName = authorLink.text();
  const authorUrl = authorLink.attr("href");
  const coverImg = $("img.workCoverImage").attr("srcset");

  const descriptionDiv = $(".wslsummary .showmore");
  $(descriptionDiv).find(".showmore_showlink").remove();
  const description = $(descriptionDiv).text();

  const ratingImg = $(".wslcontent").find("img").attr("src");
  const rating = $(".wslcontent .dark_hint").text();

  console.log({ coverImg });

  return {
    title: bookTitle,
    author: {
      name: authorName,
      url: authorUrl,
    },
    description,
    rating,
    ratingImg,
    coverImg,
  };
}
