"""Будує компактний JSON Біблії Огієнка (66 книг, нумерація Огієнка/єврейська для псалмів)."""
import json, sys, unicodedata
SRC, OUT = sys.argv[1], sys.argv[2]
BOOKS = [  # англ. назва в джерелі -> українська назва (як в Огієнка, коротко)
 ("Genesis","Буття"),("Exodus","Вихід"),("Leviticus","Левит"),("Numbers","Числа"),("Deuteronomy","Повторення Закону"),
 ("Joshua","Ісус Навин"),("Judges","Суддів"),("Ruth","Рут"),("I Samuel","1 Самуїлова"),("II Samuel","2 Самуїлова"),
 ("I Kings","1 Царів"),("II Kings","2 Царів"),("I Chronicles","1 Хронік"),("II Chronicles","2 Хронік"),("Ezra","Ездри"),
 ("Nehemiah","Неемії"),("Esther","Естер"),("Job","Йова"),("Psalms","Псалми"),("Proverbs","Приповістей"),
 ("Ecclesiastes","Екклезіяста"),("Song of Solomon","Пісня над піснями"),("Isaiah","Ісаї"),("Jeremiah","Єремії"),
 ("Lamentations","Плач Єремії"),("Ezekiel","Єзекіїля"),("Daniel","Даниїла"),("Hosea","Осії"),("Joel","Йоіла"),
 ("Amos","Амоса"),("Obadiah","Овдія"),("Jonah","Йони"),("Micah","Михея"),("Nahum","Наума"),("Habakkuk","Авакума"),
 ("Zephaniah","Софонії"),("Haggai","Огія"),("Zechariah","Захарія"),("Malachi","Малахії"),
 ("Matthew","Матвія"),("Mark","Марка"),("Luke","Луки"),("John","Івана"),("Acts","Дії"),("Romans","Римлян"),
 ("I Corinthians","1 Коринтян"),("II Corinthians","2 Коринтян"),("Galatians","Галатів"),("Ephesians","Ефесян"),
 ("Philippians","Филип'ян"),("Colossians","Колоссян"),("I Thessalonians","1 Солунян"),("II Thessalonians","2 Солунян"),
 ("I Timothy","1 Тимофія"),("II Timothy","2 Тимофія"),("Titus","Тита"),("Philemon","Филимона"),("Hebrews","Євреїв"),
 ("James","Якова"),("I Peter","1 Петра"),("II Peter","2 Петра"),("I John","1 Івана"),("II John","2 Івана"),
 ("III John","3 Івана"),("Jude","Юди"),("Revelation of John","Об'явлення"),
]
def clean(t):
    t = t.replace("́", "")                     # наголоси
    t = unicodedata.normalize("NFC", t).replace("ʼ", "'").replace("’", "'")
    return " ".join(t.split())
d = json.load(open(SRC, encoding="utf-8"))
src = {b["name"]: b for b in d["books"]}

def chapters_of(name):
    out = {}
    for c in src[name]["chapters"]:
        vs = {v["verse"]: clean(v["text"]) for v in c["verses"] if v["text"].strip()}
        if vs: out[c["chapter"]] = vs
    return out

def psalms():
    lxx = chapters_of("Psalms"); heb = {}
    def put(h, v, t): heb.setdefault(h, {})[v] = t
    for c, vs in lxx.items():
        for v, t in vs.items():
            if c <= 8 or 148 <= c <= 150: put(c, v, t)
            elif c == 9: put(9, v, t) if v <= 21 else put(10, v - 21, t)
            elif 10 <= c <= 112: put(c + 1, v, t)
            elif c == 113: put(114, v, t) if v <= 8 else put(115, v - 8, t)
            elif c in (114, 115): put(116, v, t)          # нумерація віршів уже як у 116
            elif 116 <= c <= 145: put(c + 1, v, t)
            elif c == 146: put(147, v, t)
            elif c == 147: put(147, v + 11, t)
    heb[116][1] = "Люблю я Господа, бо Він почув голос мій у благаннях моїх,"   # у джерелі сховано в заголовку
    return heb

books, problems = [], []
for en, uk in BOOKS:
    chs = psalms() if en == "Psalms" else chapters_of(en)
    arr = []
    for c in range(1, max(chs) + 1):
        vs = chs.get(c, {})
        if not vs: problems.append(f"{uk} {c}: порожній розділ")
        n = max(vs) if vs else 0
        row = [vs.get(v, "") for v in range(1, n + 1)]
        # вірш, «склеєний» з попереднім, але з номером усередині тексту: «… 8 „Я зроблю…»
        import re
        for v in range(2, n + 1):
            if not row[v - 1] and row[v - 2]:
                m = re.search(r"\s%d\s+(?=\S)" % v, row[v - 2])
                if m:
                    row[v - 1] = row[v - 2][m.end():].strip()
                    row[v - 2] = row[v - 2][:m.start()].strip()
                    vs[v] = row[v - 1]
        gaps = [v for v in range(1, n + 1) if not vs.get(v)]
        if gaps: problems.append(f"{uk} {c}: пропущені вірші {gaps}")
        arr.append(row)
    books.append({"name": uk, "chapters": arr})
json.dump({"translation": "Біблія. Переклад Івана Огієнка", "license": "Public Domain", "books": books},
          open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
total = sum(len(r) for b in books for r in b["chapters"])
print("книг", len(books), "віршів", total, "проблем", len(problems)); print("\n".join(problems[:40]))
