import type { WordData } from './words';

/**
 * Source: hefengxian/ielts-vocabulary, vocabulary.txt.
 * Repository: https://github.com/hefengxian/ielts-vocabulary
 * License: MIT. Copyright (c) 2023 Frank.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export interface IeltsSearchedVocabularyEntry {
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  collocations: string[];
  topicLabel: string;
  level: WordData['level'];
}

export const IELTS_SEARCHED_VOCABULARY_SOURCE = {
  name: 'hefengxian/ielts-vocabulary',
  url: 'https://github.com/hefengxian/ielts-vocabulary',
  rawUrl: 'https://raw.githubusercontent.com/hefengxian/ielts-vocabulary/main/vocabulary.txt',
  license: 'MIT',
  copyright: 'Copyright (c) 2023 Frank',
} as const;

export const IELTS_SEARCHED_VOCABULARY_ENTRIES = [
  {
    "word": "atmosphere",
    "partOfSpeech": "n.",
    "definition": "大气层；氛围",
    "example": "The approaching examination created a tense atmosphere on the campus.",
    "collocations": [
      "atmosphere"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "hydrosphere",
    "partOfSpeech": "n.",
    "definition": "水圈；大气中的水汽",
    "example": "All the water in the earth's surface is included in the hydrosphere.",
    "collocations": [
      "hydrosphere"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "lithosphere",
    "partOfSpeech": "n.",
    "definition": "岩石圈",
    "example": "The lithosphere and the hydrosphere together form the earth's surface.",
    "collocations": [
      "lithosphere"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "oxygen",
    "partOfSpeech": "n.",
    "definition": "氧气",
    "example": "",
    "collocations": [
      "oxygen"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "oxide",
    "partOfSpeech": "n.",
    "definition": "氧化物",
    "example": "",
    "collocations": [
      "oxide"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "carbon dioxide",
    "partOfSpeech": "n.",
    "definition": "二氧化碳",
    "example": "",
    "collocations": [
      "carbon dioxide"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "hydrogen",
    "partOfSpeech": "n.",
    "definition": "氢气",
    "example": "",
    "collocations": [
      "hydrogen"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "core",
    "partOfSpeech": "n.",
    "definition": "中心；核心；地核",
    "example": "",
    "collocations": [
      "core"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "crust",
    "partOfSpeech": "n.",
    "definition": "地壳；外壳",
    "example": "The crust on the snow was thick enough for to walk on it.",
    "collocations": [
      "crust"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "mantle",
    "partOfSpeech": "n./v.",
    "definition": "地幔；斗篷；披风；覆盖",
    "example": "Parents often use mantles for their babies to keep warm.",
    "collocations": [
      "mantle"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "longitude",
    "partOfSpeech": "n.",
    "definition": "经度",
    "example": "",
    "collocations": [
      "longitude"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "latitude",
    "partOfSpeech": "n.",
    "definition": "维度",
    "example": "",
    "collocations": [
      "latitude"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "horizon",
    "partOfSpeech": "n.",
    "definition": "地平线；眼界；见识",
    "example": "",
    "collocations": [
      "horizon"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "altitude",
    "partOfSpeech": "n.",
    "definition": "海拔；高度",
    "example": "",
    "collocations": [
      "altitude"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "disaster",
    "partOfSpeech": "n.",
    "definition": "灾难",
    "example": "There was a great flood disaster in East China.",
    "collocations": [
      "a disaster film/movie"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "mishap",
    "partOfSpeech": "n.",
    "definition": "小灾难",
    "example": "A mishap prevented him from attending the routine company meeting.",
    "collocations": [
      "mishap"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "catastrophic",
    "partOfSpeech": "adj.",
    "definition": "灾难性的",
    "example": "If the forecast had been wrong, the consequences could have been catastrophic.",
    "collocations": [
      "catastrophic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "calamity",
    "partOfSpeech": "n.",
    "definition": "灾难；不幸的事",
    "example": "A hurricane would be a calamity for this low-lying coastal region.",
    "collocations": [
      "cause a calamity"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "endanger",
    "partOfSpeech": "v.",
    "definition": "使遭受危险；危及",
    "example": "If you are work hard without reset, you will endanger your health.",
    "collocations": [
      "endangered adj./"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "jeopardise",
    "partOfSpeech": "v.",
    "definition": "=jeopardize 危害；危及",
    "example": "If you are rude to the boss, your chances of success may be jeopardised.",
    "collocations": [
      "jeopardise sb.'s life"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "destructive",
    "partOfSpeech": "adj.",
    "definition": "破坏性的；有害的",
    "example": "Jealousy is an extremely destructive emotion.",
    "collocations": [
      "destructive"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "El Nino",
    "partOfSpeech": "n.",
    "definition": "厄尔尼诺现象",
    "example": "",
    "collocations": [
      "El Nino"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "greenhouse",
    "partOfSpeech": "n.",
    "definition": "温室；暖房",
    "example": "",
    "collocations": [
      "greenhouse"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "phenomenon",
    "partOfSpeech": "n.",
    "definition": "现象",
    "example": "Snow is an almost unknown phenomenon in Egypt.",
    "collocations": [
      "a natural phenomenon",
      "a social phenomenon"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "pebble",
    "partOfSpeech": "n.",
    "definition": "鹅卵石",
    "example": "",
    "collocations": [
      "pebble"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "magnet",
    "partOfSpeech": "n.",
    "definition": "磁铁；吸铁石",
    "example": "He picked all the pins up with a magnet.",
    "collocations": [
      "magnetic adj./"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "ore",
    "partOfSpeech": "n.",
    "definition": "矿石；矿",
    "example": "",
    "collocations": [
      "ore"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "mineral",
    "partOfSpeech": "n.",
    "definition": "矿物；矿物质；矿场",
    "example": "",
    "collocations": [
      "mineral"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "marble",
    "partOfSpeech": "n.",
    "definition": "大理石",
    "example": "",
    "collocations": [
      "marble"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "quartz",
    "partOfSpeech": "n.",
    "definition": "石英",
    "example": "",
    "collocations": [
      "quartz"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "granite",
    "partOfSpeech": "n.",
    "definition": "花岗岩",
    "example": "",
    "collocations": [
      "bit on granite"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "gust",
    "partOfSpeech": "n.",
    "definition": "一整狂风；（情感的）迸发",
    "example": "A gust of wind blew the leaves off the trees.",
    "collocations": [
      "gust"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "breeze",
    "partOfSpeech": "n.",
    "definition": "微分；和风",
    "example": "",
    "collocations": [
      "breeze"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "monsoon",
    "partOfSpeech": "n.",
    "definition": "季风；雨季",
    "example": "",
    "collocations": [
      "monsoon"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "gale",
    "partOfSpeech": "n.",
    "definition": "大风",
    "example": "",
    "collocations": [
      "gale"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "hurricane",
    "partOfSpeech": "n.",
    "definition": "飓风；暴风",
    "example": "",
    "collocations": [
      "hurricane"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "tornado",
    "partOfSpeech": "n.",
    "definition": "龙卷风",
    "example": "",
    "collocations": [
      "tornado"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "typhoon",
    "partOfSpeech": "n.",
    "definition": "台风",
    "example": "",
    "collocations": [
      "typhoon"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "volcano",
    "partOfSpeech": "n.",
    "definition": "火山",
    "example": "",
    "collocations": [
      "volcano"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "erupt",
    "partOfSpeech": "v.",
    "definition": "爆发；喷发；（斑疹等）突然出现",
    "example": "",
    "collocations": [
      "erupt"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "magma",
    "partOfSpeech": "n.",
    "definition": "岩浆",
    "example": "",
    "collocations": [
      "magma"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "thermodynamic",
    "partOfSpeech": "adj.",
    "definition": "热力的；热力学的",
    "example": "",
    "collocations": [
      "thermodynamic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "smog",
    "partOfSpeech": "n.",
    "definition": "烟雾；雾霾",
    "example": "",
    "collocations": [
      "smog"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "fume",
    "partOfSpeech": "n./v.",
    "definition": "（难闻有害的）烟，气体",
    "example": "Petrol fumes from cars are poisoning the atmosphere.",
    "collocations": [
      "fume"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "mist",
    "partOfSpeech": "n.",
    "definition": "薄雾；水汽；使视线模糊的东西",
    "example": "",
    "collocations": [
      "mist"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "tsunami",
    "partOfSpeech": "n.",
    "definition": "海啸",
    "example": "",
    "collocations": [
      "tsunami"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "drought",
    "partOfSpeech": "n.",
    "definition": "干旱；旱灾",
    "example": "",
    "collocations": [
      "drought"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "flooding",
    "partOfSpeech": "n.",
    "definition": "洪水泛滥",
    "example": "",
    "collocations": [
      "flooding"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "torrent",
    "partOfSpeech": "n.",
    "definition": "激流；洪流",
    "example": "",
    "collocations": [
      "torrent"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "earthquake",
    "partOfSpeech": "n.",
    "definition": "地震",
    "example": "",
    "collocations": [
      "earthquake"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "seismic",
    "partOfSpeech": "adj.",
    "definition": "地震的；地震引起的",
    "example": "",
    "collocations": [
      "seismic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "avalanche",
    "partOfSpeech": "n.",
    "definition": "雪崩",
    "example": "",
    "collocations": [
      "avalanche"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "terrain",
    "partOfSpeech": "n.",
    "definition": "地形",
    "example": "",
    "collocations": [
      "terrain"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "landscape",
    "partOfSpeech": "n./v.",
    "definition": "风景；地貌；对...进行景观美化",
    "example": "",
    "collocations": [
      "landscape"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "continent",
    "partOfSpeech": "n.",
    "definition": "大陆；洲",
    "example": "",
    "collocations": [
      "continent"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "cave",
    "partOfSpeech": "n.",
    "definition": "洞穴；山洞",
    "example": "",
    "collocations": [
      "cave"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "cliff",
    "partOfSpeech": "n.",
    "definition": "悬崖；峭壁",
    "example": "",
    "collocations": [
      "cliff"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "glacier",
    "partOfSpeech": "n.",
    "definition": "冰川；冰河",
    "example": "",
    "collocations": [
      "glacier"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "swamp",
    "partOfSpeech": "n.",
    "definition": "沼泽；湿地",
    "example": "",
    "collocations": [
      "swamp"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "delta",
    "partOfSpeech": "n.",
    "definition": "三角洲",
    "example": "",
    "collocations": [
      "delta"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "plain",
    "partOfSpeech": "n./adj.",
    "definition": "平原；简朴的；明白的",
    "example": "",
    "collocations": [
      "plain"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "plateau",
    "partOfSpeech": "n.",
    "definition": "高原",
    "example": "",
    "collocations": [
      "plateau"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "oasis",
    "partOfSpeech": "n.",
    "definition": "绿洲；宜人之地",
    "example": "",
    "collocations": [
      "oasis"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "globe",
    "partOfSpeech": "n.",
    "definition": "球体；地球仪",
    "example": "",
    "collocations": [
      "globe"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "hemisphere",
    "partOfSpeech": "n.",
    "definition": "半球",
    "example": "",
    "collocations": [
      "hemisphere"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "equator",
    "partOfSpeech": "n.",
    "definition": "赤道",
    "example": "",
    "collocations": [
      "equator"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "arctic",
    "partOfSpeech": "adj./n.",
    "definition": "北极的；极冷的；北极地区；北极",
    "example": "",
    "collocations": [
      "arctic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "Antarctic",
    "partOfSpeech": "adj./n.",
    "definition": "南极的；南极地区；南极洲",
    "example": "",
    "collocations": [
      "Antarctic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "pole",
    "partOfSpeech": "n.",
    "definition": "（地）极；截然相反的两极之一",
    "example": "English is spoken from pole to pole.",
    "collocations": [
      "the South Pole"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "polar",
    "partOfSpeech": "adj.",
    "definition": "极地的；近极地的；对立的",
    "example": "In these polar region, the balance of nature has already been disrupted.",
    "collocations": [
      "a polar bear",
      "polarize v."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "axis",
    "partOfSpeech": "n.",
    "definition": "轴；轴线",
    "example": "The earth's axis is the line between the North and South Poles.",
    "collocations": [
      "axis"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "deteriorate",
    "partOfSpeech": "v.",
    "definition": "恶化；变坏",
    "example": "",
    "collocations": [
      "deteriorate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "aggravate",
    "partOfSpeech": "v.",
    "definition": "加重；加剧；使恶化",
    "example": "",
    "collocations": [
      "aggravate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "degrade",
    "partOfSpeech": "v.",
    "definition": "降解；降低...身份；使恶化；使退化",
    "example": "",
    "collocations": [
      "degrade"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "upgrade",
    "partOfSpeech": "v.",
    "definition": "使升级；提高；改善",
    "example": "",
    "collocations": [
      "upgrade"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "erode",
    "partOfSpeech": "v.",
    "definition": "侵蚀；腐蚀",
    "example": "The waves erode the rocks on the shore.",
    "collocations": [
      "erosion n."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "Mediterranean",
    "partOfSpeech": "adj./n.",
    "definition": "地中海的；地中海地区的；地中海；地中海地区",
    "example": "",
    "collocations": [
      "Mediterranean"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "Atlantic",
    "partOfSpeech": "n.",
    "definition": "大西洋",
    "example": "",
    "collocations": [
      "Atlantic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "pacific",
    "partOfSpeech": "adj./n.",
    "definition": "平静的；平和的；太平洋的；太平洋",
    "example": "What a beautiful and pacific place this is.",
    "collocations": [
      "pacify v."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "ocean",
    "partOfSpeech": "n.",
    "definition": "海洋；洋",
    "example": "These creatures live in the depth of the Pacific Ocean.",
    "collocations": [
      "an ocean of/oceans of"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "marine",
    "partOfSpeech": "adj./n.",
    "definition": "海洋的；海生的；海事的；水兵",
    "example": "It is true that a lot of people like marine plants as their food.",
    "collocations": [
      "a marine product"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "navigation",
    "partOfSpeech": "n.",
    "definition": "航海；航行",
    "example": "Navigation is a game for brave people.",
    "collocations": [
      "navigator n."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "gulf",
    "partOfSpeech": "n.",
    "definition": "海湾",
    "example": "",
    "collocations": [
      "gulf"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "beach",
    "partOfSpeech": "n.",
    "definition": "海滩；河滩",
    "example": "",
    "collocations": [
      "beach"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "coast",
    "partOfSpeech": "n.",
    "definition": "海岸；海滨",
    "example": "",
    "collocations": [
      "coast"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "shore",
    "partOfSpeech": "n.",
    "definition": "（海、湖等大水域的）岸；滨",
    "example": "His ship pulled in to the shore at midnight.",
    "collocations": [
      "shore"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "tide",
    "partOfSpeech": "n.",
    "definition": "趋势；潮流；潮汐",
    "example": "The gravitational attraction between the moon and the earth causes tides.",
    "collocations": [
      "tidal adj."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "current",
    "partOfSpeech": "n.",
    "definition": "水流；潮流；电流；气流",
    "example": "He was swept away by the current.",
    "collocations": [
      "current"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "brook",
    "partOfSpeech": "n.",
    "definition": "小河；溪",
    "example": "",
    "collocations": [
      "brook"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "stream",
    "partOfSpeech": "n./v.",
    "definition": "小河；溪；流；流动；流出",
    "example": "",
    "collocations": [
      "stream"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "source",
    "partOfSpeech": "n.",
    "definition": "河的源头；根源",
    "example": "",
    "collocations": [
      "source"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "shallow",
    "partOfSpeech": "adj.",
    "definition": "浅的；肤浅的；浅薄的",
    "example": "",
    "collocations": [
      "shallow"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "superficial",
    "partOfSpeech": "adj.",
    "definition": "表皮的；表层的",
    "example": "",
    "collocations": [
      "superficial"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "flat",
    "partOfSpeech": "adj.",
    "definition": "平躺的；扁平的；单调的",
    "example": "",
    "collocations": [
      "flat"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "smooth",
    "partOfSpeech": "adj.",
    "definition": "光滑的；平稳的；流畅的",
    "example": "",
    "collocations": [
      "smooth"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "rough",
    "partOfSpeech": "adj.",
    "definition": "粗糙的；粗略的",
    "example": "",
    "collocations": [
      "rough"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "sandy",
    "partOfSpeech": "adj.",
    "definition": "含沙的；铺满沙的",
    "example": "",
    "collocations": [
      "sandy"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "stony",
    "partOfSpeech": "adj.",
    "definition": "石头的；多石的",
    "example": "",
    "collocations": [
      "stony"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "vertical",
    "partOfSpeech": "adj.",
    "definition": "垂直的；直立的",
    "example": "",
    "collocations": [
      "vertical"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "steep",
    "partOfSpeech": "adj.",
    "definition": "陡峭的",
    "example": "",
    "collocations": [
      "steep"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "parallel",
    "partOfSpeech": "n./adj./v.",
    "definition": "parallel",
    "example": "平行线；相似之处；平行的；与...相比；比得上.",
    "collocations": [
      "parallel"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "narrow",
    "partOfSpeech": "adj./n.",
    "definition": "狭窄的；有极限的",
    "example": "",
    "collocations": [
      "narrow"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "Oceania",
    "partOfSpeech": "n.",
    "definition": "大洋洲",
    "example": "",
    "collocations": [
      "Oceania"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "peninsula",
    "partOfSpeech": "n.",
    "definition": "半岛",
    "example": "",
    "collocations": [
      "peninsula"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "mild",
    "partOfSpeech": "adj.",
    "definition": "温和的；不严重的",
    "example": "",
    "collocations": [
      "mild"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "heating",
    "partOfSpeech": "n.",
    "definition": "供暖；暖气装置",
    "example": "",
    "collocations": [
      "heating"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "moderate",
    "partOfSpeech": "adj./v.",
    "definition": "适度的；温和的；中等的；使缓和",
    "example": "The wind was strong all day, but it moderated in the evening.",
    "collocations": [
      "a moderate climate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "warm",
    "partOfSpeech": "adj.",
    "definition": "/v.",
    "example": "",
    "collocations": [
      "warm"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "thermal",
    "partOfSpeech": "adj.",
    "definition": "热量的",
    "example": "",
    "collocations": [
      "thermal"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "tropics",
    "partOfSpeech": "n.",
    "definition": "热带地区",
    "example": "",
    "collocations": [
      "tropics"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "arid",
    "partOfSpeech": "adj.",
    "definition": "干燥的；干旱的；枯燥的",
    "example": "",
    "collocations": [
      "arid"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "moist",
    "partOfSpeech": "adj.",
    "definition": "潮湿的；湿润的",
    "example": "",
    "collocations": [
      "moist"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "damp",
    "partOfSpeech": "adj.",
    "definition": "湿气重的；潮湿的",
    "example": "",
    "collocations": [
      "damp"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "humid",
    "partOfSpeech": "adj.",
    "definition": "潮湿的；湿热的",
    "example": "",
    "collocations": [
      "humid"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "frost",
    "partOfSpeech": "n.",
    "definition": "霜；霜冻；严寒",
    "example": "",
    "collocations": [
      "frost"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "hail",
    "partOfSpeech": "n./v.",
    "definition": "冰雹；赞扬；招呼；下冰雹",
    "example": "",
    "collocations": [
      "hail"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "thaw",
    "partOfSpeech": "v./n.",
    "definition": "解冻；融解；融化；解冻时期",
    "example": "The sun thawed the ice and melted the snow.",
    "collocations": [
      "thaw sth./out",
      "shi..."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "chill",
    "partOfSpeech": "v./n.",
    "definition": "使变冷；使恐惧；寒冷；害怕",
    "example": "The bad news cast a chill over the whole family.",
    "collocations": [
      "chilly adj./",
      "chill enthusiasm"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "freeze",
    "partOfSpeech": "v./n.",
    "definition": "结冰；霜冻；严寒期",
    "example": "",
    "collocations": [
      "freeze"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "frigid",
    "partOfSpeech": "adj.",
    "definition": "寒冷的",
    "example": "Hohhot is a frigid city in the winter.",
    "collocations": [
      "the frigid zones"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "tremble",
    "partOfSpeech": "v./n.",
    "definition": "战栗；颤抖",
    "example": "",
    "collocations": [
      "tremble"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "shiver",
    "partOfSpeech": "v.",
    "definition": "颤抖；哆嗦；发抖",
    "example": "She was shivered because she was worried and afraid.",
    "collocations": [
      "shiver with cold"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "thunder",
    "partOfSpeech": "n.",
    "definition": "/v.",
    "example": "",
    "collocations": [
      "thunder"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "lightning",
    "partOfSpeech": "n.",
    "definition": "/v.",
    "example": "",
    "collocations": [
      "lightning"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "downpour",
    "partOfSpeech": "n.",
    "definition": "倾盆大雨",
    "example": "",
    "collocations": [
      "downpour"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "rainfall",
    "partOfSpeech": "n.",
    "definition": "降雨量",
    "example": "",
    "collocations": [
      "rainfall"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "sprinkle",
    "partOfSpeech": "v./n.",
    "definition": "撒；下小雨；少量；小雨",
    "example": "We've only had a sprinkles of rain recently.",
    "collocations": [
      "sprinkle"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "shower",
    "partOfSpeech": "n.",
    "definition": "阵；阵雨；淋浴",
    "example": "The weatherman predicts showers this afternoon.",
    "collocations": [
      "shower"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "Celsius",
    "partOfSpeech": "adj./n.",
    "definition": "摄氏的；摄氏温度",
    "example": "",
    "collocations": [
      "Celsius"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "forecast",
    "partOfSpeech": "n.",
    "definition": "/v.",
    "example": "",
    "collocations": [
      "forecast"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "peak",
    "partOfSpeech": "n./v.",
    "definition": "山峰；顶点；达到最大值",
    "example": "",
    "collocations": [
      "peak"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "mount",
    "partOfSpeech": "v./n.",
    "definition": "渐渐增加；爬上；登上；山",
    "example": "",
    "collocations": [
      "mount"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "range",
    "partOfSpeech": "n.",
    "definition": "山脉；范围",
    "example": "",
    "collocations": [
      "range"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "ridge",
    "partOfSpeech": "n./v.",
    "definition": "山脊；山脉；使隆起",
    "example": "",
    "collocations": [
      "ridge"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "slope",
    "partOfSpeech": "v./n.",
    "definition": "倾斜；有坡度；山坡；斜坡",
    "example": "",
    "collocations": [
      "slope"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "valley",
    "partOfSpeech": "n.",
    "definition": "山谷；溪谷",
    "example": "",
    "collocations": [
      "valley"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "hillside",
    "partOfSpeech": "n.",
    "definition": "小山的山腰；山坡",
    "example": "",
    "collocations": [
      "hillside"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "overlook",
    "partOfSpeech": "v.",
    "definition": "远眺；俯瞰；未注意到",
    "example": "The house on the hill overlooks the village.",
    "collocations": [
      "be easily overlook"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "southern",
    "partOfSpeech": "adj.",
    "definition": "南方的",
    "example": "",
    "collocations": [
      "southern"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "southeast",
    "partOfSpeech": "n.",
    "definition": "/adj.",
    "example": "",
    "collocations": [
      "southeast"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "southwest",
    "partOfSpeech": "n.",
    "definition": "/adj.",
    "example": "",
    "collocations": [
      "southwest"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "northeast",
    "partOfSpeech": "n.",
    "definition": "/adj.",
    "example": "",
    "collocations": [
      "northeast"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "northwest",
    "partOfSpeech": "n.",
    "definition": "/adj.",
    "example": "",
    "collocations": [
      "northwest"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "oriental",
    "partOfSpeech": "adj.",
    "definition": "东方的（尤其指中日）",
    "example": "She has studied the cultures of oriental countries.",
    "collocations": [
      "oriental"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "inevitable",
    "partOfSpeech": "adj.",
    "definition": "必然的；不可避免的",
    "example": "Such a diffcult operation may not succeed, but it's an inevitable gamble.",
    "collocations": [
      "evitable adj."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "irreversible",
    "partOfSpeech": "adj.",
    "definition": "不可逆转的；不可挽回的",
    "example": "",
    "collocations": [
      "irreversible"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "irregularly",
    "partOfSpeech": "adv.",
    "definition": "不规则地；不合常规地",
    "example": "",
    "collocations": [
      "irregularly"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "inappropriate",
    "partOfSpeech": "adj.",
    "definition": "不合适的",
    "example": "",
    "collocations": [
      "inappropriate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "abnormal",
    "partOfSpeech": "adj.",
    "definition": "不正常的；反常的；变态的",
    "example": "",
    "collocations": [
      "abnormal"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "sediment",
    "partOfSpeech": "n.",
    "definition": "沉积物；沉淀物",
    "example": "",
    "collocations": [
      "sediment"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "silt",
    "partOfSpeech": "n./v.",
    "definition": "淤泥；泥沙；使淤塞",
    "example": "",
    "collocations": [
      "silt"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "muddy",
    "partOfSpeech": "adj.",
    "definition": "泥泞的；浑浊的",
    "example": "",
    "collocations": [
      "muddy"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "clay",
    "partOfSpeech": "n.",
    "definition": "黏土；陶土",
    "example": "",
    "collocations": [
      "clay"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "dirt",
    "partOfSpeech": "n.",
    "definition": "污垢；灰尘；泥土",
    "example": "",
    "collocations": [
      "dirt"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "rural",
    "partOfSpeech": "adj.",
    "definition": "农村的；乡村的；田园的",
    "example": "",
    "collocations": [
      "rural"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "suburb",
    "partOfSpeech": "n.",
    "definition": "郊区；郊外；近郊",
    "example": "",
    "collocations": [
      "suburb"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "outskirts",
    "partOfSpeech": "n.",
    "definition": "郊区；市郊",
    "example": "",
    "collocations": [
      "outskirts"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "remote",
    "partOfSpeech": "adj.",
    "definition": "遥远的；偏僻的；疏远的",
    "example": "She came from a remote village.",
    "collocations": [
      "a remote control"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "desolate",
    "partOfSpeech": "adj.",
    "definition": "荒凉的",
    "example": "",
    "collocations": [
      "desolate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "distant",
    "partOfSpeech": "adj.",
    "definition": "疏远的；遥远的",
    "example": "",
    "collocations": [
      "the distant past"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "adjacent",
    "partOfSpeech": "adj.",
    "definition": "邻近的；毗连的",
    "example": "We stayed in adjacent rooms.",
    "collocations": [
      "adjacent to"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "toxic",
    "partOfSpeech": "adj.",
    "definition": "有毒的",
    "example": "All medicines are toxic.",
    "collocations": [
      "poisonous adj.",
      "toxic waste",
      "highly toxic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "pollutant",
    "partOfSpeech": "n.",
    "definition": "污染物质",
    "example": "",
    "collocations": [
      "pollutant"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "contaminate",
    "partOfSpeech": "v.",
    "definition": "污染；弄脏",
    "example": "",
    "collocations": [
      "contaminate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "geology",
    "partOfSpeech": "n.",
    "definition": "地质学；地质状况",
    "example": "",
    "collocations": [
      "geology"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "border",
    "partOfSpeech": "n./v.",
    "definition": "边界；边界地区；镶边；和...毗邻；形成...边界",
    "example": "",
    "collocations": [
      "border"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "margin",
    "partOfSpeech": "n.",
    "definition": "边缘；页边空白；余地",
    "example": "There is no margin for error in our plan.",
    "collocations": [
      "allow a greater margin of"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "fringe",
    "partOfSpeech": "n./adj.",
    "definition": "边缘；刘海；非主要的；而是次要的",
    "example": "We feel it's pretty good and we also offer some good fringe benefits.",
    "collocations": [
      "fringe"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "plate",
    "partOfSpeech": "n.",
    "definition": "板块；盘",
    "example": "",
    "collocations": [
      "plate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "debris",
    "partOfSpeech": "n.",
    "definition": "碎片；残骸",
    "example": "",
    "collocations": [
      "debris"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "crack",
    "partOfSpeech": "v./n.",
    "definition": "破裂；发出爆裂声；裂缝；缝隙",
    "example": "The door opened just a crack.",
    "collocations": [
      "cause a crack"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "gap",
    "partOfSpeech": "n.",
    "definition": "缺口；裂缝；差距；空白",
    "example": "",
    "collocations": [
      "gap"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "splendid",
    "partOfSpeech": "adj.",
    "definition": "极好的；壮观的",
    "example": "You're all doing a splendid job; keep up the good work.",
    "collocations": [
      "a splendid chance"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "grand",
    "partOfSpeech": "adj.",
    "definition": "宏大的；豪华的；宏伟的；极好的",
    "example": "",
    "collocations": [
      "grand"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "magnificent",
    "partOfSpeech": "adj.",
    "definition": "壮丽的；宏伟的；令人印象深刻的",
    "example": "",
    "collocations": [
      "magnificent"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "dramatic",
    "partOfSpeech": "adj.",
    "definition": "戏剧的；引人入胜的",
    "example": "",
    "collocations": [
      "dramatic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "wilderness",
    "partOfSpeech": "n.",
    "definition": "荒野",
    "example": "",
    "collocations": [
      "wilderness"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "desert",
    "partOfSpeech": "n./v.",
    "definition": "沙漠；遗弃",
    "example": "The baby's mother deserted him soon after giving birth.",
    "collocations": [
      "a cultural desert"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "deforest",
    "partOfSpeech": "v.",
    "definition": "毁掉...深林",
    "example": "",
    "collocations": [
      "deforestation n."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "barren",
    "partOfSpeech": "adj.",
    "definition": "贫瘠的；荒芜的；不结果实的",
    "example": "",
    "collocations": [
      "barren"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "fertile",
    "partOfSpeech": "adj.",
    "definition": "富饶的；肥沃的",
    "example": "",
    "collocations": [
      "fertile"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "fertilise",
    "partOfSpeech": "v.",
    "definition": "=fertileze 施肥于",
    "example": "",
    "collocations": [
      "fertilise"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "solar",
    "partOfSpeech": "adj.",
    "definition": "太阳的；日光的",
    "example": "",
    "collocations": [
      "solar"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "lunar",
    "partOfSpeech": "adj.",
    "definition": "月亮的；月球的",
    "example": "",
    "collocations": [
      "lunar"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "calendar",
    "partOfSpeech": "n.",
    "definition": "日历；历法",
    "example": "",
    "collocations": [
      "calendar"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "sunrise",
    "partOfSpeech": "n.",
    "definition": "日出",
    "example": "",
    "collocations": [
      "sunrise"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "eclipse",
    "partOfSpeech": "n.",
    "definition": "日食；月食",
    "example": "",
    "collocations": [
      "eclipse"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "dusk",
    "partOfSpeech": "n.",
    "definition": "黄昏",
    "example": "",
    "collocations": [
      "dusk"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "heaven",
    "partOfSpeech": "n.",
    "definition": "天堂；极乐之地",
    "example": "",
    "collocations": [
      "heaven"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "paradise",
    "partOfSpeech": "n.",
    "definition": "天堂；乐园；福地",
    "example": "",
    "collocations": [
      "paradise"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "sunshine",
    "partOfSpeech": "n.",
    "definition": "阳光；日光",
    "example": "",
    "collocations": [
      "sunshine"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "shade",
    "partOfSpeech": "n./v.",
    "definition": "阴影部分；背阴处；给...遮挡（光线）",
    "example": "",
    "collocations": [
      "shade"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "shadow",
    "partOfSpeech": "n.",
    "definition": "影子",
    "example": "",
    "collocations": [
      "shadow"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "vapour",
    "partOfSpeech": "n.",
    "definition": "=vapor 蒸汽；水汽",
    "example": "",
    "collocations": [
      "vapour"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "evaporate",
    "partOfSpeech": "v.",
    "definition": "使蒸发；消失",
    "example": "",
    "collocations": [
      "evaporate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "circulate",
    "partOfSpeech": "v.",
    "definition": "循环；流通；传播",
    "example": "",
    "collocations": [
      "circulate"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "precipitate",
    "partOfSpeech": "v.",
    "definition": "凝结；沉淀",
    "example": "Clouds usually precipitate as rain or snow.",
    "collocations": [
      "precipitation n."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "reservoir",
    "partOfSpeech": "n.",
    "definition": "水库；蓄水池",
    "example": "",
    "collocations": [
      "reservoir"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "fountain",
    "partOfSpeech": "n.",
    "definition": "喷泉；源泉",
    "example": "",
    "collocations": [
      "fountain"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "spring",
    "partOfSpeech": "n.",
    "definition": "春天；泉水",
    "example": "",
    "collocations": [
      "spring"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "dew",
    "partOfSpeech": "n.",
    "definition": "露水",
    "example": "",
    "collocations": [
      "dew"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "pour",
    "partOfSpeech": "v.",
    "definition": "倾泻；倒；倾盆而下",
    "example": "",
    "collocations": [
      "pour"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "drain",
    "partOfSpeech": "v./n.",
    "definition": "排空；流出；耗竭",
    "example": "",
    "collocations": [
      "drain"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "drip",
    "partOfSpeech": "v.",
    "definition": "滴出（液体）；滴下",
    "example": "",
    "collocations": [
      "drip"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "drown",
    "partOfSpeech": "v.",
    "definition": "淹死；浸泡",
    "example": "",
    "collocations": [
      "drown"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "blow",
    "partOfSpeech": "v./n.",
    "definition": "吹；打击；挫折",
    "example": "",
    "collocations": [
      "blow"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "puff",
    "partOfSpeech": "v./n.",
    "definition": "喷出；喘息；（吹出的）一股；一缕",
    "example": "Don't puff cigarette smoke in my face.",
    "collocations": [
      "puff"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "gush",
    "partOfSpeech": "v./n.",
    "definition": "涌出",
    "example": "",
    "collocations": [
      "gush out",
      "gush from"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "dense",
    "partOfSpeech": "adj.",
    "definition": "密集的；稠密的",
    "example": "",
    "collocations": [
      "density n."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "intensity",
    "partOfSpeech": "n.",
    "definition": "强度；强烈",
    "example": "",
    "collocations": [
      "intensity"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "intensive",
    "partOfSpeech": "adj.",
    "definition": "加强的；集中的；密集的",
    "example": "",
    "collocations": [
      "intensive care unit ICU"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "emerge",
    "partOfSpeech": "v.",
    "definition": "浮现；露出；暴露；摆脱出来",
    "example": "",
    "collocations": [
      "emerge"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "flash",
    "partOfSpeech": "v.",
    "definition": "/n.",
    "example": "",
    "collocations": [
      "flash through sb.'s mind"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "surrounding",
    "partOfSpeech": "adj.",
    "definition": "周围的；附近的",
    "example": "",
    "collocations": [
      "surrounding"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "condition",
    "partOfSpeech": "n.",
    "definition": "条件；情况；状态",
    "example": "",
    "collocations": [
      "condition"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "artificial",
    "partOfSpeech": "adj.",
    "definition": "人造的",
    "example": "",
    "collocations": [
      "artificial"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "synthetic",
    "partOfSpeech": "adj.",
    "definition": "人造的；合成的",
    "example": "Nylon is a synthetic material; it is not from nature.",
    "collocations": [
      "synthetic"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "petrol",
    "partOfSpeech": "n.",
    "definition": "[英]汽油",
    "example": "",
    "collocations": [
      "petrol"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "gas",
    "partOfSpeech": "n.",
    "definition": "气体；[美]汽油",
    "example": "",
    "collocations": [
      "gas"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "gasoline",
    "partOfSpeech": "n.",
    "definition": "[美]汽油",
    "example": "",
    "collocations": [
      "gasoline"
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "petroleum",
    "partOfSpeech": "n.",
    "definition": "石油",
    "example": "Petroleum is an important natural resource.",
    "collocations": [
      "petrology n."
    ],
    "topicLabel": "自然地理",
    "level": "C1"
  },
  {
    "word": "photosynthesis",
    "partOfSpeech": "n.",
    "definition": "光合作用",
    "example": "",
    "collocations": [
      "photosynthesis"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "respire",
    "partOfSpeech": "v.",
    "definition": "呼吸",
    "example": "",
    "collocations": [
      "respire"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "dioxide",
    "partOfSpeech": "n.",
    "definition": "二氧化物",
    "example": "",
    "collocations": [
      "dioxide"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "vegetation",
    "partOfSpeech": "n.",
    "definition": "植物；草木",
    "example": "There is not much vagetation in deserts.",
    "collocations": [
      "vegetable n."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "herb",
    "partOfSpeech": "n.",
    "definition": "药草；香草",
    "example": "",
    "collocations": [
      "herb"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "perennial",
    "partOfSpeech": "n./adj.",
    "definition": "多年生植物；长期的；持久的",
    "example": "These perennials should be planted where they can naturalise.",
    "collocations": [
      "perennial"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "botany",
    "partOfSpeech": "n.",
    "definition": "植物学",
    "example": "",
    "collocations": [
      "botany"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "ecology",
    "partOfSpeech": "n.",
    "definition": "生态学；生态",
    "example": "",
    "collocations": [
      "ecology"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "ecosystem",
    "partOfSpeech": "n.",
    "definition": "生态系统",
    "example": "",
    "collocations": [
      "ecosystem"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "eco-friendly",
    "partOfSpeech": "adj.",
    "definition": "对生态环境友好的",
    "example": "Attention to eco-friendly packaging is increasing.",
    "collocations": [
      "user-friendly adj."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "horticulture",
    "partOfSpeech": "n.",
    "definition": "园艺学；园艺",
    "example": "Horticulture is the industry and science of plant cultivation.",
    "collocations": [
      "horticulture"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "organism",
    "partOfSpeech": "n.",
    "definition": "有机体；生物",
    "example": "",
    "collocations": [
      "organ n."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "genetics",
    "partOfSpeech": "n.",
    "definition": "遗传学",
    "example": "In genetics, genes were formerly called factors.",
    "collocations": [
      "gene n."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "mutation",
    "partOfSpeech": "n.",
    "definition": "突变；变异",
    "example": "",
    "collocations": [
      "mutation"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "variation",
    "partOfSpeech": "n.",
    "definition": "变种；变异",
    "example": "",
    "collocations": [
      "vary v."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "diversity",
    "partOfSpeech": "n.",
    "definition": "多样性",
    "example": "",
    "collocations": [
      "diversity"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "hybridisation",
    "partOfSpeech": "n.",
    "definition": "=bybridization 杂交",
    "example": "",
    "collocations": [
      "hybridcar"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "classify",
    "partOfSpeech": "v.",
    "definition": "分类",
    "example": "Labrarians spend a lot of time classifying books.",
    "collocations": [
      "classified adj."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "reproduce",
    "partOfSpeech": "v.",
    "definition": "繁殖",
    "example": "",
    "collocations": [
      "reproduce"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "evolve",
    "partOfSpeech": "v.",
    "definition": "进化；发展",
    "example": "",
    "collocations": [
      "evolve from"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "fluctuate",
    "partOfSpeech": "v.",
    "definition": "波动；起伏",
    "example": "",
    "collocations": [
      "fluctuate"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "reclaim",
    "partOfSpeech": "v.",
    "definition": "开垦；利用",
    "example": "This land was reclaimed from the sea.",
    "collocations": [
      "reclaim"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "cultivate",
    "partOfSpeech": "v.",
    "definition": "耕作；培养",
    "example": "The farmer is cultivating his land.",
    "collocations": [
      "cultivate the habit of"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "sow",
    "partOfSpeech": "v.",
    "definition": "播种",
    "example": "",
    "collocations": [
      "sow"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "harvest",
    "partOfSpeech": "v./n.",
    "definition": "收割；收获；收成",
    "example": "A good summer harvest is not easy to come by.",
    "collocations": [
      "at the harvest"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "pluck",
    "partOfSpeech": "v.",
    "definition": "采；摘",
    "example": "The pluck a rose for his lover.",
    "collocations": [
      "pluck"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "pick",
    "partOfSpeech": "v.",
    "definition": "拾；摘",
    "example": "",
    "collocations": [
      "pick"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "yield",
    "partOfSpeech": "v./n.",
    "definition": "产出；屈服；服从；产量；投资收益",
    "example": "This land yields well.",
    "collocations": [
      "yielding adj."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "rear",
    "partOfSpeech": "v./n.",
    "definition": "培养；抚养；饲养；后部",
    "example": "Most farmer in this area rear sheep.",
    "collocations": [
      "rear"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "arable",
    "partOfSpeech": "adj.",
    "definition": "适合耕种的",
    "example": "This area changed quickly from arable land to desert.",
    "collocations": [
      "arable"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "plough",
    "partOfSpeech": "n./v.",
    "definition": "=plow 犁；耕",
    "example": "The ground was ploughed and planted with corn.",
    "collocations": [
      "plough"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "spade",
    "partOfSpeech": "n.",
    "definition": "铲；锹",
    "example": "He bought a new spade.",
    "collocations": [
      "spade"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "rake",
    "partOfSpeech": "n./v.",
    "definition": "耙子；耙；搜索",
    "example": "With an ancient rusty rake I went to work.",
    "collocations": [
      "rake up leaves",
      "His is raking it in"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "stack",
    "partOfSpeech": "n./v.",
    "definition": "堆；垛；堆积",
    "example": "I have a stack of homework to do.",
    "collocations": [
      "stack"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "heap",
    "partOfSpeech": "n.",
    "definition": "（大而杂乱的）堆",
    "example": "A heap of clothes was lying in the corner.",
    "collocations": [
      "heap"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "bundle",
    "partOfSpeech": "n.",
    "definition": "捆；包；束",
    "example": "He collected a bundle of sticks.",
    "collocations": [
      "bundle"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "bunch",
    "partOfSpeech": "n.",
    "definition": "一束（花）；一串（钥匙）",
    "example": "I bought a bunch of lilacs 我买了一束丁香花.",
    "collocations": [
      "I'm sorry. I have a bunch of work to do"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "vase",
    "partOfSpeech": "n.",
    "definition": "瓶；花瓶",
    "example": "",
    "collocations": [
      "vase"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "sunlight",
    "partOfSpeech": "n.",
    "definition": "阳光",
    "example": "",
    "collocations": [
      "sunlight"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "short-day",
    "partOfSpeech": "adj.",
    "definition": "短日照的",
    "example": "Soybean is a typical short-day corp 大豆是典型的短日照作物.",
    "collocations": [
      "short-day"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "shade-tolerant",
    "partOfSpeech": "adj.",
    "definition": "耐阴的",
    "example": "",
    "collocations": [
      "shade-tolerant"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "fungus",
    "partOfSpeech": "n.",
    "definition": "真菌",
    "example": "",
    "collocations": [
      "fungus"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "mould",
    "partOfSpeech": "n./v.",
    "definition": "=mold 霉菌；发霉",
    "example": "The walls were black with mould.",
    "collocations": [
      "mould"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "pollen",
    "partOfSpeech": "n./v.",
    "definition": "花粉；给...授粉",
    "example": "Each spring, pollen from nearby plants is blown into the water.",
    "collocations": [
      "pollen"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "germinate",
    "partOfSpeech": "v.",
    "definition": "发芽",
    "example": "Warmth is needed for the seeds to germinate.",
    "collocations": [
      "germinate"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "seed",
    "partOfSpeech": "n.",
    "definition": "种子",
    "example": "The farmers were scattering seeds over the fields.",
    "collocations": [
      "seedling n."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "burgeon",
    "partOfSpeech": "n./v.",
    "definition": "嫩枝；新芽；极速生长；发芽；抽枝",
    "example": "",
    "collocations": [
      "burgeon"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "bud",
    "partOfSpeech": "n.",
    "definition": "芽；苞；蓓蕾",
    "example": "The rose are in bud.",
    "collocations": [
      "break out into bud"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "blossom",
    "partOfSpeech": "v./n.",
    "definition": "开花；花朵",
    "example": "The tree was covered with beautiful pink blossom.",
    "collocations": [
      "blossom"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "bloom",
    "partOfSpeech": "n.",
    "definition": "花朵",
    "example": "The apple trees are out of bloom.",
    "collocations": [
      "bloom"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "scent",
    "partOfSpeech": "n./v.",
    "definition": "气味；香味；使具有香味",
    "example": "The flower scents the air.",
    "collocations": [
      "scent"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "aromatic",
    "partOfSpeech": "adj.",
    "definition": "芳香的",
    "example": "Aromatic plants are often used in cooking.",
    "collocations": [
      "aromatic"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "ripen",
    "partOfSpeech": "v.",
    "definition": "使成熟",
    "example": "The sun ripens the corn.",
    "collocations": [
      "ripe adj."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "fruit",
    "partOfSpeech": "v.",
    "definition": "结果实",
    "example": "The apple trees fruited early this year.",
    "collocations": [
      "fruit"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "wither",
    "partOfSpeech": "v.",
    "definition": "（使）枯萎",
    "example": "The grapes withered on the vine.",
    "collocations": [
      "withered adj."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "decompose",
    "partOfSpeech": "v.",
    "definition": "分解；腐烂",
    "example": "You can apply heat to decompose organic compounds 你可以加热来分解有机化合物.",
    "collocations": [
      "decompose"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "rot",
    "partOfSpeech": "v./n.",
    "definition": "使腐烂；使腐坏；腐烂",
    "example": "",
    "collocations": [
      "rot"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "decay",
    "partOfSpeech": "v.",
    "definition": "腐烂",
    "example": "",
    "collocations": [
      "decay"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "stale",
    "partOfSpeech": "adj.",
    "definition": "不新鲜的；没有新意的；陈腐的",
    "example": "",
    "collocations": [
      "stale"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "rainforest",
    "partOfSpeech": "n.",
    "definition": "雨林",
    "example": "",
    "collocations": [
      "rainforest"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "jungle",
    "partOfSpeech": "n.",
    "definition": "丛林",
    "example": "",
    "collocations": [
      "jungle"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "plantation",
    "partOfSpeech": "n.",
    "definition": "种植园",
    "example": "",
    "collocations": [
      "plantation"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "field",
    "partOfSpeech": "n.",
    "definition": "原野；场地；野外",
    "example": "",
    "collocations": [
      "field"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "terrace",
    "partOfSpeech": "n.",
    "definition": "梯田",
    "example": "",
    "collocations": [
      "terrace"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "timber",
    "partOfSpeech": "n.",
    "definition": "木材；木料；林木",
    "example": "",
    "collocations": [
      "timber"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "charcoal",
    "partOfSpeech": "n.",
    "definition": "木炭",
    "example": "",
    "collocations": [
      "charcoal"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "log",
    "partOfSpeech": "n.",
    "definition": "原木；日志",
    "example": "",
    "collocations": [
      "log"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "logo",
    "partOfSpeech": "n.",
    "definition": "标识；徽标",
    "example": "",
    "collocations": [
      "logo"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "forestry",
    "partOfSpeech": "n.",
    "definition": "林学；林业",
    "example": "",
    "collocations": [
      "forestry"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "branch",
    "partOfSpeech": "n.",
    "definition": "树枝；分支机构；分店",
    "example": "",
    "collocations": [
      "branch"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "trunk",
    "partOfSpeech": "n.",
    "definition": "树干；躯干；大箱子",
    "example": "",
    "collocations": [
      "trunk"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "bough",
    "partOfSpeech": "n.",
    "definition": "大树枝",
    "example": "The window of his car was broken by a bough during last night's storm.",
    "collocations": [
      "bough"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "root",
    "partOfSpeech": "n./v.",
    "definition": "根；使生根",
    "example": "",
    "collocations": [
      "root cause"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "hay",
    "partOfSpeech": "n.",
    "definition": "干草",
    "example": "Make hay with sun shines.",
    "collocations": [
      "hit the hay"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "straw",
    "partOfSpeech": "n.",
    "definition": "稻草；麦秆；吸管",
    "example": "This hat is made of straw.",
    "collocations": [
      "straw"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "reed",
    "partOfSpeech": "n.",
    "definition": "芦苇",
    "example": "The roof is made of dried reed.",
    "collocations": [
      "reed"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "thorn",
    "partOfSpeech": "n.",
    "definition": "刺；荆棘",
    "example": "She got her finger pricked by a thorn.",
    "collocations": [
      "thorny adj.",
      "a thorn in my side/flesh"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "weed",
    "partOfSpeech": "n.",
    "definition": "杂草",
    "example": "",
    "collocations": [
      "weed"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "grass",
    "partOfSpeech": "n.",
    "definition": "草；草地",
    "example": "",
    "collocations": [
      "grass"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "meadow",
    "partOfSpeech": "n.",
    "definition": "草地；牧草",
    "example": "",
    "collocations": [
      "meadow"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "lawn",
    "partOfSpeech": "n.",
    "definition": "草地；草坪",
    "example": "My mother asked me to mow the lawn.",
    "collocations": [
      "lawn"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "olive",
    "partOfSpeech": "n.",
    "definition": "橄榄；橄榄树",
    "example": "",
    "collocations": [
      "olive"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "pine",
    "partOfSpeech": "n.",
    "definition": "松树；松木",
    "example": "",
    "collocations": [
      "pine"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "vine",
    "partOfSpeech": "n.",
    "definition": "葡萄藤",
    "example": "",
    "collocations": [
      "vine"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "violet",
    "partOfSpeech": "n.",
    "definition": "紫罗兰",
    "example": "",
    "collocations": [
      "violet"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "tulip",
    "partOfSpeech": "n.",
    "definition": "郁金香",
    "example": "",
    "collocations": [
      "tulip"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "mint",
    "partOfSpeech": "n./v.",
    "definition": "薄荷；铸币厂；铸造（硬币）",
    "example": "",
    "collocations": [
      "mint"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "reef",
    "partOfSpeech": "n.",
    "definition": "暗礁",
    "example": "",
    "collocations": [
      "reef"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "alga",
    "partOfSpeech": "n.",
    "definition": "海藻",
    "example": "Some of the algea are edible.",
    "collocations": [
      "algal adj."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "enzyme",
    "partOfSpeech": "n.",
    "definition": "酶",
    "example": "",
    "collocations": [
      "enzyme"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "catalyst",
    "partOfSpeech": "n.",
    "definition": "催化剂；促进因素",
    "example": "A catalyst is a substance which speeds up a chemical reaction.",
    "collocations": [
      "a catalyst for changing"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "release",
    "partOfSpeech": "v./n.",
    "definition": "释放；发布",
    "example": "",
    "collocations": [
      "release"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "emission",
    "partOfSpeech": "n.",
    "definition": "排放；散发；排放物",
    "example": "This conference aims to reduce carbon emissions or greenhouse gas emissions around this world.",
    "collocations": [
      "emission"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "absorb",
    "partOfSpeech": "v.",
    "definition": "吸收；吸引全部注意力",
    "example": "",
    "collocations": [
      "absorb"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "circulation",
    "partOfSpeech": "n.",
    "definition": "流通；循环；流传",
    "example": "Sea surface temperature and atmosheric circulation are strongly coupled.",
    "collocations": [
      "circulation"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "exceed",
    "partOfSpeech": "v.",
    "definition": "超出",
    "example": "The driver exceeds the speed limit.",
    "collocations": [
      "exceed expectation"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "uptake",
    "partOfSpeech": "n.",
    "definition": "摄取；领会",
    "example": "The doctor advised me to reduce the salt uptake.",
    "collocations": [
      "uptake"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "nutrient",
    "partOfSpeech": "n.",
    "definition": "营养物质",
    "example": "The nutrient in the soil acts as a stimulus to growth in plants.",
    "collocations": [
      "nutrition n."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "energy",
    "partOfSpeech": "n.",
    "definition": "能源；精力",
    "example": "",
    "collocations": [
      "energy"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "surroundings",
    "partOfSpeech": "n.",
    "definition": "环境可与environment互换",
    "example": "",
    "collocations": [
      "surroundings"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "mechanism",
    "partOfSpeech": "n.",
    "definition": "机制；构造",
    "example": "",
    "collocations": [
      "mechanism"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "counterbalance",
    "partOfSpeech": "n./v.",
    "definition": "其平衡作用的事物；抵消；对...起平衡作用",
    "example": "",
    "collocations": [
      "counterbalance"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "protect",
    "partOfSpeech": "v.",
    "definition": "保护",
    "example": "",
    "collocations": [
      "protect"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "preserve",
    "partOfSpeech": "v.",
    "definition": "保护；维持；保存",
    "example": "",
    "collocations": [
      "preserve"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "conservation",
    "partOfSpeech": "n.",
    "definition": "保护；保存",
    "example": "",
    "collocations": [
      "conservation"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "bushfire",
    "partOfSpeech": "n.",
    "definition": "林区大火",
    "example": "",
    "collocations": [
      "bushfire"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "extinguish",
    "partOfSpeech": "v.",
    "definition": "扑灭（火）；使（想法；感情等）破灭",
    "example": "They tried every means to extinguish the fire.",
    "collocations": [
      "extinguish"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "destruct",
    "partOfSpeech": "v.",
    "definition": "（使）自毁",
    "example": "",
    "collocations": [
      "destruct"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "ruin",
    "partOfSpeech": "v./n.",
    "definition": "毁坏；摧毁；毁灭；废墟",
    "example": "",
    "collocations": [
      "ruin"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "perish",
    "partOfSpeech": "v.",
    "definition": "毁灭；消亡；腐烂",
    "example": "Flowers perish when frost comes.",
    "collocations": [
      "perish"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "demolish",
    "partOfSpeech": "v.",
    "definition": "毁坏；拆除；推翻",
    "example": "The fire demolished the town.",
    "collocations": [
      "demolish"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "infringe",
    "partOfSpeech": "v.",
    "definition": "侵犯；违反",
    "example": "The press infringed a copyright agreement.",
    "collocations": [
      "infringe"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "undermine",
    "partOfSpeech": "v.",
    "definition": "破坏；逐渐削弱",
    "example": "",
    "collocations": [
      "undermine"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "extinction",
    "partOfSpeech": "n.",
    "definition": "灭绝",
    "example": "",
    "collocations": [
      "extinct adj."
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "pattern",
    "partOfSpeech": "n.",
    "definition": "模式；样式；底样",
    "example": "",
    "collocations": [
      "pattern"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "outcome",
    "partOfSpeech": "n.",
    "definition": "结果",
    "example": "We are anxiously awaiting the outcome of their discussion.",
    "collocations": [
      "outcome"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "impact",
    "partOfSpeech": "n.",
    "definition": "影响",
    "example": "",
    "collocations": [
      "impact"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "seasonal",
    "partOfSpeech": "adj.",
    "definition": "季节性的",
    "example": "",
    "collocations": [
      "seasonal"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "experimental",
    "partOfSpeech": "adj.",
    "definition": "实验性的",
    "example": "",
    "collocations": [
      "experimental"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "favourable",
    "partOfSpeech": "adj.",
    "definition": "=favorable 有利的；赞成的；肯定的",
    "example": "",
    "collocations": [
      "favourable"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "productive",
    "partOfSpeech": "adj.",
    "definition": "多产的",
    "example": "",
    "collocations": [
      "productive"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "effective",
    "partOfSpeech": "adj.",
    "definition": "有效的",
    "example": "",
    "collocations": [
      "effective"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "efficient",
    "partOfSpeech": "adj.",
    "definition": "效率高的",
    "example": "",
    "collocations": [
      "efficient"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "considerable",
    "partOfSpeech": "adj.",
    "definition": "相当多的",
    "example": "",
    "collocations": [
      "considerable"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "massive",
    "partOfSpeech": "adj.",
    "definition": "巨大的；大规模的；庞大的",
    "example": "",
    "collocations": [
      "massive"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "immense",
    "partOfSpeech": "adj.",
    "definition": "巨大的",
    "example": "",
    "collocations": [
      "immense"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "maximal",
    "partOfSpeech": "adj.",
    "definition": "最大的",
    "example": "",
    "collocations": [
      "maximal"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "minimal",
    "partOfSpeech": "adj.",
    "definition": "最小的",
    "example": "",
    "collocations": [
      "minimal"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "optimal",
    "partOfSpeech": "adj.",
    "definition": "=optimum 最佳的；最理想的",
    "example": "",
    "collocations": [
      "optimal"
    ],
    "topicLabel": "植物研究",
    "level": "C1"
  },
  {
    "word": "biologist",
    "partOfSpeech": "n.",
    "definition": "生物学家",
    "example": "",
    "collocations": [
      "biologist"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "zoologist",
    "partOfSpeech": "n.",
    "definition": "动物学家",
    "example": "",
    "collocations": [
      "zoologist"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "ecologist",
    "partOfSpeech": "n.",
    "definition": "生态学家",
    "example": "",
    "collocations": [
      "ecologist"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "botanist",
    "partOfSpeech": "n.",
    "definition": "植物学家",
    "example": "",
    "collocations": [
      "botanist"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "mammal",
    "partOfSpeech": "n.",
    "definition": "哺乳动物",
    "example": "",
    "collocations": [
      "mammal"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "primate",
    "partOfSpeech": "n.",
    "definition": "灵长动物",
    "example": "",
    "collocations": [
      "primate"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "vertebrate",
    "partOfSpeech": "n.",
    "definition": "脊椎动物",
    "example": "",
    "collocations": [
      "vertebrate"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "pretail",
    "partOfSpeech": "n.",
    "definition": "爬行动物",
    "example": "",
    "collocations": [
      "pretail"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "amphibian",
    "partOfSpeech": "n./adj.",
    "definition": "两栖动物；两栖的",
    "example": "",
    "collocations": [
      "amphibian"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "carnivore",
    "partOfSpeech": "n.",
    "definition": "肉食动物",
    "example": "",
    "collocations": [
      "carnivore"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "herbivore",
    "partOfSpeech": "n.",
    "definition": "食草动物",
    "example": "",
    "collocations": [
      "herbivore"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "creature",
    "partOfSpeech": "n.",
    "definition": "生物；动物",
    "example": "",
    "collocations": [
      "creature"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "wildlife",
    "partOfSpeech": "n.",
    "definition": "野生动我",
    "example": "",
    "collocations": [
      "wildlife"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "fauna",
    "partOfSpeech": "n.",
    "definition": "（尤指某一地区的）动物群",
    "example": "The park is also home to grizzly bears, and other Rocky Mountain faunas.",
    "collocations": [
      "fauna"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "flora",
    "partOfSpeech": "n.",
    "definition": "（尤指某一地区的）植物群",
    "example": "",
    "collocations": [
      "flora"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "species",
    "partOfSpeech": "n.",
    "definition": "物种",
    "example": "",
    "collocations": [
      "species"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "flock",
    "partOfSpeech": "n./v.",
    "definition": "（羊或鸟）群；聚集",
    "example": "Sheep usually flock togather.",
    "collocations": [
      "flock"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "herd",
    "partOfSpeech": "n.",
    "definition": "兽群；畜群",
    "example": "The herdsman looks after a herd of animals.",
    "collocations": [
      "herd"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "swarm",
    "partOfSpeech": "n.",
    "definition": "（蜜蜂昆虫的）一大群；（快速移动的）人群",
    "example": "",
    "collocations": [
      "swarm"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "throng",
    "partOfSpeech": "n./v.",
    "definition": "人群；群集",
    "example": "",
    "collocations": [
      "throng"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "crowd",
    "partOfSpeech": "n.",
    "definition": "人群；观众；一群人",
    "example": "",
    "collocations": [
      "crowd"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "beast",
    "partOfSpeech": "n.",
    "definition": "野兽；凶残的人；畜生",
    "example": "",
    "collocations": [
      "beast"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "brute",
    "partOfSpeech": "n.",
    "definition": "粗野的人；残忍的人",
    "example": "We all want punish the brute.",
    "collocations": [
      "brute"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "cruel",
    "partOfSpeech": "adj.",
    "definition": "残忍的；残暴的",
    "example": "",
    "collocations": [
      "cruel"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "originate",
    "partOfSpeech": "v.",
    "definition": "发源；来自；创始",
    "example": "",
    "collocations": [
      "originate"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "derive",
    "partOfSpeech": "v.",
    "definition": "得到；（使）源自",
    "example": "I drived a lot of pleasure from meeting new people at college.",
    "collocations": [
      "drive from/be derived from"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "stem",
    "partOfSpeech": "v./n.",
    "definition": "起源于；来自；茎；梗",
    "example": "Correct decisions stem from correct judgments.",
    "collocations": [
      "stem from"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "ancestor",
    "partOfSpeech": "n.",
    "definition": "祖宗；祖先",
    "example": "",
    "collocations": [
      "ancestor"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "descendant",
    "partOfSpeech": "n./v.",
    "definition": "后裔；后代；下降的",
    "example": "",
    "collocations": [
      "descendant"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "offspring",
    "partOfSpeech": "n.",
    "definition": "后代；子孙；产物",
    "example": "",
    "collocations": [
      "offspring"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "subgroup",
    "partOfSpeech": "n.",
    "definition": "子群",
    "example": "According to a subgroup analysis, violence produce more violence.",
    "collocations": [
      "subgroup"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "feed",
    "partOfSpeech": "v.",
    "definition": "供养；喂养；进食",
    "example": "",
    "collocations": [
      "feed"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "breed",
    "partOfSpeech": "v./n.",
    "definition": "饲养；繁殖；品种",
    "example": "",
    "collocations": [
      "breed"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "interbreed",
    "partOfSpeech": "v.",
    "definition": "（使）品种杂交",
    "example": "",
    "collocations": [
      "interbreed"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "hybridize",
    "partOfSpeech": "v.",
    "definition": "=hybridise （使）杂交",
    "example": "",
    "collocations": [
      "hybridize"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "proliferate",
    "partOfSpeech": "v.",
    "definition": "迅速增殖；剧增",
    "example": "",
    "collocations": [
      "proliferate"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "sterility",
    "partOfSpeech": "n.",
    "definition": "不生育",
    "example": "This disease causes sterility in both males and females.",
    "collocations": [
      "sterility"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "mate",
    "partOfSpeech": "v./n.",
    "definition": "交配；配偶",
    "example": "",
    "collocations": [
      "mate"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "courtship",
    "partOfSpeech": "n.",
    "definition": "求偶",
    "example": "",
    "collocations": [
      "courtship"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "lay",
    "partOfSpeech": "v.",
    "definition": "产；放置；铺设",
    "example": "They lay eggs from the July to the middle of August.",
    "collocations": [
      "lay"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "hatch",
    "partOfSpeech": "v./n.",
    "definition": "孵化",
    "example": "",
    "collocations": [
      "hatch"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "brood",
    "partOfSpeech": "n./v.",
    "definition": "一窝幼鸟；孵（蛋）",
    "example": "The bird was trying to find food for its brood.",
    "collocations": [
      "brood"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "spawn",
    "partOfSpeech": "n./v.",
    "definition": "（鱼、蛙的）卵；产卵；引起",
    "example": "",
    "collocations": [
      "spawn"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "mature",
    "partOfSpeech": "adj./v.",
    "definition": "成熟的；成熟",
    "example": "You are a muture man now, you are no longer a boy.",
    "collocations": [
      "immuture adj."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "skin",
    "partOfSpeech": "n.",
    "definition": "皮肤",
    "example": "",
    "collocations": [
      "skin"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "claw",
    "partOfSpeech": "n.",
    "definition": "爪；钳；鳌；爪状物",
    "example": "",
    "collocations": [
      "claw"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "paw",
    "partOfSpeech": "n.",
    "definition": "（动物的）脚掌；爪子",
    "example": "",
    "collocations": [
      "paw"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "beak",
    "partOfSpeech": "n.",
    "definition": "鸟嘴；喙",
    "example": "",
    "collocations": [
      "beak"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "fin",
    "partOfSpeech": "n.",
    "definition": "鳍",
    "example": "",
    "collocations": [
      "fin"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "wing",
    "partOfSpeech": "n.",
    "definition": "翅膀",
    "example": "",
    "collocations": [
      "wing"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "plume",
    "partOfSpeech": "n.",
    "definition": "羽毛",
    "example": "",
    "collocations": [
      "plume"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "feather",
    "partOfSpeech": "n.",
    "definition": "羽毛",
    "example": "",
    "collocations": [
      "feather"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "fur",
    "partOfSpeech": "n.",
    "definition": "软毛；毛皮",
    "example": "",
    "collocations": [
      "fur"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "bristle",
    "partOfSpeech": "n.",
    "definition": "鬃毛",
    "example": "",
    "collocations": [
      "bristle"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "curl",
    "partOfSpeech": "n./v.",
    "definition": "卷曲；螺旋状物；（使）卷曲",
    "example": "",
    "collocations": [
      "curl"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "insect",
    "partOfSpeech": "n.",
    "definition": "昆虫",
    "example": "",
    "collocations": [
      "insect"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "worm",
    "partOfSpeech": "n.",
    "definition": "蠕虫",
    "example": "",
    "collocations": [
      "worm"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "pest",
    "partOfSpeech": "n.",
    "definition": "害虫；有害动物",
    "example": "",
    "collocations": [
      "pest"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "parasite",
    "partOfSpeech": "n.",
    "definition": "寄生虫",
    "example": "The life of hte parasite is maintained by new blood-sucking mosquitoes.",
    "collocations": [
      "parasite"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "spider",
    "partOfSpeech": "n.",
    "definition": "蜘蛛",
    "example": "",
    "collocations": [
      "spider"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "butterfly",
    "partOfSpeech": "n.",
    "definition": "蝴蝶",
    "example": "",
    "collocations": [
      "butterfly"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "mosquito",
    "partOfSpeech": "n.",
    "definition": "蚊子",
    "example": "",
    "collocations": [
      "mosquito"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "cricket",
    "partOfSpeech": "n.",
    "definition": "蟋蟀",
    "example": "",
    "collocations": [
      "cricket"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "penguin",
    "partOfSpeech": "n.",
    "definition": "企鹅",
    "example": "",
    "collocations": [
      "penguin"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "seal",
    "partOfSpeech": "n./v.",
    "definition": "海豹；封条；图章；密封",
    "example": "Polar bears set off in search of their favorite meal-seals.",
    "collocations": [
      "seal"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "tortoise",
    "partOfSpeech": "n.",
    "definition": "龟；陆龟",
    "example": "",
    "collocations": [
      "tortoise"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "turtle",
    "partOfSpeech": "n.",
    "definition": "海龟",
    "example": "",
    "collocations": [
      "turtle"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "whale",
    "partOfSpeech": "n./v.",
    "definition": "鲸；捕鲸",
    "example": "",
    "collocations": [
      "whale"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "kangaroo",
    "partOfSpeech": "n.",
    "definition": "袋鼠",
    "example": "",
    "collocations": [
      "kangaroo"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "camel",
    "partOfSpeech": "n.",
    "definition": "骆驼",
    "example": "",
    "collocations": [
      "camel"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "panda",
    "partOfSpeech": "n.",
    "definition": "熊猫",
    "example": "",
    "collocations": [
      "panda"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "elephant",
    "partOfSpeech": "n.",
    "definition": "大象",
    "example": "",
    "collocations": [
      "elephant"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "ivory",
    "partOfSpeech": "n.",
    "definition": "象牙",
    "example": "The professor lived in an ivory tower.",
    "collocations": [
      "ivory"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "horn",
    "partOfSpeech": "n.",
    "definition": "（牛羊等动物的）角；（乐器的）号",
    "example": "",
    "collocations": [
      "horn"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "bear",
    "partOfSpeech": "n.",
    "definition": "熊",
    "example": "",
    "collocations": [
      "bear"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "wolf",
    "partOfSpeech": "n.",
    "definition": "狼",
    "example": "",
    "collocations": [
      "wolf"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "dragon",
    "partOfSpeech": "n.",
    "definition": "龙；悍妇",
    "example": "Dragons are describes as monsters in most western countries.",
    "collocations": [
      "dragon"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "fox",
    "partOfSpeech": "n.",
    "definition": "狐狸🦊；狡猾的人",
    "example": "",
    "collocations": [
      "fox"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "cub",
    "partOfSpeech": "n.",
    "definition": "幼兽",
    "example": "The cub licked the milk from its mother's breast.",
    "collocations": [
      "cub"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "calf",
    "partOfSpeech": "n.",
    "definition": "幼兽；小牛🐂",
    "example": "Did you see the cow with her calf.",
    "collocations": [
      "calf"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "pup",
    "partOfSpeech": "n.",
    "definition": "幼小动物",
    "example": "I'll get you an Alsatian pup for Christmas.",
    "collocations": [
      "puppy n."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "lamb",
    "partOfSpeech": "n.",
    "definition": "羔羊",
    "example": "The little lamb was caught by the wolf.",
    "collocations": [
      "a lost lamb"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "cattle",
    "partOfSpeech": "n.",
    "definition": "牛",
    "example": "",
    "collocations": [
      "cattle"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "ox",
    "partOfSpeech": "n.",
    "definition": "（阉割的）公牛",
    "example": "",
    "collocations": [
      "ox"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "bull",
    "partOfSpeech": "n.",
    "definition": "公牛",
    "example": "He was a great bull of a man.",
    "collocations": [
      "bull"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "buffalo",
    "partOfSpeech": "n.",
    "definition": "水牛；野牛",
    "example": "",
    "collocations": [
      "buffalo"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "horse",
    "partOfSpeech": "n.",
    "definition": "马🐴",
    "example": "",
    "collocations": [
      "horse"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "zebra",
    "partOfSpeech": "n.",
    "definition": "斑马🦓",
    "example": "",
    "collocations": [
      "zebra"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "donkey",
    "partOfSpeech": "n.",
    "definition": "驴子",
    "example": "",
    "collocations": [
      "donkey"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "saddle",
    "partOfSpeech": "n.",
    "definition": "鞍；马鞍；车座",
    "example": "He was putting a saddle on the horse.",
    "collocations": [
      "get into the saddle"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "harness",
    "partOfSpeech": "n.",
    "definition": "马具；挽具",
    "example": "You cannot judge a horse by harness.",
    "collocations": [
      "in harness"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "falcon",
    "partOfSpeech": "n.",
    "definition": "隼；猎鹰",
    "example": "",
    "collocations": [
      "falcon"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "hawk",
    "partOfSpeech": "n.",
    "definition": "鹰；隼",
    "example": "",
    "collocations": [
      "hawk"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "eagle",
    "partOfSpeech": "n.",
    "definition": "雕",
    "example": "",
    "collocations": [
      "eagle"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "owl",
    "partOfSpeech": "n.",
    "definition": "猫头鹰",
    "example": "",
    "collocations": [
      "owl"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "swallow",
    "partOfSpeech": "n.",
    "definition": "燕子",
    "example": "",
    "collocations": [
      "swallow"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "sparrow",
    "partOfSpeech": "n.",
    "definition": "麻雀",
    "example": "",
    "collocations": [
      "sparrow"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "pigeon",
    "partOfSpeech": "n.",
    "definition": "鸽子",
    "example": "",
    "collocations": [
      "pigeon"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "crow",
    "partOfSpeech": "n.",
    "definition": "乌鸦",
    "example": "",
    "collocations": [
      "crow"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "swan",
    "partOfSpeech": "n.",
    "definition": "天鹅",
    "example": "",
    "collocations": [
      "swan"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "goose",
    "partOfSpeech": "n.",
    "definition": "鹅；鹅肉",
    "example": "",
    "collocations": [
      "goose"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "cock",
    "partOfSpeech": "n.",
    "definition": "公鸡；雄禽",
    "example": "",
    "collocations": [
      "cock"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "mouse",
    "partOfSpeech": "n.",
    "definition": "老鼠；鼠标",
    "example": "",
    "collocations": [
      "mouse"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "rat",
    "partOfSpeech": "n.",
    "definition": "老鼠；卑鄙的人",
    "example": "",
    "collocations": [
      "rat"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "squirrel",
    "partOfSpeech": "n.",
    "definition": "松树",
    "example": "",
    "collocations": [
      "squirrel"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "hare",
    "partOfSpeech": "n.",
    "definition": "野兔",
    "example": "",
    "collocations": [
      "hare"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "frog",
    "partOfSpeech": "n.",
    "definition": "青蛙",
    "example": "",
    "collocations": [
      "frog"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "behaviour",
    "partOfSpeech": "n.",
    "definition": "=behavior 行为；活动方式",
    "example": "",
    "collocations": [
      "behaviour"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "bite",
    "partOfSpeech": "v./n.",
    "definition": "咬；（昆虫）叮；吞饵",
    "example": "",
    "collocations": [
      "bite"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "sting",
    "partOfSpeech": "v./n.",
    "definition": "刺；叮；（使）感觉刺痛；鳌针；蜇痛",
    "example": "It is the nature of the scorpion to sting.",
    "collocations": [
      "stigng sb. into doing sth."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "bark",
    "partOfSpeech": "v./n.",
    "definition": "吠；大声嚷；树皮",
    "example": "",
    "collocations": [
      "bark"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "roar",
    "partOfSpeech": "n./v.",
    "definition": "吼叫；咆哮",
    "example": "",
    "collocations": [
      "roar"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "rub",
    "partOfSpeech": "v./n.",
    "definition": "擦；摩擦；困难；障碍",
    "example": "",
    "collocations": [
      "rub"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "creep",
    "partOfSpeech": "v.",
    "definition": "爬行；悄悄地爬行",
    "example": "We take off our shoes and creep cautiously along the passage.",
    "collocations": [
      "creep along"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "crawl",
    "partOfSpeech": "v.",
    "definition": "爬；爬行；卑躬屈膝；巴结",
    "example": "",
    "collocations": [
      "crawl"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "habitat",
    "partOfSpeech": "n.",
    "definition": "栖息地",
    "example": "",
    "collocations": [
      "habitat"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "nest",
    "partOfSpeech": "n.",
    "definition": "巢；窝；穴",
    "example": "",
    "collocations": [
      "nest"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "hive",
    "partOfSpeech": "n./v.",
    "definition": "蜂房；繁忙的场所；（使）入蜂箱；（像蜜蜂般）密集群居",
    "example": "",
    "collocations": [
      "hive"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "cell",
    "partOfSpeech": "n.",
    "definition": "蜂房巢室；细胞；单人牢房",
    "example": "",
    "collocations": [
      "cell"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "cage",
    "partOfSpeech": "n.",
    "definition": "笼子",
    "example": "",
    "collocations": [
      "cage"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "stable",
    "partOfSpeech": "n./adj.",
    "definition": "马厩；牛棚；稳定的",
    "example": "",
    "collocations": [
      "stable"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "barn",
    "partOfSpeech": "n.",
    "definition": "谷仓；牲口棚",
    "example": "",
    "collocations": [
      "barn"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "hedge",
    "partOfSpeech": "n.",
    "definition": "树篱；障碍物",
    "example": "There is a opening in the hedge.",
    "collocations": [
      "on the hedge"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "barrier",
    "partOfSpeech": "n.",
    "definition": "障碍",
    "example": "",
    "collocations": [
      "barrier"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "bar",
    "partOfSpeech": "n.",
    "definition": "栅；栏杆；条；长块",
    "example": "",
    "collocations": [
      "bar"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "anatomy",
    "partOfSpeech": "n.",
    "definition": "解剖学",
    "example": "",
    "collocations": [
      "anatomy"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "epidemic",
    "partOfSpeech": "n./adj.",
    "definition": "流行病；（坏事的）盛行；流行性的；极为盛行的",
    "example": "",
    "collocations": [
      "epidemic"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "gene",
    "partOfSpeech": "n.",
    "definition": "基因",
    "example": "",
    "collocations": [
      "gene"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "germ",
    "partOfSpeech": "n.",
    "definition": "微生物；细菌",
    "example": "",
    "collocations": [
      "germ"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "bacteria",
    "partOfSpeech": "n.",
    "definition": "细菌；bacterium 的复数形式",
    "example": "",
    "collocations": [
      "bacteria"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "virus",
    "partOfSpeech": "n.",
    "definition": "病毒",
    "example": "",
    "collocations": [
      "virus"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "microbe",
    "partOfSpeech": "n.",
    "definition": "微生物",
    "example": "",
    "collocations": [
      "microbe"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "metabolism",
    "partOfSpeech": "n.",
    "definition": "新陈代谢",
    "example": "",
    "collocations": [
      "metabolism"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "protein",
    "partOfSpeech": "n.",
    "definition": "蛋白质",
    "example": "You need more protein to build you up.",
    "collocations": [
      "protein"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "vitamin",
    "partOfSpeech": "n.",
    "definition": "维生素",
    "example": "",
    "collocations": [
      "vitamin"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "secrete",
    "partOfSpeech": "v.",
    "definition": "分泌",
    "example": "The kidneys secrete urine.",
    "collocations": [
      "secret n."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "excrete",
    "partOfSpeech": "v.",
    "definition": "排泄；分泌",
    "example": "The function of kidneys are excrete waste products.",
    "collocations": [
      "excrete"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "devour",
    "partOfSpeech": "v.",
    "definition": "吞食；狼吞虎咽的吃",
    "example": "",
    "collocations": [
      "devour"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "instinct",
    "partOfSpeech": "n.",
    "definition": "本能；天性；直觉",
    "example": "",
    "collocations": [
      "instinct"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "intuitive",
    "partOfSpeech": "adj.",
    "definition": "直觉的",
    "example": "",
    "collocations": [
      "intuitive"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "potential",
    "partOfSpeech": "n./adj.",
    "definition": "潜力；潜在的",
    "example": "",
    "collocations": [
      "potential"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "intelligence",
    "partOfSpeech": "n.",
    "definition": "智慧；智力；情报；谍报",
    "example": "Use your intelligence, and you're succeed some day.",
    "collocations": [
      "intelligent adj."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "functional",
    "partOfSpeech": "adj.",
    "definition": "功能的；起作用的",
    "example": "",
    "collocations": [
      "functional"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "sensitive",
    "partOfSpeech": "adj.",
    "definition": "灵敏的；易担忧的；需谨慎对待的",
    "example": "",
    "collocations": [
      "sensitive"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "flexible",
    "partOfSpeech": "adj.",
    "definition": "灵活的；弹性的",
    "example": "",
    "collocations": [
      "flexible"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "acoustic",
    "partOfSpeech": "adj.",
    "definition": "听觉的；声音的",
    "example": "",
    "collocations": [
      "acoustic"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "optical",
    "partOfSpeech": "adj.",
    "definition": "视觉的；光学的",
    "example": "",
    "collocations": [
      "optical"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "nocturnal",
    "partOfSpeech": "adj.",
    "definition": "夜间活动的",
    "example": "Hamsters are nocturnal creatures.",
    "collocations": [
      "nocturnal"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "dormant",
    "partOfSpeech": "adj.",
    "definition": "睡着的；休眠的；（动物等）冬眠的",
    "example": "",
    "collocations": [
      "dormant"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "hibernation",
    "partOfSpeech": "n.",
    "definition": "冬眠",
    "example": "",
    "collocations": [
      "hibernation"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "track",
    "partOfSpeech": "v./n.",
    "definition": "追踪；足迹；踪迹；轨道",
    "example": "",
    "collocations": [
      "track"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "trace",
    "partOfSpeech": "v./n.",
    "definition": "追踪；查出；追溯；痕迹；少许",
    "example": "They traced the criminal to a house in the city.",
    "collocations": [
      "a trace of"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "alternate",
    "partOfSpeech": "v.",
    "definition": "（使）交替；（使）轮流",
    "example": "Sunny weather alternated with rain.",
    "collocations": [
      "alternative adj."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "prey",
    "partOfSpeech": "n./v.",
    "definition": "猎物；捕食",
    "example": "",
    "collocations": [
      "prey"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "predator",
    "partOfSpeech": "n.",
    "definition": "掠夺者；捕食性动物",
    "example": "",
    "collocations": [
      "predator"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "victim",
    "partOfSpeech": "n.",
    "definition": "受害者",
    "example": "",
    "collocations": [
      "victim"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "captive",
    "partOfSpeech": "n./adj.",
    "definition": "俘虏；被关押的；收控制的",
    "example": "",
    "collocations": [
      "captive"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "defensive",
    "partOfSpeech": "adj.",
    "definition": "防御性的",
    "example": "we took a defensive attitude in the negotiation.",
    "collocations": [
      "defend v."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "undergo",
    "partOfSpeech": "v.",
    "definition": "经历；经受",
    "example": "",
    "collocations": [
      "undergo"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "suffer",
    "partOfSpeech": "v.",
    "definition": "遭受；受折磨；变糟",
    "example": "",
    "collocations": [
      "suffer"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "vulnerable",
    "partOfSpeech": "adj.",
    "definition": "易受伤的；脆弱的",
    "example": "",
    "collocations": [
      "vulnerable"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "subsistence",
    "partOfSpeech": "n.",
    "definition": "勉强维持生活",
    "example": "The standard of living at that time was on the edge of subsistence 当时的生活水平出于勉强维生边缘.",
    "collocations": [
      "subsistence"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "exist",
    "partOfSpeech": "v.",
    "definition": "存在；生存",
    "example": "",
    "collocations": [
      "exist"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "exterminate",
    "partOfSpeech": "v.",
    "definition": "消灭；根除",
    "example": "We've made great efforts to exterminate mosquitoes and flies.",
    "collocations": [
      "exterminate"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "tame",
    "partOfSpeech": "v./adj.",
    "definition": "驯养；制服；驯服的；乏味的",
    "example": "The tame lions can communicate and dance togather with the actors.",
    "collocations": [
      "tame nature"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "keeper",
    "partOfSpeech": "n.",
    "definition": "看守人；饲养员",
    "example": "",
    "collocations": [
      "keeper"
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "shepherd",
    "partOfSpeech": "n.",
    "definition": "牧羊人，羊倌",
    "example": "The shepherd set out to look for sheep that had wandered away.",
    "collocations": [
      "sheepdog n."
    ],
    "topicLabel": "动物保护",
    "level": "C1"
  },
  {
    "word": "galaxy",
    "partOfSpeech": "n.",
    "definition": "星系",
    "example": "The sun is only a very small start in the Galaxy.",
    "collocations": [
      "the Galaxy"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "cosmos",
    "partOfSpeech": "n.",
    "definition": "宇宙",
    "example": "",
    "collocations": [
      "cosmos"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "universe",
    "partOfSpeech": "n.",
    "definition": "宇宙；万物；世界",
    "example": "",
    "collocations": [
      "universe"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "interstellar",
    "partOfSpeech": "adj.",
    "definition": "星际的",
    "example": "These elements become part of the interstellar gas and dust.",
    "collocations": [
      "interstellar"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "terrestrial",
    "partOfSpeech": "adj.",
    "definition": "地球的；陆地的",
    "example": "",
    "collocations": [
      "terrestrial"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "celestial",
    "partOfSpeech": "adj.",
    "definition": "天上的",
    "example": "",
    "collocations": [
      "celestial"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "astronomy",
    "partOfSpeech": "n.",
    "definition": "天文学",
    "example": "",
    "collocations": [
      "astronomy"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "astrology",
    "partOfSpeech": "n.",
    "definition": "占星术；占星学",
    "example": "",
    "collocations": [
      "astrology"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "astronaut",
    "partOfSpeech": "n.",
    "definition": "宇航员",
    "example": "",
    "collocations": [
      "astronaut"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "comet",
    "partOfSpeech": "n.",
    "definition": "彗星",
    "example": "",
    "collocations": [
      "comet"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "meteorite",
    "partOfSpeech": "n.",
    "definition": "陨石",
    "example": "",
    "collocations": [
      "meteorite"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "crater",
    "partOfSpeech": "n.",
    "definition": "（撞击或爆炸形成的）坑",
    "example": "They came to the lip of a dead volcanic crater.",
    "collocations": [
      "crater"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "dust",
    "partOfSpeech": "n.",
    "definition": "尘土；灰尘",
    "example": "",
    "collocations": [
      "dust"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "ash",
    "partOfSpeech": "n.",
    "definition": "灰烬",
    "example": "",
    "collocations": [
      "ash"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "envelope",
    "partOfSpeech": "n.",
    "definition": "外裹物；外层",
    "example": "The surface of the sun is a glowing gas envelope.",
    "collocations": [
      "envelope"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "chunk",
    "partOfSpeech": "n.",
    "definition": "厚块",
    "example": "My mother bought a chunk of meat.",
    "collocations": [
      "a chunk of"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "spacecraft",
    "partOfSpeech": "n.",
    "definition": "宇宙飞船",
    "example": "",
    "collocations": [
      "spacecraft"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "spaceship",
    "partOfSpeech": "n.",
    "definition": "宇宙飞船",
    "example": "",
    "collocations": [
      "spaceship"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "probe",
    "partOfSpeech": "n.",
    "definition": "太空探测器；详尽调查",
    "example": "Their probe into the cause of the fire proved futile.",
    "collocations": [
      "probe"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "module",
    "partOfSpeech": "n.",
    "definition": "模块",
    "example": "",
    "collocations": [
      "module"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "propulsion",
    "partOfSpeech": "n.",
    "definition": "推进力",
    "example": "This aircraft works by jet propulsion.",
    "collocations": [
      "propulsion"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "pressure",
    "partOfSpeech": "n.",
    "definition": "压力",
    "example": "",
    "collocations": [
      "pressure"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "dynamics",
    "partOfSpeech": "n.",
    "definition": "动力学；动态",
    "example": "",
    "collocations": [
      "dynamics"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "motion",
    "partOfSpeech": "n.",
    "definition": "作物；移动",
    "example": "",
    "collocations": [
      "motion"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "vent",
    "partOfSpeech": "n./v.",
    "definition": "排气口；排放；发泄",
    "example": "",
    "collocations": [
      "vent"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "tail",
    "partOfSpeech": "n.",
    "definition": "尾部",
    "example": "",
    "collocations": [
      "tail"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "curve",
    "partOfSpeech": "n.",
    "definition": "曲线；弧线",
    "example": "",
    "collocations": [
      "curve"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "exploration",
    "partOfSpeech": "n.",
    "definition": "探索",
    "example": "",
    "collocations": [
      "exploration"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "expedition",
    "partOfSpeech": "n.",
    "definition": "远征；探险",
    "example": "",
    "collocations": [
      "expedition"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "flyby",
    "partOfSpeech": "n.",
    "definition": "（航天器对行星或卫星的）飞掠",
    "example": "",
    "collocations": [
      "flyby"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "observatory",
    "partOfSpeech": "n.",
    "definition": "天文台",
    "example": "",
    "collocations": [
      "observatory"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "telescope",
    "partOfSpeech": "n.",
    "definition": "望远镜",
    "example": "",
    "collocations": [
      "telescope"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "spectacle",
    "partOfSpeech": "n.",
    "definition": "壮观的景象；奇观",
    "example": "The sunrise was a splendid spectacle.",
    "collocations": [
      "spectacular adj."
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "orbit",
    "partOfSpeech": "n.",
    "definition": "轨道",
    "example": "",
    "collocations": [
      "orbit"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "ecliptic",
    "partOfSpeech": "n.",
    "definition": "黄道",
    "example": "",
    "collocations": [
      "ecliptic"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "diameter",
    "partOfSpeech": "n.",
    "definition": "直径",
    "example": "",
    "collocations": [
      "diameter"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "radius",
    "partOfSpeech": "n.",
    "definition": "半径",
    "example": "",
    "collocations": [
      "radius"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "substance",
    "partOfSpeech": "n.",
    "definition": "物质；实质；要旨",
    "example": "",
    "collocations": [
      "substance"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "composition",
    "partOfSpeech": "n.",
    "definition": "成分；构成；作品；创作",
    "example": "",
    "collocations": [
      "composition"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "compound",
    "partOfSpeech": "n./adj./v.",
    "definition": "混合物；化合物。复合的；组合的。混合",
    "example": "English loves compound words: \"washing machine\" and that sort of thing.",
    "collocations": [
      "compound"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "fossil",
    "partOfSpeech": "n.",
    "definition": "化石",
    "example": "",
    "collocations": [
      "fossil"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "sample",
    "partOfSpeech": "n.",
    "definition": "样品；样本",
    "example": "",
    "collocations": [
      "sample"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "specimen",
    "partOfSpeech": "n.",
    "definition": "样品；标本",
    "example": "",
    "collocations": [
      "specimen"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "particle",
    "partOfSpeech": "n.",
    "definition": "颗粒；微粒；极小量",
    "example": "",
    "collocations": [
      "particle"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "molecule",
    "partOfSpeech": "n.",
    "definition": "分子",
    "example": "",
    "collocations": [
      "molecule"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "atom",
    "partOfSpeech": "n.",
    "definition": "原子",
    "example": "",
    "collocations": [
      "atom"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "ion",
    "partOfSpeech": "n.",
    "definition": "离子",
    "example": "",
    "collocations": [
      "ion"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "electron",
    "partOfSpeech": "n.",
    "definition": "电子",
    "example": "",
    "collocations": [
      "electron"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "quantum",
    "partOfSpeech": "n.",
    "definition": "量子",
    "example": "In this example, we employed the quantum mechanics principle.",
    "collocations": [
      "quantum"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "liquid",
    "partOfSpeech": "n./adj.",
    "definition": "液体；液体的",
    "example": "",
    "collocations": [
      "liquid"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "fluid",
    "partOfSpeech": "n./adj.",
    "definition": "液体；流体。流动的",
    "example": "When you are sick, you should drink plenty of fluids.",
    "collocations": [
      "fluid"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "solid",
    "partOfSpeech": "n./adj.",
    "definition": "固体。固体的；牢固的",
    "example": "",
    "collocations": [
      "solid"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "synthesis",
    "partOfSpeech": "v.",
    "definition": "=synthesize 合成；综合",
    "example": "Darwinian theory has been synthesised with modern genetics.",
    "collocations": [
      "synthesis"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "formation",
    "partOfSpeech": "n.",
    "definition": "形成",
    "example": "",
    "collocations": [
      "formation"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "method",
    "partOfSpeech": "n.",
    "definition": "方法",
    "example": "",
    "collocations": [
      "method"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "spectrum",
    "partOfSpeech": "n.",
    "definition": "光谱；范围",
    "example": "",
    "collocations": [
      "spectrum"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "dimension",
    "partOfSpeech": "n.",
    "definition": "维度",
    "example": "",
    "collocations": [
      "dimension"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "frequency",
    "partOfSpeech": "n.",
    "definition": "频率；发生次数",
    "example": "",
    "collocations": [
      "frequency"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "signal",
    "partOfSpeech": "n.",
    "definition": "信号",
    "example": "",
    "collocations": [
      "signal"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "antenna",
    "partOfSpeech": "n.",
    "definition": "天线",
    "example": "",
    "collocations": [
      "antenna"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "circuit",
    "partOfSpeech": "n.",
    "definition": "线路；电路；巡回",
    "example": "For many years, He was the banana on the cicruit.",
    "collocations": [
      "circuit"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "refraction",
    "partOfSpeech": "n.",
    "definition": "折射",
    "example": "",
    "collocations": [
      "refraction"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "ultraviolet",
    "partOfSpeech": "n./adj.",
    "definition": "紫外辐射。紫外线的",
    "example": "",
    "collocations": [
      "ultraviolet"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "radioactive",
    "partOfSpeech": "adj.",
    "definition": "放射性的",
    "example": "",
    "collocations": [
      "radioactive"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "distinct",
    "partOfSpeech": "adj.",
    "definition": "明显的；截然不同的",
    "example": "",
    "collocations": [
      "distinct"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "discernible",
    "partOfSpeech": "adj.",
    "definition": "可辨别的；看得清的",
    "example": "Night fell, but the outline of the factory buildings was still discernible.",
    "collocations": [
      "discernible"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "invisible",
    "partOfSpeech": "adj.",
    "definition": "看不见的",
    "example": "",
    "collocations": [
      "invisible"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "collision",
    "partOfSpeech": "n.",
    "definition": "碰撞事故；冲突",
    "example": "",
    "collocations": [
      "collision"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "squash",
    "partOfSpeech": "v./n.",
    "definition": "压扁；壁球",
    "example": "",
    "collocations": [
      "squash"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "fragment",
    "partOfSpeech": "n./v.",
    "definition": "碎片；片段；（使）碎裂",
    "example": "",
    "collocations": [
      "fragment"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "cataclysmic",
    "partOfSpeech": "adj.",
    "definition": "剧变的；灾难的",
    "example": "One can readily trace the disappearance of dinosaurs to a cataclysmic.",
    "collocations": [
      "cataclysmic"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "overwhelming",
    "partOfSpeech": "adj.",
    "definition": "压倒性的",
    "example": "",
    "collocations": [
      "overwhelming"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "despair",
    "partOfSpeech": "v./n.",
    "definition": "绝望",
    "example": "",
    "collocations": [
      "despair"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "desperate",
    "partOfSpeech": "adj.",
    "definition": "绝望的；急需要的",
    "example": "",
    "collocations": [
      "desperate"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "hopeless",
    "partOfSpeech": "adj.",
    "definition": "无望的；极差的",
    "example": "",
    "collocations": [
      "hopeless"
    ],
    "topicLabel": "太空探索",
    "level": "C1"
  },
  {
    "word": "college",
    "partOfSpeech": "n.",
    "definition": "学院；大学",
    "example": "",
    "collocations": [
      "college"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "institute",
    "partOfSpeech": "n.",
    "definition": "研究所",
    "example": "",
    "collocations": [
      "institute"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "academy",
    "partOfSpeech": "n.",
    "definition": "专科院校；（美国的）私立学校；研究会；学会",
    "example": "This is an academy of music.",
    "collocations": [
      "academic adj."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "learn",
    "partOfSpeech": "v.",
    "definition": "学习；得知",
    "example": "",
    "collocations": [
      "learn"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "study",
    "partOfSpeech": "v./n.",
    "definition": "学习；研究",
    "example": "",
    "collocations": [
      "study"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "acquire",
    "partOfSpeech": "v.",
    "definition": "获得；购得",
    "example": "",
    "collocations": [
      "acquire"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "knowledge",
    "partOfSpeech": "n.",
    "definition": "知识",
    "example": "",
    "collocations": [
      "knowledge"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "expertise",
    "partOfSpeech": "n.",
    "definition": "专门技能",
    "example": "",
    "collocations": [
      "expertise"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "novice",
    "partOfSpeech": "n.",
    "definition": "新手",
    "example": "I'm a complete novice at yoga.",
    "collocations": [
      "novice"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "recruit",
    "partOfSpeech": "v.",
    "definition": "吸收（新成员）",
    "example": "The country's first act would be to recruit for the navy.",
    "collocations": [
      "recruit"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "literate",
    "partOfSpeech": "adj.",
    "definition": "有读写能力的",
    "example": "Over one-quarter of the adult population are not fully literate.",
    "collocations": [
      "literacy n."
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "illiteracy",
    "partOfSpeech": "n.",
    "definition": "文盲",
    "example": "",
    "collocations": [
      "illiteracy"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "numerate",
    "partOfSpeech": "adj.",
    "definition": "识数的；有计算能力的",
    "example": "",
    "collocations": [
      "numerate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "problem",
    "partOfSpeech": "n.",
    "definition": "问题；习题",
    "example": "",
    "collocations": [
      "problem"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "issue",
    "partOfSpeech": "n./v.",
    "definition": "重要问题；发行。公布；发出",
    "example": "",
    "collocations": [
      "issue"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "affair",
    "partOfSpeech": "n.",
    "definition": "事件；公共事件",
    "example": "",
    "collocations": [
      "affair"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "controversial",
    "partOfSpeech": "adj.",
    "definition": "有争议的",
    "example": "They tried to stay away from controversial topics at the dinner party.",
    "collocations": [
      "controversial"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "puzzle",
    "partOfSpeech": "n./v.",
    "definition": "难题；谜。使迷惑",
    "example": "",
    "collocations": [
      "puzzle"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "riddle",
    "partOfSpeech": "n.",
    "definition": "谜；谜语",
    "example": "",
    "collocations": [
      "riddle"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "obscure",
    "partOfSpeech": "adj.",
    "definition": "难以理解的",
    "example": "Rules for the game are somewhat obscure.",
    "collocations": [
      "obscure"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "instil",
    "partOfSpeech": "v.",
    "definition": "=instill 逐渐灌输",
    "example": "A sense of duty must be instilled in our children.",
    "collocations": [
      "instil"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "cram",
    "partOfSpeech": "v.",
    "definition": "把...塞进；（为应考）临时死记硬背",
    "example": "",
    "collocations": [
      "cram"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "emphasise",
    "partOfSpeech": "v.",
    "definition": "=emphasize 强调；着重",
    "example": "",
    "collocations": [
      "emphasise"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "enhance",
    "partOfSpeech": "v.",
    "definition": "提高；增强",
    "example": "A good score of IELTS enhance my change of getting the offer.",
    "collocations": [
      "enhance"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "enable",
    "partOfSpeech": "v.",
    "definition": "使能够",
    "example": "",
    "collocations": [
      "enable"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "inspire",
    "partOfSpeech": "v.",
    "definition": "鼓舞；给...灵感",
    "example": "",
    "collocations": [
      "inspire"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "motive",
    "partOfSpeech": "n.",
    "definition": "动机；缘由",
    "example": "",
    "collocations": [
      "motive"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "motivate",
    "partOfSpeech": "v.",
    "definition": "激发；驱使",
    "example": "",
    "collocations": [
      "motivate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "stimulate",
    "partOfSpeech": "v.",
    "definition": "刺激；激励",
    "example": "",
    "collocations": [
      "stimulate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "spur",
    "partOfSpeech": "v./n.",
    "definition": "鞭策；激发。马刺；刺激",
    "example": "",
    "collocations": [
      "spur"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "impetus",
    "partOfSpeech": "n.",
    "definition": "推动；促进；动量；惯性",
    "example": "The car ran down the bridge under it's own impetus.",
    "collocations": [
      "impetus"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "indulge",
    "partOfSpeech": "v.",
    "definition": "迁就；放任；沉湎；让...享受一下",
    "example": "You can indulge yourself without spending a fortune.",
    "collocations": [
      "indulge"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "spoil",
    "partOfSpeech": "v.",
    "definition": "宠坏；溺爱；破坏；糟蹋",
    "example": "",
    "collocations": [
      "spoil"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "abuse",
    "partOfSpeech": "v.",
    "definition": "滥用；虐待",
    "example": "It's easy to abuse one's powser.",
    "collocations": [
      "alcohol abuse"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "intelligent",
    "partOfSpeech": "adj.",
    "definition": "聪明的",
    "example": "",
    "collocations": [
      "intelligent"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "clever",
    "partOfSpeech": "adj.",
    "definition": "聪明的；精明的",
    "example": "",
    "collocations": [
      "clever"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "smart",
    "partOfSpeech": "adj.",
    "definition": "聪明的；智能的",
    "example": "",
    "collocations": [
      "smart"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "all-round",
    "partOfSpeech": "adj.",
    "definition": "=all-around 有多方面才能的；全面的",
    "example": "She is an all-round artist.",
    "collocations": [
      "all-round"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "genius",
    "partOfSpeech": "n.",
    "definition": "天才人物；天赋",
    "example": "",
    "collocations": [
      "genius"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "elite",
    "partOfSpeech": "n.",
    "definition": "精英",
    "example": "",
    "collocations": [
      "elite"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "idiot",
    "partOfSpeech": "n.",
    "definition": "白痴；傻瓜",
    "example": "",
    "collocations": [
      "idiot"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "wisdom",
    "partOfSpeech": "n.",
    "definition": "智慧；学问",
    "example": "",
    "collocations": [
      "wisdom"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "wit",
    "partOfSpeech": "n.",
    "definition": "风趣的人；机智；风趣；智慧",
    "example": "Holmes was a gregarious, a great wit, a man of wide interests.",
    "collocations": [
      "wit"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "aptitude",
    "partOfSpeech": "n.",
    "definition": "天生的才能；资质",
    "example": "That student has an aptitude for music.",
    "collocations": [
      "apt adj."
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "capable",
    "partOfSpeech": "adj.",
    "definition": "有能力的；有才能的",
    "example": "Not everyone is capable of judging fine arts.",
    "collocations": [
      "capability n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "excellent",
    "partOfSpeech": "adj.",
    "definition": "杰出的；优秀的",
    "example": "She had a high reputation for her excellent detective novels.",
    "collocations": [
      "excel v."
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "outstanding",
    "partOfSpeech": "adj.",
    "definition": "突出的；杰出的",
    "example": "",
    "collocations": [
      "outstanding"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "brilliant",
    "partOfSpeech": "adj.",
    "definition": "光辉的；聪明的；（光线等）明亮的",
    "example": "",
    "collocations": [
      "brilliant"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "prestige",
    "partOfSpeech": "n.",
    "definition": "威望；声望",
    "example": "These new policies will affect the president's national and international prestige.",
    "collocations": [
      "prestigious adj."
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "reputation",
    "partOfSpeech": "n.",
    "definition": "名誉；声誉",
    "example": "",
    "collocations": [
      "reputation"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "eminent",
    "partOfSpeech": "adj.",
    "definition": "著名的；杰出的",
    "example": "The students are expecting the arrival of an eminent scientist.",
    "collocations": [
      "eminent"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "notorious",
    "partOfSpeech": "adj.",
    "definition": "名声狼藉的",
    "example": "The notorious thief was finally caught and put to prison.",
    "collocations": [
      "notoriety n."
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "esteem",
    "partOfSpeech": "v.",
    "definition": "尊重；尊敬",
    "example": "",
    "collocations": [
      "esteem"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "respect",
    "partOfSpeech": "n./v.",
    "definition": "尊敬；敬重",
    "example": "",
    "collocations": [
      "respect"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "diligent",
    "partOfSpeech": "adj.",
    "definition": "勤勉的；勤奋的",
    "example": "",
    "collocations": [
      "diligent"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "painstaking",
    "partOfSpeech": "adj.",
    "definition": "极其仔细的；辛苦的",
    "example": "The mastery of a language requires painstaking effort.",
    "collocations": [
      "painstaking"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "skill",
    "partOfSpeech": "n.",
    "definition": "技巧",
    "example": "",
    "collocations": [
      "skill"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "approac",
    "partOfSpeech": "n./v.",
    "definition": "方法。接近",
    "example": "",
    "collocations": [
      "approac"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "scheme",
    "partOfSpeech": "n./v.",
    "definition": "计划；方案；阴谋。谋划",
    "example": "All the scheme an intrigues are doomed to failure.",
    "collocations": [
      "scheme"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "headmaster",
    "partOfSpeech": "n.",
    "definition": "[英]男校长",
    "example": "",
    "collocations": [
      "headmaster"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "principal",
    "partOfSpeech": "n./adj.",
    "definition": "[美]（中小学）校长；[英]大学校长；学院院长。首要的",
    "example": "He is going to resign from the position of principal.",
    "collocations": [
      "principal"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "dean",
    "partOfSpeech": "n.",
    "definition": "（大学的）学院院长；系主任",
    "example": "",
    "collocations": [
      "dean"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "faculty",
    "partOfSpeech": "n.",
    "definition": "（大学的）系、院；全体教员",
    "example": "",
    "collocations": [
      "faculty"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "professor",
    "partOfSpeech": "n.",
    "definition": "教授",
    "example": "",
    "collocations": [
      "professor"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "scholar",
    "partOfSpeech": "n.",
    "definition": "学者",
    "example": "",
    "collocations": [
      "scholar"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "scientist",
    "partOfSpeech": "n.",
    "definition": "科学家",
    "example": "",
    "collocations": [
      "scientist"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "mentor",
    "partOfSpeech": "n.",
    "definition": "导师；顾问",
    "example": "",
    "collocations": [
      "mentor"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "tutor",
    "partOfSpeech": "n.",
    "definition": "家庭教师；（英国大学或者学院的）导师",
    "example": "",
    "collocations": [
      "tutor"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "lecturer",
    "partOfSpeech": "n.",
    "definition": "讲师",
    "example": "",
    "collocations": [
      "lecturer"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "assistant",
    "partOfSpeech": "n.",
    "definition": "助理；助手",
    "example": "",
    "collocations": [
      "assistant"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "candidate",
    "partOfSpeech": "n.",
    "definition": "候选人；求职者；考生",
    "example": "",
    "collocations": [
      "candidate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "degree",
    "partOfSpeech": "n.",
    "definition": "学位；程度",
    "example": "He left without completing his degree.",
    "collocations": [
      "to a certain degree"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "qualify",
    "partOfSpeech": "v.",
    "definition": "（使）有资格、有权",
    "example": "",
    "collocations": [
      "qualify"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "certify",
    "partOfSpeech": "v.",
    "definition": "证明；颁发专业合格证书",
    "example": "",
    "collocations": [
      "certify"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "license",
    "partOfSpeech": "n.",
    "definition": "=licence 执照；许可证",
    "example": "",
    "collocations": [
      "license"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "permit",
    "partOfSpeech": "n.",
    "definition": "许可证",
    "example": "",
    "collocations": [
      "permit"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "diploma",
    "partOfSpeech": "n.",
    "definition": "毕业文凭",
    "example": "",
    "collocations": [
      "diploma"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "diplomat",
    "partOfSpeech": "n.",
    "definition": "外交官；善于交际的人",
    "example": "",
    "collocations": [
      "diplomat"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "ambassador",
    "partOfSpeech": "n.",
    "definition": "大使",
    "example": "He was appointed ambassador to France.",
    "collocations": [
      "embassy n."
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "pupil",
    "partOfSpeech": "n.",
    "definition": "小学生；瞳孔",
    "example": "As a girl, she had been a model pupil.",
    "collocations": [
      "pupil"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "graduate",
    "partOfSpeech": "n./v.",
    "definition": "毕业生；毕业",
    "example": "",
    "collocations": [
      "graduate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "ceremony",
    "partOfSpeech": "n.",
    "definition": "典礼；礼节",
    "example": "",
    "collocations": [
      "ceremony"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "bachelor",
    "partOfSpeech": "n.",
    "definition": "学士；单身汉",
    "example": "",
    "collocations": [
      "bachelor"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "master",
    "partOfSpeech": "n./v.",
    "definition": "硕士；大师。精通；控制",
    "example": "",
    "collocations": [
      "master"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "doctor",
    "partOfSpeech": "n.",
    "definition": "博士；医生",
    "example": "",
    "collocations": [
      "doctor"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "fresher",
    "partOfSpeech": "n.",
    "definition": "[英]（大学）一年级新生",
    "example": "",
    "collocations": [
      "fresher"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "sophomore",
    "partOfSpeech": "n.",
    "definition": "[美]（大学或高中）二年级学士",
    "example": "",
    "collocations": [
      "sophomore"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "junior",
    "partOfSpeech": "n./adj.",
    "definition": "[美]（大学或高中）三年级学生；较年幼者。青少年的；级别（或地位）较低的",
    "example": "",
    "collocations": [
      "junior"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "senior",
    "partOfSpeech": "n./adj.",
    "definition": "[美]（大学或高中）毕业班学士；较年长者。成人的；资深的",
    "example": "",
    "collocations": [
      "senior"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "alumni",
    "partOfSpeech": "n.",
    "definition": "[alumnus 的复数形式]毕业生；校友",
    "example": "My alumni and alumna are persent at my birthday party.",
    "collocations": [
      "alumni"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "compus",
    "partOfSpeech": "n.",
    "definition": "（大专院校的）校园",
    "example": "",
    "collocations": [
      "compus"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "orientation",
    "partOfSpeech": "n.",
    "definition": "迎新会；方向",
    "example": "",
    "collocations": [
      "orientation"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "platform",
    "partOfSpeech": "n.",
    "definition": "平台；讲台",
    "example": "",
    "collocations": [
      "platform"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "coed",
    "partOfSpeech": "adj./n.",
    "definition": "=co-educational 男女同校的。（男女同校的大学生中的）女生",
    "example": "A nationwide research is under way for typical coeds.",
    "collocations": [
      "coed"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "register",
    "partOfSpeech": "v./n.",
    "definition": "登记；注册。登记表；注册簿",
    "example": "",
    "collocations": [
      "register"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "roster",
    "partOfSpeech": "n.",
    "definition": "花名册；登记表；执勤表",
    "example": "I am on the roster for tomorrow night.",
    "collocations": [
      "roster"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "enrol",
    "partOfSpeech": "v.",
    "definition": "=enroll 登记；注册；加入",
    "example": "",
    "collocations": [
      "enrol"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "matriculation",
    "partOfSpeech": "n.",
    "definition": "注册入大学",
    "example": "",
    "collocations": [
      "matriculation"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "accommodation",
    "partOfSpeech": "n.",
    "definition": "住处；食宿招待",
    "example": "",
    "collocations": [
      "accommodation"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "dorm",
    "partOfSpeech": "n.",
    "definition": "宿舍",
    "example": "",
    "collocations": [
      "dorm"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "dining hall",
    "partOfSpeech": "n.",
    "definition": "食堂",
    "example": "",
    "collocations": [
      "dining hall"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "canteen",
    "partOfSpeech": "n.",
    "definition": "水壶；[英]食堂",
    "example": "",
    "collocations": [
      "canteen"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "laboratory",
    "partOfSpeech": "n.",
    "definition": "=lab 实验室；研究室",
    "example": "",
    "collocations": [
      "laboratory"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "experiment",
    "partOfSpeech": "n.",
    "definition": "实验；试验",
    "example": "",
    "collocations": [
      "experiment"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "data",
    "partOfSpeech": "n.",
    "definition": "[datum 的复数形式]数据",
    "example": "",
    "collocations": [
      "data"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "quantity",
    "partOfSpeech": "n.",
    "definition": "数量",
    "example": "",
    "collocations": [
      "quantity"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "quality",
    "partOfSpeech": "n.",
    "definition": "质量",
    "example": "",
    "collocations": [
      "quality"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "library",
    "partOfSpeech": "n.",
    "definition": "图书馆；个人收藏",
    "example": "",
    "collocations": [
      "library"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "literature",
    "partOfSpeech": "n.",
    "definition": "文学；文学作品；文献",
    "example": "",
    "collocations": [
      "literature"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "article",
    "partOfSpeech": "n.",
    "definition": "文章",
    "example": "",
    "collocations": [
      "article"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "author",
    "partOfSpeech": "n.",
    "definition": "作者；作家",
    "example": "",
    "collocations": [
      "author"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "tale",
    "partOfSpeech": "n.",
    "definition": "故事；传说",
    "example": "",
    "collocations": [
      "tale"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "fiction",
    "partOfSpeech": "n.",
    "definition": "小说；虚构；杜撰",
    "example": "",
    "collocations": [
      "fiction"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "story",
    "partOfSpeech": "n.",
    "definition": "故事；小说；（尤指口头的）叙述",
    "example": "",
    "collocations": [
      "story"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "diary",
    "partOfSpeech": "n.",
    "definition": "日记；日记簿",
    "example": "",
    "collocations": [
      "diary"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "poetry",
    "partOfSpeech": "n.",
    "definition": "诗",
    "example": "",
    "collocations": [
      "poetry"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "magazine",
    "partOfSpeech": "n.",
    "definition": "杂志；期刊；弹夹",
    "example": "",
    "collocations": [
      "magazine"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "journal",
    "partOfSpeech": "n.",
    "definition": "日报；周报；（尤指专门科学的）杂志；日志",
    "example": "",
    "collocations": [
      "journal"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "coverage",
    "partOfSpeech": "n.",
    "definition": "新闻报道；覆盖范围",
    "example": "",
    "collocations": [
      "coverage"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "bibliography",
    "partOfSpeech": "n.",
    "definition": "参考书目",
    "example": "",
    "collocations": [
      "bibliography"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "encyclopedia",
    "partOfSpeech": "n.",
    "definition": "=encyclopaedia 百科全书",
    "example": "",
    "collocations": [
      "encyclopedia"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "biography",
    "partOfSpeech": "n.",
    "definition": "传记",
    "example": "",
    "collocations": [
      "biography"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "documentary",
    "partOfSpeech": "n./adj.",
    "definition": "纪录片；记录的",
    "example": "",
    "collocations": [
      "documentary"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "series",
    "partOfSpeech": "n.",
    "definition": "连续的；一系列；系列节目",
    "example": "",
    "collocations": [
      "series"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "record",
    "partOfSpeech": "n.",
    "definition": "记录；履历",
    "example": "",
    "collocations": [
      "record"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "file",
    "partOfSpeech": "n./v.",
    "definition": "档案；把...归档",
    "example": "",
    "collocations": [
      "file"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "profile",
    "partOfSpeech": "n.",
    "definition": "概述；人物简介；侧面轮廓",
    "example": "",
    "collocations": [
      "profile"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "draft",
    "partOfSpeech": "n.",
    "definition": "草稿；汇票；起草",
    "example": "",
    "collocations": [
      "draft"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "sketch",
    "partOfSpeech": "n./v.",
    "definition": "概略；概述",
    "example": "",
    "collocations": [
      "sketch"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "brochure",
    "partOfSpeech": "n.",
    "definition": "小册子",
    "example": "",
    "collocations": [
      "brochure"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "manual",
    "partOfSpeech": "n.",
    "definition": "使用手册；指南；手工的",
    "example": "",
    "collocations": [
      "manual"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "frame",
    "partOfSpeech": "n.",
    "definition": "框架；眼镜框；构架",
    "example": "",
    "collocations": [
      "frame"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "index",
    "partOfSpeech": "n./v.",
    "definition": "指数；索引；为...编索引",
    "example": "",
    "collocations": [
      "index"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "catalogue",
    "partOfSpeech": "n.",
    "definition": "=catalog 目录",
    "example": "",
    "collocations": [
      "catalogue"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "category",
    "partOfSpeech": "n.",
    "definition": "种类；类别；范畴",
    "example": "",
    "collocations": [
      "category"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "inventory",
    "partOfSpeech": "n.",
    "definition": "库存；详细目录",
    "example": "",
    "collocations": [
      "inventory"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "content",
    "partOfSpeech": "n./adj.",
    "definition": "内容；目录；含量。满足的",
    "example": "",
    "collocations": [
      "content"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "context",
    "partOfSpeech": "n.",
    "definition": "上下文；语境；背景",
    "example": "",
    "collocations": [
      "context"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "list",
    "partOfSpeech": "n./v.",
    "definition": "一览表；目录。列举；把...列表",
    "example": "",
    "collocations": [
      "list"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "chapter",
    "partOfSpeech": "n.",
    "definition": "（书的）章；（人生或历史的）重要时刻",
    "example": "",
    "collocations": [
      "chapter"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "volume",
    "partOfSpeech": "n.",
    "definition": "卷；体积；容积；音量",
    "example": "",
    "collocations": [
      "volume"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "reel",
    "partOfSpeech": "n.",
    "definition": "卷轴；卷筒；一卷胶卷",
    "example": "",
    "collocations": [
      "reel"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "subject",
    "partOfSpeech": "n.",
    "definition": "科目；主题；实验对象",
    "example": "",
    "collocations": [
      "subject"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "object",
    "partOfSpeech": "n./v.",
    "definition": "物体；目标。反对",
    "example": "",
    "collocations": [
      "object"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "major",
    "partOfSpeech": "n./v./adj.",
    "definition": "[美]主修科目；专业。主修。主要的",
    "example": "",
    "collocations": [
      "major"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "minor",
    "partOfSpeech": "n./adj.",
    "definition": "[美]辅修科目。不严重的",
    "example": "My major is English, but I also have a minor in history.",
    "collocations": [
      "minor"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "sociology",
    "partOfSpeech": "n.",
    "definition": "社会学",
    "example": "A few years ago, sociology was the most popular subject for undergraduates.",
    "collocations": [
      "sociology"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "politics",
    "partOfSpeech": "n.",
    "definition": "政治学；政治；政治事务",
    "example": "",
    "collocations": [
      "politics"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "economics",
    "partOfSpeech": "n.",
    "definition": "经济学",
    "example": "",
    "collocations": [
      "economics"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "marketing",
    "partOfSpeech": "n.",
    "definition": "市场营销",
    "example": "",
    "collocations": [
      "marketing"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "accounting",
    "partOfSpeech": "n.",
    "definition": "会计",
    "example": "",
    "collocations": [
      "accounting"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "audit",
    "partOfSpeech": "n./v.",
    "definition": "审计。旁听；审计",
    "example": "",
    "collocations": [
      "audit"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "statistics",
    "partOfSpeech": "n.",
    "definition": "统计学",
    "example": "",
    "collocations": [
      "statistics"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "psychology",
    "partOfSpeech": "n.",
    "definition": "心理学；心理特征",
    "example": "",
    "collocations": [
      "psychology"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "philosophy",
    "partOfSpeech": "n.",
    "definition": "哲学",
    "example": "",
    "collocations": [
      "philosophy"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "logic",
    "partOfSpeech": "n.",
    "definition": "逻辑学；逻辑",
    "example": "",
    "collocations": [
      "logic"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "biology",
    "partOfSpeech": "n.",
    "definition": "生物学；生命机理",
    "example": "",
    "collocations": [
      "biology"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "physics",
    "partOfSpeech": "n.",
    "definition": "物理学",
    "example": "",
    "collocations": [
      "physics"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "chemistry",
    "partOfSpeech": "n.",
    "definition": "化学",
    "example": "",
    "collocations": [
      "chemistry"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "agriculture",
    "partOfSpeech": "n.",
    "definition": "农业；农学",
    "example": "",
    "collocations": [
      "agriculture"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "logistics",
    "partOfSpeech": "n.",
    "definition": "物流；后勤",
    "example": "",
    "collocations": [
      "logistics"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "geography",
    "partOfSpeech": "n.",
    "definition": "地理学；地形；地势",
    "example": "",
    "collocations": [
      "geography"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "history",
    "partOfSpeech": "n.",
    "definition": "历史；历史学",
    "example": "",
    "collocations": [
      "history"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "engineering",
    "partOfSpeech": "n.",
    "definition": "工程；工程学",
    "example": "",
    "collocations": [
      "engineering"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "mechanics",
    "partOfSpeech": "n.",
    "definition": "力学；机械学",
    "example": "",
    "collocations": [
      "mechanics"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "electronics",
    "partOfSpeech": "n.",
    "definition": "电子学；电子器件",
    "example": "That country wants to increase tariffs on items such as electronics.",
    "collocations": [
      "electron n."
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "maths",
    "partOfSpeech": "n.",
    "definition": "=mathematics 数学",
    "example": "",
    "collocations": [
      "maths"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "arithmetic",
    "partOfSpeech": "n.",
    "definition": "算数",
    "example": "",
    "collocations": [
      "arithmetic"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "geometry",
    "partOfSpeech": "n.",
    "definition": "几何学",
    "example": "",
    "collocations": [
      "geometry"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "algebra",
    "partOfSpeech": "n.",
    "definition": "代数",
    "example": "",
    "collocations": [
      "algebra"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "calculus",
    "partOfSpeech": "n.",
    "definition": "微积分；结实",
    "example": "",
    "collocations": [
      "calculus"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "plus",
    "partOfSpeech": "prep./adj.",
    "definition": "加上。正数的；在零以上的",
    "example": "",
    "collocations": [
      "plus"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "sum",
    "partOfSpeech": "n.",
    "definition": "总和；总数；金额",
    "example": "",
    "collocations": [
      "sum"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "total",
    "partOfSpeech": "adj./n.",
    "definition": "总的；全部的。总数",
    "example": "",
    "collocations": [
      "total"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "merger",
    "partOfSpeech": "n.",
    "definition": "合并；并归",
    "example": "",
    "collocations": [
      "merger"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "equation",
    "partOfSpeech": "n.",
    "definition": "相等；平衡；综合体；方程式；等式",
    "example": "",
    "collocations": [
      "equation"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "identical",
    "partOfSpeech": "adj.",
    "definition": "同一的",
    "example": "This is the identical hotel we stayed at last year.",
    "collocations": [
      "identical"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "minus",
    "partOfSpeech": "adj./prep.",
    "definition": "负的；零以下的；减去",
    "example": "",
    "collocations": [
      "minus"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "substract",
    "partOfSpeech": "v.",
    "definition": "减去；减",
    "example": "",
    "collocations": [
      "substract"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "multiply",
    "partOfSpeech": "v.",
    "definition": "乘；使相乘；使成倍增加；繁殖",
    "example": "",
    "collocations": [
      "multiply"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "divide",
    "partOfSpeech": "v.",
    "definition": "除以；除",
    "example": "",
    "collocations": [
      "divide"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "dividend",
    "partOfSpeech": "n.",
    "definition": "被除数",
    "example": "",
    "collocations": [
      "dividend"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "remainder",
    "partOfSpeech": "n.",
    "definition": "余数；剩余部分",
    "example": "",
    "collocations": [
      "remainder"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "rational",
    "partOfSpeech": "n./adj.",
    "definition": "有理数；（数、式等）有理的",
    "example": "",
    "collocations": [
      "rational"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "parameter",
    "partOfSpeech": "n.",
    "definition": "参数；起限定作用的因素",
    "example": "",
    "collocations": [
      "parameter"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "variable",
    "partOfSpeech": "n./adj.",
    "definition": "变量；可变因素。易变的",
    "example": "",
    "collocations": [
      "variable"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "even",
    "partOfSpeech": "adj./adv.",
    "definition": "均匀的；偶数的；相等的。甚至",
    "example": "",
    "collocations": [
      "even"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "odd",
    "partOfSpeech": "adj.",
    "definition": "奇数的；古怪的",
    "example": "",
    "collocations": [
      "odd"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "mean",
    "partOfSpeech": "n./adj.",
    "definition": "平均数；平均值。平均的",
    "example": "The professor asked the students to take 200 values and calculate the mean.",
    "collocations": [
      "mean distance"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "double",
    "partOfSpeech": "adj./n./v.",
    "definition": "两倍的。两倍数；两倍量。使加倍",
    "example": "",
    "collocations": [
      "double"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "triple",
    "partOfSpeech": "adj./n./v",
    "definition": "三倍的；三重的。三倍数；三包两。使增至三倍",
    "example": "",
    "collocations": [
      "triple"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "quadruple",
    "partOfSpeech": "adj./n./v.",
    "definition": "四倍的。四倍",
    "example": "",
    "collocations": [
      "quadruple"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "multiple",
    "partOfSpeech": "n./adj.",
    "definition": "倍数。多样的，数量多的",
    "example": "",
    "collocations": [
      "multiple"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "maximum",
    "partOfSpeech": "n.",
    "definition": "最大值；最大限度",
    "example": "",
    "collocations": [
      "maximum"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "minimum",
    "partOfSpeech": "n.",
    "definition": "最小值；最小限度",
    "example": "",
    "collocations": [
      "minimum"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "approximately",
    "partOfSpeech": "adv.",
    "definition": "大约",
    "example": "",
    "collocations": [
      "approximately"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "chart",
    "partOfSpeech": "n.",
    "definition": "图；图表；海图",
    "example": "",
    "collocations": [
      "chart"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "graph",
    "partOfSpeech": "n.",
    "definition": "图表；图",
    "example": "",
    "collocations": [
      "graph"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "diagram",
    "partOfSpeech": "n.",
    "definition": "图表；示意图；图解",
    "example": "",
    "collocations": [
      "diagram"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "table",
    "partOfSpeech": "n.",
    "definition": "表格；桌子",
    "example": "",
    "collocations": [
      "table"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "matrix",
    "partOfSpeech": "n.",
    "definition": "矩阵；铸模",
    "example": "",
    "collocations": [
      "matrix"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "rectangle",
    "partOfSpeech": "n.",
    "definition": "长方形；矩形",
    "example": "",
    "collocations": [
      "rectangle"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "cube",
    "partOfSpeech": "n.",
    "definition": "立方体；立方；三次幂；立方的东西",
    "example": "",
    "collocations": [
      "cube"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "angle",
    "partOfSpeech": "n.",
    "definition": "角度；脚",
    "example": "",
    "collocations": [
      "angle"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "triangle",
    "partOfSpeech": "n.",
    "definition": "三角形；三角关系",
    "example": "",
    "collocations": [
      "triangle"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "diagonal",
    "partOfSpeech": "adj./n.",
    "definition": "斜纹的；对角线的。对角线；斜纹织物",
    "example": "",
    "collocations": [
      "diagonal"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "straight",
    "partOfSpeech": "adj./adv.",
    "definition": "直的；笔直地；直接",
    "example": "",
    "collocations": [
      "straight"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "circle",
    "partOfSpeech": "n.",
    "definition": "圆",
    "example": "",
    "collocations": [
      "circle"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "round",
    "partOfSpeech": "adj./n./adv.",
    "definition": "圆的。绕圈；一轮。环绕",
    "example": "",
    "collocations": [
      "round"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "dot",
    "partOfSpeech": "n./v.",
    "definition": "点。在...打点",
    "example": "",
    "collocations": [
      "dot"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "sphere",
    "partOfSpeech": "n.",
    "definition": "球体；球状物；范围；领域",
    "example": "We move in different social sphere.",
    "collocations": [
      "sphere"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "cone",
    "partOfSpeech": "n.",
    "definition": "圆锥体；锥形物",
    "example": "The police have sectioned off the road with traffic cones.",
    "collocations": [
      "cone"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "extent",
    "partOfSpeech": "n.",
    "definition": "广度；范围；程度",
    "example": "No one cares about the extent of his debts.",
    "collocations": [
      "to some extent"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "width",
    "partOfSpeech": "n.",
    "definition": "宽度",
    "example": "",
    "collocations": [
      "width"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "length",
    "partOfSpeech": "n.",
    "definition": "长度",
    "example": "",
    "collocations": [
      "length"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "decimal",
    "partOfSpeech": "adj./n.",
    "definition": "小数的；十进制的。小数",
    "example": "",
    "collocations": [
      "decimal"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "percent",
    "partOfSpeech": "n.",
    "definition": "=per cent 百分之...",
    "example": "",
    "collocations": [
      "percent"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "proportion",
    "partOfSpeech": "n.",
    "definition": "比例",
    "example": "",
    "collocations": [
      "proportion"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "rate",
    "partOfSpeech": "n.",
    "definition": "比率；率；速度",
    "example": "",
    "collocations": [
      "rate"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "ratio",
    "partOfSpeech": "n.",
    "definition": "比",
    "example": "The ratio of 3 to 9 is the same as that 9 to 27.",
    "collocations": [
      "in direct ratio"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "fraction",
    "partOfSpeech": "n.",
    "definition": "分数；小部分；片段",
    "example": "She spends only a fraction of her earnings on clothes.",
    "collocations": [
      "fraction"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "scale",
    "partOfSpeech": "n./v.",
    "definition": "刻度；规模。攀登 scales 天平；鳞",
    "example": "",
    "collocations": [
      "scale"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "ounce",
    "partOfSpeech": "n.",
    "definition": "盎司；少量",
    "example": "",
    "collocations": [
      "ounce"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "density",
    "partOfSpeech": "n.",
    "definition": "密度；浓度",
    "example": "",
    "collocations": [
      "density"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "Fahrenheit",
    "partOfSpeech": "adj.",
    "definition": "华氏温标的",
    "example": "",
    "collocations": [
      "Fahrenheit"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "mercury",
    "partOfSpeech": "n.",
    "definition": "水银；水星",
    "example": "",
    "collocations": [
      "mercury"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "battery",
    "partOfSpeech": "n.",
    "definition": "电池；（物品的）一组",
    "example": "",
    "collocations": [
      "battery"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "volt",
    "partOfSpeech": "n.",
    "definition": "伏特",
    "example": "",
    "collocations": [
      "volt"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "radiate",
    "partOfSpeech": "v.",
    "definition": "辐射；发散；从中心向四周散开",
    "example": "",
    "collocations": [
      "radiate"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "emit",
    "partOfSpeech": "v.",
    "definition": "散发 (光、热、气等)；发出（声音）",
    "example": "The tail exhaust pipe of the car emitted poisonous smoke.",
    "collocations": [
      "emit"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "transparent",
    "partOfSpeech": "adj.",
    "definition": "透明的；易看穿的",
    "example": "",
    "collocations": [
      "transparent"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "hollow",
    "partOfSpeech": "adj.",
    "definition": "中空的；空心的",
    "example": "",
    "collocations": [
      "hollow"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "ozone",
    "partOfSpeech": "n.",
    "definition": "臭氧",
    "example": "",
    "collocations": [
      "ozone"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "gravity",
    "partOfSpeech": "n.",
    "definition": "地球引力；重力",
    "example": "",
    "collocations": [
      "gravity"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "friction",
    "partOfSpeech": "n.",
    "definition": "摩擦力；摩擦；不和；矛盾",
    "example": "",
    "collocations": [
      "friction"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "eccentric",
    "partOfSpeech": "adj.",
    "definition": "不同心圆的；古怪的",
    "example": "The old lady has some eccentric habits.",
    "collocations": [
      "eccentric"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "displace",
    "partOfSpeech": "v.",
    "definition": "移动...的位置；取代；代替",
    "example": "A bone in his knee was displaced when he crashed against another player.",
    "collocations": [
      "displace"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "boil",
    "partOfSpeech": "v./n.",
    "definition": "煮沸。沸点",
    "example": "The watched pot never boils 性急烧水不沸.",
    "collocations": [
      "boil down to"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "melt",
    "partOfSpeech": "v.",
    "definition": "（使）融/熔化",
    "example": "",
    "collocations": [
      "melt"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "dissolve",
    "partOfSpeech": "v.",
    "definition": "（使）溶解；解散",
    "example": "",
    "collocations": [
      "dissolve"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "rust",
    "partOfSpeech": "v./n.",
    "definition": "（使）生锈。锈；铁锈",
    "example": "If you leave your metal tools outside in the rain, they will rust.",
    "collocations": [
      "rusty adj."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "ferment",
    "partOfSpeech": "v./n.",
    "definition": "（使）发酵；骚动。酶；发酵；动乱",
    "example": "The whole country was in a state of ferment.",
    "collocations": [
      "yeast n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "dilute",
    "partOfSpeech": "v./adj.",
    "definition": "冲淡；稀释。稀释了的；减弱了的",
    "example": "The nurse diluted the drug with sailine water.",
    "collocations": [
      "dilute"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "acid",
    "partOfSpeech": "n./adj.",
    "definition": "酸。酸的；讽刺的；尖刻的",
    "example": "",
    "collocations": [
      "acid"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "noxious",
    "partOfSpeech": "adj.",
    "definition": "有害的",
    "example": "Increasing tax on petrol would encourage people to drive cars with fewer emissions.",
    "collocations": [
      "noxious"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "static",
    "partOfSpeech": "adj.",
    "definition": "静态的",
    "example": "",
    "collocations": [
      "static"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "inert",
    "partOfSpeech": "adj.",
    "definition": "无生气的；惰性的；不活泼",
    "example": "",
    "collocations": [
      "inert"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "inherent",
    "partOfSpeech": "adj.",
    "definition": "内在的；固有的",
    "example": "Polarity is inherent in a magent.",
    "collocations": [
      "be inherent in"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "formula",
    "partOfSpeech": "n.",
    "definition": "公式；方程式；原则；配方；分子式",
    "example": "",
    "collocations": [
      "formula"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "component",
    "partOfSpeech": "n.",
    "definition": "成分；组成",
    "example": "",
    "collocations": [
      "component"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "compose",
    "partOfSpeech": "v.",
    "definition": "组成；构成；创作；写",
    "example": "Water is composed of hydrogen and oxygen.",
    "collocations": [
      "composer n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "mixture",
    "partOfSpeech": "n.",
    "definition": "混合物",
    "example": "",
    "collocations": [
      "mixture"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "blend",
    "partOfSpeech": "n./v.",
    "definition": "混合；（使）交融。混合物",
    "example": "",
    "collocations": [
      "blend"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "theory",
    "partOfSpeech": "n.",
    "definition": "理论；学说",
    "example": "",
    "collocations": [
      "theory"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "empirical",
    "partOfSpeech": "adj.",
    "definition": "经验主义的；以实验为依据的",
    "example": "His thesis is not very convincing for lack of empirical evidence.",
    "collocations": [
      "empirical"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "pratical",
    "partOfSpeech": "adj.",
    "definition": "实际的；有用的；务实的；心灵手巧的",
    "example": "",
    "collocations": [
      "pratical"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "doctrine",
    "partOfSpeech": "n.",
    "definition": "学说；教义；信条",
    "example": "",
    "collocations": [
      "doctrine"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "principle",
    "partOfSpeech": "n.",
    "definition": "原则；（科学）原理",
    "example": "",
    "collocations": [
      "principle"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "discipline",
    "partOfSpeech": "n.",
    "definition": "纪律；训练",
    "example": "",
    "collocations": [
      "discipline"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "term",
    "partOfSpeech": "n.",
    "definition": "期限；术语；[英]学期",
    "example": "",
    "collocations": [
      "term"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "semester",
    "partOfSpeech": "n.",
    "definition": "学期",
    "example": "",
    "collocations": [
      "semester"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "timetable",
    "partOfSpeech": "n.",
    "definition": "时间表；课程表",
    "example": "",
    "collocations": [
      "timetable"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "schedule",
    "partOfSpeech": "n.",
    "definition": "日程安排；[美]时刻表",
    "example": "",
    "collocations": [
      "schedule"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "deadline",
    "partOfSpeech": "n.",
    "definition": "截止日期",
    "example": "",
    "collocations": [
      "deadline"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "course",
    "partOfSpeech": "n.",
    "definition": "课程",
    "example": "",
    "collocations": [
      "course"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "lesson",
    "partOfSpeech": "n.",
    "definition": "一堂课；课程；教训",
    "example": "",
    "collocations": [
      "lesson"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "curriculum",
    "partOfSpeech": "n.",
    "definition": "课程；全部课程",
    "example": "The staff should work togather to revise the school curriculum.",
    "collocations": [
      "extra-curriculum"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "seminar",
    "partOfSpeech": "n.",
    "definition": "研讨会；讨论课",
    "example": "",
    "collocations": [
      "seminar"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "forum",
    "partOfSpeech": "n.",
    "definition": "论坛；讨论会；公开讨论广场",
    "example": "",
    "collocations": [
      "forum"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "syllabus",
    "partOfSpeech": "n.",
    "definition": "教学大纲",
    "example": "",
    "collocations": [
      "syllabus"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "system",
    "partOfSpeech": "n.",
    "definition": "系统；体系；制度",
    "example": "",
    "collocations": [
      "system"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "rudimentary",
    "partOfSpeech": "adj.",
    "definition": "基本的；粗浅的",
    "example": "",
    "collocations": [
      "rudimentary"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "basic",
    "partOfSpeech": "adj.",
    "definition": "基本的；基础的",
    "example": "",
    "collocations": [
      "basic"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "fundamental",
    "partOfSpeech": "adj.",
    "definition": "基础的；基本的；根本的",
    "example": "",
    "collocations": [
      "fundamental"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "elementary",
    "partOfSpeech": "adj.",
    "definition": "基本的；初级的",
    "example": "",
    "collocations": [
      "elementary"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "profound",
    "partOfSpeech": "adj.",
    "definition": "深远的；见解深刻的",
    "example": "",
    "collocations": [
      "profound"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "surface",
    "partOfSpeech": "n.",
    "definition": "表面；地面；水面",
    "example": "",
    "collocations": [
      "surface"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "compulsory",
    "partOfSpeech": "adj.",
    "definition": "强制的",
    "example": "",
    "collocations": [
      "compulsory"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "prerequisite",
    "partOfSpeech": "n./adj.",
    "definition": "必备条件。必备的",
    "example": "",
    "collocations": [
      "prerequisite"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "selective",
    "partOfSpeech": "adj.",
    "definition": "选择性的",
    "example": "",
    "collocations": [
      "selective"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "elective",
    "partOfSpeech": "adj.",
    "definition": "选择性的",
    "example": "",
    "collocations": [
      "elective"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "assignment",
    "partOfSpeech": "n.",
    "definition": "作业；任务",
    "example": "",
    "collocations": [
      "assignment"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "submit",
    "partOfSpeech": "v.",
    "definition": "提交；服从",
    "example": "",
    "collocations": [
      "submit to"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "preview",
    "partOfSpeech": "n./v.",
    "definition": "预习",
    "example": "",
    "collocations": [
      "preview"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "review",
    "partOfSpeech": "n./v.",
    "definition": "回顾；复习",
    "example": "",
    "collocations": [
      "review"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "revise",
    "partOfSpeech": "v.",
    "definition": "修订；修改",
    "example": "",
    "collocations": [
      "revise"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "inspect",
    "partOfSpeech": "v.",
    "definition": "检查；检阅；视察",
    "example": "",
    "collocations": [
      "inspect"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "consult",
    "partOfSpeech": "v.",
    "definition": "请教；查阅",
    "example": "",
    "collocations": [
      "consult"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "skim",
    "partOfSpeech": "v.",
    "definition": "掠过；擦过；略读",
    "example": "",
    "collocations": [
      "skim"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "scan",
    "partOfSpeech": "v./n.",
    "definition": "细看；浏览；扫描",
    "example": "",
    "collocations": [
      "scan"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "scrutinise",
    "partOfSpeech": "v.",
    "definition": "=scrutinize 仔细检查",
    "example": "scrutiny n. 详细审查.",
    "collocations": [
      "scrutinise"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "recite",
    "partOfSpeech": "v.",
    "definition": "背诵；朗诵",
    "example": "",
    "collocations": [
      "recite"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "dictate",
    "partOfSpeech": "v.",
    "definition": "让（某人）听写；命令；强行规定",
    "example": "The English teacher dictates to the class every other week.",
    "collocations": [
      "dication n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "examination",
    "partOfSpeech": "n.",
    "definition": "=exam 考试；抽查",
    "example": "",
    "collocations": [
      "examination"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "test",
    "partOfSpeech": "v./n.",
    "definition": "测试；检验",
    "example": "",
    "collocations": [
      "test"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "quiz",
    "partOfSpeech": "n.",
    "definition": "小测验",
    "example": "",
    "collocations": [
      "quiz"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "presentation",
    "partOfSpeech": "n.",
    "definition": "陈述；表演；演出",
    "example": "",
    "collocations": [
      "presentation"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "plagiarise",
    "partOfSpeech": "v.",
    "definition": "=plagiarize 抄袭",
    "example": "",
    "collocations": [
      "plagiarise"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "copy",
    "partOfSpeech": "n./v.",
    "definition": "复制品。抄写；复制",
    "example": "",
    "collocations": [
      "copy"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "print",
    "partOfSpeech": "v./n.",
    "definition": "打印。印刷品；照片",
    "example": "",
    "collocations": [
      "print"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "thesis",
    "partOfSpeech": "n.",
    "definition": "论文",
    "example": "",
    "collocations": [
      "thesis"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "essay",
    "partOfSpeech": "n.",
    "definition": "短文；小品文",
    "example": "",
    "collocations": [
      "essay"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "paper",
    "partOfSpeech": "n.",
    "definition": "论文；纸",
    "example": "",
    "collocations": [
      "paper"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "dissertation",
    "partOfSpeech": "n.",
    "definition": "专题论文；（尤指）学位论文",
    "example": "",
    "collocations": [
      "dissertation"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "project",
    "partOfSpeech": "n.",
    "definition": "（大中学生的）专题研究；项目；方案",
    "example": "",
    "collocations": [
      "project"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "heading",
    "partOfSpeech": "n.",
    "definition": "标题；主题",
    "example": "",
    "collocations": [
      "heading"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "outset",
    "partOfSpeech": "n.",
    "definition": "开端；开始",
    "example": "",
    "collocations": [
      "outset"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "outline",
    "partOfSpeech": "n.",
    "definition": "概要；轮廓",
    "example": "",
    "collocations": [
      "outline"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "point",
    "partOfSpeech": "n.",
    "definition": "点；要点",
    "example": "",
    "collocations": [
      "point"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "gist",
    "partOfSpeech": "n.",
    "definition": "主旨；要点",
    "example": "He cannot understand the gist of their argument.",
    "collocations": [
      "gist"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "opinion",
    "partOfSpeech": "n.",
    "definition": "看法；评价",
    "example": "",
    "collocations": [
      "opinion"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "introduce",
    "partOfSpeech": "v.",
    "definition": "介绍；引进",
    "example": "",
    "collocations": [
      "introduce"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "reference",
    "partOfSpeech": "n.",
    "definition": "参考；推荐函；提及；涉及",
    "example": "",
    "collocations": [
      "reference"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "cite",
    "partOfSpeech": "v.",
    "definition": "引用",
    "example": "",
    "collocations": [
      "cite"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "elicit",
    "partOfSpeech": "v.",
    "definition": "引出；探出；套出",
    "example": "",
    "collocations": [
      "elicit"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "quote",
    "partOfSpeech": "v.",
    "definition": "引用；引述；报（价）",
    "example": "",
    "collocations": [
      "quote"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "extract",
    "partOfSpeech": "n.",
    "definition": "摘录",
    "example": "",
    "collocations": [
      "extract"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "abstract",
    "partOfSpeech": "n./adj./v.",
    "definition": "摘要。抽象的。提取；把...抽象出",
    "example": "",
    "collocations": [
      "abstract"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "summary",
    "partOfSpeech": "n.",
    "definition": "摘要；概要",
    "example": "",
    "collocations": [
      "summary"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "assume",
    "partOfSpeech": "v.",
    "definition": "假定；设想；承担（责任）；取得（权力）",
    "example": "",
    "collocations": [
      "assumption n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "presume",
    "partOfSpeech": "v.",
    "definition": "假定；假设；料想",
    "example": "",
    "collocations": [
      "presume"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "suppose",
    "partOfSpeech": "v.",
    "definition": "假定；认为",
    "example": "Let us suppose another planet with conditions similar to those on the earth.",
    "collocations": [
      "be suppose to do sth."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "hypothesis",
    "partOfSpeech": "n.",
    "definition": "假说；假设",
    "example": "",
    "collocations": [
      "hypothesis"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "postulate",
    "partOfSpeech": "v./n.",
    "definition": "假定；假设",
    "example": "",
    "collocations": [
      "postulate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "speculate",
    "partOfSpeech": "v.",
    "definition": "推测",
    "example": "",
    "collocations": [
      "speculate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "predict",
    "partOfSpeech": "v.",
    "definition": "预测",
    "example": "",
    "collocations": [
      "predict"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "perceive",
    "partOfSpeech": "v.",
    "definition": "感知；察觉；意识到",
    "example": "I perceived that it was not possible to make her change her mind.",
    "collocations": [
      "perceive"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "detect",
    "partOfSpeech": "v.",
    "definition": "察觉；发觉；侦查出",
    "example": "",
    "collocations": [
      "detect"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "discern",
    "partOfSpeech": "v.",
    "definition": "察觉出；分辨出",
    "example": "",
    "collocations": [
      "discern"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "recognise",
    "partOfSpeech": "v.",
    "definition": "=recognize 认识；辨认出",
    "example": "",
    "collocations": [
      "recognise"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "conscious",
    "partOfSpeech": "adj.",
    "definition": "意识到的；有知觉的",
    "example": "",
    "collocations": [
      "conscious"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "reckon",
    "partOfSpeech": "v.",
    "definition": "估计；期望；认为",
    "example": "",
    "collocations": [
      "reckon"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "deem",
    "partOfSpeech": "v.",
    "definition": "认为；相信",
    "example": "",
    "collocations": [
      "deem"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "imply",
    "partOfSpeech": "v.",
    "definition": "暗指；意味着",
    "example": "",
    "collocations": [
      "imply"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "deliberate",
    "partOfSpeech": "v./adj.",
    "definition": "深思熟虑；仔细考虑。审慎的",
    "example": "",
    "collocations": [
      "deliberate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "represent",
    "partOfSpeech": "v.",
    "definition": "代表；象征",
    "example": "",
    "collocations": [
      "represent"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "insist",
    "partOfSpeech": "v.",
    "definition": "坚持；坚决认为（主张或要求）",
    "example": "",
    "collocations": [
      "insist"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "persist",
    "partOfSpeech": "v.",
    "definition": "坚持不懈；持续存在",
    "example": "",
    "collocations": [
      "persist"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "understand",
    "partOfSpeech": "v.",
    "definition": "懂得；理解",
    "example": "",
    "collocations": [
      "understand"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "comprehend",
    "partOfSpeech": "v.",
    "definition": "理解；领悟",
    "example": "",
    "collocations": [
      "comprehend"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "analyse",
    "partOfSpeech": "v.",
    "definition": "=analyze 分析",
    "example": "",
    "collocations": [
      "analyse"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "diagnose",
    "partOfSpeech": "v.",
    "definition": "判断；诊断",
    "example": "",
    "collocations": [
      "diagnose"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "infer",
    "partOfSpeech": "v.",
    "definition": "推断；推理",
    "example": "",
    "collocations": [
      "infer"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "deduce",
    "partOfSpeech": "v.",
    "definition": "演绎；推论",
    "example": "",
    "collocations": [
      "deduce"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "conclude",
    "partOfSpeech": "v.",
    "definition": "推断出；得出结论；（使）结束",
    "example": "",
    "collocations": [
      "conclude"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "analogy",
    "partOfSpeech": "n.",
    "definition": "类比；类推",
    "example": "",
    "collocations": [
      "analogous adj."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "compare",
    "partOfSpeech": "v.",
    "definition": "比较；把...比作；比得上",
    "example": "",
    "collocations": [
      "compare"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "contrast",
    "partOfSpeech": "n.",
    "definition": "对比；明显的差异",
    "example": "",
    "collocations": [
      "by contrast/in contrast"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "overlap",
    "partOfSpeech": "v.",
    "definition": "与...复叠；（与...）部分相同",
    "example": "",
    "collocations": [
      "overlap"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "contradiction",
    "partOfSpeech": "n.",
    "definition": "矛盾；不一致；反驳",
    "example": "",
    "collocations": [
      "contradiction"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "disagree",
    "partOfSpeech": "v.",
    "definition": "有分歧；不同意",
    "example": "",
    "collocations": [
      "disagree"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "differ",
    "partOfSpeech": "v.",
    "definition": "不同、相异",
    "example": "",
    "collocations": [
      "differ from"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "diverse",
    "partOfSpeech": "adj.",
    "definition": "不一样的；多种多样的",
    "example": "",
    "collocations": [
      "diverse"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "nuance",
    "partOfSpeech": "n.",
    "definition": "细微差别",
    "example": "",
    "collocations": [
      "nuance"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "inductive",
    "partOfSpeech": "adj.",
    "definition": "归纳的；诱导的",
    "example": "",
    "collocations": [
      "inductive"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "detail",
    "partOfSpeech": "n.",
    "definition": "细节；（画等的）细节",
    "example": "",
    "collocations": [
      "detailed adj."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "thorough",
    "partOfSpeech": "adj.",
    "definition": "彻底的；详尽的",
    "example": "",
    "collocations": [
      "thorough"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "example",
    "partOfSpeech": "n.",
    "definition": "例子；榜样",
    "example": "",
    "collocations": [
      "example"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "instance",
    "partOfSpeech": "n.",
    "definition": "实例；情况；场合",
    "example": "",
    "collocations": [
      "for instance"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "confirm",
    "partOfSpeech": "v.",
    "definition": "证实；确保；巩固",
    "example": "",
    "collocations": [
      "confirm"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "demonstrate",
    "partOfSpeech": "v.",
    "definition": "示范；演示；证明",
    "example": "",
    "collocations": [
      "demonstration n."
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "illustrate",
    "partOfSpeech": "v.",
    "definition": "（用图等）说明；给（书）加插图（或图表）",
    "example": "",
    "collocations": [
      "illustrate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "manifest",
    "partOfSpeech": "v.",
    "definition": "显示；表明",
    "example": "",
    "collocations": [
      "manifest"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "prove",
    "partOfSpeech": "v.",
    "definition": "证明；结果是",
    "example": "",
    "collocations": [
      "prove"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "determine",
    "partOfSpeech": "v.",
    "definition": "决定；下定决心；查明",
    "example": "",
    "collocations": [
      "determinant n."
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "decide",
    "partOfSpeech": "v.",
    "definition": "决定",
    "example": "",
    "collocations": [
      "decision n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "resolve",
    "partOfSpeech": "v.",
    "definition": "决心；决定；（使）分解为；解决",
    "example": "",
    "collocations": [
      "resolution n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "survey",
    "partOfSpeech": "n./v.",
    "definition": "民意调查；对...进行民意调查",
    "example": "",
    "collocations": [
      "survey"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "research",
    "partOfSpeech": "n.",
    "definition": "调查；探索",
    "example": "",
    "collocations": [
      "research"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "observe",
    "partOfSpeech": "v.",
    "definition": "观察；观测；注意到",
    "example": "",
    "collocations": [
      "observe"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "inquire",
    "partOfSpeech": "v.",
    "definition": "=enquire 询问；调查",
    "example": "",
    "collocations": [
      "inquiry n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "query",
    "partOfSpeech": "n./v.",
    "definition": "\u0010疑问；询问；怀疑；询问",
    "example": "",
    "collocations": [
      "query"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "questionnaire",
    "partOfSpeech": "n.",
    "definition": "调查表；调查问卷",
    "example": "",
    "collocations": [
      "questionnaire"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "achieve",
    "partOfSpeech": "v.",
    "definition": "实现；到达",
    "example": "",
    "collocations": [
      "achievement n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "accomplish",
    "partOfSpeech": "v.",
    "definition": "达到（目的）；完成",
    "example": "",
    "collocations": [
      "accomplish"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "attain",
    "partOfSpeech": "v.",
    "definition": "获得；达到",
    "example": "",
    "collocations": [
      "attainment n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "credit",
    "partOfSpeech": "n.",
    "definition": "赊购；学分；信任",
    "example": "",
    "collocations": [
      "credit"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "score",
    "partOfSpeech": "n.",
    "definition": "得分、成绩",
    "example": "",
    "collocations": [
      "score"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "mark",
    "partOfSpeech": "n./v.",
    "definition": "分数；标记；标志着；给...打分；在...上做记号",
    "example": "",
    "collocations": [
      "mark"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "grade",
    "partOfSpeech": "v./n.",
    "definition": "给...分等级：等级；成绩等级",
    "example": "",
    "collocations": [
      "grade"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "rank",
    "partOfSpeech": "n./v.",
    "definition": "等级；排；列；给...评级；位列",
    "example": "",
    "collocations": [
      "ranking n."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "row",
    "partOfSpeech": "n.",
    "definition": "一排；一行",
    "example": "",
    "collocations": [
      "row"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "queue",
    "partOfSpeech": "n./v.",
    "definition": "行列；队列；排队等候",
    "example": "",
    "collocations": [
      "queue"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "grant",
    "partOfSpeech": "v.",
    "definition": "授予；准予；承认",
    "example": "",
    "collocations": [
      "take sth. for granted"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "praise",
    "partOfSpeech": "n./v.",
    "definition": "赞美；赞扬",
    "example": "",
    "collocations": [
      "full of praise"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "appreciate",
    "partOfSpeech": "v.",
    "definition": "赏识；感激；意识到",
    "example": "",
    "collocations": [
      "appreciate"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "feedback",
    "partOfSpeech": "n.",
    "definition": "反馈；反应",
    "example": "",
    "collocations": [
      "feedback"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "underestimate",
    "partOfSpeech": "v.",
    "definition": "低估",
    "example": "",
    "collocations": [
      "estimate v."
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "overestimate",
    "partOfSpeech": "v.",
    "definition": "高估",
    "example": "",
    "collocations": [
      "overestimate"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "apply",
    "partOfSpeech": "v.",
    "definition": "申请",
    "example": "",
    "collocations": [
      "apply"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "fellowship",
    "partOfSpeech": "n.",
    "definition": "研究生奖学金",
    "example": "",
    "collocations": [
      "fellowship"
    ],
    "topicLabel": "学校教育",
    "level": "B2"
  },
  {
    "word": "scholarship",
    "partOfSpeech": "n.",
    "definition": "奖学金；学问；学识",
    "example": "",
    "collocations": [
      "scholarship"
    ],
    "topicLabel": "学校教育",
    "level": "C1"
  },
  {
    "word": "reward",
    "partOfSpeech": "n./v.",
    "definition": "报答；赏金；报答",
    "example": "",
    "collocations": [
      "reward sb. for sth."
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "award",
    "partOfSpeech": "n.",
    "definition": "奖；奖品",
    "example": "",
    "collocations": [
      "award"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "prize",
    "partOfSpeech": "n./v.",
    "definition": "奖赏；珍视",
    "example": "",
    "collocations": [
      "prize"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "fee",
    "partOfSpeech": "n.",
    "definition": "酬金；费用",
    "example": "",
    "collocations": [
      "fee"
    ],
    "topicLabel": "学校教育",
    "level": "B1"
  },
  {
    "word": "technology",
    "partOfSpeech": "n.",
    "definition": "技术",
    "example": "",
    "collocations": [
      "technological adj.",
      "advanced technology"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "technique",
    "partOfSpeech": "n.",
    "definition": "技巧；技术",
    "example": "",
    "collocations": [
      "technical adj."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "polytechnic",
    "partOfSpeech": "adj./n.",
    "definition": "有关多种工艺的；理工学院",
    "example": "",
    "collocations": [
      "polytechnic"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "engineer",
    "partOfSpeech": "n.",
    "definition": "工程师；技师",
    "example": "",
    "collocations": [
      "engineer"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "mechanic",
    "partOfSpeech": "n.",
    "definition": "技工；机械师；机修工",
    "example": "",
    "collocations": [
      "mechanic"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "advance",
    "partOfSpeech": "n./v.",
    "definition": "发展；前进",
    "example": "",
    "collocations": [
      "advance"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "innovate",
    "partOfSpeech": "v.",
    "definition": "创新；改革",
    "example": "",
    "collocations": [
      "innovate"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "breakthrough",
    "partOfSpeech": "n.",
    "definition": "突破",
    "example": "",
    "collocations": [
      "breakthrough"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "gizmo",
    "partOfSpeech": "n.",
    "definition": "小装置",
    "example": "",
    "collocations": [
      "gizmo"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "patent",
    "partOfSpeech": "n./v.",
    "definition": "专利；专利权；得到...的专利权；给...专利证",
    "example": "",
    "collocations": [
      "patent"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "devise",
    "partOfSpeech": "v.",
    "definition": "设计；发明",
    "example": "",
    "collocations": [
      "device n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "discover",
    "partOfSpeech": "v.",
    "definition": "发现",
    "example": "",
    "collocations": [
      "discover"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "disclose",
    "partOfSpeech": "v.",
    "definition": "揭露；透露",
    "example": "",
    "collocations": [
      "disclose"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "reveal",
    "partOfSpeech": "v.",
    "definition": "展现；显示；透露",
    "example": "",
    "collocations": [
      "reveal"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "uncover",
    "partOfSpeech": "v.",
    "definition": "揭露；发现",
    "example": "",
    "collocations": [
      "uncover"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "expose",
    "partOfSpeech": "v.",
    "definition": "使暴露；揭发；使曝光",
    "example": "",
    "collocations": [
      "expose"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "domain",
    "partOfSpeech": "n.",
    "definition": "（活动、学问等的）领域；领土；领地",
    "example": "",
    "collocations": [
      "domain"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "realm",
    "partOfSpeech": "n.",
    "definition": "领域",
    "example": "",
    "collocations": [
      "realm"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "foundation",
    "partOfSpeech": "n.",
    "definition": "基础；地基；基金会",
    "example": "",
    "collocations": [
      "foundation"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "specialise",
    "partOfSpeech": "v.",
    "definition": "=specialze 专攻",
    "example": "",
    "collocations": [
      "specialise in"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "concentrate",
    "partOfSpeech": "v.",
    "definition": "（集中）心思；（使）浓缩",
    "example": "",
    "collocations": [
      "concentration n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "focus",
    "partOfSpeech": "v./n.",
    "definition": "集中于；焦点",
    "example": "",
    "collocations": [
      "focus"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "utilise",
    "partOfSpeech": "v.",
    "definition": "=utilize 利用",
    "example": "",
    "collocations": [
      "utility n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "usage",
    "partOfSpeech": "n.",
    "definition": "使用；用法",
    "example": "",
    "collocations": [
      "usage"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "tester",
    "partOfSpeech": "n.",
    "definition": "测试员；测试仪",
    "example": "",
    "collocations": [
      "tester"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "device",
    "partOfSpeech": "n.",
    "definition": "装置；设备；手段；策略",
    "example": "",
    "collocations": [
      "device"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "appliance",
    "partOfSpeech": "n.",
    "definition": "应用；（家用）器具",
    "example": "",
    "collocations": [
      "appliance"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "facility",
    "partOfSpeech": "n.",
    "definition": "设备；便利",
    "example": "",
    "collocations": [
      "facility"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "equipment",
    "partOfSpeech": "n.",
    "definition": "设备",
    "example": "",
    "collocations": [
      "equipment"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "instrument",
    "partOfSpeech": "n.",
    "definition": "仪器；工具；乐器",
    "example": "",
    "collocations": [
      "instrument"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "tool",
    "partOfSpeech": "n.",
    "definition": "工具",
    "example": "",
    "collocations": [
      "tool"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "gauge",
    "partOfSpeech": "n./v.",
    "definition": "测量仪器；测量；判断",
    "example": "",
    "collocations": [
      "gauge"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "measure",
    "partOfSpeech": "v./n.",
    "definition": "测量；衡量；措施",
    "example": "",
    "collocations": [
      "measurable adj."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "calculate",
    "partOfSpeech": "v.",
    "definition": "计算；考虑；打算",
    "example": "",
    "collocations": [
      "calculation n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "compute",
    "partOfSpeech": "n.",
    "definition": "计算；估计",
    "example": "",
    "collocations": [
      "compute"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "count",
    "partOfSpeech": "v.",
    "definition": "计算",
    "example": "",
    "collocations": [
      "counter n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "estimate",
    "partOfSpeech": "n./v.",
    "definition": "估计；估价；评价",
    "example": "",
    "collocations": [
      "estimate"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "assess",
    "partOfSpeech": "v.",
    "definition": "评估；估算",
    "example": "",
    "collocations": [
      "assess"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "evaluate",
    "partOfSpeech": "v.",
    "definition": "评价；评估",
    "example": "",
    "collocations": [
      "evaluate"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "accessory",
    "partOfSpeech": "n.",
    "definition": "附件；配件",
    "example": "",
    "collocations": [
      "accessory"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "byproduct",
    "partOfSpeech": "n.",
    "definition": "副产品",
    "example": "",
    "collocations": [
      "bypass n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "auxiliary",
    "partOfSpeech": "adj.",
    "definition": "辅助的；协助的；备用的",
    "example": "",
    "collocations": [
      "auxiliary"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "versatile",
    "partOfSpeech": "adj.",
    "definition": "多功能的；多用途的",
    "example": "",
    "collocations": [
      "versatile"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "add",
    "partOfSpeech": "v.",
    "definition": "添加；附加",
    "example": "",
    "collocations": [
      "add"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "accumulate",
    "partOfSpeech": "v.",
    "definition": "累积；（数额）不断增加",
    "example": "",
    "collocations": [
      "accumulate"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "assemble",
    "partOfSpeech": "v.",
    "definition": "集合；聚集",
    "example": "",
    "collocations": [
      "assemble"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "gather",
    "partOfSpeech": "v.",
    "definition": "收集；采集",
    "example": "",
    "collocations": [
      "gather"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "attach",
    "partOfSpeech": "v.",
    "definition": "使依附；附加；缚；系；贴",
    "example": "",
    "collocations": [
      "attachment n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "belong",
    "partOfSpeech": "v.",
    "definition": "应在（某处）；适合（某种情形）",
    "example": "",
    "collocations": [
      "belong to"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "optics",
    "partOfSpeech": "n.",
    "definition": "光学",
    "example": "",
    "collocations": [
      "optics"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "microscope",
    "partOfSpeech": "n.",
    "definition": "显微镜",
    "example": "",
    "collocations": [
      "microphone n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "lens",
    "partOfSpeech": "n.",
    "definition": "镜头；透镜",
    "example": "",
    "collocations": [
      "lens"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "radar",
    "partOfSpeech": "n.",
    "definition": "雷达",
    "example": "",
    "collocations": [
      "radar"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "echo",
    "partOfSpeech": "n./v.",
    "definition": "回声；发回声；模仿；重复",
    "example": "",
    "collocations": [
      "echo"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "sensor",
    "partOfSpeech": "n.",
    "definition": "传感器",
    "example": "",
    "collocations": [
      "sensor"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "multimedia",
    "partOfSpeech": "n.",
    "definition": "多媒体",
    "example": "",
    "collocations": [
      "multimedia"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "network",
    "partOfSpeech": "n.",
    "definition": "网络",
    "example": "",
    "collocations": [
      "network"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "browser",
    "partOfSpeech": "n.",
    "definition": "浏览器",
    "example": "",
    "collocations": [
      "browser"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "dial",
    "partOfSpeech": "v.",
    "definition": "拨（电话号码）",
    "example": "",
    "collocations": [
      "dial"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "microcomputer",
    "partOfSpeech": "n.",
    "definition": "微型计算机",
    "example": "",
    "collocations": [
      "microcomputer"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "laptop",
    "partOfSpeech": "n.",
    "definition": "笔记本电脑",
    "example": "",
    "collocations": [
      "laptop"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "software",
    "partOfSpeech": "n.",
    "definition": "软件",
    "example": "",
    "collocations": [
      "software"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "keyboard",
    "partOfSpeech": "n.",
    "definition": "键盘",
    "example": "",
    "collocations": [
      "keyboard"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "screen",
    "partOfSpeech": "n.",
    "definition": "屏幕",
    "example": "",
    "collocations": [
      "screen"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "loudspeaker",
    "partOfSpeech": "n.",
    "definition": "扬声器；喇叭",
    "example": "",
    "collocations": [
      "loudspeaker"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "microphone",
    "partOfSpeech": "n.",
    "definition": "麦克风；话筒",
    "example": "",
    "collocations": [
      "microphone"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "cassette",
    "partOfSpeech": "n.",
    "definition": "盒式磁带；底片盒",
    "example": "",
    "collocations": [
      "cassette"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "tape",
    "partOfSpeech": "n.",
    "definition": "磁带；录音带；胶带",
    "example": "",
    "collocations": [
      "tape"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "binary",
    "partOfSpeech": "adj.",
    "definition": "二进制的；二元的",
    "example": "",
    "collocations": [
      "binary"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "digital",
    "partOfSpeech": "adj.",
    "definition": "数字的",
    "example": "",
    "collocations": [
      "digital"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "wireless",
    "partOfSpeech": "adj.",
    "definition": "无线的",
    "example": "",
    "collocations": [
      "wireless"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "high-definition",
    "partOfSpeech": "adj.",
    "definition": "高分辨率的",
    "example": "",
    "collocations": [
      "high-definition"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "audio",
    "partOfSpeech": "adj.",
    "definition": "声音的",
    "example": "",
    "collocations": [
      "audio"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "vision",
    "partOfSpeech": "n.",
    "definition": "视觉；视力",
    "example": "",
    "collocations": [
      "vision"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "fantasy",
    "partOfSpeech": "n.",
    "definition": "幻想",
    "example": "He is unable to divorce fantasy from reality.",
    "collocations": [
      "fantastic adj."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "science fiction",
    "partOfSpeech": "n.",
    "definition": "=sci-fi 科幻作品",
    "example": "",
    "collocations": [
      "science fiction"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "pump",
    "partOfSpeech": "n./v.",
    "definition": "泵；（用泵）抽",
    "example": "",
    "collocations": [
      "pump"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "generator",
    "partOfSpeech": "n.",
    "definition": "发电机",
    "example": "",
    "collocations": [
      "generator"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "gear",
    "partOfSpeech": "n./v.",
    "definition": "齿轮；传动装置；使适合",
    "example": "Education should be geared to children's needs.",
    "collocations": [
      "in high gear"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "pivot",
    "partOfSpeech": "n.",
    "definition": "枢轴；支点；中心；重点",
    "example": "The mother is often the pivot of family life.",
    "collocations": [
      "pivot"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "hydraulic",
    "partOfSpeech": "adj.",
    "definition": "水力的；液压的",
    "example": "",
    "collocations": [
      "hydraulic"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "drainage",
    "partOfSpeech": "n.",
    "definition": "排水系统；排水",
    "example": "",
    "collocations": [
      "drainage"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "sewage",
    "partOfSpeech": "n.",
    "definition": "（下水道的）污水",
    "example": "",
    "collocations": [
      "sewage"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "ventilation",
    "partOfSpeech": "n.",
    "definition": "通风设备；通风",
    "example": "",
    "collocations": [
      "ventilation"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "compress",
    "partOfSpeech": "v.",
    "definition": "压缩；压紧",
    "example": "",
    "collocations": [
      "compress"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "condense",
    "partOfSpeech": "v.",
    "definition": "减缩；精简；（使气体）凝结",
    "example": "A long story may be condensed into a few sentences.",
    "collocations": [
      "condense"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "refine",
    "partOfSpeech": "v.",
    "definition": "精炼；提纯",
    "example": "",
    "collocations": [
      "refine"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "simplify",
    "partOfSpeech": "v.",
    "definition": "简化；精简",
    "example": "",
    "collocations": [
      "simplicity n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "purify",
    "partOfSpeech": "v.",
    "definition": "净化；使纯净",
    "example": "",
    "collocations": [
      "purify"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "filter",
    "partOfSpeech": "v./n.",
    "definition": "过滤；（光或声音）透过；过滤器",
    "example": "",
    "collocations": [
      "filter"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "distil",
    "partOfSpeech": "v.",
    "definition": "=distill 蒸馏；提取...的精华",
    "example": "",
    "collocations": [
      "distil"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "mode",
    "partOfSpeech": "n.",
    "definition": "模式；方式",
    "example": "",
    "collocations": [
      "mode"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "prototype",
    "partOfSpeech": "n.",
    "definition": "原型；雏形",
    "example": "",
    "collocations": [
      "prototype"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "framework",
    "partOfSpeech": "n.",
    "definition": "框架；体系；结构",
    "example": "",
    "collocations": [
      "framework"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "aspect",
    "partOfSpeech": "n.",
    "definition": "（问题、事务的）方面",
    "example": "",
    "collocations": [
      "aspect"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "phase",
    "partOfSpeech": "n.",
    "definition": "阶段；时期",
    "example": "The first phase of the project has been completed.",
    "collocations": [
      "phase"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "operate",
    "partOfSpeech": "v.",
    "definition": "操作；运营；做手术",
    "example": "",
    "collocations": [
      "operation n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "facilitate",
    "partOfSpeech": "v.",
    "definition": "使便利；促进",
    "example": "Many modern inventions facilitate housework.",
    "collocations": [
      "facilitate"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "transform",
    "partOfSpeech": "v.",
    "definition": "使改变形态；使改观",
    "example": "",
    "collocations": [
      "transformation n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "convert",
    "partOfSpeech": "v./n.",
    "definition": "（使）转变、改变（信仰、观点等）；皈依者",
    "example": "",
    "collocations": [
      "conversion n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "alter",
    "partOfSpeech": "v.",
    "definition": "变更；改变",
    "example": "",
    "collocations": [
      "alternative adj."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "shift",
    "partOfSpeech": "v./n.",
    "definition": "转移；变换；轮班",
    "example": "The wind shifted to the north.",
    "collocations": [
      "the day shift"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "turn",
    "partOfSpeech": "v./n.",
    "definition": "转移；转变；（一次轮到的）机会",
    "example": "",
    "collocations": [
      "turning n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "adapt",
    "partOfSpeech": "v.",
    "definition": "适应；改编",
    "example": "",
    "collocations": [
      "adaptation n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "adjust",
    "partOfSpeech": "v.",
    "definition": "调节；改变（行为或观点）以适应",
    "example": "",
    "collocations": [
      "adjustment n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "pinpoint",
    "partOfSpeech": "v./n.",
    "definition": "精确指明...位置；针尖；极小的事物",
    "example": "",
    "collocations": [
      "pinpoint"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "accurate",
    "partOfSpeech": "adj.",
    "definition": "准确的；正确无误的",
    "example": "",
    "collocations": [
      "accurate"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "precise",
    "partOfSpeech": "adj.",
    "definition": "精确的；准确的；一丝不苟的",
    "example": "precisely adv. 正是；恰好地。at that precise moment 恰好在那个时刻.",
    "collocations": [
      "precise"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "correct",
    "partOfSpeech": "adj.",
    "definition": "正确的",
    "example": "",
    "collocations": [
      "correction n."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "error",
    "partOfSpeech": "n.",
    "definition": "错误；过失",
    "example": "",
    "collocations": [
      "error"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "mistake",
    "partOfSpeech": "n./v.",
    "definition": "错误；误解",
    "example": "",
    "collocations": [
      "mistake"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "flaw",
    "partOfSpeech": "n.",
    "definition": "缺陷；错误",
    "example": "",
    "collocations": [
      "flaw"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "wrong",
    "partOfSpeech": "adj./adv.",
    "definition": "错误的；错误地",
    "example": "",
    "collocations": [
      "go wrong"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "fault",
    "partOfSpeech": "n./v.",
    "definition": "缺点；故障；找出缺点",
    "example": "",
    "collocations": [
      "faulty adj."
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "stumble",
    "partOfSpeech": "v.",
    "definition": "犯错误；绊脚；跌跌撞撞的走",
    "example": "",
    "collocations": [
      "stumble"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "contingency",
    "partOfSpeech": "n.",
    "definition": "意外事件；可能发生的事",
    "example": "",
    "collocations": [
      "contingency"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "circumstance",
    "partOfSpeech": "n.",
    "definition": "情况；条件；环境；境遇",
    "example": "",
    "collocations": [
      "circumstance"
    ],
    "topicLabel": "科技发明",
    "level": "C1"
  },
  {
    "word": "culture",
    "partOfSpeech": "n.",
    "definition": "文化；文明；教养",
    "example": "",
    "collocations": [
      "culture"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "civilization",
    "partOfSpeech": "n.",
    "definition": "=civilization 文明",
    "example": "",
    "collocations": [
      "civilization"
    ],
    "topicLabel": "文化历史",
    "level": "C1"
  },
  {
    "word": "renaissance",
    "partOfSpeech": "n.",
    "definition": "the Renaissance 文艺复兴时期",
    "example": "",
    "collocations": [
      "renaissance"
    ],
    "topicLabel": "文化历史",
    "level": "C1"
  },
  {
    "word": "epic",
    "partOfSpeech": "n./adj.",
    "definition": "史诗；宏大的",
    "example": "",
    "collocations": [
      "epic"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "ideology",
    "partOfSpeech": "n.",
    "definition": "意识形态；思想体系",
    "example": "",
    "collocations": [
      "ideology"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "tradition",
    "partOfSpeech": "n.",
    "definition": "传统",
    "example": "",
    "collocations": [
      "traditional adj."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "convention",
    "partOfSpeech": "n.",
    "definition": "惯例；大型会议",
    "example": "",
    "collocations": [
      "conventional adj."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "custom",
    "partOfSpeech": "n.",
    "definition": "习俗；（个人的）习惯",
    "example": "",
    "collocations": [
      "customs n."
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "feudalism",
    "partOfSpeech": "n.",
    "definition": "封建主义；封建制度",
    "example": "Feudalism was not abolished in England util 1660.",
    "collocations": [
      "feudal adj."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "slavery",
    "partOfSpeech": "n.",
    "definition": "奴隶制",
    "example": "",
    "collocations": [
      "slavery"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "ethical",
    "partOfSpeech": "adj.",
    "definition": "伦理的；道德的",
    "example": "",
    "collocations": [
      "ethical"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "moral",
    "partOfSpeech": "adj./n.",
    "definition": "道德上的；有道德的；morals 道德",
    "example": "",
    "collocations": [
      "immoral adj."
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "tribe",
    "partOfSpeech": "n.",
    "definition": "部落",
    "example": "",
    "collocations": [
      "tribe"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "aboriginal",
    "partOfSpeech": "n./adj.",
    "definition": "Aboriginal 澳大利亚土人；本土原有的；土著的",
    "example": "",
    "collocations": [
      "original adj."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "inhabitant",
    "partOfSpeech": "n.",
    "definition": "居民",
    "example": "",
    "collocations": [
      "inhabit v."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "native",
    "partOfSpeech": "adj./n.",
    "definition": "本土的；本地人",
    "example": "",
    "collocations": [
      "native"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "local",
    "partOfSpeech": "adj./n.",
    "definition": "当地的；本地人",
    "example": "",
    "collocations": [
      "local"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "exotic",
    "partOfSpeech": "adj.",
    "definition": "外来的；异国情调的",
    "example": "",
    "collocations": [
      "exotic"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "foreigner",
    "partOfSpeech": "n.",
    "definition": "外国人",
    "example": "",
    "collocations": [
      "foreigner"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "alien",
    "partOfSpeech": "n./adj.",
    "definition": "外侨；外星人；外国的；陌生的",
    "example": "",
    "collocations": [
      "alienate v."
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "anthropologist",
    "partOfSpeech": "n.",
    "definition": "人类学家",
    "example": "",
    "collocations": [
      "anthropology n."
    ],
    "topicLabel": "文化历史",
    "level": "C1"
  },
  {
    "word": "humanitarian",
    "partOfSpeech": "n./adj.",
    "definition": "人道主义者；人道主义的；博爱的",
    "example": "",
    "collocations": [
      "humanitarian"
    ],
    "topicLabel": "文化历史",
    "level": "C1"
  },
  {
    "word": "heritage",
    "partOfSpeech": "n.",
    "definition": "（国家的）遗产",
    "example": "",
    "collocations": [
      "heritage"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "inherit",
    "partOfSpeech": "v.",
    "definition": "继承（财产等）；经遗传获得",
    "example": "",
    "collocations": [
      "inheritance n."
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "antique",
    "partOfSpeech": "n./adj.",
    "definition": "古董；古董的",
    "example": "",
    "collocations": [
      "antique"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "archaeology",
    "partOfSpeech": "n.",
    "definition": "考古学",
    "example": "",
    "collocations": [
      "archaeological adj.",
      "archaeologist n."
    ],
    "topicLabel": "文化历史",
    "level": "C1"
  },
  {
    "word": "excavate",
    "partOfSpeech": "v.",
    "definition": "发掘；挖掘",
    "example": "",
    "collocations": [
      "excavation n."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "museum",
    "partOfSpeech": "n.",
    "definition": "博物馆",
    "example": "",
    "collocations": [
      "museum"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "pottery",
    "partOfSpeech": "n.",
    "definition": "陶瓷",
    "example": "",
    "collocations": [
      "pottery"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "engrave",
    "partOfSpeech": "v.",
    "definition": "在...上雕刻",
    "example": "",
    "collocations": [
      "engrave"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "decorate",
    "partOfSpeech": "v.",
    "definition": "装饰",
    "example": "",
    "collocations": [
      "decorate"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "religion",
    "partOfSpeech": "n.",
    "definition": "宗教；宗教信仰",
    "example": "",
    "collocations": [
      "religious adj."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "ritual",
    "partOfSpeech": "n.",
    "definition": "仪式",
    "example": "",
    "collocations": [
      "ritual"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "etiquette",
    "partOfSpeech": "n.",
    "definition": "礼仪；礼节",
    "example": "",
    "collocations": [
      "etiquette"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "belief",
    "partOfSpeech": "n.",
    "definition": "信念；信仰",
    "example": "",
    "collocations": [
      "belief"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "soul",
    "partOfSpeech": "n.",
    "definition": "灵魂；心灵；精神",
    "example": "",
    "collocations": [
      "soul"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "spirit",
    "partOfSpeech": "n.",
    "definition": "精神；心灵",
    "example": "",
    "collocations": [
      "spirit"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "sacred",
    "partOfSpeech": "adj.",
    "definition": "神圣的；宗教的",
    "example": "",
    "collocations": [
      "sacred"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "hallowed",
    "partOfSpeech": "adj.",
    "definition": "神圣的；收尊崇的",
    "example": "",
    "collocations": [
      "hallowed"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "holy",
    "partOfSpeech": "adj.",
    "definition": "神圣的；圣洁的；虔诚的",
    "example": "",
    "collocations": [
      "holy"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "Pope",
    "partOfSpeech": "n.",
    "definition": "教皇",
    "example": "",
    "collocations": [
      "Pope"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "bishop",
    "partOfSpeech": "n.",
    "definition": "主教",
    "example": "",
    "collocations": [
      "bishop"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "missionary",
    "partOfSpeech": "n.",
    "definition": "传教士",
    "example": "",
    "collocations": [
      "missionary"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "priest",
    "partOfSpeech": "n.",
    "definition": "牧师；神父；教士",
    "example": "",
    "collocations": [
      "priest"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "Bible",
    "partOfSpeech": "n.",
    "definition": "（基督教）圣经",
    "example": "",
    "collocations": [
      "Bible"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "church",
    "partOfSpeech": "n.",
    "definition": "教堂",
    "example": "",
    "collocations": [
      "church"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "cathedral",
    "partOfSpeech": "n.",
    "definition": "大教堂",
    "example": "",
    "collocations": [
      "cathedral"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "choir",
    "partOfSpeech": "n.",
    "definition": "唱诗班",
    "example": "",
    "collocations": [
      "choir"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "monk",
    "partOfSpeech": "n.",
    "definition": "僧侣",
    "example": "",
    "collocations": [
      "monk"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "temple",
    "partOfSpeech": "n.",
    "definition": "师院；庙宇",
    "example": "",
    "collocations": [
      "temple"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "pagoda",
    "partOfSpeech": "n.",
    "definition": "佛塔",
    "example": "",
    "collocations": [
      "pagoda"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "empire",
    "partOfSpeech": "n.",
    "definition": "帝国",
    "example": "",
    "collocations": [
      "empire"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "imperial",
    "partOfSpeech": "adj.",
    "definition": "帝国的",
    "example": "",
    "collocations": [
      "imperial"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "royal",
    "partOfSpeech": "adj.",
    "definition": "皇家的；高贵的",
    "example": "",
    "collocations": [
      "royal"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "dynasty",
    "partOfSpeech": "n.",
    "definition": "朝代",
    "example": "",
    "collocations": [
      "dynasty"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "chronology",
    "partOfSpeech": "n.",
    "definition": "年代学；年表；事件发生的顺序表",
    "example": "",
    "collocations": [
      "chronology"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "emperor",
    "partOfSpeech": "n.",
    "definition": "皇帝",
    "example": "",
    "collocations": [
      "emperor"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "king",
    "partOfSpeech": "n.",
    "definition": "国王",
    "example": "",
    "collocations": [
      "king"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "queen",
    "partOfSpeech": "n.",
    "definition": "王后；女王",
    "example": "",
    "collocations": [
      "queen"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "prince",
    "partOfSpeech": "n.",
    "definition": "王子；亲王",
    "example": "",
    "collocations": [
      "prince"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "princess",
    "partOfSpeech": "n.",
    "definition": "公主；王妃",
    "example": "",
    "collocations": [
      "princess"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "majesty",
    "partOfSpeech": "n.",
    "definition": "威严；壮观；陛下",
    "example": "",
    "collocations": [
      "majestic adj."
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "nobility",
    "partOfSpeech": "n.",
    "definition": "高尚的品质；贵族",
    "example": "",
    "collocations": [
      "nobility"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "lord",
    "partOfSpeech": "n.",
    "definition": "（英国）贵族；Lord 阁下；大人；the Lord 上帝",
    "example": "",
    "collocations": [
      "lord"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "knight",
    "partOfSpeech": "n./v.",
    "definition": "骑士；封（某人）为爵士",
    "example": "",
    "collocations": [
      "knight"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "guardian",
    "partOfSpeech": "n./adj.",
    "definition": "保卫者；监护人；守护的",
    "example": "",
    "collocations": [
      "guard n."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "nostalgia",
    "partOfSpeech": "n.",
    "definition": "思乡之情；怀旧之情",
    "example": "",
    "collocations": [
      "nostalgia"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "homesick",
    "partOfSpeech": "adj.",
    "definition": "思乡的",
    "example": "",
    "collocations": [
      "homesickness n."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "celebrity",
    "partOfSpeech": "n.",
    "definition": "名人；名誉",
    "example": "",
    "collocations": [
      "celebrity"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "status",
    "partOfSpeech": "n.",
    "definition": "地位；身份",
    "example": "",
    "collocations": [
      "social status"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "background",
    "partOfSpeech": "n.",
    "definition": "背景；（个人出身、受教育）经历",
    "example": "",
    "collocations": [
      "background"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "experience",
    "partOfSpeech": "n.",
    "definition": "经验；（一次）经历、体验",
    "example": "",
    "collocations": [
      "experienced adj."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "anecdote",
    "partOfSpeech": "n.",
    "definition": "轶事；奇闻",
    "example": "",
    "collocations": [
      "anecdote"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "accident",
    "partOfSpeech": "n.",
    "definition": "事故；意外；偶然事件",
    "example": "",
    "collocations": [
      "accidental adj."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "incident",
    "partOfSpeech": "n.",
    "definition": "（尤指不寻常的、重要的或暴力的）事件；（两国之间的）冲突",
    "example": "",
    "collocations": [
      "incident"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "thrive",
    "partOfSpeech": "v.",
    "definition": "繁荣；兴旺发达；茁壮成长",
    "example": "",
    "collocations": [
      "thrive"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "prosperity",
    "partOfSpeech": "n.",
    "definition": "繁荣；兴旺",
    "example": "",
    "collocations": [
      "prosper v."
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "setback",
    "partOfSpeech": "n.",
    "definition": "挫折；阻碍",
    "example": "",
    "collocations": [
      "setback"
    ],
    "topicLabel": "文化历史",
    "level": "B1"
  },
  {
    "word": "adversity",
    "partOfSpeech": "n.",
    "definition": "逆境",
    "example": "",
    "collocations": [
      "adversity"
    ],
    "topicLabel": "文化历史",
    "level": "B2"
  },
  {
    "word": "language",
    "partOfSpeech": "\bn.",
    "definition": "语言",
    "example": "",
    "collocations": [
      "language"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "symbol",
    "partOfSpeech": "n.",
    "definition": "象征；符号；记号",
    "example": "",
    "collocations": [
      "symbol"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "sign",
    "partOfSpeech": "n./v.",
    "definition": "符号；征兆；迹象；手势；签（名）",
    "example": "",
    "collocations": [
      "sign"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "gesture",
    "partOfSpeech": "n.",
    "definition": "手势；姿势",
    "example": "",
    "collocations": [
      "gesture"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "handwriting",
    "partOfSpeech": "n.",
    "definition": "笔记；书写",
    "example": "",
    "collocations": [
      "handwriting"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "pictograph",
    "partOfSpeech": "n.",
    "definition": "象形文字",
    "example": "",
    "collocations": [
      "pictograph"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "wedge",
    "partOfSpeech": "n.",
    "definition": "楔子；楔形物；楔形文字",
    "example": "",
    "collocations": [
      "wedge"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "knot",
    "partOfSpeech": "n.",
    "definition": "（绳、线的）结；（树枝上的）节子",
    "example": "",
    "collocations": [
      "knot"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "linguistics",
    "partOfSpeech": "n.",
    "definition": "语言学",
    "example": "",
    "collocations": [
      "linguistics"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "semantic",
    "partOfSpeech": "adj.",
    "definition": "语义的",
    "example": "",
    "collocations": [
      "semantic"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "syntax",
    "partOfSpeech": "n.",
    "definition": "句法",
    "example": "",
    "collocations": [
      "syntax"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "grammar",
    "partOfSpeech": "n.",
    "definition": "语法；语法书",
    "example": "",
    "collocations": [
      "grammar"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "phonetics",
    "partOfSpeech": "n.",
    "definition": "语音学",
    "example": "",
    "collocations": [
      "phonetics"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "pronounce",
    "partOfSpeech": "v.",
    "definition": "发...的音；宣布",
    "example": "",
    "collocations": [
      "pronunciation n."
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "intonation",
    "partOfSpeech": "n.",
    "definition": "语调",
    "example": "",
    "collocations": [
      "intonation"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "inflection",
    "partOfSpeech": "n.",
    "definition": "语调的抑扬变化",
    "example": "",
    "collocations": [
      "inflection"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "dialect",
    "partOfSpeech": "n.",
    "definition": "方言；地方话",
    "example": "",
    "collocations": [
      "dialect"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "accent",
    "partOfSpeech": "n.",
    "definition": "重音；口音；读音符号",
    "example": "",
    "collocations": [
      "accent"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "utterance",
    "partOfSpeech": "n.",
    "definition": "说话；言论",
    "example": "",
    "collocations": [
      "utterance"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "oral",
    "partOfSpeech": "adj.",
    "definition": "口头的",
    "example": "",
    "collocations": [
      "oral"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "verbal",
    "partOfSpeech": "adj.",
    "definition": "口头的；言语的",
    "example": "",
    "collocations": [
      "verbal"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "syllable",
    "partOfSpeech": "n.",
    "definition": "音节",
    "example": "",
    "collocations": [
      "syllable"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "phoneme",
    "partOfSpeech": "n.",
    "definition": "音位",
    "example": "",
    "collocations": [
      "phoneme"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "vowel",
    "partOfSpeech": "n.",
    "definition": "元音",
    "example": "",
    "collocations": [
      "vowel"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "consonent",
    "partOfSpeech": "n.",
    "definition": "辅音",
    "example": "",
    "collocations": [
      "consonent"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "alphabet",
    "partOfSpeech": "n.",
    "definition": "字母表；（一种语言的）全部字母",
    "example": "",
    "collocations": [
      "alphabet"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "logogram",
    "partOfSpeech": "n.",
    "definition": "词符；缩记符",
    "example": "",
    "collocations": [
      "logogram"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "vocabulary",
    "partOfSpeech": "n.",
    "definition": "词汇",
    "example": "",
    "collocations": [
      "vocabulary"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "dictionary",
    "partOfSpeech": "n.",
    "definition": "词典；字典",
    "example": "",
    "collocations": [
      "dictionary"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "idiom",
    "partOfSpeech": "n.",
    "definition": "习语",
    "example": "",
    "collocations": [
      "idiom"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "phrase",
    "partOfSpeech": "n.",
    "definition": "短语；习语",
    "example": "",
    "collocations": [
      "phrase"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "clause",
    "partOfSpeech": "n.",
    "definition": "从句；分句；条款",
    "example": "",
    "collocations": [
      "clause"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "expression",
    "partOfSpeech": "n.",
    "definition": "词语；表达；表情",
    "example": "",
    "collocations": [
      "expression"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "tense",
    "partOfSpeech": "n./adj.",
    "definition": "时态；紧张的",
    "example": "",
    "collocations": [
      "tense"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "prefix",
    "partOfSpeech": "n.",
    "definition": "前置代号；词首；前缀",
    "example": "",
    "collocations": [
      "prefix"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "suffix",
    "partOfSpeech": "n.",
    "definition": "后缀",
    "example": "",
    "collocations": [
      "suffix"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "abbreviation",
    "partOfSpeech": "n.",
    "definition": "缩写形式",
    "example": "",
    "collocations": [
      "abbreviation"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "synonym",
    "partOfSpeech": "n.",
    "definition": "同义词",
    "example": "",
    "collocations": [
      "synonym"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "antonym",
    "partOfSpeech": "n.",
    "definition": "反义词",
    "example": "",
    "collocations": [
      "antonym"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "noun",
    "partOfSpeech": "n.",
    "definition": "名词",
    "example": "",
    "collocations": [
      "noun"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "singular",
    "partOfSpeech": "n./adj.",
    "definition": "单数；非凡的；单数的",
    "example": "",
    "collocations": [
      "singular"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "plural",
    "partOfSpeech": "n./adj.",
    "definition": "复数；复数的；多元的",
    "example": "",
    "collocations": [
      "plural"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "pronoun",
    "partOfSpeech": "n.",
    "definition": "代词",
    "example": "",
    "collocations": [
      "pronoun"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "verb",
    "partOfSpeech": "n.",
    "definition": "动词",
    "example": "",
    "collocations": [
      "verb"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "adjective",
    "partOfSpeech": "n.",
    "definition": "形容词",
    "example": "",
    "collocations": [
      "adjective"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "adverb",
    "partOfSpeech": "n.",
    "definition": "副词",
    "example": "",
    "collocations": [
      "adverb"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "preposition",
    "partOfSpeech": "n.",
    "definition": "介词",
    "example": "",
    "collocations": [
      "preposition"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "conjunction",
    "partOfSpeech": "n.",
    "definition": "连词",
    "example": "",
    "collocations": [
      "conjunction"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "consistent",
    "partOfSpeech": "adj.",
    "definition": "一致的；（观点或看法）连贯的",
    "example": "",
    "collocations": [
      "inconsistent adj."
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "complicated",
    "partOfSpeech": "adj.",
    "definition": "复杂的",
    "example": "",
    "collocations": [
      "complicate v."
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "complex",
    "partOfSpeech": "adj.",
    "definition": "复杂的",
    "example": "",
    "collocations": [
      "complex"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "compile",
    "partOfSpeech": "v.",
    "definition": "编撰",
    "example": "",
    "collocations": [
      "compile"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "version",
    "partOfSpeech": "n.",
    "definition": "版本",
    "example": "",
    "collocations": [
      "version"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "translate",
    "partOfSpeech": "v.",
    "definition": "翻译；（使）转变",
    "example": "",
    "collocations": [
      "translate"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "paraphrase",
    "partOfSpeech": "v./n.",
    "definition": "意译；改述",
    "example": "",
    "collocations": [
      "paraphrase"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "interpret",
    "partOfSpeech": "v.",
    "definition": "口译；解释；说明；领会；理解",
    "example": "",
    "collocations": [
      "interpretation n."
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "narrate",
    "partOfSpeech": "v.",
    "definition": "讲（故事）；叙述",
    "example": "",
    "collocations": [
      "narrate"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "illuminate",
    "partOfSpeech": "v.",
    "definition": "阐释；说明；照亮",
    "example": "",
    "collocations": [
      "illuminate"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "decipher",
    "partOfSpeech": "v.",
    "definition": "译解；辨认",
    "example": "",
    "collocations": [
      "decipher"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "eloquence",
    "partOfSpeech": "n.",
    "definition": "雄辩；流利的口才",
    "example": "",
    "collocations": [
      "eloquent adj."
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "communicate",
    "partOfSpeech": "v.",
    "definition": "沟通；交流；传达",
    "example": "",
    "collocations": [
      "communicate"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "discussion",
    "partOfSpeech": "n.",
    "definition": "讨论；谈论",
    "example": "",
    "collocations": [
      "discussion"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "brainstorm",
    "partOfSpeech": "n./v.",
    "definition": "集体自由讨论；头脑风暴；集思广益；进行头脑风暴",
    "example": "",
    "collocations": [
      "brainstorm"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "debate",
    "partOfSpeech": "v./n.",
    "definition": "辩论；争论；讨论",
    "example": "",
    "collocations": [
      "debatable adj."
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "commentary",
    "partOfSpeech": "n.",
    "definition": "评论；批评；实况报道",
    "example": "",
    "collocations": [
      "commentary"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "negotiate",
    "partOfSpeech": "v.",
    "definition": "协商；谈判",
    "example": "",
    "collocations": [
      "negotiation n."
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "contention",
    "partOfSpeech": "n.",
    "definition": "争论；争辩；观点",
    "example": "",
    "collocations": [
      "contention"
    ],
    "topicLabel": "语言演化",
    "level": "C1"
  },
  {
    "word": "medium",
    "partOfSpeech": "n./adj.",
    "definition": "媒介；中间的；中等的",
    "example": "",
    "collocations": [
      "medium"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "press",
    "partOfSpeech": "n.",
    "definition": "新闻界；记者；报刊；出版社",
    "example": "",
    "collocations": [
      "press"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "journalist",
    "partOfSpeech": "n.",
    "definition": "记者；新闻工作者",
    "example": "",
    "collocations": [
      "journalist"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "critic",
    "partOfSpeech": "n.",
    "definition": "批评家；挑剔的人",
    "example": "",
    "collocations": [
      "critical adj."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "commentator",
    "partOfSpeech": "n.",
    "definition": "评论员；实况解说员",
    "example": "",
    "collocations": [
      "commentator"
    ],
    "topicLabel": "娱乐运动",
    "level": "C1"
  },
  {
    "word": "exponent",
    "partOfSpeech": "n.",
    "definition": "阐述者；倡导者；拥护者",
    "example": "",
    "collocations": [
      "exponent"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "announcer",
    "partOfSpeech": "n.",
    "definition": "广播员；播音员",
    "example": "",
    "collocations": [
      "announcer"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "correspondent",
    "partOfSpeech": "n.",
    "definition": "通信者；通讯员；记者",
    "example": "",
    "collocations": [
      "correspondent"
    ],
    "topicLabel": "娱乐运动",
    "level": "C1"
  },
  {
    "word": "messenger",
    "partOfSpeech": "n.",
    "definition": "邮递员；信使",
    "example": "",
    "collocations": [
      "messenger"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "editor",
    "partOfSpeech": "n.",
    "definition": "编辑；校订者",
    "example": "",
    "collocations": [
      "editor"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "typist",
    "partOfSpeech": "n.",
    "definition": "打字员",
    "example": "",
    "collocations": [
      "typist"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "handout",
    "partOfSpeech": "n.",
    "definition": "传单；讲义",
    "example": "",
    "collocations": [
      "handout"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "leaflet",
    "partOfSpeech": "n./v.",
    "definition": "传单；散发传单",
    "example": "",
    "collocations": [
      "leaflet"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "propaganda",
    "partOfSpeech": "n.",
    "definition": "宣传；鼓吹",
    "example": "",
    "collocations": [
      "propaganda"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "publish",
    "partOfSpeech": "v.",
    "definition": "公布；出版；发行",
    "example": "",
    "collocations": [
      "publish"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "disseminate",
    "partOfSpeech": "v.",
    "definition": "散布；传播",
    "example": "",
    "collocations": [
      "disseminate"
    ],
    "topicLabel": "娱乐运动",
    "level": "C1"
  },
  {
    "word": "foresee",
    "partOfSpeech": "v.",
    "definition": "预见；预知",
    "example": "",
    "collocations": [
      "foresee"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "anticipate",
    "partOfSpeech": "v.",
    "definition": "预期；预料",
    "example": "",
    "collocations": [
      "participate v."
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "expect",
    "partOfSpeech": "v.",
    "definition": "预料；期待",
    "example": "",
    "collocations": [
      "expectation n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "await",
    "partOfSpeech": "v.",
    "definition": "等候；期待；将降临到...身上",
    "example": "",
    "collocations": [
      "await"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "pastime",
    "partOfSpeech": "n.",
    "definition": "娱乐；消遣",
    "example": "",
    "collocations": [
      "pastime"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "entertain",
    "partOfSpeech": "v.",
    "definition": "娱乐；招待；心存；怀有",
    "example": "",
    "collocations": [
      "entertainment n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "recreation",
    "partOfSpeech": "n.",
    "definition": "休闲；娱乐",
    "example": "",
    "collocations": [
      "a recreation ground"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "amuse",
    "partOfSpeech": "v.",
    "definition": "逗乐；给...提供娱乐",
    "example": "",
    "collocations": [
      "amuse oneself"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "gossip",
    "partOfSpeech": "n.",
    "definition": "闲聊；流言蜚语",
    "example": "",
    "collocations": [
      "gossip"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "rumour",
    "partOfSpeech": "n.",
    "definition": "=rumor 谣言；传闻",
    "example": "",
    "collocations": [
      "rumour"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "consensus",
    "partOfSpeech": "n.",
    "definition": "共识；一致的意见",
    "example": "",
    "collocations": [
      "consensus"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "festival",
    "partOfSpeech": "n.",
    "definition": "节日",
    "example": "",
    "collocations": [
      "festival"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "feast",
    "partOfSpeech": "n.",
    "definition": "盛宴；（宗教）节日",
    "example": "",
    "collocations": [
      "feast"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "programme",
    "partOfSpeech": "n./v.",
    "definition": "=program 节目；方案；程序；为系统设置程序；计划",
    "example": "",
    "collocations": [
      "programmer n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "rehearsal",
    "partOfSpeech": "n.",
    "definition": "排练",
    "example": "",
    "collocations": [
      "rehearsal"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "perform",
    "partOfSpeech": "v.",
    "definition": "表演；演出",
    "example": "",
    "collocations": [
      "perform"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "imitate",
    "partOfSpeech": "v.",
    "definition": "模仿；效仿",
    "example": "",
    "collocations": [
      "imitate"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "mimic",
    "partOfSpeech": "v.",
    "definition": "模仿；戏仿",
    "example": "",
    "collocations": [
      "mimic"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "simulate",
    "partOfSpeech": "v.",
    "definition": "模拟；假装；冒充",
    "example": "",
    "collocations": [
      "simulative adj."
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "circus",
    "partOfSpeech": "n.",
    "definition": "马戏团；圆形广场（常用于地名）",
    "example": "",
    "collocations": [
      "a circus clown"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "magic",
    "partOfSpeech": "n.",
    "definition": "魔术；魔法",
    "example": "",
    "collocations": [
      "magic"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "drama",
    "partOfSpeech": "n.",
    "definition": "戏；剧；戏剧艺术",
    "example": "",
    "collocations": [
      "drama"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "concert",
    "partOfSpeech": "n.",
    "definition": "音乐会",
    "example": "",
    "collocations": [
      "musicale n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "symphony",
    "partOfSpeech": "n.",
    "definition": "交响乐",
    "example": "",
    "collocations": [
      "symphony"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "orchestra",
    "partOfSpeech": "n.",
    "definition": "管弦乐队",
    "example": "",
    "collocations": [
      "orchestra"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "ballet",
    "partOfSpeech": "n.",
    "definition": "芭蕾舞；芭蕾舞剧",
    "example": "",
    "collocations": [
      "ballet"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "opera",
    "partOfSpeech": "n.",
    "definition": "歌剧",
    "example": "",
    "collocations": [
      "opera"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "comedy",
    "partOfSpeech": "n.",
    "definition": "喜剧",
    "example": "",
    "collocations": [
      "comedy"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "tragedy",
    "partOfSpeech": "n.",
    "definition": "悲剧；悲惨的事",
    "example": "",
    "collocations": [
      "tragedy"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "animation",
    "partOfSpeech": "n.",
    "definition": "动画片；动画制作",
    "example": "",
    "collocations": [
      "animation"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "film",
    "partOfSpeech": "n.",
    "definition": "影片；胶卷",
    "example": "",
    "collocations": [
      "film"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "movie",
    "partOfSpeech": "n.",
    "definition": "电影",
    "example": "",
    "collocations": [
      "movie"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "X-rated",
    "partOfSpeech": "adj.",
    "definition": "X级的；青少年不宜的",
    "example": "",
    "collocations": [
      "X-rated"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "artist",
    "partOfSpeech": "n.",
    "definition": "艺术家",
    "example": "",
    "collocations": [
      "artist"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "craftsman",
    "partOfSpeech": "n.",
    "definition": "工匠；工艺师",
    "example": "",
    "collocations": [
      "craftsman"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "painter",
    "partOfSpeech": "n.",
    "definition": "画家；油漆匠",
    "example": "",
    "collocations": [
      "painter"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "role",
    "partOfSpeech": "n.",
    "definition": "角色",
    "example": "",
    "collocations": [
      "role"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "scene",
    "partOfSpeech": "n.",
    "definition": "景色；现场；（戏剧的）场面",
    "example": "",
    "collocations": [
      "scene"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "stage",
    "partOfSpeech": "n.",
    "definition": "舞台；阶段",
    "example": "",
    "collocations": [
      "the stage"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "gallery",
    "partOfSpeech": "n.",
    "definition": "美术馆",
    "example": "",
    "collocations": [
      "gallery"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "exhibition",
    "partOfSpeech": "n.",
    "definition": "展览",
    "example": "",
    "collocations": [
      "exhibition"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "aesthetic",
    "partOfSpeech": "adj. n.",
    "definition": "=esthetic 审美的；审美观",
    "example": "",
    "collocations": [
      "aesthetic"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "collect",
    "partOfSpeech": "v.",
    "definition": "收集；收藏",
    "example": "",
    "collocations": [
      "collect"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "select",
    "partOfSpeech": "v./adj.",
    "definition": "选择；挑选；精选的",
    "example": "",
    "collocations": [
      "select"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "opt",
    "partOfSpeech": "v.",
    "definition": "选择",
    "example": "",
    "collocations": [
      "option n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "photograph",
    "partOfSpeech": "n.",
    "definition": "照片；相片",
    "example": "",
    "collocations": [
      "photograph"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "portrait",
    "partOfSpeech": "n.",
    "definition": "肖像；半身画像",
    "example": "",
    "collocations": [
      "portrait"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "painting",
    "partOfSpeech": "n.",
    "definition": "油画；会话；画作；涂漆",
    "example": "",
    "collocations": [
      "painting"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "sculpture",
    "partOfSpeech": "n.",
    "definition": "雕塑",
    "example": "",
    "collocations": [
      "sculpture"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "draw",
    "partOfSpeech": "v.",
    "definition": "画；拉；拔出",
    "example": "",
    "collocations": [
      "draw"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "depict",
    "partOfSpeech": "v.",
    "definition": "描述；描写；描绘",
    "example": "",
    "collocations": [
      "depict"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "describe",
    "partOfSpeech": "v.",
    "definition": "描述；形容",
    "example": "",
    "collocations": [
      "describe"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "carve",
    "partOfSpeech": "v.",
    "definition": "雕刻；切下",
    "example": "",
    "collocations": [
      "carve"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "improvise",
    "partOfSpeech": "v.",
    "definition": "临时做；即兴创作",
    "example": "",
    "collocations": [
      "improvisation n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "musical",
    "partOfSpeech": "adj.",
    "definition": "音乐的；悦耳的",
    "example": "",
    "collocations": [
      "musical"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "classical",
    "partOfSpeech": "adj.",
    "definition": "古典的；传统的",
    "example": "",
    "collocations": [
      "classical"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "jazz",
    "partOfSpeech": "n.",
    "definition": "爵士乐",
    "example": "",
    "collocations": [
      "jazz"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "rock",
    "partOfSpeech": "n.",
    "definition": "摇滚乐；岩石",
    "example": "",
    "collocations": [
      "rock"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "hip-hop",
    "partOfSpeech": "n.",
    "definition": "嘻哈文化",
    "example": "",
    "collocations": [
      "hip-hop"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "pop",
    "partOfSpeech": "n.",
    "definition": "流行音乐；流行乐曲",
    "example": "",
    "collocations": [
      "pop"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "lyric",
    "partOfSpeech": "n./adj.",
    "definition": "抒情诗；抒情的",
    "example": "",
    "collocations": [
      "lyric"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "band",
    "partOfSpeech": "n.",
    "definition": "乐队；带；波段",
    "example": "",
    "collocations": [
      "band"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "solo",
    "partOfSpeech": "n./adj.",
    "definition": "独奏；独唱；独奏的；独唱的",
    "example": "",
    "collocations": [
      "solo"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "melody",
    "partOfSpeech": "n.",
    "definition": "乐曲；旋律",
    "example": "",
    "collocations": [
      "melody"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "rhythm",
    "partOfSpeech": "n.",
    "definition": "节奏；韵律",
    "example": "",
    "collocations": [
      "rhythm"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "tone",
    "partOfSpeech": "n.",
    "definition": "音色；声调；腔调",
    "example": "",
    "collocations": [
      "tone"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "tune",
    "partOfSpeech": "n./v.",
    "definition": "曲调；短乐曲；调试",
    "example": "",
    "collocations": [
      "tune"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "disc",
    "partOfSpeech": "n.",
    "definition": "=disk 光碟；唱片；磁盘",
    "example": "",
    "collocations": [
      "disc"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "piano",
    "partOfSpeech": "n.",
    "definition": "钢琴",
    "example": "",
    "collocations": [
      "piano"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "violin",
    "partOfSpeech": "n.",
    "definition": "小提琴",
    "example": "",
    "collocations": [
      "violin"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "cello",
    "partOfSpeech": "n.",
    "definition": "大提琴",
    "example": "",
    "collocations": [
      "cello"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "guitar",
    "partOfSpeech": "n.",
    "definition": "吉他",
    "example": "",
    "collocations": [
      "guitar"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "harmonica",
    "partOfSpeech": "n.",
    "definition": "口琴",
    "example": "",
    "collocations": [
      "harmonica"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "trumpet",
    "partOfSpeech": "n.",
    "definition": "喇叭；小号",
    "example": "",
    "collocations": [
      "trumpet"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "drum",
    "partOfSpeech": "n.",
    "definition": "鼓；鼓状物；大桶",
    "example": "",
    "collocations": [
      "drum"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "flute",
    "partOfSpeech": "n.",
    "definition": "长笛",
    "example": "",
    "collocations": [
      "flute"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "competition",
    "partOfSpeech": "n.",
    "definition": "竞争；比赛",
    "example": "",
    "collocations": [
      "compete v."
    ],
    "topicLabel": "娱乐运动",
    "level": "C1"
  },
  {
    "word": "tournament",
    "partOfSpeech": "n.",
    "definition": "锦标赛；联赛",
    "example": "",
    "collocations": [
      "tournament"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "Olympic",
    "partOfSpeech": "adj./n.",
    "definition": "奥林匹克运动会",
    "example": "",
    "collocations": [
      "Olympic"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "sponsor",
    "partOfSpeech": "n./v.",
    "definition": "发起人；主办人；赞助人。发起；主办；赞助",
    "example": "",
    "collocations": [
      "sponsor"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "patron",
    "partOfSpeech": "n.",
    "definition": "赞助人；顾客；老主顾",
    "example": "",
    "collocations": [
      "patron"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "athlete",
    "partOfSpeech": "n.",
    "definition": "运动员",
    "example": "",
    "collocations": [
      "athlete"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "champion",
    "partOfSpeech": "n./v.",
    "definition": "冠军；第一名；拥护；支持",
    "example": "",
    "collocations": [
      "champion"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "spectator",
    "partOfSpeech": "n.",
    "definition": "观众",
    "example": "",
    "collocations": [
      "spectator"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "volunteer",
    "partOfSpeech": "n./v.",
    "definition": "志愿者；自愿做",
    "example": "",
    "collocations": [
      "volunteer"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "famous",
    "partOfSpeech": "adj.",
    "definition": "著名的；出名的",
    "example": "",
    "collocations": [
      "fame n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "well-known",
    "partOfSpeech": "adj.",
    "definition": "众所周知的；出名的",
    "example": "",
    "collocations": [
      "well-known"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "energetic",
    "partOfSpeech": "adj.",
    "definition": "充满活力的；精力充沛的",
    "example": "",
    "collocations": [
      "energetic"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "vigorous",
    "partOfSpeech": "adj.",
    "definition": "充满活力的；活跃的；积极的",
    "example": "",
    "collocations": [
      "vigorous"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "stadium",
    "partOfSpeech": "n.",
    "definition": "体育场；运动场",
    "example": "",
    "collocations": [
      "stadium"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "gym",
    "partOfSpeech": "n.",
    "definition": "体育馆；运动场",
    "example": "",
    "collocations": [
      "gym"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "training",
    "partOfSpeech": "n.",
    "definition": "训练；锻炼；培训",
    "example": "",
    "collocations": [
      "training"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "exercise",
    "partOfSpeech": "n./v.",
    "definition": "锻炼；运动；习题；练习。锻炼",
    "example": "",
    "collocations": [
      "exercise"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "indoor",
    "partOfSpeech": "adj.",
    "definition": "室内的",
    "example": "",
    "collocations": [
      "indoors adv."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "outdoor",
    "partOfSpeech": "adj.",
    "definition": "户外的；室外的",
    "example": "",
    "collocations": [
      "outdoor"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "mobile",
    "partOfSpeech": "adj.",
    "definition": "可移动的；流动的",
    "example": "",
    "collocations": [
      "mobile"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "movement",
    "partOfSpeech": "n.",
    "definition": "活动；运动；移动",
    "example": "",
    "collocations": [
      "movement"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "yoga",
    "partOfSpeech": "n.",
    "definition": "瑜伽",
    "example": "",
    "collocations": [
      "yoga"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "sprawl",
    "partOfSpeech": "n./v.",
    "definition": "延伸；蔓延。（城市）杂乱无序扩张的地区",
    "example": "",
    "collocations": [
      "sprawl"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "stretch",
    "partOfSpeech": "v.",
    "definition": "延伸；伸长",
    "example": "",
    "collocations": [
      "stretch"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "strain",
    "partOfSpeech": "v./n.",
    "definition": "拉紧；拉伤；扭伤。张力；拉力；（精神上）紧张",
    "example": "",
    "collocations": [
      "strain"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "chess",
    "partOfSpeech": "n.",
    "definition": "国际象棋",
    "example": "",
    "collocations": [
      "chess"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "badminton",
    "partOfSpeech": "n.",
    "definition": "羽毛球",
    "example": "",
    "collocations": [
      "badminton"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "golf",
    "partOfSpeech": "n.",
    "definition": "高尔夫球",
    "example": "",
    "collocations": [
      "golf"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "billiards",
    "partOfSpeech": "n.",
    "definition": "台球",
    "example": "",
    "collocations": [
      "billiards"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "soccer",
    "partOfSpeech": "n.",
    "definition": "（英式）足球",
    "example": "",
    "collocations": [
      "soccer"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "tennis",
    "partOfSpeech": "n.",
    "definition": "网球",
    "example": "",
    "collocations": [
      "tennis"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "volleyball",
    "partOfSpeech": "n.",
    "definition": "排球",
    "example": "",
    "collocations": [
      "volleyball"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "hockey",
    "partOfSpeech": "n.",
    "definition": "曲棍球；冰球",
    "example": "",
    "collocations": [
      "hockey"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "goal",
    "partOfSpeech": "n.",
    "definition": "球门；进球得分；目的",
    "example": "",
    "collocations": [
      "goal"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "bat",
    "partOfSpeech": "n.",
    "definition": "球拍；球棒；球板",
    "example": "",
    "collocations": [
      "bat"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "racket",
    "partOfSpeech": "n.",
    "definition": "（网球、羽毛球）球拍",
    "example": "",
    "collocations": [
      "racket"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "kick",
    "partOfSpeech": "n./v.",
    "definition": "踢",
    "example": "",
    "collocations": [
      "kick"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "knock",
    "partOfSpeech": "v.",
    "definition": "敲；击；撞",
    "example": "",
    "collocations": [
      "knock"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "flip",
    "partOfSpeech": "v./n.",
    "definition": "掷；快速翻转。随便的；宽泛的",
    "example": "",
    "collocations": [
      "flip"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "pitch",
    "partOfSpeech": "v./n.",
    "definition": "投；掷；球场；（棒球中的）投球",
    "example": "She pitched the ball as far as she could.",
    "collocations": [
      "invade the pitch"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "throw",
    "partOfSpeech": "v.",
    "definition": "投；掷；抛；扔",
    "example": "",
    "collocations": [
      "throw"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "toss",
    "partOfSpeech": "v.",
    "definition": "扔；抛；掷；（使）颠簸",
    "example": "",
    "collocations": [
      "toss"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "slide",
    "partOfSpeech": "v./n.",
    "definition": "滑动；逐渐降低；滑行；下跌",
    "example": "",
    "collocations": [
      "slide"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "slip",
    "partOfSpeech": "v./n.",
    "definition": "滑跤；滑落；溜；滑到",
    "example": "",
    "collocations": [
      "a slip of the tongue"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "glide",
    "partOfSpeech": "v./n.",
    "definition": "滑动；掠过；滑行",
    "example": "",
    "collocations": [
      "glide"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "tumble",
    "partOfSpeech": "v.",
    "definition": "摔倒；滚下",
    "example": "",
    "collocations": [
      "tumble"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "ski",
    "partOfSpeech": "v./n.",
    "definition": "滑雪；滑雪板",
    "example": "",
    "collocations": [
      "ski"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "skate",
    "partOfSpeech": "v.",
    "definition": "滑冰",
    "example": "",
    "collocations": [
      "skate"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "cycling",
    "partOfSpeech": "n.",
    "definition": "骑自行车运动",
    "example": "",
    "collocations": [
      "cycling"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "dive",
    "partOfSpeech": "v.",
    "definition": "跳水；潜水；俯冲",
    "example": "",
    "collocations": [
      "dive"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "drift",
    "partOfSpeech": "v.",
    "definition": "飘逸；漂流；流浪；漂泊",
    "example": "",
    "collocations": [
      "drift from one country to another"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "jump",
    "partOfSpeech": "v.",
    "definition": "跳；暴涨；跳过",
    "example": "",
    "collocations": [
      "from the jump"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "leap",
    "partOfSpeech": "v./n.",
    "definition": "跳；跃；跳跃",
    "example": "",
    "collocations": [
      "leap"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "plunge",
    "partOfSpeech": "v./n.",
    "definition": "纵身投入；猛跌；（使）投身。跳水；猛跌",
    "example": "",
    "collocations": [
      "plunge whole-heartedly"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "hop",
    "partOfSpeech": "v.",
    "definition": "跳上/下；单脚跳行；齐足跳行",
    "example": "",
    "collocations": [
      "hop"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "bounce",
    "partOfSpeech": "v.",
    "definition": "（使）反弹/弹起/跳动",
    "example": "",
    "collocations": [
      "bounce"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "tent",
    "partOfSpeech": "n.",
    "definition": "帐篷",
    "example": "",
    "collocations": [
      "tent"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "camp",
    "partOfSpeech": "n.",
    "definition": "营地；阵营",
    "example": "",
    "collocations": [
      "camp"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "picnic",
    "partOfSpeech": "n./v.",
    "definition": "野餐；野餐食物",
    "example": "",
    "collocations": [
      "go for a picnic"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "hunt",
    "partOfSpeech": "v./n.",
    "definition": "打猎；搜寻；猎取",
    "example": "",
    "collocations": [
      "hunter n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "race",
    "partOfSpeech": "n.",
    "definition": "赛跑；速度竞赛；人种；种族",
    "example": "",
    "collocations": [
      "race"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "marathon",
    "partOfSpeech": "n.",
    "definition": "马拉松",
    "example": "",
    "collocations": [
      "marathon"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "pedestrian",
    "partOfSpeech": "n.",
    "definition": "步行者；行人",
    "example": "",
    "collocations": [
      "a pedestrian crossing"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "pace",
    "partOfSpeech": "n./v.",
    "definition": "步速；速度；步调；节奏；来回踱步",
    "example": "",
    "collocations": [
      "pace"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "step",
    "partOfSpeech": "n.",
    "definition": "步伐；步骤",
    "example": "",
    "collocations": [
      "footstep n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "excursion",
    "partOfSpeech": "n.",
    "definition": "远足；短程旅行",
    "example": "",
    "collocations": [
      "excursion"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "cruise",
    "partOfSpeech": "v.",
    "definition": "乘船游览；以平稳的速度行驶",
    "example": "",
    "collocations": [
      "cruiser n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "trip",
    "partOfSpeech": "v./n.",
    "definition": "绊倒；旅行",
    "example": "",
    "collocations": [
      "trip"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "vacation",
    "partOfSpeech": "v./n.",
    "definition": "休假；假期",
    "example": "",
    "collocations": [
      "vacation"
    ],
    "topicLabel": "娱乐运动",
    "level": "B2"
  },
  {
    "word": "hike",
    "partOfSpeech": "n./v.",
    "definition": "徒步旅行；远足",
    "example": "",
    "collocations": [
      "hike"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "jog",
    "partOfSpeech": "v.",
    "definition": "慢跑",
    "example": "",
    "collocations": [
      "jogger n."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "stride",
    "partOfSpeech": "v.",
    "definition": "大步走；阔步行走",
    "example": "",
    "collocations": [
      "stride"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "wander",
    "partOfSpeech": "v.",
    "definition": "闲逛；漫步；走神；开小差",
    "example": "",
    "collocations": [
      "wander"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "linger",
    "partOfSpeech": "v.",
    "definition": "逗留；流连；继续存留",
    "example": "",
    "collocations": [
      "linger"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "lag",
    "partOfSpeech": "v./n.",
    "definition": "落后；间隔；时间差",
    "example": "",
    "collocations": [
      "lag behind sb./sth."
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "climb",
    "partOfSpeech": "v.",
    "definition": "攀登；爬",
    "example": "",
    "collocations": [
      "climb"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "pull",
    "partOfSpeech": "v.",
    "definition": "拉；拖；扯；划（小船）",
    "example": "",
    "collocations": [
      "pull"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "drag",
    "partOfSpeech": "v.",
    "definition": "拖；拉；拽",
    "example": "",
    "collocations": [
      "drag"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "bend",
    "partOfSpeech": "v.",
    "definition": "俯身；弯腰；使弯曲",
    "example": "",
    "collocations": [
      "bend"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "bow",
    "partOfSpeech": "v./n.",
    "definition": "鞠躬",
    "example": "",
    "collocations": [
      "take a bow"
    ],
    "topicLabel": "娱乐运动",
    "level": "B1"
  },
  {
    "word": "stuff",
    "partOfSpeech": "n.",
    "definition": "东西；原料",
    "example": "",
    "collocations": [
      "stuff"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "item",
    "partOfSpeech": "n.",
    "definition": "一件物品；一件商品",
    "example": "",
    "collocations": [
      "item"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "merchandise",
    "partOfSpeech": "n.",
    "definition": "商品",
    "example": "",
    "collocations": [
      "merchandise"
    ],
    "topicLabel": "物品材料",
    "level": "C1"
  },
  {
    "word": "souvenir",
    "partOfSpeech": "n.",
    "definition": "纪念品",
    "example": "",
    "collocations": [
      "souvenir"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "artifact",
    "partOfSpeech": "n.",
    "definition": "=artefact 人造物品；手工艺品",
    "example": "",
    "collocations": [
      "artifact"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "material",
    "partOfSpeech": "n./adj.",
    "definition": "材料；原料；人才；物质的",
    "example": "",
    "collocations": [
      "material"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "raw",
    "partOfSpeech": "adj.",
    "definition": "天然的；未经加工的；（感情）原始的",
    "example": "",
    "collocations": [
      "raw"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "crude",
    "partOfSpeech": "adj.",
    "definition": "天然的；未经加工的；粗超的",
    "example": "",
    "collocations": [
      "crude"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "necessity",
    "partOfSpeech": "n.",
    "definition": "必需品；必要",
    "example": "",
    "collocations": [
      "necessary adj."
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "outfit",
    "partOfSpeech": "adj./n.",
    "definition": "全套服装；全套装备；配备；装备",
    "example": "",
    "collocations": [
      "outfit"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "kit",
    "partOfSpeech": "n.",
    "definition": "成套工具",
    "example": "",
    "collocations": [
      "kit"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "utensil",
    "partOfSpeech": "n.",
    "definition": "（家庭）用具；器皿",
    "example": "",
    "collocations": [
      "utensil"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "garbage",
    "partOfSpeech": "n.",
    "definition": "（尤美）垃圾；废物",
    "example": "",
    "collocations": [
      "garbage"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "rubbish",
    "partOfSpeech": "n.",
    "definition": "（尤英）垃圾；废弃物；废话",
    "example": "",
    "collocations": [
      "clear away the rubbish"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "trash",
    "partOfSpeech": "n.",
    "definition": "（美）垃圾",
    "example": "",
    "collocations": [
      "trash"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "recycle",
    "partOfSpeech": "v.",
    "definition": "使再循环；回收利用",
    "example": "",
    "collocations": [
      "recycle"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "reuse",
    "partOfSpeech": "v.",
    "definition": "再次使用",
    "example": "",
    "collocations": [
      "reuse"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "litter",
    "partOfSpeech": "n./v.",
    "definition": "垃圾；废弃物；乱丢东西",
    "example": "",
    "collocations": [
      "litter"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "waste",
    "partOfSpeech": "n./v.",
    "definition": "废物；浪费",
    "example": "",
    "collocations": [
      "waste"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "junk",
    "partOfSpeech": "n.",
    "definition": "无用的东西；废物",
    "example": "",
    "collocations": [
      "junk"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "landfill",
    "partOfSpeech": "n.",
    "definition": "垃圾填埋地；垃圾填埋",
    "example": "",
    "collocations": [
      "landfill"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "sewerage",
    "partOfSpeech": "n.",
    "definition": "排水系统；污水处理系统；（=sewage）污水",
    "example": "",
    "collocations": [
      "sewerage"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "detergent",
    "partOfSpeech": "n.",
    "definition": "洗涤剂",
    "example": "",
    "collocations": [
      "detergent"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "lotion",
    "partOfSpeech": "n.",
    "definition": "洁肤乳；润肤乳",
    "example": "",
    "collocations": [
      "lotion"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "shampoo",
    "partOfSpeech": "v./n.",
    "definition": "用洗发剂（头发）；洗发剂",
    "example": "",
    "collocations": [
      "shampoo"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "soap",
    "partOfSpeech": "n./v.",
    "definition": "肥皂；用肥皂擦洗",
    "example": "",
    "collocations": [
      "soap"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "tub",
    "partOfSpeech": "n.",
    "definition": "桶；盆；（美）鱼缸；浴盆",
    "example": "",
    "collocations": [
      "tub"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "plug",
    "partOfSpeech": "n./v.",
    "definition": "塞子；插头；把...塞住",
    "example": "",
    "collocations": [
      "plug"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "tap",
    "partOfSpeech": "n.",
    "definition": "旋塞；龙头",
    "example": "",
    "collocations": [
      "tap"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "pipe",
    "partOfSpeech": "n.",
    "definition": "管子；管道；烟斗",
    "example": "",
    "collocations": [
      "pipe"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "tube",
    "partOfSpeech": "n.",
    "definition": "管；显像管；（英国/伦敦）地铁",
    "example": "",
    "collocations": [
      "tube"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "mop",
    "partOfSpeech": "n./v.",
    "definition": "拖把；用拖把擦",
    "example": "",
    "collocations": [
      "mop"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "broom",
    "partOfSpeech": "n./v.",
    "definition": "扫帚；用扫帚扫",
    "example": "",
    "collocations": [
      "broom"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "sweep",
    "partOfSpeech": "v.",
    "definition": "打扫；（迅猛的）吹走；掠过",
    "example": "",
    "collocations": [
      "sweep the board"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "mattress",
    "partOfSpeech": "n.",
    "definition": "床垫",
    "example": "",
    "collocations": [
      "mattress"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "carpet",
    "partOfSpeech": "n.",
    "definition": "地毯",
    "example": "",
    "collocations": [
      "carpet"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "rug",
    "partOfSpeech": "n.",
    "definition": "小地毯；（盖肩或腿的）小毛毯",
    "example": "",
    "collocations": [
      "rug"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "mat",
    "partOfSpeech": "n.",
    "definition": "地垫",
    "example": "",
    "collocations": [
      "mat"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "cushion",
    "partOfSpeech": "n.",
    "definition": "软垫",
    "example": "",
    "collocations": [
      "a back cushion"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "pad",
    "partOfSpeech": "n./v.",
    "definition": "衬垫；便签本；（用软材料）填塞",
    "example": "",
    "collocations": [
      "pad"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "blanket",
    "partOfSpeech": "n.",
    "definition": "毛毯；毯子",
    "example": "",
    "collocations": [
      "blanket"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "quilt",
    "partOfSpeech": "n.",
    "definition": "被子",
    "example": "",
    "collocations": [
      "quilt"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "sheet",
    "partOfSpeech": "n.",
    "definition": "被单；床单；一张（纸）；薄板",
    "example": "",
    "collocations": [
      "sheet"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "pillow",
    "partOfSpeech": "n.",
    "definition": "枕头",
    "example": "",
    "collocations": [
      "pillow"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "sponge",
    "partOfSpeech": "n.",
    "definition": "海绵",
    "example": "",
    "collocations": [
      "sponge"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "towel",
    "partOfSpeech": "n.",
    "definition": "毛巾",
    "example": "",
    "collocations": [
      "towel"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "staple",
    "partOfSpeech": "n.",
    "definition": "订书钉；主要部分",
    "example": "",
    "collocations": [
      "staple"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "nail",
    "partOfSpeech": "n./v.",
    "definition": "指甲；钉子；（用钉子）钉住",
    "example": "",
    "collocations": [
      "nail"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "razor",
    "partOfSpeech": "n.",
    "definition": "剃刀；（用剃刀）剃",
    "example": "",
    "collocations": [
      "an electric razor"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "shave",
    "partOfSpeech": "v.",
    "definition": "剃须；刮脸",
    "example": "",
    "collocations": [
      "shave"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fuse",
    "partOfSpeech": "n./v.",
    "definition": "保险丝；导火线；（使）融化、融合",
    "example": "",
    "collocations": [
      "fuse"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "cable",
    "partOfSpeech": "n.",
    "definition": "电缆；缆绳；电报；有线电视",
    "example": "a cable car 缆车.",
    "collocations": [
      "cable"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "cord",
    "partOfSpeech": "n.",
    "definition": "细绳；粗线",
    "example": "",
    "collocations": [
      "cord"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "strand",
    "partOfSpeech": "n.",
    "definition": "缕；股；滨；案",
    "example": "",
    "collocations": [
      "strand"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "match",
    "partOfSpeech": "n./v.",
    "definition": "火柴；比赛；匹配的人或物；与...匹配",
    "example": "",
    "collocations": [
      "match"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "candle",
    "partOfSpeech": "n.",
    "definition": "蜡烛",
    "example": "",
    "collocations": [
      "candle"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "wax",
    "partOfSpeech": "n.",
    "definition": "蜡；蜂蜡",
    "example": "",
    "collocations": [
      "wax"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "portfolio",
    "partOfSpeech": "n.",
    "definition": "文件夹；公事包",
    "example": "",
    "collocations": [
      "briefcase n."
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "paperback",
    "partOfSpeech": "n.",
    "definition": "简装书；平装书",
    "example": "",
    "collocations": [
      "paperback"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "pamphlet",
    "partOfSpeech": "n.",
    "definition": "小册子",
    "example": "",
    "collocations": [
      "pamphlet"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "tissue",
    "partOfSpeech": "n.",
    "definition": "面巾纸；（器官）组织",
    "example": "",
    "collocations": [
      "tissue"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "cover",
    "partOfSpeech": "n.",
    "definition": "封面；盖子；套子",
    "example": "",
    "collocations": [
      "cover"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "Xerox",
    "partOfSpeech": "n.",
    "definition": "施乐复印机",
    "example": "",
    "collocations": [
      "Xerox"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "duplicate",
    "partOfSpeech": "v./n.",
    "definition": "重复；副本；复制品",
    "example": "",
    "collocations": [
      "duplicate"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "memorandum",
    "partOfSpeech": "n.",
    "definition": "备忘录；建议书；=memo",
    "example": "",
    "collocations": [
      "memorandum"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "stationery",
    "partOfSpeech": "n.",
    "definition": "文具；信纸",
    "example": "",
    "collocations": [
      "stationery"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "glue",
    "partOfSpeech": "n.",
    "definition": "胶水",
    "example": "",
    "collocations": [
      "glue"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "ink",
    "partOfSpeech": "n.",
    "definition": "墨水",
    "example": "",
    "collocations": [
      "ink"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "rubber",
    "partOfSpeech": "n.",
    "definition": "（英）橡皮擦；橡胶",
    "example": "",
    "collocations": [
      "rubber"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "scissors",
    "partOfSpeech": "n.",
    "definition": "剪刀",
    "example": "",
    "collocations": [
      "scissors"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "shear",
    "partOfSpeech": "n./v.",
    "definition": "shears（尤指修篱笆用的）大剪刀；剪",
    "example": "",
    "collocations": [
      "shear"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "edge",
    "partOfSpeech": "n.",
    "definition": "边；边缘；刀口",
    "example": "",
    "collocations": [
      "edge"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "rim",
    "partOfSpeech": "n.",
    "definition": "（圆形物品的）外缘、边缘",
    "example": "",
    "collocations": [
      "rim"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "element",
    "partOfSpeech": "n.",
    "definition": "元素；组成部分；基本部分",
    "example": "",
    "collocations": [
      "element"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "factor",
    "partOfSpeech": "n.",
    "definition": "因素；要素",
    "example": "",
    "collocations": [
      "factor"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "section",
    "partOfSpeech": "n.",
    "definition": "部分；章；节",
    "example": "",
    "collocations": [
      "section"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "tag",
    "partOfSpeech": "n.",
    "definition": "标签；称号",
    "example": "",
    "collocations": [
      "tag"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "label",
    "partOfSpeech": "n.",
    "definition": "标签；标贴",
    "example": "",
    "collocations": [
      "label"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "badge",
    "partOfSpeech": "n.",
    "definition": "徽章；证章；标志；象征",
    "example": "",
    "collocations": [
      "badge"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "bolt",
    "partOfSpeech": "n./v.",
    "definition": "螺栓；插销；闩上（门、窗）",
    "example": "",
    "collocations": [
      "bolt"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "knob",
    "partOfSpeech": "n.",
    "definition": "球形把手；旋钮",
    "example": "",
    "collocations": [
      "knob"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "handle",
    "partOfSpeech": "n./v.",
    "definition": "柄；把手；拿；处理",
    "example": "",
    "collocations": [
      "handle"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "shutter",
    "partOfSpeech": "n./v.",
    "definition": "百叶窗；快门；停止（营业）",
    "example": "",
    "collocations": [
      "shutter"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "curtain",
    "partOfSpeech": "n./v.",
    "definition": "窗帘；幕布；给...装上帘子",
    "example": "",
    "collocations": [
      "curtain"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "pane",
    "partOfSpeech": "n.",
    "definition": "（一块）玻璃窗",
    "example": "",
    "collocations": [
      "pane"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "opacity",
    "partOfSpeech": "n.",
    "definition": "不透明性",
    "example": "",
    "collocations": [
      "opaque n.",
      "adj."
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "jar",
    "partOfSpeech": "n.",
    "definition": "罐；广口瓶；猛烈震动",
    "example": "",
    "collocations": [
      "jar"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "barrel",
    "partOfSpeech": "n.",
    "definition": "桶",
    "example": "",
    "collocations": [
      "barrel"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "bucket",
    "partOfSpeech": "n.",
    "definition": "（有提手的）桶",
    "example": "",
    "collocations": [
      "bucket"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "pail",
    "partOfSpeech": "n.",
    "definition": "（尤美-通常是金属或者木质的）桶；提桶",
    "example": "",
    "collocations": [
      "pail"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "phone",
    "partOfSpeech": "n.",
    "definition": "电话",
    "example": "",
    "collocations": [
      "phone"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "bell",
    "partOfSpeech": "n.",
    "definition": "钟，铃",
    "example": "",
    "collocations": [
      "bell"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "camera",
    "partOfSpeech": "n.",
    "definition": "照相机",
    "example": "",
    "collocations": [
      "camera"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "portable",
    "partOfSpeech": "adj.",
    "definition": "手提式的；便携的",
    "example": "",
    "collocations": [
      "portable"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "spotlight",
    "partOfSpeech": "n.",
    "definition": "聚光灯",
    "example": "",
    "collocations": [
      "spotlight"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "lantern",
    "partOfSpeech": "n.",
    "definition": "提灯；灯笼",
    "example": "",
    "collocations": [
      "lantern"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "bulb",
    "partOfSpeech": "n.",
    "definition": "电灯泡；球茎；球茎状物",
    "example": "",
    "collocations": [
      "bulb"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "flashlight",
    "partOfSpeech": "n.",
    "definition": "闪光灯的闪光；手电筒",
    "example": "",
    "collocations": [
      "flashlight"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "refrigerator",
    "partOfSpeech": "n.",
    "definition": "冰箱",
    "example": "",
    "collocations": [
      "refrigerator"
    ],
    "topicLabel": "物品材料",
    "level": "C1"
  },
  {
    "word": "frigde",
    "partOfSpeech": "n.",
    "definition": "冰箱",
    "example": "",
    "collocations": [
      "frigde"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "vacuum",
    "partOfSpeech": "n./adj.",
    "definition": "真空；真空吸尘器；真空的",
    "example": "",
    "collocations": [
      "vacuum"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fan",
    "partOfSpeech": "n./v.",
    "definition": "扇子；风扇；狂热爱好者；扇",
    "example": "",
    "collocations": [
      "fan"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "switch",
    "partOfSpeech": "n./v.",
    "definition": "开关；转换；",
    "example": "",
    "collocations": [
      "switch"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "hurdle",
    "partOfSpeech": "n.",
    "definition": "栏架；跨栏赛跑",
    "example": "",
    "collocations": [
      "hurdle"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fence",
    "partOfSpeech": "n.",
    "definition": "栅栏；围栏",
    "example": "",
    "collocations": [
      "fence"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "padal",
    "partOfSpeech": "n./v.",
    "definition": "踏板；踩踏板",
    "example": "",
    "collocations": [
      "padal"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "shelf",
    "partOfSpeech": "n.",
    "definition": "架子；隔板",
    "example": "",
    "collocations": [
      "shelf"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "ladder",
    "partOfSpeech": "n.",
    "definition": "梯子；阶梯",
    "example": "",
    "collocations": [
      "ladder"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "lift",
    "partOfSpeech": "v./n.",
    "definition": "提；抬；提高；（英）电梯（美 elevator）",
    "example": "",
    "collocations": [
      "lift"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "stool",
    "partOfSpeech": "n.",
    "definition": "凳子",
    "example": "",
    "collocations": [
      "stool"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "drawer",
    "partOfSpeech": "n.",
    "definition": "抽屉",
    "example": "",
    "collocations": [
      "drawer"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "umbrella",
    "partOfSpeech": "n.",
    "definition": "伞",
    "example": "",
    "collocations": [
      "umbrella"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "raincoat",
    "partOfSpeech": "n.",
    "definition": "雨衣",
    "example": "",
    "collocations": [
      "raincoat"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "dredge",
    "partOfSpeech": "n./v.",
    "definition": "挖泥船；挖掘机；挖掘；撒（糖；面粉等）",
    "example": "",
    "collocations": [
      "dredge"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "can",
    "partOfSpeech": "v./n.",
    "definition": "把（食品）罐装保存；罐头；听",
    "example": "",
    "collocations": [
      "can"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "mill",
    "partOfSpeech": "n./v.",
    "definition": "磨粉机；磨坊；碾碎；无目的地乱转",
    "example": "",
    "collocations": [
      "mill"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "forge",
    "partOfSpeech": "n./v.",
    "definition": "炼铁炉；锻造；伪造",
    "example": "",
    "collocations": [
      "forge"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "alloy",
    "partOfSpeech": "n.",
    "definition": "合金；（金属的）成色",
    "example": "",
    "collocations": [
      "alloy"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "metal",
    "partOfSpeech": "n.",
    "definition": "金属",
    "example": "",
    "collocations": [
      "metal"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "iron",
    "partOfSpeech": "n./v.",
    "definition": "铁；熨斗；熨；烫",
    "example": "",
    "collocations": [
      "iron"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "lead",
    "partOfSpeech": "n.",
    "definition": "铅",
    "example": "",
    "collocations": [
      "lead"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "brass",
    "partOfSpeech": "n.",
    "definition": "黄铜；黄铜制品",
    "example": "",
    "collocations": [
      "brass"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "bronze",
    "partOfSpeech": "n.",
    "definition": "青铜；青铜艺术品",
    "example": "",
    "collocations": [
      "bronze"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "cement",
    "partOfSpeech": "n./v.",
    "definition": "水泥；胶结剂；使黏结",
    "example": "",
    "collocations": [
      "cement"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "lime",
    "partOfSpeech": "n.",
    "definition": "石灰",
    "example": "",
    "collocations": [
      "lime"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "plaster",
    "partOfSpeech": "n.",
    "definition": "灰泥；熟石膏",
    "example": "",
    "collocations": [
      "plaster"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "leather",
    "partOfSpeech": "n.",
    "definition": "皮革；皮衣",
    "example": "",
    "collocations": [
      "leather"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "plastic",
    "partOfSpeech": "n./adj.",
    "definition": "塑料；有塑性的；塑料的",
    "example": "",
    "collocations": [
      "plastic"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fiber",
    "partOfSpeech": "n.",
    "definition": "=fibre 纤维；纤维素",
    "example": "",
    "collocations": [
      "fiber"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fabric",
    "partOfSpeech": "n.",
    "definition": "织物；布料",
    "example": "",
    "collocations": [
      "fabric"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "knit",
    "partOfSpeech": "v.",
    "definition": "编织；针织",
    "example": "",
    "collocations": [
      "knit"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "weave",
    "partOfSpeech": "v.",
    "definition": "编织；编造",
    "example": "",
    "collocations": [
      "weave"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "canvas",
    "partOfSpeech": "n.",
    "definition": "帆布；油画布",
    "example": "",
    "collocations": [
      "canvas"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "linen",
    "partOfSpeech": "n.",
    "definition": "亚麻布；亚麻织品",
    "example": "",
    "collocations": [
      "linen"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "cotton",
    "partOfSpeech": "n.",
    "definition": "棉；棉线；棉布",
    "example": "",
    "collocations": [
      "cotton"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "nylon",
    "partOfSpeech": "n.",
    "definition": "尼龙",
    "example": "",
    "collocations": [
      "nylon"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "lumber",
    "partOfSpeech": "n.",
    "definition": "木材；木料",
    "example": "",
    "collocations": [
      "lumber"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "wooden",
    "partOfSpeech": "adj.",
    "definition": "木制的；呆板的",
    "example": "",
    "collocations": [
      "wooden"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "mine",
    "partOfSpeech": "n.",
    "definition": "矿场；矿井；地雷",
    "example": "",
    "collocations": [
      "mine"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "pit",
    "partOfSpeech": "n.",
    "definition": "深坑；煤矿；潜在危险",
    "example": "",
    "collocations": [
      "pit"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fuel",
    "partOfSpeech": "n./v.",
    "definition": "燃料；给...加燃料",
    "example": "",
    "collocations": [
      "add fuel to"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "lubricate",
    "partOfSpeech": "v.",
    "definition": "润滑；加润滑油于",
    "example": "",
    "collocations": [
      "lubricate"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "diamond",
    "partOfSpeech": "n.",
    "definition": "金刚石；钻石；菱形",
    "example": "",
    "collocations": [
      "diamond"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "crystal",
    "partOfSpeech": "n.",
    "definition": "水晶；结晶；晶体",
    "example": "",
    "collocations": [
      "crystal"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "inferior",
    "partOfSpeech": "adj./n.",
    "definition": "差的；下级的；低等的；级别/地位低的人；次品",
    "example": "",
    "collocations": [
      "inferiority"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "counterfeit",
    "partOfSpeech": "adj./v.",
    "definition": "假冒的；伪造",
    "example": "",
    "collocations": [
      "counterfeit"
    ],
    "topicLabel": "物品材料",
    "level": "C1"
  },
  {
    "word": "fake",
    "partOfSpeech": "adj./n.",
    "definition": "假冒的；冒充者；假货",
    "example": "",
    "collocations": [
      "fake"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fragile",
    "partOfSpeech": "adj.",
    "definition": "易碎的；脆弱的",
    "example": "",
    "collocations": [
      "fragile"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "miniature",
    "partOfSpeech": "adj./n.",
    "definition": "微型的；很小的；微缩模型；微型画",
    "example": "",
    "collocations": [
      "miniature"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "available",
    "partOfSpeech": "adj.",
    "definition": "可获得的",
    "example": "",
    "collocations": [
      "available"
    ],
    "topicLabel": "物品材料",
    "level": "B2"
  },
  {
    "word": "durable",
    "partOfSpeech": "adj.",
    "definition": "耐用的；持久的",
    "example": "",
    "collocations": [
      "durable"
    ],
    "topicLabel": "物品材料",
    "level": "B1"
  },
  {
    "word": "fashion",
    "partOfSpeech": "n./v.",
    "definition": "时尚；制作；制成",
    "example": "",
    "collocations": [
      "fashionable adj."
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "style",
    "partOfSpeech": "n.",
    "definition": "风格；样式；时尚",
    "example": "",
    "collocations": [
      "stylish adj."
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "trend",
    "partOfSpeech": "n.",
    "definition": "趋势；倾向",
    "example": "",
    "collocations": [
      "trend"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "tendency",
    "partOfSpeech": "n.",
    "definition": "趋势；倾向；偏好",
    "example": "",
    "collocations": [
      "tendency"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "popularity",
    "partOfSpeech": "n.",
    "definition": "流行",
    "example": "",
    "collocations": [
      "popularity"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "vogue",
    "partOfSpeech": "n.",
    "definition": "流行",
    "example": "",
    "collocations": [
      "in vogue"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "prevail",
    "partOfSpeech": "v.",
    "definition": "盛行；获胜",
    "example": "",
    "collocations": [
      "prevalence n."
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "model",
    "partOfSpeech": "n./v.",
    "definition": "模型；模特；使模仿",
    "example": "",
    "collocations": [
      "model"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "icon",
    "partOfSpeech": "n.",
    "definition": "偶像；图标",
    "example": "",
    "collocations": [
      "icon"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "idol",
    "partOfSpeech": "n.",
    "definition": "偶像；受到崇拜的人或物；神像",
    "example": "",
    "collocations": [
      "idol"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "luxury",
    "partOfSpeech": "n.",
    "definition": "奢侈；奢侈品",
    "example": "",
    "collocations": [
      "luxurious adj."
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "extravagant",
    "partOfSpeech": "adj.",
    "definition": "奢侈的；过分的",
    "example": "",
    "collocations": [
      "extravagant"
    ],
    "topicLabel": "时尚潮流",
    "level": "C1"
  },
  {
    "word": "jewelry",
    "partOfSpeech": "n.",
    "definition": "=jewellery 珠宝；手势",
    "example": "",
    "collocations": [
      "jewelry"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "jewel",
    "partOfSpeech": "n.",
    "definition": "宝石",
    "example": "",
    "collocations": [
      "jewel"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "gem",
    "partOfSpeech": "n.",
    "definition": "宝石；珍品",
    "example": "",
    "collocations": [
      "gem"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "jade",
    "partOfSpeech": "n.",
    "definition": "玉石；翡翠",
    "example": "",
    "collocations": [
      "jade"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "adorn",
    "partOfSpeech": "v.",
    "definition": "装饰；装扮",
    "example": "",
    "collocations": [
      "adorn"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "ornament",
    "partOfSpeech": "n./v.",
    "definition": "装饰品；装饰",
    "example": "",
    "collocations": [
      "ornament"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "embellish",
    "partOfSpeech": "v.",
    "definition": "修饰",
    "example": "",
    "collocations": [
      "embellish"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "embroider",
    "partOfSpeech": "v.",
    "definition": "对（故事等）加以渲染；在...上刺绣",
    "example": "",
    "collocations": [
      "embroider"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "hairdressing",
    "partOfSpeech": "n.",
    "definition": "美发；理发",
    "example": "",
    "collocations": [
      "hairdressing"
    ],
    "topicLabel": "时尚潮流",
    "level": "C1"
  },
  {
    "word": "pigment",
    "partOfSpeech": "n.",
    "definition": "色素；颜料",
    "example": "",
    "collocations": [
      "pigment"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "dye",
    "partOfSpeech": "n.",
    "definition": "染料；（染上的）颜色；染",
    "example": "",
    "collocations": [
      "dye"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "masquerade",
    "partOfSpeech": "n./v.",
    "definition": "化装舞会；化妆；假扮",
    "example": "",
    "collocations": [
      "masquerade"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "veil",
    "partOfSpeech": "n.",
    "definition": "面纱；遮蔽物",
    "example": "",
    "collocations": [
      "veil"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "costume",
    "partOfSpeech": "n.",
    "definition": "戏服；（某历史时期或某地的）服装",
    "example": "",
    "collocations": [
      "academic costume",
      "a costume ball"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "fascinate",
    "partOfSpeech": "v.",
    "definition": "迷住",
    "example": "",
    "collocations": [
      "fascinating adj."
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "decent",
    "partOfSpeech": "adj.",
    "definition": "得体的；尚好的",
    "example": "",
    "collocations": [
      "decent"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "exquisite",
    "partOfSpeech": "adj.",
    "definition": "精致的；雅致的",
    "example": "",
    "collocations": [
      "exquisite"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "grace",
    "partOfSpeech": "n.",
    "definition": "优美；优雅",
    "example": "",
    "collocations": [
      "grace"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "elegance",
    "partOfSpeech": "n.",
    "definition": "文雅；典雅",
    "example": "",
    "collocations": [
      "elegant adj."
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "perfect",
    "partOfSpeech": "adj.",
    "definition": "完美的",
    "example": "",
    "collocations": [
      "perfect"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "appearance",
    "partOfSpeech": "n.",
    "definition": "外貌；出现",
    "example": "",
    "collocations": [
      "appear v."
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "cosmetics",
    "partOfSpeech": "n.",
    "definition": "化妆品",
    "example": "",
    "collocations": [
      "cosmetics"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "make-up",
    "partOfSpeech": "n.",
    "definition": "化妆品；组成成分；性格",
    "example": "",
    "collocations": [
      "make up"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "handsome",
    "partOfSpeech": "adj.",
    "definition": "数量大的；英俊的",
    "example": "",
    "collocations": [
      "handsome"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "charming",
    "partOfSpeech": "adj.",
    "definition": "迷人的",
    "example": "",
    "collocations": [
      "Prince Charming"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "pretty",
    "partOfSpeech": "adj./adv.",
    "definition": "漂亮的；相当地",
    "example": "",
    "collocations": [
      "pretty"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "beautiful",
    "partOfSpeech": "adj.",
    "definition": "美丽的",
    "example": "",
    "collocations": [
      "beautiful"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "ugly",
    "partOfSpeech": "adj.",
    "definition": "丑陋的",
    "example": "",
    "collocations": [
      "ugly"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "dress",
    "partOfSpeech": "n.",
    "definition": "衣服；连衣裙",
    "example": "",
    "collocations": [
      "dress"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "clothe",
    "partOfSpeech": "v.",
    "definition": "给...穿衣；为...提供衣服",
    "example": "",
    "collocations": [
      "clothes n."
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "uniform",
    "partOfSpeech": "n./adj.",
    "definition": "制服；一致的",
    "example": "",
    "collocations": [
      "uniform"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "garment",
    "partOfSpeech": "n.",
    "definition": "（一件）衣服",
    "example": "",
    "collocations": [
      "garment"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "laundry",
    "partOfSpeech": "n.",
    "definition": "洗衣店；要（或正在）洗的衣服；刚洗好的衣服",
    "example": "",
    "collocations": [
      "do/hang/iron the laundry"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "wardrobe",
    "partOfSpeech": "n.",
    "definition": "衣柜；（某人的）全部服装",
    "example": "",
    "collocations": [
      "wardrobe"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "overall",
    "partOfSpeech": "n./adj.",
    "definition": "（英）（工作时穿的）罩衣；全面的",
    "example": "",
    "collocations": [
      "overall"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "overcoat",
    "partOfSpeech": "n.",
    "definition": "大衣",
    "example": "",
    "collocations": [
      "overcoat"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "robe",
    "partOfSpeech": "n.",
    "definition": "长袍；浴袍",
    "example": "",
    "collocations": [
      "robe"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "gown",
    "partOfSpeech": "n.",
    "definition": "长外衣；女礼服",
    "example": "",
    "collocations": [
      "gown"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "sweater",
    "partOfSpeech": "n.",
    "definition": "毛衣；线衣",
    "example": "",
    "collocations": [
      "sweater"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "jacket",
    "partOfSpeech": "n.",
    "definition": "夹克衫",
    "example": "",
    "collocations": [
      "jacket"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "skirt",
    "partOfSpeech": "n.",
    "definition": "裙子",
    "example": "",
    "collocations": [
      "skirt"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "jeans",
    "partOfSpeech": "n.",
    "definition": "牛仔裤",
    "example": "",
    "collocations": [
      "jeans"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "trousers",
    "partOfSpeech": "n.",
    "definition": "（尤英）裤子",
    "example": "",
    "collocations": [
      "trousers"
    ],
    "topicLabel": "时尚潮流",
    "level": "B2"
  },
  {
    "word": "clasp",
    "partOfSpeech": "n./v.",
    "definition": "搭扣；扣住",
    "example": "",
    "collocations": [
      "clasp"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "button",
    "partOfSpeech": "n./v.",
    "definition": "纽扣；按钮；扣上...的纽扣",
    "example": "",
    "collocations": [
      "unbutton v."
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "glove",
    "partOfSpeech": "n.",
    "definition": "手套",
    "example": "",
    "collocations": [
      "glove"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "hat",
    "partOfSpeech": "n.",
    "definition": "（常指带帽檐的）帽子",
    "example": "",
    "collocations": [
      "hat"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "cap",
    "partOfSpeech": "n.",
    "definition": "（有帽舌的）帽子；（经费等的）最高限额",
    "example": "",
    "collocations": [
      "cap"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "brim",
    "partOfSpeech": "n.",
    "definition": "边缘；帽檐",
    "example": "",
    "collocations": [
      "brim"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  },
  {
    "word": "scarf",
    "partOfSpeech": "n.",
    "definition": "围巾；头巾",
    "example": "",
    "collocations": [
      "scarf"
    ],
    "topicLabel": "时尚潮流",
    "level": "B1"
  }
] as const satisfies readonly IeltsSearchedVocabularyEntry[];

const slugifyWord = (word: string): string =>
  word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const buildFallbackExample = (entry: IeltsSearchedVocabularyEntry): string =>
  entry.example || `The word "${entry.word}" is useful when discussing ${entry.topicLabel} in IELTS.`;

export const ieltsSearchedVocabularyWords: WordData[] = IELTS_SEARCHED_VOCABULARY_ENTRIES.map((entry, index) => ({
  id: `ielts_vocab_${String(index + 1).padStart(4, '0')}_${slugifyWord(entry.word)}`,
  word: entry.word,
  phonetic: '',
  partOfSpeech: entry.partOfSpeech,
  definition: entry.definition,
  definitionZh: entry.definition,
  examples: [
    {
      en: buildFallbackExample(entry),
      zh: `${entry.word}: ${entry.definition}`,
    },
  ],
  synonyms: [],
  antonyms: [],
  collocations: entry.collocations.length > 0 ? [...entry.collocations] : [entry.word],
  level: entry.level,
  topic: 'ielts',
  memoryTip: `${entry.topicLabel} · ${IELTS_SEARCHED_VOCABULARY_SOURCE.name}`,
}));
