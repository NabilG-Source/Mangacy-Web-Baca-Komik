const express = require("express");
const app = express();
const axios = require("axios");
const { formatDistanceToNow, parseISO } = require("date-fns");

const path = require("path");
const { sliceTitle, getFlags } = require("./public/utils/mangaSL");
const { da } = require("date-fns/locale");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// GET Method & Render Landing Page
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`https://api.mangadex.dev/manga`);
    const allData = response.data.data;
    let manga = [];

    for (const resdata of allData) {
      const desc = resdata.attributes.description.en.replace(/\n/g, " ");
      const slicedTitle = sliceTitle(resdata.attributes.title.en, 13);
      const mangaID = resdata.id;
      const mangaRelationships = resdata.relationships;
      let URIPoster;

      try {
        for (const typeID of mangaRelationships) {
          if (typeID.type === "cover_art") {
            const cover = await axios.get(
              `https://api.mangadex.org/cover/${typeID.id}`
            );
            const getDataCover = cover.data.data;
            const getRLCover = cover.data.data.relationships;

            for (const rl of getRLCover) {
              if (rl.type === "manga") {
                URIPoster = `https://uploads.mangadex.org/covers/${rl.id}/${getDataCover.attributes.fileName}`;
              }
            }
          }
        }
      } catch (err) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
      }

      try {
        const resmanga = await axios.get(
          `https://api.mangadex.org/manga/${mangaID}/feed`
        );
        const getData = resmanga.data.data;
        let returnted = null;

        for (const datamanga of getData) {
          if (
            returnted === null ||
            parseFloat(datamanga.attributes.chapter) > parseFloat(returnted)
          ) {
            returnted = datamanga.attributes.chapter;
          }
        }

        manga.push({
          title: resdata.attributes.title.en,
          titleName: slicedTitle,
          desk: desc,
          type: resdata.type,
          dataTM: returnted,
          poster: URIPoster,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
      }
    }

    res.render("landing", {
      manga,
      header:
        '<i class="fa-solid fa-fire" style="color: #db321f;"></i> Hot Komik Update',
    });
  } catch (error) {
    console.log("Error fetching manga:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching manga data" });
  }
});

app.get("/manga/search", async (req, res) => {
  const title = req.query.title;

  try {
    const response = await axios.get(
      `https://api.mangadex.org/manga?title=${title}`
    );
    const allData = response.data.data;
    let manga = [];

    for (const resdata of allData) {
      const desc = resdata.attributes.description.en.replace(/\n/g, " ");
      const slicedTitle = sliceTitle(resdata.attributes.title.en, 13);
      const mangaID = resdata.id;
      const mangaRelationships = resdata.relationships;
      let URIPoster;

      try {
        for (const typeID of mangaRelationships) {
          if (typeID.type === "cover_art") {
            const cover = await axios.get(
              `https://api.mangadex.org/cover/${typeID.id}`
            );
            const getDataCover = cover.data.data;
            const getRLCover = cover.data.data.relationships;

            for (const rl of getRLCover) {
              if (rl.type === "manga") {
                URIPoster = `https://uploads.mangadex.org/covers/${rl.id}/${getDataCover.attributes.fileName}`;
              }
            }
          }
        }
      } catch (err) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
      }

      try {
        const resmanga = await axios.get(
          `https://api.mangadex.org/manga/${mangaID}/feed`
        );
        const getData = resmanga.data.data;
        let returnted = null;

        for (const datamanga of getData) {
          if (
            returnted === null ||
            parseFloat(datamanga.attributes.chapter) > parseFloat(returnted)
          ) {
            returnted = datamanga.attributes.chapter;
          }
        }

        manga.push({
          title: resdata.attributes.title.en,
          titleName: slicedTitle,
          desk: desc,
          type: resdata.type,
          dataTM: returnted,
          poster: URIPoster,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
      }
    }

    res.render("landing", {
      manga,
      header:
        '<i class="fa-solid fa-magnifying-glass" style="color: #2c66c9;"></i> Hasil Pencarian dari <p style="color: #2c66c9;">' +
        title +
        "</p>",
    });
  } catch (error) {
    console.log("Error fetching manga:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching manga data" });
  }
});

// app.get("/tes", async (req, res) => {

// });

