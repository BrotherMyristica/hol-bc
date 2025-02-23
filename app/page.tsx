"use client";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState, useEffect, Suspense } from "react";
import Preferences from "@/components/preferences";
import CardCollection from "@/components/collection";
import CoreSuggestions from "@/components/core-suggestions";
import DeckBuilder from "@/components/deck-builder";
import DeckSummary from "@/components/deck-summary";
import CardProvider from "@/components/card-context";
import Encyclopedia from "@/components/encyclopedia";
import Button from "@mui/material/Button";
import { clearSetting, exportAsLink, importFromLink } from "@/engine/storage";
import { useRouter, useSearchParams } from "next/navigation";
import Opponents from "@/components/opponents";
import GameMechanics from "@/components/game-mechanics";

const ImportButton = (props: {
  importDeck: (arg0: string) => void;
  disableAutoImport: boolean;
  setDisableAutoImport: (_: boolean) => void;
}) => {
  const deckFromUrl = useSearchParams().get("deck");
  const importFunction = props.importDeck;
  const { disableAutoImport, setDisableAutoImport } = props;
  useEffect(() => {
    if (deckFromUrl && !disableAutoImport) {
      importFunction(deckFromUrl);
      setDisableAutoImport(true);
    }
  }, [deckFromUrl, importFunction, disableAutoImport, setDisableAutoImport]);
  return (
    <Button
      color="inherit"
      onClick={() => deckFromUrl && importFunction(deckFromUrl)}
      disabled={deckFromUrl === null}
    >
      Import Deck
    </Button>
  );
};

const Home = () => {
  const [page, setPage] = useState("collection");
  const [disableAutoImport, setDisableAutoImport] = useState(false);
  const [db, setDb] = useState<null | Worker>(null);
  const router = useRouter();
  //const [error, setError] = useState<null | string>(null);

  const initDb = async () => {
    const baseDb = await fetch("/base.sqlite").then((res) => res.arrayBuffer());
    const worker = new Worker("/worker.sql-wasm.js");
    worker.onerror = (e: ErrorEvent) => {
      console.log(e); // eslint-disable-line no-console
      //setError(e.message);
    };
    worker.onmessage = (event) => {
      if (event.data.id === "open") {
        setDb(worker);
      }
    };
    worker.postMessage({
      id: "open",
      action: "open",
      buffer: new Uint8Array(baseDb),
    });
  };

  useEffect(() => {
    initDb();
  }, []);

  const clearSavedData = () => {
    if (
      confirm("Do you really want to clear your preferences/collection/deck?")
    ) {
      clearSetting();
      window.location.href = "/";
    }
  };

  const getPermalink = () => {
    const link = exportAsLink();
    setDisableAutoImport(true);
    router.replace(link, { scroll: false });
  };

  const importDeck = (deck: string) => {
    if (
      confirm(
        "Importing the deck will overwrite your preferences/collection/deck. Continue?"
      )
    ) {
      importFromLink(deck);
      window.location.href = "/";
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setPage(newValue);
  };
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
            HoL: BC
          </Typography>
          <Suspense>
            <ImportButton
              importDeck={importDeck}
              disableAutoImport={disableAutoImport}
              setDisableAutoImport={setDisableAutoImport}
            />
          </Suspense>
          <Button color="inherit" onClick={() => getPermalink()}>
            Get Link
          </Button>
          <Button color="inherit" onClick={() => clearSavedData()}>
            Clear saved Data
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false}>
        {db && (
          <CardProvider db={db}>
            <TabContext value={page}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Card Encyclopedia" value="cards" />
                  <Tab label="Game Mechanics" value="mechanics" />
                  <Tab label="Opponents" value="opponents" />
                  <Tab label="Preferences" value="preferences" />
                  <Tab label="Card Collection" value="collection" />
                  <Tab
                    label="Core Cards Suggestions"
                    value="core_suggestions"
                  />
                  <Tab label="Deck Builder" value="deck_builder" />
                  <Tab label="Deck Summary" value="deck_summary" />
                </TabList>
              </Box>
              <TabPanel value="cards">
                <Encyclopedia />
              </TabPanel>
              <TabPanel value="mechanics">
                <GameMechanics />
              </TabPanel>
              <TabPanel value="opponents">
                <Opponents />
              </TabPanel>
              <TabPanel value="preferences">
                <Preferences active={page === "preferences"} db={db} />
              </TabPanel>
              <TabPanel value="collection">
                <CardCollection active={page === "collection"} db={db} />
              </TabPanel>
              <TabPanel value="core_suggestions">
                <CoreSuggestions
                  active={page === "core_suggestions"}
                  db={db}
                  goToDeckBuilder={() => setPage("deck_builder")}
                />
              </TabPanel>
              <TabPanel value="deck_builder">
                <DeckBuilder active={page === "deck_builder"} db={db} />
              </TabPanel>
              <TabPanel value="deck_summary">
                <DeckSummary active={page === "deck_summary"} db={db} />
              </TabPanel>
            </TabContext>
          </CardProvider>
        )}
      </Container>
    </>
  );
};

export default Home;
