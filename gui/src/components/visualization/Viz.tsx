import React, { Component } from "react";
import { Button } from "../styling/styling";
import styled from "styled-components";
import Serial, {
  _32BitToFloat,
  FloatTo32Bit,
  _32BitToInt,
  IntTo32Bit,
} from "../../modules/serial";
import {
  parse_log_message,
  save_log,
  get_fields,
  get_log,
  clear_log,
} from "../../modules/log";
import Line from "./Line";
import ToggleSwitch from "../ToggleSwitch";
import ProgressBar from "../ProgressBar";
import Faults from "../Faults";
import { getFaultFlag, clearFaults } from "../../modules/faults";
import favourites, { Favourite } from "./favourites";

type Frequency = "High" | "Low";

type VizProps = {
  sp: Serial | null;
  toggle: (state: boolean) => void;
};

type VizState = {
  log: string[];
  fields: string[];
  selectedLog: string | null;
  frequency: Frequency;
  liveLogging: boolean;
  downloading: boolean;
  savingLog: boolean;
  step: number;
  maxSteps: number;
  favourites: Favourite[];
};

export default class DataViz extends Component<VizProps, VizState> {
  count: number;

  constructor(props: VizProps) {
    super(props);
    this.state = {
      log: [],
      fields: [],
      selectedLog: null,
      frequency: "High",
      liveLogging: false,
      downloading: false,
      savingLog: false,
      step: 0,
      maxSteps: 0,
      favourites: favourites,
    };
  }

  componentDidMount() {
    const fields = get_fields();
    const selectedLog = fields.length > 0 ? fields[0] : null;
    const log = get_log(selectedLog);
    this.setState({ fields, selectedLog, log });
  }

  componentWillUnmount() {
    const { sp } = this.props;
    sp && sp.detachListener(this.dataHandler);
  }

  dataHandler = (data: string | Buffer) => {
    if (data.includes("LOG_END")) {
      this.props.toggle(false);
      this.setState({ downloading: false });
      const fields = get_fields();
      this.setState({ fields, step: this.state.maxSteps });
      setTimeout(() => this.setState({ step: 0 }), 5000);
    } else if (data.includes("LL_END")) {
      const fields = get_fields();
      const log = get_log(this.state.selectedLog);
      this.setState({ fields, log });
    } else if (data.includes("LEN_")) {
      const length = +data.slice(4, 9);
      this.count = 0;
      this.setState({ maxSteps: length, step: 0 });
    } else {
      if (this.state.downloading) {
        this.count = this.count + 1;
        this.count % 50 === 0 && this.setState({ step: this.count });
      }
      parse_log_message(data);
    }
  };

  liveLog = (frequency: Frequency) => {
    const { sp, toggle } = this.props;
    const { liveLogging } = this.state;
    this.setState({ frequency });
    if (liveLogging) {
      toggle(false);
      sp && sp.detachListener(this.dataHandler);
      sp && sp.write([0x10, 0, 0, 0, 0, 0, 0]);
      this.setState({ liveLogging: false });
    } else {
      toggle(true);
      clear_log();
      sp && sp.attachListener(this.dataHandler);
      if (frequency === "High") {
        sp && sp.write([0x1f, 0, 0, 0, 0, 0, 0]);
      } else {
        sp && sp.write([0x1e, 0, 0, 0, 0, 0, 0]);
      }
      this.setState({ liveLogging: true });
    }
  };

  downloadLog = () => {
    const { sp, toggle } = this.props;
    const { downloading } = this.state;
    if (downloading) {
      toggle(false);
      sp && sp.detachListener(this.dataHandler);
      this.setState({ downloading: false, step: 0 });
    } else {
      toggle(true);
      clear_log();
      sp && sp.attachListener(this.dataHandler);
      sp && sp.write([0x1d, 0, 0, 0, 0, 0, 0]);
      this.setState({ downloading: true });
    }
  };

  selectLog = (log: string) => {
    this.setState({ selectedLog: log, log: get_log(log) });
  };

  clearLog = () => {
    clearFaults();
    this.setState({ fields: [], selectedLog: null, log: [] }, clear_log);
  };

  saveLog = async () => {
    const timeout_id = setTimeout(
      () => this.setState({ savingLog: true }),
      250,
    );
    await save_log();
    clearTimeout(timeout_id);
    setTimeout(() => this.setState({ savingLog: false }), 1000);
  };