app.get("/manga/detail", async (req, res) => {
  const title = req.query.title;

  try {
    const response = await axios.get(
      `https://api.mangadex.org/manga?title=${title}`
    );
    const allData = response.data.data[0];
    const desc = allData.attributes.description.en.replace(/\n/g, " ");
    let manga = [];
    const mangaID = allData.id;
    const mangaRelationships = allData.relationships;
    const mangaGenre = allData.attributes.tags;
    let URIPoster;
    let genreListed = [];
    let chapterList = [];

    

    mangaGenre.forEach((genre) => genreListed.push(genre.attributes.name.en));
    try {
      for (const typeID of mangaRelationships) {
        if (typeID.type === "cover_art") {
          const cover = await axios.get(
            `https://api.mangadex.org/cover/${typeID.id}`
          );
          const getDataCover = cover.data.data;
          const getRLCover = cover.data.data.relationships;

          for (const rl of getRLCover) {
            if (rl.type === "manga") {
              URIPoster = `https://uploads.mangadex.org/covers/${rl.id}/${getDataCover.attributes.fileName}`;
            }
          }
        }
      }
    } catch (err) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }

    try {
      let chapterList = [];
      const getResponse = await axios.get(
        `https://api.mangadex.org/manga/${mangaID}/feed`
      );
      const allCData = getResponse.data.data;

      for (const dat of allCData) {
        const chapterNumber = dat.attributes.chapter;
        const chapterRelease = dat.attributes.publishAt;
        const chapterFlags = getFlags(dat.attributes.translatedLanguage);
        const relativeTime = formatDistanceToNow(parseISO(chapterRelease), {
          addSuffix: true,
        });

        const groupID = dat.relationships
          .filter((rel) => rel.type === "scanlation_group")
          .map((rel) => rel.id);
        const groups = await Promise.all(
          groupID.map(async (groupIds) => {
            const groupResponse = await axios.get(
              `https://api.mangadex.org/group/${groupIds}`
            );
            const groupData = groupResponse.data.data;
            return groupData.attributes.name;
          })
        );

        chapterList.push({
          chapterID: dat.id,
          chapter: chapterNumber,
          time: relativeTime,
          translate: chapterFlags,
          group: groups,
        });
      }

      chapterList.sort((a, b) => a.chapter - b.chapter);
      manga.push({
        title: allData.attributes.title.en,
        desk: desc,
        poster: URIPoster,
        genre: genreListed,
        year: allData.attributes.year,
        status: allData.attributes.status.toUpperCase(),
        chapterInfo: chapterList
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }

    
    res.render("detail", { manga });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/manga/next/:chapter/:title", async (req, res) => {
  const title = req.params.title;
  const chapter = req.params.chapter;
  console.log(req.params.tl);

  try{
    const response = await axios.get(`https://api.mangadex.org/manga?title=${title}`);
    const responseData = response.data.data[0];
    const mangaID = responseData.id;

    try {
      const feedResponse = await axios.get(`https://api.mangadex.org/manga/${mangaID}/feed`);
      const data = feedResponse.data.data;

      const dataFiltered = data.filter(is => is.attributes.chapter === chapter);
      if(dataFiltered.length === 0 || dataFiltered === undefined) res.redirect("/")
      else res.redirect(`/manga/read/${dataFiltered[0].id}/${parseFloat(dataFiltered[0].attributes.chapter) + 1}/${title}`);
    } catch (error){
    console.log(error);
        res.status(500).json({ error: "An error occurred" });
  }
  } catch (error){
    console.log(error);
        res.status(500).json({ error: "An error occurred" });
  }
})

app.get("/manga/prev/:chapter/:title", async (req, res) => {
  const title = req.params.title;
  const chapter = req.params.chapter;

  try{
    const response = await axios.get(`https://api.mangadex.org/manga?title=${title}`);
    const responseData = response.data.data[0];
    const mangaID = responseData.id;

    try {
      const feedResponse = await axios.get(`https://api.mangadex.org/manga/${mangaID}/feed`);
      const data = feedResponse.data.data;

      const dataFiltered = data.filter(is => is.attributes.chapter === chapter);
      if(dataFiltered.length === 0 || dataFiltered === undefined) res.redirect("/")
        else res.redirect(`/manga/read/${dataFiltered[0].id}/${parseFloat(dataFiltered[0].attributes.chapter) - 1}/${title}`);
    } catch (error){
    console.log(error);
        res.status(500).json({ error: "An error occurred" });
  }
  } catch (error){
    console.log(error);
        res.status(500).json({ error: "An error occurred" });
  }
})


app.get("/manga/read/:id/:chapter/:title", async (req, res) => {
  const chapterID = req.params.id;
  let manga = [];
  
  try{
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterID}`);
    const imageData = response.data.chapter.data;
    const baseURL = response.data.baseUrl;
    const hash = response.data.chapter.hash;
    
    try {
      const responses = await axios.get(
        `https://api.mangadex.org/manga?title=${req.params.title}`
      );
      const allData = responses.data.data[0];
      const mangaID = allData.id;
      const mangaRelationships = allData.relationships;

      try {
        const resmanga = await axios.get(
          `https://api.mangadex.org/manga/${mangaID}/feed`
        );
        const getData = resmanga.data.data;
        let returnted = req.params.chapter;
        let next = false;
        let previous = false;
  
        for (const datamanga of getData) {
          if (parseFloat(datamanga.attributes.chapter) > parseFloat(returnted)) {
            next = true;
          } else {
            next = false;
          }

          
        }
        
        for (const datamanga of getData) {
        if (parseFloat(datamanga.attributes.chapter) < parseFloat(returnted)) {
          previous = true;
          break;
        }
      }
  
         manga = {
          imageData,
          baseURL,
          hash,
          title: req.params.title,
          chapter: req.params.chapter,
          next,
          previous
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
      }
    } catch (error){
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }

    res.render("read", manga);
  } catch (error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
})

app.get("/admin/dashboard/:user", (req, res) => {
  res.render("dashboard");
});

// 404: Page Not Found Handler
app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404 Page Not Found</h1>");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
