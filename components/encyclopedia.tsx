import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";

import Grid from "@mui/material/Grid2";
import { useContext, useState } from "react";
import { CardContext, ICardDetails, ICombos } from "./card-context";
import GameCard from "./game-card";
import CardDetail from "./card-detail";
import Stack from "@mui/material/Stack";

const CustomToolbar = (props: { filename: string; text: string }) => {
  return (
    <GridToolbarContainer sx={{ width: "100%" }}>
      <Stack sx={{ width: "100%" }}>
        <div>
          <GridToolbarExport
            csvOptions={{ fileName: props.filename, allColumns: true }}
          />
        </div>
        <h2 style={{ textAlign: "center", width: "100%" }}>{props.text}</h2>
      </Stack>
    </GridToolbarContainer>
  );
};

const CardsGrid = (props: {
  setCard: (arg0: string) => void;
  cards: ICardDetails[];
}) => {
  const columns: GridColDef[] = [
    {
      field: "card",
      headerName: "Card",
      minWidth: 160,
      renderCell: (value) => {
        return (
          <div style={{ padding: "5px", lineHeight: "normal" }}>
            <GameCard
              card={value.row.card}
              showDetails={true}
              onClick={() => props.setCard(value.row.card)}
            />
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "rarity",
      display: "flex",
      headerName: "Rarity",
    },
    {
      field: "is_basic",
      display: "flex",
      headerName: "Basic",
    },
    {
      field: "is_mergeresult",
      display: "flex",
      headerName: "Combo-Result",
    },
    {
      field: "base_attack",
      display: "flex",
      headerName: "Base Attack",
    },
    {
      field: "base_defense",
      display: "flex",
      headerName: "Base Defense",
    },
  ];
  const cards = props.cards as unknown as GridRowsProp;
  return (
    <DataGrid
      pageSizeOptions={[10, 25, 100]}
      hideFooterSelectedRowCount
      getRowHeight={() => "auto"}
      rows={cards}
      columns={columns}
      slots={{
        toolbar: () => (
          <CustomToolbar text={"List of Cards"} filename={"cards"} />
        ),
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            // Hide columns status and traderName, the other columns will remain visible
            rarity: false,
            is_basic: false,
            is_mergeresult: false,
            base_attack: false,
            base_defense: false,
          },
        },
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: {
          sortModel: [{ field: "card", sort: "asc" }],
        },
      }}
    />
  );
};

const ComboGrid = (props: {
  setCard: (arg0: string) => void;
  combos: ICombos[];
}) => {
  const columns: GridColDef[] = [
    {
      field: "card1",
      headerName: "Card 1",
      minWidth: 160,
      renderCell: (value) => {
        return (
          <div style={{ padding: "5px", lineHeight: "normal", width: "100%" }}>
            <GameCard
              card={value.row.card1}
              showDetails={false}
              onClick={() => props.setCard(value.row.card1)}
            />
          </div>
        );
      },
      flex: 1,
      display: "flex",
    },
    {
      field: "card2",
      headerName: "Card 2",
      minWidth: 160,
      renderCell: (value) => {
        return (
          <div style={{ padding: "5px", lineHeight: "normal", width: "100%" }}>
            <GameCard
              card={value.row.card2}
              showDetails={false}
              onClick={() => props.setCard(value.row.card2)}
            />
          </div>
        );
      },
      flex: 1,
      display: "flex",
    },
    {
      field: "result",
      headerName: "Result",
      minWidth: 160,
      renderCell: (value) => {
        return (
          <div style={{ padding: "5px", lineHeight: "normal" }}>
            <GameCard
              card={value.row.result}
              showDetails={true}
              onClick={() => props.setCard(value.row.result)}
            />
          </div>
        );
      },
      flex: 1,
    },
  ];
  const combos: GridRowsProp = props.combos;
  return (
    <DataGrid
      pageSizeOptions={[10, 25, 100]}
      hideFooterSelectedRowCount
      getRowHeight={() => "auto"}
      rows={combos}
      columns={columns}
      slots={{
        toolbar: () => (
          <CustomToolbar text={"List of Combos"} filename={"combos"} />
        ),
      }}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: {
          sortModel: [{ field: "result", sort: "asc" }],
        },
      }}
    />
  );
};

const Encyclopedia = () => {
  const [detail, setDetail] = useState("");
  const cardCtx = useContext(CardContext);
  if (!cardCtx) {
    return null;
  }

  const { cards, combos } = cardCtx;
  return (
    <>
      <CardDetail combos={combos} card={detail} setCard={setDetail} />
      <Grid container rowSpacing={2} columnSpacing={10}>
        <Grid size={4}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <CardsGrid cards={cards} setCard={setDetail} />
          </div>
        </Grid>
        <Grid size={8}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ComboGrid combos={combos} setCard={setDetail} />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default Encyclopedia;