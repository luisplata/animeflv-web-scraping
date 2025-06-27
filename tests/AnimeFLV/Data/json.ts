export class Anime {
    name: string[];
    slug: string;
    description: string;
    image: string;
    caps: Episode[];
    alterNames: string[];
    genres: string[];

    constructor(name: string[], slug: string, description: string, image: string) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.image = image;
        this.caps = [];
        this.alterNames = [];
        this.genres = [];
    }

    AddCap(cap: Episode) {
        this.caps.push(cap);
    }
}

export class Episode {
    title: string;
    number: number;
    link: string;
    source: Source[];

    constructor(title: string, number: number, link: string) {
        this.title = title;
        this.number = number;
        this.link = link;
        this.source = [];
    }

    async AddSource(source: Source) {
        this.source.push(source)
    }
}

export class Source {
    name: string;
    url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}

//create class Anime, Episode and Source from
/*
{
    "name": [
      "Salaryman",
      "ga",
      "Isekai",
      "ni",
      "Ittara",
      "Shitennou",
      "ni",
      "Natta",
      "Hanashi"
    ],
    "slug": "sakugan-7",
    "description": "Sakugan 7",
    "image": "https://animeflv.net/uploads/animes/thumbs/4092.jpg",
    "episodes": [
      {
        "title": "Sakugan 7",
        "number": 7,
        "source": [
          {
            "name": "Mega",
            "url": "https://mega.nz/embed/!9K5Q3QrZ!1"
          },
          {
            "name": "Mega2",
            "url": "https://mega.nz/embed/!9K5Q3QrZ!12"
          }
        ]
      }
    ]
  }
 */