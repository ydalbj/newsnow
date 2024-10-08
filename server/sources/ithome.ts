import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"
import { $fetch } from "ofetch"

export default defineSource(async () => {
  const response = await $fetch("https://www.ithome.com/list/")
  const $ = cheerio.load(response)
  const $main = $("#list > div.fl > ul > li")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a.t")
    const url = $a.attr("href")
    const title = $a.text()
    const date = $(el).find("i").text()
    if (url && title && date) {
      const isAd = url?.includes("lapin") || ["神券", "优惠", "补贴", "京东"].find(k => title.includes(k))
      if (!isAd) {
        news.push({
          url,
          title,
          id: url,
          extra: {
            date: tranformToUTC(date),
          },
        })
      }
    }
  })
  return news.sort((m, n) => n.extra!.date > m.extra!.date ? 1 : -1)
    .slice(0, 20)
})