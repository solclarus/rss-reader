import { type NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    const feed = await parser.parseURL(url);

    const articles =
      feed.items?.map((item) => ({
        title: item.title || "No title",
        link: item.link || "",
        description: item.contentSnippet || item.content || "No description",
        pubDate: item.pubDate || "",
        author: item.creator || item.author || "",
      })) || [];

    // faviconURLを取得
    let faviconUrl = "";
    try {
      const feedUrl = new URL(url);
      const baseUrl = `${feedUrl.protocol}//${feedUrl.hostname}`;
      faviconUrl = `${baseUrl}/favicon.ico`;
    } catch {
      // favicon取得に失敗した場合は空文字
      faviconUrl = "";
    }

    return NextResponse.json({
      success: true,
      feedTitle: feed.title || "Unknown Feed",
      feedDescription: feed.description || "",
      articles,
      faviconUrl,
    });
  } catch (error) {
    console.error("RSS parsing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch or parse RSS feed" },
      { status: 500 },
    );
  }
}