  render() {
    const {
      log,
      fields,
      liveLogging,
      downloading,
      savingLog,
      selectedLog,
      maxSteps,
      step, // step was for the progress bar (i believe) which is now deleted
      favourites,
    } = this.state;
    const { sp } = this.props;
    return (
      <>
        <Container>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              margin: "0 0.5vw",
            }}
          >
            <span
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Header>Data Visualization</Header>
              <Button
                disabled={fields.length === 0}
                height="100%"
                onClick={this.clearLog}
              >
                Clear Data
              </Button>
            </span>
            <TabSelect
              tabs={fields}
              onSelect={this.selectLog}
              selected={selectedLog}
            />
          </div>
          {selectedLog === "faults" ? (
            <Faults />
          ) : log.length > 0 ? (
            <Line data={log} />
          ) : (
            <span
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "steelblue",
                fontSize: "48px",
              }}
            >
              {savingLog
                ? "Saving Log..."
                : fields.length == 0
                ? "No Data"
                : "Select Field to View"}
            </span>
          )}
        </Container>
        <Footer>
          <Button onClick={this.saveLog} disabled={downloading || savingLog}>
            Save Log
          </Button>
          <Button
            onClick={() => this.liveLog("Low")}
            disabled={!(sp && sp.isOpen()) || downloading || savingLog}
            style={{ justifySelf: "start", marginRight: "5px" }}
          >
            {`${liveLogging ? "Cancel" : "Low Frequency"} Live Log`}
          </Button>
          <Button
            onClick={() => this.liveLog("High")}
            disabled={!(sp && sp.isOpen()) || downloading || savingLog}
            style={{ justifySelf: "start" }}
          >
            {`${liveLogging ? "Cancel" : "High Frequency"} Live Log`}
          </Button>
          {/* <ProgressBar  ={ } max={maxSteps} enable={  > 100} /> */}
          <Button
            onClick={this.downloadLog}
            disabled={!(sp && sp.isOpen()) || liveLogging || savingLog}
            style={{ justifySelf: "start", marginRight: "5px" }}
          >
            {`${downloading ? "Cancel Download" : "Download Data Log"}`}
          </Button>
          {process.env.NODE_ENV === "development" && (
            <Button onClick={() => sp && sp._emit(new Buffer(returnArray()))}>
              TEST EMIT
            </Button>
          )}
        </Footer>
        <Menu>
          <MenuContainer>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "2%",
              }}
            >
              <Header>Favourites</Header>
            </div>
            <FavouritesContainer>
              {/* probably need a system here where we have all parameters, and a preset min
                and max value for them. Then, we can compare the reading to its min and max
              to determine its background colour */}
              {favourites.map(({ name, value, color }, index) => (
                <FavouriteCard key={index} backgroundColor={color}>
                  <p style={{ margin: 0, fontWeight: 500 }}>{name}</p>
                  <div style={{ alignSelf: "center" }}>
                    <p style={{ margin: 0, fontSize: "30px", fontWeight: 500 }}>
                      {value}
                    </p>
                  </div>
                </FavouriteCard>
              ))}
            </FavouritesContainer>
          </MenuContainer>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button>Add New Favourite</Button>
          </div>
        </Menu>
      </>
    );
  }
}

function returnArray() {
  const length_outer = 500;
  const length_inner = 19;
  const arr = [];
  for (var i = 0; i < length_outer; i++) {
    arr.push(0x11);
    for (var j = 0; j < length_inner; j++) {
      //var f = Math.floor(Math.random() * (1000 - 100)) / 100
      var f = 4848;
      var f_arr = IntTo32Bit(f);
      arr.push(f_arr[3]);
      arr.push(f_arr[2]);
      arr.push(f_arr[1]);
      arr.push(f_arr[0]);
    }
    arr.push(...[0x21, 0x21, 0x21, 0x21]);
  }
  arr.push(...[0x4c, 0x4c, 0x5f, 0x45, 0x4e, 0x44, 0x21, 0x21, 0x21, 0x21]);
  return arr;
}

function TabSelect({
  onSelect,
  tabs,
  selected,
}: {
  onSelect: (tab: string) => void;
  tabs: string[];
  selected: string | null;
}) {
  return (
    <StyledTabs>
      {tabs &&
        tabs.map((t, i) => {
          return (
            <Tab onClick={() => onSelect(t)} selected={t === selected} key={i}>
              {t}
            </Tab>
          );
        })}
      {getFaultFlag() && (
        <Tab
          style={{ color: `${getFaultFlag() ? "#B00020" : "#46b477"}` }}
          onClick={() => onSelect("faults")}
          selected={"faults" === selected}
          key={"faults"}
        >
          faults
        </Tab>
      )}
    </StyledTabs>
  );
}

const FavouritesContainer = styled.div`
  display: grid;
  grid-auto-rows: max-content;
  row-gap: 2vh;
  padding: 1% 2%;
  overflow-y: scroll;
`;

const FavouriteCard = styled.div<{ backgroundColor?: string }>`
  display: flex;
  flex-direction: column;
  padding: 2% 4% 4% 4%;
  border 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: ${({ backgroundColor }) => backgroundColor || "white"}
`;

const Menu = styled.div`
  grid-area: menu;
  display: grid;
  background-color: #e4e4e4;
  grid-template-rows: 9fr 1fr;
`;

const MenuContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr 8fr;
  padding: 0.5vw 0.5vw 0 0.5vw;
  overflow-y: scroll;
`

const StyledTabs = styled.span`
  & > * {
    margin-right: 17.5px;
  }
`;

const Tab = styled.h4<{ selected?: boolean }>`
  display: inline-block;
  margin-top: 7px;
  margin-bottom: 7px;
  color: ${({ selected }) => (selected ? "#4b90ca" : "white")};
  cursor: pointer;
  text-decoration: ${({ selected }) => (selected ? "underline" : "")};
  &:hover {
    text-decoration: underline;
    cursor: ${({ selected }) => (selected ? "default" : "pointer")};
  }
`;

const Header = styled.h2`
  margin: 0;
  color: #000000;
  cursor: default;
`;

const Footer = styled.div`
  grid-area: footer;
  display: flex;
  padding: 0 2%;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  background-color: #e4e4e4;
`;

const Container = styled.div`
  padding: 1%;
  display: grid;
  grid-template-rows: 1fr 9fr;
  overflow: hidden;
  background-color: #ffffff;
`;
