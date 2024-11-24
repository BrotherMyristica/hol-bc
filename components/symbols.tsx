import Avatar from "@mui/material/Avatar";
import LinkIcon from "@mui/icons-material/Link";
import Tooltip from "@mui/material/Tooltip";

export const BasicSymbol = ({ show }: { show: boolean }) => {
  const tooltip = show
    ? "This is a basic card. It can be combined with other basic cards."
    : "This is a final card. It cannot be combined with other cards.";
  return (
    <Tooltip title={tooltip}>
      <Avatar
        sx={{
          bgcolor: "black",
          width: "1em",
          height: "1em",
          fontSize: "inherit",
          opacity: show ? "100%" : "10%",
        }}
        variant="rounded"
      >
        <b>B</b>
      </Avatar>
    </Tooltip>
  );
};

export const LinkSymbol = ({ show }: { show: boolean }) => {
  const tooltip = show
    ? "This card can be created by combining two basic cards."
    : "This card cannot be created by combining other cards.";
  return (
    <Tooltip title={tooltip}>
      <Avatar
        sx={{
          bgcolor: "black",
          width: "1em",
          height: "1em",
          fontSize: "inherit",
          opacity: show ? "100%" : "10%",
        }}
        variant="rounded"
      >
        <LinkIcon
          sx={{
            transform: "rotate(-45deg)",
            fontSize: "1em",
          }}
        />
      </Avatar>
    </Tooltip>
  );
};
